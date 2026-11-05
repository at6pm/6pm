import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';

/**
 * Quick add's "Split it next" switch (scissors), beside its "From a jar" one: on, Keep saves the
 * spend and opens the split sheet on it.
 */
export function SplitSwitch({
  on,
  onToggle,
}: {
  readonly on: boolean;
  readonly onToggle: () => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  return (
    <PressScale
      accessibilityRole="switch"
      accessibilityLabel={t('owed.quick.split')}
      accessibilityState={{ checked: on }}
      hitSlop={8}
      onPress={() => {
        haptics.tap();
        onToggle();
      }}
      style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: on ? palette.btnBg : palette.chipBg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Symbol name="content_cut" size={17} color={on ? palette.btnFg : palette.ink} />
    </PressScale>
  );
}
