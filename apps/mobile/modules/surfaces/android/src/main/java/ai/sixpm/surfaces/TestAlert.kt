package ai.sixpm.surfaces

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.service.notification.StatusBarNotification
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat

/**
 * A test alert the person sends to themselves: a notification 6pm posts, worded like a small
 * payment and marked as a test, which the listener then reads on the road a bank alert takes
 * (the listener, the domain bundle, the inbox, the app's import). When it arrives the person has
 * seen that road work before a real payment comes; when it does not, some part of it is broken.
 *
 * The listener knows it by where it came from, never by its words: Android itself says which app
 * posted a notification and on which of that app's channels, so only 6pm can post one on 6pm's
 * test channel, and a bank cannot. It is never money: the inbox item it leaves is of a kind of
 * its own that carries only the token the app posted it with.
 */
object TestAlert {
  /** The channel only the test alert is posted on. */
  const val CHANNEL = "test-alert"
  const val TAG = "test-alert"
  /** The token the app gave it, so the screen that sent it knows its own when it arrives. */
  const val EXTRA_TOKEN = "ai.sixpm.surfaces.TEST_ALERT"
  /** It takes itself out of the shade: a test left there is of no use to anyone. */
  private const val SHOWN_MS = 60_000L

  /**
   * Whether a notification is 6pm's own test alert: posted by this app, on the test channel, with
   * the test's tag and a token. Every other notification of 6pm's (the close reminder, a caught
   * payment) is still let go unread.
   */
  fun recognises(
    ownPackage: String,
    fromPackage: String?,
    channel: String?,
    tag: String?,
    token: String?,
  ): Boolean =
    fromPackage == ownPackage && channel == CHANNEL && tag == TAG && !token.isNullOrBlank()

  /** The token of a notification that is the test alert, or null for any other. */
  fun tokenOf(ownPackage: String, sbn: StatusBarNotification): String? {
    val notification = sbn.notification ?: return null
    val token = notification.extras?.getString(EXTRA_TOKEN)
    val known = recognises(ownPackage, sbn.packageName, notification.channelId, sbn.tag, token)
    return if (known) token else null
  }

  /**
   * Posts the test alert with the app's words. `posted` when Android took it; `off` when 6pm may
   * not post notifications (its permission, or this channel, is switched off), so there is
   * nothing for the listener to read.
   */
  fun post(context: Context, token: String, title: String, body: String, channelName: String): String {
    val manager = context.getSystemService(NotificationManager::class.java) ?: return "off"
    if (!mayNotify(context)) return "off"
    manager.createNotificationChannel(
      NotificationChannel(CHANNEL, channelName, NotificationManager.IMPORTANCE_DEFAULT).apply {
        setShowBadge(false)
      },
    )
    if (manager.getNotificationChannel(CHANNEL)?.importance == NotificationManager.IMPORTANCE_NONE) {
      return "off"
    }
    val notification = NotificationCompat.Builder(context, CHANNEL)
      .setSmallIcon(R.drawable.sixpm_caught)
      .setContentTitle(title)
      .setContentText(body)
      .setStyle(NotificationCompat.BigTextStyle().bigText(body))
      .setContentIntent(openApp(context))
      .setAutoCancel(true)
      .setTimeoutAfter(SHOWN_MS)
      .setCategory(Notification.CATEGORY_STATUS)
      .addExtras(android.os.Bundle().apply { putString(EXTRA_TOKEN, token) })
      .build()
    return try {
      NotificationManagerCompat.from(context).notify(TAG, 0, notification)
      "posted"
    } catch (_: SecurityException) {
      // Notifications were turned off between the check and the post.
      "off"
    }
  }

  private fun mayNotify(context: Context): Boolean {
    if (!NotificationManagerCompat.from(context).areNotificationsEnabled()) return false
    return Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU ||
      ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) ==
      PackageManager.PERMISSION_GRANTED
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
