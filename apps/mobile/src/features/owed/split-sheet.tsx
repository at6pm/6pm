import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { owedTotal, SPLIT_MOST } from '@6pm/domain';

import { useMoney } from '../../data/money-provider';
import { findSpend } from '../../data/money-store';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { FitWidth } from '../../ui/layout/fit-width';
import { EdgeSheetScroll, FittedSheet } from '../../ui/navigation/edge-sheet';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, display, tabular } from '../../ui/type/fonts';
import { AmountKeypadSheet } from '../quick-add/amount-keypad-sheet';
import { AmountText } from '../quick-add/amount-text';
import { NameChips } from './name-chips';
import { peopleFromLines, splitOf, type SplitMode, type SplitPerson } from './split-people';
import { TornBill, type Strip } from './torn-bill';
import { useOwed, useOwedActions } from './use-owed';

const slide = Easing.bezier(0.77, 0, 0.175, 1);

/** "Equal" | "By amount", the light sliding under the one chosen. */
function ModeSegment({
  mode,
  onMode,
}: {
  readonly mode: SplitMode;
  readonly onMode: (mode: SplitMode) => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const [width, setWidth] = useState(0);
  const x = useSharedValue(mode === 'equal' ? 0 : 1);
  useEffect(() => {
    x.set(
      withTiming(mode === 'equal' ? 0 : 1, {
        duration: 250,
        easing: slide,
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [mode, x]);
  const part = (width - 6) / 2;
  const light = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() * part }] }));
  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{
        flexDirection: 'row',
        padding: 3,
        borderRadius: 13,
        backgroundColor: palette.chipBg,
      }}
    >
      {width > 0 ? (
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 3,
              top: 3,
              bottom: 3,
              width: part,
              borderRadius: 10,
              backgroundColor: palette.tabActive,
            },
            light,
          ]}
        />
      ) : null}
      {(['equal', 'amount'] as const).map((m) => (
        <PressScale
          key={m}
          accessibilityRole="button"
          accessibilityState={{ selected: m === mode }}
          onPress={() => {
            haptics.tick();
            onMode(m);
          }}
          style={{ flex: 1, height: 36, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ ...body(14, 600), color: palette.ink }}>
            {t(m === 'equal' ? 'owed.split.equal' : 'owed.split.byAmount')}
          </Text>
        </PressScale>
      ))}
    </View>
  );
}

/**
 * Tear the bill: the user's strip (the only part that counts today) over the bill torn into one
 * strip per person, Equal or By amount, who was there, and "Tear 4 ways". By amount, a tap on a
 * friend's strip types their share and the user's takes what is left. Opened from a spend's
 * details, the close's Edit and Quick add; a spend already split opens on its open lines.
 */
export function SplitSheet({ spendId }: { readonly spendId: string }) {
  const router = useRouter();
  const { palette } = useTheme();
  const { t } = useI18n();
  const snap = useMoney();
  const money = useMoneyFormat();
  const owed = useOwedActions();
  const { rows } = useOwed();
  const spend = findSpend(snap, spendId);
  const open = useMemo(() => rows.filter((r) => r.spendId === spendId), [rows, spendId]);
  // The bill as a whole: what the spend keeps now and every share still owed.
  const total = (spend?.amount ?? 0) + owedTotal(open);
  const [start] = useState(() => peopleFromLines(open, total, money.currency));
  const [people, setPeople] = useState<SplitPerson[]>(start.people);
  const [mode, setMode] = useState<SplitMode>(start.mode);
  const [typing, setTyping] = useState<string | null>(null);
  const saving = useRef(false);
  const added = useRef(0);

  const on = people.filter((p) => p.on);
  const split = splitOf(total, people, mode, money.currency);
  const ways = on.length + 1;
  const mine = split?.mine ?? 0;
  const was = start.people.length > 0;

  const strips: Strip[] = [
    {
      key: 'you',
      label: t('owed.split.youStrip'),
      amount: money.short(mine),
      grow: mine,
      mine: true,
    },
    ...people.map((p) => {
      const i = on.indexOf(p);
      const amount = i >= 0 ? (split?.others[i] ?? p.typed ?? 0) : 0;
      const label = (p.name ?? t('owed.someone')).toLocaleUpperCase();
      return {
        key: p.key,
        label,
        amount: i >= 0 ? money.short(amount) : '',
        grow: i >= 0 ? amount : 0,
        mine: false,
        ...(mode === 'amount' && i >= 0
          ? {
              onPress: () => {
                haptics.tick();
                setTyping(p.key);
              },
              accessibilityLabel: t('owed.split.shareOf', { name: p.name ?? t('owed.someone') }),
            }
          : {}),
      };
    }),
  ];

  const pickMode = (next: SplitMode) => {
    if (next === mode) return;
    // By amount starts from the even shares, so nothing jumps.
    if (next === 'amount') {
      const even = splitOf(total, people, 'equal', money.currency);
      setPeople((list) => {
        let i = -1;
        return list.map((p) => {
          if (!p.on) return p;
          i += 1;
          return { ...p, typed: even?.others[i] ?? null };
        });
      });
    } else {
      setPeople((list) => list.map((p) => ({ ...p, typed: null })));
    }
    setMode(next);
  };

  const save = () => {
    if (saving.current || !spend || split === null || (ways === 1 && !was)) return;
    saving.current = true;
    haptics.success();
    const others = on.map((p, i) => ({ name: p.name, amount: split.others[i] ?? 0 }));
    void owed
      .splitSpend(
        spendId,
        { mine: split.mine, others },
        t('scan.receipt.splitNote', { count: ways, total: money.full(total) }),
      )
      .then(() => router.back())
      .catch(() => {
        saving.current = false;
      });
  };

  if (!spend) return null;
  const typingPerson = people.find((p) => p.key === typing);
  const cta =
    ways > 1
      ? t('owed.split.tear', { count: ways })
      : was
        ? t('owed.split.whole')
        : t('owed.split.addSomeone');
  const ready = split !== null && (ways > 1 || was);

  const header = (
    <View style={{ paddingTop: 8, paddingHorizontal: 18, paddingBottom: 6, gap: 6 }}>
      <View
        style={{
          alignSelf: 'center',
          width: 36,
          height: 5,
          borderRadius: 9,
          backgroundColor: palette.inkSoft,
          opacity: 0.35,
        }}
      />
      <View style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
        <PressScale
          accessibilityRole="button"
          onPress={() => router.back()}
          hitSlop={8}
          style={{ position: 'absolute', left: 0, paddingVertical: 8 }}
        >
          <Text style={{ ...body(17), color: palette.inkSoft }}>{t('owed.split.cancel')}</Text>
        </PressScale>
        <Text style={{ ...body(17, 650), color: palette.ink }}>{t('owed.split.title')}</Text>
      </View>
    </View>
  );

  return (
    <FittedSheet>
      {header}
      <EdgeSheetScroll
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 10,
          paddingHorizontal: 16,
          paddingBottom: 24,
          gap: 22,
        }}
      >
        <View style={{ alignItems: 'center', gap: 2 }}>
          <Text
            style={{
              ...body(13, 600, 0.06),
              textTransform: 'uppercase',
              color: palette.inkSoft,
            }}
          >
            {t('owed.split.yours')}
          </Text>
          <FitWidth height={84} align="center">
            <AmountText
              parts={money.parts(mine)}
              numberOfLines={1}
              style={{ ...display(76, 500, -0.03), ...tabular, color: palette.ink }}
              symbol={{ fontSize: 76 * 0.38, opacity: 0.55 }}
            />
          </FitWidth>
          <Text style={{ ...body(13.5), color: palette.inkSoft, textAlign: 'center' }}>
            {t('owed.split.of', { spend: spend.merchant, total: money.full(total) })}
          </Text>
        </View>
        <TornBill strips={strips} />
        {split === null ? (
          <Animated.Text
            entering={FadeIn.duration(200)}
            style={{
              ...body(13.5, 600),
              color: palette.accent,
              textAlign: 'center',
              marginTop: -10,
            }}
          >
            {t('owed.split.over')}
          </Animated.Text>
        ) : null}
        <ModeSegment mode={mode} onMode={pickMode} />
        <View style={{ gap: 10 }}>
          <Text
            style={{
              ...body(13, 600, 0.04),
              textTransform: 'uppercase',
              color: palette.inkSoft,
              paddingHorizontal: 4,
            }}
          >
            {t('owed.split.who')}
          </Text>
          <NameChips
            you={t('owed.split.you')}
            people={people}
            onToggle={(key) =>
              setPeople((list) =>
                list.map((p) => (p.key === key ? { ...p, on: !p.on, typed: null } : p)),
              )
            }
            onAdd={(name) => {
              if (on.length + 1 >= SPLIT_MOST) return;
              haptics.tap();
              added.current += 1;
              setPeople((list) => [
                ...list,
                { key: `new-${added.current}`, name, on: true, typed: null },
              ]);
            }}
          />
        </View>
      </EdgeSheetScroll>
      <View style={{ paddingTop: 12, paddingHorizontal: 16, paddingBottom: 34 }}>
        <PressScale
          scaleTo={0.97}
          accessibilityRole="button"
          accessibilityState={{ disabled: !ready }}
          onPress={save}
          style={{
            height: 56,
            borderRadius: 99,
            backgroundColor: palette.btnBg,
            opacity: ready ? 1 : 0.45,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Symbol name="content_cut" size={20} color={palette.btnFg} />
          <Text style={{ ...body(17, 650), color: palette.btnFg }}>{cta}</Text>
        </PressScale>
      </View>
      {typingPerson ? (
        <AmountKeypadSheet
          title={t('owed.split.shareOf', { name: typingPerson.name ?? t('owed.someone') })}
          below={(typed) => {
            // Nothing typed yet: their strip keeps what it has.
            const amount = typed > 0 ? typed : (typingPerson.typed ?? 0);
            const next = splitOf(
              total,
              people.map((p) => (p.key === typingPerson.key ? { ...p, typed: amount } : p)),
              'amount',
              money.currency,
            );
            return (
              <Text style={{ ...body(14), color: palette.inkSoft, textAlign: 'center' }}>
                {next === null
                  ? t('owed.split.over')
                  : t('owed.split.yoursLeft', { amount: money.full(next.mine) })}
              </Text>
            );
          }}
          onAmount={(amount) => {
            if (amount <= 0) return;
            haptics.tap();
            setPeople((list) =>
              list.map((p) => (p.key === typingPerson.key ? { ...p, typed: amount } : p)),
            );
          }}
          onClose={() => setTyping(null)}
        />
      ) : null}
    </FittedSheet>
  );
}
