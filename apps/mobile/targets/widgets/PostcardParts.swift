import SwiftUI
import WidgetKit

/// The postcard's sky: the look's sky for the stretch's hour, top to bottom, or the look's own
/// ground (Basic). It cross-fades when the next stretch begins.
struct PostcardSky: View {
  let entry: SurfaceEntry

  var body: some View {
    Group {
      if let ground = entry.look.ground {
        Color(css: entry.dark ? ground.night : ground.day)
      } else {
        LinearGradient(
          stops: [
            .init(color: entry.color("skyTop"), location: 0),
            .init(color: entry.color("skyMid"), location: 0.52),
            .init(color: entry.color("skyBottom"), location: 1),
          ],
          startPoint: .top, endPoint: .bottom)
      }
    }
    .id(entry.card?.hour ?? -1)
    .transition(.opacity)
  }
}

/// The sun where it stands this stretch, in fractions of the widget.
struct PostcardSun: View {
  let entry: SurfaceEntry
  let size: CGFloat
  let small: Bool

  var body: some View {
    if let card = entry.card, let sun = entry.look.sun(card.sunKind) {
      GeometryReader { proxy in
        SunDisc(sun: sun, look: entry.look, size: size)
          .position(
            x: proxy.size.width * (small ? card.sun.xs : card.sun.x),
            y: proxy.size.height * (small ? card.sun.ys : card.sun.y))
      }
      .allowsHitTesting(false)
    }
  }
}

/// The ink written on the sky.
extension SurfaceEntry {
  var ink: Color { color("skyInk") }
}

/// An amount that hides as ••• while the phone is locked, when the person asked for that: the
/// system redacts what is marked private, and in its place the widget writes the mask.
struct PrivateText: View {
  let text: String
  let entry: SurfaceEntry

  var body: some View {
    if entry.hideAmounts {
      Masked(text: text, mask: entry.hidden).privacySensitive()
    } else {
      Text(text)
    }
  }

  private struct Masked: View {
    @Environment(\.redactionReasons) private var reasons
    let text: String
    let mask: String

    var body: some View {
      if reasons.contains(.privacy) {
        Text(mask).unredacted()
      } else {
        Text(text)
      }
    }
  }
}

/// A kicker in the look's mono face (the interface face in Basic), set in capitals already.
struct Kicker: View {
  let text: String
  let entry: SurfaceEntry
  var size: CGFloat = 10

  var body: some View {
    Text(text)
      .font(entry.look.mono ? SurfaceFont.mono(size: size) : SurfaceFont.body(size: size, weight: 600))
      .trackingEm(entry.look.mono ? 0.14 : 0.04, size: size)
      .lineLimit(1)
      .minimumScaleFactor(0.7)
      .opacity(0.8)
  }
}

/// The number in the look's display face, its glow on a dark sky and its offset print, rolling
/// to its new value when the next stretch begins.
struct PostcardNumber: View {
  let text: String
  let entry: SurfaceEntry
  let size: CGFloat

  var body: some View {
    let look = entry.look
    PrivateText(text: text, entry: entry)
      .font(SurfaceFont.display(entry.displayFont, size: size, weight: look.displayWeight))
      .trackingEm(look.numberTracking, size: size)
      .monospacedDigit()
      .lineLimit(1)
      .minimumScaleFactor(0.5)
      .textShadows(look.numberShadows + (entry.dark ? look.numberGlow : []))
      .contentTransition(.numericText())
  }
}

/// A jar's measures: the medium widget's shelf jar and the small widget's tall one.
struct JarSize {
  let width: CGFloat
  let height: CGFloat
  let lidInset: CGFloat
  let lidH: CGFloat
  let bodyTop: CGFloat
  /// Its corners and lines against the shelf jar's.
  let scale: CGFloat
  let icon: CGFloat

  static let shelf = JarSize(
    width: 34, height: 46, lidInset: 9, lidH: 6, bodyTop: 5, scale: 1, icon: 14)
  static let tall = JarSize(
    width: 64, height: 142, lidInset: 17, lidH: 10, bodyTop: 8, scale: 2, icon: 22)
}

/// A jar as the look draws it: the lid, the glass, what it holds, its icon.
struct PostcardJar: View {
  let jar: SurfaceSnapshot.Jar
  let index: Int
  let entry: SurfaceEntry
  var measure = JarSize.shelf
  /// The small widget's dashed line where the jar is full.
  var targetLine = false

  var body: some View {
    let material = entry.look.jar
    let scale = measure.scale
    let width = measure.width
    let height = measure.height
    let lidH = measure.lidH
    let bodyTop = measure.bodyTop
    let shape = UnevenRoundedRectangle(
      topLeadingRadius: material.radiusTop * scale, bottomLeadingRadius: material.radiusBottom * scale,
      bottomTrailingRadius: material.radiusBottom * scale, topTrailingRadius: material.radiusTop * scale,
      style: .continuous)
    let edgeColor =
      material.edge.color.map { Color(css: $0) } ?? entry.ink.opacity(0.18)
    let fill = material.fills.isEmpty ? nil : material.fills[index % material.fills.count]
    ZStack(alignment: .top) {
      ZStack(alignment: .bottom) {
        Group {
          if let body = material.body { FillView(fill: body) } else { Color(css: jar.glass) }
        }
        GeometryReader { proxy in
          let level = proxy.size.height * min(1, max(0, jar.level))
          VStack(spacing: 0) {
            Spacer(minLength: 0)
            ZStack(alignment: .top) {
              if let fill { FillView(fill: fill) } else { Color(css: jar.fill) }
              if fill == nil {
                Rectangle().fill(Color(css: jar.fillTop)).frame(height: 1.5 * scale)
              }
            }
            .frame(height: level)
          }
        }
        if targetLine {
          VStack {
            Line()
              .stroke(
                entry.ink.opacity(entry.dark ? 0.4 : 0.3),
                style: StrokeStyle(lineWidth: 1.5, dash: [4, 3]))
              .frame(height: 1.5)
              .padding(.horizontal, 8)
              .padding(.top, 16)
            Spacer(minLength: 0)
          }
        }
        if material.icon {
          FilledGlyph(glyph: jar.icon, size: measure.icon)
            .foregroundStyle(Color(css: jar.level > 0.48 ? jar.iconHigh : jar.iconLow))
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
      }
      .clipShape(shape)
      .overlay { shape.stroke(edgeColor, lineWidth: material.edge.width) }
      .boxShadows(material.glow.map { [$0] } ?? [], shape: shape)
      .frame(width: width, height: height - bodyTop)
      .padding(.top, bodyTop)
      RoundedRectangle(cornerRadius: material.lidRadius * scale, style: .continuous)
        .fill(Color(css: material.lid ?? jar.lid))
        .frame(width: width - measure.lidInset * 2, height: lidH)
        .boxShadows(
          material.lidGlow.map { [$0] } ?? [],
          shape: RoundedRectangle(cornerRadius: material.lidRadius * scale))
    }
    .frame(width: width, height: height)
  }
}

/// A straight line across its frame, for dashed rules.
struct Line: Shape {
  func path(in rect: CGRect) -> Path {
    Path { path in
      path.move(to: CGPoint(x: rect.minX, y: rect.midY))
      path.addLine(to: CGPoint(x: rect.maxX, y: rect.midY))
    }
  }
}

/// One day of the month as a sun: whole, half, a missed ring, today's accent ring, or still ahead.
struct DaySun: View {
  let cell: String
  let entry: SurfaceEntry
  let size: CGFloat

  var body: some View {
    let dots = entry.look.dots
    let shape = Ellipse()
    Group {
      switch cell {
      case "sun":
        FillView(fill: dots.full)
          .clipShape(shape)
          .overlay {
            if let crease = dots.crease { Crease(color: crease, size: size) }
          }
          .overlay {
            if let ring = dots.fullRing {
              shape.stroke(Color(css: ring.color), lineWidth: ring.width)
            }
          }
          .boxShadows(dots.glow.map { [$0] } ?? [], shape: shape)
      case "half":
        FillView(fill: dots.half)
          .clipShape(shape)
          .overlay {
            if let crease = dots.crease { Crease(color: crease, size: size) }
          }
      case "miss":
        // A look without its own ring draws the missed evening in the sky's ink.
        shape.strokeBorder(
          dots.ring.isEmpty ? entry.ink.opacity(0.35) : Color(css: dots.ring), lineWidth: 1.5)
      case "today":
        shape.strokeBorder(Color(css: entry.look.today), lineWidth: 2)
      case "ahead":
        shape.strokeBorder(entry.ink.opacity(entry.dark ? 0.2 : 0.18), lineWidth: 1)
      default:
        Color.clear
      }
    }
    .frame(width: size * dots.aspect, height: size)
    .frame(width: size, height: size)
  }

  private struct Crease: View {
    let color: String
    let size: CGFloat

    var body: some View {
      Capsule()
        .fill(Color(css: color))
        .frame(width: size * 0.07, height: size * 1.1)
        .rotationEffect(.degrees(14))
        .clipShape(Ellipse())
    }
  }
}

/// The widget's background: the sky, and the look's frame over it.
struct PostcardBackground: View {
  let entry: SurfaceEntry

  var body: some View {
    ZStack {
      PostcardSky(entry: entry)
      WidgetFrameLines(lines: entry.look.frame, radius: 23)
    }
  }
}

/// Before the month is set up: "Open 6pm to set up", on the look's sky.
struct SetUpView: View {
  let entry: SurfaceEntry

  var body: some View {
    Group {
      if let snapshot = entry.snapshot {
        Text(snapshot.text("setUp"))
      } else {
        Text("setUp", tableName: "Surfaces")
      }
    }
    .font(SurfaceFont.body(size: 13, weight: 600))
    .foregroundStyle(entry.snapshot == nil ? ThemeTokens.PlainDay.ink : entry.ink)
    .multilineTextAlignment(.center)
    .padding(16)
    .containerBackground(for: .widget) {
      if entry.snapshot == nil {
        ThemeTokens.PlainDay.sheetSolid
      } else {
        PostcardBackground(entry: entry)
      }
    }
  }
}
