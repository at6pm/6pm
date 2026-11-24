import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';

import { curves } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { BackSheetHeader } from '../../ui/navigation/back-sheet-header';
import { SheetFrame } from '../../ui/navigation/sheet-frame';

/** The prototype's `screenIn`: up 12 pt from 98.5 %, over 0.35 s on the entrance curve. */
const screenIn = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: 12 }, { scale: 0.985 }] },
  100: {
    opacity: 1,
    transform: [{ translateY: 0 }, { scale: 1 }],
    easing: Easing.bezier(...curves.enter),
  },
}).duration(350);

/**
 * A page one step into Settings, the way the capture guides open: the full sheet over Settings,
 * "‹ Settings" on the left to step back, the page's name in the middle, Done on the right to close
 * Settings from here, and the page's own scroll under them. Every row with a chevron in Settings
 * opens one (the route is presented as `sheet`).
 */
export function SettingsPage({
  title,
  gap = 22,
  scrollEnabled = true,
  children,
}: {
  readonly title: string;
  /** Space between the page's sections. */
  readonly gap?: number;
  /** Off while a row is dragged inside the page. */
  readonly scrollEnabled?: boolean;
  readonly children: ReactNode;
}) {
  return (
    <SheetFrame header={<SettingsPageTop title={title} />}>
      <ScrollView
        style={{ flex: 1 }}
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          entering={screenIn}
          style={{ paddingTop: 8, paddingHorizontal: 16, paddingBottom: 44, gap }}
        >
          {children}
        </Animated.View>
      </ScrollView>
    </SheetFrame>
  );
}

/** The grabber, "‹ Settings", the page's name, and Done. */
export function SettingsPageTop({ title }: { readonly title: string }) {
  const { t } = useI18n();
  const router = useRouter();
  return (
    <BackSheetHeader
      title={title}
      backLabel={t('capture.guide.back')}
      onBack={() => router.back()}
      onDone={() => router.dismissTo('/')}
    />
  );
}
