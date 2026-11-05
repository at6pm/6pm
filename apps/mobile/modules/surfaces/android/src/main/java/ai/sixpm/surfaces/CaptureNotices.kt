package ai.sixpm.surfaces

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.app.PendingIntent
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import expo.modules.notifications.service.NotificationsService
import org.json.JSONObject
import java.util.Calendar

/**
 * Capture's own notifications, said on the phone at the moment a catch lands, while 6pm is away:
 * the first catch ever ("Caught your first one: 1.000₫ · MB. That's all it takes."), in the
 * Capture channel the app names, once, and never between 22:00 and 08:00. Its words come from the
 * context the app last wrote, and only while the first catch is still to come; without them
 * nothing is said. A catch also takes away the app's pending "Nothing from MB in 3 days" for the
 * way that caught, since the way is plainly still running.
 */
object CaptureNotices {
  /** The Capture channel; the app makes it too, with the same id, for its scheduled ones. */
  private const val CHANNEL = "capture"
  private const val TAG = "first-catch"
  private const val TOLD = "first-catch-told"
  private const val QUIET_FROM = 22
  private const val QUIET_UNTIL = 8

  /** Whether 6pm is on screen: then it shows the catch itself. Set by the module's lifecycle. */
  @Volatile var appVisible = false

  /** The way that caught is running: its pending question about going quiet goes. */
  fun wayRan(context: Context, way: String) {
    try {
      NotificationsService.removeScheduledNotification(context, "capture-quiet:$way")
    } catch (_: Throwable) {
      // No notifications module in this build: nothing was scheduled to take away.
    }
  }

  /**
   * The first catch, said once ever. True when it was said, so the quiet caught notification
   * is left out for the same payment.
   */
  fun firstCatch(context: Context, amountText: String, name: String): Boolean {
    if (SurfaceFiles.readStatus(context, TOLD) != null) return false
    val strings = SurfaceFiles.readSurface(context, "context")
      ?.let { runCatching { JSONObject(it).optJSONObject("strings") }.getOrNull() }
      ?: return false
    val named = strings.optString("firstCatch").takeIf { it.isNotEmpty() } ?: return false
    val noName = strings.optString("firstCatchNoName").takeIf { it.isNotEmpty() } ?: return false
    val channelName = strings.optString("captureChannel").takeIf { it.isNotEmpty() } ?: return false
    // Once ever, whether or not it can be said now: the next catch is no longer the first.
    SurfaceFiles.writeStatus(
      context,
      TOLD,
      JSONObject().put("at", Instants.iso(System.currentTimeMillis())).toString(),
    )
    if (appVisible) return false
    val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
    if (hour >= QUIET_FROM || hour < QUIET_UNTIL) return false
    if (!NotificationManagerCompat.from(context).areNotificationsEnabled()) return false
    val text = if (name.isEmpty() || amountText.isEmpty()) noName
    else named.replace("{amount}", amountText).replace("{name}", name)

    val manager = context.getSystemService(NotificationManager::class.java) ?: return false
    manager.createNotificationChannel(
      NotificationChannel(CHANNEL, channelName, NotificationManager.IMPORTANCE_DEFAULT),
    )
    val notification = NotificationCompat.Builder(context, CHANNEL)
      .setSmallIcon(R.drawable.sixpm_caught)
      .setContentText(text)
      .setStyle(NotificationCompat.BigTextStyle().bigText(text))
      .setContentIntent(openApp(context))
      .setAutoCancel(true)
      .setCategory(NotificationCompat.CATEGORY_STATUS)
      .build()
    return try {
      NotificationManagerCompat.from(context).notify(TAG, 0, notification)
      true
    } catch (_: SecurityException) {
      // Notifications were turned off between the check and the post.
      false
    }
  }

  private fun openApp(context: Context): PendingIntent {
    val scheme = if (context.packageName.endsWith(".dev")) "sixpm-dev" else "sixpm"
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("$scheme://"))
      .setPackage(context.packageName)
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    return PendingIntent.getActivity(
      context,
      TAG.hashCode(),
      intent,
      PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
    )
  }
}
