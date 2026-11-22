import AppIntents
import Foundation

/// Catches a bank or wallet alert: a Shortcuts automation on the user's banking apps' notifications
/// hands it the notification's app, title, subtitle, body and date. The domain bundle looks at the
/// app first and reads the words only of a bank or wallet it knows: money that moved is left in the
/// App Group inbox for the app to import on its next open, and a code, a failed payment, a
/// promotion or a balance notice leaves nothing but the note of the last alert read, for Settings.
/// Any other app on the automation's trigger (a chat, a shop) leaves nothing at all. 6pm's own
/// notification is taken only when it is the test alert the app is waiting for, which leaves an
/// inbox item that is never money. It never starts the app and returns at once: it runs silently
/// each time an alert arrives, saying something only for the first catch ever (`CaptureNotices`).
struct CatchBankAlertIntent: AppIntent {
  static let title = LocalizedStringResource("catchAlert.title", table: "Intents")
  static let description = IntentDescription(
    LocalizedStringResource("catchAlert.description", table: "Intents"))
  static let openAppWhenRun = false

  @Parameter(title: LocalizedStringResource("catchAlert.alertTitle", table: "Intents"))
  var alertTitle: String?

  @Parameter(title: LocalizedStringResource("catchAlert.subtitle", table: "Intents"))
  var subtitle: String?

  @Parameter(title: LocalizedStringResource("catchAlert.body", table: "Intents"))
  var body: String

  @Parameter(title: LocalizedStringResource("catchAlert.date", table: "Intents"))
  var date: Date?

  @Parameter(title: LocalizedStringResource("catchAlert.app", table: "Intents"))
  var app: String?

  func perform() async throws -> some IntentResult {
    // An alert that cannot be read is let go: an automation that fails shows the user an error.
    let now = Date()
    guard
      let read = try? CaughtAlert.read(
        app: app, title: alertTitle, subtitle: subtitle, body: body, date: date, now: now)
    else { return .result() }
    // Read at all, the automation still runs: no "Nothing from your bank in 3 days".
    if read.last != nil { CaptureNotices.wayRan("alert") }
    // A payment that failed only voids the one it tells of: nothing was caught to say so.
    if let item = read.item, item["what"] as? String != "failed" {
      let bank = (read.last?["bank"] as? String).flatMap { $0.isEmpty ? nil : $0 }
      let name = bank ?? (item["merchant"] as? String ?? "")
      await CaptureNotices.firstCatch(
        amountText: read.last?["amountText"] as? String ?? "",
        name: name.trimmingCharacters(in: .whitespaces), now: now)
    }
    return .result()
  }
}

/// What the domain bundle made of one alert, written where the app finds it.
enum CaughtAlert {
  /// What 6pm answers to on this phone when an automation names the app a notification came
  /// from: the name under its icon and its bundle id. The extension reads them from the app it
  /// sits in.
  static let ownNames: [String] = {
    let appURL = Bundle.main.bundleURL.deletingLastPathComponent().deletingLastPathComponent()
    let app = Bundle.main.bundleURL.pathExtension == "appex" ? Bundle(url: appURL) : Bundle.main
    let keys = ["CFBundleDisplayName", "CFBundleName"]
    let shown = keys.compactMap { app?.object(forInfoDictionaryKey: $0) as? String }
    let plain = keys.compactMap { app?.infoDictionary?[$0] as? String }
    return Array(Set(shown + plain + [GroupFiles.appBundleId])).filter { !$0.isEmpty }
  }()

  /// What was caught (nil for an alert that moved no money) and the last alert as noted (nil for
  /// an alert that was not a bank's or wallet's: nothing of that one is written anywhere).
  @discardableResult
  static func read(
    app: String?, title: String?, subtitle: String?, body: String, date: Date?, now: Date
  ) throws -> (item: [String: Any]?, last: [String: Any]?) {
    let text = { (name: String) in
      GroupFiles.readSurface(name).flatMap { String(data: $0, encoding: .utf8) } ?? ""
    }
    let clock = ISO8601DateFormatter()
    clock.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    let own = String(data: try JSONSerialization.data(withJSONObject: ownNames), encoding: .utf8)
    // The sender is looked at before the words: the bundle answers with nothing at all for an app
    // that is neither a bank or wallet it knows nor 6pm sending the test it is waiting for.
    let answer = try DomainBridge().call(
      "logShortcutAlert",
      [
        app ?? "", title ?? "", subtitle ?? "", body, date.map { clock.string(from: $0) } ?? "",
        text("context"), clock.string(from: now), own ?? "[]", text("test-alert"),
      ])
    guard
      let object = try JSONSerialization.jsonObject(with: Data(answer.utf8)) as? [String: Any]
    else { throw DomainBridge.Failure.threw("not an object") }

    // The test alert the person sent themselves takes the road a bank's alert does, as an item
    // of its own kind: the app tells the screen that sent it and saves nothing.
    if let test = object["test"] as? [String: Any], let id = test["id"] as? String {
      try GroupFiles.writeInbox(id: id, json: JSONSerialization.data(withJSONObject: test))
    }

    var caught: [String: Any]?
    if let item = object["item"] as? [String: Any], let id = item["id"] as? String {
      try GroupFiles.writeInbox(id: id, json: JSONSerialization.data(withJSONObject: item))
      caught = item
    }
    // While the capture log is on, an alert that moved no money leaves its words for the log
    // alone: the app imports nothing else from it.
    if let heard = object["heard"] as? [String: Any], let id = heard["id"] as? String {
      try GroupFiles.writeInbox(id: id, json: JSONSerialization.data(withJSONObject: heard))
    }
    // One no template read that prints a number waits for the app's second reader, which saves
    // nothing from it unless it finds money that moved.
    if let unread = object["unread"] as? [String: Any], let id = unread["id"] as? String {
      try GroupFiles.writeInbox(id: id, json: JSONSerialization.data(withJSONObject: unread))
    }
    let last = object["last"] as? [String: Any]
    if let last {
      try GroupFiles.writeStatus("last-alert", json: JSONSerialization.data(withJSONObject: last))
    }
    return (caught, last)
  }
}
