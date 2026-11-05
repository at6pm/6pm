import { Linking, Text } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import type { NotificationKind } from '@6pm/domain';

import { useMoney } from '../../data/money-provider';
import { DEFAULT_PLAN } from '../../data/plan-settings';
import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { easeOut } from '../../ui/motion/curves';
import { Switch } from '../../ui/primitives/switch';
import { useTheme } from '../../ui/theme/theme';
import { body, leading } from '../../ui/type/fonts';
import { askForReminders } from '../onboarding/close-reminder';
import { useNotificationSettings } from '../reminders/notification-prefs';
import { refreshReminderPermission, useReminderPermission } from '../reminders/reminder-permission';
import { SettingRow, SettingsSection } from './setting-rows';

const reflow = LinearTransition.duration(300).easing(easeOut);

const KIND_ICON: Readonly<Record<NotificationKind, string>> = {
  close: 'schedule',
  payday: 'payments',
  capture: 'receipt_long',
  reminders: 'handshake',
};

const KINDS: readonly NotificationKind[] = ['close', 'payday', 'capture', 'reminders'];

/**
 * Settings › Your day › Notifications, built from Settings' own rows: whether the phone lets 6pm
 * notify (with a way to fix it), a switch for each kind 6pm sends, and whether amounts show on the
 * lock screen. The person can turn any kind off; amounts stay hidden until they allow them.
 */
export function NotificationsScreen() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const plan = useMoney().plan ?? DEFAULT_PLAN;
  const permission = useReminderPermission();
  const { settings, update } = useNotificationSettings();

  const fix = () => {
    haptics.tick();
    if (permission === 'ask') {
      askForReminders()
        .then(() => refreshReminderPermission())
        .catch(() => undefined);
    } else {
      void Linking.openSettings();
    }
  };
  const allowed = permission === 'granted';
  const sub: Readonly<Record<NotificationKind, string>> = {
    close: t('notify.kind.close.sub', { time: plan.closeAt }),
    payday: t('notify.kind.payday.sub'),
    capture: t('notify.kind.capture.sub'),
    reminders: t('notify.kind.reminders.sub'),
  };

  return (
    <>
      <SettingsSection title={t('notify.settings.phone')}>
        <SettingRow
          first
          icon={allowed ? 'notifications' : 'notifications_off'}
          label={t('settings.notifications')}
          {...(allowed ? {} : { sub: t('notify.settings.offSub') })}
          value={
            permission === null
              ? ''
              : allowed
                ? t('notify.settings.allowed')
                : permission === 'ask'
                  ? t('notify.settings.turnOn')
                  : t('notify.settings.offInSettings')
          }
          {...(allowed || permission === null ? {} : { onPress: fix })}
        />
      </SettingsSection>

      {settings === null ? null : (
        <Animated.View entering={FadeIn.duration(250)} layout={reflow} style={{ gap: 26 }}>
          <SettingsSection title={t('notify.settings.kinds')}>
            {KINDS.map((kind, i) => (
              <SettingRow
                key={kind}
                first={i === 0}
                icon={KIND_ICON[kind]}
                label={t(`notify.kind.${kind}`)}
                sub={sub[kind]}
                subLines={2}
                trailing={
                  <Switch
                    value={settings.on[kind]}
                    accessibilityLabel={t(`notify.kind.${kind}`)}
                    onChange={(next) => update({ on: { ...settings.on, [kind]: next } })}
                  />
                }
              />
            ))}
          </SettingsSection>

          <SettingsSection title={t('notify.settings.lockScreen')}>
            <SettingRow
              first
              icon={settings.amounts ? 'visibility' : 'visibility_off'}
              label={t('notify.settings.amounts')}
              sub={t('notify.settings.amounts.sub')}
              subLines={2}
              trailing={
                <Switch
                  value={settings.amounts}
                  accessibilityLabel={t('notify.settings.amounts')}
                  onChange={(amounts) => update({ amounts })}
                />
              }
            />
          </SettingsSection>

          <Text
            style={{
              ...leading(body(13.5), 19.6),
              color: palette.inkSoft,
              paddingHorizontal: 8,
            }}
          >
            {t('notify.settings.note')}
          </Text>
        </Animated.View>
      )}
    </>
  );
}
