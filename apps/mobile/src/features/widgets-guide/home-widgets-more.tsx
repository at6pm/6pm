import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { CategoryTile } from '../../ui/category-tile';
import { body, display, mono } from '../../ui/type/fonts';
import { DayDot, Figure, Kicker, money, Shell, skyOf } from './home-widgets';
import { nameOfGlyph, type WidgetPreview } from './preview-data';

/**
 * The guide's Today list, This week and Today's receipt, drawn as `TodayListWidget.swift`,
 * `WeekWidget.swift` and `ReceiptWidget.swift` draw them.
 */

/** Today (large): the kicker, what is left, the day's bar, today's newest spends and "+N more". */
export function TodayListLarge({ preview }: { readonly preview: WidgetPreview }) {
  const { entry, card } = preview;
  if (!entry || !card) return null;
  const ink = preview.ink['skyInk'] ?? '#000';
  const dark = preview.ink['dark'] === '1';
  return (
    <Shell size="large" background={skyOf(preview)}>
      <View style={{ flex: 1, paddingTop: 18, paddingHorizontal: 18, paddingBottom: 12 }}>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}
        >
          <Kicker preview={preview} text={card.kicker} size={10} />
          <Text style={{ ...display(15, 600, 0, preview.palette.dispFont), color: ink }}>
            {preview.strings['brand']}
          </Text>
        </View>
        <View style={{ paddingTop: 14 }}>
          <Figure preview={preview} text={card.number} size={preview.look?.numberMedium ?? 44} />
        </View>
        <View style={{ gap: 5, paddingTop: 8, paddingBottom: 10 }}>
          <View
            style={{
              height: 5,
              borderRadius: 5,
              overflow: 'hidden',
              backgroundColor: `${ink}${dark ? '38' : '24'}`,
            }}
          >
            <View
              style={{
                width: `${Math.round((entry.spentFraction ?? 0) * 100)}%`,
                height: 5,
                backgroundColor: ink,
              }}
            />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ ...body(11, 600), color: ink, opacity: 0.7 }}>
              {money(preview, entry.spentText ?? '')}
            </Text>
            <Text style={{ ...body(11, 600), color: ink, opacity: 0.7 }}>
              {money(preview, entry.lineText ?? '')}
            </Text>
          </View>
        </View>
        {entry.list.length === 0 ? (
          <Line ink={ink}>
            <Text style={{ ...body(14), color: ink, opacity: 0.7 }}>
              {preview.strings['listEmpty']}
            </Text>
          </Line>
        ) : null}
        {entry.list.map((row, k) => (
          <Line key={`${row.name}-${k}`} ink={ink}>
            <CategoryTile
              icon={nameOfGlyph(row.icon)}
              hue={row.hue}
              size={26}
              radius={9}
              glyph={16}
            />
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text numberOfLines={1} style={{ ...body(14), color: ink, flexShrink: 1 }}>
                {row.name}
              </Text>
              {row.pending ? (
                <Text
                  style={{
                    ...body(11, 700, 0.04),
                    color: preview.ink[dark ? 'pendingInkDark' : 'pendingInk'],
                  }}
                >
                  {(preview.strings['pendingTag'] ?? '').toUpperCase()}
                </Text>
              ) : null}
            </View>
            <Text style={{ ...body(14, 600), color: ink }}>{money(preview, row.amountText)}</Text>
          </Line>
        ))}
        {entry.moreText ? (
          <Line ink={ink} vertical={7}>
            <Text style={{ ...body(14), color: ink, opacity: 0.7, flex: 1 }}>{entry.moreText}</Text>
            <Text style={{ ...body(14), color: ink, opacity: 0.7 }}>
              {money(preview, entry.moreAmountText ?? '')}
            </Text>
          </Line>
        ) : null}
      </View>
    </Shell>
  );
}

/** A row of the list with its 0.5 pt rule above it. */
function Line({
  ink,
  vertical = 6,
  children,
}: {
  readonly ink: string;
  readonly vertical?: number;
  readonly children: ReactNode;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: vertical }}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 0.5,
          backgroundColor: ink,
          opacity: 0.14,
        }}
      />
      {children}
    </View>
  );
}

/** This week (small): the title, a sun for each day over its initial, and the line under them. */
export function WeekSmall({ preview }: { readonly preview: WidgetPreview }) {
  const week = preview.week;
  if (!week) return null;
  const ink = preview.ink['skyInk'] ?? '#000';
  return (
    <Shell size="small" background={skyOf(preview)}>
      <View style={{ flex: 1, padding: 14, justifyContent: 'space-between' }}>
        <Kicker preview={preview} text={week.title} size={9.5} />
        <View style={{ flexDirection: 'row', gap: 3 }}>
          {week.cells.map((cell, k) => (
            <View key={k} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
              <DayDot preview={preview} cell={cell} size={16} />
              <Text style={{ ...body(9, 700), color: ink, opacity: 0.6 }}>
                {week.letters[k] ?? ''}
              </Text>
            </View>
          ))}
        </View>
        <Text
          numberOfLines={2}
          style={{
            ...display(
              17,
              Math.min(preview.look?.displayWeight ?? 500, 600),
              0,
              preview.palette.dispFont,
            ),
            color: ink,
          }}
        >
          {week.line}
        </Text>
      </View>
    </Shell>
  );
}

/** Today's receipt (medium): today's lines on the close's paper, what is left, the stamp. */
export function ReceiptMedium({ preview }: { readonly preview: WidgetPreview }) {
  const { receipt, card } = preview;
  if (!receipt || !card) return null;
  const paper = receipt.paper;
  const today = card.day === undefined || card.day === receipt.day;
  const lines = today ? receipt.lines : [];
  return (
    <Shell size="medium" background={`linear-gradient(${paper.sheet}, ${paper.sheet})`}>
      <View style={{ flex: 1, paddingTop: 14, paddingHorizontal: 16, paddingBottom: 16, gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
          <Text numberOfLines={1} style={{ ...mono(10, 500, 0.12), color: paper.soft, flex: 1 }}>
            {today ? receipt.title : ''}
          </Text>
          <Text style={{ ...mono(10, 500, 0.12), color: paper.soft }}>
            {today ? receipt.number : ''}
          </Text>
        </View>
        <View style={{ borderTopWidth: 1, borderStyle: 'dashed', borderTopColor: paper.rule }} />
        {today && receipt.earlier ? (
          <Text style={{ ...mono(10), color: paper.soft }}>{receipt.earlier}</Text>
        ) : null}
        {lines.length === 0 ? (
          <Text style={{ ...mono(11.5), color: paper.soft }}>{receipt.empty}</Text>
        ) : null}
        {lines.map((line, k) => (
          <View
            key={k}
            style={{
              flexDirection: 'row',
              gap: 10,
              opacity: line.confirmed || card.phase === 'closed' ? 1 : 0.5,
            }}
          >
            <Text style={{ ...mono(11.5), color: paper.soft }}>{line.time}</Text>
            <Text numberOfLines={1} style={{ ...mono(11.5), color: paper.ink, flex: 1 }}>
              {line.name}
            </Text>
            <Text style={{ ...mono(11.5), color: paper.ink }}>{money(preview, line.amount)}</Text>
          </View>
        ))}
        <View style={{ flex: 1 }} />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 6,
            borderTopWidth: 1,
            borderStyle: 'dashed',
            borderTopColor: paper.rule,
          }}
        >
          <Text style={{ ...mono(12, 600), color: paper.ink }}>{receipt.left}</Text>
          <Text style={{ ...display(20, 500, 0, preview.palette.dispFont), color: paper.ink }}>
            {money(preview, card.amount)}
          </Text>
        </View>
      </View>
      {card.phase === 'closed' && today && card.closedAt ? (
        <View
          style={{
            position: 'absolute',
            right: 22,
            top: 42,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderWidth: 2.5,
            borderColor: paper.stamp,
            borderRadius: 5,
            transform: [{ rotate: '-7deg' }],
            opacity: 0.92,
            alignItems: 'center',
          }}
        >
          <Text style={{ ...mono(13, 600, 0.14), color: paper.stamp }}>
            {preview.strings['stamp']}
          </Text>
          <Text style={{ ...mono(13, 600, 0.14), color: paper.stamp }}>{card.closedAt}</Text>
        </View>
      ) : null}
    </Shell>
  );
}
