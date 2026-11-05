import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';

import {
  likelyCategoriesAt,
  pressKey,
  ruleCategoryFor,
  ruleIndex,
  toMinor,
  type MerchantRuleRow,
} from '@6pm/domain';
import { localeOf } from '@6pm/i18n';
import { moneyInInk, oklchSrgbHex } from '@6pm/theme';

import { useMoney, useMoneyActions, useMoneyStore } from '../data/money-provider';
import { useCompanionToast } from '../features/companion/use-companion-toast';
import { useRunAction } from '../features/companion/use-run-action';
import { QuickTicket } from '../features/quick-add/quick-ticket';
import { useWalletOptions } from '../features/quick-add/use-wallet-options';
import { CASH_WALLET } from '../features/quick-add/wallet-options';
import { firstJarFor, FromJarSwitch, FromRow } from '../features/quick-add/wallet-row';
import { jarChoiceOf } from '../features/close/jar-choice-of';
import { jarsToSpendFrom } from '../features/details/from-jar-row';
import { jarName } from '../features/pots/jar-name';
import { SplitSwitch } from '../features/owed/split-switch';
import {
  QuickMainButton,
  QuickMic,
  QuickVoicePanel,
  useVoiceSwap,
} from '../features/voice/quick-voice';
import { useVoiceEntry } from '../features/voice/use-voice-entry';
import { useTravel } from '../features/travel/travel-provider';
import { initialKeypad, useTravelEntry } from '../features/travel/use-travel-entry';
import { useI18n } from '../i18n/i18n';
import { useMoneyFormat } from '../money/use-money-format';
import { CategoryTile } from '../ui/category-tile';
import { haptics } from '../ui/haptics';
import { Keypad } from '../ui/keypad';
import { isSymbolName } from '../ui/icons/symbol';
import { PressScale } from '../ui/primitives/press-scale';
import { useClock } from '../ui/theme/clock';
import { EdgeSheet, EdgeSheetScroll, useEdgeSheet } from '../ui/navigation/edge-sheet';
import { useTheme } from '../ui/theme/theme';
import { body } from '../ui/type/fonts';

/** Quick add: type it in a few taps, the category most likely at this hour already picked. */
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
  // "Split it next": Keep saves the spend, then the split sheet opens on it.
  const [splitting, setSplitting] = useState(false);
  const { trip, dongQuote } = useTravel();
  const money = useMoneyFormat();
  // Abroad the keypad opens in the local currency, settled once as the sheet opens.
  const [keys, setKeys] = useState(() => initialKeypad(trip, money.currency, dongQuote));
  const [note, setNote] = useState('');
  const [wallet, setWallet] = useState(CASH_WALLET);
  // Opened from a jar's "Spend from it", that jar is already picked.
  const params = useLocalSearchParams<{ fromPot?: string }>();
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
  const voice = useVoiceEntry({
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
  const swap = useVoiceSwap(listeningOpen);
  const learned = ruleCategoryFor(
    ruleIndex(rules),
    note,
    new Set(snap.categories.map((c) => c.id)),
  );
  const categoryId = picked ?? learned ?? likelyId;
  const category = snap.categories.find((c) => c.id === categoryId);
  const entry = useTravelEntry(keys);
  const { amount } = entry;
  const locale = localeOf(language);
  const stamp = `${new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short' }).format(now)} · ${new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false }).format(now)}`;

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

  const save = async () => {
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
    if (splitting && savedId !== null && !voice.incoming) {
      router.replace({ pathname: '/split', params: { spend: savedId } });
      return;
    }
    say('capture');
    edge.dismiss();
  };

  const edge = useEdgeSheet();
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
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <PressScale onPress={edge.dismiss} style={{ width: 76, paddingVertical: 6 }}>
          <Text style={{ ...body(16), color: palette.inkSoft }}>{t('quick.cancel')}</Text>
        </PressScale>
        <Text style={{ ...body(16, 650), color: palette.ink }}>{t('quick.title')}</Text>
        <View style={{ width: 76, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
          {voice.incoming ? null : (
            <SplitSwitch on={splitting} onToggle={() => setSplitting((on) => !on)} />
          )}
          {voice.incoming || jars.length === 0 ? null : (
            <FromJarSwitch
              on={fromPot !== null}
              onToggle={() =>
                setFromPot(fromPot !== null ? null : firstJarFor(jars, snap.potSaved, amount))
              }
            />
          )}
        </View>
      </View>
    </View>
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
          // Standing on the bottom edge, Keep stays clear of the home indicator; Android's sheet
          // runs under its navigation bar, so there it stays clear of that.
          paddingBottom:
            edge.drawn || Platform.OS === 'android' ? Math.max(22, safeBottom + 8) : 22,
          gap: 14,
        }}
      >
        <QuickTicket
          heading={t('quick.ticket', { no: String(snap.cycleSpends.length + 1).padStart(3, '0') })}
          stamp={stamp}
          amount={amount}
          typed={voice.incoming ? { ...entry.typed, sign: '+' } : entry.typed}
          incoming={voice.incoming}
          mark={fromJar ? oklchSrgbHex(0.7, 0.12, fromJar.hue) : null}
          hint={
            fromJar && !voice.incoming && voice.heard === null
              ? t('potsClose.quick.ticket', {
                  jar: jarName(fromJar, t).toUpperCase(),
                  amount: money.number(Math.max(0, fromChoice?.todayStays ?? 0)),
                })
              : voice.heard !== null
                ? t('voice.heard', { said: voice.heard })
                : amount
                  ? (entry.underneath ?? '')
                  : voiceOff
                    ? t('quick.hintKeys', { amount: money.full(toMinor(45_000, money.currency)) })
                    : t('quick.hint')
          }
          note={note}
          placeholder={t('quick.what')}
          onNote={setNote}
          icon={
            voice.incoming
              ? 'payments'
              : category && isSymbolName(category.icon)
                ? category.icon
                : 'payments'
          }
          hue={voice.incoming ? moneyInInk.hue : (category?.hue ?? 80)}
          lineMenu={{
            label: t('potsClose.quick.paidWith'),
            choices: wallets.map((w) => ({ key: w.value, label: w.label })),
            selected: wallet,
            onSelect: setWallet,
          }}
          categoryLine={`${voice.incoming ? t('moneyIn.name') : (category?.name ?? '')} · ${wallets.find((w) => w.value === wallet)?.label ?? wallet}`}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          // The chosen tile lifts and rings itself: room above and below so neither is cut off.
          style={{ marginHorizontal: -16, marginTop: -6, marginBottom: -4, flexGrow: 0 }}
          contentContainerStyle={{
            gap: 8,
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 6,
          }}
        >
          {ordered.map((c) => {
            const on = c.id === categoryId;
            return (
              <PressScale
                key={c.id}
                onPress={() => {
                  haptics.tick();
                  setPicked(c.id);
                }}
                style={{ width: 62, alignItems: 'center', gap: 6 }}
              >
                <View
                  style={{
                    borderRadius: 19,
                    padding: 2,
                    borderWidth: 2,
                    borderColor: on ? palette.ink : 'transparent',
                    transform: [{ translateY: on ? -2 : 0 }],
                  }}
                >
                  <CategoryTile
                    icon={isSymbolName(c.icon) ? c.icon : 'payments'}
                    hue={c.hue}
                    size={48}
                    radius={15}
                    glyph={25}
                  />
                </View>
                <Text
                  numberOfLines={1}
                  style={{ ...body(11.5, on ? 650 : 500), color: palette.ink, maxWidth: 62 }}
                >
                  {c.name}
                </Text>
              </PressScale>
            );
          })}
        </ScrollView>
        {voice.incoming ? null : (
          <FromRow jars={jars} saved={snap.potSaved} value={fromPot} onChange={setFromPot} />
        )}
        <View>
          <Animated.View
            pointerEvents={listeningOpen ? 'none' : 'auto'}
            accessibilityElementsHidden={listeningOpen}
            style={swap.keypad}
          >
            <Keypad
              onPress={(key) => {
                voice.forgetHeard();
                setKeys((k) => pressKey(k, key));
              }}
              {...(entry.currencyKey ? { currency: entry.currencyKey } : {})}
              decimal={entry.decimal}
            />
          </Animated.View>
          <Animated.View
            pointerEvents={listeningOpen ? 'auto' : 'none'}
            accessibilityElementsHidden={!listeningOpen}
            style={[
              {
                position: 'absolute',
                inset: 0,
                borderRadius: 22,
                backgroundColor: palette.chipBg,
                overflow: 'hidden',
              },
              swap.panel,
            ]}
          >
            <QuickVoicePanel
              stage={voice.stage}
              transcript={voice.dictation.transcript}
              chips={voice.chips}
            />
          </Animated.View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <QuickMic stage={voice.stage} onPress={voice.tapMic} />
          <QuickMainButton
            stage={voice.stage}
            canKeep={amount > 0}
            onPress={listeningOpen ? voice.tapMain : () => void save()}
          />
        </View>
      </EdgeSheetScroll>
    </EdgeSheet>
  );
}
