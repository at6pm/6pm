import type { ReactNode } from 'react';
import type { ButtonProps } from '@expo/ui/swift-ui';

import { ChoiceMenu } from './choice-menu';

export interface MenuAction {
  readonly key: string;
  readonly label: string;
  /** The SF Symbol iOS draws beside the line. */
  readonly systemImage: NonNullable<ButtonProps['systemImage']>;
}

export interface ActionMenuProps {
  readonly actions: readonly MenuAction[];
  readonly onAction: (key: string) => void;
  /** What VoiceOver says the button is for. */
  readonly label: string;
  readonly children: ReactNode;
}

/**
 * A button that opens a menu of actions. Where the system lends no menu (iOS uses its own, in
 * `action-menu.ios.tsx`), it is 6pm's own choice menu with nothing ticked.
 */
export function ActionMenu({ actions, onAction, label, children }: ActionMenuProps) {
  return (
    <ChoiceMenu
      choices={actions.map((a) => ({ key: a.key, label: a.label }))}
      selected=""
      onSelect={onAction}
      label={label}
    >
      {children}
    </ChoiceMenu>
  );
}
