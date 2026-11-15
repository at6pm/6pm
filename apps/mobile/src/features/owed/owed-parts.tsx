import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useMemo, type ReactNode } from 'react';
import { Text, View } from 'react-native';

import { encodeQR, personKey } from '@6pm/domain';
import { owedAvatar, owedInk } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { WorkStamp } from '../work/work-stamp';
import { body, display, mono } from '../../ui/type/fonts';
import { VerticalTear } from './torn-bill';

/**
 * A person's round avatar: their initial on their colour; "?" for a share with no name. A client
 * that is a shop or a company has a square one.
 */
export function Avatar({
  name,
  size,
  dim = false,
  square = false,
}: {
  readonly name: string | null;
  readonly size: number;
  readonly dim?: boolean;
  readonly square?: boolean;
}) {
  const initial = name?.trim().charAt(0).toLocaleUpperCase() || '?';
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: square ? size * 0.28 : size / 2,
        backgroundColor: owedAvatar(personKey(name)),
        alignItems: 'center',
        justifyContent: 'center',
        opacity: dim ? 0.45 : 1,
      }}
    >
      <Text style={{ ...body(size * 0.42, 800), color: owedInk.avatarInk }}>{initial}</Text>
    </View>
  );
}

/** The PAID stamp, the close's green, pressed onto a strip. */
export function PaidStamp({ size = 10 }: { readonly size?: number }) {
  const { t } = useI18n();
  return (
    <View
      style={{
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderWidth: 2,
        borderColor: owedInk.stamp,
        borderRadius: 4,
        transform: [{ rotate: '-8deg' }],
      }}
    >
      <Text style={{ ...mono(size, 600, 0.12), color: owedInk.stamp }}>{t('owed.list.paid')}</Text>
    </View>
  );
}

/** One strip someone holds: what it was and when ("LẨU · SAT 3"), and how much. */
export function Slip({
  what,
  amount,
  width = 98,
  big = false,
  stamp,
  work = false,
}: {
  readonly what: string;
  readonly amount: string;
  readonly width?: number;
  readonly big?: boolean;
  /** Drawn on the strip's right: the PAID stamp. */
  readonly stamp?: ReactNode;
  /** A request for work wears the WORK stamp where nothing else is stamped. */
  readonly work?: boolean;
}) {
  const { t } = useI18n();
  const mark =
    stamp ??
    (work ? (
      <WorkStamp
        face="always"
        small
        labels={{ inked: t('work.stamp'), offered: t('work.stampOffered') }}
      />
    ) : undefined);
  return (
    <View style={{ width, boxShadow: `0 4px 8px ${owedInk.slipShadow}` }}>
      <View
        style={{
          backgroundColor: owedInk.paper,
          paddingTop: big ? 10 : 8,
          paddingBottom: big ? 10 : 7,
          paddingHorizontal: big ? 12 : 10,
          gap: 1,
        }}
      >
        <VerticalTear />
        <Text
          numberOfLines={1}
          maxFontSizeMultiplier={1.2}
          adjustsFontSizeToFit
          style={{ ...mono(big ? 9.5 : 9, 400, 0.1), color: owedInk.soft }}
        >
          {what}
        </Text>
        <Text
          numberOfLines={1}
          maxFontSizeMultiplier={1.2}
          adjustsFontSizeToFit
          style={{ ...display(big ? 26 : 20, 500), color: owedInk.ink }}
        >
          {amount}
        </Text>
        {mark ? (
          <View
            style={{
              position: 'absolute',
              right: 6,
              // The WORK stamp sits small by the amount, clear of a job's longer label (7a).
              ...(stamp
                ? { top: big ? 14 : 8 }
                : big
                  ? { bottom: 12 }
                  : { bottom: 8, transform: [{ scale: 0.62 }], transformOrigin: 'right bottom' }),
            }}
          >
            {mark}
          </View>
        ) : null}
      </View>
    </View>
  );
}

/**
 * A payment code drawn module by module, crisp at any size, with no quiet zone of its own (the
 * paper around it is the margin a reader needs).
 */
export function QrCode({
  payload,
  size,
  color = owedInk.qrInk,
}: {
  readonly payload: string;
  readonly size: number;
  readonly color?: string;
}) {
  const path = useMemo(() => {
    const qr = encodeQR(payload);
    const cell = size / qr.size;
    const p = Skia.Path.Make();
    qr.rows.forEach((row, y) =>
      row.forEach((on, x) => {
        if (on) p.addRect(Skia.XYWHRect(x * cell, y * cell, cell + 0.02, cell + 0.02));
      }),
    );
    return p;
  }, [payload, size]);
  return (
    <Canvas style={{ width: size, height: size }} pointerEvents="none">
      <Path path={path} color={color} antiAlias={false} />
    </Canvas>
  );
}
