import SwiftUI
import WidgetKit

/// Today (large): what is left on the hour's sky, the day's spend against its line, then today's
/// newest three spends and "+N more" with what they add up to. A postcard like the rest, in the
/// look's sky and type; its list leaves no room for the sun. Opens Today.
struct TodayListWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "TodayList", provider: SurfaceTimelineProvider()) { entry in
      TodayListView(entry: entry)
    }
    .configurationDisplayName(Text("todayList.name", tableName: "Surfaces"))
    .description(Text("todayList.description", tableName: "Surfaces"))
    .supportedFamilies([.systemLarge])
    .contentMarginsDisabled()
  }
}

struct TodayListView: View {
  let entry: SurfaceEntry

  var body: some View {
    if let day = entry.entry, let card = entry.card {
      let ink = entry.ink
      VStack(alignment: .leading, spacing: 0) {
        HStack(alignment: .firstTextBaseline) {
          Kicker(text: card.kicker, entry: entry)
          Spacer(minLength: 8)
          Text(entry.text("brand"))
            .font(SurfaceFont.display(entry.displayFont, size: 15, weight: 600))
        }
        PostcardNumber(text: card.number, entry: entry, size: entry.look.numberMedium)
          .padding(.top, 14)
        if let fraction = day.spentFraction {
          VStack(spacing: 5) {
            LineBar(
              fraction: fraction, track: ink.opacity(entry.dark ? 0.22 : 0.14), fill: ink, height: 5)
            HStack {
              PrivateText(text: day.spentText ?? "", entry: entry)
              Spacer(minLength: 8)
              PrivateText(text: day.lineText ?? "", entry: entry)
            }
            .font(SurfaceFont.body(size: 11, weight: 600))
            .opacity(0.7)
            .lineLimit(1)
          }
          .padding(EdgeInsets(top: 8, leading: 0, bottom: 10, trailing: 0))
        } else {
          Spacer().frame(height: 10)
        }
        if day.list.isEmpty {
          ListLine(ink: ink) {
            Text(entry.text("listEmpty")).opacity(0.7)
            Spacer(minLength: 0)
          }
        }
        ForEach(Array(day.list.enumerated()), id: \.offset) { _, row in
          SpendLine(
            row: row, entry: entry, ink: ink,
            pendingInk: entry.color(entry.dark ? "pendingInkDark" : "pendingInk"))
        }
        if !day.moreText.isEmpty {
          ListLine(ink: ink, vertical: 7) {
            Text(day.moreText)
            Spacer(minLength: 0)
            PrivateText(text: day.moreAmountText ?? "", entry: entry)
          }
          .opacity(0.7)
        }
        if entry.state == .stale {
          ListLine(ink: ink, vertical: 7) {
            Text(entry.text("openApp")).font(SurfaceFont.body(size: 14, weight: 600))
            Spacer(minLength: 0)
          }
        }
        Spacer(minLength: 0)
      }
      .font(SurfaceFont.body(size: 14, weight: 400))
      .foregroundStyle(ink)
      .padding(EdgeInsets(top: 18, leading: 18, bottom: 12, trailing: 18))
      .containerBackground(for: .widget) { PostcardBackground(entry: entry) }
      .widgetURL(entry.link(entry.snapshot?.links?.today ?? "/app"))
    } else {
      SetUpView(entry: entry)
    }
  }
}

/// A row of the list with its 0.5 pt rule above it.
struct ListLine<Content: View>: View {
  let ink: Color
  var vertical: CGFloat = 6
  @ViewBuilder let content: () -> Content

  var body: some View {
    HStack(spacing: 9, content: content)
      .padding(.vertical, vertical)
      .overlay(alignment: .top) {
        Rectangle().fill(ink.opacity(0.14)).frame(height: 0.5)
      }
  }
}

/// One spend: its 26 pt tile, the name (and PENDING while it waits), the amount.
struct SpendLine: View {
  let row: SurfaceSnapshot.Row
  let entry: SurfaceEntry
  let ink: Color
  let pendingInk: Color

  var body: some View {
    let hue = row.hue.truncatingRemainder(dividingBy: 1) == 0 ? String(Int(row.hue)) : String(row.hue)
    ListLine(ink: ink) {
      FilledGlyph(glyph: row.icon, size: 16)
        .foregroundStyle(Color(css: entry.text("tile.\(hue).glyph")))
        .frame(width: 26, height: 26)
        .background(
          LinearGradient(
            colors: [
              Color(css: entry.text("tile.\(hue).from")), Color(css: entry.text("tile.\(hue).to")),
            ],
            // CSS 155deg.
            startPoint: UnitPoint(x: 0.29, y: 0.05), endPoint: UnitPoint(x: 0.71, y: 0.95)),
          in: RoundedRectangle(cornerRadius: 9, style: .continuous))
      HStack(spacing: 4) {
        Text(row.name).lineLimit(1)
        if row.pending {
          Text(entry.text("pendingTag").uppercased())
            .font(SurfaceFont.body(size: 11, weight: 700))
            .trackingEm(0.04, size: 11)
            .foregroundStyle(pendingInk)
        }
      }
      Spacer(minLength: 8)
      PrivateText(text: row.amountText, entry: entry)
        .font(SurfaceFont.body(size: 14, weight: 600))
        .monospacedDigit()
    }
  }
}
