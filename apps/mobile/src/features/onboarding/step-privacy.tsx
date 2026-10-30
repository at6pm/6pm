import type { ReactNode } from 'react';
import { Linking, Text, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { useI18n } from '../../i18n/i18n';
import { Symbol } from '../../ui/icons/symbol';
import type { SymbolName } from '../../ui/icons/symbols.generated';
import { PressScale } from '../../ui/primitives/press-scale';
import { BalancedText } from '../../ui/type/balanced-text';
import { body, display, leading } from '../../ui/type/fonts';
import { ease, riseEntering } from './onboarding-motion';
import { PRIVACY, tileOf, type OnboardingPalette } from './onboarding-palette';
import { PrivacyHero } from './privacy-art';

/** 6pm's source, for anyone who wants to check the promise. */
const SOURCE_URL = 'https://github.com/at6pm/6pm';

/** One line of the promise: a tile, what is promised, and how. */
function PromiseRow({
  icon,
  hue,
  title,
  detail,
  pal,
  trailing,
}: {
  readonly icon: SymbolName;
  readonly hue: number;
  readonly title: string;
  readonly detail: string;
  readonly pal: OnboardingPalette;
  readonly trailing?: ReactNode;
}) {
  const tile = tileOf(hue);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 11,
          experimental_backgroundImage: tile.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Symbol name={icon} size={19} fill={1} weight={500} color={tile.glyph} />
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
        <Text style={{ ...body(15, 650), lineHeight: 19, color: pal.ink }}>{title}</Text>
        <Text style={{ ...body(13, 500), lineHeight: 17, color: PRIVACY.detail }}>{detail}</Text>
      </View>
      {trailing}
    </View>
  );
}

function Rule() {
  return <View style={{ height: 1, marginLeft: 60, backgroundColor: PRIVACY.rule }} />;
}

/**
 * The privacy promise, right after the welcome: the companion in its glass bubble, then what
 * stays on the phone, who can open a backup, and where to read the code; the one thing that
 * leaves the phone is said under the card. Got it goes on to money in.
 */
export function StepPrivacy({
  pal,
  onNext,
}: {
  readonly pal: OnboardingPalette;
  readonly onNext: () => void;
}) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  // `rise`: up 12 pt over 0.55 s, each block 0.12 s after the one above.
  const rise = (k: number) => riseEntering(550, k * 120, reduceMotion, 12, ease.settle);
  const source = t('onboarding.privacy.source');
  const sourceSub = t('onboarding.privacy.sourceSub');

  return (
    <View style={{ flex: 1, paddingTop: 14, gap: 14 }}>
      <PrivacyHero pal={pal} />
      <View style={{ gap: 8 }}>
        <Animated.View entering={rise(0)}>
          <BalancedText
            accessibilityRole="header"
            style={{ ...leading(display(38, 600, -0.035), 38), color: pal.ink }}
          >
            {t('onboarding.privacy.title')}
          </BalancedText>
        </Animated.View>
        <Animated.Text
          entering={rise(1)}
          style={{ ...body(15), lineHeight: 21, color: pal.inkSoft }}
        >
          {t('onboarding.privacy.sub')}
        </Animated.Text>
      </View>
      <Animated.View
        entering={rise(2)}
        style={{ borderRadius: 22, backgroundColor: pal.cell, boxShadow: pal.cardShadow }}
      >
        <PromiseRow
          icon="smartphone"
          hue={150}
          title={t('onboarding.privacy.phone')}
          detail={t('onboarding.privacy.phoneSub')}
          pal={pal}
        />
        <Rule />
        <PromiseRow
          icon="key"
          hue={300}
          title={t('onboarding.privacy.backup')}
          detail={t('onboarding.privacy.backupSub')}
          pal={pal}
        />
        <Rule />
        <PressScale
          scaleTo={0.98}
          onPress={() => void Linking.openURL(SOURCE_URL).catch(() => undefined)}
          accessibilityRole="link"
          accessibilityLabel={`${source}, ${sourceSub}`}
        >
          <PromiseRow
            icon="code"
            hue={60}
            title={source}
            detail={sourceSub}
            pal={pal}
            trailing={
              <Symbol name="north_east" size={18} fill={1} weight={500} color={PRIVACY.arrow} />
            }
          />
        </PressScale>
      </Animated.View>
      <Animated.View entering={rise(3)}>
        <BalancedText
          style={{ ...body(12), lineHeight: 16, color: PRIVACY.foot, textAlign: 'center' }}
        >
          {t('onboarding.privacy.foot')}
        </BalancedText>
      </Animated.View>
      <PressScale
        scaleTo={0.97}
        onPress={onNext}
        accessibilityRole="button"
        style={{
          height: 58,
          borderRadius: 99,
          backgroundColor: pal.btnBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ ...body(17, 700), color: pal.btnFg }}>{t('onboarding.privacy.cta')}</Text>
      </PressScale>
    </View>
  );
}
