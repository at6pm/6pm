import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn, ReduceMotion } from 'react-native-reanimated';

import { BANKS, currencyOf, type CaptureLogContents, type CaptureLogEvent } from '@6pm/domain';
import { localeOf, type Language } from '@6pm/i18n';
import { catchInk, paperInk } from '@6pm/theme';

import { useI18n, type I18n } from '../../i18n/i18n';
import { moneyFormatFor, useHomeCurrency } from '../../money/use-money-format';
import { DashedRule } from '../../ui/dashed-rule';
import { mono } from '../../ui/type/fonts';

/** The tape prints the newest events, this many. */
export const TAPE_LINES = 4;
/** Each line prints this long after the one above it. */
const LINE_STAGGER_MS = 40;
/** The scalloped edge: a bite of this radius every `BITE * 2` points, `EDGE` deep. */
const BITE = 6;
const EDGE = 9;
/** The time column, so channels line up under one another. */
const TIME_WIDTH = 44;

/** "1 Nov"; "1/11" in Vietnamese, as the design writes it. */
export function shortDate(iso: string, language: Language): string {
  const options: Intl.DateTimeFormatOptions =
    language === 'vi' ? { day: 'numeric', month: 'numeric' } : { day: 'numeric', month: 'short' };
  return new Intl.DateTimeFormat(localeOf(language), options).format(new Date(iso));
}

function clock(iso: string, language: Language): string {
  return new Intl.DateTimeFormat(localeOf(language), {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}

/** A bank by its short code where Vietnam's catalogue has one ("MB", "VCB"), else by its name. */
function bankLabel(name: string): string {
  return BANKS.find((bank) => bank.shortName === name)?.id ?? name;
}

/** The bank that spoke: the sighting's witness, or the bank a heard alert names. */
function speakerOf(event: CaptureLogEvent): string | null {
  if (event.sighting) return event.sighting.witness.name ?? null;
  const handed: unknown = event.handed;
  if (typeof handed !== 'object' || handed === null || !('bank' in handed)) return null;
  return typeof handed.bank === 'string' ? handed.bank : null;
}

function channelLabel(event: CaptureLogEvent, { t, language }: I18n): string {
  switch (event.channel) {
    case 'alert': {
      const bank = speakerOf(event);
      return bank
        ? t('captureLog.channel.alertFrom', {
            bank: bankLabel(bank).toLocaleUpperCase(localeOf(language)),
          })
        : t('captureLog.channel.alert');
    }
    case 'email':
      return t('captureLog.channel.email');
    case 'shared':
      return t('captureLog.channel.shared');
    case 'receiptPhoto':
      return t('captureLog.channel.receiptPhoto');
    case 'qr':
      return t('captureLog.channel.qr');
    case 'wallet':
      return t('captureLog.channel.wallet');
    case 'typed':
      return t('captureLog.channel.typed');
    case 'voice':
      return t('captureLog.channel.voice');
    case 'cash':
      return t('captureLog.channel.cash');
    case 'import':
      return t('captureLog.channel.import');
  }
}

/** Why an alert moved no money: "A CODE", "FAILED". */
function whyLabel(event: CaptureLogEvent, t: I18n['t']): string {
  switch (event.skipped ?? 'unread') {
    case 'code':
      return t('captureLog.why.code');
    case 'failed':
      return t('captureLog.why.failed');
    case 'promo':
      return t('captureLog.why.promo');
    case 'balance':
      return t('captureLog.why.balance');
    case 'security':
      return t('captureLog.why.security');
    case 'unread':
      return t('captureLog.why.unread');
  }
}

/** What decided it, and the row it touched: "SAME PAYMENT AS 16:40 · JOINED". */
function stepLabel(event: CaptureLogEvent, { t, language }: I18n): string {
  const row = event.row;
  switch (event.step) {
    case 'sameMessage':
      return t('captureLog.step.sameMessage');
    case 'repeatTap':
      return t('captureLog.step.repeatTap');
    case 'sameReceipt':
      return t('captureLog.step.sameReceipt');
    case 'repeatAlert':
      return t('captureLog.step.repeatAlert');
    case 'notAPayment':
      return t('captureLog.step.notAPayment', { why: whyLabel(event, t) });
    case 'failed':
      return row
        ? t('captureLog.step.failed', { time: clock(row.at, language) })
        : t('captureLog.step.failedNone');
    case 'reversal':
      return row
        ? t('captureLog.step.reversal', { time: clock(row.at, language) })
        : t('captureLog.step.reversalNone');
    case 'tombstone':
      return t('captureLog.step.tombstone');
    case 'reference':
      return t('captureLog.step.reference', { time: row ? clock(row.at, language) : '' });
    case 'samePayment':
      return t('captureLog.step.samePayment', {
        time: row ? clock(row.at, language) : '',
      });
    case 'ownTransfer':
      return t('captureLog.step.ownTransfer');
    case 'newRow':
      return t('captureLog.step.newRow', {
        name: (row?.merchant ?? '').toLocaleUpperCase(localeOf(language)),
      });
  }
}

/**
 * The tape's scalloped edge: paper with a half-round bite every 12 points along its outer side,
 * the way the design cuts it. `foot` turns it for the bottom of the tape. Before its width is
 * known it is a plain strip of paper.
 */
function TapeEdge({ foot = false }: { readonly foot?: boolean }) {
  const [width, setWidth] = useState(0);
  const path = useMemo(() => {
    if (width <= 0) return null;
    const p = Skia.Path.Make();
    const outer = foot ? EDGE : 0;
    const inner = foot ? 0 : EDGE;
    p.moveTo(0, inner);
    p.lineTo(0, outer);
    for (let x = 0; x < width; x += BITE * 2) {
      // From the bite's left corner round to its right one, into the paper.
      const oval = Skia.XYWHRect(x, outer - BITE, BITE * 2, BITE * 2);
      p.arcToOval(oval, 180, foot ? 180 : -180, false);
    }
    p.lineTo(Math.ceil(width / (BITE * 2)) * BITE * 2, inner);
    p.close();
    return p;
  }, [width, foot]);
  return (
    <View style={{ height: EDGE }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {path ? (
        <Canvas pointerEvents="none" style={{ width, height: EDGE }}>
          <Path path={path} color={paperInk.sheet} />
        </Canvas>
      ) : (
        <View
          style={{
            height: EDGE - BITE,
            marginTop: foot ? 0 : BITE,
            backgroundColor: paperInk.sheet,
          }}
        />
      )}
    </View>
  );
}

function TapeLine({ event, index }: { readonly event: CaptureLogEvent; readonly index: number }) {
  const i18n = useI18n();
  const home = useHomeCurrency();
  const { sighting } = event;
  const amount =
    sighting?.amount === undefined || sighting.currency === undefined
      ? '—'
      : sighting.currency === home.code
        ? moneyFormatFor(home, i18n.language).number(sighting.amount)
        : moneyFormatFor(currencyOf(sighting.currency), i18n.language).full(sighting.amount);
  const text = { ...mono(11.5, 400), color: paperInk.ink } as const;
  return (
    <Animated.View
      entering={FadeIn.duration(200)
        .delay(index * LINE_STAGGER_MS)
        .reduceMotion(ReduceMotion.System)}
      style={{ gap: 2 }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <View style={{ flexDirection: 'row', flexShrink: 1, minWidth: 0 }}>
          <Text style={{ ...text, width: TIME_WIDTH }}>
            {clock(sighting?.at ?? event.loggedAt, i18n.language)}
          </Text>
          <Text numberOfLines={1} style={{ ...text, flexShrink: 1 }}>
            {channelLabel(event, i18n)}
          </Text>
        </View>
        <Text style={{ ...text, fontVariant: ['tabular-nums'] }}>{amount}</Text>
      </View>
      <Text
        numberOfLines={1}
        style={{ ...mono(10.5, 400, 0.04), color: catchInk.tapeSoft, paddingLeft: TIME_WIDTH }}
      >
        {`→ ${stepLabel(event, i18n)}`}
      </Text>
    </Animated.View>
  );
}

/**
 * The capture log's tape: a strip of receipt paper with the newest catches, four at most, each its
 * time, channel and amount and, under it, the step that decided and the row it touched. The head
 * says since when the log has been kept and how many events it holds.
 */
export function CaptureLogTape({ contents }: { readonly contents: CaptureLogContents }) {
  const i18n = useI18n();
  const { t, language } = i18n;
  const newest = contents.events.slice(-TAPE_LINES).reverse();
  const head = { ...mono(10, 400, 0.14), color: catchInk.tapeSoft } as const;
  return (
    <View>
      <TapeEdge />
      <View
        style={{
          backgroundColor: paperInk.sheet,
          boxShadow: catchInk.tapeShadow,
          paddingHorizontal: 14,
          paddingTop: 6,
          paddingBottom: 10,
          gap: 7,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
          <Text numberOfLines={1} style={{ ...head, flexShrink: 1 }}>
            {t('captureLog.tape.head', {
              date: shortDate(contents.since, language).toLocaleUpperCase(localeOf(language)),
            })}
          </Text>
          <Text style={head}>{t('captureLog.tape.events', { count: contents.events.length })}</Text>
        </View>
        <DashedRule color={catchInk.tapeRule} />
        {newest.length === 0 ? (
          <Text style={{ ...mono(10.5, 400, 0.04), color: catchInk.tapeSoft }}>
            {t('captureLog.tape.empty')}
          </Text>
        ) : (
          newest.map((event, k) => (
            <TapeLine key={`${event.loggedAt}:${event.row?.id ?? ''}`} event={event} index={k} />
          ))
        )}
      </View>
      <TapeEdge foot />
    </View>
  );
}
