import AppIntents
import Foundation

/// Catches a bank or wallet alert: a Shortcuts automation on the user's banking apps' notifications
/// hands it the notification's title, subtitle, body and date. The domain bundle reads it on the
/// phone; money that moved is left in the App Group inbox for the app to import on its next open,
/// and a code, a failed payment, a promotion or a balance notice leaves nothing. Either way the
/// last alert read is noted for Settings. It never starts the app and returns at once: it runs
/// silently each time an alert arrives, saying something only for the first catch ever
/// (`CaptureNotices`).
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
    if let item = read.item {
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
  /// What was caught (nil for an alert that moved no money) and the last alert as noted.
  @discardableResult
  static func read(
    app: String?, title: String?, subtitle: String?, body: String, date: Date?, now: Date
  ) throws -> (item: [String: Any]?, last: [String: Any]?) {
    let context = GroupFiles.readSurface("context").flatMap { String(data: $0, encoding: .utf8) }
    let clock = ISO8601DateFormatter()
    clock.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    let answer = try DomainBridge().call(
      "logBankAlert",
      [
        app ?? "", title ?? "", subtitle ?? "", body, date.map { clock.string(from: $0) } ?? "",
        context ?? "", clock.string(from: now),
      ])
    guard
      let object = try JSONSerialization.jsonObject(with: Data(answer.utf8)) as? [String: Any]
    else { throw DomainBridge.Failure.threw("not an object") }

    var caught: [String: Any]?
    if let item = object["item"] as? [String: Any], let id = item["id"] as? String {
      try GroupFiles.writeInbox(id: id, json: JSONSerialization.data(withJSONObject: item))
      caught = item
    }
    let last = object["last"] as? [String: Any]
    if let last {
      try GroupFiles.writeStatus("last-alert", json: JSONSerialization.data(withJSONObject: last))
    }
    return (caught, last)
  }
}
