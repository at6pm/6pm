import { useRouter } from 'expo-router';
import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type AnimatedScrollViewProps,
} from 'react-native-reanimated';

import { useDesignInsets } from '../../ui/layout/design-insets';
import { useScrollDismiss, useSheetDrag, type ScrollDismiss } from '../../ui/motion/use-sheet-drag';
import { useTheme } from '../../ui/theme/theme';

const ScrollContext = createContext<ScrollDismiss | null>(null);

/**
 * The prototype's floating card sheet (the missed-day catch-up, the language picker): 8 pt from
 * the sides and bottom, 44 pt corners, as tall as its content, over a dimmed page. The native sheet
 * cannot float like this, so it draws itself: it slides up over 0.45 s, and a drag anywhere on the
 * card pulls it down as the native sheet's does. Released, it goes where the flick was heading:
 * past 120 pt it leaves with the finger's speed, otherwise it springs home; upward it gives like
 * rubber. A list inside goes in `CardSheetScroll`, so it scrolls, and pulls the card down once it
 * is at its top. The content gets the animated dismiss, so its own buttons leave the same way.
 */
export function CardSheet({ children }: { readonly children: (dismiss: () => void) => ReactNode }) {
  const router = useRouter();
  const { palette } = useTheme();
  const { bottom } = useDesignInsets();
  const { height } = useWindowDimensions();
  const sheet = useSheetDrag({ area: height, onDismissed: () => router.back() });
  const scroll = useScrollDismiss(sheet);
  const { enter } = sheet;

  useEffect(() => {
    enter();
  }, [enter]);

  const panel = useAnimatedStyle(() => ({ transform: [{ translateY: sheet.y.get() }] }));
  // The dim follows the card: full when it is home, gone as it leaves.
  const backdrop = useAnimatedStyle(() => ({
    opacity: interpolate(sheet.y.get(), [0, height], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, backdrop]}>
        <Pressable
          accessibilityRole="button"
          onPress={sheet.dismiss}
          style={{ flex: 1, backgroundColor: 'rgba(10,6,18,.36)' }}
        />
      </Animated.View>
      {/* The card's drag starts 2 pt later than a list's (10 against 8), so inside a list the
          list's own pull wins and the card's never fights it. */}
      <GestureDetector gesture={sheet.header}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 8,
              right: 8,
              bottom: bottom(8),
              paddingTop: 8,
              paddingHorizontal: 20,
              paddingBottom: 22,
              borderRadius: 44,
              backgroundColor: palette.sheetSolid,
              borderWidth: 0.5,
              borderColor: palette.glassBorder,
              boxShadow: '0 30px 80px rgba(10,5,20,.4)',
              gap: 18,
            },
            panel,
          ]}
        >
          <View style={{ alignSelf: 'center', paddingVertical: 10, marginVertical: -10 }}>
            <View
              style={{
                width: 36,
                height: 5,
                borderRadius: 9,
                backgroundColor: palette.inkSoft,
                opacity: 0.35,
              }}
            />
          </View>
          <ScrollContext.Provider value={scroll}>{children(sheet.dismiss)}</ScrollContext.Provider>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

/** A list inside a `CardSheet`: it scrolls, and pulled down from its top it pulls the card down. */
export function CardSheetScroll(props: Omit<AnimatedScrollViewProps, 'ref' | 'onScroll'>) {
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
