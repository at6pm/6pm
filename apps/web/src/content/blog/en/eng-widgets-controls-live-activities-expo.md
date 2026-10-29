---
title: "Widgets, Controls and Live Activities from an Expo app"
description: "How 6pm ships WidgetKit widgets, iOS 18 controls, a Live Activity and an App Intent from Expo, with no database in the extensions and no logic in Swift."
slug: eng-widgets-controls-live-activities-expo
lang: en
pubDate: 2026-10-21
tags: [engineering, expo, widgetkit, app intents, live activities]
related: [eng-native-feel-expo-reanimated, eng-why-we-open-sourced-our-money-app, eng-reading-vietqr-on-device]
cta: "Read the Swift and TypeScript on GitHub, or try the widgets in the app."
hero: [lock-widgets]
---

# Widgets, Controls and Live Activities from an Expo app

6pm is an Expo app with three native extensions: a widget extension (Home and Lock Screen widgets, two Control Center controls, one Live Activity), an App Intents extension ("Log in 6pm" for Siri and Apple Pay automations) and a share extension. The extensions never open the database, and Swift never decides a number: TypeScript writes JSON, Swift lays it out.

Code below is from the [6pm repo](https://github.com/at6pm/6pm). The stack: Expo 58, React Native 0.88 on the New Architecture, and `@bacons/apple-targets` 5.0.0 for the native targets.

## The shape

Everything native beyond the app itself lives in `apps/mobile/targets`:

```
targets/
  widgets/    WidgetKit: SafeTodayWidget, TodayListWidget, SurfaceActivityWidget, two controls
  intents/    App Intents extension: LogSpendIntent, open-screen intents
  share/      Share extension: reads a bank receipt with Vision
  _shared/    GroupFiles.swift, DomainBridge.swift, ThemeTokens.swift, strings, domain-native.js
```

<!-- media: diagram-widgets -->

Each target is declared in a few lines of JavaScript. The widget extension:

```js
// apps/mobile/targets/widgets/expo-target.config.js
module.exports = (config) => ({
  type: 'widget',
  bundleIdentifier: '.widgets',
  deploymentTarget: '17.0',
  frameworks: ['WidgetKit', 'SwiftUI', 'ActivityKit', 'AppIntents'],
  entitlements: {
    'com.apple.security.application-groups':
      config.ios.entitlements['com.apple.security.application-groups'],
  },
});
```

`expo prebuild` turns that into an Xcode target. `apps/mobile/ios` is generated and git-ignored, so the targets folder and `app.config.ts` are the only source of truth.

The bundle itself is short:

```swift
// apps/mobile/targets/widgets/Bundle.swift
@main
struct SixpmWidgets: WidgetBundle {
  var body: some Widget {
    SafeTodayWidget()
    TodayListWidget()
    SurfaceActivityWidget()
    if #available(iOS 18.0, *) {
      ScanQRControl()
      QuickAddControl()
    }
  }
}
```

The deployment target is iOS 17; controls are iOS 18 only, so they sit behind `#available`.

## Rule one: extensions never touch the database

The app's source of truth is SQLite with SQLCipher (via expo-sqlite). It would be natural to put that file in the App Group and let the widget read it. We deliberately don't.

SQLite in WAL mode holds a file lock, and iOS kills a suspended extension that holds a lock on a file in a shared container (the `0xdead10cc` termination). So the contract, from `docs/tech-decisions.md`, is:

- Each capture an extension makes is one JSON file in `<group>/inbox/`. The app imports it through the normal capture path and deletes it.
- The app writes what extensions show to `<group>/surfaces/`.
- Files are written whole and renamed into place, readable after first unlock, and excluded from backups.

The whole App Group layer is one small Swift file, shared between the app's local Expo module and the extensions:

```swift
// apps/mobile/targets/_shared/GroupFiles.swift (generated from modules/surfaces/ios)
/// Writes the whole file to a temporary name and renames it into place.
static func write(_ data: Data, to url: URL) throws {
  try data.write(to: url, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
  var url = url
  var values = URLResourceValues()
  values.isExcludedFromBackup = true
  try url.setResourceValues(values)
}

/// Leaves one capture for the app to import. Extensions only ever write here.
static func writeInbox(id: String, json: Data) throws {
  try write(json, to: folder("inbox").appendingPathComponent("\(id).json"))
}
```

The group id is derived from the bundle id, so the dev and store builds never share a container.

## Rule two: Swift lays out, TypeScript decides

The daily number ("Safe to spend today") is computed by `@6pm/domain`, a tested TypeScript package. We did not want a second copy of that logic in Swift. So the app writes a snapshot, and the widget draws it.

`surfaceSnapshot()` in `apps/mobile/src/features/surfaces/surface-snapshot.ts` produces:

- **Entries:** one for the rest of this money day, and one starting at the next 04:00 (6pm's money day ends at 04:00, so a late-night spend belongs to yesterday). The second entry means the number turns over at 4 a.m. without the app running.
- **Palettes for every hour:** the widget's colours follow the app's time-of-day sky, so the app writes 24 sets of colour tokens plus the companion's mood for each hour.
- **Strings:** every word, already in the user's language (English or Vietnamese), plus Material Symbols glyphs as private-use characters so Swift needs no icon names.

On the Swift side, a timeline provider turns that into WidgetKit entries, one at the top of every hour so the colours follow the sky:

```swift
// apps/mobile/targets/widgets/SurfaceTimeline.swift (trimmed)
static func timeline(now: Date) -> Timeline<SurfaceEntry> {
  let loaded = SurfaceSnapshot.load()
  guard let snapshot = loaded, !snapshot.entries.isEmpty else {
    let entry = SurfaceEntry(date: now, state: .setUp, snapshot: loaded, entry: nil,
                             tokens: loaded?.tokens(at: now) ?? [:])
    return Timeline(entries: [entry], policy: .never)
  }
  let starts = snapshot.entries.map { surfaceDate($0.from) ?? now }
  let end = (starts.last ?? now).addingTimeInterval(lastStretch)   // 24 h

  var dates: Set<Date> = [now, end]
  for start in starts where start > now && start < end { dates.insert(start) }
  var hour = Calendar.current.dateInterval(of: .hour, for: now)?.end ?? end
  while hour < end {
    dates.insert(hour)
    hour = hour.addingTimeInterval(60 * 60)
  }
  // ... one SurfaceEntry per date; past `end` the state is .stale ("Open 6pm")
}
```

The snapshot carries a version (`v`). If a widget finds a version it does not read, it shows the set-up state instead of decoding garbage. When the app writes a new snapshot it reloads everything it owns:

```swift
// apps/mobile/modules/surfaces/ios/SurfaceFiles.swift
static func reloadWidgets() {
  WidgetCenter.shared.reloadAllTimelines()
  if #available(iOS 18.0, *) {
    ControlCenter.shared.reloadAllControls()
  }
}
```

## One widget, four families

`SafeTodayWidget` covers the Home Screen (small, medium) and the Lock Screen (a ring and a card):

```swift
// apps/mobile/targets/widgets/SafeTodayWidget.swift
StaticConfiguration(kind: "SafeToday", provider: SurfaceTimelineProvider()) { entry in
  SafeTodayView(entry: entry)
}
.supportedFamilies([.systemSmall, .systemMedium, .accessoryCircular, .accessoryRectangular])
.contentMarginsDisabled()

// ...
switch family {
case .accessoryCircular: SafeRing(entry: entry)
case .accessoryRectangular: SafeCard(entry: entry)
case .systemMedium: SafeMedium(entry: entry)
default: SafeSmall(entry: entry)
}
```

<!-- media: home-widgets -->

`TodayListWidget` is the large size: what's left, a spent bar and the newest spends.

The companion (a little sun, by default) appears in the widgets as PNGs the app renders and drops into the group (`companion-<mood>-<size>.png`). In serious mode the snapshot says so and the widget leaves it out.

## Controls: SF Symbols and universal links

iOS 18 controls live in Control Center, on the Lock Screen's bottom corners and on the Action button. They only take SF Symbols, so where the app draws Material Symbols, the controls wear `qrcode.viewfinder` and `plus`. Each control opens its screen through a universal link, which the app routes whether it was running or not:

```swift
// apps/mobile/targets/widgets/Controls.swift
@available(iOS 18.0, *)
struct ScanQRControl: ControlWidget {
  var body: some ControlWidgetConfiguration {
    StaticControlConfiguration(kind: "ScanQR") {
      ControlWidgetButton(action: OpenURLIntent(ControlLink.url("scan"))) {
        Label {
          Text("scan.title", tableName: "Intents")
        } icon: {
          Image(systemName: "qrcode.viewfinder")
        }
      }
    }
    .displayName(LocalizedStringResource("scan.title", table: "Intents"))
    .description(LocalizedStringResource("scan.description", table: "Intents"))
  }
}
```

## One Live Activity type, JSON state

6pm uses a Live Activity in two situations: a QR payment waiting for you to finish it in your bank app, and a trip in Travel mode. Rather than two `ActivityAttributes` types, there is one, and its content state is a JSON string the app has already worded:

```swift
// apps/mobile/targets/widgets/SurfaceAttributes.swift (generated, copied from the module)
public struct SurfaceAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    public var json: String
  }
  /// `pendingPay` or `travel`.
  public var kind: String
  /// What the activity follows: the waiting spend's id, or the trip's.
  public var key: String
}
```

<!-- media: live-activity-clip -->

The widget decodes `PendingPayState` or `TravelState` from it, and lays out the Lock Screen banner and the Dynamic Island's compact, minimal and expanded regions. Later fields are optional, so an activity started by an older build still decodes after an over-the-air update.

Activities are started by the app, in the foreground, with `pushType: nil`. There is no remote push: the app has no notification token to send anywhere.

The waiting payment's banner has a "Paid" button. It is a `LiveActivityIntent`, so it runs in the app's process without opening the app, and it follows the same inbox rule as everything else:

```swift
// apps/mobile/targets/widgets/_shared/MarkPaidIntent.swift
func perform() async throws -> some IntentResult {
  let id = UUID().uuidString.lowercased()
  let event: [String: Any] = [
    "v": 1, "id": id, "kind": "paid", "spendId": spendId,
    "at": ISO8601DateFormatter().string(from: Date()),
  ]
  try GroupFiles.writeInbox(id: id, json: JSONSerialization.data(withJSONObject: event))
  for activity in Activity<SurfaceAttributes>.activities where activity.attributes.key == spendId {
    await activity.end(nil, dismissalPolicy: .immediate)
  }
  return .result()
}
```

On the JavaScript side, `useLiveActivity` reconciles: on any relevant change it lists what iOS has running and starts, updates or ends activities to match the plan, one run at a time.

## "Log in 6pm": running TypeScript in an App Intent

The most interesting target is the App Intents extension. It powers Siri ("Log in 6pm") and, more importantly, Apple Pay capture.

iOS Shortcuts can run an automation when a Wallet card is tapped, and pass the transaction's amount and merchant. 6pm publishes a ready-made shortcut, "Log to 6pm", containing one "Log in 6pm" action with Amount and Where taken from the shortcut input. The user adds it once and attaches it to a Wallet automation. From then on, every Apple Pay tap on that iPhone lands in 6pm's Inbox.

The intent never starts the app, and it has to return quickly, because Wallet gives up on an automation that takes long:

```swift
// apps/mobile/targets/intents/LogSpendIntent.swift (trimmed)
struct LogSpendIntent: AppIntent {
  static let openAppWhenRun = false

  @Parameter(title: LocalizedStringResource("logSpend.amount", table: "Intents"), ...)
  var amount: String

  @Parameter(title: LocalizedStringResource("logSpend.merchant", table: "Intents"))
  var merchant: String?

  func perform() async throws -> some IntentResult & ProvidesDialog & ShowsSnippetView {
    let logged = try LoggedSpend.log(amount: amount, merchant: merchant, at: Date())
    // Only Siri gets here: Wallet always names a merchant, and its unread amounts still log.
    if logged.needsAmount {
      throw $amount.needsValueError(...)
    }
    ...
  }
}
```

Parsing "25k", "twelve dollars" or Wallet's formatted amount, picking a category from merchant rules, and working out the new "safe today" line are all domain logic. So the extension runs the domain in JavaScriptCore:

```swift
// apps/mobile/targets/_shared/DomainBridge.swift (trimmed)
final class DomainBridge {
  /// The `NATIVE_API_VERSION` this Swift was written against.
  static let apiVersion: Int32 = 4

  init() throws {
    guard let url = Bundle.main.url(forResource: "domain-native", withExtension: "js"),
          let source = try? String(contentsOf: url, encoding: .utf8),
          let context = JSContext()
    else { throw Failure.missingBundle }
    context.evaluateScript(source)
    // ... reads the global `SixpmDomain`, checks NATIVE_API_VERSION, installs an exception handler
  }

  /// Calls `SixpmDomain.<name>(...arguments)`, each argument and the result a JSON string.
  func call(_ name: String, _ arguments: [String]) throws -> String { ... }
}
```

`LoggedSpend.log` passes the amount, the merchant, the `context` file the app last wrote to the group, and the current time. The domain answers with an item to file, which goes into the inbox, plus the text for Siri's snippet. The version check means a Swift/JS mismatch fails loudly instead of logging a wrong number.

The App Shortcuts provider registers the phrases. Siri has no Vietnamese, so the spoken phrases are English while titles follow the phone's language:

```swift
// apps/mobile/targets/intents/IntentsExtension.swift
AppShortcut(
  intent: LogSpendIntent(),
  phrases: [
    "Log in \(.applicationName)",
    "Log a spend in \(.applicationName)",
  ],
  shortTitle: LocalizedStringResource("logSpend.short", table: "Intents"),
  systemImageName: "plus.circle"
)
```

## Keeping two languages in sync

Swift holds no copy of a number rule, a word or a colour. `tools/scripts/generate-native.ts` writes everything the iOS side reads from the TypeScript packages:

- `targets/_shared/domain-native.js`: the domain's native entry, bundled with esbuild for JavaScriptCore
- `targets/_shared/<lang>.lproj/<Table>.strings`: the `native.*` keys from `@6pm/i18n`
- `targets/_shared/ThemeTokens.swift`: fixed colours from `@6pm/theme`
- `SurfaceAttributes.swift` and `GroupFiles.swift`, copied from the local module so the app and the extensions share one definition

CI runs it with `--check` and fails when a generated file is out of date, so a renamed key or a changed colour cannot reach Swift half-done.

## What we'd tell you before you start

- **Decide the IPC early.** "Extensions write one JSON file, the app imports it" is boring, and boring is the point. Shared SQLite would trade it for lock-related terminations.
- **Precompute, don't recompute.** A widget timeline with an entry at the next day boundary means the number is right at 04:00 even if the app hasn't run since yesterday.
- **Version every file that crosses the boundary.** Over-the-air JS updates mean the app can be newer than the extension's expectations, and vice versa.

## FAQ

### Can you build iOS widgets with Expo?

Yes. `@bacons/apple-targets` adds widget, App Intents and share extension targets from a small config file per target, and `expo prebuild` generates the Xcode project. The widget UI itself is still SwiftUI.

### How do the widgets get the data without opening the database?

The app writes a versioned JSON snapshot to the App Group (entries, hourly colours, strings) and reloads timelines. Extensions only ever write single JSON files to an inbox folder, which the app imports.

### How does 6pm log Apple Pay transactions?

Through a Shortcuts automation on Wallet taps that runs the "Log in 6pm" App Intent with the amount and merchant. The intent runs the domain logic in JavaScriptCore and leaves the spend in the App Group inbox without opening the app.

### Does the Live Activity use push notifications?

No. The app starts, updates and ends it locally with `pushType: nil`, and the "Paid" button is a `LiveActivityIntent`.

## Try it

The code is on GitHub under Apache 2.0: [github.com/at6pm/6pm](https://github.com/at6pm/6pm) (start in `apps/mobile/targets` and `apps/mobile/modules/surfaces`). The widgets, controls and Live Activity are in the app, on [the App Store](https://apps.apple.com/app/id6504689878). More at [at6pm.app](https://at6pm.app).
