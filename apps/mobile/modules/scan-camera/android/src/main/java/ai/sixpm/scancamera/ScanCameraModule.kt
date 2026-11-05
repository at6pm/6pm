package ai.sixpm.scancamera

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.FileProvider
import expo.modules.kotlin.activityresult.AppContextActivityResultContract
import expo.modules.kotlin.activityresult.AppContextActivityResultLauncher
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.Serializable
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Scan's camera and its reader: a live view that finds QR codes and receipts, the photo a receipt
 * is read from, and a picture picked from the gallery read the same way. It also keeps a spend's
 * photo: a picture from the gallery or the system camera, at its kept size.
 */
class ScanCameraModule : Module() {
  private lateinit var picker: AppContextActivityResultLauncher<PickRequest, Uri?>
  private lateinit var camera: AppContextActivityResultLauncher<CameraRequest, Boolean>
  private var picking = false

  private val context: Context
    get() = appContext.reactContext ?: throw ScanCameraException("context")

  override fun definition() = ModuleDefinition {
    Name("ScanCamera")

    RegisterActivityContracts {
      picker = registerForActivityResult(PickImage())
      camera = registerForActivityResult(TakePhoto())
    }

    /** A picture already on this phone (a `file://` or `content://` URI): a QR code, or a receipt. */
    AsyncFunction("readImage") Coroutine
      { uri: String ->
        val parsed = Uri.parse(uri)
        if (parsed.scheme != "file" && parsed.scheme != "content") throw ScanCameraException("uri")
        withContext(Dispatchers.Default) {
          ReceiptPhoto.readPicked(context, ReceiptPhoto.upright(context, parsed))
        }
      }

    /** A picture picked from the gallery, read: a QR code or a receipt; null when none was picked. */
    AsyncFunction("pickImage") Coroutine
      { ->
        val uri = pickOne()
        if (uri == null) {
          null
        } else {
          withContext(Dispatchers.Default) {
            ReceiptPhoto.readPicked(context, ReceiptPhoto.upright(context, uri))
          }
        }
      }

    /** A picture already on this phone (`from`) kept as a spend's photo at `to`, a `file://` URI. */
    AsyncFunction("keepPhoto") Coroutine
      { from: String, to: String ->
        val source = Uri.parse(from)
        if (source.scheme != "file" && source.scheme != "content") throw ScanCameraException("uri")
        withContext(Dispatchers.Default) { KeptPhoto.keep(context, source, Uri.parse(to)) }
      }

    /** A picture picked from the gallery kept as a spend's photo at `to`; null when none was. */
    AsyncFunction("pickPhoto") Coroutine
      { to: String ->
        val uri = pickOne()
        if (uri == null) {
          null
        } else {
          withContext(Dispatchers.Default) { KeptPhoto.keep(context, uri, Uri.parse(to)) }
        }
      }

    /** Whether this phone has a camera to take a spend's photo with. */
    Function("canTakePhoto") {
      context.packageManager.hasSystemFeature(PackageManager.FEATURE_CAMERA_ANY)
    }

    /**
     * A photo taken with the system camera kept at `to`; null when none was taken. The camera
     * permission Scan asks for is granted first (the app asks before it calls this).
     */
    AsyncFunction("takePhoto") Coroutine
      { to: String ->
        if (picking) throw ScanCameraException("busy")
        picking = true
        val file = KeptPhoto.cameraFile(context)
        val shot =
          try {
            val authority = "${context.packageName}.FileSystemFileProvider"
            val target = FileProvider.getUriForFile(context, authority, file)
            withContext(Dispatchers.Main) { camera.launch(CameraRequest(target.toString())) }
          } finally {
            picking = false
          }
        if (!shot || !file.exists() || file.length() == 0L) {
          file.delete()
          null
        } else {
          withContext(Dispatchers.Default) {
            try {
              KeptPhoto.keep(context, Uri.fromFile(file), Uri.parse(to))
            } finally {
              file.delete()
            }
          }
        }
      }

    /** Makes the kept photos' folder. */
    AsyncFunction("preparePhotoFolder") { uri: String -> KeptPhoto.prepare(Uri.parse(uri)) }

    View(ScanCameraView::class) {
      Events("onCode", "onReceipt", "onRunning")

      Prop("active") { view: ScanCameraView, active: Boolean -> view.active = active }
      Prop("facing") { view: ScanCameraView, facing: String -> view.front = facing == "front" }
      Prop("torch") { view: ScanCameraView, torch: Boolean -> view.torch = torch }
      Prop("receipts") { view: ScanCameraView, receipts: Boolean -> view.receipts = receipts }

      /**
       * Takes the photo and reads the receipt in it. `seen` is where the live view last saw the
       * receipt (`[x0, y0, …, x3, y3]`), used when the photo alone does not show its edges.
       */
      AsyncFunction("capture") Coroutine
        { view: ScanCameraView, seen: List<Double>? ->
          val photo = withContext(Dispatchers.Main) { view.camera.capture() }
          val corners = seen?.let(::corners)
          val context = view.context.applicationContext
          withContext(Dispatchers.Default) {
            val image = ReceiptPhoto.upright(photo.jpeg, photo.rotation, photo.mirrored)
            ReceiptPhoto.read(context, image, corners)
          }
        }

      OnViewDestroys { view: ScanCameraView -> view.release() }
    }
  }

  /** One picture from the system picker, or null when it was closed without one. */
  private suspend fun pickOne(): Uri? {
    if (picking) throw ScanCameraException("busy")
    picking = true
    return try {
      withContext(Dispatchers.Main) { picker.launch(PickRequest()) }
    } finally {
      picking = false
    }
  }

  /** `[x0, y0, …, x3, y3]` from the live view, when it is a whole quad inside the frame. */
  private fun corners(flat: List<Double>): DoubleArray? {
    if (flat.size != 8 || flat.any { !it.isFinite() || it < -0.05 || it > 1.05 }) return null
    return flat.toDoubleArray()
  }
}

/** The system photo picker for one picture: it needs no access to the library. */
internal class PickRequest : Serializable

private class PickImage : AppContextActivityResultContract<PickRequest, Uri?> {
  private val system = ActivityResultContracts.PickVisualMedia()

  override fun createIntent(context: Context, input: PickRequest): Intent =
    system.createIntent(
      context,
      PickVisualMediaRequest.Builder()
        .setMediaType(ActivityResultContracts.PickVisualMedia.ImageOnly)
        .build(),
    )

  override fun parseResult(input: PickRequest, resultCode: Int, intent: Intent?): Uri? =
    system.parseResult(resultCode, intent)
}

/** Where the system camera writes its photo: a `content://` URI the app's file provider shares. */
internal class CameraRequest(val target: String) : Serializable

private class TakePhoto : AppContextActivityResultContract<CameraRequest, Boolean> {
  private val system = ActivityResultContracts.TakePicture()

  override fun createIntent(context: Context, input: CameraRequest): Intent =
    system
      .createIntent(context, Uri.parse(input.target))
      .addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION or Intent.FLAG_GRANT_READ_URI_PERMISSION)

  override fun parseResult(input: CameraRequest, resultCode: Int, intent: Intent?): Boolean =
    system.parseResult(resultCode, intent)
}
