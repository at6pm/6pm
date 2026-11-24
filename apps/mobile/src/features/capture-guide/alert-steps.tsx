import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, Linking, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  ReduceMotion,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { keepShortcutAdded, readShortcutAdded } from '../../data/first-catch';
import { useMoneyStore } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { Symbol } from '../../ui/icons/symbol';
import type { SymbolName } from '../../ui/icons/symbols.generated';
import { easeOut } from '../../ui/motion/curves';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';
import { testAlertAvailable, useTestAlert, type TestAlert } from '../capture/use-test-alert';
import { useAiMode } from '../privacy/use-ai-mode';
import { nativeReach } from '../surfaces/native-reach';
import { AutomationDrawing } from './automation-drawing';
import { BANK_ALERT_SHORTCUT_READY, BANK_ALERT_SHORTCUT_TEMPLATE } from './bank-alert-shortcut';
import { captureColours } from './capture-colours';
import { GuideButton, type GuideButtonKind } from './guide-button';
import { MistakesCard } from './guide-notes';
import { GuideTip } from './guide-sections';
import { GuideTrouble } from './guide-trouble';

/**
 * Whether bank alerts are set up here in three steps: on an iPhone whose build adds the template
 * (6pm and the likely banks on its trigger, its automation off) and can send a test alert. Android
 * keeps its own guide, and an older iPhone build its four-step walkthrough.
 */
export const alertStepsShown =
  !nativeReach.alertListener && BANK_ALERT_SHORTCUT_READY && testAlertAvailable;

/** What is under a card that grows or shrinks closes up with the app's settle spring. */
const settle = LinearTransition.springify()
  .damping(22)
  .stiffness(240)
  .reduceMotion(ReduceMotion.System);
const lineIn = FadeIn.duration(220).delay(80).reduceMotion(ReduceMotion.System);
const lineOut = FadeOut.duration(140).reduceMotion(ReduceMotion.System);

/**
 * Added once the person came back from Shortcuts after tapping Get, kept on the phone so the
 * guide opened again (in this launch or a later one) still shows it. The phone cannot see
 * Shortcuts, so this is all it knows. Read once into memory, so a guide opened after the first
 * starts from it.
 */
let addedKnown: boolean | null = null;

/** Whether the shortcut was added, and how to say it was (or, with false, that it is missing). */
function useShortcutAdded(): readonly [boolean, (added: boolean) => void] {
  const { db } = useMoneyStore();
  const [added, setAdded] = useState(addedKnown ?? false);
  useEffect(() => {
    if (addedKnown !== null) return undefined;
    let live = true;
    readShortcutAdded(db)
      .then((at) => {
        addedKnown = at !== null;
        if (live) setAdded(addedKnown);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [db]);
  const keep = useCallback(
    (next: boolean) => {
      addedKnown = next;
      setAdded(next);
      void keepShortcutAdded(db, next ? new Date().toISOString() : null).catch(() => undefined);
    },
    [db],
  );
  return [added, keep] as const;
}

/** The steps to show done, from what the phone knows. */
interface Known {
  readonly added: boolean;
  /** Automation is on: a test alert or a real one came through the Shortcut. */
  readonly running: boolean;
}

/**
 * Bank alerts on the iPhone, as three cards: add the shortcut, turn its Automation on (the step
 * people miss, so it is the large card with the trigger drawn), and send a test alert, whose
 * result shows in its card. Each card has one line and one button, and a tick once the step is
 * known done. "Not working?" folds the add-a-bank note and the usual mistakes away under them,
 * and one line about privacy ends it. `onLeave` is told whenever a button opens Shortcuts.
 */
export function AlertSteps({
  on,
  onLeave,
}: {
  /** Alerts already came in through the Shortcut, so every step is done. */
  readonly on: boolean;
  readonly onLeave?: () => void;
}) {
  const { t } = useI18n();
  const { palette } = useTheme();
  const aiMode = useAiMode();
  const test = useTestAlert();
  const [added, keepAdded] = useShortcutAdded();
  // Back from "Open Shortcuts": the test is what comes next, so its button takes the colour.
  const [visited, setVisited] = useState(false);
  const away = useBackFromShortcuts((what) => {
    if (what === 'get') keepAdded(true);
    else setVisited(true);
  });
  const leave = (what: 'get' | 'open', url: string) => {
    // A test that never came, and Get tapped again: the shortcut is missing, so step 1 is
    // undone until the person comes back from adding it.
    if (what === 'get' && test.state.kind === 'missing') keepAdded(false);
    away(what);
    onLeave?.();
    void Linking.openURL(url).catch(() => undefined);
  };
  const running = on || test.state.kind === 'arrived';
  const known: Known = { added: added || running, running };
  // The one orange button: the first step not known done, or the test once Shortcuts was visited.
  const next = !known.added ? 1 : !known.running ? (visited ? 3 : 2) : 0;
  const kind = (step: number): GuideButtonKind => (step === next ? 'accent' : 'secondary');

  return (
    <View style={{ gap: 12 }}>
      <StepCard
        n={1}
        done={known.added}
        title={t('capture.alerts.steps.addTitle')}
        line={t('capture.alerts.steps.addLine')}
      >
        <GuideButton
          label={t('capture.alerts.steps.addAction')}
          kind={kind(1)}
          onPress={() => leave('get', BANK_ALERT_SHORTCUT_TEMPLATE)}
        />
      </StepCard>

      {/* The step people miss: outlined in the accent until it is known done. */}
      <StepCard
        n={2}
        done={known.running}
        marked={!known.running}
        title={t('capture.alerts.steps.onTitle')}
        line={t('capture.alerts.steps.onLine')}
      >
        <AutomationDrawing />
        <GuideButton
          label={t('capture.alerts.actionOpen')}
          kind={kind(2)}
          onPress={() => leave('open', 'shortcuts://')}
        />
      </StepCard>

      <StepCard
        n={3}
        done={known.running}
        title={t('capture.alerts.steps.testTitle')}
        line={t('capture.alerts.steps.testLine')}
      >
        <TestResult test={test} />
        <TestButton test={test} kind={kind(3)} />
      </StepCard>

      <Animated.View layout={settle} style={{ gap: 12, paddingTop: 8 }}>
        <GuideTrouble look="row">
          {/* The template's trigger has the likely banks chosen; any other is added there. */}
          <GuideTip text={t('capture.walk.alerts.addBank')} />
          <MistakesCard
            items={[
              'capture.walk.alerts.linkedMistake1',
              'capture.walk.alerts.mistake2',
              'capture.walk.alerts.linkedMistake3',
            ]}
          />
        </GuideTrouble>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 6,
            paddingHorizontal: 16,
          }}
        >
          <Symbol name="lock" size={15} color={palette.inkSoft} />
          <Text style={{ ...body(13), lineHeight: 17, color: palette.inkSoft, flexShrink: 1 }}>
            {t(
              aiMode === 'device'
                ? 'capture.alerts.steps.privacyDevice'
                : 'capture.alerts.steps.privacy',
            )}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

/**
 * Tells `onBack` once the person has left for Shortcuts from one of the buttons and come back to
 * 6pm. Returns what to call as a button opens Shortcuts.
 */
function useBackFromShortcuts(
  onBack: (what: 'get' | 'open') => void,
): (what: 'get' | 'open') => void {
  const tell = useRef(onBack);
  tell.current = onBack;
  const pending = useRef<'get' | 'open' | null>(null);
  const left = useRef(false);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (pending.current === null) return;
      if (next === 'background') left.current = true;
      else if (next === 'active' && left.current) {
        const what = pending.current;
        pending.current = null;
        left.current = false;
        tell.current(what);
      }
    });
    return () => sub.remove();
  }, []);
  return (what) => {
    pending.current = what;
    left.current = false;
  };
}

/**
 * One step: its number (a tick once done), title and line, then what it holds. A `marked` card
 * wears a soft accent outline, which fades once it is not.
 */
function StepCard({
  n,
  done,
  marked = false,
  title,
  line,
  children,
}: {
  readonly n: number;
  readonly done: boolean;
  readonly marked?: boolean;
  readonly title: string;
  readonly line: string;
  readonly children: ReactNode;
}) {
  const { palette } = useTheme();
  const outline = useAnimatedStyle(() => ({
    opacity: withTiming(marked ? 0.55 : 0, {
      duration: 300,
      easing: easeOut,
      reduceMotion: ReduceMotion.System,
    }),
  }));
  return (
    <Animated.View
      layout={settle}
      style={{
        borderRadius: 26,
        backgroundColor: palette.cell,
        boxShadow: palette.cardShadow,
        padding: 16,
        gap: 14,
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            inset: 0,
            borderRadius: 26,
            borderWidth: 1.5,
            borderColor: palette.accent,
          },
          outline,
        ]}
      />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <StepMark n={n} done={done} />
        <View style={{ flex: 1, minWidth: 0, gap: 3, paddingTop: 3 }}>
          <Text accessibilityRole="header" style={{ ...body(17, 650), color: palette.ink }}>
            {title}
          </Text>
          <Text style={{ ...body(15), lineHeight: 20, color: palette.inkSoft }}>{line}</Text>
        </View>
      </View>
      {children}
    </Animated.View>
  );
}

/** The step's number, which turns into a green tick with a small spring once the step is done. */
function StepMark({ n, done }: { readonly n: number; readonly done: boolean }) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const colours = captureColours(palette);
  const disc = useAnimatedStyle(() => ({
    backgroundColor: withTiming(done ? colours.ok : palette.chipBg, {
      duration: 240,
      easing: easeOut,
      reduceMotion: ReduceMotion.System,
    }),
  }));
  const tick = useAnimatedStyle(() => ({
    opacity: withTiming(done ? 1 : 0, { duration: 180, reduceMotion: ReduceMotion.System }),
    transform: [
      {
        scale: done
          ? withSpring(1, { damping: 12, stiffness: 320, reduceMotion: ReduceMotion.System })
          : withTiming(0.4, { duration: 160, reduceMotion: ReduceMotion.System }),
      },
    ],
  }));
  const number = useAnimatedStyle(() => ({
    opacity: withTiming(done ? 0 : 1, { duration: 160, reduceMotion: ReduceMotion.System }),
  }));
  return (
    <Animated.View
      accessibilityLabel={done ? `${n}, ${t('capture.alerts.steps.done')}` : String(n)}
      style={[
        { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
        disc,
      ]}
    >
      <Animated.Text style={[body(14.5, 700), { color: palette.ink }, number]}>{n}</Animated.Text>
      <Animated.View style={[{ position: 'absolute' }, tick]}>
        <Symbol name="check" size={19} color={palette.cell} weight={700} />
      </Animated.View>
    </Animated.View>
  );
}

type ResultKey =
  | 'testAlert.works'
  | 'testAlert.firstTry'
  | 'testAlert.stillNothing'
  | 'testAlert.failed'
  | 'testAlert.blocked';

/** What a test came to, said in the card above its button: nothing before one is sent. */
function TestResult({ test }: { readonly test: TestAlert }) {
  const { t } = useI18n();
  const { palette } = useTheme();
  const colours = captureColours(palette);
  const { state } = test;
  if (state.kind === 'idle' || state.kind === 'sent') return null;
  const said: {
    readonly icon: SymbolName;
    readonly tone: 'ok' | 'warn';
    readonly words: ResultKey;
    readonly then?: ResultKey;
  } =
    state.kind === 'arrived'
      ? { icon: 'check_circle', tone: 'ok', words: 'testAlert.works' }
      : state.kind === 'missing'
        ? {
            icon: 'notifications',
            tone: 'warn',
            words: 'testAlert.firstTry',
            then: 'testAlert.stillNothing',
          }
        : state.kind === 'failed'
          ? { icon: 'notifications', tone: 'warn', words: 'testAlert.failed' }
          : { icon: 'notifications_off', tone: 'warn', words: 'testAlert.blocked' };
  return (
    <Animated.View
      key={state.kind}
      entering={lineIn}
      exiting={lineOut}
      layout={settle}
      style={{
        flexDirection: 'row',
        gap: 12,
        padding: 12,
        borderRadius: 18,
        backgroundColor: said.tone === 'ok' ? colours.okBg : colours.warnBg,
      }}
    >
      <Symbol
        name={said.icon}
        size={22}
        color={said.tone === 'ok' ? colours.ok : colours.warn}
        fill={1}
      />
      <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
        <Text
          accessibilityLiveRegion="polite"
          style={{ ...body(15, 550), lineHeight: 20, color: palette.ink }}
        >
          {t(said.words)}
        </Text>
        {said.then ? (
          <Text style={{ ...body(14), lineHeight: 19, color: palette.inkSoft }}>
            {t(said.then)}
          </Text>
        ) : null}
      </View>
    </Animated.View>
  );
}

/**
 * The test's one button, which says what can be done now: send one, wait for it, send again after
 * nothing came or it could not go out, or let 6pm post notifications.
 */
function TestButton({ test, kind }: { readonly test: TestAlert; readonly kind: GuideButtonKind }) {
  const { t } = useI18n();
  const { state } = test;
  switch (state.kind) {
    case 'sent':
      return <GuideButton label={t('testAlert.sent')} kind="secondary" disabled onPress={noop} />;
    case 'missing':
    case 'failed':
      return <GuideButton label={t('testAlert.retry')} kind="accent" onPress={test.send} />;
    case 'blocked':
      return <GuideButton label={t('notify.settings.turnOn')} kind="accent" onPress={test.allow} />;
    case 'arrived':
      return <GuideButton label={t('testAlert.send')} kind="secondary" onPress={test.send} />;
    case 'idle':
      return <GuideButton label={t('testAlert.send')} kind={kind} onPress={test.send} />;
  }
}

function noop(): void {}
