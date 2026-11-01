package ai.sixpm.surfaces

import ai.sixpm.surfaces.widgets.Pins
import ai.sixpm.surfaces.widgets.Widgets
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import android.util.Base64
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * The app's side of its background pieces on Android: the capture inbox the bank alert listener
 * fills, the context it reads alerts with, and the last alert it read; the widgets it draws, and
 * the requests to add them and the Quick Settings tiles. The same contract as the iOS module, so
 * the app imports and shows them the same way. Android has no Live Activities, so those calls do
 * nothing.
 */
class SurfacesModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw NoContext()

  override fun definition() = ModuleDefinition {
    Name("Surfaces")

    AsyncFunction("writeSurface") { name: String, json: String ->
      SurfaceFiles.writeSurface(context, name, json)
      // The widgets draw what the app last wrote.
      if (name == "snapshot") Widgets.refresh(context)
    }

    AsyncFunction("writeSurfaceImage") { name: String, pngBase64: String ->
      val png = runCatching { Base64.decode(pngBase64, Base64.DEFAULT) }.getOrNull()
      if (png != null) SurfaceFiles.writeSurfaceImage(context, name, png)
    }

    AsyncFunction("readInbox") { -> SurfaceFiles.readInbox(context) }

    AsyncFunction("removeInbox") { ids: List<String> ->
      SurfaceFiles.removeInbox(context, ids)
      // A payment saved by the app no longer needs its caught notification.
      for (id in ids) CaughtNotice.cancel(context, id)
    }

    AsyncFunction("readStatus") { name: String -> SurfaceFiles.readStatus(context, name) }

    Function("activitiesEnabled") { false }

    AsyncFunction("listActivities") { -> emptyList<Map<String, String>>() }

    AsyncFunction("startActivity") { _: String, _: String, _: String -> null as String? }

    AsyncFunction("updateActivity") { _: String, _: String -> }

    AsyncFunction("endActivity") { _: String, _: String? -> }

    /** Whether this phone can read bank alerts at all: its WebView runs the domain sandbox. */
    Function("alertsSupported") { DomainSandbox.supported() }

    /** Whether the person has turned 6pm on under Notification access. */
    Function("alertAccess") { AlertListener.allowed(context) }

    /** Opens Notification access, at 6pm's own switch where Android allows it. */
    AsyncFunction("openAlertAccess") { openAlertAccess() }

    /** Whether the launcher can pin a widget from inside the app. */
    Function("canPinWidgets") { Pins.canPinWidgets(context) }

    /** Shows the launcher's sheet to add a widget (`safe`, `today`); false when it would not. */
    AsyncFunction("pinWidget") { kind: String -> Pins.pinWidget(context, kind) }

    /** Whether Android can add a Quick Settings tile from inside the app (13 and later). */
    Function("canAddTiles") { Pins.canAddTiles() }

    /** Shows the system's dialog to add a tile (`scan`, `add`), and says what came of it. */
    AsyncFunction("addTile") { kind: String, promise: Promise ->
      Pins.addTile(context, kind) { result -> promise.resolve(result) }
    }
  }

  private fun openAlertAccess() {
    val component = AlertListener.component(context).flattenToString()
    val detail =
      Intent(Settings.ACTION_NOTIFICATION_LISTENER_DETAIL_SETTINGS)
        .putExtra(Settings.EXTRA_NOTIFICATION_LISTENER_COMPONENT_NAME, component)
    val list = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      try {
        open(detail)
        return
      } catch (_: ActivityNotFoundException) {
        // Some phones have no page for one listener: the list has 6pm's switch too.
      }
    }
    open(list)
  }

  private fun open(intent: Intent) {
    val activity = appContext.currentActivity
    if (activity != null) {
      activity.startActivity(intent)
    } else {
      context.startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    }
  }
}

private class NoContext : CodedException("The app is not running")
