import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { moneyInInk, paperInk } from '@6pm/theme';

import { Companion } from '../../ui/companion/companion';
import type { CompanionMood } from '../../ui/companion/companion-mood';
import { DashedRule } from '../../ui/dashed-rule';
import { easeOut } from '../../ui/motion/curves';
import { PaperEdge } from '../../ui/paper-edge';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, display, leading, mono } from '../../ui/type/fonts';
import { useMoneyFormat } from '../../money/use-money-format';

/** A red line drawn across a slip's line, left to right, once the card has risen. */
function Strike() {
  const drawn = useSharedValue(0);
  useEffect(() => {
    drawn.set(
      withDelay(
        300,
        withTiming(1, { duration: 500, easing: easeOut, reduceMotion: ReduceMotion.System }),
      ),
    );
  }, [drawn]);
  const style = useAnimatedStyle(() => ({ transform: [{ scaleX: drawn.get() }] }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: -4,
          right: -4,
          top: '52%',
          height: 2,
          borderRadius: 2,
          backgroundColor: paperInk.stamp,
          transformOrigin: 'left center',
          mixBlendMode: 'multiply',
        },
        style,
      ]}
    />
  );
}

export interface SlipLine {
  readonly time: string;
  readonly name: string;
  readonly amount: number;
  /** Money that came in: printed green with a "+". */
  readonly plus?: boolean;
  /** Given back: a strike is drawn across it. */
  readonly struck?: boolean;
}

function SlipText({ line }: { readonly line: SlipLine }) {
  const money = useMoneyFormat();
  const ink = line.plus ? moneyInInk.paper : '#2b2530';
  return (
    <View style={{ flexDirection: 'row', gap: 14, alignItems: 'baseline' }}>
      <Text style={{ ...mono(12.5), color: 'rgba(43,37,48,.55)' }}>{line.time}</Text>
      <Text style={{ ...mono(12.5), color: '#2b2530', flexShrink: 1 }} numberOfLines={1}>
        {line.name.toUpperCase()}
      </Text>
      <Text style={{ ...mono(12.5, 600), color: ink }}>
        {line.plus ? '+' : ''}
        {money.number(line.amount)}
      </Text>
      {line.struck ? <Strike /> : null}
    </View>
  );
}

export function WorkQuestionStep({
  line,
  mood = 'think',
  receiptLine,
  second,
  title,
  sub,
  yes,
  no,
  onAnswer,
}: {
  readonly line: string | null;
  readonly mood?: CompanionMood;
  readonly receiptLine: SlipLine;
  /** A second line under a rule: the money that came back for the first. */
  readonly second?: SlipLine | undefined;
  readonly title: string;
  readonly sub: string;
  readonly yes: string;
  readonly no: string;
  readonly onAnswer: (forWork: boolean) => void;
}) {
  const { palette } = useTheme();
  return (
    <Animated.View entering={FadeInDown.duration(450)} style={{ flex: 1, gap: 20, paddingTop: 56 }}>
      {line ? (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
          <Companion size={84} mood={mood} />
          <View
            style={{
              marginBottom: 48,
              paddingVertical: 8,
              paddingHorizontal: 13,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              borderBottomRightRadius: 16,
              borderBottomLeftRadius: 4,
              backgroundColor: palette.bubbleBg,
            }}
          >
            <Text style={{ ...display(18), color: palette.bubbleFg }}>{line}</Text>
          </View>
        </View>
      ) : null}
      <View
        style={{
          alignSelf: 'flex-start',
          transform: [{ rotate: '-1.5deg' }],
          boxShadow: '0 10px 18px rgba(20,6,30,.3)',
        }}
      >
        <View
          style={{
            gap: 8,
            paddingTop: 12,
            paddingHorizontal: 16,
            paddingBottom: 10,
            backgroundColor: '#f7f2e8',
          }}
        >
          <SlipText line={receiptLine} />
          {second ? (
            <>
              <DashedRule color="rgba(43,37,48,.3)" />
              <SlipText line={second} />
            </>
          ) : null}
        </View>
        <PaperEdge color="#f7f2e8" height={7} step={10} radius={4.75} />
      </View>
      <Text style={{ ...leading(display(44, 500, -0.01), 45.8), color: palette.ink }}>{title}</Text>
      <Text style={{ ...body(16), lineHeight: 23.2, color: palette.inkSoft }}>{sub}</Text>
      <View style={{ flex: 1 }} />
      <PressScale
        scaleTo={0.97}
        onPress={() => onAnswer(true)}
        style={{
          height: 56,
          borderRadius: 99,
          backgroundColor: palette.btnBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ ...body(17, 650), color: palette.btnFg }}>{yes}</Text>
      </PressScale>
      <PressScale
        scaleTo={0.97}
        onPress={() => onAnswer(false)}
        style={{
          height: 56,
          borderRadius: 99,
          borderWidth: 1,
          borderColor: palette.inkSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ ...body(17, 600), color: palette.ink }}>{no}</Text>
      </PressScale>
    </Animated.View>
  );
}
