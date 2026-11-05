import SwiftUI
import WidgetKit

/// Everything the widget extension draws: the Home and Lock Screen postcards, the Live Activity
/// and the Control Center controls.
@main
struct SixpmWidgets: WidgetBundle {
  var body: some Widget {
    SafeTodayWidget()
    JarWidget()
    StreakWidget()
    WeekWidget()
    ReceiptWidget()
    TodayListWidget()
    MonthWidget()
    SurfaceActivityWidget()
    if #available(iOS 18.0, *) {
      ScanQRControl()
      QuickAddControl()
    }
  }
}
