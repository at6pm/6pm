import AppIntents
import SwiftUI
import WidgetKit

/// A jar the person can pick for the jar widget, from the jars the app last wrote.
struct JarEntity: AppEntity {
  static let typeDisplayRepresentation = TypeDisplayRepresentation(
    name: LocalizedStringResource("jar.param", table: "Surfaces"))
  static let defaultQuery = JarQuery()

  let id: String
  let name: String

  var displayRepresentation: DisplayRepresentation { DisplayRepresentation(title: "\(name)") }
}

struct JarQuery: EntityQuery {
  private func all() -> [JarEntity] {
    (SurfaceSnapshot.load()?.jars ?? []).map { JarEntity(id: $0.id, name: $0.name) }
  }

  func entities(for identifiers: [String]) async throws -> [JarEntity] {
    all().filter { identifiers.contains($0.id) }
  }

  func suggestedEntities() async throws -> [JarEntity] { all() }
}

/// The jar widget's one setting: which jar. Left unset it shows the season's jar, else the first
/// jar with a day to count down to.
struct JarWidgetIntent: WidgetConfigurationIntent {
  static let title = LocalizedStringResource("jar.name", table: "Surfaces")
  static let description = IntentDescription(
    LocalizedStringResource("jar.description", table: "Surfaces"))

  @Parameter(title: LocalizedStringResource("jar.param", table: "Surfaces"))
  var jar: JarEntity?

  init() {}
}

struct JarTimelineProvider: AppIntentTimelineProvider {
  func placeholder(in context: Context) -> SurfaceEntry {
    SurfaceEntry(date: .now, state: .setUp, snapshot: nil, entry: nil, tokens: [:])
  }

  func snapshot(for configuration: JarWidgetIntent, in context: Context) async -> SurfaceEntry {
    picked(SurfaceTimelineProvider.timeline(now: .now), configuration).entries.first
      ?? placeholder(in: context)
  }

  func timeline(for configuration: JarWidgetIntent, in context: Context) async -> Timeline<
    SurfaceEntry
  > {
    picked(SurfaceTimelineProvider.timeline(now: .now), configuration)
  }

  private func picked(_ timeline: Timeline<SurfaceEntry>, _ configuration: JarWidgetIntent)
    -> Timeline<SurfaceEntry>
  {
    let entries = timeline.entries.map { entry -> SurfaceEntry in
      var entry = entry
      entry.jarId = configuration.jar?.id
      return entry
    }
    return Timeline(entries: entries, policy: timeline.policy)
  }
}

/// A jar (small, `W:90-97`; Lock Screen, `W:143-146`): one jar counting down to its day, its
/// name and date, the days left and what it holds of its target. Opens that jar.
struct JarWidget: Widget {
  var body: some WidgetConfiguration {
    AppIntentConfiguration(kind: "Jar", intent: JarWidgetIntent.self, provider: JarTimelineProvider())
    { entry in
      JarWidgetView(entry: entry)
    }
    .configurationDisplayName(Text("jar.name", tableName: "Surfaces"))
    .description(Text("jar.description", tableName: "Surfaces"))
    .supportedFamilies([.systemSmall, .accessoryCircular])
    .contentMarginsDisabled()
  }
}

struct JarWidgetView: View {
  @Environment(\.widgetFamily) private var family
  let entry: SurfaceEntry

  var body: some View {
    if entry.entry != nil, let jar = entry.jar {
      Group {
        if family == .accessoryCircular {
          JarRing(jar: jar, entry: entry)
        } else {
          JarSmall(jar: jar, entry: entry)
        }
      }
      .widgetURL(entry.link(jar.path))
    } else {
      SetUpView(entry: entry)
    }
  }
}

/// Small: the jar tall beside its name, its day, the count and what it holds.
struct JarSmall: View {
  let jar: SurfaceSnapshot.Jar
  let entry: SurfaceEntry

  var body: some View {
    let index = (entry.snapshot?.jars ?? []).firstIndex { $0.id == jar.id } ?? 0
    HStack(spacing: 10) {
      PostcardJar(jar: jar, index: index, entry: entry, measure: .tall, targetLine: true)
        .frame(width: 64, height: 142)
      VStack(alignment: .leading, spacing: 0) {
        VStack(alignment: .leading, spacing: 1) {
          Text(jar.name).font(SurfaceFont.body(size: 14, weight: 700)).lineLimit(1)
          if !jar.dayText.isEmpty {
            Text(jar.dayText).font(SurfaceFont.body(size: 11, weight: 600)).opacity(0.75)
              .lineLimit(1).minimumScaleFactor(0.7)
          }
        }
        Spacer(minLength: 0)
        VStack(alignment: .leading, spacing: 0) {
          Text(jar.countText)
            .font(SurfaceFont.display(entry.displayFont, size: 40, weight: entry.look.displayWeight))
            .trackingEm(-0.03, size: 40)
            .lineLimit(1)
            .minimumScaleFactor(0.5)
            .contentTransition(.numericText())
          Text(jar.countUnit).font(SurfaceFont.body(size: 11, weight: 600)).opacity(0.75)
        }
        Spacer(minLength: 0)
        PrivateText(text: jar.ofText, entry: entry)
          .font(SurfaceFont.body(size: 11, weight: 700))
          .monospacedDigit()
          .lineLimit(1)
          .minimumScaleFactor(0.7)
      }
      .padding(.vertical, 2)
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }
    .foregroundStyle(entry.ink)
    .padding(14)
    .containerBackground(for: .widget) { PostcardBackground(entry: entry) }
  }
}

/// Lock Screen: the jar's outline filled to its level over its short name, drawn by the system in
/// its own tint.
struct JarRing: View {
  let jar: SurfaceSnapshot.Jar
  let entry: SurfaceEntry

  var body: some View {
    let ink = ThemeTokens.Activity.ink
    ZStack {
      AccessoryWidgetBackground()
      ZStack(alignment: .top) {
        ZStack(alignment: .bottom) {
          RoundedRectangle(cornerRadius: 8, style: .continuous).strokeBorder(ink, lineWidth: 2)
          GeometryReader { proxy in
            VStack(spacing: 0) {
              Spacer(minLength: 0)
              Rectangle().fill(ink).frame(height: proxy.size.height * min(1, max(0, jar.level)))
            }
          }
          .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
        }
        .frame(width: 26, height: 31)
        .padding(.top, 3)
        RoundedRectangle(cornerRadius: 2).fill(ink).frame(width: 12, height: 4)
      }
      .frame(width: 26, height: 34)
      .offset(y: -6)
      Text(jar.label)
        .font(SurfaceFont.body(size: 9.5, weight: 800))
        .lineLimit(1)
        .minimumScaleFactor(0.6)
        .padding(.horizontal, 10)
        .frame(maxHeight: .infinity, alignment: .bottom)
        .padding(.bottom, 9)
    }
    .widgetAccentable()
    .containerBackground(for: .widget) {}
  }
}
