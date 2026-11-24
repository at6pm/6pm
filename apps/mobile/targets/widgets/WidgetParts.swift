import SwiftUI
import WidgetKit

/// A 6 pt bar: what is spent of a line.
struct LineBar: View {
  let fraction: Double
  let track: Color
  let fill: Color
  var height: CGFloat = 6

  var body: some View {
    GeometryReader { proxy in
      ZStack(alignment: .leading) {
        Capsule().fill(track)
        Capsule()
          .fill(fill)
          .frame(width: proxy.size.width * min(1, max(0, fraction)))
      }
    }
    .frame(height: height)
  }
}

/// A filled Material Symbols glyph at a size, in the surrounding foreground colour.
struct FilledGlyph: View {
  let glyph: String
  let size: CGFloat

  var body: some View {
    if let image = SurfaceFont.filledGlyph(glyph, size: size) {
      Image(uiImage: image)
    }
  }
}

/// The app's icon, small, at the head of a Live Activity on the Lock Screen.
struct AppMark: View {
  var body: some View {
    Image("AppMark")
      .resizable()
      .frame(width: 20, height: 20)
      .clipShape(RoundedRectangle(cornerRadius: 5, style: .continuous))
  }
}

/// Scan and Quick add on the medium and large widgets: two 30 pt rounds in the widget's own ink,
/// the Today header's glass buttons drawn small. Scan is there only when the app gave it a link
/// (a phone that scans); it scans a VietQR in đồng and a receipt elsewhere, as its glyph says.
/// Neither carries an amount, so Hide amounts and the locked phone leave them as they are.
struct WidgetActions: View {
  let entry: SurfaceEntry
  let ink: Color
  /// The sky is dark and its ink light: the glass is stronger there, as the day's bar is.
  let dark: Bool

  static let size: CGFloat = 30

  /// The app wrote at least one button for the widgets.
  static func shown(_ entry: SurfaceEntry) -> Bool {
    entry.snapshot?.links?.scan != nil || entry.snapshot?.links?.add != nil
  }

  var body: some View {
    let links = entry.snapshot?.links
    HStack(spacing: 6) {
      if let scan = entry.link(links?.scan) {
        round(glyph: entry.text("glyph.scan"), glyphSize: 16, label: entry.text("scan"), url: scan)
      }
      if let add = entry.link(links?.add) {
        round(glyph: entry.text("glyph.add"), glyphSize: 19, label: entry.text("quickAdd"), url: add)
      }
    }
  }

  private func round(glyph: String, glyphSize: CGFloat, label: String, url: URL) -> some View {
    Link(destination: url) {
      Text(glyph)
        .font(SurfaceFont.symbol(size: glyphSize))
        .foregroundStyle(ink)
        .frame(width: Self.size, height: Self.size)
        .background(Circle().fill(ink.opacity(dark ? 0.22 : 0.14)))
    }
    .accessibilityLabel(Text(label))
  }
}
