package ai.sixpm.surfaces.widgets

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.service.quicksettings.Tile
import android.service.quicksettings.TileService

/**
 * The Quick Settings tiles, Android's form of the iPhone's controls: each opens 6pm at its screen
 * through the app's own link, from the shade, on a locked phone after the user unlocks it.
 */
abstract class OpenTile(private val route: String) : TileService() {
  override fun onStartListening() {
    qsTile?.apply {
      state = Tile.STATE_INACTIVE
      updateTile()
    }
  }

  @SuppressLint("StartActivityAndCollapseDeprecated")
  override fun onClick() {
    val go = {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
        startActivityAndCollapse(Widgets.open(this, 0, route))
      } else {
        @Suppress("DEPRECATION")
        startActivityAndCollapse(
          Intent(Intent.ACTION_VIEW, Uri.parse("${Widgets.scheme(this)}://$route"))
            .setPackage(packageName)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
        )
      }
    }
    if (isLocked) unlockAndRun(go) else go()
  }
}

/** Scan QR, from the Quick Settings shade. */
class ScanTile : OpenTile("scan")

/** Quick add, from the Quick Settings shade. */
class QuickAddTile : OpenTile("quick-add")
