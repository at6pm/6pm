import AppIntents

/// What Siri, Spotlight and the Action button offer for the app's screens. The phrases here are
/// the English ones; `AppShortcuts.strings` says them in each language Siri speaks. The intents
/// are in `widgets/_shared`, which the app and the widget extension both build.
struct SixpmAppShortcuts: AppShortcutsProvider {
  static var appShortcuts: [AppShortcut] {
    AppShortcut(
      intent: OpenScanIntent(),
      phrases: [
        "Scan QR in \(.applicationName)",
        "Scan to pay in \(.applicationName)",
      ],
      shortTitle: LocalizedStringResource("scan.title", table: "Intents"),
      systemImageName: "qrcode.viewfinder"
    )
    AppShortcut(
      intent: OpenQuickAddIntent(),
      phrases: ["Quick add in \(.applicationName)"],
      shortTitle: LocalizedStringResource("quickAdd.title", table: "Intents"),
      systemImageName: "plus"
    )
  }
}
