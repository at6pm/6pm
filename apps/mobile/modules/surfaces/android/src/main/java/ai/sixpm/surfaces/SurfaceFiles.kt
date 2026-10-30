package ai.sixpm.surfaces

import android.content.Context
import java.io.File

/**
 * The files the app and its background pieces hand each other, as the App Group holds them on
 * iOS: `inbox` (captures waiting to be saved), `status` (what the alert reader saw last) and
 * `surfaces` (what the app wrote for them to read). Nothing here is a database and nothing holds
 * a lock: every file is written whole and renamed into place. They live in the app's no-backup
 * folder, so a phone backup never carries them.
 */
object SurfaceFiles {
  private val SURFACE_NAMES = setOf("snapshot", "context")
  private val STATUS_NAMES = setOf("last-alert")

  private fun folder(context: Context, name: String): File =
    File(File(context.noBackupFilesDir, "surfaces"), name).apply { mkdirs() }

  /** Writes the whole file to a temporary name and renames it into place. */
  private fun write(file: File, text: String) {
    val partial = File(file.parentFile, ".${file.name}.partial")
    partial.writeText(text)
    if (!partial.renameTo(file)) {
      partial.delete()
      throw IllegalStateException("could not write ${file.name}")
    }
  }

  private fun safeId(id: String): Boolean = id.isNotEmpty() && id.none { it == '/' || it == '\\' }

  fun writeSurface(context: Context, name: String, json: String) {
    if (name !in SURFACE_NAMES) return
    write(File(folder(context, "surfaces"), "$name.json"), json)
  }

  fun writeSurfaceImage(context: Context, name: String, png: ByteArray) {
    if (!name.all { it.isLetterOrDigit() || it == '-' }) return
    val file = File(folder(context, "surfaces"), "$name.png")
    val partial = File(file.parentFile, ".${file.name}.partial")
    partial.writeBytes(png)
    if (!partial.renameTo(file)) partial.delete()
  }

  /** What the app wrote for the background pieces (`snapshot`, `context`), if anything yet. */
  fun readSurface(context: Context, name: String): String? {
    if (name !in SURFACE_NAMES) return null
    return File(folder(context, "surfaces"), "$name.json").takeIf { it.isFile }?.readText()
  }

  /** Leaves one capture for the app to import. The background pieces only ever write here. */
  fun writeInbox(context: Context, id: String, json: String) {
    if (!safeId(id)) return
    write(File(folder(context, "inbox"), "$id.json"), json)
  }

  /** What is waiting, oldest first. */
  fun readInbox(context: Context): List<Map<String, String>> =
    (folder(context, "inbox").listFiles() ?: emptyArray())
      .filter { it.isFile && it.name.endsWith(".json") && !it.name.startsWith(".") }
      .sortedBy { it.lastModified() }
      .mapNotNull { file ->
        runCatching { mapOf("id" to file.name.removeSuffix(".json"), "json" to file.readText()) }
          .getOrNull()
      }

  fun removeInbox(context: Context, ids: List<String>) {
    val inbox = folder(context, "inbox")
    for (id in ids) if (safeId(id)) File(inbox, "$id.json").delete()
  }

  /** Leaves a status for the app to show; the newest replaces the one before. */
  fun writeStatus(context: Context, name: String, json: String) {
    if (name !in STATUS_NAMES) return
    write(File(folder(context, "status"), "$name.json"), json)
  }

  fun readStatus(context: Context, name: String): String? {
    if (name !in STATUS_NAMES) return null
    return File(folder(context, "status"), "$name.json").takeIf { it.isFile }?.readText()
  }
}
