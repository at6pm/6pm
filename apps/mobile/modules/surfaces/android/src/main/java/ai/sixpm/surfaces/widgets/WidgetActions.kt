package ai.sixpm.surfaces.widgets

import ai.sixpm.surfaces.R
import android.content.Context
import android.graphics.RectF
import android.view.View
import android.widget.RemoteViews
import kotlin.math.roundToInt

/** A round button drawn on a widget, where it was drawn (in dp), and what it opens. */
data class WidgetAction(val viewId: Int, val slot: Int, val link: String, val label: String, val rect: RectF)

/**
 * Scan and Quick add on the medium and large widgets, as the iPhone draws them: two 30 dp rounds
 * in the widget's own ink, the Today header's glass buttons drawn small. Scan is there only when
 * the app gave it a link (a phone that scans); it scans a VietQR in đồng and a receipt elsewhere,
 * as its glyph says. Neither carries an amount, so Hide amounts leaves them as they are.
 */
object WidgetActions {
  const val SIZE = 30f
  private const val GAP = 6f

  /** The pending intents' slots, apart from the widget's own (0) and its jars' (1 to 4). */
  private const val SCAN_SLOT = 6
  private const val ADD_SLOT = 7

  private data class Wanted(val viewId: Int, val slot: Int, val link: String, val label: String, val glyph: String, val glyphSize: Float)

  private fun wanted(moment: WidgetMoment): List<Wanted> {
    val cards = moment.postcards ?: return emptyList()
    return listOfNotNull(
      cards.scanLink?.let { Wanted(R.id.sixpm_widget_scan, SCAN_SLOT, it, moment.text("scan"), moment.text("glyph.scan"), 16f) },
      cards.addLink?.let { Wanted(R.id.sixpm_widget_add, ADD_SLOT, it, moment.text("quickAdd"), moment.text("glyph.add"), 19f) },
    )
  }

  /** How wide the buttons are side by side, in dp; 0 when the app wrote none. */
  fun width(moment: WidgetMoment): Float {
    val count = wanted(moment).size
    return if (count == 0) 0f else count * SIZE + (count - 1) * GAP
  }

  /** Draws the buttons ending at `right`, centred on `centreY`, and returns where they went. */
  fun draw(canvas: WidgetCanvas, moment: WidgetMoment, faces: WidgetFaces, right: Float, centreY: Float, ink: Int, dark: Boolean): List<WidgetAction> {
    var x = right - width(moment)
    val glass = WidgetInk.faded(ink, if (dark) 0.22 else 0.14)
    return wanted(moment).map { want ->
      val rect = RectF(x, centreY - SIZE / 2, x + SIZE, centreY + SIZE / 2)
      canvas.circle(rect.centerX(), rect.centerY(), SIZE / 2, glass)
      canvas.glyph(want.glyph, rect, canvas.ink(faces.symbol(want.glyphSize), want.glyphSize, ink))
      x += SIZE + GAP
      WidgetAction(want.viewId, want.slot, want.link, want.label, rect)
    }
  }

  /**
   * Lays the tap areas (`sixpm_widget_actions`: 30 dp, 6 dp apart, from the top left of its
   * padding) over the drawn buttons, each opening its screen.
   */
  fun bind(context: Context, views: RemoteViews, id: Int, actions: List<WidgetAction>, density: Float) {
    for (view in intArrayOf(R.id.sixpm_widget_scan, R.id.sixpm_widget_add)) {
      val action = actions.firstOrNull { it.viewId == view }
      if (action == null) {
        views.setViewVisibility(view, View.GONE)
      } else {
        views.setViewVisibility(view, View.VISIBLE)
        views.setOnClickPendingIntent(view, Widgets.open(context, id, action.slot, action.link))
        views.setContentDescription(view, action.label)
      }
    }
    val first = actions.firstOrNull() ?: return
    views.setViewPadding(R.id.sixpm_widget_actions, (first.rect.left * density).roundToInt(), (first.rect.top * density).roundToInt(), 0, 0)
  }
}
