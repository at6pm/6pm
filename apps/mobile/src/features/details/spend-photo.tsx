import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Image, Text, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import type { SpendRow } from '@6pm/domain';
import { curves, durations, photoInk } from '@6pm/theme';

import { photoUri } from '../../data/device-photo-files';
import { useMoneyActions } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PhotoClip } from '../../ui/photo/photo-clip';
import { ActionMenu } from '../../ui/primitives/action-menu';
import { PressScale } from '../../ui/primitives/press-scale';
import { useToast } from '../../ui/toast/toast-host';
import { mono } from '../../ui/type/fonts';
import { useOfferUndo } from '../../ui/undo/undo-host';
import { PhotoViewer, type PrintFrame } from './photo-viewer';
import {
  CameraOff,
  openCameraSettings,
  photoActions,
  photoInto,
  type PhotoSource,
} from './photo-sources';

/** The print as Details shows it: the design's 92 × 135, a little smaller beside the centred name. */
export const PRINT_WIDTH = 76;
export const PRINT_HEIGHT = 112;
const TURN = 5;
/** KEPT ON THIS PHONE on two lines, wider than the print it is stamped across. */
const STAMP_WIDTH = 104;

const drop = {
  duration: durations.photoDrop,
  easing: Easing.bezier(...curves.photoClip),
  reduceMotion: ReduceMotion.System,
};
const stampEase = Easing.bezier(...curves.jarCheck);

/**
 * The spend's photo, paper-clipped to the top right of Details. Tapped, it opens full screen.
 * With none, an empty slot waits under the clip and offers the camera or Photos; a photo added
 * drops under the clip and is stamped KEPT ON THIS PHONE.
 */
export function SpendPhoto({
  spend,
  title,
  subtitle,
}: {
  readonly spend: SpendRow;
  /** "Circle K · 120.000₫", over the full view. */
  readonly title: string;
  /** "Today · 16:40" */
  readonly subtitle: string;
}) {
  const { t } = useI18n();
  const actions = useMoneyActions();
  const offerUndo = useOfferUndo();
  const toast = useToast();
  const print = useRef<ComponentRef<typeof Animated.View>>(null);
  const [viewing, setViewing] = useState<PrintFrame | null>(null);
  const [stamped, setStamped] = useState(false);
  const uri = spend.photo ? photoUri(spend.photo) : null;
  const menu = photoActions({ camera: t('photo.take'), photos: t('photo.choose') });

  // A photo that arrives while Details is open drops under the clip; one already there just is.
  const landed = useSharedValue(uri !== null ? 1 : 0);
  const stamp = useSharedValue(0);
  const shown = useRef(uri);
  useEffect(() => {
    if (uri === shown.current) return;
    const added = uri !== null;
    shown.current = uri;
    if (!added) {
      landed.set(0);
      stamp.set(0);
      setStamped(false);
      return;
    }
    landed.set(0);
    landed.set(withTiming(1, drop));
    setStamped(true);
    stamp.set(0);
    stamp.set(
      withDelay(
        durations.photoStampDelay,
        withTiming(1, {
          duration: durations.stamp,
          easing: stampEase,
          reduceMotion: ReduceMotion.System,
        }),
      ),
    );
    const felt = setTimeout(() => haptics.success(), durations.photoStampDelay);
    return () => clearTimeout(felt);
  }, [uri, landed, stamp]);

  const add = (key: string) => {
    const source: PhotoSource = key === 'camera' ? 'camera' : 'photos';
    actions
      .attachPhoto(spend.id, (to) => photoInto(source, to))
      .catch((error: unknown) => {
        if (error instanceof CameraOff) {
          toast(t('photo.cameraOff'));
          openCameraSettings();
        } else {
          toast(t('photo.failed'));
        }
      });
  };

  const openViewer = () => {
    haptics.tap();
    print.current?.measureInWindow((x, y, width, height) =>
      setViewing({ x, y, width, height, rotate: TURN }),
    );
  };

  const removed = () => {
    setViewing(null);
    void actions.removePhoto(spend.id).then((row) => {
      if (!row) return;
      offerUndo(t('photo.removed'), t('undo.action'), () => {
        void actions.restorePhoto(spend.id);
      });
    });
  };

  const printStyle = useAnimatedStyle(() => {
    const p = landed.get();
    return {
      opacity: Math.min(1, p * 1.6),
      transform: [{ translateY: (1 - p) * -90 }, { rotate: `${TURN + (1 - p) * -13}deg` }],
    };
  });
  const stampStyle = useAnimatedStyle(() => {
    // 2.4 → under 1 → 1 on the overshooting curve, turning from -16° to -8°, as stamps land.
    const s = stamp.get();
    return {
      opacity: Math.min(0.92, s * 2),
      transform: [{ rotate: `${-16 + s * 8}deg` }, { scale: 2.4 - s * 1.4 }],
    };
  });

  return (
    <View
      style={{ position: 'absolute', top: 16, right: 6, width: PRINT_WIDTH, height: PRINT_HEIGHT }}
    >
      {uri === null ? (
        <ActionMenu actions={menu} onAction={add} label={t('photo.add')}>
          <View
            style={{
              width: PRINT_WIDTH,
              height: PRINT_HEIGHT,
              borderRadius: 6,
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: photoInk.slotEdge,
              backgroundColor: photoInk.slotFill,
              transform: [{ rotate: `${TURN}deg` }],
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <Symbol name="add_a_photo" size={22} color={photoInk.slotInk} />
            <Text style={{ ...mono(9, 500, 0.12), color: photoInk.slotInk }}>
              {t('photo.slot')}
            </Text>
          </View>
        </ActionMenu>
      ) : (
        <Animated.View
          ref={print}
          collapsable={false}
          style={[{ opacity: viewing ? 0 : 1 }, printStyle]}
        >
          <PressScale
            accessibilityRole="imagebutton"
            accessibilityLabel={t('photo.open')}
            scaleTo={0.96}
            onPress={openViewer}
            style={{
              width: PRINT_WIDTH,
              height: PRINT_HEIGHT,
              borderRadius: 2,
              borderWidth: 4,
              borderColor: photoInk.frame,
              backgroundColor: photoInk.frame,
              boxShadow: photoInk.printShadow,
              overflow: 'hidden',
            }}
          >
            <Image source={{ uri }} resizeMode="cover" style={{ flex: 1 }} />
          </PressScale>
          {stamped ? (
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: 'absolute',
                  left: (PRINT_WIDTH - STAMP_WIDTH) / 2,
                  bottom: 10,
                  width: STAMP_WIDTH,
                  paddingVertical: 3,
                  paddingHorizontal: 6,
                  borderWidth: 2,
                  borderColor: photoInk.stamp,
                  borderRadius: 5,
                  backgroundColor: photoInk.stampPaper,
                },
                stampStyle,
              ]}
            >
              <Text
                style={{
                  ...mono(8.5, 600, 0.12),
                  lineHeight: 10.5,
                  color: photoInk.stamp,
                  textAlign: 'center',
                }}
              >
                {t('photo.stamp.top')}
                {'\n'}
                {t('photo.stamp.bottom')}
              </Text>
            </Animated.View>
          ) : null}
        </Animated.View>
      )}
      {viewing ? null : (
        <PhotoClip size={34} rotate={8} style={{ position: 'absolute', left: 28, top: -17 }} />
      )}
      {viewing && uri ? (
        <PhotoViewer
          uri={uri}
          from={viewing}
          title={title}
          subtitle={subtitle}
          replaceActions={menu}
          onReplace={add}
          onRemove={removed}
          onClosed={() => setViewing(null)}
        />
      ) : null}
    </View>
  );
}
