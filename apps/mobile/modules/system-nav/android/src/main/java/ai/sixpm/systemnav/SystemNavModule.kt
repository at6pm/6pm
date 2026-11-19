package ai.sixpm.systemnav

import android.os.Build
import android.view.View
import android.view.WindowInsetsController
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Android's navigation bar, which is drawn over the app's bottom edge. The system picks the
 * colour of Back, Home and the gesture handle, and of the veil it lays under the three buttons,
 * from one flag: without it a dark look gets dark buttons on a pale veil.
 */
class SystemNavModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("SystemNav")

    /** Light buttons for a dark screen, dark buttons for a light one. */
    Function("setLightButtons") { light: Boolean ->
      val activity = runCatching { appContext.currentActivity }.getOrNull() ?: return@Function
      activity.runOnUiThread {
        val window = activity.window
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
          val darkButtons = WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS
          window.insetsController?.setSystemBarsAppearance(if (light) 0 else darkButtons, darkButtons)
        } else {
          @Suppress("DEPRECATION")
          val flags = window.decorView.systemUiVisibility
          @Suppress("DEPRECATION")
          val darkButtons = View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
          @Suppress("DEPRECATION")
          window.decorView.systemUiVisibility =
            if (light) flags and darkButtons.inv() else flags or darkButtons
        }
      }
    }
  }
}
