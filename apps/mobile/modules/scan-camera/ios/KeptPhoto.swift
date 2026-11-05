import AVFoundation
import ImageIO
import UIKit

/// The photo a spend keeps: upright, no larger than 1600 px on its long side, a JPEG of about
/// 300 KB, in a folder left out of iCloud and Finder backups (only 6pm's own sealed backup carries
/// it).
enum KeptPhoto {
  static let pixels = 1600
  static let bytes = 300_000
  /// Tried in turn until the JPEG fits; the last is kept whatever its size.
  private static let qualities: [CGFloat] = [0.72, 0.6, 0.5, 0.4, 0.3]

  /// Makes the folder a kept photo goes in, left out of device backups.
  static func prepare(folder: URL) throws {
    let manager = FileManager.default
    if !manager.fileExists(atPath: folder.path) {
      try manager.createDirectory(at: folder, withIntermediateDirectories: true)
    }
    var folder = folder
    var values = URLResourceValues()
    values.isExcludedFromBackup = true
    try folder.setResourceValues(values)
  }

  /// A picture's data (any format ImageIO reads) kept at `url`.
  static func keep(_ data: Data, to url: URL) throws -> [String: Any] {
    if let kept = alreadyKept(data) {
      try prepare(folder: url.deletingLastPathComponent())
      try data.write(to: url, options: .atomic)
      return ["width": kept.width, "height": kept.height, "bytes": data.count]
    }
    guard let image = ReceiptPhoto.upright(data, pixels: pixels) else {
      throw ScanCameraException("image")
    }
    return try keep(UIImage(cgImage: image), to: url)
  }

  /// A photo from the camera kept at `url`: drawn upright at its kept size first.
  static func keep(camera picture: UIImage, to url: URL) throws -> [String: Any] {
    let long = max(picture.size.width, picture.size.height)
    let scale = long > CGFloat(pixels) ? CGFloat(pixels) / long : 1
    let size = CGSize(width: picture.size.width * scale, height: picture.size.height * scale)
    let format = UIGraphicsImageRendererFormat()
    format.scale = 1
    format.opaque = true
    let upright = UIGraphicsImageRenderer(size: size, format: format).image { _ in
      picture.draw(in: CGRect(origin: .zero, size: size))
    }
    return try keep(upright, to: url)
  }

  /// A JPEG already at its kept size, upright and carrying no place (the share extension's): kept
  /// as it is rather than compressed twice.
  private static func alreadyKept(_ data: Data) -> (width: Int, height: Int)? {
    guard data.count <= bytes,
      let source = CGImageSourceCreateWithData(data as CFData, nil),
      (CGImageSourceGetType(source) as String?) == "public.jpeg",
      let properties = CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [CFString: Any],
      let width = properties[kCGImagePropertyPixelWidth] as? Int,
      let height = properties[kCGImagePropertyPixelHeight] as? Int,
      max(width, height) <= pixels,
      properties[kCGImagePropertyGPSDictionary] == nil
    else { return nil }
    let orientation = properties[kCGImagePropertyOrientation] as? Int ?? 1
    return orientation == 1 ? (width, height) : nil
  }

  private static func keep(_ picture: UIImage, to url: URL) throws -> [String: Any] {
    var jpeg: Data?
    for quality in qualities {
      jpeg = picture.jpegData(compressionQuality: quality)
      if let jpeg, jpeg.count <= bytes { break }
    }
    guard let jpeg else { throw ScanCameraException("encode") }
    try prepare(folder: url.deletingLastPathComponent())
    try jpeg.write(to: url, options: .atomic)
    let width = picture.cgImage?.width ?? Int(picture.size.width)
    let height = picture.cgImage?.height ?? Int(picture.size.height)
    return ["width": width, "height": height, "bytes": jpeg.count]
  }
}

/// The system camera for one photo of what was bought. It asks for the camera as Scan does (the
/// same permission); a photo is kept only when the person uses it.
@MainActor
final class CameraPick: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
  private static var active: CameraPick?
  private var continuation: CheckedContinuation<UIImage?, Error>?

  /// A camera to take it with: the simulator has none.
  nonisolated static var available: Bool { AVCaptureDevice.default(for: .video) != nil }

  /// The photo taken, or nil when the camera was closed without one.
  static func take() async throws -> UIImage? {
    guard available else { throw ScanCameraException("camera") }
    guard active == nil else { throw ScanCameraException("busy") }
    guard let host = await PhotoPick.settledHost() else { throw ScanCameraException("host") }
    let pick = CameraPick()
    active = pick
    return try await withCheckedThrowingContinuation { continuation in
      pick.continuation = continuation
      let picker = UIImagePickerController()
      picker.sourceType = .camera
      picker.cameraCaptureMode = .photo
      picker.delegate = pick
      host.present(picker, animated: true)
    }
  }

  func imagePickerController(
    _ picker: UIImagePickerController,
    didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]
  ) {
    picker.dismiss(animated: true)
    finish(.success(info[.originalImage] as? UIImage))
  }

  func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
    picker.dismiss(animated: true)
    finish(.success(nil))
  }

  private func finish(_ result: Result<UIImage?, Error>) {
    continuation?.resume(with: result)
    continuation = nil
    CameraPick.active = nil
  }
}
