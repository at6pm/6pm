import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import type { RemindChoice } from '@6pm/domain';

import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { easeOut } from '../../ui/motion/curves';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';

const reflow = LinearTransition.duration(250).easing(easeOut);

const CHOICES: readonly RemindChoice[] = ['threeDays', 'week', 'payday'];

function Choice({ label, onPress }: { readonly label: string; readonly onPress: () => void }) {
  const { palette } = useTheme();
  return (
    <PressScale
      scaleTo={0.95}
      accessibilityRole="button"
      onPress={onPress}
      style={{
        // Each as wide as its words and sharing what is left; they wrap at the largest text.
        flexGrow: 1,
        minHeight: 40,
        paddingHorizontal: 10,
        borderRadius: 99,
        borderWidth: 1.5,
        borderColor: palette.tabActive,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text numberOfLines={1} style={{ ...body(14, 650), color: palette.ink }}>
        {label}
      </Text>
    </PressScale>
  );
}

/**
 * "Remind me" under the person sheet's buttons: tapped, it opens into In 3 days, In a week and On
 * payday (and Don't remind me once one is set). The reminder comes at 10:00 on that day and opens
 * these strips with Ask ready; settling them first takes it away. Built from the sheet's own
 * buttons and the split sheet's outlined chips (no design of its own).
 */
export function RemindRow({
  remindAt,
  onRemind,
}: {
  readonly remindAt: Date | null;
  readonly onRemind: (choice: RemindChoice | null) => void;
}) {
  const { palette } = useTheme();
  const { t, weekdayDate } = useI18n();
  const [open, setOpen] = useState(false);
  const choose = (choice: RemindChoice | null) => {
    haptics.tick();
    setOpen(false);
    onRemind(choice);
  };
  return (
    <Animated.View layout={reflow} style={{ marginTop: -10 }}>
      {open ? (
        <Animated.View
          key="choices"
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={{ gap: 8 }}
        >
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {CHOICES.map((choice) => (
              <Choice
                key={choice}
                label={t(`owed.remind.${choice}`)}
                onPress={() => choose(choice)}
              />
            ))}
          </View>
          {remindAt !== null ? (
            <PressScale
              accessibilityRole="button"
              onPress={() => choose(null)}
              style={{ alignSelf: 'center', paddingVertical: 6, paddingHorizontal: 12 }}
            >
              <Text style={{ ...body(14, 600), color: palette.inkSoft }}>
                {t('owed.remind.cancel')}
              </Text>
            </PressScale>
          ) : null}
        </Animated.View>
      ) : (
        <Animated.View key="button" entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
          <PressScale
            scaleTo={0.97}
            accessibilityRole="button"
            onPress={() => {
              haptics.tick();
              setOpen(true);
            }}
            style={{
              minHeight: 50,
              borderRadius: 18,
              backgroundColor: palette.cell,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              paddingHorizontal: 12,
            }}
          >
            <Symbol name={remindAt ? 'notifications' : 'schedule'} size={19} color={palette.ink} />
            <Text numberOfLines={1} style={{ ...body(15, 600), color: palette.ink, flexShrink: 1 }}>
              {remindAt
                ? t('owed.remind.set', { date: weekdayDate(remindAt) })
                : t('owed.remind.button')}
            </Text>
          </PressScale>
        </Animated.View>
      )}
    </Animated.View>
  );
}
