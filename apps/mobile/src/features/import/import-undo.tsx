import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import Animated, { Easing, FadeIn, useSharedValue, withTiming } from 'react-native-reanimated';

import { localeOf } from '@6pm/i18n';
import type { ImportRecordRow } from '@6pm/domain';
import { importInk } from '@6pm/theme';

import misa from '../../../assets/import/misa.png';
import moneyLover from '../../../assets/import/moneylover.png';
import momo from '../../../assets/import/momo.png';
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
import { useCount } from './import-format';

/** How long a row is held before the bring-in goes: long enough never to happen by chance. */
const HOLD_MS = 1200;
const ROW_H = 48;
const KNOB = 32;
const RING = (() => {
  const path = Skia.Path.Make();
  path.addCircle(KNOB / 2, KNOB / 2, KNOB / 2 - 3);
  return path;
})();
const ICON = { moneyLover, misa, momo } as const;
/** Rows shown before the list scrolls, so the guide's sketch keeps its room. */
const ROWS_SHOWN = 2;

/** What was taken out while the sheet is open, by bring-in, so each can be brought back. */
export type RemovedImports = ReadonlyMap<string, RemovedImport>;

/** The bring-ins taken out while the sheet is open: they stay as rows to bring back until it closes. */
export function useRemovedImports(): [
  RemovedImports,
  (id: string, removed: RemovedImport | null) => void,
] {
  const [gone, setGone] = useState<RemovedImports>(new Map());
  const mark = useCallback((id: string, removed: RemovedImport | null) => {
    setGone((now) => {
      const next = new Map(now);
      if (removed) next.set(id, removed);
      else next.delete(id);
      return next;
    });
  }, []);
  return [gone, mark];
}

/** "5 Nov", "5 thg 11": the day a bring-in was made, or "today". */
function useWhen(): (at: string) => string {
  const { language, t } = useI18n();
  return useMemo(() => {
    const day = new Intl.DateTimeFormat(localeOf(language), { day: 'numeric', month: 'short' });
    return (at: string) => {
      const local = new Date(at);
      return local.toDateString() === new Date().toDateString()
        ? t('import.undo.today')
        : day.format(local);
    };
  }, [language, t]);
}

/** One bring-in: held while its ring draws, it goes; taken out, a tap brings it back. */
function BroughtInRow({
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
  const { t } = useI18n();
  const count = useCount();
  const when = useWhen();
  const ring = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The finger that held a row to empty it is still down: letting go is not a tap to bring it back.
  const heldOut = useRef(false);
  const [busy, setBusy] = useState(false);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const lines = removed?.spends.length ?? record.lines;
  const words = [
    t(`import.app.${record.app}`),
    t('import.undo.lines', { count: lines, n: count(lines) }),
    when(record.at),
  ].join(' · ');
  const icon = record.app === 'other' ? null : ICON[record.app];
  const release = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    ring.value = withTiming(0, { duration: 150 });
  };
  const hold = () => {
    if (busy || removed) return;
    ring.value = withTiming(1, { duration: HOLD_MS, easing: Easing.linear });
    timer.current = setTimeout(() => {
      timer.current = null;
      heldOut.current = true;
      haptics.warning();
      setBusy(true);
      void undoImport(store, record.id).then((gone) => {
        ring.value = 0;
        onRemoved(gone);
        setBusy(false);
      });
    }, HOLD_MS);
  };
  const bringBack = () => {
    if (heldOut.current) {
      heldOut.current = false;
      return;
    }
    if (busy || !removed) return;
    haptics.tap();
    setBusy(true);
    void restoreImport(store, removed).finally(() => {
      onRemoved(null);
      setBusy(false);
    });
  };
  return (
    <Animated.View entering={FadeIn.duration(250)}>
      <PressScale
        accessibilityRole="button"
        accessibilityLabel={removed ? t('import.undo.removed') : words}
        accessibilityHint={removed ? undefined : t('import.undo.hint')}
        onPressIn={hold}
        onPressOut={release}
        onPress={bringBack}
        scaleTo={0.97}
        style={{
          height: ROW_H,
          borderRadius: 14,
          backgroundColor: palette.hair,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingLeft: 12,
          paddingRight: 8,
        }}
      >
        {icon ? (
          <Image
            source={icon}
            accessibilityIgnoresInvertColors
            style={{ width: 22, height: 22, borderRadius: 6, opacity: removed ? 0.5 : 1 }}
          />
        ) : (
          <Symbol name="history" size={20} color={palette.inkSoft} />
        )}
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            ...body(13.5, removed ? 500 : 600),
            color: removed ? palette.inkSoft : palette.ink,
          }}
        >
          {removed ? t('import.undo.removed') : words}
        </Text>
        <View
          style={{
            width: KNOB,
            height: KNOB,
            borderRadius: KNOB / 2,
            backgroundColor: palette.chipBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Canvas
            style={{
              position: 'absolute',
              width: KNOB,
              height: KNOB,
              transform: [{ rotate: '-90deg' }],
            }}
          >
            <Path
              path={RING}
              style="stroke"
              strokeWidth={2.5}
              strokeCap="round"
              color={importInk.holdRing}
              start={0}
              end={ring}
            />
          </Canvas>
          <Symbol
            name={removed ? 'redo' : 'history'}
            size={17}
            color={removed ? palette.ink : importInk.holdRing}
          />
        </View>
      </PressScale>
    </Animated.View>
  );
}

const readAll = (store: ReturnType<typeof useMoneyStore>) => readImports(store);

/**
 * "Brought in", at the foot of the guide: a quiet row per bring-in, newest first. Holding one
 * takes out only that bring-in's lines; the days 6pm closed are never touched. A row taken out
 * stays, to bring back, until the sheet closes.
 */
export function ImportUndoList({
  removed,
  onRemoved,
}: {
  readonly removed: RemovedImports;
  readonly onRemoved: (id: string, removed: RemovedImport | null) => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const imports = useStoreQuery(readAll);
  const here = imports ?? [];
  const rows = [
    ...here,
    ...[...removed.values()].map((g) => g.record).filter((r) => !here.some((h) => h.id === r.id)),
  ].sort((a, b) => (a.at < b.at ? 1 : -1));
  if (rows.length === 0) return null;
  const list = rows.map((record) => (
    <BroughtInRow
      key={record.id}
      record={record}
      removed={removed.get(record.id) ?? null}
      onRemoved={(gone) => onRemoved(record.id, gone)}
    />
  ));
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ ...body(12, 600, 0.04), textTransform: 'uppercase', color: palette.inkSoft }}>
        {t('import.undo.section')}
      </Text>
      {rows.length > ROWS_SHOWN ? (
        <ScrollView
          style={{ maxHeight: ROW_H * ROWS_SHOWN + 6 * (ROWS_SHOWN - 1) + ROW_H / 2 }}
          contentContainerStyle={{ gap: 6 }}
          showsVerticalScrollIndicator={false}
        >
          {list}
        </ScrollView>
      ) : (
        <View style={{ gap: 6 }}>{list}</View>
      )}
    </View>
  );
}
