import Foundation

/// Hears the Darwin notification an extension posts as it leaves something in the inbox
/// (`GroupFiles.writeInbox`), while the app listens.
enum InboxSignal {
  private static var told: (() -> Void)?
  /// Who listens, as the Darwin centre knows it: one fixed address for the app's lifetime.
  private static let listener = UnsafeMutableRawPointer.allocate(byteCount: 1, alignment: 1)

  static func start(_ tell: @escaping () -> Void) {
    stop()
    told = tell
    CFNotificationCenterAddObserver(
      CFNotificationCenterGetDarwinNotifyCenter(), listener,
      { _, _, _, _, _ in DispatchQueue.main.async { InboxSignal.told?() } },
      GroupFiles.inboxSignal as CFString, nil, .deliverImmediately)
  }

  static func stop() {
    guard told != nil else { return }
    told = nil
    CFNotificationCenterRemoveObserver(
      CFNotificationCenterGetDarwinNotifyCenter(), listener,
      CFNotificationName(GroupFiles.inboxSignal as CFString), nil)
  }
}
