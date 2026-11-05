package ai.sixpm.scancamera

import android.content.Context
import android.graphics.Bitmap
import android.net.Uri
import java.io.ByteArrayOutputStream
import java.io.File

/**
 * The photo a spend keeps: upright, no larger than 1600 px on its long side, a JPEG of about
 * 300 KB. The app's files are left out of Android's own backups (`allowBackup` is off); only 6pm's
 * sealed backup carries it. The same sizes as the iPhone's.
 */
internal object KeptPhoto {
  private const val PIXELS = 1600
  private const val BYTES = 300_000
  /** Tried in turn until the JPEG fits; the last is kept whatever its size. */
  private val qualities = intArrayOf(72, 60, 50, 40, 30)

  /** The picture at `from` (`file://` or `content://`) kept at `to`, a `file://` URI. */
  fun keep(context: Context, from: Uri, to: Uri): Map<String, Any> {
    val upright = ReceiptPhoto.upright(context, from)
    val picture = ReceiptPhoto.scaled(upright, PIXELS)
    try {
      var jpeg = ByteArray(0)
      for (quality in qualities) {
        val out = ByteArrayOutputStream()
        if (!picture.compress(Bitmap.CompressFormat.JPEG, quality, out)) {
          throw ScanCameraException("encode")
        }
        jpeg = out.toByteArray()
        if (jpeg.size <= BYTES) break
      }
      val target = fileOf(to)
      val folder = target.parentFile ?: throw ScanCameraException("uri")
      folder.mkdirs()
      // Written beside it and renamed into place, so a half-written photo is never shown.
      val partial = File(folder, "${target.name}.partial")
      partial.writeBytes(jpeg)
      if (!partial.renameTo(target)) {
        partial.delete()
        throw ScanCameraException("write")
      }
      return mapOf("width" to picture.width, "height" to picture.height, "bytes" to jpeg.size)
    } finally {
      if (picture !== upright) picture.recycle()
      upright.recycle()
    }
  }

  fun prepare(folder: Uri) {
    fileOf(folder).mkdirs()
  }

  /** Where the camera writes its full photo before it is kept: in the caches, one at a time. */
  fun cameraFile(context: Context): File {
    val directory = File(context.cacheDir, "camera")
    directory.mkdirs()
    directory.listFiles()?.forEach { it.delete() }
    return File(directory, "photo.jpg")
  }

  private fun fileOf(uri: Uri): File {
    if (uri.scheme != "file") throw ScanCameraException("uri")
    return File(uri.path ?: throw ScanCameraException("uri"))
  }
}
