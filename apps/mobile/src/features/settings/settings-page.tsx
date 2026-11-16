import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';

import { curves } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { Symbol } from '../../ui/icons/symbol';
import { SheetFrame } from '../../ui/navigation/sheet-frame';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';

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
  const { palette } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  return (
    <View style={{ paddingTop: 8, paddingHorizontal: 14, paddingBottom: 6, gap: 6 }}>
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
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          style={{ ...body(17, 650), color: palette.ink, maxWidth: '52%' }}
        >
          {title}
        </Text>
        <PressScale
          accessibilityRole="button"
          onPress={() => router.back()}
          hitSlop={8}
          style={{
            position: 'absolute',
            left: 0,
            paddingVertical: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Symbol name="chevron_left" size={26} color={palette.ink} style={{ marginLeft: -4 }} />
          <Text style={{ ...body(17, 500), color: palette.ink }}>{t('capture.guide.back')}</Text>
        </PressScale>
        <PressScale
          accessibilityRole="button"
          onPress={() => router.dismissTo('/')}
          hitSlop={8}
          style={{ position: 'absolute', right: 0, paddingVertical: 8, paddingHorizontal: 4 }}
        >
          <Text style={{ ...body(17, 650), color: palette.ink }}>{t('common.done')}</Text>
        </PressScale>
      </View>
    </View>
  );
}
