import { useMemo, useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';

import {
  currencyOf,
  designAmount,
  homeChangeSample,
  homeRate,
  type Currency,
  type HomeChange,
} from '@6pm/domain';

import { changeHomeCurrency } from '../data/home-currency';
import { useMoneySelector, useMoneyStore } from '../data/money-provider';
import { RowCheck, type PickerInks } from '../features/banks/bank-picker-parts';
import { currencyChoices } from '../features/currency/currency-choices';
import { useDongQuotes } from '../features/currency/use-dong-quotes';
import { CardSheet, CardSheetScroll } from '../features/diary/card-sheet';
import { useI18n } from '../i18n/i18n';
import { deviceCurrencyGuess, startingCurrency } from '../money/device-money';
import { moneyFormatFor, useHomeCurrency } from '../money/use-money-format';
import { haptics } from '../ui/haptics';
import { useDesignInsets } from '../ui/layout/design-insets';
import { PressScale } from '../ui/primitives/press-scale';
import { useTheme } from '../ui/theme/theme';
import { useToast } from '../ui/toast/toast-host';
import { body } from '../ui/type/fonts';

/** The sheet's own height above and below its rows: the grabber, the title row, the note. */
const SHEET_CHROME = 176;
/** What a row shows written in its currency: about a lunch, 50.000₫. */
const SAMPLE_DONG = 50_000;

/**
 * Settings → Currency, in the floating card sheet (and from onboarding's Money in): what the plan
 * is counted in. Before there is a plan a pick is only a choice. Once there is one, the first tap
 * on another currency says the rate and the second converts everything the plan holds.
 */
export default function CurrencySheet() {
  const { palette } = useTheme();
  const { t, language } = useI18n();
  const toast = useToast();
  const store = useMoneyStore();
  const planned = useMoneySelector((s) => s.plan !== null);
  const home = useHomeCurrency();
  const quoteOf = useDongQuotes();
  const [armed, setArmed] = useState<string | null>(null);
  const [changing, setChanging] = useState(false);
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
  const { height } = useWindowDimensions();
  const { insets } = useDesignInsets();
  const rowsMax = height - insets.top - insets.bottom - SHEET_CHROME;
  const choices = useMemo(
    () => currencyChoices(home.code, deviceCurrencyGuess().candidates).map(currencyOf),
    [home.code],
  );

  const changeTo = (to: Currency): HomeChange | null => {
    const rate = homeRate(home.code, to, quoteOf);
    return rate === null ? null : { from: home, to, rate };
  };

  const pick = (to: Currency) => {
    if (changing || to.code === home.code) return;
    if (!planned) {
      haptics.tick();
      startingCurrency.set(to.code);
      return;
    }
    const change = changeTo(to);
    if (change === null) {
      haptics.tap();
      toast(t('settings.currencyNoRate'));
      return;
    }
    if (armed !== to.code) {
      haptics.tap();
      setArmed(to.code);
      return;
    }
    haptics.tick();
    setChanging(true);
    changeHomeCurrency(store, change)
      .then((changed) => {
        if (!changed) toast(t('settings.currencyFailed'));
      })
      .catch(() => toast(t('settings.currencyFailed')))
      .finally(() => {
        setArmed(null);
        setChanging(false);
      });
  };

  /** "$1 = 25.400₫", each side written in its own currency. */
  const rateLine = (to: Currency): string | null => {
    const change = changeTo(to);
    if (change === null) return null;
    const sample = homeChangeSample(change);
    return t('settings.currencyConfirm', {
      from: moneyFormatFor(home, language).full(sample.from),
      to: moneyFormatFor(to, language).full(sample.to),
    });
  };

  return (
    <CardSheet>
      {(dismiss) => (
        <>
          <View style={{ minHeight: 36, alignItems: 'center', justifyContent: 'center' }}>
            <Text accessibilityRole="header" style={{ ...body(17, 650), color: palette.ink }}>
              {t('settings.currency')}
            </Text>
            <PressScale
              accessibilityRole="button"
              onPress={dismiss}
              hitSlop={8}
              style={{ position: 'absolute', right: 0, paddingVertical: 8, paddingHorizontal: 2 }}
            >
              <Text style={{ ...body(17, 650), color: palette.ink }}>{t('common.done')}</Text>
            </PressScale>
          </View>
          <View
            style={{
              borderRadius: 26,
              backgroundColor: palette.cell,
              boxShadow: palette.cardShadow,
              overflow: 'hidden',
              maxHeight: rowsMax,
            }}
          >
            <CardSheetScroll bounces={false} showsVerticalScrollIndicator={false}>
              {choices.map((currency, index) => {
                const confirm = armed === currency.code ? rateLine(currency) : null;
                return (
                  <CurrencyRow
                    key={currency.code}
                    first={index === 0}
                    label={currency.code}
                    sub={
                      confirm ??
                      moneyFormatFor(currency, language).full(designAmount(SAMPLE_DONG, currency))
                    }
                    asking={confirm !== null}
                    on={currency.code === home.code}
                    inks={inks}
                    onPress={() => pick(currency)}
                  />
                );
              })}
            </CardSheetScroll>
          </View>
          {planned ? (
            <Text
              style={{
                ...body(12.5),
                color: palette.inkSoft,
                textAlign: 'center',
                paddingHorizontal: 12,
              }}
            >
              {t('settings.currencyNote')}
            </Text>
          ) : null}
        </>
      )}
    </CardSheet>
  );
}

function CurrencyRow({
  label,
  sub,
  asking,
  on,
  first,
  inks,
  onPress,
}: {
  readonly label: string;
  readonly sub: string;
  /** The row is asking for the second tap: its line is the rate, in the accent. */
  readonly asking: boolean;
  readonly on: boolean;
  readonly first: boolean;
  readonly inks: PickerInks;
  readonly onPress: () => void;
}) {
  return (
    <PressScale
      highlight
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: on }}
      style={{ paddingHorizontal: 16 }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingVertical: 11,
          borderTopWidth: 0.5,
          borderTopColor: first ? 'transparent' : inks.hair,
        }}
      >
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ ...body(16), color: inks.ink }}>{label}</Text>
          <Text
            style={{
              ...body(12.5, asking ? 600 : 400),
              color: asking ? inks.accent : inks.inkSoft,
            }}
          >
            {sub}
          </Text>
        </View>
        <RowCheck on={on} inks={inks} />
      </View>
    </PressScale>
  );
}
