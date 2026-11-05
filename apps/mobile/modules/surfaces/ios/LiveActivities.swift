import ActivityKit
import ExpoModulesCore
import Foundation

/// When an activity starts and goes stale, and what it says as it arrives: the close is asked for
/// ahead of six and starts itself then.
struct ActivityTiming: Record {
  @Field var startAt: String? = nil
  @Field var staleAt: String? = nil
  @Field var alertTitle: String? = nil
  @Field var alertBody: String? = nil
}

/// Starting, updating and ending the Live Activity. The app decides when; this only does it.
enum LiveActivities {
  static let kinds: Set<String> = ["pendingPay", "travel", "close"]

  static var enabled: Bool { ActivityAuthorizationInfo().areActivitiesEnabled }

  static func list() -> [[String: String]] {
    Activity<SurfaceAttributes>.activities.map { activity in
      [
        "id": activity.id,
        "kind": activity.attributes.kind,
        "key": activity.attributes.key,
        "stateJson": activity.content.state.json,
      ]
    }
  }

  private static let iso: ISO8601DateFormatter = {
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    return formatter
  }()

  private static func date(_ text: String?) -> Date? {
    guard let text else { return nil }
    return iso.date(from: text) ?? ISO8601DateFormatter().date(from: text)
  }

  /// Starts an activity while the app is in the foreground, or from iOS 26 asks iOS to start it at
  /// `startAt` by itself; nil when iOS refuses one (or cannot schedule it on this iOS).
  static func start(kind: String, key: String, stateJson: String, timing: ActivityTiming?) -> String?
  {
    guard kinds.contains(kind), enabled else { return nil }
    let content = ActivityContent(
      state: SurfaceAttributes.ContentState(json: stateJson), staleDate: date(timing?.staleAt))
    let attributes = SurfaceAttributes(kind: kind, key: key)
    if let startAt = date(timing?.startAt), startAt > Date() {
      guard #available(iOS 26.0, *) else { return nil }
      let alert = AlertConfiguration(
        title: LocalizedStringResource(stringLiteral: timing?.alertTitle ?? ""),
        body: LocalizedStringResource(stringLiteral: timing?.alertBody ?? ""),
        sound: .default)
      return try? Activity.request(
        attributes: attributes, content: content, pushType: nil, style: .standard,
        alertConfiguration: alert, start: startAt
      ).id
    }
    return try? Activity.request(attributes: attributes, content: content, pushType: nil).id
  }

  static func update(id: String, stateJson: String) async {
    guard let activity = find(id) else { return }
    await activity.update(
      ActivityContent(
        state: SurfaceAttributes.ContentState(json: stateJson), staleDate: activity.content.staleDate))
  }

  static func end(id: String, finalStateJson: String?) async {
    guard let activity = find(id) else { return }
    let content = finalStateJson.map {
      ActivityContent(state: SurfaceAttributes.ContentState(json: $0), staleDate: nil)
    }
    await activity.end(content, dismissalPolicy: content == nil ? .immediate : .default)
  }

  private static func find(_ id: String) -> Activity<SurfaceAttributes>? {
    Activity<SurfaceAttributes>.activities.first { $0.id == id }
  }
}
