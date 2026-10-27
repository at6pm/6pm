import { Text, View } from 'react-native';

import { designAmount } from '@6pm/domain';

import { useI18n } from '../../../i18n/i18n';
import { useMoneyFormat } from '../../../money/use-money-format';
import { Symbol } from '../../../ui/icons/symbol';
import { body } from '../../../ui/type/fonts';
import {
  APP_TOKEN,
  AppTile,
  CatchAlertCard,
  NOTIFICATION_CARD_HEIGHT,
  NotificationTriggerCard,
  plusTokenX,
} from './alert-cards';
import { Phone } from './device';
import { iosInk } from './frame-ink';
import { LargeTitle, Magnifier } from './ios-parts';
import { Reveal, TapFlash, Touch, Typed } from './moving-parts';
import { EditorBar, EditorCard, SixPmIcon } from './shortcuts-chrome';
import { DockedDrawer, DrawerItem, Keyboard, SHEET_TOP } from './shortcuts-drawer';
import type { FrameProps } from './wallet-frames-library';

const FULL = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;

/** Where "Catch a bank alert" sits under the trigger. */
const ACTION_TOP = 143 + NOTIFICATION_CARD_HEIGHT + 12;

/** The trigger card's top left on the screen. */
const CARD = { x: 16, y: 143 } as const;

/** The app picker's rows, under its title bar and search. */
const LIST_TOP = SHEET_TOP + 16 + 44 + 12 + 44 + 12;
const ROW = 52;
const rowY = (k: number) => LIST_TOP + ROW * k + ROW / 2;

/** The apps the picker lists, in its order: one is picked each time it opens. */
const LISTED: readonly { readonly id: string; readonly name: string }[] = [
  { id: 'MB', name: 'MB Bank' },
  { id: 'TCB', name: 'Techcombank' },
  { id: 'VCB', name: 'Vietcombank' },
  { id: 'MOMO', name: 'MoMo' },
  { id: 'ZALOPAY', name: 'ZaloPay' },
];

/** Each pass through the picker: when it opens, the row tapped, and when the pick lands. */
const PASSES = [
  { open: 0.14, row: 0, tap: 0.3, picked: 0.36 },
  { open: 0.5, row: 3, tap: 0.66, picked: 0.72 },
] as const;

/** The sheet the App token (or its +) opens: the phone's apps; tapping one picks it. */
function AppPicker({ t, row, tap }: Pick<FrameProps, 't'> & { row: number; tap: number }) {
  const { t: tr } = useI18n();
  return (
    <View
      style={{
        position: 'absolute',
        top: SHEET_TOP,
        left: 8,
        right: 8,
        bottom: 8,
        borderRadius: 44,
        backgroundColor: iosInk.grouped,
        boxShadow: iosInk.shadow,
        paddingTop: 16,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          height: 44,
          marginHorizontal: 16,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ ...body(17, 600), color: iosInk.label }}>{tr('capture.walk.ios.app')}</Text>
        <View style={{ position: 'absolute', left: 0 }}>
          <Text style={{ ...body(17), color: iosInk.blue }}>{tr('capture.walk.ios.cancel')}</Text>
        </View>
      </View>
      <View
        style={{
          marginTop: 12,
          marginHorizontal: 16,
          height: 44,
          borderRadius: 22,
          backgroundColor: iosInk.fill,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 14,
        }}
      >
        <Magnifier color={iosInk.secondary} />
        <Text style={{ ...body(17), color: iosInk.secondary }}>
          {tr('capture.walk.ios.search')}
        </Text>
      </View>
      <View
        style={{
          marginTop: 12,
          marginHorizontal: 16,
          borderRadius: 22,
          backgroundColor: iosInk.bg,
          overflow: 'hidden',
        }}
      >
        {LISTED.map((app, k) => (
          <View
            key={app.id}
            style={{
              height: ROW,
              paddingHorizontal: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              borderTopWidth: k === 0 ? 0 : 0.6,
              borderTopColor: iosInk.separator,
            }}
          >
            {k === row ? <TapFlash t={t} at={tap} /> : null}
            <AppTile id={app.id} />
            <Text style={{ flex: 1, ...body(17), color: iosInk.label }}>{app.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Tap App and pick the bank; tap + and pick the wallet: the trigger names both. */
export function ChooseAppsFrame({ t, scale }: FrameProps) {
  const { t: tr } = useI18n();
  return (
    <Phone t={t} scale={scale} background={iosInk.grouped}>
      <EditorBar name={tr('capture.walk.ios.newShortcut')} icon={false} />
      <EditorCard top={CARD.y}>
        <NotificationTriggerCard t={t} picks={PASSES.map((pass) => pass.picked)} />
      </EditorCard>
      <DockedDrawer />
      {PASSES.map((pass) => (
        <Reveal key={pass.open} t={t} from={pass.open} to={pass.open + 0.08} style={FULL}>
          <Reveal
            t={t}
            from={pass.tap + 0.02}
            to={pass.tap + 0.08}
            out
            style={[FULL, { backgroundColor: iosInk.dim }]}
          />
        </Reveal>
      ))}
      {PASSES.map((pass) => (
        <Reveal key={pass.open} t={t} from={pass.open} to={pass.open + 0.1} dy={460} style={FULL}>
          <Reveal t={t} from={pass.tap + 0.02} to={pass.tap + 0.1} out dy={460} style={FULL}>
            <AppPicker t={t} row={pass.row} tap={pass.tap} />
          </Reveal>
        </Reveal>
      ))}
      <Touch
        t={t}
        stops={[
          { at: 0.04, x: 260, y: 600 },
          { at: 0.12, x: CARD.x + APP_TOKEN.x, y: CARD.y + APP_TOKEN.y, tap: true },
          { at: 0.3, x: 200, y: rowY(PASSES[0].row), tap: true },
          { at: 0.48, x: CARD.x + plusTokenX(1), y: CARD.y + APP_TOKEN.y, tap: true },
          { at: 0.66, x: 200, y: rowY(PASSES[1].row), tap: true },
        ]}
      />
    </Phone>
  );
}

/**
 * The search finds 6pm's "Catch a bank alert"; under the trigger, its Title, Subtitle, Body and
 * Date are set to the notification's.
 */
export function CatchActionFrame({ t, scale }: FrameProps) {
  const { t: tr } = useI18n();
  const name = tr('native.intents.catchAlert.title');
  return (
    <Phone t={t} scale={scale} background={iosInk.grouped}>
      <EditorBar name={tr('capture.walk.ios.newShortcut')} icon={false} />
      <EditorCard top={143}>
        <NotificationTriggerCard t={t} />
      </EditorCard>
      <Reveal t={t} from={0.44} to={0.52} dy={-16} style={FULL}>
        <EditorCard top={ACTION_TOP}>
          <CatchAlertCard t={t} fillAt={0.6} />
        </EditorCard>
      </Reveal>
      <Reveal t={t} from={0.1} to={0.16} out style={FULL}>
        <DockedDrawer />
      </Reveal>
      <Reveal t={t} from={0.12} to={0.2} style={FULL}>
        <Reveal t={t} from={0.42} to={0.5} out dy={300} style={FULL}>
          <View
            style={{
              position: 'absolute',
              top: 70,
              left: 0,
              right: 0,
              bottom: 0,
              borderTopLeftRadius: 40,
              borderTopRightRadius: 40,
              backgroundColor: iosInk.grouped,
              boxShadow: iosInk.shadow,
            }}
          >
            <View
              style={{
                margin: 16,
                marginTop: 10,
                height: 44,
                borderRadius: 22,
                backgroundColor: iosInk.fill,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingHorizontal: 14,
              }}
            >
              <Magnifier color={iosInk.label} />
              <Typed
                t={t}
                from={0.2}
                to={0.32}
                text={tr('capture.walk.ios.alertSearch')}
                width={220}
                style={{ ...body(17), color: iosInk.label }}
              />
            </View>
            <Reveal t={t} from={0.32} to={0.38}>
              <View>
                <DrawerItem name={name} icon={<SixPmIcon size={26} />} />
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 12,
                    right: 12,
                    borderRadius: 22,
                    overflow: 'hidden',
                  }}
                >
                  <TapFlash t={t} at={0.4} />
                </View>
              </View>
            </Reveal>
            <Keyboard />
          </View>
        </Reveal>
      </Reveal>
      <Touch
        t={t}
        stops={[
          { at: 0.04, x: 280, y: 560 },
          { at: 0.1, x: 180, y: 818, tap: true },
          { at: 0.4, x: 270, y: 166, tap: true },
          { at: 0.58, x: 300, y: ACTION_TOP + 58 + 22, tap: true },
          { at: 0.76, x: 300, y: ACTION_TOP + 58 + 44 * 3 + 22 },
        ]}
      />
    </Phone>
  );
}

/** The pictured alert: a made-up account, as MB Bank prints a payment. */
const SAMPLE_ALERT =
  'TK 0123xxx456|GD: -50,000VND 27/10/26 12:30|SD: 1,234,567VND|ND: Thanh toan QR PHO HOA';

/** The pictured payment, in đồng as the design has it. */
const PAID_DONG = 50_000;

/** A small payment, then the bank's alert on the Lock Screen, then 6pm with it in the Inbox. */
export function AlertTestFrame({ t, scale }: FrameProps) {
  const { t: tr } = useI18n();
  const money = useMoneyFormat();
  return (
    <Phone t={t} scale={scale} background={iosInk.bezel} dark>
      <Reveal t={t} from={0.5} to={0.58} out style={FULL}>
        <View style={{ position: 'absolute', top: 110, left: 0, right: 0, alignItems: 'center' }}>
          <Text style={{ ...body(84, 600), color: iosInk.bg, letterSpacing: -1 }}>12:30</Text>
        </View>
        <Reveal
          t={t}
          from={0.1}
          to={0.2}
          dy={-60}
          style={{ position: 'absolute', top: 290, left: 12, right: 12 }}
        >
          <View
            style={{
              borderRadius: 24,
              backgroundColor: 'rgba(255,255,255,0.88)',
              padding: 14,
              flexDirection: 'row',
              gap: 12,
            }}
          >
            <AppTile id="MB" size={38} />
            <View style={{ flex: 1, gap: 2 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ ...body(15, 600), color: iosInk.label }}>MB Bank</Text>
                <Text style={{ ...body(13), color: iosInk.secondary }}>
                  {tr('capture.walk.ios.now')}
                </Text>
              </View>
              <Text style={{ ...body(15), lineHeight: 20, color: iosInk.label }}>
                {SAMPLE_ALERT}
              </Text>
            </View>
          </View>
        </Reveal>
      </Reveal>
      <Reveal
        t={t}
        from={0.52}
        to={0.62}
        dy={30}
        style={[FULL, { backgroundColor: iosInk.grouped }]}
      >
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
            <Symbol name="ramen_dining" size={26} color={iosInk.label} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={{ ...body(18, 600), color: iosInk.label }}>PHO HOA</Text>
            <Text style={{ ...body(15), color: iosInk.secondary }}>
              {tr('capture.walk.test.alertRow')}
            </Text>
          </View>
          <Text style={{ ...body(18, 600), color: iosInk.label }}>
            {money.full(designAmount(PAID_DONG, money.currency))}
          </Text>
          <TapFlash t={t} at={0.72} radius={26} />
        </View>
      </Reveal>
    </Phone>
  );
}
