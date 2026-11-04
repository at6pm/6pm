import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { Easing, FadeIn, useSharedValue, withTiming } from 'react-native-reanimated';

import type { ImportRecordRow } from '@6pm/domain';
import { importInk } from '@6pm/theme';

import {
  readImports,
  restoreImport,
  undoImport,
  type RemovedImport,
} from '../../data/import-actions';
import { useMoneyStore } from '../../data/money-provider';
import { useStoreQuery } from '../../data/diary-queries';
import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';
import { dateOf } from '../onboarding/since-payday';
import { useCount } from './import-format';

/** How long the button is held before the bring-in goes: long enough never to happen by chance. */
const HOLD_MS = 1200;
const RING = (() => {
  const path = Skia.Path.Make();
  path.addCircle(26, 26, 20);
  return path;
})();

/** One bring-in's undo: hold the round button while its ring draws, or tap to bring it back. */
function Holder({
  record,
  removed,
  onRemoved,
}: {
  readonly record: ImportRecordRow;
  readonly removed: RemovedImport | null;
  readonly onRemoved: (removed: RemovedImport | null) => void;
}) {
  const store = useMoneyStore();
  const { palette } = useTheme();
  const { t, dayMonth } = useI18n();
  const count = useCount();
  const ring = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const app = t(`import.app.${record.app}`);
  const day = record.at.slice(0, 10);
  const local = new Date(record.at);
  const when =
    local.toDateString() === new Date().toDateString()
      ? t('import.undo.today')
      : dayMonth(dateOf(day));
  const release = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    ring.value = withTiming(0, { duration: 150 });
  }, [ring]);
  const hold = () => {
    if (busy) return;
    if (removed) {
      haptics.tap();
      setBusy(true);
      void restoreImport(store, removed).finally(() => {
        onRemoved(null);
        setBusy(false);
      });
      return;
    }
    ring.value = withTiming(1, { duration: HOLD_MS, easing: Easing.linear });
    timer.current = setTimeout(() => {
      timer.current = null;
      haptics.warning();
      setBusy(true);
      void undoImport(store, record.id).then((gone) => {
        ring.value = 0;
        onRemoved(gone);
        setBusy(false);
      });
    }, HOLD_MS);
  };
  const lines = removed?.spends.length ?? record.lines;
  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      style={{
        borderRadius: 24,
        backgroundColor: palette.cell,
        boxShadow: palette.cardShadow,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <PressScale
        accessibilityRole="button"
        accessibilityLabel={removed ? t('import.undo.doneSub') : t('import.undo.title')}
        accessibilityHint={removed ? undefined : t('import.undo.hint')}
        onPressIn={hold}
        onPressOut={release}
        scaleTo={0.94}
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: palette.chipBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Canvas
          style={{ position: 'absolute', width: 52, height: 52, transform: [{ rotate: '-90deg' }] }}
        >
          <Path
            path={RING}
            style="stroke"
            strokeWidth={3}
            strokeCap="round"
            color={importInk.holdRing}
            start={0}
            end={ring}
          />
        </Canvas>
        <Symbol
          name={removed ? 'redo' : 'history'}
          size={24}
          color={removed ? palette.ink : importInk.holdRing}
        />
      </PressScale>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ ...body(15.5, 650), color: palette.ink }}>
          {removed
            ? t('import.undo.done', { count: lines, n: count(lines) })
            : t('import.undo.title')}
        </Text>
        <Text style={{ ...body(12.5), lineHeight: 16.9, color: palette.inkSoft }}>
          {removed ? t('import.undo.doneSub') : t('import.undo.sub', { app, when })}
        </Text>
      </View>
    </Animated.View>
  );
}

const readAll = (store: ReturnType<typeof useMoneyStore>) => readImports(store);

/**
 * Settings › Your data: one card per bring-in, newest first. Holding takes out only that
 * bring-in's lines; the days 6pm closed are never touched. A card taken out stays, to bring back.
 */
export function ImportUndoCards() {
  const imports = useStoreQuery(readAll);
  const [gone, setGone] = useState<ReadonlyMap<string, RemovedImport>>(new Map());
  const here = imports ?? [];
  const cards = [
    ...here,
    ...[...gone.values()].map((g) => g.record).filter((r) => !here.some((h) => h.id === r.id)),
  ].sort((a, b) => (a.at < b.at ? 1 : -1));
  if (cards.length === 0) return null;
  return (
    <View style={{ gap: 8 }}>
      {cards.map((record) => (
        <Holder
          key={record.id}
          record={record}
          removed={gone.get(record.id) ?? null}
          onRemoved={(removed) =>
            setGone((now) => {
              const next = new Map(now);
              if (removed) next.set(record.id, removed);
              else next.delete(record.id);
              return next;
            })
          }
        />
      ))}
    </View>
  );
}
