package ai.sixpm.surfaces

import android.content.ActivityNotFoundException
import android.content.ComponentName
import android.content.Intent
import android.net.Uri
import android.provider.Settings

/**
 * Where a person lets 6pm keep running, so the alert listener is not stopped while the phone
 * sleeps. Every phone has Android's battery optimisation list; the makers known to stop apps in
 * the background on top of that keep their own "Autostart" or "Background activity" page, tried
 * first on their phones. Nothing here asks for a permission: 6pm only opens the pages.
 */
object KeepRunning {
  /** One page to try. */
  sealed interface Page {
    /** A maker's own screen, by its package and activity. */
    data class Maker(val pkg: String, val activity: String) : Page

    /** Android's battery optimisation list. */
    data object BatteryList : Page

    /** 6pm's own page in the phone's app settings, with Battery under it. */
    data object AppDetails : Page
  }

  /** The makers' own pages, by what `Build.MANUFACTURER` says, lower case, in the order tried. */
  private val MAKER_PAGES: Map<String, List<Page.Maker>> =
    mapOf(
      "xiaomi" to
        listOf(
          Page.Maker(
            "com.miui.securitycenter",
            "com.miui.permcenter.autostart.AutoStartManagementActivity",
          )
        ),
      "oppo" to
        listOf(
          Page.Maker(
            "com.coloros.safecenter",
            "com.coloros.safecenter.permission.startup.StartupAppListActivity",
          ),
          Page.Maker(
            "com.coloros.safecenter",
            "com.coloros.safecenter.startupapp.StartupAppListActivity",
          ),
          Page.Maker("com.oppo.safe", "com.oppo.safe.permission.startup.StartupAppListActivity"),
        ),
      "vivo" to
        listOf(
          Page.Maker(
            "com.vivo.permissionmanager",
            "com.vivo.permissionmanager.activity.BgStartUpManagerActivity",
          ),
          Page.Maker("com.iqoo.secure", "com.iqoo.secure.ui.phoneoptimize.AddWhiteListActivity"),
        ),
      "huawei" to
        listOf(
          Page.Maker(
            "com.huawei.systemmanager",
            "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity",
          ),
          Page.Maker(
            "com.huawei.systemmanager",
            "com.huawei.systemmanager.optimize.process.ProtectActivity",
          ),
        ),
    )

  /** Brands sold under another maker's software. */
  private val SAME_AS =
    mapOf(
      "redmi" to "xiaomi",
      "poco" to "xiaomi",
      "realme" to "oppo",
      "iqoo" to "vivo",
      "honor" to "huawei",
    )

  /** The pages to try, in order: the maker's own ones, the battery list, then 6pm's own page. */
  fun pages(maker: String): List<Page> {
    val key = maker.trim().lowercase().let { SAME_AS[it] ?: it }
    return MAKER_PAGES[key].orEmpty() + Page.BatteryList + Page.AppDetails
  }

  /**
   * Opens the first page that opens and says which (its place in `pages`), or -1 when none did.
   * A page that is missing, or not open to other apps, throws: the next one is tried.
   */
  fun <T> open(pages: List<Page>, start: (Page) -> T): Int {
    pages.forEachIndexed { index, page ->
      try {
        start(page)
        return index
      } catch (_: ActivityNotFoundException) {
      } catch (_: SecurityException) {
      }
    }
    return -1
  }

  fun intentOf(page: Page, appPackage: String): Intent =
    when (page) {
      is Page.Maker -> Intent().setComponent(ComponentName(page.pkg, page.activity))
      Page.BatteryList -> Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
      Page.AppDetails ->
        Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.fromParts("package", appPackage, null))
    }
}
