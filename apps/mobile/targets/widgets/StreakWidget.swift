import SwiftUI
import WidgetKit

/// Streak (small, `W:78-85`): the evenings closed in a row as strata, each band the sky that
/// evening closed under and tonight's hatched while it is open, over the count and the sun
/// setting into it.
struct StreakWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "Streak", provider: SurfaceTimelineProvider()) { entry in
      StreakView(entry: entry)
    }
    .configurationDisplayName(Text("streak.name", tableName: "Surfaces"))
    .description(Text("streak.description", tableName: "Surfaces"))
    .supportedFamilies([.systemSmall])
    .contentMarginsDisabled()
  }
}

struct StreakView: View {
  let entry: SurfaceEntry

  var body: some View {
    if entry.entry != nil, let streak = entry.snapshot?.streak {
      let look = entry.look
      VStack(spacing: 0) {
        VStack(spacing: 2) {
          ForEach(Array(streak.bands.enumerated()), id: \.offset) { _, band in
            RoundedRectangle(cornerRadius: 4, style: .continuous)
              .fill(
                LinearGradient(
                  stops: band.enumerated().map { k, colour in
                    .init(color: Color(css: colour), location: [0, 0.55, 1][min(k, 2)])
                  },
                  startPoint: .leading, endPoint: .trailing))
          }
          if streak.open {
            Hatch(color: Color(css: look.hatch))
              .clipShape(RoundedRectangle(cornerRadius: 4, style: .continuous))
          }
        }
        .padding(EdgeInsets(top: 6, leading: 6, bottom: 0, trailing: 6))
        .frame(maxHeight: .infinity)
        HStack(alignment: .bottom, spacing: 8) {
          Text(String(streak.count))
            .font(SurfaceFont.display(entry.displayFont, size: 40, weight: look.displayWeight))
            .trackingEm(-0.04, size: 40)
            .lineLimit(1)
            .minimumScaleFactor(0.6)
            .contentTransition(.numericText(value: Double(streak.count)))
          VStack(alignment: .leading, spacing: 0) {
            Text(entry.text("streakLine1"))
            Text(entry.text("streakLine2"))
          }
          .font(SurfaceFont.mono(size: 8.5))
          .trackingEm(0.14, size: 8.5)
          .foregroundStyle(Color(css: look.streakWord))
          .lineLimit(1)
          .minimumScaleFactor(0.7)
          .padding(.bottom, 4)
          Spacer(minLength: 0)
        }
        .padding(EdgeInsets(top: 10, leading: 14, bottom: 6, trailing: 14))
        .frame(height: 62, alignment: .bottom)
        .overlay(alignment: .top) {
          Rectangle().fill(Color(css: look.streakLine)).frame(height: 1)
        }
        .overlay(alignment: .topTrailing) {
          // The sun sets into the line: only its top half shows.
          if let sun = look.sun("dusk") ?? look.sun("day") {
            SunDisc(sun: sun, look: look, size: 38, glows: false)
              .frame(width: 38, height: 38)
              .mask(alignment: .top) { Rectangle().frame(height: 19) }
              .offset(y: -19)
              .padding(.trailing, 16)
          }
        }
      }
      .foregroundStyle(ThemeTokens.Activity.ink)
      .containerBackground(Color(css: look.streakGround), for: .widget)
      .widgetURL(entry.link(entry.snapshot?.links?.streak ?? "/app"))
    } else {
      SetUpView(entry: entry)
    }
  }
}
