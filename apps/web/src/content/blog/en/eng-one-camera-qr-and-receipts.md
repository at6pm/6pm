---
title: "One camera for QR codes and receipts with Apple Vision"
description: "How 6pm's Scan finds QR codes and receipts in one AVCaptureSession, outlines paper live with Vision, reads it on device, and the Android ML Kit port."
slug: eng-one-camera-qr-and-receipts
lang: en
pubDate: 2026-10-21
tags: [engineering, ios, apple vision, ocr, android]
related: [eng-reading-vietqr-on-device, eng-native-feel-expo-reanimated, eng-why-we-open-sourced-our-money-app]
cta: "Read the camera module on GitHub, or point the beta at a receipt."
hero: [scan-receipt]
---

# One camera for QR codes and receipts: live document outlines and on-device OCR with Apple Vision

6pm's Scan runs one `AVCaptureSession` with three outputs: the system metadata reader for QR codes, a video feed that Vision searches for paper ten times a second, and a photo output. A receipt held still for 0.9 s is taken, squared up with `CIPerspectiveCorrection`, and read on the phone. Only an unsure reading sends the photo, once.

The code is in `apps/mobile/modules/scan-camera` (a local Expo module, Swift and Kotlin) and `packages/domain/src/capture` (the receipt parser, TypeScript). The repo is Apache 2.0.

## The product constraint

Scan has one job per moment: at a counter you want the QR read instantly; at home with a crumpled receipt you want it found, cut out and read. Two modes with a switch would be simpler to build. It would also mean a choice at the till. So there is one camera, and it looks for both at once.

## One session, three outputs

```swift
// apps/mobile/modules/scan-camera/ios/ScanCameraSession.swift (trimmed)
/// One capture session that finds QR codes (the system's metadata reader, as fast as the
/// Camera app's) and the receipt in view (Vision's document segmentation, ten times a
/// second), and takes the full-resolution photo a receipt is read from.
final class ScanCameraSession: NSObject, @unchecked Sendable {
  let session = AVCaptureSession()
  private let photoOutput = AVCapturePhotoOutput()
  private let videoOutput = AVCaptureVideoDataOutput()
  private let metadataOutput = AVCaptureMetadataOutput()
  static let receiptInterval: CFTimeInterval = 0.1
  static let missesReported = 4
  static let minimumArea = 0.06
}
```

<!-- media: diagram-camera -->

**QR codes** come from `AVCaptureMetadataOutput` with `metadataObjectTypes = [.qr]`, delivered on the main queue. It is the same reader the Camera app uses, and it is faster than running a Vision barcode request per frame. The same code is ignored for a second after it fires, so holding the phone over a code does not spam the parser.

**Receipts** come from the video output, `kCVPixelFormatType_420YpCbCr8BiPlanarFullRange`, with `alwaysDiscardsLateVideoFrames = true`. The delegate throttles itself to one look every 100 ms: "often enough for the outline to follow the paper, rare enough to leave the phone cool", as the comment puts it.

**The photo** comes from `AVCapturePhotoOutput` at `.balanced` quality, taken only when a receipt is captured.

Session work runs on one serial queue, frames on another, and the one flag both read (whether to look for receipts at all) sits behind an `NSLock`.

### Picking the lens

A receipt is held close. The session asks for the virtual multi-camera device first, so iOS can switch to the macro-capable lens as the Camera app does, and starts it at its 1x lens rather than its widest:

```swift
let types: [AVCaptureDevice.DeviceType] =
  position == .back
  ? [.builtInTripleCamera, .builtInDualWideCamera, .builtInWideAngleCamera]
  : [.builtInWideAngleCamera]
// …
if let wide = device.virtualDeviceSwitchOverVideoZoomFactors.first {
  device.videoZoomFactor = CGFloat(truncating: wide)
}
```

## Finding the paper

Vision has two tools for this, and we use both:

```swift
// apps/mobile/modules/scan-camera/ios/ReceiptPhoto.swift (trimmed)
/// Its document segmentation first, and where that finds nothing (it needs the Neural
/// Engine, and misses paper on a busy table) the plainest rectangle in view.
static func paper(_ handler: VNImageRequestHandler, minimumArea: Double) -> Corners? {
  let segmentation = VNDetectDocumentSegmentationRequest()
  let rectangles = VNDetectRectanglesRequest()
  // A receipt is long and narrow, and photographed at an angle.
  rectangles.minimumAspectRatio = 0.15
  rectangles.maximumAspectRatio = 1
  rectangles.quadratureTolerance = 30
  rectangles.minimumSize = 0.2
  rectangles.minimumConfidence = 0.7
  rectangles.maximumObservations = 1
  if (try? handler.perform([segmentation])) != nil,
    let found = segmentation.results?.first, found.confidence >= minimumConfidence
  {
    let corners = Corners(found)
    if corners.area >= minimumArea { return corners }
  }
  guard (try? handler.perform([rectangles])) != nil, let found = rectangles.results?.first
  else { return nil }
  let corners = Corners(found)
  return corners.area >= minimumArea ? corners : nil
}
```

`VNDetectDocumentSegmentationRequest` is the better detector for paper, but it misses on cluttered tables. The rectangle detector is tuned for receipts: aspect ratios down to 0.15 (long and thin) and 30 degrees of tolerance for a phone held at an angle. Anything covering less than a few percent of the frame is a label or a card, not the receipt; the shoelace formula on the quad gives the area.

Vision's origin is bottom left; React Native's is top left. `Corners` flips once, at the boundary, and everything downstream uses `[x0, y0, …, x3, y3]` from the top left, clockwise.

### Losing it gracefully

Detectors flicker. A frame where the outline vanishes is usually the detector, not the hand. The session keeps reporting "gone" for four looks after a loss, then goes quiet, and the TypeScript side lets two stray sightings pass before it believes the receipt moved:

```ts
// apps/mobile/src/features/scan/receipt-outline.ts
export const STEADY_SHARE = 0.08; // a corner may wander 8% of the shortest side
export const STEADY_POINTS = 10;  // …and never less than 10 points
export const MAX_STRAYS = 2;      // one or two misses are the detector, not the hand
export const STEADY_MS = 900;     // held still this long: take the photo
export const MIN_SHARE = 0.12;    // smaller than this on screen: outlined, not taken
```

The tolerance scales with the receipt's shortest side on screen, so a receipt held close may shake as much as one held far. Stillness is measured from where the receipt settled, not from the last sighting, so a slow drift still resets the timer. After 0.9 s still, Scan takes the photo itself. There is also a shutter.

Mapping corners onto the preview has one trap: the preview is aspect-fill, so the frame is scaled to cover the view and cropped. `quadOnView` applies the same scale and centring offset, so the drawn outline sits on the paper rather than near it.

## Cutting it out and reading it

The full-resolution photo goes through four steps in `ReceiptPhoto.read`:

1. **Upright and bounded.** `CGImageSourceCreateThumbnailAtIndex` with the transform applied, at most 3,000 px on the long side, which keeps the small print on a long receipt.
2. **Find the paper again** in the photo. If that fails, use where the live view last saw it.
3. **Square it up** with Core Image:

<!-- media: scan-receipt-clip -->

```swift
let output = CIImage(cgImage: image).applyingFilter(
  "CIPerspectiveCorrection",
  parameters: [
    "inputTopLeft": vector(corners.topLeft),
    "inputTopRight": vector(corners.topRight),
    "inputBottomRight": vector(corners.bottomRight),
    "inputBottomLeft": vector(corners.bottomLeft),
  ])
```

4. **Read it** at 2,000 px with `VNRecognizeTextRequest` at `.accurate`:

```swift
if let vietnamese = supported.first(where: { $0.lowercased().hasPrefix("vi") }) {
  request.recognitionLanguages = [vietnamese, "en-US"]
  request.usesLanguageCorrection = true
} else {
  request.recognitionLanguages = ["en-US"]
  request.usesLanguageCorrection = false
}
```

The second branch matters for Vietnamese receipts on a phone whose Vision lacks Vietnamese: with English language correction on, Vietnamese words get "corrected" into English ones. Off, the raw glyphs survive, and the parser matches labels with accents folded away anyway.

A picture chosen from Photos goes through the same path, after a `VNDetectBarcodesRequest` decides whether it is a QR screenshot instead.

## The parser: lines in, a total out

Vision returns lines with boxes and confidence. `packages/domain/src/capture/shop-receipt.ts` turns them into a `ShopReceipt`: total, currency, merchant, time, plus two flags, `totalSure` and `currencySure`.

Totals are found by label, ranked. The labels are folded (no accents, lower case) in Vietnamese, English and Indonesian:

```ts
// packages/domain/src/capture/shop-labels.ts (excerpt)
export const TOTAL_RANK = { final: 3, total: 2, running: 1 };
const LABELS = {
  final:
    'tong con lai, con phai thu, con lai, khach phai tra, khach can tra, can thanh toan, ' +
    'phai thanh toan, tien phai tra, tong thanh toan, total amount, grand total, amount due, …',
  total: 'tong cong, tong tien, tong, thanh toan, total, jumlah',
  running: 'thanh tien',
  // …
};
```

`totalSure` means a total label was read and nothing on the receipt argues with it: no second total of the same rank with a different amount, no card charge or subtotal that disagrees. `currencySure` means the receipt printed its currency or is plainly Vietnamese.

## When the phone is not sure

The card that shows the reading decides whether to ask for help:

```ts
// packages/domain/src/native/share-card.ts
needsCheck: read === null || (read.kind === 'shop' && !(read.totalSure && read.currencySure)),
```

Only then, and only if the user has not chosen to keep AI on the phone, the app sends one JPEG (long side 1,600 px, at most 1.5 MB, quality stepped down from 0.7 until it fits) to `POST /api/v1/receipts/read`. The server asks an Anthropic vision model for the total as printed, the currency, the shop and the time; code, not the model, converts the printed total into an amount. The server does not store or log the photo. Offline, or when the server has no answer, the phone keeps its own reading.

When the closer look returns, `lookedReceiptCard` merges it over the phone's reading. Fields the phone read surely stay as they were; the server fills what the phone was unsure of.

The share extension (sharing a bank's "transfer successful" screenshot into 6pm) reads with the same parser and the same rules; the Scan path was written to read a receipt "exactly as one shared to 6pm".

## The Android port

Android is not released yet, but the camera module has a Kotlin side in `modules/scan-camera/android`, kept to "the same steps and limits as the iPhone's reader".

- **Camera:** CameraX, with an `ImageAnalysis` use case on `STRATEGY_KEEP_ONLY_LATEST` and YUV_420_888 frames.
- **QR:** ML Kit `barcode-scanning` restricted to `FORMAT_QR_CODE`, run on every analysed frame, with the same one-second repeat guard.
- **Text:** ML Kit `text-recognition` with the Latin recogniser, whose languages include Vietnamese. Its boxes are converted to Vision's bottom-left convention so the TypeScript parser does not care which phone it runs on.
- **Paper:** this was the real work. Android has no rectangle detector of its own, and ML Kit's document scanner is a full-screen flow, not a frame-by-frame detector. So `PaperFinder.kt` is a plain one, about 400 lines:

```kotlin
// apps/mobile/modules/scan-camera/android/.../PaperFinder.kt (doc comment)
// The paper is the largest bright patch that stands out from what is around it and is shaped
// like a four-cornered sheet: the picture cut at a few brightness levels, the largest bright
// regions of each cut, their convex hulls and the largest quadrilateral that fits in each,
// then checks that the region really is that quadrilateral and stands out from its surroundings.
```

It works on a grey grid: the Y plane sampled down to 160 px on the long side for the live view (four samples per cell), 400 px for the photo. One threshold rarely fits, since paper on a pale table needs a higher cut than paper on a dark one, so it tries Otsu's threshold and four levels between it and the 98th percentile, and keeps the largest sheet. Checks reject blobs (solidity below 0.8), shapes with more than four corners, regions filling over 92% of the frame (that is the table), corners more than 40 degrees off square, and paper less than 35 grey levels brighter than its surroundings.

Straightening uses `Matrix.setPolyToPoly` with four points and a filtered `Canvas.drawBitmap`, the Android equivalent of `CIPerspectiveCorrection`.

## Lessons

- **Use the platform's fast path for the easy thing.** The metadata reader handles QR better than per-frame Vision.
- **Two detectors beat one tuned detector.** Segmentation for clean cases, rectangles for cluttered ones.
- **Make "unsure" a first-class output.** The parser's `totalSure` and `currencySure` flags are what keep most receipts on the phone.
- **Normalise coordinates once, at the boundary.** Both platforms hand TypeScript the same corner order and origin.

## FAQ

### Does every receipt photo go to a server?

No. Every receipt is read on the phone first. A photo is sent once only when the phone is not sure of the total or the currency, and never in on-device AI mode.

### Why not use VisionKit's document camera?

Scan needs QR codes and receipts in one live view, with its own outline and auto-capture. The building blocks (AVFoundation plus Vision requests) allow that; a full-screen system flow does not.

### Is the Android version released?

No. 6pm launches on iPhone. The Android camera module is in the repo and builds in CI.

## Try it

The code is at [github.com/at6pm/6pm](https://github.com/at6pm/6pm): `apps/mobile/modules/scan-camera` and `packages/domain/src/capture`. The iPhone app is in public beta on TestFlight: [testflight.apple.com/join/a8UrvT5P](https://testflight.apple.com/join/a8UrvT5P), and arrives on the App Store on Friday 6 November 2026 at 18:00 ICT (6:00 a.m. Eastern). More at [at6pm.app](https://at6pm.app).
