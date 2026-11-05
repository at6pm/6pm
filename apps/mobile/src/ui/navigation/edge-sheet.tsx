import { useRouter } from 'expo-router';
import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  type AnimatedScrollViewProps,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  useScrollDismiss,
  useSheetDrag,
  type ScrollDismiss,
  type SheetDrag,
} from '../motion/use-sheet-drag';
import { useTheme } from '../theme/theme';
import { edgeSheetDrawn } from './presentations';
import { SheetFrame } from './sheet-frame';

/** The native sheet's corners (`sheetCornerRadius`). */
const CORNER = 40;
/** Sheet colour past the bottom edge, so a pull upwards never shows the page under the sheet. */
const UNDER = 400;
const DIM = 'rgba(10,6,18,.36)';

const ScrollContext = createContext<ScrollDismiss | null>(null);

export interface EdgeSheetControl {
  /** Slides the sheet away, then leaves the screen: Cancel and a finished save call it. */
  readonly dismiss: () => void;
  /**
   * Whether the sheet is drawn here, standing on the bottom edge: what it holds then keeps its
   * last control clear of the home indicator itself.
   */
  readonly drawn: boolean;
  readonly drag: SheetDrag;
  readonly scroll: ScrollDismiss;
}

/** The sheet's drag and its way out, made by the screen that holds an `EdgeSheet`. */
export function useEdgeSheet(): EdgeSheetControl {
  const router = useRouter();
  const { height: screen } = useWindowDimensions();
  const drag = useSheetDrag({ area: screen, onDismissed: () => router.back() });
  const scroll = useScrollDismiss(drag);
  return {
    dismiss: edgeSheetDrawn ? drag.dismiss : () => router.back(),
    drawn: edgeSheetDrawn,
    drag,
    scroll,
  };
}

/**
 * A sheet as tall as what it holds that stands on the bottom of the screen, edge to edge, its own
 * colour running under the home indicator (Quick add). Below the tallest detent iOS floats its
 * native sheet as an inset card, so on an iPhone this one draws itself over a transparent modal
 * (`edgeSheet`): it slides up as the native sheet does, a drag anywhere on it follows the finger
 * and a release past 120 pt or a flick sends it away, the page behind dims, and when what it holds
 * grows or shrinks its top edge follows on the UI thread. It rises with the keyboard as far as the
 * safe area allows. On iPad and Android it is the native sheet around a fitted `SheetFrame`.
 */
export function EdgeSheet({
  sheet,
  children,
}: {
  readonly sheet: EdgeSheetControl;
  readonly children: ReactNode;
}) {
  if (!sheet.drawn) return <SheetFrame fit>{children}</SheetFrame>;
  return <DrawnEdgeSheet sheet={sheet}>{children}</DrawnEdgeSheet>;
}

function DrawnEdgeSheet({
  sheet: control,
  children,
}: {
  readonly sheet: EdgeSheetControl;
  readonly children: ReactNode;
}) {
  const { palette } = useTheme();
  const { height: screen } = useWindowDimensions();
  const { top: safeTop } = useSafeAreaInsets();
  const { drag: sheet, scroll } = control;
  const keyboard = useReanimatedKeyboardAnimation();
  const panelHeight = useSharedValue(0);
  const { enter } = sheet;

  useEffect(() => {
    enter();
  }, [enter]);

  const panel = useAnimatedStyle(() => {
    // The keyboard lifts the sheet only as far as its top can go before the safe area.
    const room = Math.max(0, screen - safeTop - panelHeight.get());
    return {
      transform: [{ translateY: sheet.y.get() + Math.max(keyboard.height.get(), -room) }],
    };
  });
  const backdrop = useAnimatedStyle(() => ({
    opacity: interpolate(
      sheet.y.get(),
      [0, Math.max(1, panelHeight.get())],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, backdrop]}>
        <Pressable
          accessible={false}
          onPress={sheet.dismiss}
          style={{ flex: 1, backgroundColor: DIM }}
        />
      </Animated.View>
      <GestureDetector gesture={sheet.header}>
        <Animated.View
          accessibilityViewIsModal
          onAccessibilityEscape={sheet.dismiss}
          onLayout={(e) => panelHeight.set(e.nativeEvent.layout.height)}
          style={[
            {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              borderTopLeftRadius: CORNER,
              borderTopRightRadius: CORNER,
              borderCurve: 'continuous',
              backgroundColor: palette.sheetSolid,
            },
            panel,
          ]}
        >
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: -UNDER,
              height: UNDER,
              backgroundColor: palette.sheetSolid,
            }}
          />
          <ScrollContext.Provider value={scroll}>{children}</ScrollContext.Provider>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

/**
 * The scroll inside an `EdgeSheet` (when what it holds is taller than the screen allows): it
 * scrolls, and pulled down from its top it pulls the sheet down.
 */
export function EdgeSheetScroll(props: Omit<AnimatedScrollViewProps, 'ref' | 'onScroll'>) {
  const scroll = useContext(ScrollContext);
  if (scroll === null) return <Animated.ScrollView {...props} />;
  return (
    <GestureDetector gesture={scroll.gesture}>
      <Animated.ScrollView
        {...props}
        ref={scroll.ref}
        onScroll={scroll.onScroll}
        scrollEventThrottle={16}
      />
    </GestureDetector>
  );
}
