import AppIntents
import SwiftUI
import WidgetKit

// Control Center, the Lock Screen and the Action button take only SF Symbols, so the controls
// wear `qrcode.viewfinder` and `plus` where the app draws Material Symbols. Each one runs the
// app's own intent (`_shared/OpenScreenIntents.swift`), which opens its screen in the app.

/// "Scan QR": opens Scan to pay.
@available(iOS 18.0, *)
struct ScanQRControl: ControlWidget {
  var body: some ControlWidgetConfiguration {
    StaticControlConfiguration(kind: "ScanQR") {
      ControlWidgetButton(action: OpenScanIntent()) {
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

/// "Quick add": opens Quick add.
@available(iOS 18.0, *)
struct QuickAddControl: ControlWidget {
  var body: some ControlWidgetConfiguration {
    StaticControlConfiguration(kind: "QuickAdd") {
      ControlWidgetButton(action: OpenQuickAddIntent()) {
        Label {
          Text("quickAdd.title", tableName: "Intents")
        } icon: {
          Image(systemName: "plus")
        }
      }
    }
    .displayName(LocalizedStringResource("quickAdd.title", table: "Intents"))
    .description(LocalizedStringResource("quickAdd.description", table: "Intents"))
  }
}
