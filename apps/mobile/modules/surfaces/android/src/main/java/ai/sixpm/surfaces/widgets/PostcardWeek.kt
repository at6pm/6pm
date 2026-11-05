package ai.sixpm.surfaces.widgets

import org.json.JSONArray
import org.json.JSONObject

/** This week as suns, as the app worded it (`week` on the snapshot). */
data class PostcardWeek(val title: String, val line: String, val letters: List<String>, val cells: List<String>) {
  companion object {
    fun of(json: JSONObject?): PostcardWeek? {
      if (json == null) return null
      val letters = json.optJSONArray("letters") ?: JSONArray()
      val cells = json.optJSONArray("cells") ?: JSONArray()
      return PostcardWeek(
        title = json.optString("title"),
        line = json.optString("line"),
        letters = (0 until letters.length()).map { letters.optString(it) },
        cells = (0 until cells.length()).map { cells.optString(it) },
      )
    }
  }
}

/** One line of today's receipt. */
data class ReceiptLine(val time: String, val name: String, val amount: String, val confirmed: Boolean)

/** Today's receipt, as the app printed it (`receipt` on the snapshot). */
data class PostcardReceipt(
  val day: String,
  val title: String,
  val number: String,
  val lines: List<ReceiptLine>,
  val earlier: String,
  val empty: String,
  val left: String,
  /** The paper's inks, by name (`sheet`, `ink`, `soft`, `rule`, `stamp`, `edge`). */
  val paper: Map<String, String>,
) {
  fun paper(name: String): Int = WidgetInk.color(paper[name])

  companion object {
    fun of(json: JSONObject?): PostcardReceipt? {
      if (json == null) return null
      val lines = json.optJSONArray("lines") ?: JSONArray()
      val paper = json.optJSONObject("paper") ?: JSONObject()
      return PostcardReceipt(
        day = json.optString("day"),
        title = json.optString("title"),
        number = json.optString("number"),
        lines =
          (0 until lines.length()).map { k ->
            val line = lines.getJSONObject(k)
            ReceiptLine(line.optString("time"), line.optString("name"), line.optString("amount"), line.optBoolean("confirmed", true))
          },
        earlier = json.optString("earlier"),
        empty = json.optString("empty"),
        left = json.optString("left"),
        paper = paper.keys().asSequence().associateWith { paper.optString(it) },
      )
    }
  }
}
