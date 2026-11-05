import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { Text, View } from 'react-native';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import { activityInk } from '@6pm/theme';

import { localeOf } from '@6pm/i18n';

import { useI18n } from '../../i18n/i18n';
import { Symbol } from '../../ui/icons/symbol';
import { FitText } from '../../ui/type/fit-text';
import { body } from '../../ui/type/fonts';
import { Reveal } from '../capture-guide/walkthrough/moving-parts';
import { stage } from '../capture-guide/walkthrough/timeline';
import type { WidgetPreview } from './preview-data';
import { Stage, stageInk, useLoop } from './stage';

const HEIGHT = 330;
const LOOP = 5200;
/** The settled picture Reduce Motion holds: both widgets in, the ring filled. */
const STILL = 0.8;
const RING = 76;
const STROKE = 5;

/** The top of the Lock Screen: the date, the clock, and 6pm's ring and card under it. */
export function LockStage({
  preview,
  width,
}: {
  readonly preview: WidgetPreview;
  readonly width: number;
}) {
  const { t, language } = useI18n();
  const clock = useLoop(LOOP, STILL);
  return (
    <Stage t={clock} width={width} height={HEIGHT}>
      <View style={{ alignItems: 'center', paddingTop: 58 }}>
        <Text style={{ ...body(20, 600), color: stageInk.whiteSoft }}>
          {new Date().toLocaleDateString(localeOf(language), {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </Text>
        <Text style={{ ...body(104, 700, -0.02), color: stageInk.white, lineHeight: 118 }}>
          9:41
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          <Reveal
            t={clock}
            from={0.12}
            to={0.32}
            fromScale={0.7}
            style={{ alignItems: 'center', gap: 8 }}
          >
            <Ring t={clock} preview={preview} />
            <Text style={{ ...body(12, 600), color: stageInk.whiteSoft }}>
              {t('widgetsGuide.lock.ring')}
            </Text>
          </Reveal>
          <Reveal
            t={clock}
            from={0.24}
            to={0.44}
            fromScale={0.85}
            dx={-12}
            style={{ alignItems: 'center', gap: 8 }}
          >
            <Card preview={preview} />
            <Text style={{ ...body(12, 600), color: stageInk.whiteSoft }}>
              {t('widgetsGuide.lock.card')}
            </Text>
          </Reveal>
          <Reveal
            t={clock}
            from={0.36}
            to={0.56}
            fromScale={0.7}
            style={{ alignItems: 'center', gap: 8 }}
          >
            <JarCircle preview={preview} />
            <Text style={{ ...body(12, 600), color: stageInk.whiteSoft }}>
              {t('widgetsGuide.lock.jar')}
            </Text>
          </Reveal>
        </View>
      </View>
    </Stage>
  );
}

const circle = (() => {
  const path = Skia.Path.Make();
  const r = (RING - STROKE) / 2;
  // From twelve o'clock, clockwise, as the SwiftUI ring trims.
  path.addArc({ x: STROKE / 2, y: STROKE / 2, width: r * 2, height: r * 2 }, -90, 359.999);
  return path;
})();

/** The ring: what is left of today's line, "245k" over "left", filling as it lands. */
function Ring({
  t,
  preview,
}: {
  readonly t: SharedValue<number>;
  readonly preview: WidgetPreview;
}) {
  const fraction = preview.entry?.ringFraction ?? 0;
  const end = useDerivedValue(() => fraction * stage(t.get(), 0.3, 0.62));
  return (
    <View
      style={{
        width: RING,
        height: RING,
        borderRadius: RING / 2,
        backgroundColor: stageInk.ccGlass,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Canvas style={{ position: 'absolute', inset: 0 }}>
        <Path path={circle} style="stroke" strokeWidth={STROKE} color={activityInk.ringTrack} />
        <Path
          path={circle}
          style="stroke"
          strokeWidth={STROKE}
          color={activityInk.ink}
          start={0}
          end={end}
        />
      </Canvas>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
        style={{ ...body(17, 700, -0.02), color: activityInk.ink, maxWidth: RING - 14 }}
      >
        {preview.hideAmounts
          ? (preview.strings['hidden'] ?? '')
          : (preview.entry?.safeShort ?? '–')}
      </Text>
    </View>
  );
}

/** The card: "6PM", the number in a line, and when the close is. */
function Card({ preview }: { readonly preview: WidgetPreview }) {
  const card = preview.card;
  const soft = { color: activityInk.ink, opacity: 0.85 };
  return (
    <View
      style={{
        width: 160,
        height: RING,
        borderRadius: 20,
        backgroundColor: stageInk.ccGlass,
        paddingHorizontal: 12,
        paddingVertical: 10,
        justifyContent: 'space-between',
      }}
    >
      {card ? (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Symbol name="wb_twilight" size={14} color={activityInk.ink} />
            <Text style={{ ...body(12, 700), ...soft }}>
              {(preview.strings['brand'] ?? '').toUpperCase()}
            </Text>
          </View>
          <FitText style={{ ...body(20, 700), color: activityInk.ink }}>
            {preview.hideAmounts ? (preview.strings['hidden'] ?? '') : card.amount}
          </FitText>
          <Text numberOfLines={1} style={{ ...body(12, 600), ...soft }}>
            {card.lockSub}
          </Text>
        </>
      ) : (
        <Text style={{ ...body(12, 600), color: activityInk.ink }}>{preview.strings['setUp']}</Text>
      )}
    </View>
  );
}

/** A jar on the Lock Screen: its outline filled to its level over its short name. */
function JarCircle({ preview }: { readonly preview: WidgetPreview }) {
  const jar =
    preview.jars.find((j) => j.newYear) ?? preview.jars.find((j) => j.dayText) ?? preview.jars[0];
  const ink = activityInk.ink;
  return (
    <View
      style={{
        width: RING,
        height: RING,
        borderRadius: RING / 2,
        backgroundColor: stageInk.ccGlass,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {jar ? (
        <>
          <View style={{ width: 26, height: 34, marginTop: -10 }}>
            <View
              style={{
                position: 'absolute',
                top: 3,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 8,
                borderWidth: 2,
                borderColor: ink,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: `${Math.round(jar.level * 100)}%`,
                  backgroundColor: ink,
                }}
              />
            </View>
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 7,
                right: 7,
                height: 4,
                borderRadius: 2,
                backgroundColor: ink,
              }}
            />
          </View>
          <Text
            numberOfLines={1}
            style={{
              ...body(9.5, 800),
              color: ink,
              position: 'absolute',
              bottom: 9,
              maxWidth: RING - 20,
            }}
          >
            {jar.label}
          </Text>
        </>
      ) : null}
    </View>
  );
}
