package ai.sixpm.fold

import android.app.Activity
import android.content.ComponentCallbacks
import android.content.Context
import android.content.pm.ActivityInfo
import android.content.res.Configuration
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import androidx.core.content.ContextCompat
import androidx.core.util.Consumer
import androidx.window.java.layout.WindowInfoTrackerCallbackAdapter
import androidx.window.layout.FoldingFeature
import androidx.window.layout.WindowInfoTracker
import androidx.window.layout.WindowLayoutInfo
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * What a folding Android phone's hinge and screen are doing, for JS, in the shape the iPhone Duo
 * reports: the hinge's status and the fold running across the window (a division), in dp of the
 * window. Jetpack WindowManager says where the fold is and whether the phone is flat or part way
 * open; it says nothing once the phone is shut and the app is on the cover screen, so the hinge's
 * own sensor tells shut from a window that the fold does not cross (split screen), and calls the
 * phone shut as it closes, before Android moves the app to the cover screen or puts it away. A
 * phone without a hinge reports it unknown. Nothing covers the window that the safe area does not
 * already say, so there are no occlusions, and the angle is left out: nothing draws from it.
 * The first report after the app comes back from the background is marked `returning`: the phone
 * may have been shut or opened while the app was away, and that is not the hinge moving now.
 *
 * It also lets a large screen turn. The app is held upright on a phone, a cover screen included;
 * a screen 600 dp or more across at its narrowest (an opened fold, a tablet) follows the way it
 * is held, as Android 16 does by itself.
 */
class FoldModule : Module() {
  private val main = Handler(Looper.getMainLooper())
  private var tracker: FoldTracker? = null

  override fun definition() = ModuleDefinition {
    Name("Fold")

    Events("onFold")

    // Read on the JS thread: the last snapshot the main thread took.
    Function("current") { FoldTracker.latest }

    OnCreate { main.post { attach() } }

    OnActivityEntersForeground { main.post { attach() } }

    OnActivityEntersBackground { main.post { tracker?.pause() } }

    OnStartObserving { main.post { attach() } }

    OnActivityDestroys { main.post { detach() } }

    OnDestroy { main.post { detach() } }
  }

  private fun attach() {
    // Posted to the main thread, this can run after the module has been let go, when asking
    // for the app's context throws.
    val activity = runCatching { appContext.currentActivity }.getOrNull() ?: return
    if (tracker?.activity !== activity) {
      tracker?.detach()
      tracker = FoldTracker(activity) { snapshot -> runCatching { sendEvent("onFold", snapshot) } }
    }
    tracker?.resume()
  }

  private fun detach() {
    tracker?.detach()
    tracker = null
  }
}

/** Follows one activity's window and the hinge sensor; every call is on the main thread. */
internal class FoldTracker(
    val activity: Activity,
    private val onChange: (Map<String, Any?>) -> Unit,
) {
  private val adapter = WindowInfoTrackerCallbackAdapter(WindowInfoTracker.getOrCreate(activity))
  private val sensors = activity.getSystemService(Context.SENSOR_SERVICE) as? SensorManager
  private val hingeSensor: Sensor? =
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        sensors?.getDefaultSensor(Sensor.TYPE_HINGE_ANGLE)
      } else {
        null
      }
  private var fold: FoldingFeature? = null
  private var degrees: Float? = null
  private var listening = false
  private var last: Map<String, Any?>? = null
  // The next report is the first since the app came back: where the hinge is, not a move of it.
  private var returning = false

  private val onLayout =
      Consumer<WindowLayoutInfo> { info ->
        fold = info.displayFeatures.filterIsInstance<FoldingFeature>().firstOrNull()
        letLargeScreensTurn()
        report()
      }

  private val onHinge =
      object : SensorEventListener {
        override fun onSensorChanged(event: SensorEvent) {
          degrees = event.values.firstOrNull()
          report()
        }

        override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) = Unit
      }

  // A new screen size or density changes what the same fold measures in dp, and whether the
  // screen is a large one, without the window's layout being reported again.
  private val onConfiguration =
      object : ComponentCallbacks {
        override fun onConfigurationChanged(newConfig: Configuration) {
          letLargeScreensTurn()
          report()
        }

        @Deprecated("Deprecated in Java") override fun onLowMemory() = Unit
      }

  fun resume() {
    if (listening) return
    listening = true
    returning = true
    letLargeScreensTurn()
    activity.registerComponentCallbacks(onConfiguration)
    adapter.addWindowLayoutInfoListener(activity, ContextCompat.getMainExecutor(activity), onLayout)
    hingeSensor?.let { sensors?.registerListener(onHinge, it, SensorManager.SENSOR_DELAY_NORMAL) }
  }

  /** In the background nothing is laid out, and the sensor is left alone. */
  fun pause() {
    if (!listening) return
    listening = false
    activity.unregisterComponentCallbacks(onConfiguration)
    adapter.removeWindowLayoutInfoListener(onLayout)
    if (hingeSensor != null) sensors?.unregisterListener(onHinge)
    // Whatever the hinge does while the app is away is read afresh on the way back.
    degrees = null
    fold = null
  }

  fun detach() = pause()

  private fun letLargeScreensTurn() {
    val large = activity.resources.configuration.smallestScreenWidthDp >= LARGE_SCREEN_DP
    val wanted =
        if (large) ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
        else ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
    if (activity.requestedOrientation != wanted) activity.requestedOrientation = wanted
  }

  private fun hinge(): String {
    val angle = degrees
    // Nearly shut: the cover screen is about to take over, or already has.
    if (angle != null && angle < SHUT_BELOW) return "closed"
    val crossing = fold
    if (crossing != null) {
      return if (crossing.state == FoldingFeature.State.HALF_OPENED) "partial" else "open"
    }
    // No fold in the window: on the cover screen, or in a window beside the fold. Until the
    // sensor has spoken, a phone with a hinge is taken to be shut.
    return when {
      angle == null -> if (hingeSensor != null) "closed" else "unknown"
      angle < FLAT_FROM -> "partial"
      else -> "open"
    }
  }

  private fun snapshot(): Map<String, Any?> {
    val density = activity.resources.displayMetrics.density
    val divisions =
        fold?.let {
          val b = it.bounds
          listOf(
              mapOf(
                  "x" to (b.left / density).toDouble(),
                  "y" to (b.top / density).toDouble(),
                  "width" to (b.width() / density).toDouble(),
                  "height" to (b.height() / density).toDouble(),
              ))
        } ?: emptyList()
    return mapOf(
        "hinge" to hinge(),
        "angle" to null,
        "divisions" to divisions,
        "occlusions" to emptyList<Map<String, Double>>(),
        "returning" to returning,
    )
  }

  /** Sends only what changed: the sensor reports every degree, the layout only its poses. */
  private fun report() {
    val next = snapshot()
    if (next == last) return
    last = next
    latest = next
    returning = false
    onChange(next)
  }

  companion object {
    /** Android's own line between a phone and a large screen. */
    private const val LARGE_SCREEN_DP = 600
    /** Below this the phone counts as shut; a cover screen takes over well before it. */
    private const val SHUT_BELOW = 30f
    /** From here the phone counts as flat. */
    private const val FLAT_FROM = 150f

    @Volatile
    var latest: Map<String, Any?> =
        mapOf(
            "hinge" to "unknown",
            "angle" to null,
            "divisions" to emptyList<Map<String, Double>>(),
            "occlusions" to emptyList<Map<String, Double>>(),
            "returning" to false,
        )
  }
}
