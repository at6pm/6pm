import { File, Paths } from 'expo-file-system';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { shareInksFor } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { SheetFrame } from '../../ui/navigation/sheet-frame';
import { PressScale } from '../../ui/primitives/press-scale';
import { Switch } from '../../ui/primitives/switch';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';
import { SheetHeader } from '../plan/pot-rows';
import { AMOUNTS_SETTLE_MS } from './cards/card-parts';
import type { ShareCardDefinition } from './cards/card-definition';
import { CARD_WIDTH, cardHeight, cardPixels, type CardFormat } from './cards/card-size';
import { cardRegistry, isCardId } from './cards/registry';
import { atPixels, captureView, encodePng } from './capture-view';
import { shareFileName } from './share-file';
import { useShareImage } from './use-share-image';

/** The preview is the card at 230 pt wide, as the canvas's preview sheet draws it. */
const PREVIEW_WIDTH = 230;
const SCALE = PREVIEW_WIDTH / CARD_WIDTH;
/** Story and Post resize the preview on the entrance curve, 450 ms; the two layouts cross-fade. */
const RESIZE = {
  duration: 450,
  easing: Easing.bezier(0.2, 0.9, 0.2, 1),
  reduceMotion: ReduceMotion.System,
};
const FORMATS: readonly CardFormat[] = ['story', 'feed'];

/**
 * A card's preview before it is shared: the card in the person's look, Story or Post, and the
 * Show amounts switch, off every time the sheet opens. Share image draws the 1080 px image on the
 * phone and opens the system share sheet.
 */
export function ShareCardSheet() {
  const params = useLocalSearchParams<{
    card?: string;
    of?: string;
    format?: string;
    amounts?: string;
    dump?: string;
  }>();
  if (!isCardId(params.card)) return null;
  // A developer build can open the sheet set up and write the image to Documents (design checks).
  const dev: DevSetup | null = __DEV__
    ? {
        format: params.format === 'feed' ? 'feed' : 'story',
        amounts: params.amounts === '1',
        dump: params.dump && /^[\w.-]+\.png$/.test(params.dump) ? params.dump : null,
      }
    : null;
  return <CardSheet def={cardRegistry[params.card]} of={params.of} dev={dev} />;
}

interface DevSetup {
  readonly format: CardFormat;
  readonly amounts: boolean;
  readonly dump: string | null;
}

function CardSheet({
  def,
  of,
  dev,
}: {
  readonly def: ShareCardDefinition<unknown>;
  readonly of: string | undefined;
  readonly dev: DevSetup | null;
}) {
  const { palette, look, serious } = useTheme();
  const { t } = useI18n();
  const data = def.useData(of);
  const [format, setFormat] = useState<CardFormat>(dev?.format ?? 'story');
  const [leaving, setLeaving] = useState<CardFormat | null>(null);
  const [amounts, setAmounts] = useState(dev?.amounts ?? false);
  const settledAt = useRef(0);
  const card = useRef<ComponentRef<typeof View>>(null);
  const { share } = useShareImage();
  const inks = shareInksFor({ look, serious, dark: palette.dark });

  const height = useSharedValue(cardHeight(dev?.format ?? 'story') * SCALE);
  const fade = useSharedValue(1);
  const frame = useAnimatedStyle(() => ({ height: height.get() }));
  const incoming = useAnimatedStyle(() => ({ opacity: fade.get() }));
  const outgoing = useAnimatedStyle(() => ({ opacity: 1 - fade.get() }));

  useEffect(() => {
    if (leaving === null) return undefined;
    const timer = setTimeout(() => setLeaving(null), RESIZE.duration);
    return () => clearTimeout(timer);
  }, [leaving]);

  const dump = dev?.dump ?? null;
  const ready = data !== null;
  useEffect(() => {
    if (!dump || !ready) return undefined;
    const timer = setTimeout(() => {
      const size = cardPixels(format);
      void captureView(card).then((image) =>
        new File(Paths.document, dump).write(encodePng(atPixels(image, size.width, size.height))),
      );
    }, 1500);
    return () => clearTimeout(timer);
  }, [dump, ready, format]);

  const pickFormat = (next: CardFormat) => {
    if (next === format) return;
    haptics.tick();
    setLeaving(format);
    setFormat(next);
    settledAt.current = Date.now() + RESIZE.duration;
    fade.set(0);
    fade.set(withTiming(1, RESIZE));
    height.set(withTiming(cardHeight(next) * SCALE, RESIZE));
  };

  // The switch gives its own tick.
  const toggleAmounts = (on: boolean) => {
    setAmounts(on);
    settledAt.current = Date.now() + AMOUNTS_SETTLE_MS;
  };

  const shareCard = () => {
    if (!data) return;
    const size = cardPixels(format);
    void share(shareFileName('card', `${def.path}-${def.fileKey(data)}`), async () => {
      // The image is the card at rest: a tap while the ink peels or the format changes waits.
      const wait = settledAt.current - Date.now();
      if (wait > 0) await new Promise((done) => setTimeout(done, wait));
      return atPixels(await captureView(card), size.width, size.height);
    });
  };

  const layer = (shown: CardFormat, capture: boolean) =>
    data ? (
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: CARD_WIDTH,
          height: cardHeight(shown),
          transform: [{ scale: SCALE }],
          transformOrigin: 'left top',
        }}
      >
        <View ref={capture ? card : undefined} collapsable={false}>
          <def.Layout data={data} format={shown} amounts={amounts} inks={inks} serious={serious} />
        </View>
      </View>
    ) : null;

  return (
    <SheetFrame header={<SheetHeader title={t('shareCards.sheetTitle')} />}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 4,
          paddingHorizontal: 16,
          paddingBottom: 34,
          alignItems: 'center',
          gap: 14,
        }}
      >
        <Animated.View
          style={[
            {
              width: PREVIEW_WIDTH,
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,.4)',
              backgroundColor: palette.cell,
            },
            frame,
          ]}
        >
          {data ? (
            <Animated.View entering={FadeIn.duration(200)} style={{ flex: 1 }}>
              {leaving ? (
                <Animated.View style={[{ position: 'absolute', inset: 0 }, outgoing]}>
                  {layer(leaving, false)}
                </Animated.View>
              ) : null}
              <Animated.View style={[{ position: 'absolute', inset: 0 }, incoming]}>
                {layer(format, true)}
              </Animated.View>
            </Animated.View>
          ) : null}
        </Animated.View>

        <View
          style={{
            alignSelf: 'stretch',
            flexDirection: 'row',
            padding: 3,
            borderRadius: 13,
            backgroundColor: palette.chipBg,
          }}
        >
          {FORMATS.map((f) => (
            <PressScale
              key={f}
              accessibilityRole="button"
              accessibilityState={{ selected: f === format }}
              scaleTo={0.97}
              onPress={() => pickFormat(f)}
              style={{
                flex: 1,
                height: 34,
                borderRadius: 10,
                backgroundColor: f === format ? palette.tabActive : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ ...body(13, 600), color: palette.ink }}>
                {t(f === 'story' ? 'shareCards.story' : 'shareCards.post')}
              </Text>
            </PressScale>
          ))}
        </View>

        {data && def.hasAmounts(data) ? (
          <View
            style={{
              alignSelf: 'stretch',
              borderRadius: 22,
              backgroundColor: palette.cell,
              paddingVertical: 12,
              paddingHorizontal: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ ...body(16), color: palette.ink }}>{t('shareCards.showAmounts')}</Text>
              <Text style={{ ...body(12.5), color: palette.inkSoft }}>
                {t(amounts ? 'shareCards.shownSub' : 'shareCards.hiddenSub')}
              </Text>
            </View>
            <Switch
              value={amounts}
              onChange={toggleAmounts}
              accessibilityLabel={t('shareCards.showAmounts')}
            />
          </View>
        ) : null}

        <PressScale
          accessibilityRole="button"
          scaleTo={0.97}
          disabled={!data}
          onPress={shareCard}
          style={{
            alignSelf: 'stretch',
            marginTop: 4,
            height: 56,
            borderRadius: 99,
            backgroundColor: palette.btnBg,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Symbol name="ios_share" size={20} color={palette.btnFg} />
          <Text style={{ ...body(17, 650), color: palette.btnFg }}>
            {t('shareCards.shareImage')}
          </Text>
        </PressScale>
      </ScrollView>
    </SheetFrame>
  );
}
