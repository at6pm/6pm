import { Text, View } from 'react-native';

import { FitText } from '../../../ui/type/fit-text';
import { body, display, leading, mono } from '../../../ui/type/fonts';
import { WordFitText } from '../../../ui/type/word-fit-text';
import { paper, zineInk } from '../diary-colours';

const STAMP_MAX_SCALE = 1.5;

export interface ZineStat {
  readonly key: string;
  readonly value: string;
  readonly sub: string;
}

/** The zine's opening: the month in big type, its headline, the red CLOSED stamp, four stats. */
export function ZineCover({
  title,
  headline,
  closed,
  stampLabel,
  stats,
}: {
  readonly title: string;
  readonly headline: string;
  /** "27/30" */
  readonly closed: string;
  readonly stampLabel: string;
  readonly stats: readonly ZineStat[];
}) {
  return (
    <>
      <View style={{ gap: 14 }}>
        {/* The masthead is the page's biggest type already: it keeps the design's size at any text
            size, as a shrunk line would keep a grown line's height. */}
        <FitText
          maxFontSizeMultiplier={1}
          style={{ ...leading(display(68, 500, -0.045), 61.2, true), color: zineInk.ink }}
        >
          {title}
        </FitText>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <WordFitText
            style={{
              ...leading(display(27, 500, -0.015), 29.7),
              maxWidth: 230,
              flexShrink: 1,
              color: zineInk.ink,
            }}
          >
            {headline}
          </WordFitText>
          <View
            style={{
              paddingTop: 6,
              paddingHorizontal: 10,
              paddingBottom: 5,
              marginBottom: 6,
              borderWidth: 2.5,
              borderColor: zineInk.stamp,
              borderRadius: 6,
              transform: [{ rotate: '8deg' }],
              mixBlendMode: 'multiply',
            }}
          >
            {/* A rubber stamp drawn on the page: it grows with the reader's text size only so far,
                leaving the headline beside it room for its words. */}
            <Text
              maxFontSizeMultiplier={STAMP_MAX_SCALE}
              style={{
                ...mono(12, 600, 0.14),
                lineHeight: 14.4,
                color: zineInk.stamp,
                textAlign: 'center',
              }}
            >
              {closed}
              {'\n'}
              {stampLabel}
            </Text>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {stats.map((s) => (
          <View
            key={s.key}
            style={{
              width: '48.5%',
              flexGrow: 1,
              backgroundColor: paper.sheet,
              boxShadow: '0 8px 18px rgba(40,10,30,.16)',
              borderRadius: 6,
              paddingTop: 12,
              paddingHorizontal: 14,
              paddingBottom: 13,
              gap: 4,
            }}
          >
            <WordFitText
              style={{
                ...mono(10, 400, 0.12),
                textTransform: 'uppercase',
                color: paper.ink,
                opacity: 0.55,
              }}
            >
              {s.key}
            </WordFitText>
            <FitText style={{ ...leading(display(30, 500, -0.02), 30), color: paper.ink }}>
              {s.value}
            </FitText>
            <Text style={{ ...body(12.5), color: paper.ink, opacity: 0.65 }}>{s.sub}</Text>
          </View>
        ))}
      </View>
    </>
  );
}
