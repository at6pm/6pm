import SwiftUI
import UIKit
import WidgetKit

/// The snapshot the app writes for its widgets (`SurfaceSnapshot` in `@6pm/domain`). Every word,
/// number and colour in it was decided by the app; the fields added with the postcards are
/// optional, so a snapshot an older app wrote still decodes.
struct SurfaceSnapshot: Decodable {
  struct Row: Decodable {
    let name: String
    let amountText: String
    /// The Material Symbols glyph itself (its private-use character).
    let icon: String
    let hue: Double
    let pending: Bool
  }

  /// One stretch's postcard: the words and the sun the design gives that part of the day.
  struct Card: Decodable {
    struct Sun: Decodable {
      let x: Double
      let y: Double
      let xs: Double
      let ys: Double
    }

    let phase: String
    let hour: Double
    let kicker: String
    let kickerShort: String
    let number: String
    let amount: String
    let sub: String
    let subShort: String
    let inline: String
    let inlineHidden: String
    let lockSub: String
    let tonight: String
    let used: Double
    let sun: Sun
    let sunKind: String
    let closedAt: String?

    var closed: Bool { phase == "closed" }
  }

  struct Entry: Decodable {
    let from: String
    let safeText: String
    let safeShort: String
    let tomorrowText: String
    let pendingText: String
    let ringFraction: Double
    let list: [Row]
    let moreText: String
    let spentText: String?
    let lineText: String?
    let spentFraction: Double?
    let moreAmountText: String?
    let card: Card?
  }

  struct HourPalette: Decodable {
    let hour: Int
    let tokens: [String: String]
  }

  struct Jar: Decodable {
    let id: String
    let name: String
    let label: String
    let icon: String
    let level: Double
    let amountText: String
    let ofText: String
    let dayText: String
    let countText: String
    let countUnit: String
    let fill: String
    let fillTop: String
    let lid: String
    let glass: String
    let iconLow: String
    let iconHigh: String
    let newYear: Bool
    let path: String
  }

  struct Streak: Decodable {
    let count: Int
    let bands: [[String]]
    let open: Bool
  }

  struct Month: Decodable {
    let title: String
    let headline: String
    let cells: [String]
  }

  struct Links: Decodable {
    let today: String
    let month: String
    let streak: String
  }

  let v: Int
  let writtenAt: String
  let maxLook: String?
  let serious: Bool
  let entries: [Entry]
  let palettes: [HourPalette]
  let strings: [String: String]
  let hideAmounts: Bool?
  let jars: [Jar]?
  let streak: Streak?
  let month: Month?
  let look: PostcardLook?
  let links: Links?
  let pinnedAt: String?

  static let version = 1

  /// What the app last wrote, or nil before it has written a version this widget reads.
  static func load() -> SurfaceSnapshot? {
    guard let data = GroupFiles.readSurface("snapshot"),
      let snapshot = try? JSONDecoder().decode(SurfaceSnapshot.self, from: data),
      snapshot.v == version
    else { return nil }
    return snapshot
  }

  func text(_ key: String) -> String { strings[key] ?? "" }

  func tokens(hour: Int) -> [String: String] {
    palettes.first { $0.hour == hour }?.tokens ?? palettes.first?.tokens ?? [:]
  }

  func tokens(at date: Date) -> [String: String] {
    tokens(hour: Calendar.current.component(.hour, from: date))
  }
}

private let isoFormatter: ISO8601DateFormatter = {
  let formatter = ISO8601DateFormatter()
  formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
  return formatter
}()

func surfaceDate(_ iso: String) -> Date? {
  isoFormatter.date(from: iso) ?? ISO8601DateFormatter().date(from: iso)
}

/// One moment of a widget: the stretch of the day it shows, in that stretch's colours.
struct SurfaceEntry: TimelineEntry {
  enum State {
    /// The app has not set the month up (or not written anything yet).
    case setUp
    case day
    /// Past the last stretch the app wrote: the last number, and a nudge to open 6pm.
    case stale
  }

  let date: Date
  let state: State
  let snapshot: SurfaceSnapshot?
  let entry: SurfaceSnapshot.Entry?
  let tokens: [String: String]
  /// The jar a jar widget was set to show; nil for the season's jar or the first.
  var jarId: String? = nil

  func color(_ token: String) -> Color { Color(css: tokens[token]) }
  func text(_ key: String) -> String { snapshot?.text(key) ?? "" }
  var displayFont: String? { snapshot?.strings["font.display"] }
  var card: SurfaceSnapshot.Card? { entry?.card }
  var look: PostcardLook { snapshot?.look ?? .golden }
  /// The sky is dark this stretch: its ink is light.
  var dark: Bool { tokens["dark"] == "1" }
  var hideAmounts: Bool { snapshot?.hideAmounts == true }
  var hidden: String { snapshot?.strings["hidden"] ?? "•••" }

  /// The jar to draw: the one picked, else the season's, else the first with a day, else the first.
  var jar: SurfaceSnapshot.Jar? {
    let jars = snapshot?.jars ?? []
    if let jarId, let picked = jars.first(where: { $0.id == jarId }) { return picked }
    return jars.first { $0.newYear } ?? jars.first { !$0.dayText.isEmpty } ?? jars.first
  }

  func link(_ path: String?) -> URL? { path.flatMap(appLink) }
}

/// How long the last stretch the app wrote is good for before it counts as out of date.
private let lastStretch: TimeInterval = 24 * 60 * 60

/// The widgets' timeline: the stretches the app wrote (six a day: 07:00, 10:00, 13:00, 16:30, the
/// close and 21:00, for today and tomorrow), each drawn in its own hour's sky. The app writes a
/// new snapshot on every catch, which reloads it.
struct SurfaceTimelineProvider: TimelineProvider {
  func placeholder(in context: Context) -> SurfaceEntry {
    SurfaceEntry(date: .now, state: .setUp, snapshot: nil, entry: nil, tokens: [:])
  }

  func getSnapshot(in context: Context, completion: @escaping (SurfaceEntry) -> Void) {
    completion(Self.timeline(now: .now).entries.first ?? placeholder(in: context))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<SurfaceEntry>) -> Void) {
    completion(Self.timeline(now: .now))
  }

  /// The stretch's tokens: by the hour its postcard is drawn in, else by the clock.
  private static func tokens(_ snapshot: SurfaceSnapshot, _ entry: SurfaceSnapshot.Entry, at date: Date)
    -> [String: String]
  {
    if let hour = entry.card?.hour { return snapshot.tokens(hour: Int(hour)) }
    return snapshot.tokens(at: date)
  }

  static func timeline(now realNow: Date) -> Timeline<SurfaceEntry> {
    let loaded = SurfaceSnapshot.load()
    guard let snapshot = loaded, !snapshot.entries.isEmpty else {
      let entry = SurfaceEntry(
        date: realNow, state: .setUp, snapshot: loaded, entry: nil,
        tokens: loaded?.tokens(at: realNow) ?? [:])
      return Timeline(entries: [entry], policy: .never)
    }
    let starts = snapshot.entries.map { surfaceDate($0.from) ?? realNow }
    let end = (starts.last ?? realNow).addingTimeInterval(lastStretch)

    // 6pm Dev follows the clock the app was pinned to, so a design hour can be checked.
    if GroupFiles.appBundleId.hasSuffix(".dev"), let pinned = snapshot.pinnedAt.flatMap(surfaceDate) {
      let index = starts.lastIndex { $0 <= pinned } ?? 0
      let entry = snapshot.entries[index]
      return Timeline(
        entries: [
          SurfaceEntry(
            date: realNow, state: .day, snapshot: snapshot, entry: entry,
            tokens: tokens(snapshot, entry, at: pinned))
        ], policy: .never)
    }

    var dates: Set<Date> = [realNow, end]
    for start in starts where start > realNow && start < end { dates.insert(start) }
    let entries = dates.sorted().filter { $0 >= realNow }.map { date -> SurfaceEntry in
      let index = starts.lastIndex { $0 <= date } ?? 0
      let entry = snapshot.entries[index]
      return SurfaceEntry(
        date: date, state: date >= end ? .stale : .day, snapshot: snapshot, entry: entry,
        tokens: tokens(snapshot, entry, at: date))
    }
    return Timeline(entries: entries, policy: .after(end))
  }
}

/// The companion the app drew for the surfaces (`companion-<mood>-<size>.png` in the group).
enum CompanionImage {
  static func load(mood: String, size: Int) -> UIImage? {
    guard let folder = try? GroupFiles.folder("surfaces") else { return nil }
    return UIImage(contentsOfFile: folder.appendingPathComponent("companion-\(mood)-\(size).png").path)
  }
}

/// Where a widget's links go: the app's universal links (`/app/scan`, `/app/pot/<id>`).
func appLink(_ path: String) -> URL? {
  URL(string: "https://\(GroupFiles.host)\(path)")
}
