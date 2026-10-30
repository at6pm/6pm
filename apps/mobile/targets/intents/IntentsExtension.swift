import AppIntents
import ExtensionFoundation

@main
struct IntentsExtension: AppIntentsExtension {}

/// What Siri, Spotlight and the Action button offer without setting anything up. The phrases here
/// are the English ones; `AppShortcuts.strings` (generated from `@6pm/i18n`) says them in each
/// language Siri speaks. Siri has no Vietnamese or Indonesian, so there they stay English; the
/// titles follow the phone's language everywhere. Before
/// iOS 17.4 the shortcuts cannot say which iOS each needs, so there they are left to the Shortcuts
/// app, where "Log in 6pm" is still listed for the Wallet automation.
@available(iOS 17.4, *)
struct SixpmShortcuts: AppShortcutsProvider {
  static var appShortcuts: [AppShortcut] {
    AppShortcut(
      intent: LogSpendIntent(),
      phrases: [
        "Log in \(.applicationName)",
        "Log a spend in \(.applicationName)",
      ],
      shortTitle: LocalizedStringResource("logSpend.short", table: "Intents"),
      systemImageName: "plus.circle"
    )
  }
}
