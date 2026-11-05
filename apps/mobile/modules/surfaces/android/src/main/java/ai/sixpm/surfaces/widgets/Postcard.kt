package ai.sixpm.surfaces.widgets

import org.json.JSONArray
import org.json.JSONObject

/** One stretch's postcard, as the app worded it (`card` on a snapshot entry). */
data class PostcardCard(
  val phase: String,
  val hour: Double,
  val kicker: String,
  val kickerShort: String,
  val number: String,
  val sub: String,
  val subShort: String,
  val tonight: String,
  val used: Double,
  val sunX: Double,
  val sunY: Double,
  val sunXs: Double,
  val sunYs: Double,
  val sunKind: String,
  val closedAt: String?,
) {
  val closed: Boolean
    get() = phase == "closed"

  companion object {
    fun of(json: JSONObject?): PostcardCard? {
      if (json == null) return null
      val sun = json.optJSONObject("sun") ?: JSONObject()
      return PostcardCard(
        phase = json.optString("phase"),
        hour = json.optDouble("hour", 12.0),
        kicker = json.optString("kicker"),
        kickerShort = json.optString("kickerShort"),
        number = json.optString("number"),
        sub = json.optString("sub"),
        subShort = json.optString("subShort"),
        tonight = json.optString("tonight"),
        used = json.optDouble("used", 0.0),
        sunX = sun.optDouble("x", 0.5),
        sunY = sun.optDouble("y", 0.3),
        sunXs = sun.optDouble("xs", 0.5),
        sunYs = sun.optDouble("ys", 0.3),
        sunKind = json.optString("sunKind", "day"),
        closedAt = if (json.has("closedAt")) json.optString("closedAt") else null,
      )
    }
  }
}

/** One of the person's jars, as the app wrote it for the widgets. */
data class PostcardJar(
  val id: String,
  val name: String,
  val icon: String,
  val level: Double,
  val amountText: String,
  val ofText: String,
  val dayText: String,
  val countText: String,
  val countUnit: String,
  val fill: String,
  val fillTop: String,
  val lid: String,
  val glass: String,
  val iconLow: String,
  val iconHigh: String,
  val newYear: Boolean,
  val path: String,
)

/** A CSS fill the look gives a sun, a dot or a jar: its kind and its colour stops. */
data class PostcardFill(val kind: String, val stops: List<Pair<String, Float>>, val cx: Float, val cy: Float) {
  /** The colour a fill Android draws flat falls back to. */
  val first: String
    get() = stops.firstOrNull()?.first.orEmpty()
}

/** The look's widget materials, as much of them as Android draws (`widgetInks` in `@6pm/theme`). */
data class PostcardInk(
  val groundDay: String?,
  val groundNight: String?,
  val suns: Map<String, PostcardFill?>,
  val sunGlow: Map<String, String?>,
  val sunRing: String?,
  val dotFull: PostcardFill,
  val dotHalf: PostcardFill,
  val dotRing: String,
  val dotFullRing: String?,
  val jarLid: String?,
  val jarBody: PostcardFill?,
  val jarEdge: String?,
  val jarEdgeWidth: Float,
  val jarRadiusTop: Float,
  val jarRadiusBottom: Float,
  val jarFills: List<PostcardFill>,
  val jarIcon: Boolean,
  val displayWeight: Int,
  val numberMedium: Float,
  val numberSmall: Float,
  val numberTracking: Float,
  val mono: Boolean,
  val streakGround: String,
  val streakLine: String,
  val streakWord: String,
  val hatch: String,
  val today: String,
) {
  companion object {
    private fun fill(json: JSONObject?): PostcardFill? {
      if (json == null) return null
      val stops = json.optJSONArray("stops") ?: JSONArray()
      val center = json.optJSONArray("center")
      return PostcardFill(
        kind = json.optString("kind", "solid"),
        stops =
          (0 until stops.length()).map { k ->
            val stop = stops.getJSONArray(k)
            stop.optString(0) to stop.optDouble(1, 0.0).toFloat()
          },
        cx = center?.optDouble(0, 0.5)?.toFloat() ?: 0.5f,
        cy = center?.optDouble(1, 0.5)?.toFloat() ?: 0.5f,
      )
    }

    private fun JSONObject.stringOrNull(key: String): String? =
      if (has(key) && !isNull(key)) optString(key) else null

    fun of(json: JSONObject?): PostcardInk? {
      if (json == null) return null
      val ground = json.optJSONObject("ground")
      val suns = json.optJSONObject("suns") ?: JSONObject()
      val kinds = listOf("day", "noon", "dusk", "night")
      val dots = json.optJSONObject("dots") ?: JSONObject()
      val jar = json.optJSONObject("jar") ?: JSONObject()
      val edge = jar.optJSONObject("edge") ?: JSONObject()
      val fills = jar.optJSONArray("fills") ?: JSONArray()
      val empty = PostcardFill("solid", emptyList(), 0.5f, 0.5f)
      return PostcardInk(
        groundDay = ground?.optString("day"),
        groundNight = ground?.optString("night"),
        suns = kinds.associateWith { fill(suns.optJSONObject(it)?.optJSONObject("fill")) },
        sunGlow =
          kinds.associateWith { kind ->
            val shadows = suns.optJSONObject(kind)?.optJSONArray("shadows")
            // The widest glow, which carries the sun's light.
            (0 until (shadows?.length() ?: 0))
              .map { shadows!!.getJSONObject(it) }
              .maxByOrNull { it.optDouble("blur", 0.0) }
              ?.optString("color")
          },
        sunRing = json.optJSONObject("sunRing")?.optString("color"),
        dotFull = fill(dots.optJSONObject("full")) ?: empty,
        dotHalf = fill(dots.optJSONObject("half")) ?: empty,
        dotRing = dots.optString("ring"),
        dotFullRing = dots.optJSONObject("fullRing")?.optString("color"),
        jarLid = jar.stringOrNull("lid"),
        jarBody = fill(jar.optJSONObject("body")),
        jarEdge = edge.stringOrNull("color"),
        jarEdgeWidth = edge.optDouble("width", 1.0).toFloat(),
        jarRadiusTop = jar.optDouble("radiusTop", 10.0).toFloat(),
        jarRadiusBottom = jar.optDouble("radiusBottom", 12.0).toFloat(),
        jarFills = (0 until fills.length()).mapNotNull { fill(fills.getJSONObject(it)) },
        jarIcon = jar.optBoolean("icon", true),
        displayWeight = json.optInt("displayWeight", 500),
        numberMedium = json.optDouble("numberMedium", 44.0).toFloat(),
        numberSmall = json.optDouble("numberSmall", 40.0).toFloat(),
        numberTracking = json.optDouble("numberTracking", -0.03).toFloat(),
        mono = json.optBoolean("mono", true),
        streakGround = json.optString("streakGround"),
        streakLine = json.optString("streakLine"),
        streakWord = json.optString("streakWord"),
        hatch = json.optString("hatch"),
        today = json.optString("today"),
      )
    }
  }
}

/** The snapshot's postcard parts beside its entries: the jars, the streak, the month, the look. */
data class Postcards(
  val jars: List<PostcardJar>,
  val streakCount: Int,
  val streakBands: List<List<String>>,
  val streakOpen: Boolean,
  val monthTitle: String,
  val monthHeadline: String,
  val monthCells: List<String>,
  val ink: PostcardInk?,
  val hideAmounts: Boolean,
  val todayLink: String,
  val monthLink: String,
  val streakLink: String,
) {
  /** The jar a jar widget shows: the season's, else the first with a day, else the first. */
  val shownJar: PostcardJar?
    get() = jars.firstOrNull { it.newYear } ?: jars.firstOrNull { it.dayText.isNotEmpty() } ?: jars.firstOrNull()

  companion object {
    fun of(json: JSONObject): Postcards {
      val jars = json.optJSONArray("jars") ?: JSONArray()
      val streak = json.optJSONObject("streak")
      val bands = streak?.optJSONArray("bands") ?: JSONArray()
      val month = json.optJSONObject("month")
      val cells = month?.optJSONArray("cells") ?: JSONArray()
      val links = json.optJSONObject("links")
      return Postcards(
        jars =
          (0 until jars.length()).map { k ->
            val jar = jars.getJSONObject(k)
            PostcardJar(
              id = jar.optString("id"),
              name = jar.optString("name"),
              icon = jar.optString("icon"),
              level = jar.optDouble("level", 0.0),
              amountText = jar.optString("amountText"),
              ofText = jar.optString("ofText"),
              dayText = jar.optString("dayText"),
              countText = jar.optString("countText"),
              countUnit = jar.optString("countUnit"),
              fill = jar.optString("fill"),
              fillTop = jar.optString("fillTop"),
              lid = jar.optString("lid"),
              glass = jar.optString("glass"),
              iconLow = jar.optString("iconLow"),
              iconHigh = jar.optString("iconHigh"),
              newYear = jar.optBoolean("newYear"),
              path = jar.optString("path"),
            )
          },
        streakCount = streak?.optInt("count") ?: 0,
        streakBands =
          (0 until bands.length()).map { k ->
            val band = bands.getJSONArray(k)
            (0 until band.length()).map { band.optString(it) }
          },
        streakOpen = streak?.optBoolean("open") ?: false,
        monthTitle = month?.optString("title").orEmpty(),
        monthHeadline = month?.optString("headline").orEmpty(),
        monthCells = (0 until cells.length()).map { cells.optString(it) },
        ink = PostcardInk.of(json.optJSONObject("look")),
        hideAmounts = json.optBoolean("hideAmounts"),
        todayLink = links?.optString("today") ?: "/app",
        monthLink = links?.optString("month") ?: "/app",
        streakLink = links?.optString("streak") ?: "/app",
      )
    }
  }
}
