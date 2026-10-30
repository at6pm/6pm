import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import type { PlanSettings } from '../../data/plan-settings';
import { useI18n } from '../../i18n/i18n';
import { Companion } from '../../ui/companion/companion';
import { isMaxForm, type CompanionForm } from '../../ui/companion/companion-mood';
import { haptics } from '../../ui/haptics';
import { Switch } from '../../ui/primitives/switch';
import { useTheme } from '../../ui/theme/theme';
import { BalancedText } from '../../ui/type/balanced-text';
import { body, display, leading } from '../../ui/type/fonts';
import { useAppIconSupported } from '../app-icon/app-icon';
import {
  useCompanionSettings,
  useCompanionSettingsStore,
} from '../companion/companion-settings-provider';
import { canUseCompanion, resolveCompanion } from '../purchases/entitlement';
import { useEntitlement } from '../purchases/purchases-provider';
import { CompanionStrip } from './companion-strip';
import { PersonaSegment } from './persona-segment';

/** How long a just-picked companion stays happy while its arrival plays. */
const CELEBRATE_MS = 2400;

/**
 * The companion in Settings, all in one card: the one worn waves and says its idle line in the
 * chosen voice; under it the six to pick from (a pick is worn everywhere at once and plays its
 * arrival; a locked Max one opens Max), then Soft, Cheeky or Roast, serious mode, and whether the
 * app icon follows. Serious mode turns it plain and leaves nothing to pick.
 */
export function CompanionCard({
  persona,
  serious,
  onPersona,
  onSerious,
}: {
  readonly persona: PlanSettings['persona'];
  readonly serious: boolean;
  readonly onPersona: (persona: PlanSettings['persona']) => void;
  readonly onSerious: (serious: boolean) => void;
}) {
  const router = useRouter();
  const { palette } = useTheme();
  const { t } = useI18n();
  const settings = useCompanionSettings();
  const store = useCompanionSettingsStore();
  const { customer } = useEntitlement();
  const iconSupported = useAppIconSupported();
  const worn = resolveCompanion(settings, customer);
  const [celebrating, setCelebrating] = useState(false);
  const calm = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(calm.current), []);
  const preview = t(`companion.idle.${serious ? 'plain' : persona}`);

  const pick = (form: CompanionForm) => {
    if (!canUseCompanion(form, customer)) {
      haptics.tick();
      router.push({ pathname: '/max', params: { from: 'buddy', companion: form } });
      return;
    }
    if (form === worn && settings.chosen !== null) {
      haptics.tick();
      return;
    }
    store.choose(form, (f) => canUseCompanion(f, customer));
    haptics.success();
    setCelebrating(true);
    clearTimeout(calm.current);
    calm.current = setTimeout(() => setCelebrating(false), CELEBRATE_MS);
  };

  return (
    <View
      style={{
        borderRadius: 26,
        overflow: 'hidden',
        backgroundColor: palette.cell,
        boxShadow: palette.cardShadow,
        paddingTop: 18,
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 16,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Companion
          size={66}
          mood={serious ? 'plain' : celebrating ? 'happy' : 'wave'}
          serious={serious}
        />
        <View style={{ flex: 1, gap: 5 }}>
          <Text
            style={{ ...body(12, 600, 0.05), textTransform: 'uppercase', color: palette.inkSoft }}
          >
            {t('settings.companion')}
          </Text>
          <BalancedText style={{ ...leading(display(20, 500, -0.01), 24), color: palette.ink }}>
            {`“${preview}”`}
          </BalancedText>
        </View>
      </View>
      {/* Serious mode has no companion to pick. */}
      {serious ? null : (
        <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(150)}>
          <CompanionStrip
            worn={worn}
            locked={(form) => isMaxForm(form) && !canUseCompanion(form, customer)}
            onPick={pick}
          />
        </Animated.View>
      )}
      <PersonaSegment persona={persona} onPersona={onPersona} />
      <View style={{ marginBottom: -13 }}>
        <SwitchRow
          label={t('settings.serious')}
          sub={t('settings.seriousSub')}
          value={serious}
          onChange={onSerious}
        />
        {iconSupported ? (
          <SwitchRow
            label={t('companions.icon')}
            sub={t('companions.iconSub')}
            value={settings.icon}
            onChange={(on) => store.setIcon(on)}
          />
        ) : null}
      </View>
    </View>
  );
}

function SwitchRow({
  label,
  sub,
  value,
  onChange,
}: {
  readonly label: string;
  readonly sub: string;
  readonly value: boolean;
  readonly onChange: (on: boolean) => void;
}) {
  const { palette } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 13,
        borderTopWidth: 0.5,
        borderTopColor: palette.hair,
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ ...body(16), color: palette.ink }}>{label}</Text>
        <Text style={{ ...body(12.5), color: palette.inkSoft }}>{sub}</Text>
      </View>
      <Switch value={value} onChange={onChange} accessibilityLabel={label} />
    </View>
  );
}
