package ai.sixpm.surfaces.widgets

import android.graphics.Bitmap
import android.graphics.Canvas
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

  /** A glyph centred in a box, by its own drawn bounds rather than its line. */
  fun glyph(glyph: String, rect: RectF, paint: TextPaint) {
    if (glyph.isEmpty()) return
    val bounds = android.graphics.Rect()
    paint.getTextBounds(glyph, 0, glyph.length, bounds)
    canvas.drawText(glyph, rect.centerX() - bounds.exactCenterX(), rect.centerY() - bounds.exactCenterY(), paint)
  }
}
