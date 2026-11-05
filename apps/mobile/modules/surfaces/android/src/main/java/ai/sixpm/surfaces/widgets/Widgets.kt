package ai.sixpm.surfaces.widgets

import ai.sixpm.surfaces.R
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.widget.RemoteViews

/** Safe today: the number on its sky (small), or with the jars (medium). Opens Today. */
class SafeTodayWidget : AppWidgetProvider() {
  override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
    for (id in ids) Widgets.drawSafe(context, manager, id)
  }

  override fun onAppWidgetOptionsChanged(context: Context, manager: AppWidgetManager, id: Int, options: Bundle) {
    Widgets.drawSafe(context, manager, id)
  }
}

/** My month: the month as suns. Opens the Diary. Its receiver is the large widget's from before. */
class TodayListWidget : AppWidgetProvider() {
  override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
    for (id in ids) Widgets.drawMonth(context, manager, id)
  }

  override fun onAppWidgetOptionsChanged(context: Context, manager: AppWidgetManager, id: Int, options: Bundle) {
    Widgets.drawMonth(context, manager, id)
  }
}

/** Streak: the evenings closed in a row as strata. Opens the Diary. */
class StreakWidget : AppWidgetProvider() {
  override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
    for (id in ids) Widgets.drawStreak(context, manager, id)
  }
}

/** A jar: the season's jar (else the first with a day) counting down. Opens that jar. */
class JarWidget : AppWidgetProvider() {
  override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
    for (id in ids) Widgets.drawJar(context, manager, id)
  }
}

/**
 * Draws 6pm's widgets from the snapshot the app wrote. They are drawn again whenever the app writes
 * one (`refresh`), and by the system every half hour (the provider's `updatePeriodMillis`), so the
 * stretch of the day and its sky follow the clock without the app.
 */
object Widgets {
  /** From this width a Safe today widget has room for the medium postcard and its jars. */
  private const val MEDIUM_FROM_DP = 250

  private val JAR_TAPS = intArrayOf(R.id.sixpm_widget_jar0, R.id.sixpm_widget_jar1, R.id.sixpm_widget_jar2, R.id.sixpm_widget_jar3)

  /** Draws every widget again: the app has just written a new snapshot. */
  fun refresh(context: Context) {
    val manager = AppWidgetManager.getInstance(context)
    fun each(type: Class<*>, draw: (Context, AppWidgetManager, Int) -> Unit) {
      for (id in manager.getAppWidgetIds(ComponentName(context, type))) draw(context, manager, id)
    }
    each(SafeTodayWidget::class.java, ::drawSafe)
    each(TodayListWidget::class.java, ::drawMonth)
    each(StreakWidget::class.java, ::drawStreak)
    each(JarWidget::class.java, ::drawJar)
  }

  /** Draws the widget with `draw`, or "Open 6pm to set up" before the month is set up. */
  private fun drawn(
    context: Context,
    manager: AppWidgetManager,
    id: Int,
    fallback: Pair<Int, Int>,
    draw: (WidgetCanvas, WidgetMoment, WidgetDrawings) -> RemoteViews?,
  ) {
    val (width, height) = size(manager, id, fallback.first, fallback.second)
    val moment = WidgetMoment.at(context)
    val canvas = canvas(context, width, height)
    val drawings = WidgetDrawings(WidgetFaces(context))
    val views = if (moment.day?.card == null) null else draw(canvas, moment, drawings)
    if (views != null) {
      manager.updateAppWidget(id, views)
      return
    }
    drawings.setUp(canvas, moment, string(context, "sixpm_widget_set_up"))
    manager.updateAppWidget(id, picture(context, canvas, id, moment.text("setUp"), null))
  }

  fun drawSafe(context: Context, manager: AppWidgetManager, id: Int) =
    drawn(context, manager, id, 160 to 160) { canvas, moment, drawings ->
      val day = moment.day ?: return@drawn null
      val card = day.card ?: return@drawn null
      val today = moment.postcards?.todayLink
      if (canvas.width < MEDIUM_FROM_DP) {
        drawings.small(canvas, moment, day, card)
        return@drawn picture(context, canvas, id, "${day.safeShort} ${card.subShort}", today)
      }
      val spots = drawings.medium(canvas, moment, card)
      val views = RemoteViews(context.packageName, R.layout.sixpm_widget_postcard_medium)
      views.setImageViewBitmap(R.id.sixpm_widget_picture, canvas.bitmap)
      views.setContentDescription(R.id.sixpm_widget_picture, "${card.number} · ${card.sub}")
      views.setOnClickPendingIntent(android.R.id.background, open(context, id, 0, today))
      JAR_TAPS.forEachIndexed { k, tap ->
        // The jars are drawn from the right; the tap areas line up from the right too.
        val spot = spots.getOrNull(k - (JAR_TAPS.size - spots.size))
        if (spot == null) {
          views.setViewVisibility(tap, View.GONE)
        } else {
          views.setViewVisibility(tap, View.VISIBLE)
          views.setOnClickPendingIntent(tap, open(context, id, 1 + k, spot.jar.path))
          views.setContentDescription(tap, "${spot.jar.name} ${spot.jar.amountText}")
        }
      }
      views
    }

  fun drawMonth(context: Context, manager: AppWidgetManager, id: Int) =
    drawn(context, manager, id, 320 to 320) { canvas, moment, drawings ->
      val card = moment.day?.card ?: return@drawn null
      drawings.month(canvas, moment, card)
      val cards = moment.postcards
      picture(context, canvas, id, "${cards?.monthTitle} · ${cards?.monthHeadline}", cards?.monthLink)
    }

  fun drawStreak(context: Context, manager: AppWidgetManager, id: Int) =
    drawn(context, manager, id, 160 to 160) { canvas, moment, drawings ->
      drawings.streak(canvas, moment)
      val cards = moment.postcards
      picture(context, canvas, id, "${cards?.streakCount} ${moment.text("streakLine1")} ${moment.text("streakLine2")}", cards?.streakLink)
    }

  fun drawJar(context: Context, manager: AppWidgetManager, id: Int) =
    drawn(context, manager, id, 160 to 160) { canvas, moment, drawings ->
      val jar = moment.postcards?.shownJar ?: return@drawn null
      drawings.oneJar(canvas, moment, jar)
      picture(context, canvas, id, "${jar.name} · ${jar.countText} ${jar.countUnit}", jar.path)
    }

  private fun picture(context: Context, canvas: WidgetCanvas, id: Int, description: String, link: String?): RemoteViews =
    RemoteViews(context.packageName, R.layout.sixpm_widget_picture).apply {
      setImageViewBitmap(R.id.sixpm_widget_picture, canvas.bitmap)
      setContentDescription(R.id.sixpm_widget_picture, description)
      setOnClickPendingIntent(android.R.id.background, open(context, id, 0, link))
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
        23f
      }
    return WidgetCanvas(width.toFloat(), height.toFloat(), density, radius)
  }

  /**
   * Opens 6pm at one of its links: the app's `/app/...` paths (`/app?tab=today`, `/app/pot/<id>`)
   * through its own scheme, or the app as it was when there is none.
   */
  fun open(context: Context, id: Int, slot: Int, link: String?): PendingIntent {
    val route = link?.removePrefix("/app")?.removePrefix("/")
    val intent =
      if (route == null) {
        context.packageManager.getLaunchIntentForPackage(context.packageName) ?: Intent()
      } else {
        Intent(Intent.ACTION_VIEW, Uri.parse("${scheme(context)}://$route")).setPackage(context.packageName)
      }
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    return PendingIntent.getActivity(
      context,
      id * 8 + slot,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
  }

  /** Opens 6pm at a route of its own link scheme (`scan`, `quick-add`), as the tiles do. */
  fun open(context: Context, id: Int, route: String?): PendingIntent =
    open(context, id, when (route) { null -> 0; "scan" -> 6; else -> 7 }, route?.let { "/app/$it" })

  /** The app's link scheme, as `plugins/with-android-widgets` writes it (`sixpm`, `sixpm-dev`). */
  fun scheme(context: Context): String = string(context, "sixpm_link_scheme").ifEmpty { "sixpm" }

  /** An app string resource by name: the widgets' words live with the app's, in every language. */
  fun string(context: Context, name: String): String {
    val res = context.resources.getIdentifier(name, "string", context.packageName)
    return if (res == 0) "" else context.getString(res)
  }
}
