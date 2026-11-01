package ai.sixpm.surfaces.widgets

import ai.sixpm.surfaces.R
import android.app.StatusBarManager
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.graphics.drawable.Icon
import android.os.Build

/**
 * Asks Android to add 6pm's widgets and tiles where the person can say yes in one tap: the
 * launcher's own "Add to Home screen" sheet for a widget, and the system's "Add tile" dialog for
 * a Quick Settings tile (Android 13 and later). Launchers that cannot pin, and older phones for
 * tiles, are left to the guide's steps.
 */
object Pins {
  private fun widget(context: Context, kind: String): ComponentName? =
    when (kind) {
      "safe" -> ComponentName(context, SafeTodayWidget::class.java)
      "today" -> ComponentName(context, TodayListWidget::class.java)
      else -> null
    }

  fun canPinWidgets(context: Context): Boolean =
    AppWidgetManager.getInstance(context).isRequestPinAppWidgetSupported

  /** Shows the launcher's sheet for one widget; false when the launcher would not. */
  fun pinWidget(context: Context, kind: String): Boolean {
    val provider = widget(context, kind) ?: return false
    val manager = AppWidgetManager.getInstance(context)
    if (!manager.isRequestPinAppWidgetSupported) return false
    return manager.requestPinAppWidget(provider, null, null)
  }

  fun canAddTiles(): Boolean = Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU

  /**
   * Shows the system's dialog for one tile and reports what came of it: "added", "already"
   * (it was in Quick Settings before), "no" (the person said no) or "failed".
   */
  fun addTile(context: Context, kind: String, done: (String) -> Unit) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return done("failed")
    val (service, label, icon) =
      when (kind) {
        "scan" -> Triple(ScanTile::class.java, "sixpm_shortcut_scan", R.drawable.sixpm_tile_scan)
        "add" -> Triple(QuickAddTile::class.java, "sixpm_shortcut_quick_add", R.drawable.sixpm_tile_add)
        else -> return done("failed")
      }
    val bar = context.getSystemService(StatusBarManager::class.java) ?: return done("failed")
    bar.requestAddTileService(
      ComponentName(context, service),
      Widgets.string(context, label),
      Icon.createWithResource(context, icon),
      context.mainExecutor,
    ) { result ->
      done(
        when (result) {
          StatusBarManager.TILE_ADD_REQUEST_RESULT_TILE_ADDED -> "added"
          StatusBarManager.TILE_ADD_REQUEST_RESULT_TILE_ALREADY_ADDED -> "already"
          StatusBarManager.TILE_ADD_REQUEST_RESULT_TILE_NOT_ADDED -> "no"
          else -> "failed"
        },
      )
    }
  }
}
