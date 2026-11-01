package ai.sixpm.fontinstance

import android.graphics.Typeface
import com.facebook.react.common.assets.ReactFontManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * A variable font set at fixed axes, made once and drawn by name. React Native applies a text
 * style's `fontVariationSettings` to the paint on every measure and draw, and before Android 14
 * each of those calls builds a new native typeface: a screen of variable type and icons then
 * allocates so fast the main thread stalls (an ANR on a tap). Here the typeface is built once from
 * the file in assets/fonts and registered with React Native's font manager under `name`, so the
 * text names it as a family and carries no axes.
 */
class FontInstanceModule : Module() {
  private val made = HashSet<String>()

  override fun definition() = ModuleDefinition {
    Name("FontInstance")

    /** Registers `family` at `axes` ("'opsz' 32, 'wght' 600") as `name`; false if the file can't be read. */
    Function("register") { name: String, family: String, axes: String ->
      synchronized(made) {
        if (name in made) return@Function true
        val assets = appContext.reactContext?.assets ?: return@Function false
        val typeface =
            try {
              Typeface.Builder(assets, "fonts/$family.ttf").setFontVariationSettings(axes).build()
            } catch (_: IllegalArgumentException) {
              null
            } ?: return@Function false
        ReactFontManager.getInstance().setTypeface(name, Typeface.NORMAL, typeface)
        made.add(name)
        true
      }
    }
  }
}
