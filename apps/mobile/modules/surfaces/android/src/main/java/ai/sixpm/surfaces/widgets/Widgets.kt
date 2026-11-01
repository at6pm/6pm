package ai.sixpm.surfaces.widgets

import ai.sixpm.surfaces.R
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.res.Configuration
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.widget.RemoteViews

/** Safe today: the number, small (with Scan QR) or medium (with Scan QR and Quick add). */
class SafeTodayWidget : AppWidgetProvider() {
  override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
    for (id in ids) Widgets.drawSafe(context, manager, id)
  }

  override fun onAppWidgetOptionsChanged(context: Context, manager: AppWidgetManager, id: Int, options: Bundle) {
    Widgets.drawSafe(context, manager, id)
  }
}

/** Today: what is left, the day against its line, and today's newest spends. */
class TodayListWidget : AppWidgetProvider() {
  override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
    for (id in ids) Widgets.drawList(context, manager, id)
  }

  override fun onAppWidgetOptionsChanged(context: Context, manager: AppWidgetManager, id: Int, options: Bundle) {
    Widgets.drawList(context, manager, id)
  }
}

/**
 * Draws 6pm's widgets from the snapshot the app wrote. They are drawn again whenever the app writes
 * one (`refresh`), and by the system every half hour (the provider's `updatePeriodMillis`), so the
 * sky's colours follow the hour and the number turns over at 04:00 without the app.
 */
object Widgets {
  /** From this width a Safe today widget has room for the medium layout's two tiles. */
  private const val MEDIUM_FROM_DP = 250

  /** Draws every widget again: the app has just written a new snapshot. */
  fun refresh(context: Context) {
    val manager = AppWidgetManager.getInstance(context)
    for (id in manager.getAppWidgetIds(ComponentName(context, SafeTodayWidget::class.java))) {
      drawSafe(context, manager, id)
    }
    for (id in manager.getAppWidgetIds(ComponentName(context, TodayListWidget::class.java))) {
      drawList(context, manager, id)
    }
  }

  fun drawSafe(context: Context, manager: AppWidgetManager, id: Int) {
    val (width, height) = size(manager, id, 160, 160)
    val moment = WidgetMoment.at(context)
    val day = moment.day
    val canvas = canvas(context, width, height)
    val drawings = WidgetDrawings(context, WidgetFaces(context))
    if (day == null) {
      drawings.setUp(canvas, moment, string(context, "sixpm_widget_set_up"))
      manager.updateAppWidget(id, picture(context, canvas, id, moment.text("setUp")))
      return
    }
    val medium = width >= MEDIUM_FROM_DP
    if (medium) drawings.medium(canvas, moment, day) else drawings.small(canvas, moment, day, darkScreen(context))
    val views =
      RemoteViews(context.packageName, if (medium) R.layout.sixpm_widget_safe_medium else R.layout.sixpm_widget_safe_small)
    views.setImageViewBitmap(R.id.sixpm_widget_picture, canvas.bitmap)
    views.setContentDescription(R.id.sixpm_widget_picture, "${day.safeShort} ${moment.text("safeTodayShort")}")
    views.setOnClickPendingIntent(android.R.id.background, open(context, id, null))
    views.setOnClickPendingIntent(R.id.sixpm_widget_scan, open(context, id, "scan"))
    views.setContentDescription(R.id.sixpm_widget_scan, moment.text("scanQr"))
    if (medium) {
      views.setOnClickPendingIntent(R.id.sixpm_widget_add, open(context, id, "quick-add"))
      views.setContentDescription(R.id.sixpm_widget_add, moment.text("quickAdd"))
    }
    manager.updateAppWidget(id, views)
  }

  fun drawList(context: Context, manager: AppWidgetManager, id: Int) {
    val (width, height) = size(manager, id, 320, 320)
    val moment = WidgetMoment.at(context)
    val day = moment.day
    val canvas = canvas(context, width, height)
    val drawings = WidgetDrawings(context, WidgetFaces(context))
    if (day == null) {
      drawings.setUp(canvas, moment, string(context, "sixpm_widget_set_up"))
    } else {
      drawings.list(canvas, moment, day, darkScreen(context))
    }
    manager.updateAppWidget(id, picture(context, canvas, id, day?.safeText ?: moment.text("setUp")))
  }

  private fun picture(context: Context, canvas: WidgetCanvas, id: Int, description: String): RemoteViews =
    RemoteViews(context.packageName, R.layout.sixpm_widget_picture).apply {
      setImageViewBitmap(R.id.sixpm_widget_picture, canvas.bitmap)
      setContentDescription(R.id.sixpm_widget_picture, description)
      setOnClickPendingIntent(android.R.id.background, open(context, id, null))
    }

  /** The widget's size in dp as the launcher lays it out on a phone held upright. */
  private fun size(manager: AppWidgetManager, id: Int, fallbackWidth: Int, fallbackHeight: Int): Pair<Int, Int> {
    val options = manager.getAppWidgetOptions(id)
    val width = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH).takeIf { it > 0 } ?: fallbackWidth
    val height = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT).takeIf { it > 0 } ?: fallbackHeight
    return width to height
  }

  private fun canvas(context: Context, width: Int, height: Int): WidgetCanvas {
    val density = context.resources.displayMetrics.density
    // Android 12 rounds widgets to the launcher's radius; earlier launchers draw them square.
    val radius =
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        context.resources.getDimension(android.R.dimen.system_app_widget_background_radius) / density
      } else {
        22f
      }
    return WidgetCanvas(width.toFloat(), height.toFloat(), density, radius)
  }

  private fun darkScreen(context: Context): Boolean =
    (context.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES

  /** Opens 6pm, at a route of its own link scheme (`scan`, `quick-add`) when given one. */
  fun open(context: Context, id: Int, route: String?): PendingIntent {
    val intent =
      if (route == null) {
        context.packageManager.getLaunchIntentForPackage(context.packageName) ?: Intent()
      } else {
        Intent(Intent.ACTION_VIEW, Uri.parse("${scheme(context)}://$route")).setPackage(context.packageName)
      }
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    val code = id * 4 + when (route) {
      null -> 0
      "scan" -> 1
      else -> 2
    }
    return PendingIntent.getActivity(
      context,
      code,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
  }

  /** The app's link scheme, as `plugins/with-android-widgets` writes it (`sixpm`, `sixpm-dev`). */
  fun scheme(context: Context): String = string(context, "sixpm_link_scheme").ifEmpty { "sixpm" }

  /** An app string resource by name: the widgets' words live with the app's, in every language. */
  fun string(context: Context, name: String): String {
    val res = context.resources.getIdentifier(name, "string", context.packageName)
    return if (res == 0) "" else context.getString(res)
  }
}
