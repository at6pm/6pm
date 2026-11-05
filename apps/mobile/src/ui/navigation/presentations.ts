import type { Stack } from 'expo-router';
import { Platform } from 'react-native';
import type { ComponentProps } from 'react';

type ScreenOptions = Extract<
  NonNullable<ComponentProps<typeof Stack.Screen>['options']>,
  Record<string, unknown>
>;

/**
 * Sheets are the real iOS sheet: dragged down anywhere, or pulled down from the top of their
 * scroll, they follow the finger and leave with its velocity, and `router.back()` slides them away.
 * The one detent is the tallest iOS allows: its top edge sits on the safe area, 62 pt down the
 * prototype's 874 pt screen, 4 pt below the prototype's 58 (iOS will not raise a sheet higher).
 * iOS dims the page behind without shrinking it, so the sky stays above the sheet. Each sheet paints its own colour
 * (`SheetFrame`), and draws the prototype's grabber instead of the system one.
 * On iPad a form sheet is a small card in the middle of the screen, too short for a pinned footer
 * and its scroll, so there it is the page sheet: nearly the screen's height, as Mail composes.
 */
export const sheet: ScreenOptions = {
  presentation: Platform.OS === 'ios' && Platform.isPad ? 'pageSheet' : 'formSheet',
  sheetAllowedDetents: [1],
  sheetCornerRadius: 40,
  sheetGrabberVisible: false,
  headerShown: false,
  contentStyle: { backgroundColor: 'transparent' },
};

/**
 * A sheet as tall as what it holds, never the full height when it needs less, with iOS animating
 * it to a new height when what it holds grows or shrinks (a row opening). Its body is a
 * `SheetFrame` with `fit`. On an iPhone iOS floats a sheet this short as an inset card, so there
 * `edgeSheet` draws it instead; this is that sheet on iPad and Android. Android's animated resize
 * leaves the sheet at its first height when what it holds grows, pushing its foot off the screen,
 * so there it takes the new height at once.
 */
const fittedSheet: ScreenOptions =
  Platform.OS === 'ios' && Platform.isPad
    ? sheet
    : { ...sheet, sheetAllowedDetents: 'fitToContents', sheetResizeAnimationEnabled: false };

/** Whether `edgeSheet` is drawn by the app (an iPhone) rather than the native sheet. */
export const edgeSheetDrawn = Platform.OS === 'ios' && !Platform.isPad;

/**
 * Quick add's sheet: as tall as what it holds and standing on the bottom edge, its colour under
 * the home indicator. Its body is an `EdgeSheet`, which draws itself on an iPhone (iOS would float
 * a native sheet this short inset from the edges) and is `fittedSheet` elsewhere.
 */
export const edgeSheet: ScreenOptions = edgeSheetDrawn
  ? {
      presentation: 'transparentModal',
      animation: 'none',
      headerShown: false,
      contentStyle: { backgroundColor: 'transparent' },
    }
  : fittedSheet;

/**
 * The iOS page sheet (`UIModalPresentationPageSheet`), for a screen that is a place of its own
 * rather than a step off the page (Ask, Scan): the page behind scales back into a card under the
 * dim, as Mail and Messages do when they compose. It sits at the system's large detent, a few points lower
 * than `sheet`, and drags and dismisses with the same physics. iOS draws its corners and offers no
 * grabber or corner options here (react-native-screens applies `sheetCornerRadius` and
 * `sheetGrabberVisible` to form sheets only), so the screen paints its own colour and grabber.
 * Android has no page sheet: it would open the screen full screen under the status bar, so there
 * it is the form sheet the other sheets are, below the status bar and dragged down to close.
 */
export const pageSheet: ScreenOptions =
  Platform.OS === 'android'
    ? sheet
    : {
        presentation: 'pageSheet',
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      };

/**
 * Sheets the native sheet cannot draw, which draw themselves over a transparent modal: the
 * floating card (`CardSheet`, inset from the edges and as tall as its content) and the Looks
 * sheet (which sinks low over the undimmed page wearing a look being tried on). Below the tallest detent
 * iOS floats its sheet inset from the edges, so neither shape can be native.
 */
export const drawnSheet: ScreenOptions = {
  presentation: 'transparentModal',
  animation: 'none',
  headerShown: false,
  contentStyle: { backgroundColor: 'transparent' },
};

/**
 * Full-screen moments that own the whole display: the 6pm Close, Max welcome, and Scan on a phone
 * with a hinge.
 */
export const takeover: ScreenOptions = {
  presentation: 'fullScreenModal',
  animation: 'fade_from_bottom',
  headerShown: false,
};
