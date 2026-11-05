import AVFoundation
import ExpoModulesCore
import UIKit

/// Scan's camera and its reader: a live view that finds QR codes and receipts, the photo a
/// receipt is read from, and a picture picked from Photos read the same way.
public class ScanCameraModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ScanCamera")

    /// A picture already on this iPhone (a `file://` URI): a QR code, or a receipt.
    AsyncFunction("readImage") { (uri: String) async throws -> [String: Any] in
      guard let url = URL(string: uri), url.isFileURL else { throw ScanCameraException("uri") }
      let data = try Data(contentsOf: url)
      return try await Task.detached(priority: .userInitiated) {
        try ReceiptPhoto.readPicked(data)
      }.value
    }

    /// A picture picked from Photos, read: a QR code or a receipt; null when none was picked.
    AsyncFunction("pickImage") { () async throws -> [String: Any]? in
      guard let data = try await PhotoPick.pick() else { return nil }
      return try await Task.detached(priority: .userInitiated) {
        try ReceiptPhoto.readPicked(data)
      }.value
    }

    /// A picture already on this iPhone (`from`, a `file://` URI) kept as a spend's photo at `to`.
    AsyncFunction("keepPhoto") { (from: String, to: String) async throws -> [String: Any] in
      let source = try ScanCameraModule.fileURL(from)
      let target = try ScanCameraModule.fileURL(to)
      return try await Task.detached(priority: .userInitiated) {
        try KeptPhoto.keep(Data(contentsOf: source), to: target)
      }.value
    }

    /// A picture picked from Photos kept as a spend's photo at `to`; null when none was picked.
    AsyncFunction("pickPhoto") { (to: String) async throws -> [String: Any]? in
      let target = try ScanCameraModule.fileURL(to)
      guard let data = try await PhotoPick.pick() else { return nil }
      return try await Task.detached(priority: .userInitiated) {
        try KeptPhoto.keep(data, to: target)
      }.value
    }

    /// Whether this iPhone has a camera to take a spend's photo with (the simulator has none).
    Function("canTakePhoto") { () -> Bool in
      CameraPick.available
    }

    /// A photo taken with the system camera kept at `to`; null when none was taken.
    AsyncFunction("takePhoto") { (to: String) async throws -> [String: Any]? in
      let target = try ScanCameraModule.fileURL(to)
      guard let picture = try await CameraPick.take() else { return nil }
      return try await Task.detached(priority: .userInitiated) {
        try KeptPhoto.keep(camera: picture, to: target)
      }.value
    }

    /// Makes the kept photos' folder, left out of iCloud and Finder backups.
    AsyncFunction("preparePhotoFolder") { (uri: String) throws in
      try KeptPhoto.prepare(folder: ScanCameraModule.fileURL(uri))
    }

    View(ScanCameraView.self) {
      Events("onCode", "onReceipt", "onRunning")

      Prop("active") { (view, active: Bool) in
        view.active = active
      }
      Prop("facing") { (view, facing: String) in
        view.position = facing == "front" ? .front : .back
      }
      Prop("torch") { (view, torch: Bool) in
        view.torch = torch
      }
      Prop("receipts") { (view, receipts: Bool) in
        view.receipts = receipts
      }

      /// Takes the photo and reads the receipt in it. `seen` is where the live view last saw the
      /// receipt (`[x0, y0, …, x3, y3]`), used when the photo alone does not show its edges.
      AsyncFunction("capture") { (view: ScanCameraView, seen: [Double]?) async throws -> [String: Any] in
        let data = try await view.camera.capture()
        let corners = seen.flatMap(Corners.init(flat:))
        return try await Task.detached(priority: .userInitiated) {
          try ReceiptPhoto.read(data, seen: corners)
        }.value
      }
    }
  }

  private static func fileURL(_ uri: String) throws -> URL {
    guard let url = URL(string: uri), url.isFileURL else { throw ScanCameraException("uri") }
    return url
  }
}

final class ScanCameraView: ExpoView {
  let onCode = EventDispatcher()
  let onReceipt = EventDispatcher()
  let onRunning = EventDispatcher()

  let camera = ScanCameraSession()
  private let preview = AVCaptureVideoPreviewLayer()

  var active = false { didSet { apply() } }
  var position: AVCaptureDevice.Position = .back { didSet { apply() } }
  var torch = false { didSet { apply() } }
  var receipts = true { didSet { apply() } }

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    clipsToBounds = true
    preview.videoGravity = .resizeAspectFill
    preview.session = camera.session
    layer.addSublayer(preview)
    camera.onCode = { [weak self] text in self?.onCode(["data": text]) }
    camera.onReceipt = { [weak self] corners, aspect in
      DispatchQueue.main.async { self?.onReceipt(["corners": corners, "aspect": aspect]) }
    }
    camera.onRunning = { [weak self] running in
      guard let self else { return }
      self.orientPreview()
      self.onRunning(["running": running])
    }
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    CATransaction.begin()
    CATransaction.setDisableActions(true)
    preview.frame = bounds
    CATransaction.commit()
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    apply()
  }

  deinit {
    camera.stop()
  }

  /// The camera runs only while the view is on screen and asked to.
  private func apply() {
    camera.update(
      running: active && window != nil, position: position, torch: torch, receipts: receipts)
  }

  private func orientPreview() {
    guard let connection = preview.connection else { return }
    if connection.isVideoRotationAngleSupported(90) { connection.videoRotationAngle = 90 }
  }
}
