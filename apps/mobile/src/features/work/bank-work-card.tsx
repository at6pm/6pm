import { Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { CASH_CODE, findBank, nextBankWork, type BankWork } from '@6pm/domain';

import { useI18n } from '../../i18n/i18n';
import { BankLogo } from '../../ui/bank-logo/bank-logo';
import { haptics } from '../../ui/haptics';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';
import { bankNameOf } from '../banks/named-bank';
import { WorkStamp } from './work-stamp';

/**
 * Settings › Banks for someone with work on: each chosen bank and cash on its row, with the stamp
 * onboarding answered for it. One tap cycles blank → dashed WORK? → solid WORK, saved at once.
 */
export function BankWorkCard({
  banks,
  onAnswer,
}: {
  /** Each chosen bank's and cash's answer, cash last. */
  readonly banks: Readonly<Record<string, BankWork>>;
  readonly onAnswer: (code: string, answer: BankWork) => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const labels = { inked: t('work.stamp'), offered: t('work.stampOffered') };
  const nameOf = (code: string) =>
    code.toUpperCase() === CASH_CODE
      ? t('onboarding.wallets.cash')
      : (bankNameOf(code) ?? findBank(code)?.shortName ?? code);
  return (
    <View
      style={{
        borderRadius: 22,
        backgroundColor: palette.cell,
        boxShadow: palette.cardShadow,
        paddingHorizontal: 16,
      }}
    >
      {Object.entries(banks).map(([code, answer], i) => (
        <PressScale
          key={code}
          highlight
          onPress={() => {
            haptics.tap();
            onAnswer(code, nextBankWork(answer));
          }}
          accessibilityRole="button"
          accessibilityLabel={`${nameOf(code)}, ${t(`work.key.${answer}`)}`}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            minHeight: 62,
            ...(i > 0 ? { borderTopWidth: 0.5, borderColor: palette.hair } : {}),
          }}
        >
          <BankLogo
            id={code}
            size={34}
            radius={10}
            neutral={palette.chipBg}
            neutralInk={palette.ink}
          />
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Text numberOfLines={1} style={{ ...body(16, 650, -0.01), color: palette.ink }}>
              {nameOf(code)}
            </Text>
            <Animated.Text
              key={answer}
              entering={FadeIn.duration(200)}
              numberOfLines={1}
              style={{ ...body(12.5), color: palette.inkSoft }}
            >
              {t(`work.banks.${answer}Sub`)}
            </Animated.Text>
          </View>
          <View style={{ width: 78, alignItems: 'center' }}>
            <WorkStamp face={answer} labels={labels} surface={palette.dark ? 'dark' : 'paper'} />
          </View>
        </PressScale>
      ))}
    </View>
  );
}
