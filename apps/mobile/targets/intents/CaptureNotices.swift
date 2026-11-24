import Foundation
import UserNotifications

/// Capture's own notifications, said on the phone at the moment a catch lands: the first catch
/// ever ("Caught your first one: 1.000₫ · MB. That's all it takes."), once, and never between
/// 22:00 and 08:00. Its words come from the context the app last wrote, and only while the first
/// catch is still to come; without them nothing is said. While 6pm is open it shows the catch
/// itself and keeps this one off screen. A catch also moves the app's pending "Nothing from MB in
/// 3 days" for the way that caught to its third quiet day from now, since the way is plainly still
/// running: had it been taken away, a person who stops opening 6pm would never hear the way stop.
enum CaptureNotices {
  static let firstCatchId = "first-catch"
  private static let told = "first-catch-told"
  private static let quietFrom = 22
  private static let quietUntil = 8

  /// The way that caught (`alert`, `applePay`) is running: its pending question about going
  /// quiet waits for three more quiet days, at the hour the app chose for it (09:00), and never
  /// comes sooner than the app had placed it. Its words already say three days.
  static func wayRan(_ way: String) async {
    let id = "capture-quiet:\(way)"
    let center = UNUserNotificationCenter.current()
    let pending = await center.pendingNotificationRequests().first { $0.identifier == id }
    guard let pending, let placed = placedAt(pending) else { return }
    center.removePendingNotificationRequests(withIdentifiers: [id])
    let calendar = Calendar.current
    let hour = calendar.component(.hour, from: placed)
    let minute = calendar.component(.minute, from: placed)
    guard
      let third = calendar.date(
        byAdding: .day, value: quietAfterDays, to: calendar.startOfDay(for: Date())),
      let at = calendar.date(bySettingHour: hour, minute: minute, second: 0, of: third)
    else { return }
    let parts = calendar.dateComponents([.year, .month, .day, .hour, .minute], from: max(at, placed))
    try? await center.add(
      UNNotificationRequest(
        identifier: id, content: pending.content,
        trigger: UNCalendarNotificationTrigger(dateMatching: parts, repeats: false)))
  }

  /// When the app placed a pending question for: the date it carries in its data (`at`), else a
  /// calendar trigger's own date. An interval trigger's next date counts from now, not from when
  /// it was added, so it is never read.
  private static func placedAt(_ request: UNNotificationRequest) -> Date? {
    // A scheduled notification keeps the app's data as its userInfo; a pushed one under "body".
    let info = request.content.userInfo
    let data = (info["body"] as? [AnyHashable: Any]) ?? info
    if let text = data["at"] as? String {
      let clock = ISO8601DateFormatter()
      clock.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
      if let at = clock.date(from: text) { return at }
    }
    return (request.trigger as? UNCalendarNotificationTrigger)?.nextTriggerDate()
  }

  /// The quiet days after which the app asks about a way (`QUIET_WAY_AFTER_DAYS`).
  private static let quietAfterDays = 3

  /// The first catch, said once ever: `amountText` as the domain bundle wrote it, `name` the bank
  /// or the shop.
  static func firstCatch(amountText: String, name: String, now: Date) async {
    guard GroupFiles.readStatus(told) == nil,
      let data = GroupFiles.readSurface("context"),
      let object = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
      let strings = object["strings"] as? [String: Any],
      let named = strings["firstCatch"] as? String, !named.isEmpty,
      let noName = strings["firstCatchNoName"] as? String, !noName.isEmpty
    else { return }
    // Once ever, whether or not it can be said now: the next catch is no longer the first.
    let clock = ISO8601DateFormatter()
    clock.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    if let stamp = try? JSONSerialization.data(withJSONObject: ["at": clock.string(from: now)]) {
      try? GroupFiles.writeStatus(told, json: stamp)
    }
    let hour = Calendar.current.component(.hour, from: now)
    guard hour >= quietUntil && hour < quietFrom else { return }
    let center = UNUserNotificationCenter.current()
    let settings = await center.notificationSettings()
    guard settings.authorizationStatus == .authorized || settings.authorizationStatus == .provisional
    else { return }
    let content = UNMutableNotificationContent()
    content.body =
      name.isEmpty || amountText.isEmpty
      ? noName
      : named.replacingOccurrences(of: "{amount}", with: amountText)
        .replacingOccurrences(of: "{name}", with: name)
    content.sound = .default
    try? await center.add(
      UNNotificationRequest(identifier: firstCatchId, content: content, trigger: nil))
  }
}
