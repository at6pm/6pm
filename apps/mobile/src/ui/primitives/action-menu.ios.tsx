import { Button, Host, Menu, RNHostView } from '@expo/ui/swift-ui';
import { View } from 'react-native';

import { haptics } from '../haptics';
import { useTheme } from '../theme/theme';
import type { ActionMenuProps } from './action-menu';

export type { ActionMenuProps, MenuAction } from './action-menu';

/**
 * A button that opens iOS's own menu of actions ("Take a photo", "Choose from Photos"): the
 * system's glass grown out of the button, each line with its SF Symbol. The button keeps 6pm's
 * look; the menu is Apple's.
 */
export function ActionMenu({ actions, onAction, label, children }: ActionMenuProps) {
  const { palette } = useTheme();
  return (
    <Host matchContents colorScheme={palette.dark ? 'dark' : 'light'}>
      <Menu
        label={
          <RNHostView matchContents>
            <View accessible accessibilityRole="button" accessibilityLabel={label}>
              {children}
            </View>
          </RNHostView>
        }
      >
        {actions.map((a) => (
          <Button
            key={a.key}
            label={a.label}
            systemImage={a.systemImage}
            onPress={() => {
              haptics.tick();
              onAction(a.key);
            }}
          />
        ))}
      </Menu>
    </Host>
  );
}
