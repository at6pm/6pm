package ai.sixpm.surfaces

import android.app.Notification
import android.content.ComponentName
import android.content.Context
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import androidx.core.app.NotificationManagerCompat
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.Executors

/**
 * Bank and wallet alerts, read on the phone: Android's counterpart of the iOS Shortcuts
 * automation that runs "Catch a bank alert". Android hands every notification to a listener the
 * person allowed under Notification access; this one reads only those from the bank and wallet
 * apps the domain catalogue names and lets every other app's go without looking at it.
 *
 * Each alert is read by the domain bundle, as on iOS. Money that moved is left in the inbox for
 * the app to save on its next open and said in a quiet notification; a code, a failed payment, a
 * promotion or a balance notice leaves nothing. Either way the last alert read is noted for
 * Settings.
 */
class AlertListener : NotificationListenerService() {
  override fun onNotificationPosted(sbn: StatusBarNotification) {
    val app = sbn.packageName
    if (app == packageName) return
    // Every other app's notification is let go before anything in it is looked at.
    if (watched?.contains(app) == false) return
    val context = applicationContext
    reader.execute { handle(context, sbn) }
  }

  companion object {
    /** One alert at a time, in the order they came, off the main thread. */
    private val reader = Executors.newSingleThreadExecutor()
    @Volatile private var watched: Set<String>? = null

    /** Whether the person has turned on 6pm under Notification access. */
    fun allowed(context: Context): Boolean =
      NotificationManagerCompat.getEnabledListenerPackages(context).contains(context.packageName)

    fun component(context: Context) = ComponentName(context, AlertListener::class.java)

    /**
     * The notifications already read, by key and post time: Android can hand one notification to
     * the listener twice (a second binding after the app is updated or access is switched again),
     * and it is read once. An update to a notification posts again with a new time and is read.
     */
    private val seen = object : LinkedHashMap<String, Unit>(SEEN_KEPT, 0.75f, false) {
      override fun removeEldestEntry(eldest: MutableMap.MutableEntry<String, Unit>?) =
        size > SEEN_KEPT
    }
    private const val SEEN_KEPT = 64

    private fun handle(context: Context, sbn: StatusBarNotification) {
      val apps = watched ?: loadWatched(context) ?: return
      if (sbn.packageName !in apps) return
      if (seen.put("${sbn.key}@${sbn.postTime}", Unit) != null) return
      val notification = sbn.notification ?: return
      val flags = notification.flags
      // A group's summary repeats its alerts; an ongoing one is a download or a call, not money.
      if (flags and Notification.FLAG_GROUP_SUMMARY != 0) return
      if (flags and Notification.FLAG_ONGOING_EVENT != 0) return
      val extras = notification.extras ?: return
      val title = (extras.getCharSequence(Notification.EXTRA_TITLE_BIG)
        ?: extras.getCharSequence(Notification.EXTRA_TITLE))?.toString()
      val subtitle = extras.getCharSequence(Notification.EXTRA_SUB_TEXT)?.toString()
      val body = (extras.getCharSequence(Notification.EXTRA_BIG_TEXT)
        ?: extras.getCharSequence(Notification.EXTRA_TEXT))?.toString()
      if (body.isNullOrBlank()) return
      read(context, sbn.packageName, title, subtitle, body, sbn.postTime)
    }

    private fun read(
      context: Context,
      app: String,
      title: String?,
      subtitle: String?,
      body: String,
      postedAt: Long,
    ) {
      val now = System.currentTimeMillis()
      val args = JSONArray()
        .put(app)
        .put(title ?: "")
        .put(subtitle ?: "")
        .put(body)
        .put(Instants.iso(postedAt))
        .put(SurfaceFiles.readSurface(context, "context") ?: "")
        .put(Instants.iso(now))
      val answer = DomainSandbox.call(context, "logBankAlert", args) ?: return
      val read = runCatching { JSONObject(answer) }.getOrNull() ?: return
      val item = read.optJSONObject("item")
      val last = read.optJSONObject("last")
      val id = item?.optString("id").orEmpty()
      if (item != null && id.isNotEmpty()) {
        SurfaceFiles.writeInbox(context, id, item.toString())
        CaughtNotice.post(context, id, item, last)
      }
      if (last != null) SurfaceFiles.writeStatus(context, "last-alert", last.toString())
    }

    /** The packages the catalogue names, asked of the domain bundle once per process. */
    private fun loadWatched(context: Context): Set<String>? {
      val answer = DomainSandbox.call(context, "alertApps", JSONArray()) ?: return null
      val list = runCatching { JSONArray(answer) }.getOrNull() ?: return null
      val apps = (0 until list.length()).map { list.getString(it) }.toSet()
      watched = apps
      return apps
    }
  }
}
