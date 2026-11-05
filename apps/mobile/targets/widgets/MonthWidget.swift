import SwiftUI
import WidgetKit

/// My month (large, `W:104-112`): the month as suns, each evening closed a whole sun, over the
/// line half of one, and tonight's close at the foot. Opens the Diary at the month. Its kind is
/// the large widget's from before the postcards, so a widget already placed turns into the month.
struct MonthWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "TodayList", provider: SurfaceTimelineProvider()) { entry in
      MonthView(entry: entry)
    }
    .configurationDisplayName(Text("month.name", tableName: "Surfaces"))
    .description(Text("month.description", tableName: "Surfaces"))
    .supportedFamilies([.systemLarge])
    .contentMarginsDisabled()
  }
}

struct MonthView: View {
  let entry: SurfaceEntry

  var body: some View {
    if let card = entry.card, let month = entry.snapshot?.month {
      let rows = max(5, (month.cells.count + 6) / 7)
      let dot: CGFloat = rows > 5 ? 24 : 30
      VStack(alignment: .leading, spacing: 10) {
        HStack(alignment: .firstTextBaseline) {
          Kicker(text: month.title, entry: entry)
          Spacer(minLength: 8)
          Text(entry.text("brand"))
            .font(SurfaceFont.display(entry.displayFont, size: 15, weight: 600))
        }
        Text(month.headline)
          .font(SurfaceFont.display(entry.displayFont, size: 30, weight: 500))
          .trackingEm(-0.02, size: 30)
          .lineLimit(2)
          .minimumScaleFactor(0.7)
          .fixedSize(horizontal: false, vertical: true)
        Grid(horizontalSpacing: 8, verticalSpacing: rows > 5 ? 5 : 6) {
          ForEach(0..<rows, id: \.self) { row in
            GridRow {
              ForEach(0..<7, id: \.self) { column in
                let index = row * 7 + column
                DaySun(
                  cell: index < month.cells.count ? month.cells[index] : "blank", entry: entry,
                  size: dot)
              }
            }
          }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 4)
        Spacer(minLength: 0)
        HStack {
          Text(entry.text("tonight"))
          Spacer(minLength: 8)
          Text(entry.state == .stale ? entry.text("openApp") : card.tonight).fontWeight(.semibold)
        }
        .font(SurfaceFont.mono(size: 11))
        .lineLimit(1)
        .padding(.top, 10)
        .overlay(alignment: .top) {
          Line()
            .stroke(
              entry.ink.opacity(entry.dark ? 0.4 : 0.3), style: StrokeStyle(lineWidth: 1, dash: [3, 3])
            )
            .frame(height: 1)
        }
      }
      .foregroundStyle(entry.ink)
      .padding(EdgeInsets(top: 18, leading: 18, bottom: 16, trailing: 18))
      .containerBackground(for: .widget) { PostcardBackground(entry: entry) }
      .widgetURL(entry.link(entry.snapshot?.links?.month ?? "/app"))
    } else {
      SetUpView(entry: entry)
    }
  }
}
