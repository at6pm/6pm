package ai.sixpm.surfaces.widgets

import ai.sixpm.surfaces.SurfaceFiles
import android.content.Context
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId
import org.json.JSONObject

/** One of today's spends on the list widget, as the app wrote it. */
data class WidgetRow(
  val name: String,
  val amountText: String,
  /** The Material Symbols glyph itself (its private-use character). */
  val icon: String,
  val hue: Double,
  val pending: Boolean,
)

/** One stretch of the day the app wrote (`SurfaceSnapshot['entries']` in `@6pm/domain`). */
data class WidgetDay(
  val from: Instant,
  val safeText: String,
  val safeShort: String,
  val tomorrowText: String,
  val pendingText: String,
  val list: List<WidgetRow>,
  val moreText: String,
  val spentText: String?,
  val lineText: String?,
  val spentFraction: Double?,
  val moreAmountText: String?,
)

/**
 * What a widget draws at one moment: the stretch of the day it falls in, in that hour's colours.
 * Every word, number and colour was decided by the app; this only picks among them, as the
 * iPhone's timeline does.
 */
class WidgetMoment(
  val state: State,
  val day: WidgetDay?,
  private val tokens: Map<String, String>,
  private val strings: Map<String, String>,
  /** Drawn in the user's look (Max): the look's own ground and display face. */
  val inLook: Boolean,
  val serious: Boolean,
) {
  enum class State {
    /** The app has not set the month up, or has not written anything yet. */
    SET_UP,
    DAY,
    /** Past the last stretch the app wrote: the last number, and a nudge to open 6pm. */
    STALE,
  }

  fun token(name: String): String? = tokens[name]

  fun text(key: String): String = strings[key] ?: ""

  val displayFont: String?
    get() = strings["font.display"]

  /** The companion's mood this hour. */
  val mood: String
    get() = tokens["mood"] ?: "calm"

  companion object {
    /** The snapshot version this reader understands (`SURFACES_VERSION`). */
    private const val VERSION = 1

    /** How long the last stretch the app wrote is good for before it counts as out of date. */
    private const val LAST_STRETCH_MS = 24L * 60 * 60 * 1000

    fun at(context: Context, now: Instant = Instant.now()): WidgetMoment {
      val json =
        SurfaceFiles.readSurface(context, "snapshot")?.let { runCatching { JSONObject(it) }.getOrNull() }
      if (json == null || json.optInt("v") != VERSION) {
        return WidgetMoment(State.SET_UP, null, emptyMap(), emptyMap(), false, false)
      }
      val strings = stringMap(json.optJSONObject("strings"))
      val tokens = tokensAt(json, now)
      val inLook = !json.isNull("maxLook") && json.optString("maxLook").isNotEmpty()
      val serious = json.optBoolean("serious")
      val days = json.optJSONArray("entries")?.let { list -> (0 until list.length()).map { dayOf(list.getJSONObject(it)) } }
      if (days.isNullOrEmpty()) return WidgetMoment(State.SET_UP, null, tokens, strings, inLook, serious)
      val end = days.last().from.plusMillis(LAST_STRETCH_MS)
      val day = days.lastOrNull { !it.from.isAfter(now) } ?: days.first()
      val state = if (now.isBefore(end)) State.DAY else State.STALE
      return WidgetMoment(state, day, tokens, strings, inLook, serious)
    }

    private fun tokensAt(json: JSONObject, now: Instant): Map<String, String> {
      val palettes = json.optJSONArray("palettes") ?: return emptyMap()
      val hour = LocalDateTime.ofInstant(now, ZoneId.systemDefault()).hour
      var first: Map<String, String>? = null
      for (k in 0 until palettes.length()) {
        val palette = palettes.getJSONObject(k)
        val tokens = stringMap(palette.optJSONObject("tokens"))
        if (first == null) first = tokens
        if (palette.optInt("hour", -1) == hour) return tokens
      }
      return first ?: emptyMap()
    }

    private fun dayOf(json: JSONObject): WidgetDay {
      val rows = json.optJSONArray("list")
      return WidgetDay(
        from = runCatching { Instant.parse(json.getString("from")) }.getOrDefault(Instant.EPOCH),
        safeText = json.optString("safeText"),
        safeShort = json.optString("safeShort"),
        tomorrowText = json.optString("tomorrowText"),
        pendingText = json.optString("pendingText"),
        list =
          (0 until (rows?.length() ?: 0)).map { k ->
            val row = rows!!.getJSONObject(k)
            WidgetRow(
              name = row.optString("name"),
              amountText = row.optString("amountText"),
              icon = row.optString("icon"),
              hue = row.optDouble("hue", 80.0),
              pending = row.optBoolean("pending"),
            )
          },
        moreText = json.optString("moreText"),
        spentText = json.optStringOrNull("spentText"),
        lineText = json.optStringOrNull("lineText"),
        spentFraction = if (json.has("spentFraction")) json.optDouble("spentFraction") else null,
        moreAmountText = json.optStringOrNull("moreAmountText"),
      )
    }

    private fun JSONObject.optStringOrNull(key: String): String? =
      if (has(key) && !isNull(key)) optString(key) else null

    private fun stringMap(json: JSONObject?): Map<String, String> {
      if (json == null) return emptyMap()
      val out = HashMap<String, String>()
      for (key in json.keys()) out[key] = json.optString(key)
      return out
    }
  }
}
