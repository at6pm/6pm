import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import { useI18n } from '../../../i18n/i18n';
import { BankLogo } from '../../../ui/bank-logo/bank-logo';
import { Symbol } from '../../../ui/icons/symbol';
import { body } from '../../../ui/type/fonts';
import { iosInk } from './frame-ink';
import { Reveal, Switch } from './moving-parts';
import { RemoveMark, SixPmIcon } from './shortcuts-chrome';
import { FieldRow, Token } from './shortcuts-cards';

/**
 * The cards of a notification automation as iOS 27 draws them: the trigger "When I receive a
 * notification from App", its Automation and Notify switches, and "Catch a bank alert" from 6pm.
 */

/** The bank and wallet the pictured user picks, as the catalogue codes them. */
export const PICKED_APPS = ['MB', 'MOMO'] as const;

/** How tall the trigger card stands, so the action can sit under it. */
export const NOTIFICATION_CARD_HEIGHT = 130;

/** One switch row under the trigger. */
const OPTION_ROW = 44;

/** How tall it stands with its Automation and Notify switches open. */
export const NOTIFICATION_CARD_OPEN_HEIGHT = NOTIFICATION_CARD_HEIGHT + OPTION_ROW * 2;

/** The trigger's App token's centre, from the card's top left, where the finger taps it. */
export const APP_TOKEN = { x: 16 + 26 + 12 + 24, y: 16 + 60 + 8 + 15 } as const;

/** How far each picked app's chip sits from the one before. */
const CHIP_STEP = 46;

/** The centre of the + after `picked` apps, from the card's top left. */
export const plusTokenX = (picked: number) => 16 + 26 + 12 + CHIP_STEP * picked + 19;

/** A bank or wallet's tile, as the app picker lists it. */
export function AppTile({ id, size = 30 }: { readonly id: string; readonly size?: number }) {
  return (
    <BankLogo
      id={id}
      size={size}
      radius={size * 0.225}
      neutral={iosInk.fill}
      neutralInk={iosInk.label}
      edge={iosInk.separator}
    />
  );
}

/** A tinted square in the trigger's sentence: an app picked, or the + that adds another. */
function Chip({ children }: { readonly children: ReactNode }) {
  return (
    <View
      style={{
        width: 38,
        height: 30,
        borderRadius: 7,
        backgroundColor: iosInk.tokenBg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </View>
  );
}

/**
 * "When I receive a notification from App": the unset App until the first pick, then each bank
 * or wallet as it is picked (at the times in `picks`, one per `PICKED_APPS`), with + after them.
 * Picked from the start when `picks` is undefined. With `open`, the Automation and Notify
 * switches show under it.
 */
export function NotificationTriggerCard({
  t,
  picks,
  open = false,
}: {
  readonly t: SharedValue<number>;
  readonly picks?: readonly number[];
  readonly open?: boolean;
}) {
  const { t: tr } = useI18n();
  const at = (k: number) => picks?.[k] ?? -1;
  // The + after app k goes when the next is picked; the last one stays.
  const plusGone = (k: number) => (k + 1 < PICKED_APPS.length ? at(k + 1) : 2);
  return (
    <View style={{ height: open ? NOTIFICATION_CARD_OPEN_HEIGHT : NOTIFICATION_CARD_HEIGHT }}>
      <View style={{ padding: 16, paddingRight: 48, flexDirection: 'row', gap: 12 }}>
        <View style={{ width: 26, height: 30, alignItems: 'center', justifyContent: 'center' }}>
          <Symbol name="notifications" size={24} color={iosInk.red} fill={1} />
        </View>
        <View style={{ flex: 1, gap: 8, minWidth: 0 }}>
          <Text
            numberOfLines={2}
            style={{ ...body(20, 600), lineHeight: 30, height: 60, color: iosInk.label }}
          >
            {tr('capture.walk.ios.whenNotified')}
          </Text>
          <View style={{ height: 30 }}>
            {picks !== undefined ? (
              <Reveal t={t} from={at(0)} to={at(0) + 0.04} out style={{ position: 'absolute' }}>
                <Token text={tr('capture.walk.ios.app')} unset />
              </Reveal>
            ) : null}
            {PICKED_APPS.map((id, k) => (
              <Reveal
                key={id}
                t={t}
                from={at(k)}
                to={at(k) + 0.06}
                fromScale={0.85}
                style={{ position: 'absolute', left: CHIP_STEP * k }}
              >
                <Chip>
                  <AppTile id={id} size={22} />
                </Chip>
              </Reveal>
            ))}
            {PICKED_APPS.map((id, k) => (
              // The + follows the last app picked: it moves on as each one lands.
              <Reveal
                key={`add-${id}`}
                t={t}
                from={at(k)}
                to={at(k) + 0.06}
                fromScale={0.85}
                style={{ position: 'absolute', left: CHIP_STEP * (k + 1) }}
              >
                <Reveal t={t} from={plusGone(k)} to={plusGone(k) + 0.02} out>
                  <Chip>
                    <Symbol name="add" size={20} color={iosInk.blue} />
                  </Chip>
                </Reveal>
              </Reveal>
            ))}
          </View>
        </View>
      </View>
      <RemoveMark />
      {open ? (
        <>
          <FieldRow label={tr('capture.walk.ios.automation')}>
            <Switch t={t} from={2} to={2.1} startsOn />
          </FieldRow>
          <FieldRow label={tr('capture.walk.ios.notify')}>
            <Switch t={t} from={2} to={2.1} startsOn={false} />
          </FieldRow>
        </>
      ) : null}
    </View>
  );
}

/** How tall "Catch a bank alert" stands: its name and five fields. */
export const CATCH_CARD_HEIGHT = 58 + 44 * 5;

/**
 * "Catch a bank alert" as the editor shows it: 6pm's action with Title, Subtitle, Body and Date
 * set to the notification's own from `fillAt` (set from the start when undefined); App is left
 * empty, as it may be.
 */
export function CatchAlertCard({
  t,
  fillAt,
}: {
  readonly t: SharedValue<number>;
  readonly fillAt?: number;
}) {
  const { t: tr } = useI18n();
  const filled = fillAt ?? -1;
  const fields = [
    ['native.intents.catchAlert.alertTitle', 'capture.walk.ios.notificationTitle'],
    ['native.intents.catchAlert.subtitle', 'capture.walk.ios.notificationSubtitle'],
    ['native.intents.catchAlert.body', 'capture.walk.ios.notificationBody'],
    ['native.intents.catchAlert.date', 'capture.walk.ios.notificationDate'],
  ] as const;
  return (
    <View style={{ height: CATCH_CARD_HEIGHT }}>
      <View
        style={{
          padding: 16,
          paddingRight: 48,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <SixPmIcon size={26} />
        <Text numberOfLines={1} style={{ flex: 1, ...body(20, 600), color: iosInk.label }}>
          {tr('native.intents.catchAlert.title')}
        </Text>
      </View>
      <RemoveMark />
      {fields.map(([label, value], k) => (
        <FieldRow key={label} label={tr(label)}>
          <Reveal t={t} from={filled + k * 0.03} to={filled + k * 0.03 + 0.05} fromScale={0.85}>
            <Token text={tr(value)} />
          </Reveal>
        </FieldRow>
      ))}
      <FieldRow label={tr('native.intents.catchAlert.app')}>
        <Text style={{ ...body(17), color: iosInk.tertiary }}>
          {tr('native.intents.catchAlert.app')}
        </Text>
      </FieldRow>
    </View>
  );
}
