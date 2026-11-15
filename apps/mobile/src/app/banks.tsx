import { useEffect, useMemo, useRef, useState } from 'react';
import { Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { startingBankWork, type BankWork } from '@6pm/domain';

import { useMoney, useMoneyStore } from '../data/money-provider';
import { readWallets, writeWallets } from '../data/onboarding';
import { setBankWork } from '../data/work-actions';
import { workOf } from '../data/work-money';
import { BankPicker } from '../features/banks/bank-picker';
import type { PickerInks } from '../features/banks/bank-picker-parts';
import { BankWorkCard } from '../features/work/bank-work-card';
import { useI18n } from '../i18n/i18n';
import { haptics } from '../ui/haptics';
import { SheetScreen } from '../ui/navigation/sheet-screen';
import { useTheme } from '../ui/theme/theme';
import { body } from '../ui/type/fonts';

/**
 * Banks and wallets: the onboarding picker again, from Settings. Each tap is saved at once, so
 * Scan, quick add and receipts follow the new choice the next time they open.
 */
export default function Banks() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const store = useMoneyStore();
  // Someone with work on answers here which bank is for work, as onboarding asked.
  const work = workOf(useMoney());
  // Each answer shows at once; the plan saves it behind.
  const [answered, setAnswered] = useState<Readonly<Record<string, BankWork>>>({});
  const [chosen, setChosen] = useState<readonly string[] | null>(null);
  // Saves run one after another, so a quick double tap can never land out of order.
  const saving = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let live = true;
    readWallets(store)
      .then((ids) => live && setChosen(ids))
      .catch(() => live && setChosen([]));
    return () => {
      live = false;
    };
  }, [store]);

  const inks = useMemo(
    (): PickerInks => ({
      ink: palette.ink,
      inkSoft: palette.inkSoft,
      cell: palette.cell,
      cardShadow: palette.cardShadow,
      chipBg: palette.chipBg,
      hair: palette.hair,
      accent: palette.accent,
      accentClear: `${palette.accent}00`,
      onAccent: palette.accentFg,
    }),
    [palette],
  );

  const toggle = (id: string) => {
    if (chosen === null) return;
    haptics.tap();
    const next = chosen.includes(id) ? chosen.filter((x) => x !== id) : [...chosen, id];
    setChosen(next);
    saving.current = saving.current.then(() => writeWallets(store, next)).catch(() => undefined);
  };

  return (
    <SheetScreen title={t('banks.title')} gap={18}>
      <Text style={{ ...body(15), lineHeight: 21, color: palette.inkSoft, paddingHorizontal: 6 }}>
        {t('banks.sub')}
      </Text>
      {chosen !== null && work !== null ? (
        <Animated.View entering={FadeIn.duration(250)}>
          <BankWorkCard
            banks={startingBankWork(chosen, { ...work.banks, ...answered })}
            onAnswer={(code, answer) => {
              setAnswered((was) => ({ ...was, [code]: answer }));
              saving.current = saving.current
                .then(() => setBankWork(store, code, answer))
                .catch(() => undefined);
            }}
          />
        </Animated.View>
      ) : null}
      {chosen !== null ? (
        <Animated.View entering={FadeIn.duration(250)}>
          <BankPicker inks={inks} chosen={chosen} onToggle={toggle} scroll={false} />
        </Animated.View>
      ) : null}
    </SheetScreen>
  );
}
