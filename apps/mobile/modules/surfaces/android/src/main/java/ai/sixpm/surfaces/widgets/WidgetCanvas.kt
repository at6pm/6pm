package ai.sixpm.surfaces.widgets

import android.graphics.Bitmap
import android.graphics.BlurMaskFilter
import android.graphics.Canvas
import android.graphics.DashPathEffect
import android.graphics.RadialGradient
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import android.graphics.Shader
import android.graphics.Typeface
import android.text.TextPaint
import android.text.TextUtils

/**
 * A widget drawn in dp onto a bitmap of its real size: Android widgets cannot set the app's
 * variable faces or the looks' gradients themselves, so each is drawn as the app would draw it and
 * shown as one picture, its corners cut to the launcher's radius.
 */
class WidgetCanvas(val width: Float, val height: Float, private val density: Float, radius: Float) {
  val bitmap: Bitmap =
    Bitmap.createBitmap(
      (width * density).toInt().coerceAtLeast(1),
      (height * density).toInt().coerceAtLeast(1),
      Bitmap.Config.ARGB_8888,
    )
  private val canvas =
    Canvas(bitmap).also {
      it.scale(density, density)
      val edge = RectF(0f, 0f, width, height)
      it.clipPath(Path().apply { addRoundRect(edge, radius, radius, Path.Direction.CW) })
    }

  fun fill(color: Int) {
    canvas.drawColor(color)
  }

  /**
   * A linear gradient over the whole widget from `(x0, y0)` to `(x1, y1)`, in fractions of its
   * size, as SwiftUI's unit points.
   */
  fun gradient(colors: IntArray, stops: FloatArray?, x0: Float, y0: Float, x1: Float, y1: Float) {
    val paint = Paint(Paint.ANTI_ALIAS_FLAG)
    paint.shader =
      LinearGradient(x0 * width, y0 * height, x1 * width, y1 * height, colors, stops, Shader.TileMode.CLAMP)
    canvas.drawRect(0f, 0f, width, height, paint)
  }

  fun roundRect(rect: RectF, radius: Float, color: Int) {
    canvas.drawRoundRect(rect, radius, radius, Paint(Paint.ANTI_ALIAS_FLAG).apply { this.color = color })
  }

  /** A rounded rectangle filled with a gradient from its own `(x0, y0)` to `(x1, y1)`. */
  fun roundRect(rect: RectF, radius: Float, colors: IntArray, x0: Float, y0: Float, x1: Float, y1: Float) {
    val paint = Paint(Paint.ANTI_ALIAS_FLAG)
    paint.shader =
      LinearGradient(
        rect.left + x0 * rect.width(),
        rect.top + y0 * rect.height(),
        rect.left + x1 * rect.width(),
        rect.top + y1 * rect.height(),
        colors,
        null,
        Shader.TileMode.CLAMP,
      )
    canvas.drawRoundRect(rect, radius, radius, paint)
  }

  fun circle(cx: Float, cy: Float, r: Float, color: Int) {
    canvas.drawCircle(cx, cy, r, Paint(Paint.ANTI_ALIAS_FLAG).apply { this.color = color })
  }

  fun line(x0: Float, y: Float, x1: Float, thickness: Float, color: Int) {
    canvas.drawRect(x0, y, x1, y + thickness, Paint().apply { this.color = color })
  }

  fun picture(image: Bitmap, rect: RectF) {
    canvas.drawBitmap(image, null, rect, Paint(Paint.FILTER_BITMAP_FLAG or Paint.ANTI_ALIAS_FLAG))
  }

  /** A paint for words in a face, at a size in dp, tracked in em, in a colour. */
  fun ink(face: Typeface, size: Float, color: Int, trackingEm: Float = 0f): TextPaint =
    TextPaint(Paint.ANTI_ALIAS_FLAG or Paint.SUBPIXEL_TEXT_FLAG).apply {
      typeface = face
      textSize = size
      this.color = color
      letterSpacing = trackingEm
    }

  /**
   * One line of text with its baseline at `y`, from `x` (or ending at `x` when `alignEnd`), no
   * wider than `maxWidth`: shrunk down to `minScale` of its size first, as SwiftUI's
   * `minimumScaleFactor`, then cut with an ellipsis. Returns the width it took.
   */
  fun text(
    text: String,
    x: Float,
    y: Float,
    paint: TextPaint,
    maxWidth: Float = Float.MAX_VALUE,
    minScale: Float = 1f,
    alignEnd: Boolean = false,
  ): Float {
    if (text.isEmpty()) return 0f
    val full = paint.measureText(text)
    if (full > maxWidth && minScale < 1f) {
      paint.textSize *= (maxWidth / full).coerceAtLeast(minScale)
    }
    val shown = TextUtils.ellipsize(text, paint, maxWidth, TextUtils.TruncateAt.END).toString()
    val width = paint.measureText(shown)
    canvas.drawText(shown, if (alignEnd) x - width else x, y, paint)
    return width
  }

  /** The text centred on `cx`, its baseline at `y`. */
  fun centred(text: String, cx: Float, y: Float, paint: TextPaint, maxWidth: Float = Float.MAX_VALUE) {
    val shown = TextUtils.ellipsize(text, paint, maxWidth, TextUtils.TruncateAt.END).toString()
    canvas.drawText(shown, cx - paint.measureText(shown) / 2, y, paint)
  }

  /**
   * A paint for one of the look's fills over a box: a colour, a radial gradient from its centre to
   * the farthest corner, or a linear one top to bottom; the Riso dots and Long Exposure's trails
   * are drawn flat in their ink.
   */
  fun fillPaint(fill: PostcardFill, rect: RectF): Paint {
    val paint = Paint(Paint.ANTI_ALIAS_FLAG)
    val colors = fill.stops.map { WidgetInk.color(it.first) }.toIntArray()
    val positions = fill.stops.map { it.second.coerceIn(0f, 1f) }.toFloatArray()
    when {
      colors.isEmpty() -> paint.color = 0
      colors.size == 1 || fill.kind == "solid" || fill.kind == "dots" || fill.kind == "stripes" -> paint.color = colors[0]
      fill.kind == "radial" -> {
        val cx = rect.left + fill.cx * rect.width()
        val cy = rect.top + fill.cy * rect.height()
        val dx = maxOf(fill.cx, 1 - fill.cx) * rect.width()
        val dy = maxOf(fill.cy, 1 - fill.cy) * rect.height()
        val radius = Math.hypot(dx.toDouble(), dy.toDouble()).toFloat().coerceAtLeast(0.1f)
        paint.shader = RadialGradient(cx, cy, radius, colors, positions, Shader.TileMode.CLAMP)
      }
      else -> paint.shader = LinearGradient(rect.left, rect.top, rect.left, rect.bottom, colors, positions, Shader.TileMode.CLAMP)
    }
    return paint
  }

  fun oval(rect: RectF, paint: Paint) {
    canvas.drawOval(rect, paint)
  }

  fun strokeOval(rect: RectF, width: Float, color: Int) {
    val inset = RectF(rect.left + width / 2, rect.top + width / 2, rect.right - width / 2, rect.bottom - width / 2)
    canvas.drawOval(inset, Paint(Paint.ANTI_ALIAS_FLAG).apply {
      style = Paint.Style.STROKE
      strokeWidth = width
      this.color = color
    })
  }

  /** A soft glow behind a shape, as CSS's blurred box shadow. */
  fun glow(rect: RectF, blur: Float, color: Int) {
    if (blur <= 0f) return
    val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      this.color = color
      maskFilter = BlurMaskFilter(blur, BlurMaskFilter.Blur.NORMAL)
    }
    canvas.drawOval(rect, paint)
  }

  /** A rectangle with its own top and bottom corner radii (a jar's glass). */
  fun jarPath(rect: RectF, top: Float, bottom: Float): Path =
    Path().apply {
      addRoundRect(rect, floatArrayOf(top, top, top, top, bottom, bottom, bottom, bottom), Path.Direction.CW)
    }

  fun path(path: Path, paint: Paint) {
    canvas.drawPath(path, paint)
  }

  fun strokePath(path: Path, width: Float, color: Int) {
    if (width <= 0f) return
    canvas.drawPath(path, Paint(Paint.ANTI_ALIAS_FLAG).apply {
      style = Paint.Style.STROKE
      strokeWidth = width
      this.color = color
    })
  }

  /** Draws inside a clip, then lifts it. */
  fun clipped(path: Path, draw: () -> Unit) {
    canvas.save()
    canvas.clipPath(path)
    draw()
    canvas.restore()
  }

  fun clipped(rect: RectF, draw: () -> Unit) {
    canvas.save()
    canvas.clipRect(rect)
    draw()
    canvas.restore()
  }

  fun rect(rect: RectF, paint: Paint) {
    canvas.drawRect(rect, paint)
  }

  fun dashedLine(x0: Float, y: Float, x1: Float, thickness: Float, color: Int, dash: Float, gap: Float) {
    canvas.drawLine(x0, y, x1, y, Paint(Paint.ANTI_ALIAS_FLAG).apply {
      style = Paint.Style.STROKE
      strokeWidth = thickness
      this.color = color
      pathEffect = DashPathEffect(floatArrayOf(dash, gap), 0f)
    })
  }

  /** Turns the canvas by degrees about a point while drawing. */
  fun rotated(degrees: Float, cx: Float, cy: Float, draw: () -> Unit) {
    canvas.save()
    canvas.rotate(degrees, cx, cy)
    draw()
    canvas.restore()
  }

  /** A glyph centred in a box, by its own drawn bounds rather than its line. */
  fun glyph(glyph: String, rect: RectF, paint: TextPaint) {
    if (glyph.isEmpty()) return
    val bounds = android.graphics.Rect()
    paint.getTextBounds(glyph, 0, glyph.length, bounds)
    canvas.drawText(glyph, rect.centerX() - bounds.exactCenterX(), rect.centerY() - bounds.exactCenterY(), paint)
  }
}
