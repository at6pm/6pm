import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { readFirstCatch } from '../../data/first-catch';
import { useMoneyStore } from '../../data/money-provider';
import { readWallets } from '../../data/onboarding';
import { useI18n } from '../../i18n/i18n';
import { useHomeCurrency } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { useDesignInsets } from '../../ui/layout/design-insets';
import { PressScale } from '../../ui/primitives/press-scale';
import { useAlertAccess } from '../capture-guide/alert-access';
import { useAiMode } from '../privacy/use-ai-mode';
import { nativeReach } from '../surfaces/native-reach';
import {
  catchWaysFor,
  listenWaysOf,
  type CatchWay,
  type ListenWay,
} from '../onboarding/catch-ways';
import { FirstCatchListen } from '../onboarding/first-catch-listen';
import { ownBankOf, tryWay } from '../onboarding/first-catch-try';
import { onboardingPalette } from '../onboarding/onboarding-palette';
import { OnboardingSky } from '../onboarding/onboarding-sky';
import { CATCH_STEP } from '../onboarding/use-onboarding';
import { useFirstCatch } from '../onboarding/use-first-catch';

/**
 * "Catch one" from Today's empty slip: onboarding's wait for a first catch again, over the same
 * dusk, with the ways set up before "later" (sharing always). Back, Later or Continue close it;
 * a catch that lands prints as receipt Nº 001 and Today's card folds away behind it.
 */
export function FirstCatchScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const store = useMoneyStore();
  const aiMode = useAiMode();
  const alertAccess = useAlertAccess();
  const { top, bottom, insets } = useDesignInsets();
  const pal = onboardingPalette(CATCH_STEP);
  const since = useRef(new Date().toISOString());
  const [setUp, setSetUp] = useState<readonly CatchWay[]>([]);
  const [walked, setWalked] = useState<ListenWay | null>(null);
  const [bankId, setBankId] = useState<string | null>(null);
  const listen = useFirstCatch(true, since.current);
  const ways = listenWaysOf(
    catchWaysFor(useHomeCurrency(), aiMode, nativeReach),
    alertAccess === true ? [...setUp, 'alerts'] : setUp,
  );

  useEffect(() => {
    void (async () => {
      const kept = await readFirstCatch(store.db);
      if (kept?.state === 'later') setSetUp((kept.ways ?? []) as CatchWay[]);
      setBankId(ownBankOf(await readWallets(store)));
    })().catch(() => undefined);
  }, [store]);

  const close = () => {
    haptics.tap();
    router.back();
  };
  return (
    <View style={{ flex: 1, backgroundColor: pal.sky[0] }}>
      <StatusBar style="light" animated />
      <OnboardingSky step={CATCH_STEP} safeTop={insets.top} />
      <View
        style={{ flex: 1, paddingTop: top(60), paddingHorizontal: 20, paddingBottom: bottom(30) }}
      >
        <View style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center' }}>
          <PressScale
            scaleTo={0.92}
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel={t('onboarding.back')}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: pal.cell,
              boxShadow: pal.cardShadow,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Symbol name="arrow_back" size={22} color={pal.ink} />
          </PressScale>
        </View>
        <FirstCatchListen
          pal={pal}
          ways={ways}
          walked={walked}
          listen={listen}
          bankId={bankId}
          access={nativeReach.alertListener}
          onTry={(way) => {
            setWalked(way);
            tryWay(way, bankId);
          }}
          onFix={(way) => {
            haptics.tap();
            router.push({ pathname: '/capture-guide', params: { source: way } });
          }}
          onLater={close}
          onContinue={close}
        />
      </View>
    </View>
  );
}
