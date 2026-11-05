import SwiftUI
import WidgetKit

/// Safe today, as postcards ("6pm Widgets"): on the Home Screen the number on its sky (small) and
/// with the jars (medium); on the Lock Screen the ring for what is left, the number in a line and
/// the inline "FRI 9 · 49K LEFT". Each opens Today; a jar on the medium one opens that jar.
struct SafeTodayWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "SafeToday", provider: SurfaceTimelineProvider()) { entry in
      SafeTodayView(entry: entry)
    }
    .configurationDisplayName(Text("safeToday.name", tableName: "Surfaces"))
    .description(Text("safeToday.description", tableName: "Surfaces"))
    .supportedFamilies([
      .systemSmall, .systemMedium, .accessoryCircular, .accessoryRectangular, .accessoryInline,
    ])
    .contentMarginsDisabled()
  }
}

struct SafeTodayView: View {
  @Environment(\.widgetFamily) private var family
  let entry: SurfaceEntry

  var body: some View {
    Group {
      switch family {
      case .accessoryCircular: SafeRing(entry: entry)
      case .accessoryRectangular: SafeCard(entry: entry)
      case .accessoryInline: SafeInline(entry: entry)
      case .systemMedium: SafeMedium(entry: entry)
      default: SafeSmall(entry: entry)
      }
    }
    .widgetURL(entry.link(entry.snapshot?.links?.today ?? "/app"))
  }
}

/// Small (`W:173-182`): the kicker, the short number and what it is, on the sky with the sun;
/// once the day is closed, the CLOSED stamp in the corner.
struct SafeSmall: View {
  let entry: SurfaceEntry

  var body: some View {
    if let day = entry.entry, let card = entry.card {
      VStack(alignment: .leading, spacing: 0) {
        Kicker(text: card.kickerShort, entry: entry, size: 9.5)
        Spacer(minLength: 0)
        VStack(alignment: .leading, spacing: 3) {
          PostcardNumber(text: day.safeShort, entry: entry, size: entry.look.numberSmall)
          Text(entry.state == .stale ? entry.text("openApp") : card.subShort)
            .font(SurfaceFont.body(size: 11.5, weight: 600))
            .opacity(0.8)
            .lineLimit(1)
        }
      }
      .foregroundStyle(entry.ink)
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
      .padding(14)
      .overlay(alignment: .topTrailing) {
        if card.closed, let time = card.closedAt {
          ClosedStamp(word: entry.text("stamp"), time: time, ink: entry.ink)
            .padding(12)
        }
      }
      .background { PostcardSun(entry: entry, size: 40, small: true) }
      .containerBackground(for: .widget) { PostcardBackground(entry: entry) }
    } else {
      SetUpView(entry: entry)
    }
  }
}

/// "CLOSED · 18:04", pressed on at an angle once the day is closed.
struct ClosedStamp: View {
  let word: String
  let time: String
  let ink: Color

  var body: some View {
    VStack(spacing: 0) {
      Text(word)
      Text(time)
    }
    .font(SurfaceFont.mono(size: 8.5))
    .trackingEm(0.12, size: 8.5)
    .multilineTextAlignment(.center)
    .padding(.horizontal, 6)
    .padding(.vertical, 3)
    .overlay(RoundedRectangle(cornerRadius: 4).stroke(ink, lineWidth: 2))
    .foregroundStyle(ink)
    .rotationEffect(.degrees(-7))
    .opacity(0.92)
  }
}

/// Medium (`W:51-71`): the kicker, the number, the day's bar and what it means, then the jars,
/// each opening its own page.
struct SafeMedium: View {
  let entry: SurfaceEntry

  var body: some View {
    if let day = entry.entry, let card = entry.card {
      HStack(spacing: 12) {
        VStack(alignment: .leading, spacing: 0) {
          Kicker(text: card.kicker, entry: entry)
          Spacer(minLength: 0)
          VStack(alignment: .leading, spacing: 4) {
            PostcardNumber(text: card.number, entry: entry, size: entry.look.numberMedium)
            LineBar(
              fraction: card.used, track: entry.ink.opacity(entry.dark ? 0.22 : 0.14),
              fill: entry.ink, height: 5
            )
            .frame(width: 140)
            Text(entry.state == .stale ? entry.text("openApp") : card.sub)
              .font(SurfaceFont.body(size: 12, weight: 600))
              .opacity(0.8)
              .lineLimit(1)
              .minimumScaleFactor(0.8)
          }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        let jars = Array((entry.snapshot?.jars ?? []).prefix(4))
        if !jars.isEmpty {
          HStack(alignment: .bottom, spacing: 5) {
            ForEach(Array(jars.enumerated()), id: \.element.id) { index, jar in
              Link(destination: entry.link(jar.path) ?? URL(fileURLWithPath: "/")) {
                VStack(spacing: 4) {
                  PostcardJar(jar: jar, index: index, entry: entry)
                  PrivateText(text: jar.amountText, entry: entry)
                    .font(SurfaceFont.body(size: 9.5, weight: 700))
                    .monospacedDigit()
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
                    .opacity(0.85)
                    .frame(width: 38)
                }
              }
            }
          }
          .padding(.bottom, 2)
          .frame(maxHeight: .infinity, alignment: .bottom)
        }
      }
      .foregroundStyle(entry.ink)
      .padding(16)
      .background { PostcardSun(entry: entry, size: 54, small: false) }
      .containerBackground(for: .widget) { PostcardBackground(entry: entry) }
    } else {
      SetUpView(entry: entry)
    }
  }
}

/// Lock Screen ring (`W:134-137`): what is left of today's line round the short number.
struct SafeRing: View {
  let entry: SurfaceEntry

  var body: some View {
    let fraction = entry.state == .day ? (entry.entry?.ringFraction ?? 0) : 0
    ZStack {
      AccessoryWidgetBackground()
      Group {
        Circle().stroke(ThemeTokens.Activity.ink.opacity(0.25), lineWidth: 4)
        Circle()
          .trim(from: 0, to: fraction)
          .stroke(ThemeTokens.Activity.ink, style: StrokeStyle(lineWidth: 4, lineCap: .butt))
          .rotationEffect(.degrees(-90))
      }
      .padding(6)
      PrivateText(text: entry.entry?.safeShort ?? "–", entry: entry)
        .font(SurfaceFont.body(size: 16, weight: 700))
        .monospacedDigit()
        .minimumScaleFactor(0.6)
        .lineLimit(1)
        .padding(.horizontal, 13)
        .contentTransition(.numericText())
    }
    .widgetAccentable()
    .containerBackground(for: .widget) {}
  }
}

/// Lock Screen card (`W:138-142`): "6PM", the number in a line, and when the close is.
struct SafeCard: View {
  let entry: SurfaceEntry

  var body: some View {
    VStack(alignment: .leading, spacing: 0) {
      if let card = entry.card {
        HStack(spacing: 5) {
          Text(entry.text("glyph.close")).font(SurfaceFont.symbol(size: 14))
          Text(entry.text("brand").uppercased())
        }
        .font(SurfaceFont.body(size: 12, weight: 700))
        .opacity(0.85)
        Spacer(minLength: 0)
        PrivateText(text: card.amount, entry: entry)
          .font(SurfaceFont.body(size: 20, weight: 700))
          .monospacedDigit()
          .lineLimit(1)
          .minimumScaleFactor(0.6)
          .contentTransition(.numericText())
        Spacer(minLength: 0)
        Text(entry.state == .stale ? entry.text("openApp") : card.lockSub)
          .font(SurfaceFont.body(size: 12, weight: 600))
          .opacity(0.85)
          .lineLimit(1)
      } else if let snapshot = entry.snapshot {
        Text(snapshot.text("setUp")).font(SurfaceFont.body(size: 12, weight: 600))
      } else {
        Text("setUp", tableName: "Surfaces").font(SurfaceFont.body(size: 12, weight: 600))
      }
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    .padding(.horizontal, 12)
    .padding(.vertical, 10)
    .containerBackground(for: .widget) { AccessoryWidgetBackground() }
  }
}

/// Lock Screen inline, above the clock: "Fri 9 · 49k left", the amount hidden while locked when
/// the person asked for that.
struct SafeInline: View {
  let entry: SurfaceEntry

  var body: some View {
    if let card = entry.card {
      Group {
        if entry.hideAmounts {
          Line(card: card).privacySensitive()
        } else {
          Line(card: card)
        }
      }
      .containerBackground(for: .widget) {}
    } else {
      Text(entry.text("setUp")).containerBackground(for: .widget) {}
    }
  }

  private struct Line: View {
    @Environment(\.redactionReasons) private var reasons
    let card: SurfaceSnapshot.Card

    var body: some View {
      let masked = reasons.contains(.privacy)
      Label {
        Text(masked ? card.inlineHidden : card.inline)
      } icon: {
        Image(systemName: "sun.horizon.fill")
      }
      .unredacted()
    }
  }
}
