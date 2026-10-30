import AppIntents
import Foundation

#if canImport(Surfaces)
  import UIKit
#endif

/// A screen of the app, opened through its own scheme (`sixpm://scan`, `sixpm-dev://` for 6pm
/// Dev). From inside the app a universal link would leave for Safari; the scheme stays here, and
/// the router reads it the same way whether the app was running or not.
enum AppScreen {
  @MainActor
  static func open(_ path: String) async {
    // Only the app links the Surfaces module. These intents open the app, so iOS runs them there;
    // the widget extension builds them only so its controls can name them.
    #if canImport(Surfaces)
      let scheme = GroupFiles.appBundleId.hasSuffix(".dev") ? "sixpm-dev" : "sixpm"
      guard let url = URL(string: "\(scheme)://\(path)") else { return }
      await UIApplication.shared.open(url)
    #endif
  }
}

/// "Scan QR in 6pm": opens Scan to pay. Built into the app and the widget extension, as a control
/// that opens its app must be: iOS brings the app forward, runs `perform()` there and is done.
struct OpenScanIntent: AppIntent {
  static let title = LocalizedStringResource("scan.title", table: "Intents")
  static let description = IntentDescription(
    LocalizedStringResource("scan.description", table: "Intents"))
  static var openAppWhenRun: Bool { true }

  @available(iOS 26.0, *)
  static var supportedModes: IntentModes { .foreground(.immediate) }

  @MainActor
  func perform() async throws -> some IntentResult {
    await AppScreen.open("scan")
    return .result()
  }
}

/// "Quick add in 6pm": opens Quick add, the same way.
struct OpenQuickAddIntent: AppIntent {
  static let title = LocalizedStringResource("quickAdd.title", table: "Intents")
  static let description = IntentDescription(
    LocalizedStringResource("quickAdd.description", table: "Intents"))
  static var openAppWhenRun: Bool { true }

  @available(iOS 26.0, *)
  static var supportedModes: IntentModes { .foreground(.immediate) }

  @MainActor
  func perform() async throws -> some IntentResult {
    await AppScreen.open("quick-add")
    return .result()
  }
}
