import { Text, View } from 'react-native';

import type { StringKey } from '@6pm/i18n';
import { importInk } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { Symbol } from '../../ui/icons/symbol';
import type { SymbolName } from '../../ui/icons/symbols.generated';
import { TapPulse } from './import-parts';

/**
 * Each app's export path, drawn in its own colours as a small phone screen per step: drawn, not
 * screenshots, so they survive the apps' redesigns. One orange tap per sketch shows where to press.
 */

export type GuideApp = 'moneyLover' | 'misa' | 'momo';
export const GUIDE_APPS: readonly GuideApp[] = ['moneyLover', 'misa', 'momo'];

/** The words a sketch prints: the other apps' own screens, and the guide's step captions. */
type SketchKey = Exclude<
  Extract<StringKey, `import.sketch.${string}` | `import.guide.${string}`>,
  'import.guide.step'
>;

type Block =
  | {
      readonly kind: 'head';
      readonly text: SketchKey;
      readonly icon?: SymbolName;
      readonly tap?: boolean;
    }
  | { readonly kind: 'label'; readonly text: SketchKey }
  | {
      readonly kind: 'row';
      readonly icon: SymbolName;
      readonly text: SketchKey;
      readonly value?: SketchKey;
      readonly tap?: boolean;
    }
  | {
      readonly kind: 'grid';
      readonly items: readonly (readonly [SymbolName, SketchKey, boolean?])[];
    }
  | { readonly kind: 'fill' }
  | {
      readonly kind: 'buttons';
      readonly items: readonly (readonly [SketchKey, 'acc' | 'excel' | 'pdf', boolean?])[];
    }
  | { readonly kind: 'tabs'; readonly on: number };

interface Sketch {
  readonly caption: SketchKey;
  readonly blocks: readonly Block[];
  readonly sheet?: {
    readonly title: SketchKey;
    readonly rows: readonly Extract<Block, { kind: 'row' }>[];
  };
}

const MOMO_LIST = (tap: boolean): readonly Block[] => [
  { kind: 'head', text: 'import.sketch.momo.history', icon: 'grid_view', tap },
  {
    kind: 'row',
    icon: 'payments',
    text: 'import.sketch.momo.total',
    value: 'import.sketch.momo.totalValue',
  },
  { kind: 'label', text: 'import.sketch.momo.month' },
  {
    kind: 'row',
    icon: 'movie',
    text: 'import.sketch.momo.cinema',
    value: 'import.sketch.momo.cinemaValue',
  },
  {
    kind: 'row',
    icon: 'local_taxi',
    text: 'import.sketch.momo.grab',
    value: 'import.sketch.momo.grabValue',
  },
  {
    kind: 'row',
    icon: 'two_wheeler',
    text: 'import.sketch.momo.green',
    value: 'import.sketch.momo.greenValue',
  },
  {
    kind: 'row',
    icon: 'local_cafe',
    text: 'import.sketch.momo.coffee',
    value: 'import.sketch.momo.coffeeValue',
  },
  { kind: 'fill' },
];

export const SKETCHES: Readonly<Record<GuideApp, readonly Sketch[]>> = {
  moneyLover: [
    {
      caption: 'import.guide.ml.1',
      blocks: [
        { kind: 'head', text: 'import.sketch.ml.account' },
        { kind: 'row', icon: 'request_quote', text: 'import.sketch.ml.debts' },
        { kind: 'row', icon: 'construction', text: 'import.sketch.ml.tools' },
        { kind: 'row', icon: 'flight', text: 'import.sketch.ml.travel' },
        { kind: 'row', icon: 'table_view', text: 'import.sketch.ml.export', tap: true },
        { kind: 'fill' },
        { kind: 'tabs', on: 3 },
      ],
    },
    {
      caption: 'import.guide.ml.2',
      blocks: [
        { kind: 'head', text: 'import.sketch.ml.export' },
        { kind: 'label', text: 'import.sketch.ml.wallet' },
        { kind: 'row', icon: 'credit_card', text: 'import.sketch.ml.allWallets' },
        { kind: 'label', text: 'import.sketch.ml.category' },
        { kind: 'row', icon: 'public', text: 'import.sketch.ml.all' },
        { kind: 'label', text: 'import.sketch.ml.range' },
        { kind: 'row', icon: 'date_range', text: 'import.sketch.ml.allTime', tap: true },
        { kind: 'fill' },
        { kind: 'buttons', items: [['import.sketch.ml.button', 'acc']] },
      ],
    },
    {
      caption: 'import.guide.ml.3',
      blocks: [
        { kind: 'head', text: 'import.sketch.ml.export' },
        { kind: 'row', icon: 'credit_card', text: 'import.sketch.ml.allWallets' },
        { kind: 'row', icon: 'public', text: 'import.sketch.ml.all' },
        { kind: 'row', icon: 'date_range', text: 'import.sketch.ml.allTime' },
        { kind: 'row', icon: 'mail', text: 'import.sketch.ml.google' },
        { kind: 'fill' },
        { kind: 'buttons', items: [['import.sketch.ml.button', 'acc', true]] },
      ],
    },
  ],
  misa: [
    {
      caption: 'import.guide.misa.1',
      blocks: [
        { kind: 'head', text: 'import.sketch.misa.features', icon: 'search' },
        { kind: 'label', text: 'import.sketch.misa.utilities' },
        {
          kind: 'grid',
          items: [
            ['group', 'import.sketch.misa.fund'],
            ['percent', 'import.sketch.misa.split'],
            ['luggage', 'import.sketch.misa.trip'],
            ['shopping_bag', 'import.sketch.misa.shopping'],
            ['upload_file', 'import.sketch.misa.export', true],
          ],
        },
        { kind: 'label', text: 'import.sketch.misa.planning' },
        {
          kind: 'grid',
          items: [
            ['savings', 'import.sketch.misa.budget'],
            ['request_quote', 'import.sketch.misa.plan'],
            ['category', 'import.sketch.misa.categories'],
          ],
        },
        { kind: 'fill' },
      ],
    },
    {
      caption: 'import.guide.misa.2',
      blocks: [
        { kind: 'head', text: 'import.sketch.misa.export' },
        { kind: 'row', icon: 'calendar_month', text: 'import.sketch.misa.thisMonth', tap: true },
        { kind: 'row', icon: 'account_balance_wallet', text: 'import.sketch.misa.accounts' },
        { kind: 'fill' },
        {
          kind: 'buttons',
          items: [
            ['import.sketch.misa.excel', 'excel'],
            ['import.sketch.misa.pdf', 'pdf'],
          ],
        },
      ],
    },
    {
      caption: 'import.guide.misa.3',
      blocks: [
        { kind: 'head', text: 'import.sketch.misa.export' },
        { kind: 'row', icon: 'calendar_month', text: 'import.sketch.misa.allTime' },
        { kind: 'row', icon: 'account_balance_wallet', text: 'import.sketch.misa.accounts' },
        { kind: 'fill' },
        {
          kind: 'buttons',
          items: [
            ['import.sketch.misa.excel', 'excel', true],
            ['import.sketch.misa.pdf', 'pdf'],
          ],
        },
      ],
    },
  ],
  momo: [
    { caption: 'import.guide.momo.1', blocks: MOMO_LIST(true) },
    {
      caption: 'import.guide.momo.2',
      blocks: MOMO_LIST(false),
      sheet: {
        title: 'import.sketch.momo.tools',
        rows: [
          { kind: 'row', icon: 'visibility', text: 'import.sketch.momo.hide' },
          { kind: 'row', icon: 'visibility_off', text: 'import.sketch.momo.hidden' },
          { kind: 'row', icon: 'download', text: 'import.sketch.momo.download', tap: true },
          { kind: 'row', icon: 'support_agent', text: 'import.sketch.momo.ai' },
        ],
      },
    },
    {
      caption: 'import.guide.momo.3',
      blocks: [
        { kind: 'head', text: 'import.sketch.momo.download' },
        { kind: 'label', text: 'import.sketch.momo.time' },
        { kind: 'row', icon: 'date_range', text: 'import.sketch.momo.range' },
        { kind: 'label', text: 'import.sketch.momo.format' },
        { kind: 'row', icon: 'description', text: 'import.sketch.momo.xlsx' },
        { kind: 'fill' },
        { kind: 'buttons', items: [['import.sketch.momo.button', 'acc', true]] },
      ],
    },
  ],
};

const TAB_ICONS: readonly SymbolName[] = [
  'home',
  'account_balance_wallet',
  'donut_small',
  'person',
];
const RING = { borderWidth: 1.5, borderColor: importInk.tap } as const;

function Row({
  block,
  app,
}: {
  readonly block: Extract<Block, { kind: 'row' }>;
  readonly app: GuideApp;
}) {
  const { t } = useI18n();
  const th = importInk.apps[app];
  return (
    <View
      style={{
        minHeight: 20,
        borderRadius: 6,
        backgroundColor: block.tap ? importInk.tapCard : th.card,
        ...(block.tap ? RING : {}),
        paddingVertical: 4,
        paddingHorizontal: 5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <Symbol name={block.icon} size={10} color={th.acc} />
      <Text numberOfLines={1} style={{ flex: 1, fontSize: 7.5, fontWeight: '500', color: th.ink }}>
        {t(block.text)}
      </Text>
      {block.value ? (
        <Text style={{ fontSize: 7, fontWeight: '700', color: th.ink }}>{t(block.value)}</Text>
      ) : null}
      {block.tap ? (
        <View style={{ position: 'absolute', right: 4, top: 4 }}>
          <TapPulse size={12} />
        </View>
      ) : null}
    </View>
  );
}

/** One app screen of the guide, 140 × 245 pt in the design's phone outline. */
export function SketchPhone({ app, sketch }: { readonly app: GuideApp; readonly sketch: Sketch }) {
  const { t } = useI18n();
  const th = importInk.apps[app];
  return (
    <View
      style={{
        width: 140,
        height: 245,
        borderRadius: 20,
        backgroundColor: th.bg,
        borderWidth: 2,
        borderColor: importInk.frame,
        overflow: 'hidden',
        paddingTop: 20,
        paddingHorizontal: 6,
        paddingBottom: 6,
        gap: 4,
      }}
    >
      <View
        style={{
          position: 'absolute',
          left: 55,
          top: 5,
          width: 26,
          height: 6,
          borderRadius: 4,
          backgroundColor: importInk.notch,
        }}
      />
      {sketch.blocks.map((block, i) => {
        switch (block.kind) {
          case 'head':
            return (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  minHeight: 20,
                  paddingHorizontal: 2,
                }}
              >
                <Text style={{ flex: 1, fontSize: 8.5, fontWeight: '700', color: th.ink }}>
                  {t(block.text)}
                </Text>
                {block.icon ? (
                  <View
                    style={{
                      width: 17,
                      height: 17,
                      borderRadius: 9,
                      backgroundColor: block.tap ? importInk.tapCard : th.card,
                      ...(block.tap ? RING : {}),
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Symbol name={block.icon} size={11} color={th.ink} />
                    {block.tap ? (
                      <View style={{ position: 'absolute' }}>
                        <TapPulse size={14} />
                      </View>
                    ) : null}
                  </View>
                ) : null}
              </View>
            );
          case 'label':
            return (
              <Text
                key={i}
                style={{
                  fontSize: 6.5,
                  fontWeight: '600',
                  letterSpacing: 0.26,
                  textTransform: 'uppercase',
                  color: th.sub,
                  paddingTop: 2,
                  paddingHorizontal: 3,
                }}
              >
                {t(block.text)}
              </Text>
            );
          case 'row':
            return <Row key={i} block={block} app={app} />;
          case 'grid':
            return (
              <View
                key={i}
                style={{
                  borderRadius: 7,
                  backgroundColor: th.card,
                  paddingVertical: 5,
                  paddingHorizontal: 3,
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  rowGap: 4,
                }}
              >
                {block.items.map(([icon, text, tap], k) => (
                  <View key={k} style={{ width: '33.33%', paddingHorizontal: 1 }}>
                    <View
                      style={{
                        alignItems: 'center',
                        gap: 2,
                        paddingVertical: 3,
                        borderRadius: 5,
                        backgroundColor: tap ? importInk.tapCard : 'transparent',
                        ...(tap ? RING : {}),
                      }}
                    >
                      <Symbol name={icon} size={13} color={th.acc} />
                      <Text
                        numberOfLines={2}
                        style={{ fontSize: 6, lineHeight: 6.6, textAlign: 'center', color: th.ink }}
                      >
                        {t(text)}
                      </Text>
                      {tap ? (
                        <View style={{ position: 'absolute', right: 2, top: 2 }}>
                          <TapPulse size={10} />
                        </View>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            );
          case 'fill':
            return <View key={i} style={{ flex: 1 }} />;
          case 'buttons':
            return (
              <View key={i} style={{ flexDirection: 'row', gap: 3 }}>
                {block.items.map(([text, colour, tap], k) => (
                  <View
                    key={k}
                    style={{
                      flex: 1,
                      height: 20,
                      borderRadius: 6,
                      backgroundColor: colour === 'acc' ? th.acc : importInk[colour],
                      boxShadow: tap ? `0 0 0 2px ${importInk.tap}` : undefined,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 7.5, fontWeight: '700', color: th.card }}>
                      {t(text)}
                    </Text>
                    {tap ? (
                      <View style={{ position: 'absolute', right: 4, top: 4 }}>
                        <TapPulse size={12} />
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            );
          case 'tabs':
            return (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: th.card,
                }}
              >
                {TAB_ICONS.map((icon, k) => (
                  <Symbol
                    key={icon}
                    name={icon}
                    size={11}
                    color={k === block.on ? th.acc : th.sub}
                  />
                ))}
              </View>
            );
        }
      })}
      {sketch.sheet ? (
        <>
          <View style={{ position: 'absolute', inset: 0, backgroundColor: importInk.scrim }} />
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              backgroundColor: th.bg,
              paddingTop: 5,
              paddingHorizontal: 6,
              paddingBottom: 10,
              gap: 4,
            }}
          >
            <View
              style={{
                alignSelf: 'center',
                width: 18,
                height: 2.5,
                borderRadius: 2,
                backgroundColor: importInk.grabber,
              }}
            />
            <Text
              style={{
                fontSize: 8.5,
                fontWeight: '700',
                textAlign: 'center',
                paddingVertical: 2,
                color: th.ink,
              }}
            >
              {t(sketch.sheet.title)}
            </Text>
            {sketch.sheet.rows.map((row, k) => (
              <Row key={k} block={row} app={app} />
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}
