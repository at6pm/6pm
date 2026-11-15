import { ScrollView, Text, View } from 'react-native';

import type { RememberedSender } from '@6pm/domain';

import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';
import { Avatar } from '../owed/owed-parts';

/**
 * "Who from" on the money-in face, where the categories were: the senders whose money was placed
 * before, the most recent first, each with their avatar, then "Name" to type one. Picking one
 * fills the ticket with them and what their money did last time.
 */
export function WhoFrom({
  senders,
  picked,
  onPick,
  onName,
}: {
  readonly senders: readonly RememberedSender[];
  /** The merchant key of the sender on the ticket. */
  readonly picked: string;
  readonly onPick: (sender: RememberedSender) => void;
  /** "Name": type a sender on the ticket. */
  readonly onName: () => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  return (
    <View style={{ gap: 8 }}>
      <Text
        style={{
          ...body(13, 600, 0.04),
          textTransform: 'uppercase',
          color: palette.inkSoft,
          paddingHorizontal: 4,
        }}
      >
        {t('quick.in.whoFrom')}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={{ marginHorizontal: -16, flexGrow: 0 }}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
      >
        {senders.map((sender) => {
          const on = sender.merchantKey === picked;
          return (
            <PressScale
              key={sender.merchantKey}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => {
                haptics.tick();
                onPick(sender);
              }}
              style={{
                height: 40,
                paddingLeft: 5,
                paddingRight: 14,
                borderRadius: 99,
                borderWidth: 1.5,
                borderColor: on ? 'transparent' : palette.hair,
                backgroundColor: on ? palette.tabActive : 'transparent',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Avatar name={sender.merchant} size={30} />
              <Text numberOfLines={1} style={{ ...body(15, 650), color: palette.ink }}>
                {sender.merchant}
              </Text>
            </PressScale>
          );
        })}
        <PressScale
          accessibilityRole="button"
          onPress={() => {
            haptics.tick();
            onName();
          }}
          style={{
            height: 40,
            paddingHorizontal: 14,
            borderRadius: 99,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: palette.hair,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Symbol name="person_add" size={18} color={palette.inkSoft} />
          <Text numberOfLines={1} style={{ ...body(15), color: palette.inkSoft }}>
            {t('quick.in.name')}
          </Text>
        </PressScale>
      </ScrollView>
    </View>
  );
}
