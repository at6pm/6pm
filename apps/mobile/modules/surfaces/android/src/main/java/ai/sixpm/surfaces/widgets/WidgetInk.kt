package ai.sixpm.surfaces.widgets

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.graphics.Typeface
import java.io.File

/**
 * Colours and faces as the app wrote them into the snapshot: CSS colour strings from the look and
 * the font files the app ships in assets/fonts. Nothing here decides a colour; it only reads one.
 */
object WidgetInk {
  /** `#rgb`, `#rrggbb`, `#rrggbbaa` or `rgb(a)(r, g, b[, a])`; transparent when it cannot be read. */
  fun color(css: String?): Int {
    val text = css?.trim().orEmpty()
    if (text.startsWith("#")) {
      var hex = text.drop(1)
      if (hex.length == 3) hex = hex.map { "$it$it" }.joinToString("")
      val value = hex.toLongOrNull(16) ?: return Color.TRANSPARENT
      return when (hex.length) {
        6 -> (0xFF000000 or value).toInt()
        8 -> (((value and 0xFF) shl 24) or (value shr 8)).toInt()
        else -> Color.TRANSPARENT
      }
    }
    val open = text.indexOf('(')
    val close = text.lastIndexOf(')')
    if (open < 0 || close <= open) return Color.TRANSPARENT
    val parts = text.substring(open + 1, close).split(',').mapNotNull { it.trim().toDoubleOrNull() }
    if (parts.size < 3) return Color.TRANSPARENT
    val alpha = if (parts.size > 3) parts[3] else 1.0
    return Color.argb(
      (alpha * 255).toInt().coerceIn(0, 255),
      parts[0].toInt().coerceIn(0, 255),
      parts[1].toInt().coerceIn(0, 255),
      parts[2].toInt().coerceIn(0, 255),
    )
  }

  /** A colour at a fraction of its own opacity. */
  fun faded(color: Int, opacity: Double): Int =
    Color.argb((Color.alpha(color) * opacity).toInt().coerceIn(0, 255), Color.red(color), Color.green(color), Color.blue(color))

  /** The free widgets' night card, for a dark Home Screen (`PlainNight` in `@6pm/theme`). */
  object PlainNight {
    val sheetSolid = Color.rgb(33, 26, 42)
    val ink = Color.rgb(251, 244, 236)
    val accent = Color.rgb(255, 133, 82)
  }
}

/** The faces the widgets set their words in, made once per family and axes. */
class WidgetFaces(private val context: Context) {
  private val made = HashMap<String, Typeface>()

  /** The interface face: Be Vietnam Pro at the cut nearest the weight, as the app draws it here. */
  fun body(weight: Int): Typeface {
    val cut =
      when {
        weight >= 700 -> "BeVietnamPro-Bold"
        weight >= 600 -> "BeVietnamPro-SemiBold"
        weight >= 500 -> "BeVietnamPro-Medium"
        else -> "BeVietnamPro-Regular"
      }
    return file(cut, null) ?: Typeface.create(Typeface.DEFAULT, weight, false)
  }

  /**
   * The look's display face at a size and weight, as the app sets it: a variable face at that
   * weight with its optical size following the size; a static face as it is; Be Vietnam Pro for
   * the looks whose display face is the system's.
   */
  fun display(name: String?, size: Float, weight: Int): Typeface {
    val family = name ?: "BricolageGrotesque-Variable"
    if (family == SYSTEM_DISPLAY) return body(weight)
    val axes =
      if (family.endsWith("-Variable")) "'wght' $weight, 'opsz' ${size.coerceIn(12f, 96f)}" else null
    return file(family, axes) ?: body(weight)
  }

  /** Material Symbols Rounded, outlined or filled, at a size. */
  fun symbol(size: Float, filled: Boolean = false, weight: Int = 400): Typeface =
    file(
      "MaterialSymbolsRounded-Variable",
      "'FILL' ${if (filled) 1 else 0}, 'wght' $weight, 'opsz' ${size.coerceIn(20f, 48f)}",
    ) ?: Typeface.DEFAULT

  private fun file(family: String, axes: String?): Typeface? {
    val key = "$family|${axes.orEmpty()}"
    made[key]?.let { return it }
    val face =
      runCatching {
          val builder = Typeface.Builder(context.assets, "fonts/$family.ttf")
          if (axes != null) builder.setFontVariationSettings(axes)
          builder.build()
        }
        .getOrNull() ?: return null
    made[key] = face
    return face
  }

  companion object {
    /** The name the snapshot gives a look whose display face is the system's (Basic, Original). */
    const val SYSTEM_DISPLAY = "system"
  }
}

/** The companion the app drew for the surfaces (`companion-<mood>-<size>.png`). */
object WidgetCompanion {
  fun load(context: Context, mood: String, size: Int): Bitmap? =
    picture(context, mood, size) ?: picture(context, "calm", size)

  private fun picture(context: Context, mood: String, size: Int): Bitmap? {
    val file = File(File(File(context.noBackupFilesDir, "surfaces"), "surfaces"), "companion-$mood-$size.png")
    return if (file.isFile) BitmapFactory.decodeFile(file.path) else null
  }
}
