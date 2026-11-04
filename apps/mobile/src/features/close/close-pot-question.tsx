import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import {
  isFutureYouPot,
  potQuestion,
  type CloseEvent,
  type CloseState,
  type SpendRow,
} from '@6pm/domain';
import { localeOf } from '@6pm/i18n';
import { oklchSrgbHex } from '@6pm/theme';

import { markDeclined } from '../../data/jar-asks';
import { useMoney, useMoneyActions, useMoneyStore } from '../../data/money-provider';
import { findSpend } from '../../data/money-store';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PaperEdge } from '../../ui/paper-edge';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, display, leading } from '../../ui/type/fonts';
import { WordFitText } from '../../ui/type/word-fit-text';
import { jarLevel } from '../pots/jar';
import { jarName } from '../pots/jar-name';
import { JarPour, POUR_MS, SLIDE_MS } from './close-jar-pour';
import { SlipText } from './close-work-question';
import { jarChoiceOf } from './jar-choice-of';
import { JarSplit, TomorrowCost } from './jar-split';

const enter = Easing.bezier(0.2, 0.9, 0.2, 1);
const STEADY = oklchSrgbHex(0.86, 0.12, 150);
/** The pill's one green pulse as the jar rights ("rgba(130,220,160,.28)"). */
const PULSE = 'rgba(130,220,160,.28)';
/** The bigger-than-the-jar pour: the jar's part drains dry. */
const DRY_MS = 900;

/**
 * "From your {jar} jar?": asked once about a kept spend that falls in a dated jar that is due
 * (M13). Yes takes it from the jar as far as the jar holds; no leaves it counted today. A spend
 * the jar can hold pours from the jar onto its slip; one bigger than the jar shows the split and
 * what the rest costs tomorrow.
 */
export function PotQuestionStep({
  state,
  queue,
  dispatch,
  run,
}: {
  readonly state: CloseState;
  readonly queue: readonly SpendRow[];
  readonly dispatch: (event: CloseEvent) => void;
  readonly run: (task: () => Promise<unknown>) => Promise<boolean>;
}) {
  const snap = useMoney();
  const card = potQuestion(state);
  const queued = card ? queue.find((s) => s.id === card.id) : undefined;
  // The spend as it stands now (an edit on the cards changed its amount).
  const spend = queued ? (findSpend(snap, queued.id) ?? queued) : undefined;
  const jar = card?.askPot ? snap.pots.find((p) => p.id === card.askPot) : undefined;
  // What the jar held as its question came up: the answer's own write empties it mid-pour.
  const heldAtAsk = useRef(new Map<string, number>());
  if (card && jar && !heldAtAsk.current.has(card.id)) {
    heldAtAsk.current.set(card.id, snap.potSaved[jar.id] ?? 0);
  }
  const held = card ? (heldAtAsk.current.get(card.id) ?? 0) : 0;
  // An earlier answer may have emptied the jar: nothing is left to ask about.
  const nothing = !card || !spend || !jar || held <= 0;
  useEffect(() => {
    if (card && nothing) dispatch({ type: 'answerPot', id: card.id, fromPot: false });
  }, [card, nothing, dispatch]);
  if (nothing || !card || !spend || !jar) return null;
  return (
    <PotQuestion
      key={card.id}
      spend={spend}
      jarId={jar.id}
      onAnswer={(fromPot) => dispatch({ type: 'answerPot', id: card.id, fromPot })}
      run={run}
    />
  );
}

function PotQuestion({
  spend,
  jarId,
  onAnswer,
  run,
}: {
  readonly spend: SpendRow;
  readonly jarId: string;
  readonly onAnswer: (fromPot: boolean) => void;
  readonly run: (task: () => Promise<unknown>) => Promise<boolean>;
}) {
  const { palette } = useTheme();
  const { t, language } = useI18n();
  const money = useMoneyFormat();
  const snap = useMoney();
  const actions = useMoneyActions();
  const store = useMoneyStore();
  // Fixed as the question opens: the answer's write must not redraw the question under the pour.
  const [jar] = useState(() => snap.pots.find((p) => p.id === jarId));
  const [choice] = useState(() => jarChoiceOf(snap, spend, jarId));
  const [held] = useState(() => snap.potSaved[jarId] ?? 0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const done = useRef(false);
  const pulse = useSharedValue(0);
  const dry = useSharedValue(0);
  const finish = useCallback(
    (fromPot: boolean) => {
      if (done.current) return;
      done.current = true;
      onAnswer(fromPot);
    },
    [onAnswer],
  );
  useEffect(() => {
    if (answer === null) return;
    const wait = answer ? (choice && choice.rest > 0 ? DRY_MS + 300 : POUR_MS) : SLIDE_MS + 100;
    const timer = setTimeout(() => finish(answer), wait);
    return () => clearTimeout(timer);
  }, [answer, choice, finish]);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.get() }));
  if (!jar || !choice) return null;

  const name = jarName(jar, t);
  const time = new Intl.DateTimeFormat(localeOf(language), {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(spend.at));
  const slip = { time, name: spend.merchant, amount: spend.amount };
  const bigger = choice.rest > 0;

  const yes = () => {
    if (answer !== null) return;
    haptics.tap();
    setAnswer(true);
    void run(() => actions.takeFromJar(spend.id, jar.id, 'close'));
    if (bigger) {
      dry.set(
        withTiming(1, { duration: DRY_MS, easing: enter, reduceMotion: ReduceMotion.System }),
      );
    } else {
      pulse.set(
        withDelay(
          1200,
          withSequence(
            withTiming(1, { duration: 180, reduceMotion: ReduceMotion.System }),
            withTiming(0, { duration: 420, reduceMotion: ReduceMotion.System }),
          ),
        ),
      );
    }
  };
  const no = () => {
    if (answer !== null) return;
    haptics.tap();
    setAnswer(false);
    // A No disarms the jar until the person next takes a spend from it by hand (M13).
    void markDeclined(store.db, jar.id).catch(() => undefined);
  };

  return (
    <Animated.View entering={FadeInDown.duration(450)} style={{ flex: 1 }}>
      {bigger ? (
        <BiggerSlip slip={slip} gone={answer !== null} />
      ) : (
        <JarPour
          hue={jar.hue}
          icon={jar.icon}
          futureYou={isFutureYouPot(jar)}
          level={jarLevel(held, jar.goal)}
          levelAfter={jarLevel(choice.heldAfter, jar.goal)}
          tag={{ from: money.short(held), to: money.short(choice.heldAfter) }}
          slip={slip}
          pour={answer === true}
          slide={answer === false}
          onRighted={haptics.success}
        />
      )}
      <WordFitText
        style={{
          ...leading(display(44, 500, -0.01), 45),
          color: palette.ink,
          paddingTop: bigger ? 26 : 10,
        }}
      >
        {t('potsClose.ask.title', { jar: name })}
      </WordFitText>
      {bigger ? (
        <View style={{ gap: 10, paddingTop: 22 }}>
          <JarSplit
            hue={jar.hue}
            icon={jar.icon}
            label={t('potsClose.ask.allOfJar')}
            cover={choice.cover}
            rest={choice.rest}
            pour={dry}
          />
          <TomorrowCost
            label={t('potsClose.ask.tomorrow')}
            from={choice.tomorrowClear}
            to={choice.tomorrowFrom}
          />
        </View>
      ) : (
        <View style={{ alignSelf: 'flex-start', marginTop: 16 }}>
          <Animated.View
            pointerEvents="none"
            style={[
              { position: 'absolute', inset: -7, borderRadius: 99, backgroundColor: PULSE },
              pulseStyle,
            ]}
          />
          <View
            style={{
              height: 34,
              paddingLeft: 10,
              paddingRight: 14,
              borderRadius: 99,
              backgroundColor: palette.glass,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Symbol name="check_circle" size={18} color={STEADY} />
            <Text style={{ ...body(14, 650), color: palette.ink }}>
              {t('potsClose.ask.stays', { amount: money.full(Math.max(0, choice.todayStays)) })}
            </Text>
          </View>
        </View>
      )}
      <View style={{ flex: 1 }} />
      <View style={{ gap: 10 }}>
        <PressScale
          scaleTo={0.95}
          disabled={answer !== null}
          onPress={yes}
          style={{
            height: 56,
            borderRadius: 99,
            backgroundColor: palette.btnBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ ...body(17, 650), color: palette.btnFg }}>
            {bigger
              ? t('potsClose.ask.yesPart', { amount: money.short(choice.cover) })
              : t('potsClose.ask.yes')}
          </Text>
        </PressScale>
        <PressScale
          scaleTo={0.97}
          disabled={answer !== null}
          onPress={no}
          style={{
            height: 56,
            borderRadius: 99,
            borderWidth: 1,
            borderColor: palette.inkSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ ...body(17, 600), color: palette.ink }}>
            {bigger ? t('potsClose.ask.noAll') : t('potsClose.ask.no')}
          </Text>
        </PressScale>
      </View>
    </Animated.View>
  );
}

/** The bigger spend's slip, slid down into the day's receipt once answered. */
function BiggerSlip({
  slip,
  gone,
}: {
  readonly slip: { time: string; name: string; amount: number };
  readonly gone: boolean;
}) {
  const away = useSharedValue(0);
  useEffect(() => {
    if (gone) {
      away.set(
        withTiming(1, { duration: SLIDE_MS, easing: enter, reduceMotion: ReduceMotion.System }),
      );
    }
  }, [gone, away]);
  const style = useAnimatedStyle(() => ({
    opacity: 1 - away.get(),
    transform: [{ rotate: '-1.5deg' }, { translateY: 60 * away.get() }],
  }));
  return (
    <Animated.View style={[{ alignSelf: 'flex-start', marginTop: 30 }, style]}>
      <View
        style={{
          boxShadow: '0 10px 18px rgba(20,6,30,.3)',
          paddingTop: 12,
          paddingHorizontal: 16,
          paddingBottom: 10,
          backgroundColor: '#f7f2e8',
        }}
      >
        <SlipText line={slip} />
      </View>
      <PaperEdge color="#f7f2e8" />
    </Animated.View>
  );
}
