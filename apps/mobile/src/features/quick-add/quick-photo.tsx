import { useEffect, useRef } from 'react';
import { Image, Text, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { curves, durations, photoInk } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PhotoClip } from '../../ui/photo/photo-clip';
import { ActionMenu } from '../../ui/primitives/action-menu';
import { mono } from '../../ui/type/fonts';
import { photoActions } from '../details/photo-sources';

/** How much of the ticket's right side the clip and its photo take: the amount keeps clear. */
export const QUICK_PHOTO_ROOM = 86;

const drop = {
  duration: durations.photoDrop,
  easing: Easing.bezier(...curves.photoClip),
  reduceMotion: ReduceMotion.System,
};

/**
 * The empty clip that waits on Quick add's ticket. Use it or don't; Keep it works the same.
 * Tapped, it offers the camera or Photos; the photo drops under the clip with a light tap.
 */
export function QuickPhoto({
  photo,
  onPick,
}: {
  /** The photo clipped on so far (a `file://` URI), or null. */
  readonly photo: string | null;
  readonly onPick: (key: string) => void;
}) {
  const { t } = useI18n();
  const landed = useSharedValue(photo === null ? 0 : 1);
  const shown = useRef(photo);
  useEffect(() => {
    if (photo === shown.current) return;
    shown.current = photo;
    if (photo === null) {
      landed.set(0);
      return;
    }
    haptics.tap();
    landed.set(0);
    landed.set(withTiming(1, drop));
  }, [photo, landed]);

  const fallIn = useAnimatedStyle(() => {
    const p = landed.get();
    return {
      opacity: Math.min(1, p * 1.6),
      transform: [{ translateY: (1 - p) * -90 }, { rotate: `${4 - (1 - p) * 12}deg` }],
    };
  });
  const ghost = useAnimatedStyle(() => ({ opacity: 1 - landed.get() }));

  return (
    <View style={{ position: 'absolute', right: 14, top: 2, width: 70, height: 103, zIndex: 2 }}>
      <ActionMenu
        actions={photoActions({ camera: t('photo.take'), photos: t('photo.choose') })}
        onAction={onPick}
        label={t('photo.add')}
      >
        <View style={{ width: 70, height: 103 }}>
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: 70,
                height: 96,
                borderRadius: 6,
                borderWidth: 1.5,
                borderStyle: 'dashed',
                borderColor: photoInk.slotEdge,
                backgroundColor: photoInk.slotFill,
                transform: [{ rotate: '4deg' }],
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
              },
              ghost,
            ]}
          >
            <Symbol name="add_a_photo" size={20} color={photoInk.slotInk} />
            <Text style={{ ...mono(8.5, 500, 0.1), color: photoInk.slotInk }}>
              {t('photo.clipOne')}
            </Text>
          </Animated.View>
          {photo !== null ? (
            <Animated.View
              style={[
                {
                  width: 70,
                  height: 103,
                  borderWidth: 3,
                  borderColor: photoInk.frame,
                  backgroundColor: photoInk.frame,
                  overflow: 'hidden',
                  boxShadow: '0 8px 16px rgba(0,0,0,.35)',
                },
                fallIn,
              ]}
            >
              <Image source={{ uri: photo }} resizeMode="cover" style={{ flex: 1 }} />
            </Animated.View>
          ) : null}
        </View>
      </ActionMenu>
      <PhotoClip size={36} rotate={8} style={{ position: 'absolute', right: 22, top: -12 }} />
    </View>
  );
}
