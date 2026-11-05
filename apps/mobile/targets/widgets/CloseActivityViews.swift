import SwiftUI
import WidgetKit

/// The close at six as a Live Activity (`closeActivitySchema` in `@6pm/domain`), already worded.
struct CloseState: Decodable {
  let day: String
  let title: String
  let detail: String
  let slips: Int
  let start: String
  let path: String
  let icon: String
  let accent: String
  let onAccent: String
  let paper: String
}

/// The waiting spends as slips of paper, each at its own slight angle.
struct CloseSlips: View {
  let count: Int
  let paper: Color

  private static let angles: [Double] = [-3, 2, -1, 3, -2, 1]

  var body: some View {
    HStack(spacing: 4) {
      ForEach(0..<min(count, Self.angles.count), id: \.self) { k in
        RoundedRectangle(cornerRadius: 2)
          .fill(paper)
          .frame(width: 30, height: 14)
          .rotationEffect(.degrees(Self.angles[k]))
      }
    }
  }
}

/// The close's tile: the accent square with the setting sun.
struct CloseTile: View {
  let state: CloseState
  var size: CGFloat = 44

  var body: some View {
    FilledGlyph(glyph: state.icon, size: size * 0.6)
      .foregroundStyle(Color(css: state.onAccent))
      .frame(width: size, height: size)
      .background(
        Color(css: state.accent), in: RoundedRectangle(cornerRadius: size * 0.32, style: .continuous))
  }
}

/// "Start", which opens the close.
struct CloseStart: View {
  let state: CloseState

  var body: some View {
    Link(destination: appLink(state.path) ?? URL(fileURLWithPath: "/")) {
      Text(state.start)
        .font(SurfaceFont.body(size: 14, weight: 700))
        .foregroundStyle(Color(css: state.onAccent))
        .padding(.horizontal, 14)
        .frame(height: 36)
        .background(Color(css: state.paper), in: Capsule())
    }
  }
}

/// Lock Screen (`W:150-154`): the tile, "It's six. Close your day." over the waiting slips, Start.
struct CloseLock: View {
  let state: CloseState

  var body: some View {
    HStack(spacing: 12) {
      CloseTile(state: state)
      VStack(alignment: .leading, spacing: 2) {
        Text(state.title)
          .font(SurfaceFont.display(activityDisplayFont, size: 19))
          .lineLimit(1)
          .minimumScaleFactor(0.7)
        if state.slips > 0 {
          CloseSlips(count: state.slips, paper: Color(css: state.paper)).padding(.top, 4)
        } else {
          Text(state.detail)
            .font(SurfaceFont.body(size: 13, weight: 500))
            .opacity(0.6)
        }
      }
      .frame(maxWidth: .infinity, alignment: .leading)
      CloseStart(state: state)
    }
    .foregroundStyle(ThemeTokens.Activity.ink)
  }
}

/// The expanded island: the same, a little looser.
struct CloseExpanded: View {
  let state: CloseState

  var body: some View {
    HStack(spacing: 12) {
      CloseTile(state: state, size: 40)
      VStack(alignment: .leading, spacing: 4) {
        Text(state.title)
          .font(SurfaceFont.display(activityDisplayFont, size: 17))
          .lineLimit(1)
          .minimumScaleFactor(0.7)
        Text(state.detail)
          .font(SurfaceFont.body(size: 13, weight: 500))
          .opacity(0.6)
      }
      .frame(maxWidth: .infinity, alignment: .leading)
      CloseStart(state: state)
    }
    .foregroundStyle(ThemeTokens.Activity.ink)
    .padding(.horizontal, 6)
    .padding(.bottom, 4)
  }
}
