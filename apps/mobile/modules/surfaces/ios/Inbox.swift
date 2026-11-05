import Foundation

/// The app's side of the inbox: what the extensions left, oldest first, and removing what was saved.
enum Inbox {
  /// A photo left with no capture beside it (the extension stopped between the two) is cleared
  /// once it is this old.
  static let strayPhotoAge: TimeInterval = 24 * 60 * 60

  /// Each capture's id and JSON, and the `file://` URI of the photo left beside it, if any.
  static func read() throws -> [[String: String]] {
    let folder = try GroupFiles.folder("inbox")
    let all = try FileManager.default.contentsOfDirectory(
      at: folder, includingPropertiesForKeys: [.creationDateKey], options: [.skipsHiddenFiles])
    let files = all.filter { $0.pathExtension == "json" }
    let ids = Set(files.map { $0.deletingPathExtension().lastPathComponent })
    clearStrayPhotos(all.filter { $0.pathExtension == "jpg" }, ids: ids)
    let dated = files.map { url in
      (url, (try? url.resourceValues(forKeys: [.creationDateKey]).creationDate) ?? .distantPast)
    }
    return dated.sorted { $0.1 < $1.1 }.compactMap { url, _ in
      guard let json = try? String(contentsOf: url, encoding: .utf8) else { return nil }
      let id = url.deletingPathExtension().lastPathComponent
      var file = ["id": id, "json": json]
      let photo = folder.appendingPathComponent("\(id).jpg")
      if FileManager.default.fileExists(atPath: photo.path) { file["photo"] = photo.absoluteString }
      return file
    }
  }

  /// Removes each capture and the photo left beside it.
  static func remove(_ ids: [String]) throws {
    let folder = try GroupFiles.folder("inbox")
    for id in ids where !id.contains("/") {
      for name in ["\(id).json", "\(id).jpg"] {
        let url = folder.appendingPathComponent(name)
        if FileManager.default.fileExists(atPath: url.path) {
          try FileManager.default.removeItem(at: url)
        }
      }
    }
  }

  private static func clearStrayPhotos(_ photos: [URL], ids: Set<String>) {
    let now = Date()
    for photo in photos where !ids.contains(photo.deletingPathExtension().lastPathComponent) {
      let made = (try? photo.resourceValues(forKeys: [.creationDateKey]).creationDate) ?? now
      if now.timeIntervalSince(made) > strayPhotoAge { try? FileManager.default.removeItem(at: photo) }
    }
  }
}
