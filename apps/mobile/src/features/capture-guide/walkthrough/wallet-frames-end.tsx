import { Text, View } from 'react-native';

import { designAmount } from '@6pm/domain';

import { useI18n } from '../../../i18n/i18n';
import { useMoneyFormat } from '../../../money/use-money-format';
import { Symbol } from '../../../ui/icons/symbol';
import { body } from '../../../ui/type/fonts';
import { WALLET_SHORTCUT_NAME } from '../wallet-shortcut';
import { Phone } from './device';
import { iosInk } from './frame-ink';
import { GlassButton, LargeTitle } from './ios-parts';
import { Reveal, Switch, TapFlash, Touch } from './moving-parts';
import { EditorBar, EditorCard, LogShortcutIcon, SixPmIcon } from './shortcuts-chrome';
import { RunShortcutCard, TriggerCard } from './shortcuts-cards';
import { DockedDrawer } from './shortcuts-drawer';
import type { FrameProps } from './wallet-frames-library';
import {
  CatchAlertCard,
  NOTIFICATION_CARD_HEIGHT,
  NOTIFICATION_CARD_OPEN_HEIGHT,
  NotificationTriggerCard,
} from './alert-cards';
import type { TriggerKind } from './wallet-frames-start';

const FULL = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;

/** Where the action's card sits under a notification trigger with its switches open. */
const ACTION_TOP = 143 + NOTIFICATION_CARD_OPEN_HEIGHT + 12;

/** The trigger's Notify switch, which stays off. */
const NOTIFY_Y = 143 + NOTIFICATION_CARD_HEIGHT + 44 + 22;

/** Show When Run turns off; back saves it, and the automation is listed under Personal. */
export function FinishFrame({ t, scale, kind }: FrameProps & { readonly kind: TriggerKind }) {
  const { t: tr } = useI18n();
  const wallet = kind === 'wallet';
  return (
    <Phone t={t} scale={scale} background={iosInk.grouped}>
      <Reveal t={t} from={0.5} to={0.6} out dx={-60} style={FULL}>
        <EditorBar
          name={tr(wallet ? 'capture.walk.ios.runShortcut' : 'native.intents.catchAlert.title')}
          icon={false}
        />
        <EditorCard top={143}>
          {wallet ? <TriggerCard /> : <NotificationTriggerCard t={t} open />}
        </EditorCard>
        <EditorCard top={wallet ? 251 : ACTION_TOP}>
          {wallet ? <RunShortcutCard t={t} showOffAt={0.26} /> : <CatchAlertCard t={t} />}
        </EditorCard>
        <DockedDrawer />
      </Reveal>
      <Reveal t={t} from={0.52} to={0.62} dx={60} style={FULL}>
        <LargeTitle
          title={tr('capture.walk.ios.automation')}
          left={<GlassButton glyph="chevron_left" />}
          right={<GlassButton glyph="sort" />}
        />
        <Text style={{ ...body(22, 700), color: iosInk.label, marginTop: 16, marginLeft: 20 }}>
          {tr('capture.walk.ios.personal')}
        </Text>
        <View
          style={{
            marginTop: 12,
            marginHorizontal: 16,
            borderRadius: 26,
            backgroundColor: iosInk.bg,
            padding: 20,
            gap: 10,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {wallet ? (
              <Symbol name="wallet" size={28} color={iosInk.blue} fill={1} />
            ) : (
              <Symbol name="notifications" size={28} color={iosInk.red} fill={1} />
            )}
            <Symbol name="arrow_forward" size={20} color={iosInk.tertiary} />
            {wallet ? <LogShortcutIcon size={28} /> : <SixPmIcon size={28} />}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Text style={{ flex: 1, ...body(19, 600), color: iosInk.label }}>
              {tr(
                wallet ? 'capture.walk.ios.walletSummary' : 'capture.walk.ios.notificationSummary',
              )}
            </Text>
            <Switch t={t} from={2} to={2.1} startsOn />
          </View>
          <Text style={{ ...body(15), color: iosInk.secondary }}>
            {wallet ? WALLET_SHORTCUT_NAME : tr('native.intents.catchAlert.title')}
          </Text>
        </View>
      </Reveal>
      <Touch
        t={t}
        stops={[
          { at: 0.08, x: 250, y: 620 },
          { at: 0.26, x: 345, y: wallet ? 335 : NOTIFY_Y, tap: wallet },
          { at: 0.5, x: 38, y: 84, tap: true },
        ]}
      />
    </Phone>
  );
}

/** The test payment the pictured row shows: 59.000₫ in the design. */
const PAID_DONG = 59_000;

/** Apple Pay at a till, then 6pm with the tap waiting in the Inbox. */
export function TestFrame({ t, scale }: FrameProps) {
  const { t: tr } = useI18n();
  const money = useMoneyFormat();
  return (
    <Phone t={t} scale={scale} background={iosInk.bezel} dark>
      <Reveal
        t={t}
        from={0.48}
        to={0.56}
        out
        style={[FULL, { alignItems: 'center', paddingTop: 150 }]}
      >
        <View
          style={{
            width: 330,
            height: 208,
            borderRadius: 18,
            backgroundColor: iosInk.cardA,
            padding: 22,
            justifyContent: 'space-between',
          }}
        >
          <Symbol name="contactless" size={34} color={iosInk.bg} />
          <Text style={{ ...body(17, 600), color: iosInk.bg, letterSpacing: 2 }}>•••• 4321</Text>
        </View>
        <View style={{ marginTop: 120, alignItems: 'center', gap: 14 }}>
          <View style={{ width: 92, height: 92, alignItems: 'center', justifyContent: 'center' }}>
            <Reveal t={t} from={0.06} to={0.2} out style={{ position: 'absolute' }}>
              <Symbol name="contactless" size={72} color={iosInk.blue} />
            </Reveal>
            <Reveal t={t} from={0.2} to={0.3} fromScale={0.6} style={{ position: 'absolute' }}>
              <View
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: 46,
                  borderWidth: 4,
                  borderColor: iosInk.blue,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Symbol name="check" size={58} color={iosInk.blue} weight={600} />
              </View>
            </Reveal>
          </View>
          <Reveal t={t} from={0.22} to={0.3}>
            <Text style={{ ...body(22, 600), color: iosInk.bg }}>
              {tr('capture.walk.test.paid')}
            </Text>
          </Reveal>
        </View>
      </Reveal>
      <Reveal t={t} from={0.5} to={0.6} dy={30} style={[FULL, { backgroundColor: iosInk.grouped }]}>
        <LargeTitle title={tr('capture.walk.test.inbox')} />
        <View
          style={{
            marginTop: 18,
            marginHorizontal: 16,
            borderRadius: 26,
            backgroundColor: iosInk.bg,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              backgroundColor: iosInk.fill,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Symbol name="local_cafe" size={26} color={iosInk.label} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={{ ...body(18, 600), color: iosInk.label }}>Highlands Coffee</Text>
            <Text style={{ ...body(15), color: iosInk.secondary }}>
              {tr('capture.walk.test.row')}
            </Text>
          </View>
          <Text style={{ ...body(18, 600), color: iosInk.label }}>
            {money.full(designAmount(PAID_DONG, money.currency))}
          </Text>
          <TapFlash t={t} at={0.7} radius={26} />
        </View>
      </Reveal>
    </Phone>
  );
}
