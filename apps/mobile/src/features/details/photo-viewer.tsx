import { useEffect, useRef, useState } from 'react';
import { Image, Modal, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { curves, durations, gestures, photoInk } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { ActionMenu, type MenuAction } from '../../ui/primitives/action-menu';
import { PressScale } from '../../ui/primitives/press-scale';
import { body } from '../../ui/type/fonts';

const open = {
  duration: durations.photoOpen,
  easing: Easing.bezier(...curves.enter),
  reduceMotion: ReduceMotion.System,
};
const fall = {
  duration: durations.photoFall,
  easing: Easing.bezier(...curves.photoFall),
  reduceMotion: ReduceMotion.System,
};
const chromeFade = { duration: 250 };
const back = { damping: 22, stiffness: 240, mass: 1 };
const MAX_ZOOM = 5;
/** Where the photo stands in the full view: under the header, over the buttons. */
const TOP = 120;
const BOTTOM = 170;

/** Where the clipped print sits on the sheet, in window points, and how it is turned. */
export interface PrintFrame {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly rotate: number;
}

/**
 * The photo full screen. It grows out of the clipped print (550 ms, the entrance curve) onto
 * black; pinch to read the small print (a double tap zooms in and out); swipe down and it clips
 * itself back. Remove lets it fall off the clip; Replace takes a new one from the same menu.
 */
export function PhotoViewer({
  uri,
  from,
  title,
  subtitle,
  replaceActions,
  onReplace,
  onRemove,
  onClosed,
}: {
  readonly uri: string;
  readonly from: PrintFrame;
  /** "Circle K · 120.000₫" */
  readonly title: string;
  /** "Today · 16:40" */
  readonly subtitle: string;
  readonly replaceActions: readonly MenuAction[];
  /** A source picked under Replace, once the photo is clipped back and the view is gone. */
  readonly onReplace: (key: string) => void;
  /** The photo has fallen off: take it away (with its undo). */
  readonly onRemove: () => void;
  /** Gone: the print shows again. */
  readonly onClosed: () => void;
}) {
  const { t } = useI18n();
  const screen = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [aspect, setAspect] = useState(from.width / from.height);
  useEffect(() => {
    Image.getSize(
      uri,
      (w, h) => {
        if (w > 0 && h > 0) setAspect(w / h);
      },
      () => undefined,
    );
  }, [uri]);

  // The photo's frame in the full view: as large as fits between the header and the buttons.
  const roomW = screen.width - 40;
  const roomH = screen.height - TOP - BOTTOM - insets.bottom;
  const width = Math.min(roomW, roomH * aspect);
  const height = width / aspect;
  const left = (screen.width - width) / 2;
  const top = TOP + (roomH - height) / 2;

  const progress = useSharedValue(0);
  const chrome = useSharedValue(0);
  const dragY = useSharedValue(0);
  const dragX = useSharedValue(0);
  const zoom = useSharedValue(1);
  const zoomFrom = useSharedValue(1);
  const panX = useSharedValue(0);
  const panY = useSharedValue(0);
  const panFrom = useSharedValue({ x: 0, y: 0 });
  const falling = useSharedValue(0);

  useEffect(() => {
    progress.set(
      withTiming(1, open, (done) => {
        if (done) chrome.set(withTiming(1, chromeFade));
      }),
    );
  }, [progress, chrome]);

  // A source picked under Replace waits for the view to close: the picker cannot open over it.
  const replacing = useRef<string | null>(null);
  const closed = () => {
    onClosed();
    const key = replacing.current;
    replacing.current = null;
    if (key !== null) onReplace(key);
  };

  const close = () => {
    chrome.set(withTiming(0, chromeFade));
    zoom.set(withTiming(1, open));
    panX.set(withTiming(0, open));
    panY.set(withTiming(0, open));
    dragX.set(withTiming(0, open));
    dragY.set(withTiming(0, open));
    progress.set(
      withTiming(0, open, (done) => {
        if (done) scheduleOnRN(closed);
      }),
    );
  };

  const remove = () => {
    haptics.warning();
    chrome.set(withTiming(0, chromeFade));
    falling.set(
      withTiming(1, fall, (done) => {
        if (done) scheduleOnRN(onRemove);
      }),
    );
  };

  const pinch = Gesture.Pinch()
    .onStart(() => {
      zoomFrom.set(zoom.get());
    })
    .onUpdate((e) => {
      zoom.set(Math.min(MAX_ZOOM, Math.max(0.8, zoomFrom.get() * e.scale)));
    })
    .onEnd(() => {
      if (zoom.get() <= 1) {
        zoom.set(withSpring(1, back));
        panX.set(withSpring(0, back));
        panY.set(withSpring(0, back));
      }
    });

  const pan = Gesture.Pan()
    .averageTouches(true)
    .onStart(() => {
      panFrom.set({ x: panX.get(), y: panY.get() });
    })
    .onUpdate((e) => {
      if (zoom.get() > 1.01) {
        // Zoomed in: the finger moves the photo around, no further than its edges.
        const spareX = (width * zoom.get() - width) / 2;
        const spareY = (height * zoom.get() - height) / 2;
        panX.set(Math.min(spareX, Math.max(-spareX, panFrom.get().x + e.translationX)));
        panY.set(Math.min(spareY, Math.max(-spareY, panFrom.get().y + e.translationY)));
        return;
      }
      // Whole: only down drags it back toward the clip, the backdrop fading as it goes.
      dragY.set(Math.max(0, e.translationY));
      dragX.set(e.translationX * 0.5);
    })
    .onEnd((e) => {
      if (zoom.get() > 1.01) return;
      if (dragY.get() > gestures.sheetDismiss || e.velocityY > 900) {
        scheduleOnRN(close);
        return;
      }
      dragY.set(withSpring(0, back));
      dragX.set(withSpring(0, back));
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((e) => {
      if (zoom.get() > 1.01) {
        zoom.set(withTiming(1, open));
        panX.set(withTiming(0, open));
        panY.set(withTiming(0, open));
        return;
      }
      const to = 2.5;
      zoom.set(withTiming(to, open));
      // Zooms toward where it was tapped.
      const spareX = (width * to - width) / 2;
      const spareY = (height * to - height) / 2;
      const x = (width / 2 - e.x) * (to - 1);
      const y = (height / 2 - e.y) * (to - 1);
      panX.set(withTiming(Math.min(spareX, Math.max(-spareX, x)), open));
      panY.set(withTiming(Math.min(spareY, Math.max(-spareY, y)), open));
    });

  const gesture = Gesture.Simultaneous(pinch, pan, doubleTap);

  const backdrop = useAnimatedStyle(() => {
    const drag = Math.min(1, dragY.get() / 400);
    return { opacity: progress.get() * (1 - drag * 0.5) * (1 - falling.get()) };
  });
  const photo = useAnimatedStyle(() => {
    const p = progress.get();
    const sx = from.width / width;
    const sy = from.height / height;
    const fromCx = from.x + from.width / 2;
    const fromCy = from.y + from.height / 2;
    const cx = left + width / 2;
    const cy = top + height / 2;
    const drag = Math.min(1, dragY.get() / 600);
    const f = falling.get();
    return {
      opacity: 1 - f,
      borderRadius: 2 + 12 * p,
      transform: [
        { translateX: (fromCx - cx) * (1 - p) + dragX.get() + f * 40 },
        { translateY: (fromCy - cy) * (1 - p) + dragY.get() + f * screen.height },
        { rotate: `${from.rotate * (1 - p) + f * 34}deg` },
        { scaleX: (sx + (1 - sx) * p) * (1 - drag * 0.25) },
        { scaleY: (sy + (1 - sy) * p) * (1 - drag * 0.25) },
      ],
    };
  });
  const frame = useAnimatedStyle(() => ({ opacity: 1 - progress.get() }));
  const zoomed = useAnimatedStyle(() => ({
    transform: [{ translateX: panX.get() }, { translateY: panY.get() }, { scale: zoom.get() }],
  }));
  const chromeStyle = useAnimatedStyle(() => ({
    opacity: chrome.get() * (1 - Math.min(1, dragY.get() / 60)),
  }));

  // The two buttons share the row; the system menu's button is as wide as what it holds.
  const half = (screen.width - 36 - 10) / 2;
  const button = {
    height: 50,
    borderRadius: 99,
    backgroundColor: photoInk.viewerButton,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  } as const;

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent onRequestClose={close}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View
          pointerEvents="none"
          style={[{ position: 'absolute', inset: 0, backgroundColor: photoInk.viewer }, backdrop]}
        />
        <GestureDetector gesture={gesture}>
          <Animated.View
            accessible
            accessibilityRole="image"
            accessibilityLabel={title}
            style={[
              {
                position: 'absolute',
                left,
                top,
                width,
                height,
                overflow: 'hidden',
                boxShadow: '0 30px 60px rgba(0,0,0,.5)',
              },
              photo,
            ]}
          >
            <Animated.View style={[{ flex: 1 }, zoomed]}>
              <Image source={{ uri }} resizeMode="cover" style={{ flex: 1 }} />
            </Animated.View>
            {/* The print's white edge, there while it is still the print. */}
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: 'absolute',
                  inset: 0,
                  borderWidth: (4 * width) / from.width,
                  borderColor: photoInk.frame,
                },
                frame,
              ]}
            />
          </Animated.View>
        </GestureDetector>

        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 0,
              right: 0,
              top: 56,
              paddingHorizontal: 18,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            },
            chromeStyle,
          ]}
        >
          <PressScale
            accessibilityRole="button"
            accessibilityLabel={t('photo.close')}
            onPress={() => {
              haptics.tap();
              close();
            }}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: photoInk.viewerButton,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Symbol name="close" size={22} color={photoInk.viewerInk} />
          </PressScale>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={{ ...body(16, 650), color: photoInk.viewerInk }}>
              {title}
            </Text>
            <Text numberOfLines={1} style={{ ...body(12.5), color: photoInk.viewerSoft }}>
              {subtitle}
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 18,
              right: 18,
              bottom: 36 + insets.bottom / 2,
              gap: 12,
            },
            chromeStyle,
          ]}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Symbol name="swipe_down" size={16} color={photoInk.viewerSoft} />
            <Text style={{ ...body(12.5), color: photoInk.viewerSoft }}>{t('photo.hint')}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <ActionMenu
                actions={replaceActions}
                label={t('photo.replace')}
                onAction={(key) => {
                  replacing.current = key;
                  close();
                }}
              >
                <View style={[button, { width: half }]}>
                  <Symbol name="cached" size={20} color={photoInk.viewerInk} />
                  <Text style={{ ...body(15, 600), color: photoInk.viewerInk }}>
                    {t('photo.replace')}
                  </Text>
                </View>
              </ActionMenu>
            </View>
            <PressScale
              accessibilityRole="button"
              accessibilityLabel={t('photo.remove')}
              onPress={remove}
              style={[button, { flex: 1 }]}
            >
              <Symbol name="delete" size={20} color={photoInk.remove} />
              <Text style={{ ...body(15, 600), color: photoInk.remove }}>{t('photo.remove')}</Text>
            </PressScale>
          </View>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}
