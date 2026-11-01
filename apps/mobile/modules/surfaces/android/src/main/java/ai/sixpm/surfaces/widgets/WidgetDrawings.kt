package ai.sixpm.surfaces.widgets

import android.content.Context
import android.graphics.Bitmap
import android.graphics.RectF
import android.text.TextPaint

/** The Scan QR and Quick add targets' places on a drawn widget, in dp, for its tap areas. */
data class WidgetTargets(val scan: RectF?, val add: RectF?)

/**
 * The widgets as the iPhone draws them, in dp from the prototype's points: Safe today small and
 * medium, and Today (large). Free, the small and large widgets sit on the light card (the night
 * card on a dark Home Screen); in the user's look (Max), on the look's own ground in its display face.
 */
class WidgetDrawings(private val context: Context, private val faces: WidgetFaces) {
  private val pad = 16f

  /** The last line of a widget: tomorrow and what is pending, or "Open 6pm" once out of date. */
  private fun footnote(moment: WidgetMoment, day: WidgetDay): String =
    if (moment.state == WidgetMoment.State.STALE) moment.text("openApp")
    else listOf(day.tomorrowText, day.pendingText).filter { it.isNotEmpty() }.joinToString(" · ")

  private fun color(moment: WidgetMoment, token: String): Int = WidgetInk.color(moment.token(token))

  private fun top(paint: TextPaint): Float = -paint.fontMetrics.ascent

  private fun lineHeight(paint: TextPaint): Float = paint.fontMetrics.descent - paint.fontMetrics.ascent

  /** Small: the companion and Scan QR over the number and "safe today". */
  fun small(canvas: WidgetCanvas, moment: WidgetMoment, day: WidgetDay, dark: Boolean): WidgetTargets {
    val look = moment.inLook
    val ink: Int
    val number: Int
    val button: Int
    val onButton: Int
    val labelOpacity: Double
    when {
      look -> {
        ink = color(moment, "skyInk")
        number = ink
        button = color(moment, "accent")
        onButton = color(moment, "onAccent")
        labelOpacity = 0.65
        canvas.gradient(intArrayOf(color(moment, "skyTop"), color(moment, "skyMid")), null, 0.5f, 0f, 0.5f, 1f)
      }
      dark -> {
        ink = WidgetInk.PlainNight.ink
        number = WidgetInk.PlainNight.accent
        button = WidgetInk.PlainNight.accent
        onButton = color(moment, "onAccent")
        labelOpacity = 0.6
        canvas.fill(WidgetInk.PlainNight.sheetSolid)
      }
      else -> {
        ink = color(moment, "cardInk")
        number = ink
        button = ink
        onButton = color(moment, "cardBg")
        labelOpacity = 0.6
        canvas.fill(color(moment, "cardBg"))
      }
    }
    companion(canvas, moment, 36, RectF(pad, pad, pad + 36, pad + 36))
    val scan = RectF(canvas.width - pad - 36, pad, canvas.width - pad, pad + 36)
    canvas.circle(scan.centerX(), scan.centerY(), 18f, button)
    canvas.glyph(moment.text("glyph.scan"), scan, canvas.ink(faces.symbol(20f), 20f, onButton))

    val size = if (look) 38f else 44f
    val weight = if (look) 600 else 500
    val label = canvas.ink(faces.body(600), 12f, WidgetInk.faded(ink, labelOpacity))
    val labelBaseline = canvas.height - pad - label.fontMetrics.descent
    val labelText = if (moment.state == WidgetMoment.State.STALE) moment.text("openApp") else moment.text("safeTodayShort")
    canvas.text(labelText, pad, labelBaseline, label, canvas.width - pad * 2)
    val figure = canvas.ink(faces.display(moment.displayFont, size, weight), size, number)
    val figureBaseline = labelBaseline + label.fontMetrics.ascent - 2 - figure.fontMetrics.descent
    canvas.text(day.safeShort, pad, figureBaseline, figure, canvas.width - pad * 2, minScale = 0.6f)
    return WidgetTargets(scan = scan, add = null)
  }

  /** Medium: the number on the look's sky, with Scan QR and Quick add beside it. */
  fun medium(canvas: WidgetCanvas, moment: WidgetMoment, day: WidgetDay): WidgetTargets {
    // CSS 160deg: from just left of the top centre to just right of the bottom centre.
    canvas.gradient(
      intArrayOf(color(moment, "skyTop"), color(moment, "skyMid"), color(moment, "skyBottom")),
      floatArrayOf(0f, 0.7f, 1f),
      0.33f,
      0.03f,
      0.67f,
      0.97f,
    )
    val ink = color(moment, "skyInk")
    val column = 96f
    val textWidth = canvas.width - pad * 2 - column - 14
    val soft = WidgetInk.faded(ink, 0.8)

    val heading = canvas.ink(faces.body(600), 13f, soft)
    canvas.text(moment.text("safeToSpend"), pad, pad + top(heading), heading, textWidth)
    val foot = canvas.ink(faces.body(600), 12f, soft)
    canvas.text(footnote(moment, day), pad, canvas.height - pad - foot.fontMetrics.descent, foot, textWidth)
    val figure = canvas.ink(faces.display(moment.displayFont, 56f, 500), 56f, ink, trackingEm = -0.02f)
    val middle = canvas.height / 2
    val baseline = middle - (figure.fontMetrics.ascent + figure.fontMetrics.descent) / 2
    canvas.text(day.safeShort, pad, baseline, figure, textWidth, minScale = 0.6f)

    val left = canvas.width - pad - column
    val tileHeight = (canvas.height - pad * 2 - 8) / 2
    val scan = RectF(left, pad, left + column, pad + tileHeight)
    val add = RectF(left, pad + tileHeight + 8, left + column, canvas.height - pad)
    tile(canvas, scan, moment.text("glyph.scan"), moment.text("scanQr"), color(moment, "accent"), color(moment, "onAccent"))
    tile(canvas, add, moment.text("glyph.add"), moment.text("quickAdd"), WidgetInk.faded(ink, 0.2), ink)
    return WidgetTargets(scan = scan, add = add)
  }

  /** A tile that opens the app at a route: radius 18, a 26 dp glyph over a 12 dp label. */
  private fun tile(canvas: WidgetCanvas, rect: RectF, glyph: String, label: String, background: Int, foreground: Int) {
    canvas.roundRect(rect, 18f, background)
    val symbol = canvas.ink(faces.symbol(26f), 26f, foreground)
    val words = canvas.ink(faces.body(650), 12f, foreground)
    val glyphBox = 26f
    val stack = glyphBox + 4 + lineHeight(words)
    val y = rect.centerY() - stack / 2
    canvas.glyph(glyph, RectF(rect.left, y, rect.right, y + glyphBox), symbol)
    canvas.centred(label, rect.centerX(), y + glyphBox + 4 + top(words), words, rect.width() - 8)
  }

  /**
   * Today (large): what is left, the day's spend against its line, then today's newest three
   * spends and "+N more" with what they add up to.
   */
  fun list(canvas: WidgetCanvas, moment: WidgetMoment, day: WidgetDay, darkScreen: Boolean) {
    val dark = darkScreen && !moment.inLook
    val ink = if (dark) WidgetInk.PlainNight.ink else color(moment, "cardInk")
    canvas.fill(if (dark) WidgetInk.PlainNight.sheetSolid else color(moment, "cardBg"))
    val side = 16f
    var y = 14f

    val title = canvas.ink(faces.body(700), 15f, ink)
    val safe = canvas.ink(faces.display(moment.displayFont, 24f, 500), 24f, ink)
    val headBaseline = y + top(safe)
    val companionShown = companion(canvas, moment, 22, RectF(side, headBaseline - 18, side + 22, headBaseline + 4))
    val titleX = side + if (companionShown) 30f else 0f
    val titleWidth = canvas.text(moment.text("today"), titleX, headBaseline, title)
    canvas.text(day.safeText, canvas.width - side, headBaseline, safe, canvas.width - titleX - titleWidth - side - 8, alignEnd = true)
    y = headBaseline + safe.fontMetrics.descent

    val fraction = day.spentFraction
    if (fraction != null) {
      y += 6
      val bar = RectF(side, y, canvas.width - side, y + 6)
      canvas.roundRect(bar, 3f, WidgetInk.faded(ink, 0.08))
      val fill = bar.width() * fraction.toFloat().coerceIn(0f, 1f)
      if (fill > 0) canvas.roundRect(RectF(bar.left, bar.top, bar.left + fill, bar.bottom), 3f, color(moment, "accent"))
      val small = canvas.ink(faces.body(600), 11f, WidgetInk.faded(ink, 0.55))
      val baseline = bar.bottom + 5 + top(small)
      canvas.text(day.spentText.orEmpty(), side, baseline, small, bar.width() / 2)
      canvas.text(day.lineText.orEmpty(), canvas.width - side, baseline, small, bar.width() / 2, alignEnd = true)
      y = baseline + small.fontMetrics.descent + 8
    } else {
      y += 6
    }

    val rule = WidgetInk.faded(ink, 0.1)
    val body = canvas.ink(faces.body(400), 14f, ink)
    if (day.list.isEmpty()) {
      canvas.line(side, y, canvas.width - side, 0.5f, rule)
      val faint = canvas.ink(faces.body(400), 14f, WidgetInk.faded(ink, 0.55))
      canvas.text(moment.text("listEmpty"), side, y + 6 + top(faint), faint, canvas.width - side * 2)
      y += 6 + lineHeight(faint) + 6
    }
    val pendingInk = color(moment, if (dark) "pendingInkDark" else "pendingInk")
    for (row in day.list) {
      if (y + 38 > canvas.height) break
      canvas.line(side, y, canvas.width - side, 0.5f, rule)
      spendRow(canvas, moment, row, RectF(side, y + 6, canvas.width - side, y + 32), body, ink, pendingInk)
      y += 38
    }
    if (day.moreText.isNotEmpty() && y + 30 <= canvas.height) {
      canvas.line(side, y, canvas.width - side, 0.5f, rule)
      val faint = canvas.ink(faces.body(400), 14f, WidgetInk.faded(ink, 0.55))
      val baseline = y + 7 + top(faint)
      canvas.text(day.moreText, side, baseline, faint, canvas.width / 2)
      canvas.text(day.moreAmountText.orEmpty(), canvas.width - side, baseline, faint, canvas.width / 2, alignEnd = true)
      y = baseline + faint.fontMetrics.descent + 7
    }
    if (moment.state == WidgetMoment.State.STALE && y + 30 <= canvas.height) {
      canvas.line(side, y, canvas.width - side, 0.5f, rule)
      val open = canvas.ink(faces.body(600), 14f, ink)
      canvas.text(moment.text("openApp"), side, y + 7 + top(open), open, canvas.width - side * 2)
    }
  }

  /** One spend: its 26 dp tile, the name (and PENDING while it waits), the amount. */
  private fun spendRow(
    canvas: WidgetCanvas,
    moment: WidgetMoment,
    row: WidgetRow,
    rect: RectF,
    body: TextPaint,
    ink: Int,
    pendingInk: Int,
  ) {
    val hue = if (row.hue % 1.0 == 0.0) row.hue.toInt().toString() else row.hue.toString()
    val tile = RectF(rect.left, rect.top, rect.left + 26, rect.top + 26)
    // CSS 155deg.
    canvas.roundRect(
      tile,
      9f,
      intArrayOf(WidgetInk.color(moment.text("tile.$hue.from")), WidgetInk.color(moment.text("tile.$hue.to"))),
      0.29f,
      0.05f,
      0.71f,
      0.95f,
    )
    canvas.glyph(row.icon, tile, canvas.ink(faces.symbol(16f, filled = true), 16f, WidgetInk.color(moment.text("tile.$hue.glyph"))))
    val baseline = tile.centerY() - (body.fontMetrics.ascent + body.fontMetrics.descent) / 2
    val amount = canvas.ink(faces.body(600), 14f, ink)
    val amountWidth = canvas.text(row.amountText, rect.right, baseline, amount, rect.width() / 2, alignEnd = true)
    val nameX = tile.right + 9
    val room = rect.right - amountWidth - 8 - nameX
    if (row.pending) {
      val tag = canvas.ink(faces.body(700), 11f, pendingInk, trackingEm = 0.04f)
      val tagText = moment.text("pendingTag").uppercase()
      val tagWidth = tag.measureText(tagText)
      val nameWidth = canvas.text(row.name, nameX, baseline, body, (room - tagWidth - 4).coerceAtLeast(0f))
      canvas.text(tagText, nameX + nameWidth + 4, baseline, tag, room - nameWidth - 4)
    } else {
      canvas.text(row.name, nameX, baseline, body, room)
    }
  }

  /** Before the month is set up: "Open 6pm to set up", on the card. */
  fun setUp(canvas: WidgetCanvas, moment: WidgetMoment, fallback: String) {
    val known = moment.token("cardBg") != null
    val ink = if (known) color(moment, "cardInk") else WidgetInk.PlainNight.ink
    canvas.fill(if (known) color(moment, "cardBg") else WidgetInk.PlainNight.sheetSolid)
    val words = moment.text("setUp").ifEmpty { fallback }
    val paint = canvas.ink(faces.body(600), 13f, ink)
    canvas.centred(words, canvas.width / 2, canvas.height / 2 - (paint.fontMetrics.ascent + paint.fontMetrics.descent) / 2, paint, canvas.width - 32)
  }

  /** The companion in the hour's mood, or nothing in serious mode. Returns whether it was drawn. */
  private fun companion(canvas: WidgetCanvas, moment: WidgetMoment, size: Int, rect: RectF): Boolean {
    if (moment.serious) return false
    val image: Bitmap = WidgetCompanion.load(context, moment.mood, size) ?: return false
    canvas.picture(image, rect)
    return true
  }
}
