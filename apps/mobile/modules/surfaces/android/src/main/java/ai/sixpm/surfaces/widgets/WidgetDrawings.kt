package ai.sixpm.surfaces.widgets

import android.graphics.Path
import android.graphics.RectF
import android.text.TextPaint

/** Where a drawn jar sits on the medium widget, in dp, for its tap area. */
data class JarSpot(val jar: PostcardJar, val rect: RectF)

/**
 * The postcards as the iPhone draws them ("6pm Widgets"), in dp from the prototype's points: the
 * number on its sky (small), with the jars (medium), the streak's strata, one jar counting down,
 * and the month as suns (large). Every word, number and colour was decided by the app.
 */
class WidgetDrawings(private val faces: WidgetFaces) {
  fun color(moment: WidgetMoment, token: String): Int = WidgetInk.color(moment.token(token))

  fun ink(moment: WidgetMoment): Int = color(moment, "skyInk")

  fun dark(moment: WidgetMoment): Boolean = moment.token("dark") == "1"

  fun top(paint: TextPaint): Float = -paint.fontMetrics.ascent

  /** An amount, or ••• when the person hides them: Android has no locked Home screen to wait for. */
  fun amount(moment: WidgetMoment, text: String): String =
    if (moment.postcards?.hideAmounts == true) moment.text("hidden").ifEmpty { "•••" } else text

  /** The look's sky for the stretch's hour, top to bottom, or its own ground (Basic). */
  fun sky(canvas: WidgetCanvas, moment: WidgetMoment) {
    val look = moment.postcards?.ink
    val ground = if (dark(moment)) look?.groundNight else look?.groundDay
    if (!ground.isNullOrEmpty()) {
      canvas.fill(WidgetInk.color(ground))
      return
    }
    canvas.gradient(
      intArrayOf(color(moment, "skyTop"), color(moment, "skyMid"), color(moment, "skyBottom")),
      floatArrayOf(0f, 0.52f, 1f),
      0.5f,
      0f,
      0.5f,
      1f,
    )
  }

  /** The stretch's sun, centred where the app put it. */
  fun sun(canvas: WidgetCanvas, moment: WidgetMoment, card: PostcardCard, size: Float, small: Boolean) {
    val look = moment.postcards?.ink ?: return
    val fill = look.suns[card.sunKind] ?: return
    val cx = canvas.width * (if (small) card.sunXs else card.sunX).toFloat()
    val cy = canvas.height * (if (small) card.sunYs else card.sunY).toFloat()
    val rect = RectF(cx - size / 2, cy - size / 2, cx + size / 2, cy + size / 2)
    look.sunGlow[card.sunKind]?.let { canvas.glow(RectF(rect).apply { inset(-size * 0.3f, -size * 0.3f) }, size * 0.5f, WidgetInk.color(it)) }
    canvas.oval(rect, canvas.fillPaint(fill, rect))
    look.sunRing?.let { canvas.strokeOval(rect, 3f, WidgetInk.color(it)) }
  }

  fun kicker(canvas: WidgetCanvas, moment: WidgetMoment, size: Float, color: Int): TextPaint {
    val mono = moment.postcards?.ink?.mono != false
    return canvas.ink(if (mono) faces.mono() else faces.body(600), size, WidgetInk.faded(color, 0.8), trackingEm = if (mono) 0.14f else 0.04f)
  }

  fun number(canvas: WidgetCanvas, moment: WidgetMoment, size: Float, color: Int): TextPaint {
    val look = moment.postcards?.ink
    return canvas.ink(faces.display(moment.displayFont, size, look?.displayWeight ?: 500), size, color, trackingEm = look?.numberTracking ?: -0.03f)
  }

  /** Small: the short kicker, the short number and what it is, on the sky with the sun. */
  fun small(canvas: WidgetCanvas, moment: WidgetMoment, day: WidgetDay, card: PostcardCard) {
    sky(canvas, moment)
    sun(canvas, moment, card, 40f, small = true)
    val ink = ink(moment)
    val pad = 14f
    val head = kicker(canvas, moment, 9.5f, ink)
    canvas.text(card.kickerShort, pad, pad + top(head), head, canvas.width - pad * 2)
    val label = canvas.ink(faces.body(600), 11.5f, WidgetInk.faded(ink, 0.8))
    val labelBaseline = canvas.height - pad - label.fontMetrics.descent
    val words = if (moment.state == WidgetMoment.State.STALE) moment.text("openApp") else card.subShort
    canvas.text(words, pad, labelBaseline, label, canvas.width - pad * 2)
    val figure = number(canvas, moment, moment.postcards?.ink?.numberSmall ?: 40f, ink)
    val figureBaseline = labelBaseline + label.fontMetrics.ascent - 3 - figure.fontMetrics.descent
    canvas.text(amount(moment, day.safeShort), pad, figureBaseline, figure, canvas.width - pad * 2, minScale = 0.5f)
    if (card.closed && card.closedAt != null) stamp(canvas, moment.text("stamp"), card.closedAt, ink)
  }

  /** CLOSED and the time, pressed on at an angle in the top right corner. */
  private fun stamp(canvas: WidgetCanvas, word: String, time: String, ink: Int) {
    val paint = canvas.ink(faces.mono(), 8.5f, ink, trackingEm = 0.12f)
    val width = maxOf(paint.measureText(word), paint.measureText(time)) + 12
    val line = paint.fontMetrics.descent - paint.fontMetrics.ascent
    val rect = RectF(canvas.width - 12 - width, 12f, canvas.width - 12, 12 + line * 2 + 6)
    canvas.rotated(-7f, rect.centerX(), rect.centerY()) {
      canvas.strokePath(Path().apply { addRoundRect(rect, 4f, 4f, Path.Direction.CW) }, 2f, ink)
      canvas.centred(word, rect.centerX(), rect.top + 3 + top(paint), paint)
      canvas.centred(time, rect.centerX(), rect.top + 3 + line + top(paint), paint)
    }
  }

  /** Medium: the kicker, the number, the day's bar and what it means, then up to four jars. */
  fun medium(canvas: WidgetCanvas, moment: WidgetMoment, card: PostcardCard): List<JarSpot> {
    sky(canvas, moment)
    sun(canvas, moment, card, 54f, small = false)
    val ink = ink(moment)
    val pad = 16f
    val jars = moment.postcards?.jars.orEmpty().take(4)
    val shelf = if (jars.isEmpty()) 0f else jars.size * 34f + (jars.size - 1) * 5f + 12f
    val room = canvas.width - pad * 2 - shelf
    val head = kicker(canvas, moment, 10f, ink)
    canvas.text(card.kicker, pad, pad + top(head), head, room)
    val sub = canvas.ink(faces.body(600), 12f, WidgetInk.faded(ink, 0.8))
    val subBaseline = canvas.height - pad - sub.fontMetrics.descent
    val words =
      when {
        moment.state == WidgetMoment.State.STALE -> moment.text("openApp")
        moment.postcards?.hideAmounts == true -> card.subHidden ?: card.sub
        else -> card.sub
      }
    canvas.text(words, pad, subBaseline, sub, room)
    val barTop = subBaseline + sub.fontMetrics.ascent - 4 - 5
    val bar = RectF(pad, barTop, pad + minOf(140f, room), barTop + 5)
    canvas.roundRect(bar, 2.5f, WidgetInk.faded(ink, if (dark(moment)) 0.22 else 0.14))
    val used = bar.width() * card.used.toFloat().coerceIn(0f, 1f)
    if (used > 0) canvas.roundRect(RectF(bar.left, bar.top, bar.left + used, bar.bottom), 2.5f, ink)
    val figure = number(canvas, moment, moment.postcards?.ink?.numberMedium ?: 44f, ink)
    canvas.text(amount(moment, card.number), pad, bar.top - 4 - figure.fontMetrics.descent, figure, room, minScale = 0.5f)

    val spots = ArrayList<JarSpot>()
    var x = canvas.width - pad - (jars.size * 34f + (jars.size - 1) * 5f)
    val label = canvas.ink(faces.body(700), 9.5f, WidgetInk.faded(ink, 0.85))
    val labelBaseline = canvas.height - pad - 2 - label.fontMetrics.descent
    val jarBottom = labelBaseline + label.fontMetrics.ascent - 4
    jars.forEachIndexed { index, jar ->
      val rect = RectF(x, jarBottom - 46, x + 34, jarBottom)
      jar(canvas, moment, jar, index, rect, 1f, ink)
      canvas.centred(amount(moment, jar.amountText), rect.centerX(), labelBaseline, label, 40f)
      spots.add(JarSpot(jar, RectF(rect.left, rect.top, rect.right, labelBaseline + label.fontMetrics.descent)))
      x += 39
    }
    return spots
  }

  /** A jar as the look draws it: the lid, the glass, what it holds, its icon. */
  private fun jar(canvas: WidgetCanvas, moment: WidgetMoment, jar: PostcardJar, index: Int, rect: RectF, scale: Float, ink: Int, targetLine: Boolean = false) {
    val look = moment.postcards?.ink
    val lidInset = (if (scale > 1) 17f else 9f)
    val lidH = if (scale > 1) 10f else 6f
    val bodyTop = if (scale > 1) 8f else 5f
    val body = RectF(rect.left, rect.top + bodyTop, rect.right, rect.bottom)
    val shape = canvas.jarPath(body, (look?.jarRadiusTop ?: 10f) * scale, (look?.jarRadiusBottom ?: 12f) * scale)
    val own = look?.jarFills.isNullOrEmpty()
    canvas.clipped(shape) {
      val glass = look?.jarBody
      canvas.rect(body, if (glass != null) canvas.fillPaint(glass, body) else android.graphics.Paint().apply { color = WidgetInk.color(jar.glass) })
      val level = body.height() * jar.level.toFloat().coerceIn(0f, 1f)
      val held = RectF(body.left, body.bottom - level, body.right, body.bottom)
      val fill = look?.jarFills?.getOrNull(index % maxOf(1, look.jarFills.size))
      canvas.rect(held, if (fill != null) canvas.fillPaint(fill, held) else android.graphics.Paint().apply { color = WidgetInk.color(jar.fill) })
      if (own && level > 0) canvas.line(held.left, held.top, held.right, 1.5f * scale, WidgetInk.color(jar.fillTop))
      if (targetLine) canvas.dashedLine(body.left + 8, body.top + 16, body.right - 8, 1.5f, WidgetInk.faded(ink, if (dark(moment)) 0.4 else 0.3), 4f, 3f)
    }
    val edge = look?.jarEdge?.let { WidgetInk.color(it) } ?: WidgetInk.faded(ink, 0.18)
    canvas.strokePath(shape, look?.jarEdgeWidth ?: 1f, edge)
    canvas.roundRect(RectF(rect.left + lidInset, rect.top, rect.right - lidInset, rect.top + lidH), 3f * scale, WidgetInk.color(look?.jarLid ?: jar.lid))
    if (look?.jarIcon != false) {
      val size = if (scale > 1) 22f else 14f
      val paint = canvas.ink(faces.symbol(size, filled = true), size, WidgetInk.color(if (jar.level > 0.48) jar.iconHigh else jar.iconLow))
      canvas.glyph(jar.icon, body, paint)
    }
  }

  /** The jar widget: the jar tall beside its name, its day, the count and what it holds. */
  fun oneJar(canvas: WidgetCanvas, moment: WidgetMoment, jar: PostcardJar) {
    sky(canvas, moment)
    val ink = ink(moment)
    val pad = 14f
    val index = moment.postcards?.jars?.indexOfFirst { it.id == jar.id }?.coerceAtLeast(0) ?: 0
    val jarRect = RectF(pad, pad, pad + 64, canvas.height - pad)
    jar(canvas, moment, jar, index, jarRect, 2f, ink, targetLine = true)
    val x = jarRect.right + 10
    val room = canvas.width - pad - x
    val name = canvas.ink(faces.body(700), 14f, ink)
    var y = pad + 2 + top(name)
    canvas.text(jar.name, x, y, name, room)
    val soft = canvas.ink(faces.body(600), 11f, WidgetInk.faded(ink, 0.75))
    if (jar.dayText.isNotEmpty()) canvas.text(jar.dayText, x, y + name.fontMetrics.descent + 1 + top(soft), soft, room)
    val foot = canvas.ink(faces.body(700), 11f, ink)
    canvas.text(amount(moment, jar.ofText), x, canvas.height - pad - 2 - foot.fontMetrics.descent, foot, room)
    val figure = number(canvas, moment, 40f, ink)
    y = canvas.height / 2 + 6
    canvas.text(jar.countText, x, y, figure, room, minScale = 0.5f)
    canvas.text(jar.countUnit, x, y + figure.fontMetrics.descent + top(soft), soft, room)
  }

  /** The streak: the evenings closed in a row as strata, the count and the sun setting into it. */
  fun streak(canvas: WidgetCanvas, moment: WidgetMoment) {
    val cards = moment.postcards ?: return
    val look = cards.ink
    canvas.fill(WidgetInk.color(look?.streakGround))
    val foot = 62f
    val area = RectF(6f, 6f, canvas.width - 6, canvas.height - foot)
    val count = cards.streakBands.size + if (cards.streakOpen) 1 else 0
    if (count > 0) {
      val band = (area.height() - (count - 1) * 2) / count
      var y = area.top
      for (colours in cards.streakBands) {
        val rect = RectF(area.left, y, area.right, y + band)
        val paint = android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG)
        paint.shader = android.graphics.LinearGradient(rect.left, 0f, rect.right, 0f, colours.map { WidgetInk.color(it) }.toIntArray(), floatArrayOf(0f, 0.55f, 1f).copyOf(colours.size), android.graphics.Shader.TileMode.CLAMP)
        canvas.path(Path().apply { addRoundRect(rect, 4f, 4f, Path.Direction.CW) }, paint)
        y += band + 2
      }
      if (cards.streakOpen) {
        val rect = RectF(area.left, y, area.right, y + band)
        canvas.clipped(Path().apply { addRoundRect(rect, 4f, 4f, Path.Direction.CW) }) {
          var x = rect.left
          while (x < rect.right) {
            canvas.rect(RectF(x, rect.top, x + 4, rect.bottom), android.graphics.Paint().apply { color = WidgetInk.color(look?.hatch) })
            x += 8
          }
        }
      }
    }
    val lineY = canvas.height - foot
    // The sun sets into the line: only its top half shows.
    val sunFill = look?.suns?.get("dusk") ?: look?.suns?.get("day")
    if (sunFill != null) {
      val rect = RectF(canvas.width - 16 - 38, lineY - 19, canvas.width - 16, lineY + 19)
      canvas.clipped(RectF(rect.left, rect.top, rect.right, lineY)) { canvas.oval(rect, canvas.fillPaint(sunFill, rect)) }
    }
    canvas.line(0f, lineY, canvas.width, 1f, WidgetInk.color(look?.streakLine))
    val light = WidgetInk.color("#ffffff")
    val figure = number(canvas, moment, 40f, light)
    val baseline = canvas.height - 6 - figure.fontMetrics.descent
    val width = canvas.text(cards.streakCount.toString(), 14f, baseline, figure, canvas.width / 2)
    val word = canvas.ink(faces.mono(), 8.5f, WidgetInk.color(look?.streakWord), trackingEm = 0.14f)
    val line = word.fontMetrics.descent - word.fontMetrics.ascent
    canvas.text(moment.text("streakLine1"), 14 + width + 8, baseline - 4 - line, word, canvas.width - width - 36)
    canvas.text(moment.text("streakLine2"), 14 + width + 8, baseline - 4, word, canvas.width - width - 36)
  }

  /** The month as suns: the title, the headline, a sun for each evening and tonight's close. */
  fun month(canvas: WidgetCanvas, moment: WidgetMoment, card: PostcardCard) {
    val cards = moment.postcards ?: return
    sky(canvas, moment)
    val ink = ink(moment)
    val side = 18f
    val head = kicker(canvas, moment, 10f, ink)
    var y = 18 + top(head)
    canvas.text(cards.monthTitle, side, y, head, canvas.width - side * 2 - 40)
    canvas.text(moment.text("brand"), canvas.width - side, y, canvas.ink(faces.display(moment.displayFont, 15f, 600), 15f, ink), 40f, alignEnd = true)
    val headline = canvas.ink(faces.display(moment.displayFont, 26f, 500), 26f, ink, trackingEm = -0.02f)
    y += head.fontMetrics.descent + 10 + top(headline)
    canvas.text(cards.monthHeadline, side, y, headline, canvas.width - side * 2, minScale = 0.7f)
    y += headline.fontMetrics.descent + 12
    val rows = maxOf(5, (cards.monthCells.size + 6) / 7)
    val footTop = canvas.height - 16 - 24
    val gap = 8f
    val dot = minOf((canvas.width - side * 2 - 12 - gap * 6) / 7, (footTop - y - 8 - (rows - 1) * 6) / rows)
    val gridWidth = dot * 7 + gap * 6
    val left = (canvas.width - gridWidth) / 2
    for (k in 0 until rows * 7) {
      val cell = cards.monthCells.getOrNull(k) ?: "blank"
      val rect = RectF(left + (k % 7) * (dot + gap), y + (k / 7) * (dot + 6), left + (k % 7) * (dot + gap) + dot, y + (k / 7) * (dot + 6) + dot)
      daySun(canvas, moment, cell, rect, ink)
    }
    canvas.dashedLine(side, footTop, canvas.width - side, 1f, WidgetInk.faded(ink, if (dark(moment)) 0.4 else 0.3), 3f, 3f)
    val foot = canvas.ink(faces.mono(), 11f, ink)
    val baseline = footTop + 10 + top(foot)
    canvas.text(moment.text("tonight"), side, baseline, foot, canvas.width / 2)
    val tonight = if (moment.state == WidgetMoment.State.STALE) moment.text("openApp") else card.tonight
    canvas.text(tonight, canvas.width - side, baseline, foot, canvas.width / 2, alignEnd = true)
  }

  /** One day as a sun: whole, half, a missed ring, today's accent ring, or still ahead. */
  fun daySun(canvas: WidgetCanvas, moment: WidgetMoment, cell: String, rect: RectF, ink: Int) {
    val look = moment.postcards?.ink
    when (cell) {
      "sun" -> {
        if (look != null) canvas.oval(rect, canvas.fillPaint(look.dotFull, rect))
        look?.dotFullRing?.let { canvas.strokeOval(rect, 2f, WidgetInk.color(it)) }
      }
      "half" -> if (look != null) canvas.clipped(Path().apply { addOval(rect, Path.Direction.CW) }) { canvas.rect(rect, canvas.fillPaint(look.dotHalf, rect)) }
      "miss" -> canvas.strokeOval(rect, 1.5f, if (look?.dotRing.isNullOrEmpty()) WidgetInk.faded(ink, 0.35) else WidgetInk.color(look?.dotRing))
      "today" -> canvas.strokeOval(rect, 2f, WidgetInk.color(look?.today))
      "ahead" -> canvas.strokeOval(rect, 1f, WidgetInk.faded(ink, if (dark(moment)) 0.2 else 0.18))
    }
  }

  /** Before the month is set up: "Open 6pm to set up", on the sky. */
  fun setUp(canvas: WidgetCanvas, moment: WidgetMoment, fallback: String) {
    val known = moment.token("skyTop") != null
    val ink = if (known) ink(moment) else WidgetInk.PlainNight.ink
    if (known) sky(canvas, moment) else canvas.fill(WidgetInk.PlainNight.sheetSolid)
    val words = moment.text("setUp").ifEmpty { fallback }
    val paint = canvas.ink(faces.body(600), 13f, ink)
    canvas.centred(words, canvas.width / 2, canvas.height / 2 - (paint.fontMetrics.ascent + paint.fontMetrics.descent) / 2, paint, canvas.width - 32)
  }
}
