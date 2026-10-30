package ai.sixpm.surfaces

import android.content.Context
import androidx.javascriptengine.JavaScriptIsolate
import androidx.javascriptengine.JavaScriptSandbox
import org.json.JSONArray
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledFuture
import java.util.concurrent.TimeUnit

/**
 * `@6pm/domain`'s native entry, the bundle the iOS extensions run in JavaScriptCore, run here in
 * Android's JavaScript sandbox (a V8 isolate in WebView's process). Every call takes strings and
 * gives back a JSON string, so Kotlin never does money maths and never formats a number. The
 * sandbox is started on first use and closed after a minute with nothing to read. Calls block, so
 * they are made off the main thread, one at a time.
 */
object DomainSandbox {
  /** The `NATIVE_API_VERSION` this Kotlin was written against. */
  private const val API_VERSION = 4
  private const val CALL_TIMEOUT_S = 10L
  private const val IDLE_CLOSE_S = 60L

  private val idle = Executors.newSingleThreadScheduledExecutor()
  private var sandbox: JavaScriptSandbox? = null
  private var isolate: JavaScriptIsolate? = null
  private var closing: ScheduledFuture<*>? = null

  /** Whether this phone's WebView can run the sandbox at all. */
  fun supported(): Boolean = runCatching { JavaScriptSandbox.isSupported() }.getOrDefault(false)

  /** Calls `SixpmDomain.<name>(...args)` and returns what it answered, or null when it could not run. */
  @Synchronized
  fun call(context: Context, name: String, args: JSONArray): String? {
    closing?.cancel(false)
    closing = idle.schedule({ close() }, IDLE_CLOSE_S, TimeUnit.SECONDS)
    return runCatching {
      val running = isolate ?: open(context)
      val code = "SixpmDomain.${name}.apply(null, ${args})"
      running.evaluateJavaScriptAsync(code).get(CALL_TIMEOUT_S, TimeUnit.SECONDS)
    }.onFailure { close() }.getOrNull()
  }

  private fun open(context: Context): JavaScriptIsolate {
    val started =
      JavaScriptSandbox.createConnectedInstanceAsync(context.applicationContext)
        .get(CALL_TIMEOUT_S, TimeUnit.SECONDS)
    sandbox = started
    val made = started.createIsolate()
    isolate = made
    val bundle = context.assets.open("domain-native.js").bufferedReader().use { it.readText() }
    val version =
      made.evaluateJavaScriptAsync("$bundle\n;String(SixpmDomain.NATIVE_API_VERSION)")
        .get(CALL_TIMEOUT_S, TimeUnit.SECONDS)
    check(version == API_VERSION.toString()) { "domain bundle is version $version" }
    return made
  }

  @Synchronized
  private fun close() {
    closing?.cancel(false)
    closing = null
    runCatching { isolate?.close() }
    runCatching { sandbox?.close() }
    isolate = null
    sandbox = null
  }
}
