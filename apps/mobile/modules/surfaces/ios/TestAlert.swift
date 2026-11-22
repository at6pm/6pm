import Foundation
import UserNotifications

/// The test alert a person sends to themselves on the iPhone: a notification 6pm posts, worded
/// like a small payment and marked as a test. With 6pm among the apps on the Shortcuts
/// automation's trigger, the automation hands it to "Catch a bank alert" as it hands over a
/// bank's, and it comes into the inbox on the same road. When it arrives the person has seen the
/// automation run; when it does not, the automation is off or 6pm is not on its trigger.
///
/// A Shortcut passes only a notification's app and words, so the token it is known by is printed
/// in its words, and the app writes that token to the App Group a moment before posting: the
/// action takes a notification from 6pm for the test only when the two match (`ownTestToken` in
/// the domain bundle). It is never money.
enum TestAlert {
  /// The file the app leaves for the action: the token it is waiting for and when it was sent.
  static let surface = "test-alert"
  /// Every test alert's notification id starts with this, then its token.
  static let idPrefix = "test-alert:"

  /// Notes the token, then posts the notification with the app's words. `posted` when iOS took
  /// it; `off` when 6pm may not show notifications, so there is nothing for the automation to see.
  static func post(token: String, title: String, body: String) async -> String {
    let center = UNUserNotificationCenter.current()
    let settings = await center.notificationSettings()
    guard settings.authorizationStatus == .authorized || settings.authorizationStatus == .provisional
    else { return "off" }
    let clock = ISO8601DateFormatter()
    clock.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    let pending: [String: Any] = ["v": 1, "token": token, "at": clock.string(from: Date())]
    do {
      try GroupFiles.write(
        JSONSerialization.data(withJSONObject: pending),
        to: GroupFiles.folder("surfaces").appendingPathComponent("\(surface).json"))
    } catch {
      // Without the note the action could not know the alert: say it was not sent.
      return "off"
    }
    // One test alert at a time in Notification Centre: an earlier one is of no use to anyone.
    let earlier = await center.deliveredNotifications().map(\.request.identifier)
      .filter { $0.hasPrefix(idPrefix) }
    center.removeDeliveredNotifications(withIdentifiers: earlier)
    let content = UNMutableNotificationContent()
    content.title = title
    content.body = body
    content.sound = .default
    do {
      try await center.add(
        UNNotificationRequest(identifier: idPrefix + token, content: content, trigger: nil))
      return "posted"
    } catch {
      return "off"
    }
  }
}
