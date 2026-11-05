import SwiftUI

/// A look's widget materials as the app wrote them (`widgetInks` in `@6pm/theme`): its sun for
/// each part of the day, its jars, its dots and its type. Swift only reads them.
struct PostcardLook: Decodable {
  struct Fill: Decodable {
    let kind: String
    let stops: [Stop]
    let center: [Double]?
    let angle: Double?
  }

  /// A gradient stop as `[colour, location]`.
  struct Stop: Decodable {
    let color: String
    let location: Double

    init(from decoder: Decoder) throws {
      var pair = try decoder.unkeyedContainer()
      color = try pair.decode(String.self)
      location = try pair.decode(Double.self)
    }
  }

  struct Shadow: Decodable {
    let x: Double
    let y: Double
    let blur: Double
    let spread: Double
    let color: String
  }

  struct Sun: Decodable {
    let fill: Fill
    let shadows: [Shadow]
  }

  struct Suns: Decodable {
    let day: Sun?
    let noon: Sun?
    let dusk: Sun?
    let night: Sun?
  }

  struct Ring: Decodable {
    let width: Double
    let color: String
  }

  struct Ground: Decodable {
    let day: String
    let night: String
  }

  struct Dots: Decodable {
    let full: Fill
    let half: Fill
    let ring: String
    let aspect: Double
    let fullRing: Ring?
    let glow: Shadow?
    let crease: String?
  }

  struct Edge: Decodable {
    let width: Double
    let color: String?
  }

  struct Jar: Decodable {
    let lid: String?
    let body: Fill?
    let edge: Edge
    let lidRadius: Double
    let radiusTop: Double
    let radiusBottom: Double
    let lidGlow: Shadow?
    let glow: Shadow?
    let fills: [Fill]
    let icon: Bool
  }

  let id: String
  let ground: Ground?
  let suns: Suns
  let sunAspect: Double
  let sunRing: Ring?
  let sunCrease: String?
  let frame: [Ring]
  let dots: Dots
  let jar: Jar
  let numberShadows: [Shadow]
  let numberGlow: [Shadow]
  let displayWeight: Double
  let numberMedium: Double
  let numberSmall: Double
  let numberTracking: Double
  let mono: Bool
  let streakGround: String
  let streakLine: String
  let streakWord: String
  let hatch: String
  let today: String

  /// A stretch's sun by its kind ("day", "noon", "dusk", "night").
  func sun(_ kind: String?) -> Sun? {
    switch kind {
    case "night": return suns.night
    case "dusk": return suns.dusk
    case "noon": return suns.noon
    default: return suns.day
    }
  }

  /// Before the app has written a look: no sun, no materials, the ink of the sky alone.
  static let plain: PostcardLook = {
    let empty = Fill(kind: "solid", stops: [], center: nil, angle: nil)
    return PostcardLook(
      id: "", ground: nil, suns: Suns(day: nil, noon: nil, dusk: nil, night: nil), sunAspect: 1,
      sunRing: nil, sunCrease: nil, frame: [],
      dots: Dots(
        full: empty, half: empty, ring: "", aspect: 1, fullRing: nil, glow: nil, crease: nil),
      jar: Jar(
        lid: nil, body: nil, edge: Edge(width: 1, color: nil), lidRadius: 3, radiusTop: 10,
        radiusBottom: 12, lidGlow: nil, glow: nil, fills: [], icon: true),
      numberShadows: [], numberGlow: [], displayWeight: 500, numberMedium: 44, numberSmall: 40,
      numberTracking: -0.03, mono: true, streakGround: "", streakLine: "", streakWord: "",
      hatch: "", today: "")
  }()
}

extension PostcardLook.Fill {
  init(kind: String, stops: [PostcardLook.Stop], center: [Double]?, angle: Double?) {
    self.kind = kind
    self.stops = stops
    self.center = center
    self.angle = angle
  }
}

extension PostcardLook {
  init(
    id: String, ground: Ground?, suns: Suns, sunAspect: Double, sunRing: Ring?, sunCrease: String?,
    frame: [Ring], dots: Dots, jar: Jar, numberShadows: [Shadow], numberGlow: [Shadow],
    displayWeight: Double, numberMedium: Double, numberSmall: Double, numberTracking: Double,
    mono: Bool, streakGround: String, streakLine: String, streakWord: String, hatch: String,
    today: String
  ) {
    self.id = id
    self.ground = ground
    self.suns = suns
    self.sunAspect = sunAspect
    self.sunRing = sunRing
    self.sunCrease = sunCrease
    self.frame = frame
    self.dots = dots
    self.jar = jar
    self.numberShadows = numberShadows
    self.numberGlow = numberGlow
    self.displayWeight = displayWeight
    self.numberMedium = numberMedium
    self.numberSmall = numberSmall
    self.numberTracking = numberTracking
    self.mono = mono
    self.streakGround = streakGround
    self.streakLine = streakLine
    self.streakWord = streakWord
    self.hatch = hatch
    self.today = today
  }
}

/// A fill as CSS draws it, over the frame it is given: a colour, a radial or linear gradient, the
/// Riso halftone, or Long Exposure's trails.
struct FillView: View {
  let fill: PostcardLook.Fill

  var body: some View {
    GeometryReader { proxy in
      let size = proxy.size
      let stops = fill.stops.map { Gradient.Stop(color: Color(css: $0.color), location: $0.location) }
      switch fill.kind {
      case "radial":
        let center = UnitPoint(x: fill.center?.first ?? 0.5, y: fill.center?.last ?? 0.5)
        RadialGradient(
          stops: stops, center: center, startRadius: 0,
          endRadius: farthestCorner(center, in: size))
      case "linear":
        let (start, end) = linearPoints(fill.angle ?? 180)
        LinearGradient(stops: stops, startPoint: start, endPoint: end)
      case "dots":
        Halftone(color: Color(css: fill.stops.first?.color))
      case "stripes":
        Trails(color: Color(css: fill.stops.first?.color))
      default:
        Color(css: fill.stops.first?.color)
      }
    }
  }
}

/// CSS's `farthest-corner`: a radial gradient reaches the corner furthest from its centre.
private func farthestCorner(_ center: UnitPoint, in size: CGSize) -> CGFloat {
  let x = max(center.x, 1 - center.x) * size.width
  let y = max(center.y, 1 - center.y) * size.height
  return (x * x + y * y).squareRoot()
}

/// A CSS gradient angle as unit points: 180° runs top to bottom, 90° left to right.
private func linearPoints(_ degrees: Double) -> (UnitPoint, UnitPoint) {
  let radians = degrees * .pi / 180
  let dx = sin(radians) / 2
  let dy = -cos(radians) / 2
  return (UnitPoint(x: 0.5 - dx, y: 0.5 - dy), UnitPoint(x: 0.5 + dx, y: 0.5 + dy))
}

/// Riso Club's second ink: 1.2 pt dots on a 4 pt grid.
private struct Halftone: View {
  let color: Color

  var body: some View {
    GeometryReader { proxy in
      Path { path in
        var y: CGFloat = 2
        while y < proxy.size.height + 2 {
          var x: CGFloat = 2
          while x < proxy.size.width + 2 {
            path.addEllipse(in: CGRect(x: x - 1.3, y: y - 1.3, width: 2.6, height: 2.6))
            x += 4
          }
          y += 4
        }
      }
      .fill(color)
    }
  }
}

/// Long Exposure's trails: 2 pt lines every 5 pt.
private struct Trails: View {
  let color: Color

  var body: some View {
    GeometryReader { proxy in
      Path { path in
        var y: CGFloat = 0
        while y < proxy.size.height {
          path.addRect(CGRect(x: 0, y: y, width: proxy.size.width, height: 2))
          y += 5
        }
      }
      .fill(color)
    }
  }
}

/// The open evening's hatch on the streak's strata: 4 pt stripes, 8 pt apart.
struct Hatch: View {
  let color: Color

  var body: some View {
    GeometryReader { proxy in
      Path { path in
        var x: CGFloat = 0
        while x < proxy.size.width {
          path.addRect(CGRect(x: x, y: 0, width: 4, height: proxy.size.height))
          x += 8
        }
      }
      .fill(color)
    }
  }
}

extension View {
  /// CSS box shadows behind a shape, the first on top: a spread grows the shape, a blur softens
  /// it, an offset moves it.
  func boxShadows<S: Shape>(_ shadows: [PostcardLook.Shadow], shape: S) -> some View {
    background {
      ZStack {
        ForEach(Array(shadows.enumerated().reversed()), id: \.offset) { _, shadow in
          shape
            .fill(Color(css: shadow.color))
            .padding(-shadow.spread)
            .offset(x: shadow.x, y: shadow.y)
            .blur(radius: shadow.blur / 2)
        }
      }
    }
  }

  /// CSS text shadows: each a copy of the text behind it, offset and blurred.
  func textShadows(_ shadows: [PostcardLook.Shadow]) -> some View {
    shadows.reduce(AnyView(self)) { view, shadow in
      AnyView(
        view.shadow(color: Color(css: shadow.color), radius: shadow.blur / 2, x: shadow.x, y: shadow.y))
    }
  }
}

/// The sun, as the look draws it at a size: its fill in its shape, its glow behind, Neon Alley's
/// tube round it and Cà Phê's crease across it.
struct SunDisc: View {
  let sun: PostcardLook.Sun
  let look: PostcardLook
  let size: CGFloat

  var body: some View {
    let width = size * look.sunAspect
    FillView(fill: sun.fill)
      .clipShape(Ellipse())
      .overlay {
        if let crease = look.sunCrease {
          Capsule()
            .fill(Color(css: crease))
            .frame(width: size * 0.07, height: size * 1.1)
            .rotationEffect(.degrees(14))
            .clipShape(Ellipse())
        }
      }
      .overlay {
        if let ring = look.sunRing {
          Ellipse()
            .stroke(Color(css: ring.color), lineWidth: ring.width)
            .padding(-ring.width / 2)
        }
      }
      .frame(width: width, height: size)
      .boxShadows(sun.shadows, shape: Ellipse())
  }
}

/// The look's inset lines round the whole widget (Sơn Mài's gold edge, Paper's mount).
struct WidgetFrameLines: View {
  let lines: [PostcardLook.Ring]
  let radius: CGFloat

  var body: some View {
    ZStack {
      ForEach(Array(lines.enumerated()), id: \.offset) { _, line in
        ContainerRelativeShape()
          .inset(by: line.width / 2)
          .stroke(Color(css: line.color), lineWidth: line.width)
      }
    }
    .allowsHitTesting(false)
  }
}
