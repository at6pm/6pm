import { Host, Menu, Picker, RNHostView, Text } from '@expo/ui/swift-ui';
import { pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';
import { View } from 'react-native';

import { haptics } from '../haptics';
import { useTheme } from '../theme/theme';
import type { ChoiceMenuProps } from './choice-menu';

export type { ChoiceMenuProps, MenuChoice } from './choice-menu';

/**
 * A row that opens iOS's own pull-down menu: the system's glass, grown out of the row, the chosen
 * line ticked, a finger slid across it picking as it lifts. The row keeps 6pm's look; the menu is
 * Apple's.
 */
export function ChoiceMenu({ choices, selected, onSelect, label, children }: ChoiceMenuProps) {
  const { palette } = useTheme();
  return (
    // The menu takes the look's light or dark, not the phone's.
    <Host
      matchContents={{ vertical: true }}
      colorScheme={palette.dark ? 'dark' : 'light'}
      style={{ alignSelf: 'stretch' }}
    >
      <Menu
        label={
          <RNHostView matchContents={{ vertical: true }}>
            <View accessible accessibilityRole="button" accessibilityLabel={label}>
              {children}
            </View>
          </RNHostView>
        }
      >
        <Picker
          selection={selected}
          onSelectionChange={(key: string) => {
            haptics.tick();
            if (key !== selected) onSelect(key);
          }}
          modifiers={[pickerStyle('inline')]}
        >
          {choices.map((c) => (
            <Text key={c.key} modifiers={[tag(c.key)]}>
              {c.label}
            </Text>
          ))}
        </Picker>
      </Menu>
    </Host>
  );
}
