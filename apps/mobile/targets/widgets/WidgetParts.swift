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
