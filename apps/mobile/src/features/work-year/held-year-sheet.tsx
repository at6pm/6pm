import { Share, Text, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

import { localeOf } from '@6pm/i18n';
import { requestInk } from '@6pm/theme';

import { useMoney, useMoneyStore } from '../../data/money-provider';
import { requestActions } from '../../data/request-actions';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { DashedRule } from '../../ui/dashed-rule';
import { haptics } from '../../ui/haptics';
import { easeOut } from '../../ui/motion/curves';
import { SheetScreen } from '../../ui/navigation/sheet-screen';
import { PaperEdge } from '../../ui/paper-edge';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, mono } from '../../ui/type/fonts';
import { CertificateStamp } from '../owed/certificate-stamp';
import { dayMonthOf } from '../owed/request-words';
import { useWorkYear } from './use-work-year';

const settle = LinearTransition.duration(300).easing(easeOut);

/**
 * 8b, held back: every payment of the year a client held tax from, with its stamp. A dashed
 * "ARRIVED?" is one tap from inked with today's date (tap again to lift); an inked line sinks to
 * 70% ink and stays, the year's record. A tap on the client shares a line asking for the
 * certificate, from the person's own phone.
 */
export function HeldYearSheet() {
  const store = useMoneyStore();
  const snap = useMoney();
  const { palette } = useTheme();
  const { t, language } = useI18n();
  const money = useMoneyFormat();
  const { year, held, work } = useWorkYear();
  const locale = localeOf(language);
  const upper = (text: string) => text.toLocaleUpperCase(locale);
  const actions = requestActions(store);

  const ask = (name: string, amount: number, day: string) => {
    haptics.tap();
    void Share.share({
      message: t('heldYear.ask', {
        name,
        amount: money.full(amount),
        date: dayMonthOf(day, language),
      }),
    }).catch(() => undefined);
  };

  return (
    <SheetScreen title={t('heldYear.title', { year })} gap={14} fit>
      {held.length === 0 ? (
        <Text style={{ ...body(15), color: palette.inkSoft, textAlign: 'center', paddingTop: 12 }}>
          {t('heldYear.empty')}
        </Text>
      ) : (
        <View style={{ marginHorizontal: 4 }}>
          <View style={{ transform: [{ scaleY: -1 }] }}>
            <PaperEdge color={requestInk.paper} shadow={false} />
          </View>
          <View
            style={{
              backgroundColor: requestInk.paper,
              paddingHorizontal: 14,
              paddingTop: 8,
              paddingBottom: 14,
              gap: 4,
            }}
          >
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 4 }}
            >
              <Text style={{ ...mono(10, 400, 0.14), color: requestInk.paperSoft }}>
                {t('heldYear.kicker')}
              </Text>
              <Text style={{ ...mono(10, 400, 0.14), color: requestInk.paperSoft }}>
                {t('heldYear.payments', { count: held.length })}
              </Text>
            </View>
            <DashedRule color={requestInk.paperRule} />
            {held.map((entry) => {
              const name = entry.row.merchant.trim() || t('moneyIn.name');
              return (
                <Animated.View
                  key={entry.row.id}
                  layout={settle}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    minHeight: 40,
                    opacity: entry.arrived ? 0.7 : 1,
                  }}
                >
                  <Text style={{ ...mono(10.5), color: requestInk.paperSoft, width: 46 }}>
                    {upper(dayMonthOf(entry.row.day, language))}
                  </Text>
                  <PressScale
                    accessibilityRole="button"
                    onPress={() => ask(name, entry.heldBack, entry.row.day)}
                    style={{ flex: 1 }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{ ...mono(11, 500), color: requestInk.paperInk }}
                    >
                      {upper(name)}
                    </Text>
                  </PressScale>
                  <Text style={{ ...mono(11, 500), color: requestInk.paperInk }}>
                    {money.number(entry.heldBack)}
                  </Text>
                  <View style={{ width: 84, alignItems: 'flex-end' }}>
                    <CertificateStamp
                      small
                      inked={entry.arrived}
                      label={
                        entry.arrived
                          ? t('heldBack.arrivedOn', {
                              date: upper(
                                dayMonthOf(entry.certificateOn ?? entry.row.day, language),
                              ),
                            })
                          : t('heldBack.arrived')
                      }
                      onPress={() => {
                        if (entry.arrived) haptics.tap();
                        else haptics.success();
                        void actions.toggleCertificate(entry.row.id, snap.today);
                      }}
                    />
                  </View>
                </Animated.View>
              );
            })}
            <DashedRule color={requestInk.paperRule} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 6 }}>
              <Text style={{ ...mono(11.5, 600, 0.1), color: requestInk.paperInk }}>
                {t('heldYear.total')}
              </Text>
              <Text style={{ ...mono(12.5, 600), color: requestInk.paperInk }}>
                {money.number(work.heldBack)}
              </Text>
            </View>
            {work.uncertified.count > 0 ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ ...mono(10.5, 400, 0.1), color: requestInk.certificate }}>
                  {t('heldYear.toCome', { count: work.uncertified.count })}
                </Text>
                <Text style={{ ...mono(11, 500), color: requestInk.certificate }}>
                  {money.number(work.uncertified.amount)}
                </Text>
              </View>
            ) : null}
          </View>
          <PaperEdge color={requestInk.paper} shadow={false} />
        </View>
      )}
      <Text style={{ ...body(13.5), color: palette.inkSoft, textAlign: 'center' }}>
        {t('heldYear.foot')}
      </Text>
    </SheetScreen>
  );
}
