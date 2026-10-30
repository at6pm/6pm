import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { Linking, Share, Text, View } from 'react-native';

import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';
import { useCompanionToast } from '../companion/use-companion-toast';
import { nativeReach } from '../surfaces/native-reach';
import { openAlertAccess } from './alert-access';
import { BANK_ALERT_SHORTCUT_URL } from './bank-alert-shortcut';
import { captureColours } from './capture-colours';
import type { CaptureSource } from './source-status';
import { WALLET_SHORTCUT_URL } from './wallet-shortcut';

interface GuideAction {
  readonly label: string;
  /** The orange button: while an automation is still off and its shortcut is one tap away. */
  readonly accent: boolean;
  readonly run: () => void;
}

/**
 * A guide's buttons, under its headline where the thumb and the eye already are: the first as a
 * full pill, any other as a quiet line under it, and a short reassurance beneath when there is one.
 */
export function GuideActions({
  source,
  on,
  emailAddress,
  note = null,
}: {
  readonly source: CaptureSource;
  readonly on: boolean;
  readonly emailAddress: string | null;
  readonly note?: string | null;
}) {
  const { palette } = useTheme();
  const colours = captureColours(palette);
  const actions = useGuideActions(source, on, emailAddress);
  const [first, ...rest] = actions;
  if (!first) return null;
  return (
    <View style={{ gap: 4 }}>
      <PressScale
        accessibilityRole="button"
        onPress={first.run}
        style={{
          height: 56,
          borderRadius: 99,
          backgroundColor: first.accent ? palette.accent : palette.btnBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ ...body(17, 650), color: first.accent ? colours.onAccent : palette.btnFg }}>
          {first.label}
        </Text>
      </PressScale>
      {rest.map((action) => (
        <PressScale
          key={action.label}
          accessibilityRole="button"
          onPress={action.run}
          style={{ height: 44, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ ...body(16, 600), color: palette.ink }}>{action.label}</Text>
        </PressScale>
      ))}
      {note ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingTop: rest.length > 0 ? 0 : 8,
            paddingHorizontal: 12,
          }}
        >
          <Symbol name="lock" size={15} color={palette.inkSoft} />
          <Text style={{ ...body(13), color: palette.inkSoft, flexShrink: 1 }}>{note}</Text>
        </View>
      ) : null}
    </View>
  );
}

function openUrl(url: string): void {
  haptics.tap();
  void Linking.openURL(url).catch(() => undefined);
}

/**
 * The buttons for each way. Pinning in the share row and the automations are the user's to set in
 * iOS, so those open the share sheet and the Shortcuts app; the 6pm shortcut an automation runs is
 * offered first, once one is published, and stays offered once it is on. Receipt email copies the address, and
 * has no button until the server has given one. Siri and Back Tap need nothing from 6pm: their
 * steps are all there is.
 */
function useGuideActions(
  source: CaptureSource,
  on: boolean,
  emailAddress: string | null,
): readonly GuideAction[] {
  const { t } = useI18n();
  const router = useRouter();
  const say = useCompanionToast();
  switch (source) {
    case 'share':
      return [
        {
          label: t('capture.share.action'),
          accent: false,
          run: () => {
            haptics.tap();
            void Share.share({ message: t('capture.share.pinText') }).catch(() => undefined);
          },
        },
      ];
    case 'email':
      if (emailAddress === null) return [];
      return [
        {
          label: t('receiptEmail.copy'),
          accent: false,
          run: () => {
            haptics.tap();
            void Clipboard.setStringAsync(emailAddress)
              .then(() => say('copied'))
              .catch(() => undefined);
          },
        },
      ];
    case 'scan':
      return [
        {
          label: t('capture.scan.action'),
          accent: false,
          run: () => {
            haptics.tap();
            router.push('/scan');
          },
        },
      ];
    case 'wallet': {
      const shortcuts: GuideAction = {
        label: t(on ? 'capture.wallet.actionOn' : 'capture.wallet.actionOff'),
        accent: false,
        run: () => openUrl('shortcuts://'),
      };
      // Still offered once it is on: a deleted shortcut is added back from here.
      return [
        {
          label: t('capture.wallet.actionAdd'),
          accent: !on,
          run: () => openUrl(WALLET_SHORTCUT_URL),
        },
        shortcuts,
      ];
    }
    case 'alerts': {
      // Android: the one switch under Notification access, still offered once it is on.
      if (nativeReach.alertListener) {
        return [
          {
            label: t(on ? 'capture.alerts.actionOpen' : 'capture.alerts.actionAdd'),
            accent: !on,
            run: openAlertAccess,
          },
        ];
      }
      const shortcuts: GuideAction = {
        label: t('capture.alerts.actionOpen'),
        accent: false,
        run: () => openUrl('shortcuts://'),
      };
      // Without a published shortcut, the automation is built by hand in Shortcuts.
      if (BANK_ALERT_SHORTCUT_URL === null) return [shortcuts];
      const url = BANK_ALERT_SHORTCUT_URL;
      return [
        { label: t('capture.alerts.actionAdd'), accent: !on, run: () => openUrl(url) },
        shortcuts,
      ];
    }
    case 'siri':
    case 'backTap':
      return [];
    case 'widgets':
      return [
        {
          label: t('capture.widgets.action'),
          accent: false,
          run: () => {
            haptics.tap();
            router.back();
          },
        },
      ];
  }
}
