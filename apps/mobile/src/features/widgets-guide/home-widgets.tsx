import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { Symbol } from '../../ui/icons/symbol';
import { body, display, mono } from '../../ui/type/fonts';
import type { PreviewJar, WidgetPreview } from './preview-data';
import { fillCss, shadowCss, textShadowOf } from './widget-css';

/** The Home Screen widget sizes on a 402-point iPhone, in points. */
export const WIDGET_SIZE = {
  small: { width: 170, height: 170 },
  medium: { width: 364, height: 170 },
  large: { width: 364, height: 382 },
} as const;
export type WidgetSize = keyof typeof WIDGET_SIZE;
/** The small widgets: the number on its sky, one jar, the streak. */
export type SmallKind = 'today' | 'jar' | 'streak';
const RADIUS = 23;

/**
 * The 6pm postcards, drawn from the same snapshot and measures their SwiftUI views use
 * (`SafeTodayWidget.swift`, `JarWidget.swift`, `StreakWidget.swift`, `MonthWidget.swift`) and
 * Android's drawings (`WidgetDrawings.kt`), so the miniature is the widget itself.
 */
export function HomeWidget({
  size,
  kind = 'today',
  preview,
}: {
  readonly size: WidgetSize;
  readonly kind?: SmallKind;
  readonly preview: WidgetPreview;
}) {
  if (preview.entry === null || preview.card === null)
    return <SetUp size={size} preview={preview} />;
  switch (size) {
    case 'small':
      if (kind === 'jar') return <JarSmall preview={preview} />;
      if (kind === 'streak') return <Streak preview={preview} />;
      return <Small preview={preview} />;
    case 'medium':
      return <Medium preview={preview} />;
    case 'large':
      return <Month preview={preview} />;
  }
}

/** The sky of the stretch, or the look's own ground (Basic). */
function skyOf(preview: WidgetPreview): string {
  const ground = preview.look?.ground;
  const ink = preview.ink;
  if (ground) {
    const colour = ink['dark'] === '1' ? ground.night : ground.day;
    return `linear-gradient(${colour}, ${colour})`;
  }
  return `linear-gradient(180deg, ${ink['skyTop']} 0%, ${ink['skyMid']} 52%, ${ink['skyBottom']} 100%)`;
}

function Shell({
  size,
  background,
  children,
}: {
  readonly size: WidgetSize;
  readonly background: string;
  readonly children: ReactNode;
}) {
  return (
    <View
      style={{
        ...WIDGET_SIZE[size],
        borderRadius: RADIUS,
        overflow: 'hidden',
        experimental_backgroundImage: background,
        boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
      }}
    >
      {children}
    </View>
  );
}

/** What the widgets show for an amount when the person hides them: the mask, as the locked phone does. */
function money(preview: WidgetPreview, text: string): string {
  return preview.hideAmounts ? (preview.strings['hidden'] ?? text) : text;
}

/** The sun of the stretch where it stands. */
function Sun({ preview, size, small }: { preview: WidgetPreview; size: number; small: boolean }) {
  const card = preview.card;
  const look = preview.look;
  const sun = card && look ? look.suns[card.sunKind] : null;
  if (!card || !look || !sun) return null;
  const x = (small ? card.sun.xs : card.sun.x) * WIDGET_SIZE[small ? 'small' : 'medium'].width;
  const y = (small ? card.sun.ys : card.sun.y) * WIDGET_SIZE[small ? 'small' : 'medium'].height;
  const width = size * look.sunAspect;
  const ring = look.sunRing;
  const shadows = shadowCss(sun.shadows);
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x - width / 2,
        top: y - size / 2,
        width,
        height: size,
        borderRadius: size / 2,
        experimental_backgroundImage: fillCss(sun.fill),
        ...(shadows ? { boxShadow: shadows } : {}),
        ...(ring ? { borderWidth: ring.width, borderColor: ring.color } : {}),
      }}
    />
  );
}

function Kicker({ preview, text, size }: { preview: WidgetPreview; text: string; size: number }) {
  const ink = preview.ink['skyInk'];
  const style = preview.look?.mono === false ? body(size, 600, 0.04) : mono(size, 500, 0.14);
  return (
    <Text numberOfLines={1} style={{ ...style, color: ink, opacity: 0.8 }}>
      {text}
    </Text>
  );
}

function Figure({ preview, text, size }: { preview: WidgetPreview; text: string; size: number }) {
  const look = preview.look;
  const dark = preview.ink['dark'] === '1';
  const shadows = [...(look?.numberShadows ?? []), ...(dark ? (look?.numberGlow ?? []) : [])];
  return (
    <Text
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.5}
      style={{
        ...display(
          size,
          look?.displayWeight ?? 500,
          look?.numberTracking ?? -0.03,
          preview.palette.dispFont,
        ),
        color: preview.ink['skyInk'],
        ...textShadowOf(shadows),
      }}
    >
      {money(preview, text)}
    </Text>
  );
}

/** Before the month is set up: "Open 6pm to set up" on the sky. */
function SetUp({ size, preview }: { readonly size: WidgetSize; readonly preview: WidgetPreview }) {
  return (
    <Shell size={size} background={skyOf(preview)}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Text style={{ ...body(13, 600), color: preview.ink['skyInk'], textAlign: 'center' }}>
          {preview.strings['setUp']}
        </Text>
      </View>
    </Shell>
  );
}

/** Small: the short kicker, the short number and what it is, on the sky with the sun. */
function Small({ preview }: { readonly preview: WidgetPreview }) {
  const card = preview.card;
  if (!card || !preview.entry) return null;
  const ink = preview.ink['skyInk'];
  return (
    <Shell size="small" background={skyOf(preview)}>
      <Sun preview={preview} size={40} small />
      <View style={{ flex: 1, padding: 14, justifyContent: 'space-between' }}>
        <Kicker preview={preview} text={card.kickerShort} size={9.5} />
        <View style={{ gap: 3 }}>
          <Figure
            preview={preview}
            text={preview.entry.safeShort}
            size={preview.look?.numberSmall ?? 40}
          />
          <Text numberOfLines={1} style={{ ...body(11.5, 600), color: ink, opacity: 0.8 }}>
            {card.subShort}
          </Text>
        </View>
      </View>
    </Shell>
  );
}

/** A jar as the look draws it: the lid, the glass, what it holds, its icon. */
function Jar({
  preview,
  jar,
  index,
  width,
  height,
  scale,
}: {
  readonly preview: WidgetPreview;
  readonly jar: PreviewJar;
  readonly index: number;
  readonly width: number;
  readonly height: number;
  readonly scale: number;
}) {
  const material = preview.look?.jar;
  const fills = material?.fills ?? [];
  const fill = fills.length > 0 ? fills[index % fills.length] : null;
  const bodyTop = scale > 1 ? 8 : 5;
  const lidInset = scale > 1 ? 17 : 9;
  const edge = material?.edge.color ?? `${preview.ink['skyInk']}2e`;
  return (
    <View style={{ width, height }}>
      <View
        style={{
          position: 'absolute',
          top: bodyTop,
          left: 0,
          right: 0,
          bottom: 0,
          borderTopLeftRadius: (material?.radiusTop ?? 10) * scale,
          borderTopRightRadius: (material?.radiusTop ?? 10) * scale,
          borderBottomLeftRadius: (material?.radiusBottom ?? 12) * scale,
          borderBottomRightRadius: (material?.radiusBottom ?? 12) * scale,
          borderWidth: material?.edge.width ?? 1,
          borderColor: edge,
          overflow: 'hidden',
          experimental_backgroundImage: material?.body
            ? fillCss(material.body)
            : `linear-gradient(${jar.glass}, ${jar.glass})`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: `${Math.round(jar.level * 100)}%`,
            experimental_backgroundImage: fill
              ? fillCss(fill)
              : `linear-gradient(${jar.fill}, ${jar.fill})`,
            ...(fill ? {} : { borderTopWidth: 1.5 * scale, borderTopColor: jar.fillTop }),
          }}
        />
        {material?.icon !== false ? (
          <Symbol
            name={jar.icon}
            size={scale > 1 ? 22 : 14}
            fill={1}
            color={jar.level > 0.48 ? jar.iconHigh : jar.iconLow}
          />
        ) : null}
      </View>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: lidInset,
          right: lidInset,
          height: scale > 1 ? 10 : 6,
          borderRadius: (material?.lidRadius ?? 3) * scale,
          backgroundColor: material?.lid ?? jar.lid,
        }}
      />
    </View>
  );
}

/** Medium: the kicker, the number, the day's bar and what it means, then the jars. */
function Medium({ preview }: { readonly preview: WidgetPreview }) {
  const card = preview.card;
  if (!card) return null;
  const ink = preview.ink['skyInk'];
  const dark = preview.ink['dark'] === '1';
  return (
    <Shell size="medium" background={skyOf(preview)}>
      <Sun preview={preview} size={54} small={false} />
      <View style={{ flex: 1, flexDirection: 'row', gap: 12, padding: 16 }}>
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <Kicker preview={preview} text={card.kicker} size={10} />
          <View style={{ gap: 4 }}>
            <Figure preview={preview} text={card.number} size={preview.look?.numberMedium ?? 44} />
            <View
              style={{
                width: 140,
                height: 5,
                borderRadius: 5,
                overflow: 'hidden',
                backgroundColor: `${ink}${dark ? '38' : '24'}`,
              }}
            >
              <View
                style={{
                  width: `${Math.round(card.used * 100)}%`,
                  height: 5,
                  backgroundColor: ink,
                }}
              />
            </View>
            <Text numberOfLines={1} style={{ ...body(12, 600), color: ink, opacity: 0.8 }}>
              {preview.hideAmounts ? (card.subHidden ?? card.sub) : card.sub}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 5, paddingBottom: 2 }}>
          {preview.jars.slice(0, 4).map((jar, index) => (
            <View key={jar.id} style={{ alignItems: 'center', gap: 4 }}>
              <Jar preview={preview} jar={jar} index={index} width={34} height={46} scale={1} />
              <Text numberOfLines={1} style={{ ...body(9.5, 700), color: ink, opacity: 0.85 }}>
                {money(preview, jar.amountText)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Shell>
  );
}

/** One jar counting down: the jar tall beside its name, its day, the count and what it holds. */
function JarSmall({ preview }: { readonly preview: WidgetPreview }) {
  const jar =
    preview.jars.find((j) => j.newYear) ?? preview.jars.find((j) => j.dayText) ?? preview.jars[0];
  if (!jar) return null;
  const ink = preview.ink['skyInk'];
  const index = preview.jars.indexOf(jar);
  return (
    <Shell size="small" background={skyOf(preview)}>
      <View style={{ flex: 1, flexDirection: 'row', gap: 10, padding: 14 }}>
        <Jar preview={preview} jar={jar} index={index} width={64} height={142} scale={2} />
        <View style={{ flex: 1, justifyContent: 'space-between', paddingVertical: 2 }}>
          <View style={{ gap: 1 }}>
            <Text numberOfLines={1} style={{ ...body(14, 700), color: ink }}>
              {jar.name}
            </Text>
            {jar.dayText ? (
              <Text numberOfLines={1} style={{ ...body(11, 600), color: ink, opacity: 0.75 }}>
                {jar.dayText}
              </Text>
            ) : null}
          </View>
          <View>
            <Figure preview={preview} text={jar.countText} size={40} />
            <Text style={{ ...body(11, 600), color: ink, opacity: 0.75 }}>{jar.countUnit}</Text>
          </View>
          <Text numberOfLines={1} style={{ ...body(11, 700), color: ink }}>
            {money(preview, jar.ofText)}
          </Text>
        </View>
      </View>
    </Shell>
  );
}

/** The streak: the evenings closed in a row as strata, the count and the sun setting into it. */
function Streak({ preview }: { readonly preview: WidgetPreview }) {
  const streak = preview.streak;
  const look = preview.look;
  if (!streak || !look) return null;
  const sun = look.suns.dusk ?? look.suns.day;
  return (
    <Shell size="small" background={`linear-gradient(${look.streakGround}, ${look.streakGround})`}>
      <View style={{ flex: 1, gap: 2, paddingTop: 6, paddingHorizontal: 6 }}>
        {streak.bands.map(([a, b, c], k) => (
          <View
            key={k}
            style={{
              flex: 1,
              borderRadius: 4,
              experimental_backgroundImage: `linear-gradient(90deg, ${a} 0%, ${b} 55%, ${c} 100%)`,
            }}
          />
        ))}
        {streak.open ? (
          <View
            style={{
              flex: 1,
              borderRadius: 4,
              experimental_backgroundImage: `repeating-linear-gradient(90deg, ${look.hatch} 0px, ${look.hatch} 4px, transparent 4px, transparent 8px)`,
            }}
          />
        ) : null}
      </View>
      <View
        style={{
          height: 62,
          paddingTop: 10,
          paddingHorizontal: 14,
          borderTopWidth: 1,
          borderTopColor: look.streakLine,
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 8,
        }}
      >
        {sun ? (
          <View
            style={{
              position: 'absolute',
              right: 16,
              top: -19,
              width: 38,
              height: 19,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                experimental_backgroundImage: fillCss(sun.fill),
              }}
            />
          </View>
        ) : null}
        <Text
          style={{
            ...display(40, look.displayWeight, -0.04, preview.palette.dispFont),
            color: '#fbf4ec',
            paddingBottom: 6,
          }}
        >
          {streak.count}
        </Text>
        <View style={{ paddingBottom: 10 }}>
          {[preview.strings['streakLine1'], preview.strings['streakLine2']].map((line) => (
            <Text key={line} style={{ ...mono(8.5, 500, 0.14), color: look.streakWord }}>
              {line}
            </Text>
          ))}
        </View>
      </View>
    </Shell>
  );
}

/** The month as suns: the title, the headline, a sun for each evening and tonight's close. */
function Month({ preview }: { readonly preview: WidgetPreview }) {
  const month = preview.month;
  const look = preview.look;
  const card = preview.card;
  if (!month || !look || !card) return null;
  const ink = preview.ink['skyInk'] ?? '#000';
  const dark = preview.ink['dark'] === '1';
  const rows = Math.max(5, Math.ceil(month.cells.length / 7));
  const dot = rows > 5 ? 24 : 30;
  const dots = look.dots;
  return (
    <Shell size="large" background={skyOf(preview)}>
      <View style={{ flex: 1, paddingTop: 18, paddingHorizontal: 18, paddingBottom: 16, gap: 10 }}>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}
        >
          <Kicker preview={preview} text={month.title} size={10} />
          <Text style={{ ...display(15, 600, 0, preview.palette.dispFont), color: ink }}>
            {preview.strings['brand']}
          </Text>
        </View>
        <Text
          numberOfLines={2}
          style={{ ...display(30, 500, -0.02, preview.palette.dispFont), color: ink }}
        >
          {month.headline}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            columnGap: 8,
            rowGap: rows > 5 ? 5 : 6,
            justifyContent: 'center',
            paddingVertical: 4,
          }}
        >
          {Array.from({ length: rows * 7 }, (_, k) => month.cells[k] ?? 'blank').map((cell, k) => (
            <View
              key={k}
              style={{
                width: dot,
                height: dot,
                borderRadius: dot / 2,
                ...(cell === 'sun'
                  ? {
                      experimental_backgroundImage: fillCss(dots.full),
                      ...(dots.fullRing
                        ? { borderWidth: dots.fullRing.width, borderColor: dots.fullRing.color }
                        : {}),
                    }
                  : {}),
                ...(cell === 'half' ? { experimental_backgroundImage: fillCss(dots.half) } : {}),
                ...(cell === 'miss'
                  ? { borderWidth: 1.5, borderColor: dots.ring || `${ink}59` }
                  : {}),
                ...(cell === 'today' ? { borderWidth: 2, borderColor: look.today } : {}),
                ...(cell === 'ahead'
                  ? { borderWidth: 1, borderColor: `${ink}${dark ? '33' : '2e'}` }
                  : {}),
              }}
            />
          ))}
        </View>
        <View style={{ flex: 1 }} />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingTop: 10,
            borderTopWidth: 1,
            borderStyle: 'dashed',
            borderTopColor: `${ink}${dark ? '66' : '4d'}`,
          }}
        >
          <Text style={{ ...mono(11), color: ink }}>{preview.strings['tonight']}</Text>
          <Text style={{ ...mono(11, 600), color: ink }}>{card.tonight}</Text>
        </View>
      </View>
    </Shell>
  );
}
