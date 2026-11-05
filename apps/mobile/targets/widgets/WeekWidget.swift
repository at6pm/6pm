import SwiftUI
import WidgetKit

/// This week (small, `W:185-192`): "THIS WEEK", a sun for each day Monday to Sunday (half a sun
/// over the line, tonight's ring while it is open, a missed day's ring), and the line under them.
/// Opens the Diary.
struct WeekWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "Week", provider: SurfaceTimelineProvider()) { entry in
      WeekView(entry: entry)
    }
    .configurationDisplayName(Text("week.name", tableName: "Surfaces"))
    .description(Text("week.description", tableName: "Surfaces"))
    .supportedFamilies([.systemSmall])
    .contentMarginsDisabled()
  }
}

struct WeekView: View {
  let entry: SurfaceEntry

  var body: some View {
    if entry.entry != nil, let week = entry.snapshot?.week {
      VStack(alignment: .leading, spacing: 0) {
        Kicker(text: week.title, entry: entry, size: 9.5)
        Spacer(minLength: 0)
        HStack(spacing: 3) {
          ForEach(Array(week.cells.enumerated()), id: \.offset) { index, cell in
            VStack(spacing: 4) {
              DaySun(cell: cell, entry: entry, size: 16)
              Text(index < week.letters.count ? week.letters[index] : "")
                .font(SurfaceFont.body(size: 9, weight: 700))
                .opacity(0.6)
                .lineLimit(1)
            }
            .frame(maxWidth: .infinity)
          }
        }
        Spacer(minLength: 0)
        Text(week.line)
          .font(SurfaceFont.display(entry.displayFont, size: 17, weight: min(entry.look.displayWeight, 600)))
          .lineLimit(2)
          .minimumScaleFactor(0.8)
          .fixedSize(horizontal: false, vertical: true)
      }
      .foregroundStyle(entry.ink)
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
      .padding(14)
      .containerBackground(for: .widget) { PostcardBackground(entry: entry) }
      .widgetURL(entry.link(entry.snapshot?.links?.month ?? "/app"))
    } else {
      SetUpView(entry: entry)
    }
  }
}
