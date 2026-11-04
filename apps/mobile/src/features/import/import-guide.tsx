import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { OpenFailure } from '@6pm/domain';
import { curves } from '@6pm/theme';

import misa from '../../../assets/import/misa.png';
import moneyLover from '../../../assets/import/moneylover.png';
import momo from '../../../assets/import/momo.png';
import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, display } from '../../ui/type/fonts';
import { GUIDE_APPS, SKETCHES, SketchPhone, type GuideApp } from './guide-sketches';
import { inkWash } from '../diary/diary-colours';
import { FileCard, ImportFoot, PillButton, PrivacyLine } from './import-parts';

/** How long each step shows before the next plays. */
const STEP_MS = 2800;
const enter = Easing.bezier(...curves.enter);
const LAST_APP_KEY = 'import.guideApp';
const ICON = { moneyLover, misa, momo } as const;

/** The app whose guide was open last, so the row opens on it again. */
function useLastApp(): [GuideApp, (app: GuideApp) => void] {
  const db = useSQLiteContext();
  const [app, setApp] = useState<GuideApp>(() => {
    const row = db.getFirstSync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [
      LAST_APP_KEY,
    ]);
    return GUIDE_APPS.find((a) => a === row?.value) ?? 'moneyLover';
  });
  const choose = useCallback(
    (next: GuideApp) => {
      setApp(next);
      db.runSync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
        LAST_APP_KEY,
        next,
      ]);
    },
    [db],
  );
  return [app, choose];
}

/** What went wrong with a file, in words; a lock is asked for, never shown as an error. */
function errorKey(error: OpenFailure) {
  switch (error) {
    case 'empty':
      return 'import.error.empty' as const;
    case 'unsupported':
      return 'import.error.unsupported' as const;
    case 'damaged':
    case 'locked':
    case 'wrongPassword':
      return 'import.error.damaged' as const;
  }
}

/** One sketch on the stage: the shown one large, the others slid 30 pt aside and faded. */
function Stage({
  app,
  at,
  index,
}: {
  readonly app: GuideApp;
  readonly at: number;
  readonly index: number;
}) {
  const reduceMotion = useReducedMotion();
  const sketch = SKETCHES[app][index];
  const style = useAnimatedStyle(() => {
    const shown = at === index;
    const x = shown ? 0 : index < at ? -30 : 30;
    const timing = (v: number, ms: number) =>
      reduceMotion
        ? withTiming(v, { duration: 200 })
        : withTiming(v, { duration: ms, easing: enter });
    return {
      opacity: timing(shown ? 1 : 0, 350),
      transform: [{ translateX: timing(x, 450) }, { scale: timing(shown ? 1.38 : 1.3, 450) }],
    };
  });
  if (!sketch) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', left: '50%', top: '50%', marginLeft: -70, marginTop: -122 },
        style,
      ]}
    >
      <SketchPhone app={app} sketch={sketch} />
    </Animated.View>
  );
}

/** The bar under the playing step, filling over its 2.8 s. */
function StepBar({ run }: { readonly run: number }) {
  const { palette } = useTheme();
  const width = useSharedValue(0);
  useEffect(() => {
    width.value = 0;
    width.value = withTiming(1, { duration: STEP_MS, easing: Easing.linear });
    return () => cancelAnimation(width);
  }, [run, width]);
  const style = useAnimatedStyle(() => ({ width: `${width.value * 100}%` }));
  return (
    <Animated.View
      style={[
        { position: 'absolute', left: 0, bottom: 0, height: 2, backgroundColor: palette.accent },
        style,
      ]}
    />
  );
}

/**
 * "Bring your history": each app's export path, step by step, drawn large in its colours. Steps
 * play on their own; a tap on one holds the timer from it. Then pick the file.
 */
export function ImportGuide({
  error,
  onPick,
}: {
  readonly error: OpenFailure | null;
  readonly onPick: () => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const [app, setApp] = useLastApp();
  const [at, setAt] = useState(0);
  const [run, setRun] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setAt((n) => (n + 1) % 3);
      setRun((n) => n + 1);
    }, STEP_MS);
    return () => clearInterval(timer);
  }, [app, run]);
  const steps = SKETCHES[app];
  const ext = app === 'moneyLover' ? 'CSV' : 'XLSX';
  const restart = (step: number) => {
    setAt(step);
    setRun((n) => n + 1);
  };
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingTop: 6, paddingHorizontal: 16, gap: 14 }}>
        <View
          style={{
            flexDirection: 'row',
            padding: 3,
            borderRadius: 14,
            backgroundColor: palette.chipBg,
          }}
        >
          {GUIDE_APPS.map((a) => (
            <PressScale
              key={a}
              accessibilityRole="tab"
              accessibilityState={{ selected: a === app }}
              onPress={() => {
                haptics.tick();
                setApp(a);
                restart(0);
              }}
              style={{
                flex: 1,
                height: 42,
                borderRadius: 11,
                backgroundColor: a === app ? palette.chipBg : 'transparent',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingHorizontal: 4,
              }}
            >
              <Image source={ICON[a]} style={{ width: 22, height: 22, borderRadius: 6 }} />
              <Text numberOfLines={1} style={{ ...body(13.5, 650), color: palette.ink }}>
                {t(`import.app.${a}`)}
              </Text>
            </PressScale>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {steps.map((step, i) => (
            <PressScale
              key={`${app}-${i}`}
              accessibilityRole="button"
              accessibilityLabel={t('import.guide.step', { n: i + 1, caption: t(step.caption) })}
              accessibilityState={{ selected: i === at }}
              onPress={() => {
                haptics.tick();
                restart(i);
              }}
              style={{
                flex: 1,
                borderRadius: 14,
                backgroundColor: i === at ? palette.chipBg : palette.hair,
                paddingTop: 9,
                paddingHorizontal: 10,
                paddingBottom: 11,
                gap: 3,
                overflow: 'hidden',
              }}
            >
              <Text style={{ ...display(18, 600), lineHeight: 18, color: palette.accent }}>
                {i + 1}
              </Text>
              <Text
                style={{
                  ...body(12, 600),
                  lineHeight: 15,
                  color: palette.ink,
                  opacity: i === at ? 1 : 0.6,
                }}
              >
                {t(step.caption)}
              </Text>
              {i === at ? <StepBar run={run} /> : null}
            </PressScale>
          ))}
        </View>
        <View style={{ flex: 1, minHeight: 0 }}>
          {steps.map((_, i) => (
            <Stage key={`${app}-${i}`} app={app} at={at} index={i} />
          ))}
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: 20,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: error ? palette.accent : inkWash(palette.dark).dashed,
          }}
        >
          <FileCard ext={ext} />
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={{ ...body(13.5), lineHeight: 18.2, color: palette.inkSoft }}>
              {error ? t(errorKey(error)) : t('import.guide.share')}
            </Text>
            {error ? (
              <PressScale accessibilityRole="button" onPress={() => restart(0)} hitSlop={8}>
                <Text style={{ ...body(13.5, 650), color: palette.accent }}>
                  {t('import.error.again')}
                </Text>
              </PressScale>
            ) : null}
          </View>
        </View>
      </View>
      <ImportFoot>
        <PillButton icon="folder_open" label={t('import.guide.pick')} onPress={onPick} />
        <PrivacyLine />
      </ImportFoot>
    </View>
  );
}
