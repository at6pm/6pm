package ai.sixpm.surfaces.widgets

import android.graphics.Path
import android.graphics.RectF
import android.text.TextPaint

/** The Scan QR and Quick add pills' places on the Today list, in dp, for their tap areas. */
data class WidgetTargets(val scan: RectF?, val add: RectF?)

/**
 * The Today list (large), This week (small) and Today's receipt (medium), drawn as the iPhone
 * draws them. The list and the week are postcards on the look's sky; the receipt is the close's
 * paper, the same in every look.
 */
class MoreDrawings(private val faces: WidgetFaces, private val base: WidgetDrawings) {
  private fun top(paint: TextPaint): Float = -paint.fontMetrics.ascent

  private fun lineHeight(paint: TextPaint): Float = paint.fontMetrics.descent - paint.fontMetrics.ascent

  /**
   * Today: the kicker, what is left, the day's spend against its line, today's newest spends and
   * "+N more", as many as fit above Scan QR and Quick add along its foot.
   */
  fun list(canvas: WidgetCanvas, moment: WidgetMoment, day: WidgetDay, card: PostcardCard): WidgetTargets {
    base.sky(canvas, moment)
    val ink = base.ink(moment)
    val dark = base.dark(moment)
    val side = 18f
    val head = base.kicker(canvas, moment, 10f, ink)
    var y = 18 + top(head)
    canvas.text(card.kicker, side, y, head, canvas.width - side * 2 - 40)
    canvas.text(moment.text("brand"), canvas.width - side, y, canvas.ink(faces.display(moment.displayFont, 15f, 600), 15f, ink), 40f, alignEnd = true)
    val figure = base.number(canvas, moment, moment.postcards?.ink?.numberMedium ?: 44f, ink)
    y += head.fontMetrics.descent + 14 + top(figure)
    canvas.text(base.amount(moment, card.number), side, y, figure, canvas.width - side * 2, minScale = 0.5f)
    y += figure.fontMetrics.descent

    val fraction = day.spentFraction
    if (fraction != null) {
      y += 8
      val bar = RectF(side, y, canvas.width - side, y + 5)
      canvas.roundRect(bar, 2.5f, WidgetInk.faded(ink, if (dark) 0.22 else 0.14))
      val fill = bar.width() * fraction.toFloat().coerceIn(0f, 1f)
      if (fill > 0) canvas.roundRect(RectF(bar.left, bar.top, bar.left + fill, bar.bottom), 2.5f, ink)
      val small = canvas.ink(faces.body(600), 11f, WidgetInk.faded(ink, 0.7))
      val baseline = bar.bottom + 5 + top(small)
      canvas.text(base.amount(moment, day.spentText.orEmpty()), side, baseline, small, bar.width() / 2)
      canvas.text(base.amount(moment, day.lineText.orEmpty()), canvas.width - side, baseline, small, bar.width() / 2, alignEnd = true)
      y = baseline + small.fontMetrics.descent + 10
    } else {
      y += 10
    }

    val rule = WidgetInk.faded(ink, 0.14)
    val body = canvas.ink(faces.body(400), 14f, ink)
    val faint = canvas.ink(faces.body(400), 14f, WidgetInk.faded(ink, 0.7))
    if (day.list.isEmpty()) {
      canvas.line(side, y, canvas.width - side, 0.5f, rule)
      canvas.text(moment.text("listEmpty"), side, y + 6 + top(faint), faint, canvas.width - side * 2)
      y += 6 + lineHeight(faint) + 6
    }
    val pendingInk = base.color(moment, if (dark) "pendingInkDark" else "pendingInk")
    // The pills along the foot, as `sixpm_widget_today` lays out their tap areas.
    val pillTop = canvas.height - 14 - 40
    val scan = RectF(16f, pillTop, canvas.width / 2 - 4, pillTop + 40)
    val add = RectF(canvas.width / 2 + 4, pillTop, canvas.width - 16, pillTop + 40)
    val floor = pillTop - 6
    for (row in day.list) {
      if (y + 38 > floor) break
      canvas.line(side, y, canvas.width - side, 0.5f, rule)
      spendRow(canvas, moment, row, RectF(side, y + 6, canvas.width - side, y + 32), body, ink, pendingInk)
      y += 38
    }
    if (day.moreText.isNotEmpty() && y + 30 <= floor) {
      canvas.line(side, y, canvas.width - side, 0.5f, rule)
      val baseline = y + 7 + top(faint)
      canvas.text(day.moreText, side, baseline, faint, canvas.width / 2)
      canvas.text(base.amount(moment, day.moreAmountText.orEmpty()), canvas.width - side, baseline, faint, canvas.width / 2, alignEnd = true)
    }
    pill(canvas, scan, moment.text("glyph.scan"), moment.text("scanQr"), base.color(moment, "accent"), base.color(moment, "onAccent"))
    pill(canvas, add, moment.text("glyph.add"), moment.text("quickAdd"), WidgetInk.faded(ink, 0.14), ink)
    return WidgetTargets(scan = scan, add = add)
  }

  /** A pill along the list's foot: a 20 dp glyph and a 13 dp label side by side, centred. */
  private fun pill(canvas: WidgetCanvas, rect: RectF, glyph: String, label: String, background: Int, foreground: Int) {
    canvas.roundRect(rect, rect.height() / 2, background)
    val symbol = canvas.ink(faces.symbol(20f), 20f, foreground)
    val words = canvas.ink(faces.body(650), 13f, foreground)
    val glyphBox = 20f
    val labelWidth = words.measureText(label).coerceAtMost(rect.width() - glyphBox - 6 - 24)
    val x = rect.centerX() - (glyphBox + 6 + labelWidth) / 2
    canvas.glyph(glyph, RectF(x, rect.centerY() - glyphBox / 2, x + glyphBox, rect.centerY() + glyphBox / 2), symbol)
    val baseline = rect.centerY() - (words.fontMetrics.ascent + words.fontMetrics.descent) / 2
    canvas.text(label, x + glyphBox + 6, baseline, words, labelWidth)
  }

  /** One spend: its 26 dp tile, the name (and PENDING while it waits), the amount. */
  private fun spendRow(canvas: WidgetCanvas, moment: WidgetMoment, row: WidgetRow, rect: RectF, body: TextPaint, ink: Int, pendingInk: Int) {
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
    val amountWidth = canvas.text(base.amount(moment, row.amountText), rect.right, baseline, amount, rect.width() / 2, alignEnd = true)
    val nameX = tile.right + 9
    val room = rect.right - amountWidth - 8 - nameX
    if (row.pending) {
      val tag = canvas.ink(faces.body(700), 11f, pendingInk, trackingEm = 0.04f)
      val tagText = moment.text("pendingTag").uppercase()
      val nameWidth = canvas.text(row.name, nameX, baseline, body, (room - tag.measureText(tagText) - 4).coerceAtLeast(0f))
      canvas.text(tagText, nameX + nameWidth + 4, baseline, tag, room - nameWidth - 4)
    } else {
      canvas.text(row.name, nameX, baseline, body, room)
    }
  }

  /** This week: the title, a sun for each day over its initial, and the line under them. */
  fun week(canvas: WidgetCanvas, moment: WidgetMoment) {
    val week = moment.postcards?.week ?: return
    base.sky(canvas, moment)
    val ink = base.ink(moment)
    val pad = 14f
    val head = base.kicker(canvas, moment, 9.5f, ink)
    canvas.text(week.title, pad, pad + top(head), head, canvas.width - pad * 2)
    val line = canvas.ink(faces.display(moment.displayFont, 17f, minOf(moment.postcards.ink?.displayWeight ?: 500, 600)), 17f, ink)
    canvas.text(week.line, pad, canvas.height - pad - line.fontMetrics.descent, line, canvas.width - pad * 2, minScale = 0.7f)
    val cell = (canvas.width - pad * 2) / 7
    val letter = canvas.ink(faces.body(700), 9f, WidgetInk.faded(ink, 0.6))
    val dotTop = canvas.height / 2 - 14
    for (k in 0 until 7) {
      val cx = pad + cell * k + cell / 2
      base.daySun(canvas, moment, week.cells.getOrNull(k) ?: "ahead", RectF(cx - 8, dotTop, cx + 8, dotTop + 16), ink)
      canvas.centred(week.letters.getOrNull(k).orEmpty(), cx, dotTop + 16 + 4 + top(letter), letter)
    }
  }

  /** Today's receipt: the head, today's lines (the unconfirmed faint), what is left, the stamp. */
  fun receipt(canvas: WidgetCanvas, moment: WidgetMoment, card: PostcardCard) {
    val receipt = moment.postcards?.receipt ?: return
    val today = card.day == null || card.day == receipt.day
    canvas.fill(receipt.paper("sheet"))
    val ink = receipt.paper("ink")
    val soft = receipt.paper("soft")
    val rule = receipt.paper("rule")
    val side = 16f
    val head = canvas.ink(faces.mono(), 10f, soft, trackingEm = 0.12f)
    var y = 14 + top(head)
    if (today) {
      val number = canvas.text(receipt.number, canvas.width - side, y, head, 80f, alignEnd = true)
      canvas.text(receipt.title, side, y, head, canvas.width - side * 2 - number - 8)
    }
    y += head.fontMetrics.descent + 6
    canvas.dashedLine(side, y, canvas.width - side, 1f, rule, 3f, 3f)
    y += 6
    val row = canvas.ink(faces.mono(), 11.5f, ink)
    val time = canvas.ink(faces.mono(), 11.5f, soft)
    val lines = if (today) receipt.lines else emptyList()
    if (today && receipt.earlier.isNotEmpty()) {
      val small = canvas.ink(faces.mono(), 10f, soft)
      canvas.text(receipt.earlier, side, y + top(small), small)
      y += lineHeight(small) + 2
    }
    if (lines.isEmpty()) canvas.text(receipt.empty, side, y + top(time), time, canvas.width - side * 2)
    for (line in lines) {
      val alpha = if (line.confirmed || card.closed) 1.0 else 0.5
      row.color = WidgetInk.faded(ink, alpha)
      time.color = WidgetInk.faded(soft, alpha)
      val baseline = y + top(row)
      val timeWidth = canvas.text(line.time, side, baseline, time)
      val amountWidth = canvas.text(base.amount(moment, line.amount), canvas.width - side, baseline, row, 120f, alignEnd = true)
      canvas.text(line.name, side + timeWidth + 10, baseline, row, canvas.width - side * 2 - timeWidth - amountWidth - 20)
      y += lineHeight(row) + 6
    }
    val total = canvas.ink(faces.display(moment.displayFont, 20f, 500), 20f, ink)
    val footBaseline = canvas.height - 16 - total.fontMetrics.descent
    canvas.dashedLine(side, footBaseline + total.fontMetrics.ascent - 6, canvas.width - side, 1f, rule, 3f, 3f)
    val label = canvas.ink(faces.mono(), 12f, ink)
    canvas.text(receipt.left, side, footBaseline, label, canvas.width / 2)
    canvas.text(base.amount(moment, card.amount), canvas.width - side, footBaseline, total, canvas.width / 2, alignEnd = true)
    if (card.closed && today && card.closedAt != null) stamp(canvas, moment.text("stamp"), card.closedAt, receipt.paper("stamp"))
    // The torn foot: the soft shadow of its teeth along the bottom edge.
    var x = 5f
    while (x < canvas.width + 5) {
      canvas.circle(x, canvas.height + 2.5f, 4.5f, receipt.paper("edge"))
      x += 10
    }
  }

  /** CLOSED and the time in the receipt's red, pressed on at an angle. */
  private fun stamp(canvas: WidgetCanvas, word: String, time: String, red: Int) {
    val paint = canvas.ink(faces.mono(), 13f, red, trackingEm = 0.14f)
    val width = maxOf(paint.measureText(word), paint.measureText(time)) + 20
    val line = lineHeight(paint)
    val rect = RectF(canvas.width - 22 - width, 42f, canvas.width - 22, 42 + line * 2 + 10)
    canvas.rotated(-7f, rect.centerX(), rect.centerY()) {
      canvas.strokePath(Path().apply { addRoundRect(rect, 5f, 5f, Path.Direction.CW) }, 2.5f, red)
      canvas.centred(word, rect.centerX(), rect.top + 5 + top(paint), paint)
      canvas.centred(time, rect.centerX(), rect.top + 5 + line + top(paint), paint)
    }
  }
}
