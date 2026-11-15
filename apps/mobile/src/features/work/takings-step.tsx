import { Text, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';

import type { LocalDate } from '@6pm/domain';

import { useI18n } from '../../i18n/i18n';
import { useDesignInsets } from '../../ui/layout/design-insets';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';
import { TakingsPanel } from './takings-panel';

/** The sheet's handle, Cancel on the left and its title, as the close's other sheets draw them. */
export function TakingsHeader({ onCancel }: { readonly onCancel: () => void }) {
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
      <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 44 }}>
        <PressScale onPress={onCancel} hitSlop={8} style={{ flex: 1 }}>
          <Text style={{ ...body(17), color: palette.inkSoft }}>{t('quick.cancel')}</Text>
        </PressScale>
        <Text style={{ ...body(17, 650), color: palette.ink }}>{t('work.takings.title')}</Text>
        <View style={{ flex: 1 }} />
      </View>
    </View>
  );
}

/**
 * The last step of a seller's close: Today's takings, rising as a sheet over the close, edge to
 * edge and only as tall as it holds. Keep it (or Cancel, which keeps the caught transfers alone)
 * moves on to the receipt.
 */
export function TakingsStep({
  day,
  onDone,
}: {
  readonly day: LocalDate;
  readonly onDone: () => void;
}) {
  const { palette } = useTheme();
  const { bottom } = useDesignInsets();
  return (
    <View
      style={{
        flex: 1,
        marginTop: 16,
        marginHorizontal: -20,
        marginBottom: -bottom(30),
        justifyContent: 'flex-end',
      }}
    >
      <Animated.View
        entering={SlideInDown.springify().damping(24).stiffness(240)}
        style={{
          // As tall as what it holds, as the canvas's sheet is: Keep it sits under the keypad.
          flexShrink: 1,
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          backgroundColor: palette.sheetSolid,
          boxShadow: '0 -20px 60px rgba(10,5,20,.35)',
          paddingBottom: bottom(34),
          overflow: 'hidden',
        }}
      >
        <TakingsPanel
          day={day}
          onDone={onDone}
          fit
          header={(cancel) => <TakingsHeader onCancel={cancel} />}
        />
      </Animated.View>
    </View>
  );
}
