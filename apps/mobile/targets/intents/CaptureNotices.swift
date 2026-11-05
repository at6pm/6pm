import Foundation
import UserNotifications

/// Capture's own notifications, said on the phone at the moment a catch lands: the first catch
/// ever ("Caught your first one: 1.000₫ · MB. That's all it takes."), once, and never between
/// 22:00 and 08:00. Its words come from the context the app last wrote, and only while the first
/// catch is still to come; without them nothing is said. While 6pm is open it shows the catch
/// itself and keeps this one off screen. A catch also takes away the app's pending "Nothing from
/// MB in 3 days" for the way that caught, since the way is plainly still running.
enum CaptureNotices {
  static let firstCatchId = "first-catch"
  private static let told = "first-catch-told"
  private static let quietFrom = 22
  private static let quietUntil = 8

  /// The way that caught (`alert`, `applePay`) is running: its pending question about going quiet goes.
  static func wayRan(_ way: String) {
    UNUserNotificationCenter.current().removePendingNotificationRequests(
      withIdentifiers: ["capture-quiet:\(way)"])
  }

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
