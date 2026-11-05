import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { useI18n } from '../../i18n/i18n';
import { useTheme } from '../../ui/theme/theme';
import { HuePicker } from '../categories/hue-picker';
import { IconPicker } from '../categories/icon-picker';

/**
 * A jar's icon and colour, opened by tapping the big jar in New jar or Edit: the eight colours,
 * then the icon packs (Essentials free, the rest with Max, which opens the Max sheet), in a small
 * well that scrolls on its own so the sheet stays one screen. A preset sets both at once.
 */
export function JarLook({
  icon,
  hue,
  onChange,
}: {
  readonly icon: string;
  readonly hue: number;
  readonly onChange: (patch: { readonly icon?: string; readonly hue?: number }) => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      layout={LinearTransition.duration(250)}
      style={{
        gap: 14,
        padding: 14,
        borderRadius: 22,
        backgroundColor: palette.cell,
      }}
    >
      <HuePicker
        hue={hue}
        label={t('categories.edit.colour')}
        onPick={(h) => onChange({ hue: h })}
      />
      <IconPicker icon={icon} hue={hue} onPick={(i) => onChange({ icon: i })} maxHeight={204} />
    </Animated.View>
  );
}
