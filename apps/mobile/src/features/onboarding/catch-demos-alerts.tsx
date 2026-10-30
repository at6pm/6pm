import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { useI18n } from '../../i18n/i18n';
import { AppIconImage } from '../../ui/app-icon-image';
import { body } from '../../ui/type/fonts';
import { box, SAMPLE, step, useSampleMoney } from './catch-demo-kit';
import { useLoop } from './onboarding-motion';
import { DEMO } from './onboarding-palette';

/**
 * A bank alert caught on Android: the bank's notification drops in, then 6pm's quiet one lands
 * under it with the shop and the amount, both hold, and both slide away, every 3.8 s. Held with
 * both showing under Reduce Motion.
 */
export function AlertsDemo() {
  const { t } = useI18n();
  const sample = useSampleMoney();
  const amount = sample.full(SAMPLE.alert);
  const phase = useLoop(3800, 0, 0.6);
  const bank = useAnimatedStyle(() => {
    const p = phase.value;
    const k = step(p, 0.06, 0.2) * (1 - step(p, 0.86, 0.96));
    return { opacity: k, transform: [{ translateY: -40 * (1 - k) }] };
  });
  const caught = useAnimatedStyle(() => {
    const p = phase.value;
    const k = step(p, 0.36, 0.5) * (1 - step(p, 0.86, 0.96));
    return { opacity: k, transform: [{ translateY: -14 * (1 - k) }, { scale: 0.96 + 0.04 * k }] };
  });
  return (
    <View style={[box, { backgroundColor: DEMO.walletBg, padding: 10, gap: 8 }]}>
      <Animated.View style={[banner, bank]}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: DEMO.alertBank,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ ...body(10.5, 800), color: DEMO.alertBankInk }}>MB</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ ...body(11.5, 700), color: DEMO.paperInk }}>{SAMPLE.alertBank}</Text>
          <Text numberOfLines={1} style={{ ...body(11.5), color: DEMO.paperInk, opacity: 0.75 }}>
            {t('onboarding.catch.alerts.alert', { amount, merchant: SAMPLE.alertMerchant })}
          </Text>
        </View>
      </Animated.View>
      <Animated.View style={[banner, caught]}>
        <AppIconImage size={28} radius={14} />
        <View style={{ flex: 1 }}>
          <Text style={{ ...body(11.5, 700), color: DEMO.paperInk }}>6pm</Text>
          <Text numberOfLines={1} style={{ ...body(11.5), color: DEMO.paperInk, opacity: 0.75 }}>
            {t('surfaces.context.alertCaught', { amount, name: SAMPLE.alertMerchant })}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

/** A notification in the shade: Android's rounded card, the app's icon round in it. */
const banner = {
  height: 52,
  borderRadius: 18,
  backgroundColor: DEMO.bannerBg,
  boxShadow: DEMO.bannerShadow,
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 10,
  gap: 9,
} as const;
