import { usePreventRemove, useRouter } from 'expo-router';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  LinearTransition,
  ReduceMotion,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  type AnimatedScrollViewProps,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { curves } from '@6pm/theme';

import {
  useScrollDismiss,
  useSheetDrag,
  type ScrollDismiss,
  type SheetDrag,
} from '../motion/use-sheet-drag';
import { useTheme } from '../theme/theme';
import { useSheetKeyboard } from './edge-sheet-keyboard';
import { edgeSheetDrawn } from './presentations';
import { SheetFrame } from './sheet-frame';

/** The native sheet's corners (`sheetCornerRadius`). */
const CORNER = 40;
/** Sheet colour past the bottom edge, so a pull upwards never shows the page under the sheet. */
const UNDER = 400;
const DIM = 'rgba(10,6,18,.36)';
/** The prototype's sheet curve: the top edge follows what the sheet holds as it grows or shrinks. */
const RESIZE = LinearTransition.duration(450)
  .easing(Easing.bezier(...curves.enter))
  .reduceMotion(ReduceMotion.System);
/** Back actions, which slide a drawn sheet away before it leaves. */
const BACK = new Set(['GO_BACK', 'POP']);

interface Shape {
  /** The drawn sheet's scroll, which pulls the sheet down from its top. */
  readonly scroll: ScrollDismiss | null;
  /** The sheet is the full-height native one (iPad), so the scroll fills what is left. */
  readonly fill: boolean;
  /** How far the drawn sheet can rise before its top meets the safe area. */
  readonly room: SharedValue<number> | null;
}

const ShapeContext = createContext<Shape | null>(null);

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
  // While drawn, the screen is held until the sheet has slid away.
  const [held, setHeld] = useState(edgeSheetDrawn);
  const resume = useRef<(() => void) | null>(null);
  const release = useRef<() => void>(() => {});
  const drag = useSheetDrag({
    area: screen,
    onDismissed: () => {
      const go = resume.current;
      if (go) {
        go();
        return;
      }
      setHeld(false);
      release.current();
      router.back();
    },
  });
  const scroll = useScrollDismiss(drag);
  const { dismiss } = drag;

  // Anything inside that goes back (Done, a finished save) slides the drawn sheet away first, as
  // the native sheet does, rather than taking it off the screen at once. Other ways out (to Home,
  // to another screen in its place) go at once.
  release.current = usePreventRemove(held, ({ data, repeat }) => {
    const go = () => {
      setHeld(false);
      repeat();
    };
    if (!BACK.has(data.action.type)) {
      go();
      return;
    }
    resume.current = go;
    dismiss();
  });

  return {
    dismiss: edgeSheetDrawn ? dismiss : () => router.back(),
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
 * grows or shrinks its top edge follows on the UI thread with the sheet curve. It is never taller
 * than the full sheet (its top on the safe area): there what it holds shrinks its `EdgeSheetScroll`
 * to scroll. It rises with the keyboard as far as the safe area allows. On Android it is the
 * native sheet around a fitted `SheetFrame`, and on iPad the full-height page sheet.
 */
export function EdgeSheet({
  sheet,
  children,
}: {
  readonly sheet: EdgeSheetControl;
  readonly children: ReactNode;
}) {
  if (!sheet.drawn) return <NativeEdgeSheet>{children}</NativeEdgeSheet>;
  return <DrawnEdgeSheet sheet={sheet}>{children}</DrawnEdgeSheet>;
}

/**
 * A sheet with its own header and body as tall as what it holds (its route presented as
 * `edgeSheet`): an `EdgeSheet` that makes its own drag and way out. Its body is an
 * `EdgeSheetScroll`, with any pinned footer after it; a `router.back()` from inside slides it away.
 */
export function FittedSheet({ children }: { readonly children: ReactNode }) {
  const edge = useEdgeSheet();
  return <EdgeSheet sheet={edge}>{children}</EdgeSheet>;
}

/**
 * A view around an `EdgeSheet` (to hold an overlay beside it): it fills the screen where the sheet
 * is drawn or full height, and on Android, where the native sheet takes the height of what it
 * holds, it is as tall as the sheet.
 */
export const edgeSheetRoot = Platform.OS === 'android' ? null : ({ flex: 1 } as const);

const FILL: Shape = { scroll: null, fill: true, room: null };
const FIT: Shape = { scroll: null, fill: false, room: null };

function NativeEdgeSheet({ children }: { readonly children: ReactNode }) {
  const { height: screen } = useWindowDimensions();
  const { top: safeTop, bottom: safeBottom } = useSafeAreaInsets();
  if (Platform.OS === 'ios') {
    return (
      <ShapeContext value={FILL}>
        <SheetFrame>{children}</SheetFrame>
      </ShapeContext>
    );
  }
  return (
    <ShapeContext value={FIT}>
      <SheetFrame fit maxHeight={Math.max(0, screen - safeTop)}>
        {children}
        {/* Android's sheet runs under its navigation bar: what it holds stays above it. */}
        <View style={{ height: safeBottom }} />
      </SheetFrame>
    </ShapeContext>
  );
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
  const room = useDerivedValue(() => Math.max(0, screen - safeTop - panelHeight.get()));
  const shape = useMemo<Shape>(() => ({ scroll, fill: false, room }), [scroll, room]);

  useEffect(() => {
    enter();
  }, [enter]);

  // The keyboard lifts the sheet only as far as its top can go before the safe area.
  const panel = useAnimatedStyle(() => ({
    transform: [{ translateY: sheet.y.get() + Math.max(keyboard.height.get(), -room.get()) }],
  }));
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
          layout={RESIZE}
          onLayout={(e) => panelHeight.set(e.nativeEvent.layout.height)}
          style={[
            {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              maxHeight: Math.max(0, screen - safeTop),
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
          <ShapeContext value={shape}>{children}</ShapeContext>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

/**
 * The scroll inside an `EdgeSheet`: as tall as what it holds until the sheet reaches its full
 * height, then it shrinks and scrolls; pulled down from its top it pulls the sheet down. In the
 * full-height native sheet (iPad) it fills the sheet under the header. In the drawn sheet it keeps
 * a focused field above the keyboard itself (`useSheetKeyboard`).
 */
export function EdgeSheetScroll({ style, ...props }: EdgeSheetScrollProps) {
  const shape = useContext(ShapeContext);
  const sized = [shape?.fill ? FILLS : FITS, style];
  if (shape?.scroll && shape.room) {
    return <DrawnScroll {...props} style={sized} scroll={shape.scroll} room={shape.room} />;
  }
  return <Animated.ScrollView {...props} style={sized} />;
}

type EdgeSheetScrollProps = Omit<AnimatedScrollViewProps, 'ref' | 'onScroll' | 'animatedProps'>;

function DrawnScroll({
  scroll,
  room,
  ...props
}: EdgeSheetScrollProps & { readonly scroll: ScrollDismiss; readonly room: SharedValue<number> }) {
  const insets = useSheetKeyboard(scroll, room);
  return (
    <GestureDetector gesture={scroll.gesture}>
      <Animated.ScrollView
        {...props}
        automaticallyAdjustKeyboardInsets={false}
        animatedProps={insets}
        ref={scroll.ref}
        onScroll={scroll.onScroll}
        scrollEventThrottle={16}
      />
    </GestureDetector>
  );
}

const FILLS = { flex: 1 } as const;
const FITS = { flexGrow: 0, flexShrink: 1 } as const;
