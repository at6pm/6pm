package ai.sixpm.surfaces

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import org.json.JSONObject
import java.util.UUID

/**
 * The quiet notification that says an alert was caught: "Caught 45.000₫ · Phở Hòa", from which
 * bank, read on this phone, with Confirm and Edit. Its words are the app's, in the app's
 * language, from the context the app last wrote; before the app has written one, nothing is
 * shown. It makes no sound: the bank's own alert already did.
 */
object CaughtNotice {
  private const val CHANNEL = "caught"
  private const val TAG = "caught"
  internal const val ACTION_CONFIRM = "ai.sixpm.surfaces.CONFIRM_CAUGHT"
  internal const val EXTRA_ID = "id"

  fun post(context: Context, id: String, item: JSONObject, last: JSONObject?) {
    if (!mayNotify(context)) return
    val strings = SurfaceFiles.readSurface(context, "context")
      ?.let { runCatching { JSONObject(it).optJSONObject("strings") }.getOrNull() }
      ?: return
    fun word(key: String) = strings.optString(key).takeIf { it.isNotEmpty() }
    val amount = last?.optString("amountText").orEmpty()
    val name = item.optString("merchant").trim()
    val bank = last?.optString("bank")?.takeIf { it.isNotEmpty() && it != "null" }
    val moneyIn = item.optString("direction") == "in"
    val titleKey = when {
      moneyIn && name.isNotEmpty() -> "alertCameIn"
      moneyIn -> "alertCameInNoName"
      name.isNotEmpty() -> "alertCaught"
      else -> "alertCaughtNoName"
    }
    val title = word(titleKey)?.replace("{amount}", amount)?.replace("{name}", name) ?: return
    val text = (if (bank != null) word("alertFrom")?.replace("{bank}", bank) else word("alertFromNoBank"))
    val confirm = word("alertConfirm") ?: return
    val edit = word("alertEdit") ?: return

    channel(context, word("alertChannel") ?: return)
    val open = openInbox(context, id)
    val notification = NotificationCompat.Builder(context, CHANNEL)
      .setSmallIcon(R.drawable.sixpm_caught)
      .setContentTitle(title)
      .apply { if (text != null) setContentText(text) }
      .setContentIntent(open)
      .setAutoCancel(true)
      .setOnlyAlertOnce(true)
      .setSilent(true)
      .setCategory(NotificationCompat.CATEGORY_STATUS)
      .setPriority(NotificationCompat.PRIORITY_LOW)
      .addAction(0, confirm, confirmIntent(context, id))
      .addAction(0, edit, open)
      .build()
    try {
      NotificationManagerCompat.from(context).notify(TAG, id.hashCode(), notification)
    } catch (_: SecurityException) {
      // Notifications were turned off between the check and the post.
    }
  }

  fun cancel(context: Context, id: String) {
    NotificationManagerCompat.from(context).cancel(TAG, id.hashCode())
  }

  private fun mayNotify(context: Context): Boolean {
    if (!NotificationManagerCompat.from(context).areNotificationsEnabled()) return false
    return Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU ||
      ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) ==
      PackageManager.PERMISSION_GRANTED
  }

  private fun channel(context: Context, name: String) {
    val manager = context.getSystemService(NotificationManager::class.java) ?: return
    manager.createNotificationChannel(
      NotificationChannel(CHANNEL, name, NotificationManager.IMPORTANCE_LOW).apply {
        setShowBadge(false)
      },
    )
  }

  /** The app's Inbox, where the caught payment waits for the close. */
  private fun openInbox(context: Context, id: String): PendingIntent {
    val scheme = if (context.packageName.endsWith(".dev")) "sixpm-dev" else "sixpm"
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("$scheme://inbox"))
      .setPackage(context.packageName)
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    return PendingIntent.getActivity(
      context,
      id.hashCode(),
      intent,
      PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
    )
  }

  private fun confirmIntent(context: Context, id: String): PendingIntent {
    val intent = Intent(context, CaughtActionReceiver::class.java)
      .setAction(ACTION_CONFIRM)
      .putExtra(EXTRA_ID, id)
    return PendingIntent.getBroadcast(
      context,
      id.hashCode(),
      intent,
      PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
    )
  }

  /**
   * Confirm: a note in the inbox that the payment is kept, which the app applies on its next open,
   * after the payment itself when both are still waiting.
   */
  internal fun confirm(context: Context, id: String) {
    cancel(context, id)
    val note = JSONObject()
      .put("v", 1)
      .put("id", UUID.randomUUID().toString())
      .put("kind", "kept")
      .put("spendId", id)
      .put("at", Instants.iso(System.currentTimeMillis()))
    SurfaceFiles.writeInbox(context, note.getString("id"), note.toString())
  }
}

/** Confirm, tapped on the caught notification without opening the app. */
class CaughtActionReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != CaughtNotice.ACTION_CONFIRM) return
    val id = intent.getStringExtra(CaughtNotice.EXTRA_ID) ?: return
    val pending = goAsync()
    Thread {
      try {
        CaughtNotice.confirm(context.applicationContext, id)
      } finally {
        pending.finish()
      }
    }.start()
  }
}
