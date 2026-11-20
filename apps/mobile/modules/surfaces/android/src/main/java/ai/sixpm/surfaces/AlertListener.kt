package ai.sixpm.surfaces

import android.app.Notification
import android.content.ComponentName
import android.content.Context
import android.os.Bundle
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

  /**
   * Android binds the listener when access is switched on, after a restart and after it updates
   * the app, and hands over nothing that was posted in between. The bank alerts still in the
   * shade are read then, oldest first, as if each had just come: one already read is passed over.
   */
  override fun onListenerConnected() {
    bound = this
    readShade()
  }

  /** Android does not always bind a listener again by itself after it lets one go: it is asked to. */
  override fun onListenerDisconnected() {
    if (bound === this) bound = null
    rebind(applicationContext)
  }

  override fun onDestroy() {
    if (bound === this) bound = null
    super.onDestroy()
  }

  private fun readShade() {
    val context = applicationContext
    val waiting = runCatching { activeNotifications }.getOrNull() ?: return
    val since = System.currentTimeMillis() - CATCH_UP_MS
    for (sbn in waiting.sortedBy { it.postTime }) {
      val app = sbn.packageName
      if (app == packageName || sbn.postTime < since) continue
      if (watched?.contains(app) == false) continue
      reader.execute { handle(context, sbn) }
    }
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
     * Asks Android to bind the listener, while the person has it switched on. An update to the
     * app or a phone short of memory can leave it unbound with its switch still on; the app asks
     * each time it comes to the front, and the listener asks as it is let go.
     */
    fun rebind(context: Context) {
      if (!allowed(context)) return
      runCatching { NotificationListenerService.requestRebind(component(context)) }
    }

    /** The listener Android has bound in this process, if any. */
    @Volatile private var bound: AlertListener? = null

    /**
     * 6pm has come to the front: the listener is bound if it was not, and the bank alerts still
     * in the shade that it has not read are read now. An alert that could not be read when it
     * came (the reader was not up yet) is caught here.
     */
    fun catchUp(context: Context) {
      val listener = bound
      if (listener == null) rebind(context) else listener.readShade()
    }

    /** How far back the alerts still in the shade are read when the listener is bound. */
    private const val CATCH_UP_MS = 24 * 60 * 60 * 1000L

    /**
     * The notifications already read, by key and post time, kept on the phone so that they last
     * past the listener's own process: Android can hand one notification over twice, and the
     * shade is read again each time the listener is bound, and each is read once. An update to
     * a notification posts again with a new time and is read.
     */
    private const val SEEN_FILE = "alert-seen"
    private const val SEEN_KEY = "keys"
    private const val SEEN_KEPT = 64

    private fun seen(context: Context): List<String> =
      context.getSharedPreferences(SEEN_FILE, Context.MODE_PRIVATE)
        .getString(SEEN_KEY, "").orEmpty().split('\n').filter { it.isNotEmpty() }

    private fun remember(context: Context, key: String) {
      val kept = (seen(context) - key + key).takeLast(SEEN_KEPT)
      context.getSharedPreferences(SEEN_FILE, Context.MODE_PRIVATE)
        .edit().putString(SEEN_KEY, kept.joinToString("\n")).apply()
    }

    private fun handle(context: Context, sbn: StatusBarNotification) {
      val apps = watched ?: loadWatched(context) ?: return
      if (sbn.packageName !in apps) return
      val notification = sbn.notification ?: return
      val flags = notification.flags
      // A group's summary repeats its alerts; an ongoing one is a download or a call, not money.
      if (flags and Notification.FLAG_GROUP_SUMMARY != 0) return
      if (flags and Notification.FLAG_ONGOING_EVENT != 0) return
      val extras = notification.extras ?: return
      val title = (extras.getCharSequence(Notification.EXTRA_TITLE_BIG)
        ?: extras.getCharSequence(Notification.EXTRA_TITLE)
        ?: extras.getCharSequence(Notification.EXTRA_CONVERSATION_TITLE))?.toString()
      val subtitle = extras.getCharSequence(Notification.EXTRA_SUB_TEXT)?.toString()
      val body = bodyOf(notification, extras)
      if (body.isNullOrBlank()) return
      val key = "${sbn.key}@${sbn.postTime}"
      if (key in seen(context)) return
      // Remembered only once the reader has answered, so one it could not read is tried again.
      if (read(context, sbn.packageName, title, subtitle, body, sbn.postTime)) remember(context, key)
    }

    /**
     * The alert's words, wherever the bank's app put them: the expanded text, the one line, the
     * newest message of a chat-style notification, the lines of an inbox-style one, or the ticker.
     */
    private fun bodyOf(notification: Notification, extras: Bundle): String? {
      fun kept(text: CharSequence?): String? = text?.toString()?.takeIf { it.isNotBlank() }
      kept(extras.getCharSequence(Notification.EXTRA_BIG_TEXT))?.let { return it }
      kept(extras.getCharSequence(Notification.EXTRA_TEXT))?.let { return it }
      @Suppress("DEPRECATION")
      val messages = runCatching { extras.getParcelableArray(Notification.EXTRA_MESSAGES) }.getOrNull()
      val newest = messages?.lastOrNull() as? Bundle
      kept(newest?.getCharSequence("text"))?.let { return it }
      val lines = extras.getCharSequenceArray(Notification.EXTRA_TEXT_LINES)
      kept(lines?.joinToString("\n"))?.let { return it }
      return kept(notification.tickerText)
    }

    private fun read(
      context: Context,
      app: String,
      title: String?,
      subtitle: String?,
      body: String,
      postedAt: Long,
    ): Boolean {
      val now = System.currentTimeMillis()
      val args = JSONArray()
        .put(app)
        .put(title ?: "")
        .put(subtitle ?: "")
        .put(body)
        .put(Instants.iso(postedAt))
        .put(SurfaceFiles.readSurface(context, "context") ?: "")
        .put(Instants.iso(now))
      val answer = DomainSandbox.call(context, "logBankAlert", args) ?: return false
      val read = runCatching { JSONObject(answer) }.getOrNull() ?: return false
      val item = read.optJSONObject("item")
      val last = read.optJSONObject("last")
      val id = item?.optString("id").orEmpty()
      if (item != null && id.isNotEmpty()) {
        SurfaceFiles.writeInbox(context, id, item.toString())
        val bank = last?.optString("bank")?.takeIf { it.isNotEmpty() && it != "null" }
        val name = bank ?: item.optString("merchant").trim()
        // A payment that failed only voids the one it tells of: nothing was caught to say so.
        if (item.optString("what") != "failed") {
          val said =
            CaptureNotices.firstCatch(context, last?.optString("amountText").orEmpty(), name)
          if (!said) CaughtNotice.post(context, id, item, last)
        }
      }
      // While the capture log is on, an alert that moved no money leaves its words for the log
      // alone: no notice is posted and the app imports nothing else from it.
      val heard = read.optJSONObject("heard")
      val heardId = heard?.optString("id").orEmpty()
      if (heard != null && heardId.isNotEmpty()) {
        SurfaceFiles.writeInbox(context, heardId, heard.toString())
      }
      // One no template read that prints a number waits for the app's second reader, which
      // saves nothing from it unless it finds money that moved: no notice is posted for it.
      val unread = read.optJSONObject("unread")
      val unreadId = unread?.optString("id").orEmpty()
      if (unread != null && unreadId.isNotEmpty()) {
        SurfaceFiles.writeInbox(context, unreadId, unread.toString())
      }
      if (last != null) {
        SurfaceFiles.writeStatus(context, "last-alert", last.toString())
        // An alert read, caught or not, says the listener still runs.
        CaptureNotices.wayRan(context, "alert")
      }
      return true
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
