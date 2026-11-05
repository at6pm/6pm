import SwiftUI
import WidgetKit

/// Today's receipt (medium, `W:197-205`): today's catches printing as receipt lines on the close's
/// paper, the unconfirmed ones faint, what is left at the foot, and the CLOSED stamp once the day
/// is closed. Paper is the same in every look. Opens Today.
struct ReceiptWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "Receipt", provider: SurfaceTimelineProvider()) { entry in
      ReceiptView(entry: entry)
    }
    .configurationDisplayName(Text("receipt.name", tableName: "Surfaces"))
    .description(Text("receipt.description", tableName: "Surfaces"))
    .supportedFamilies([.systemMedium])
    .contentMarginsDisabled()
  }
}

struct ReceiptView: View {
  let entry: SurfaceEntry

  var body: some View {
    if let card = entry.card, let receipt = entry.snapshot?.receipt {
      // The receipt is today's: from tomorrow's first stretch it starts again, empty.
      let today = card.day == nil || card.day == receipt.day
      let lines = today ? receipt.lines : []
      let ink = ThemeTokens.Paper.ink
      VStack(alignment: .leading, spacing: 6) {
        HStack {
          Text(today ? receipt.title : "")
          Spacer(minLength: 8)
          Text(today ? receipt.number : "")
        }
        .font(SurfaceFont.mono(size: 10))
        .trackingEm(0.12, size: 10)
        .foregroundStyle(ThemeTokens.Paper.soft)
        .lineLimit(1)
        .minimumScaleFactor(0.8)
        DashedRule()
        if !receipt.earlier.isEmpty, today {
          Text(receipt.earlier)
            .font(SurfaceFont.mono(size: 10))
            .foregroundStyle(ThemeTokens.Paper.soft)
        }
        if lines.isEmpty {
          Text(receipt.empty)
            .font(SurfaceFont.mono(size: 11.5))
            .foregroundStyle(ThemeTokens.Paper.soft)
        }
        ForEach(Array(lines.enumerated()), id: \.offset) { _, line in
          HStack(spacing: 10) {
            Text(line.time).foregroundStyle(ThemeTokens.Paper.soft)
            Text(line.name).lineLimit(1).truncationMode(.tail)
            Spacer(minLength: 4)
            PrivateText(text: line.amount, entry: entry).monospacedDigit()
          }
          .font(SurfaceFont.mono(size: 11.5))
          .opacity(line.confirmed || card.closed ? 1 : 0.5)
        }
        Spacer(minLength: 0)
        HStack {
          Text(receipt.left)
            .font(SurfaceFont.mono(size: 12))
            .fontWeight(.semibold)
          Spacer(minLength: 8)
          PrivateText(text: card.amount, entry: entry)
            .font(SurfaceFont.display(entry.displayFont, size: 20, weight: 500))
            .monospacedDigit()
            .contentTransition(.numericText())
        }
        .lineLimit(1)
        .padding(.top, 6)
        .overlay(alignment: .top) { DashedRule() }
      }
      .foregroundStyle(ink)
      .padding(EdgeInsets(top: 14, leading: 16, bottom: 16, trailing: 16))
      .overlay(alignment: .topTrailing) {
        if card.closed, today, let time = card.closedAt {
          VStack(spacing: 0) {
            Text(entry.text("stamp"))
            Text(time)
          }
          .font(SurfaceFont.mono(size: 13))
          .fontWeight(.semibold)
          .trackingEm(0.14, size: 13)
          .multilineTextAlignment(.center)
          .foregroundStyle(ThemeTokens.Paper.stamp)
          .padding(.horizontal, 10)
          .padding(.vertical, 5)
          .overlay(RoundedRectangle(cornerRadius: 5).stroke(ThemeTokens.Paper.stamp, lineWidth: 2.5))
          .rotationEffect(.degrees(-7))
          .opacity(0.92)
          .padding(.top, 42)
          .padding(.trailing, 22)
        }
      }
      .overlay(alignment: .bottom) { ReceiptTeeth() }
      .containerBackground(ThemeTokens.Paper.sheet, for: .widget)
      .widgetURL(entry.link(entry.snapshot?.links?.today ?? "/app"))
    } else {
      SetUpView(entry: entry)
    }
  }
}

/// A dashed rule across the receipt.
struct DashedRule: View {
  var body: some View {
    Line()
      .stroke(ThemeTokens.Paper.rule, style: StrokeStyle(lineWidth: 1, dash: [3, 3]))
      .frame(height: 1)
  }
}

/// The torn foot of the receipt: the soft shadow of its teeth along the bottom edge, as the
/// close receipt draws it (a widget cannot cut through to the wallpaper).
struct ReceiptTeeth: View {
  var body: some View {
    GeometryReader { proxy in
      Path { path in
        var x: CGFloat = 5
        while x < proxy.size.width + 5 {
          path.addEllipse(in: CGRect(x: x - 4.5, y: 7 - 4.5, width: 9, height: 9))
          x += 10
        }
      }
      .fill(ThemeTokens.Paper.edgeShadow)
    }
    .frame(height: 7)
    .offset(y: 1)
    .allowsHitTesting(false)
  }
}
