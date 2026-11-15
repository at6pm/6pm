import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, Text, View, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '../../i18n/i18n';
import { PressScale } from '../primitives/press-scale';
import { useTheme } from '../theme/theme';
import { body } from '../type/fonts';
import { EdgeSheet, EdgeSheetScroll, useEdgeSheet } from './edge-sheet';
import { SheetFrame } from './sheet-frame';

/** Space under the body's last section, past the home indicator. */
const FOOT = 44;

/**
 * The prototype's sheet: a grabber, a centred title with Done on the right, and a scrolling body
 * on the solid sheet colour, with an optional footer pinned under it. The native iOS sheet it is
 * presented in gives the drag anywhere, the pull down from the top of the scroll, the dimming, and
 * the slide away when Done calls `router.back()`.
 *
 * With `fit` (presented as `edgeSheet`) the sheet is as tall as what it holds, standing on the
 * bottom edge, and grows to the full sheet only when it needs to, its body scrolling from there.
 */
export function SheetScreen(props: SheetScreenProps) {
  return props.fit ? <FittedSheetScreen {...props} /> : <FullSheetScreen {...props} />;
}

interface SheetScreenProps {
  readonly title: string;
  /** Space between the body's sections (Settings spaces its cards wider). */
  readonly gap?: number;
  readonly children?: ReactNode;
  /** Pinned under the scroll area (e.g. "Confirm all"). */
  readonly footer?: ReactNode;
  /** Off while a row is dragged inside the body. */
  readonly scrollEnabled?: boolean;
  /** As tall as what it holds (the route is presented as `edgeSheet`). */
  readonly fit?: boolean;
}

function FullSheetScreen({
  title,
  children,
  footer,
  gap = 22,
  scrollEnabled = true,
}: SheetScreenProps) {
  const router = useRouter();
  return (
    <SheetFrame header={<SheetTop title={title} onDone={() => router.back()} />}>
      <ScrollView style={{ flex: 1 }} {...scrollProps(gap, scrollEnabled, FOOT)}>
        {children}
      </ScrollView>
      {footer}
    </SheetFrame>
  );
}

function FittedSheetScreen({
  title,
  children,
  footer,
  gap = 22,
  scrollEnabled = true,
}: SheetScreenProps) {
  const edge = useEdgeSheet();
  const { bottom: safeBottom } = useSafeAreaInsets();
  // Standing on the bottom edge, the last section stays clear of the home indicator.
  const foot = edge.drawn && footer === undefined ? Math.max(FOOT, safeBottom + 18) : FOOT;
  return (
    <EdgeSheet sheet={edge}>
      <SheetTop title={title} onDone={edge.dismiss} />
      <EdgeSheetScroll alwaysBounceVertical {...scrollProps(gap, scrollEnabled, foot)}>
        {children}
      </EdgeSheetScroll>
      {footer}
    </EdgeSheet>
  );
}

function scrollProps(gap: number, scrollEnabled: boolean, foot: number) {
  return {
    scrollEnabled,
    contentInsetAdjustmentBehavior: 'never',
    automaticallyAdjustKeyboardInsets: true,
    keyboardDismissMode: 'interactive',
    keyboardShouldPersistTaps: 'handled',
    contentContainerStyle: { paddingTop: 6, paddingHorizontal: 16, paddingBottom: foot, gap },
    showsVerticalScrollIndicator: false,
  } as const satisfies ScrollViewProps;
}

/** The grabber, and the centred title with Done on the right. */
function SheetTop({ title, onDone }: { readonly title: string; readonly onDone: () => void }) {
  const { palette } = useTheme();
  const { t } = useI18n();
  return (
    <View style={{ paddingTop: 8, paddingHorizontal: 18, paddingBottom: 6, gap: 6 }}>
      <View
        style={{
          alignSelf: 'center',
          width: 36,
          height: 5,
          borderRadius: 9,
          backgroundColor: palette.inkSoft,
          opacity: 0.35,
        }}
      />
      <View style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ ...body(17, 650), color: palette.ink }}>{title}</Text>
        <PressScale
          accessibilityRole="button"
          onPress={onDone}
          hitSlop={8}
          style={{ position: 'absolute', right: 0, paddingVertical: 8, paddingHorizontal: 2 }}
        >
          <Text style={{ ...body(17, 650), color: palette.ink }}>{t('common.done')}</Text>
        </PressScale>
      </View>
    </View>
  );
}
