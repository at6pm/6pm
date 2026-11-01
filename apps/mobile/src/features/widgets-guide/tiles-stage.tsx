import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { useI18n } from '../../i18n/i18n';
import { Symbol } from '../../ui/icons/symbol';
import type { SymbolName } from '../../ui/icons/symbols.generated';
import { body } from '../../ui/type/fonts';
import { Reveal, Touch } from '../capture-guide/walkthrough/moving-parts';
import { stage, type TouchStop } from '../capture-guide/walkthrough/timeline';
import { Stage, stageInk, useLoop } from './stage';

const LOOP = 4800;
/** Reduce Motion holds both tiles in place, just before the tap. */
const STILL = 0.5;
const SIDE = 18;
const GAP = 10;
const TILE_W = (402 - SIDE * 2 - GAP) / 2;
const TILE_H = 72;
const TOP = 92;
const ROW = TOP + TILE_H + GAP;
const HEIGHT = ROW + TILE_H + 40;

/** The finger comes in from below and taps Scan QR. */
const TAPS: readonly TouchStop[] = [
  { at: 0.42, x: SIDE + TILE_W / 2 + 40, y: HEIGHT + 20 },
  { at: 0.6, x: SIDE + TILE_W / 2, y: ROW + TILE_H / 2, tap: true },
];

/**
 * Android's Quick Settings as the shade lays it out: the brightness bar, two system tiles, then
 * 6pm's two tiles (`Tiles.kt`), Scan QR and Quick add, landing in the grid.
 */
export function TilesStage({ width }: { readonly width: number }) {
  const { t } = useI18n();
  const clock = useLoop(LOOP, STILL);
  return (
    <Stage t={clock} width={width} height={HEIGHT}>
      <View style={{ position: 'absolute', inset: 0, backgroundColor: stageInk.ccDim }} />
      <View
        style={{
          position: 'absolute',
          left: SIDE,
          right: SIDE,
          top: 30,
          height: 44,
          borderRadius: 22,
          backgroundColor: stageInk.ccGlass,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: '58%',
            height: '100%',
            borderRadius: 22,
            backgroundColor: stageInk.whiteSoft,
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingRight: 14,
          }}
        >
          <Symbol name="wb_twilight" size={22} color={stageInk.black} />
        </View>
      </View>
      <View style={{ position: 'absolute', left: SIDE, top: TOP, flexDirection: 'row', gap: GAP }}>
        <Tile glyph="wifi" on />
        <Tile glyph="flashlight_on" />
      </View>
      <View style={{ position: 'absolute', left: SIDE, top: ROW, flexDirection: 'row', gap: GAP }}>
        <Reveal t={clock} from={0.1} to={0.28} fromScale={0.6}>
          <Tile
            glyph="qr_code_scanner"
            label={t('surfaces.scanQr')}
            pressed={{ t: clock, at: 0.6 }}
          />
        </Reveal>
        <Reveal t={clock} from={0.2} to={0.38} fromScale={0.6}>
          <Tile glyph="add" label={t('home.quickAdd')} />
        </Reveal>
      </View>
      <Touch t={clock} stops={TAPS} />
    </Stage>
  );
}

/**
 * A tile: a rounded block with its glyph in a round and its name beside it. The system's own
 * tiles draw only their glyph and a blank name line, as the guide names no other feature.
 */
function Tile({
  glyph,
  label,
  on = false,
  pressed,
}: {
  readonly glyph: SymbolName;
  readonly label?: string;
  readonly on?: boolean;
  readonly pressed?: { readonly t: SharedValue<number>; readonly at: number };
}) {
  return (
    <View
      style={{
        width: TILE_W,
        height: TILE_H,
        borderRadius: 26,
        backgroundColor: on ? stageInk.whiteSoft : stageInk.ccGlass,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 14,
      }}
    >
      <Symbol name={glyph} size={26} color={on ? stageInk.black : stageInk.white} />
      {label ? (
        <Text numberOfLines={1} style={{ ...body(15, 600), color: stageInk.white, flexShrink: 1 }}>
          {label}
        </Text>
      ) : (
        <View
          style={{
            width: 64,
            height: 8,
            borderRadius: 4,
            backgroundColor: on ? 'rgba(0,0,0,0.25)' : stageInk.appLabel,
          }}
        />
      )}
      {pressed ? <Lit t={pressed.t} at={pressed.at} glyph={glyph} label={label ?? ''} /> : null}
    </View>
  );
}

/** The tile lit under the finger from `at`, as Quick Settings answers a tap. */
function Lit({
  t,
  at,
  glyph,
  label,
}: {
  readonly t: SharedValue<number>;
  readonly at: number;
  readonly glyph: SymbolName;
  readonly label: string;
}) {
  const style = useAnimatedStyle(() => {
    const on = stage(t.get(), at - 0.02, at + 0.02);
    return { opacity: on, transform: [{ scale: 1 + 0.04 * on }] };
  });
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          inset: 0,
          borderRadius: 26,
          backgroundColor: stageInk.white,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 14,
        },
        style,
      ]}
    >
      <Symbol name={glyph} size={26} color={stageInk.black} />
      <Text numberOfLines={1} style={{ ...body(15, 600), color: stageInk.black, flexShrink: 1 }}>
        {label}
      </Text>
    </Animated.View>
  );
}
