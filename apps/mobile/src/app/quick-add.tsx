import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Platform, Text, type TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  keypadHolding,
  likelyCategoriesAt,
  pressKey,
  ruleCategoryFor,
  ruleIndex,
  toMinor,
  type MerchantRuleRow,
} from '@6pm/domain';
import { moneyInInk } from '@6pm/theme';

import { useMoney, useMoneyActions, useMoneyStore } from '../data/money-provider';
import { useCompanionToast } from '../features/companion/use-companion-toast';
import { useRunAction } from '../features/companion/use-run-action';
import { jarChoiceOf } from '../features/close/jar-choice-of';
import { jarsToSpendFrom } from '../features/details/from-jar-row';
import { Avatar } from '../features/owed/owed-parts';
import { CategoryRow, TicketWorkStamp, WorkStamp } from '../features/quick-add/category-row';
import { FaceSwap } from '../features/quick-add/face-swap';
import { FaceSwitch, type QuickFace } from '../features/quick-add/face-switch';
import { LixiMode, QuickModeSwitch, type QuickMode } from '../features/quick-add/lixi-mode';
import { QuickKeypad } from '../features/quick-add/quick-keypad';
import { TicketWithPrint, useWaitingPhoto } from '../features/quick-add/quick-photo';
import { QuickTicket } from '../features/quick-add/quick-ticket';
import { QuickTools } from '../features/quick-add/quick-tools';
import { TicketFlip } from '../features/quick-add/ticket-flip';
import { ticketStamp } from '../features/quick-add/ticket-stamp';
import { useLixiEntry } from '../features/quick-add/use-lixi-entry';
import { useMoneyInFace } from '../features/quick-add/use-money-in-face';
import { useWalletOptions } from '../features/quick-add/use-wallet-options';
import { CASH_WALLET } from '../features/quick-add/wallet-options';
import { WhoFrom } from '../features/quick-add/who-from';
import { QuickVoicePanel } from '../features/voice/quick-voice';
import { useVoiceEntry } from '../features/voice/use-voice-entry';
import { useTravel } from '../features/travel/travel-provider';
import { initialKeypad, useTravelEntry } from '../features/travel/use-travel-entry';
import { useI18n } from '../i18n/i18n';
import { useMoneyFormat } from '../money/use-money-format';
import { CategoryTile } from '../ui/category-tile';
import { haptics } from '../ui/haptics';
import { Symbol, isSymbolName } from '../ui/icons/symbol';
import { PressScale } from '../ui/primitives/press-scale';
import { useClock } from '../ui/theme/clock';
import { EdgeSheet, EdgeSheetScroll, useEdgeSheet } from '../ui/navigation/edge-sheet';
import { useTheme } from '../ui/theme/theme';
import { body } from '../ui/type/fonts';

/** The header's words grow with the text size up to this much, and the middle then gives way. */
const HEADER_TEXT_MOST = 1.6;

/**
 * Quick add: type it in a few taps, the category most likely at this hour already picked. The
 * header's "Spent · Got paid" turns the ticket over to money that came in, from someone, placed at
 * once (`face: 'in'` opens it that way).
 */
export default function QuickAdd() {
  const { palette } = useTheme();
  const { t, language } = useI18n();
  const { now, hour } = useClock();
  const snap = useMoney();
  const actions = useMoneyActions();
  const store = useMoneyStore();
  const run = useRunAction();
  const say = useCompanionToast();
  const router = useRouter();
  const edge = useEdgeSheet();
  const params = useLocalSearchParams<{
    fromPot?: string;
    face?: string;
    /** Opened from the close's "It landed": the pay's amount, and the income it is the pay of. */
    amount?: string;
    pay?: string;
  }>();
  const [face, setFace] = useState<QuickFace>(params.face === 'in' ? 'in' : 'out');
  // "Split it next": Keep saves the spend, then the split sheet opens on it.
  const [splitting, setSplitting] = useState(false);
  const [side, setSide] = useState(0);
  const { trip, dongQuote } = useTravel();
  const money = useMoneyFormat();
  // Abroad the keypad opens in the local currency, settled once as the sheet opens.
  const [keys, setKeys] = useState(() => {
    const held = Number(params.amount);
    return params.face === 'in' && Number.isSafeInteger(held) && held > 0
      ? keypadHolding(money.currency, held)
      : initialKeypad(trip, money.currency, dongQuote);
  });
  const [note, setNote] = useState('');
  const [sender, setSender] = useState('');
  const senderField = useRef<ComponentRef<typeof TextInput>>(null);
  const [wallet, setWallet] = useState(CASH_WALLET);
  // Opened from a jar's "Spend from it", that jar is already picked.
  const [fromPot, setFromPot] = useState<string | null>(() =>
    params.fromPot && snap.pots.some((p) => p.id === params.fromPot) ? params.fromPot : null,
  );
  const jars = jarsToSpendFrom(snap.pots, snap.potSaved, fromPot);
  const wallets = useWalletOptions();
  const saving = useRef(false);
  const { height: screen } = useWindowDimensions();
  const { top: safeTop, bottom: safeBottom } = useSafeAreaInsets();
  const [headerHeight, setHeaderHeight] = useState(60);
  // What the user taught 6pm: typing a merchant it knows picks that merchant's category.
  const [rules, setRules] = useState<readonly MerchantRuleRow[]>([]);
  useEffect(() => {
    let live = true;
    store.tables.rules
      .all()
      .then((rows) => live && setRules(rows))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [store]);
  const likely = likelyCategoriesAt(hour).map((name) => name.toLowerCase());
  const ordered = [...snap.categories].sort(
    (a, b) => (likely.indexOf(a.id) + 1 || 9) - (likely.indexOf(b.id) + 1 || 9),
  );
  // The hour's likely category is settled when the sheet opens, so it never shifts under the user.
  const [likelyId] = useState(ordered[0]?.id ?? '');
  const [picked, setPicked] = useState<string | null>(null);
  // In the Lunar New Year season Quick add has a third mode: lì xì counted by the envelope.
  const lixi = useLixiEntry({ saving, wallet, onKept: edge.dismiss });
  const envelopesOn = lixi.on;
  const [mode, setMode] = useState<QuickMode>('keypad');
  const voice = useVoiceEntry({
    onEnvelopes: (said) => {
      if (!lixi.heard(said)) return false;
      setMode('envelopes');
      return true;
    },
    language,
    categories: snap.categories,
    rules,
    // Spoken amounts are in the home currency; the currency key still flips to the trip's after.
    setKeys: (next) => setKeys((k) => (k.foreign ? { ...next, foreign: k.foreign } : next)),
    setNote,
    setPicked,
  });
  const voiceOff = voice.dictation.state.phase === 'unavailable';
  const listeningOpen = voice.stage !== 'closed';
  const learned = ruleCategoryFor(
    ruleIndex(rules),
    note,
    new Set(snap.categories.map((c) => c.id)),
  );
  const categoryId = picked ?? learned ?? likelyId;
  const category = snap.categories.find((c) => c.id === categoryId);
  const entry = useTravelEntry(keys);
  const { amount } = entry;
  const stamp = ticketStamp(now, language);
  const moneyIn = useMoneyInFace({ rules, sender, amount, wallet, pay: params.pay ?? null });
  const walletLabel = wallets.find((w) => w.value === wallet)?.label ?? wallet;
  const walletMenu = (label: string) => ({
    label,
    choices: wallets.map((w) => ({ key: w.value, label: w.label })),
    selected: wallet,
    onSelect: setWallet,
  });

  const fromJar = fromPot ? snap.pots.find((p) => p.id === fromPot) : undefined;
  const fromChoice = fromJar
    ? jarChoiceOf(
        snap,
        {
          amount,
          categoryId,
          day: snap.today,
          status: 'kept',
          forWork: false,
          paysBill: null,
          direction: null,
        },
        fromJar.id,
      )
    : null;

  // A photo clipped on the ticket waits until Keep it gives it to the spend.
  const waitingPhoto = useWaitingPhoto(saving);

  /** Keep it on the money-in face: written and placed at once, never left for the close. */
  const keepIn = async () => {
    if (amount <= 0 || saving.current) return;
    saving.current = true;
    const saved = await run(() =>
      moneyIn.keep({ categoryId: likelyId, wallet, foreignAmount: entry.foreignAmount }),
    );
    if (!saved) {
      saving.current = false;
      return;
    }
    // No photo goes with money in: one clipped on the other face is let go.
    waitingPhoto.drop();
    haptics.success();
    say('capture');
    edge.dismiss();
  };

  const save = async () => {
    if (mode === 'envelopes') return lixi.save();
    if (face === 'in') return keepIn();
    // A second tap before the sheet has closed must not write the spend again.
    if (amount <= 0 || !category || saving.current) return;
    saving.current = true;
    // Money said to have come in waits for the close, which asks where it goes.
    let savedId: string | null = null;
    const saved = await run(async () => {
      const row = await actions.addSpend(
        voice.incoming
          ? {
              amount,
              categoryId: category.id,
              merchant: note.trim(),
              source: 'voice',
              status: 'caught',
              wallet,
              foreignAmount: entry.foreignAmount,
              direction: 'in',
            }
          : {
              amount,
              categoryId: category.id,
              merchant: note.trim() || category.name,
              source: voice.said ? 'voice' : 'manual',
              status: 'kept',
              wallet,
              foreignAmount: entry.foreignAmount,
              fromPot,
            },
      );
      savedId = row.id;
    });
    if (!saved) {
      saving.current = false;
      return;
    }
    haptics.success();
    if (savedId !== null) waitingPhoto.keepWith(savedId);
    if (splitting && savedId !== null && !voice.incoming) {
      router.replace({ pathname: '/split', params: { spend: savedId } });
      return;
    }
    say('capture');
    edge.dismiss();
  };

  const turn = (next: QuickFace) => {
    // Voice fills the spend's face only: it stops as the ticket turns over.
    if (listeningOpen) voice.tapMain();
    setMode('keypad');
    setFace(next);
  };

  // In the Lunar New Year season a spend's header holds the keypad and envelope modes instead.
  const modeSwitch = envelopesOn && face === 'out';
  const header = (
    <View
      onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      style={{ paddingTop: 8, paddingHorizontal: 16, gap: 8 }}
    >
      <View
        style={{
          alignSelf: 'center',
          width: 36,
          height: 5,
          borderRadius: 9,
          backgroundColor: palette.inkSoft,
          opacity: 0.35,
        }}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {/* Both sides as wide as Cancel, so the middle stays centred in what is left. The mode
            switch fits itself to that room. The face switch keeps its words: where a language
            leaves them too little (a long Cancel beside two long faces), the empty side
            gives way first, and the switch keeps its gap from Cancel. */}
        <View style={{ minWidth: side, flexShrink: 0, alignItems: 'flex-start' }}>
          <PressScale
            onPress={edge.dismiss}
            onLayout={(e) => setSide(e.nativeEvent.layout.width)}
            style={{ paddingVertical: 6 }}
          >
            <Text
              numberOfLines={1}
              maxFontSizeMultiplier={HEADER_TEXT_MOST}
              style={{ ...body(16), color: palette.inkSoft }}
            >
              {t('quick.cancel')}
            </Text>
          </PressScale>
        </View>
        <View
          style={
            modeSwitch
              ? { flex: 1, minWidth: 0, alignItems: 'center' }
              : { flexGrow: 1, flexShrink: 0, alignItems: 'center' }
          }
        >
          {modeSwitch ? (
            <QuickModeSwitch
              mode={mode}
              envelope={lixi.season.envelope}
              listening={listeningOpen}
              onMode={(next) => {
                haptics.tick();
                if (listeningOpen) voice.tapMain();
                setMode(next);
              }}
              onVoice={() => {
                if (listeningOpen) return;
                setMode('keypad');
                voice.tapMic();
              }}
            />
          ) : (
            <FaceSwitch face={face} onFace={turn} />
          )}
        </View>
        <View
          style={
            modeSwitch
              ? { minWidth: side, flexShrink: 0 }
              : { flexBasis: side, flexShrink: 1, minWidth: 0 }
          }
        />
      </View>
    </View>
  );

  const heard = voice.heard !== null ? t('voice.heard', { said: voice.heard }) : null;
  const todayStays =
    fromJar && !voice.incoming && heard === null
      ? t('quick.todayStays', { amount: money.number(Math.max(0, fromChoice?.todayStays ?? 0)) })
      : null;
  const spendHint =
    todayStays ??
    heard ??
    (voiceOff
      ? t('quick.hintKeys', { amount: money.full(toMinor(45_000, money.currency)) })
      : t('quick.hint'));
  const spendTicket = (
    <QuickTicket
      heading={t('quick.ticket', { no: String(snap.cycleSpends.length + 1).padStart(3, '0') })}
      stamp={stamp}
      amount={amount}
      typed={voice.incoming ? { ...entry.typed, sign: '+' } : entry.typed}
      incoming={voice.incoming}
      hint={spendHint}
      line={todayStays ?? heard ?? entry.underneath ?? ''}
      note={note}
      placeholder={t('quick.what')}
      onNote={setNote}
      tile={
        <CategoryTile
          icon={
            voice.incoming
              ? 'payments'
              : category && isSymbolName(category.icon)
                ? category.icon
                : 'payments'
          }
          hue={voice.incoming ? moneyInInk.hue : (category?.hue ?? 80)}
          size={42}
          radius={14}
          glyph={23}
        />
      }
      lineMenu={walletMenu(t('potsClose.quick.paidWith'))}
      categoryLine={`${voice.incoming ? t('moneyIn.name') : (category?.name ?? '')} · ${walletLabel}`}
    />
  );
  const inTicket = (
    <QuickTicket
      heading={t('quick.in.ticket')}
      stamp={stamp}
      amount={amount}
      typed={{ ...entry.typed, sign: '+' }}
      incoming
      hint={t('quick.hintKeys', { amount: money.full(toMinor(45_000, money.currency)) })}
      line={moneyIn.landingLine ?? entry.underneath ?? ''}
      note={sender}
      placeholder={t('quick.in.who')}
      onNote={setSender}
      inputRef={senderField}
      tile={
        sender.trim() !== '' ? (
          <Avatar name={sender} size={42} />
        ) : (
          <CategoryTile icon="payments" hue={moneyInInk.hue} size={42} radius={14} glyph={23} />
        )
      }
      lineMenu={walletMenu(t('quick.in.into'))}
      categoryLine={`${moneyIn.placeLine} · ${walletLabel}`}
      badge={
        moneyIn.stamped !== null ? (
          <TicketWorkStamp inked={moneyIn.stamped} onToggle={moneyIn.toggleStamp} />
        ) : moneyIn.known?.work ? (
          <WorkStamp label={t('quick.in.work')} />
        ) : null
      }
    />
  );

  return (
    <EdgeSheet sheet={edge}>
      {header}
      {/* The sheet is as tall as this; past the tallest sheet (a small phone, the largest text)
          it scrolls instead of cutting off Keep. */}
      <EdgeSheetScroll
        style={{ maxHeight: Math.max(0, screen - safeTop - headerHeight) }}
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: 14,
          paddingHorizontal: 16,
          // Standing on the bottom edge, Keep stays clear of the home indicator; on Android the
          // sheet already keeps its navigation bar clear, so 8 more is all it takes.
          paddingBottom: edge.drawn
            ? Math.max(22, safeBottom + 8)
            : Platform.OS === 'android'
              ? Math.max(22 - safeBottom, 8)
              : 22,
          gap: 14,
        }}
      >
        {mode === 'envelopes' ? (
          <>
            <LixiMode
              given={lixi.lixi.given}
              count={lixi.lixi.count}
              each={lixi.lixi.each}
              amounts={lixi.amounts}
              total={lixi.total}
              destination={lixi.destination}
              onGiven={(given) => lixi.setLixi((l) => ({ ...l, given }))}
              onCount={(count) => lixi.setLixi((l) => ({ ...l, count }))}
              onEach={(each) => lixi.setLixi((l) => ({ ...l, each }))}
            />
            <PressScale
              accessibilityRole="button"
              scaleTo={0.97}
              onPress={() => void lixi.save()}
              style={{
                height: 56,
                borderRadius: 18,
                backgroundColor: palette.btnBg,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Symbol name="receipt_long" size={20} color={palette.btnFg} />
              <Text style={{ ...body(17, 650), color: palette.btnFg }}>
                {t('season.quick.keep')}
              </Text>
            </PressScale>
          </>
        ) : (
          <>
            <TicketWithPrint
              photo={face === 'out' ? waitingPhoto.photo : null}
              onPick={waitingPhoto.pick}
              onDrop={waitingPhoto.drop}
              title={note.trim() || (category?.name ?? '')}
              subtitle={stamp}
            >
              <Animated.View
                entering={FadeInDown.delay(50).duration(450)}
                style={{ marginHorizontal: 4 }}
              >
                <TicketFlip face={face} out={spendTicket} into={inTicket} />
              </Animated.View>
            </TicketWithPrint>
            <FaceSwap
              face={face}
              style={{ marginHorizontal: -16, marginTop: -6 }}
              out={
                <View style={{ paddingHorizontal: 16, gap: 14 }}>
                  <CategoryRow
                    categories={ordered}
                    chosen={categoryId}
                    onPick={(id) => setPicked(id)}
                  />
                  {voice.incoming ? null : (
                    <QuickTools
                      onPhoto={waitingPhoto.pick}
                      splitting={splitting}
                      onSplit={setSplitting}
                      jars={jars}
                      saved={snap.potSaved}
                      fromPot={fromPot}
                      onFromPot={setFromPot}
                      amount={amount}
                    />
                  )}
                </View>
              }
              into={
                <View style={{ paddingHorizontal: 16, paddingTop: 6 }}>
                  <WhoFrom
                    senders={moneyIn.senders}
                    picked={moneyIn.known?.merchantKey ?? ''}
                    onPick={(s) => setSender(s.merchant)}
                    onName={() => {
                      setSender('');
                      senderField.current?.focus();
                    }}
                  />
                </View>
              }
            />
            <QuickKeypad
              onKey={(key) => {
                voice.forgetHeard();
                setKeys((k) => pressKey(k, key));
              }}
              currency={entry.currencyKey}
              decimal={entry.decimal}
              stage={voice.stage}
              panel={
                <QuickVoicePanel
                  stage={voice.stage}
                  transcript={voice.dictation.transcript}
                  chips={voice.chips}
                  serious={snap.plan?.serious ?? false}
                />
              }
              canKeep={amount > 0}
              onKeep={() => void save()}
              onMic={voice.tapMic}
              onVoiceMain={voice.tapMain}
              micOff={face === 'in'}
            />
          </>
        )}
      </EdgeSheetScroll>
    </EdgeSheet>
  );
}
