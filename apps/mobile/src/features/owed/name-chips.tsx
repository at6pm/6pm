import { useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import type { SymbolName } from '../../ui/icons/symbols.generated';
import { easeOut } from '../../ui/motion/curves';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';
import { Avatar } from './owed-parts';
import type { SplitPerson } from './split-people';

const reflow = LinearTransition.duration(250).easing(easeOut);

function Chip({
  name,
  label,
  on,
  icon,
  onPress,
  accessibilityLabel,
}: {
  readonly name: string | null;
  readonly label: string;
  readonly on: boolean;
  readonly icon: SymbolName;
  readonly onPress?: () => void;
  readonly accessibilityLabel?: string;
}) {
  const { palette } = useTheme();
  return (
    <Animated.View layout={reflow} entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
      <PressScale
        scaleTo={0.95}
        disabled={!onPress}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        style={{
          height: 40,
          paddingLeft: 5,
          paddingRight: 14,
          borderRadius: 99,
          borderWidth: 1.5,
          borderColor: on ? 'transparent' : palette.tabActive,
          backgroundColor: on ? palette.tabActive : 'transparent',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Avatar name={name} size={30} dim={!on} />
        <Text numberOfLines={1} style={{ ...body(15, 650), color: palette.ink, maxWidth: 120 }}>
          {label}
        </Text>
        <Symbol name={icon} size={18} color={palette.ink} style={{ opacity: 0.7 }} />
      </PressScale>
    </Animated.View>
  );
}

/**
 * Who was there: the user, locked in, then each person typed (tap to leave them out or add them
 * back), then the dashed "Name" chip, which becomes a field for one more first name. A name left
 * empty adds someone with no name.
 */
export function NameChips({
  you,
  people,
  onToggle,
  onAdd,
}: {
  readonly you: string;
  readonly people: readonly SplitPerson[];
  readonly onToggle: (key: string) => void;
  readonly onAdd: (name: string | null) => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const [typing, setTyping] = useState(false);
  const [name, setName] = useState('');
  // What is in the field right now: a submit and the blur after it must not add it twice.
  const field = useRef('');
  const type = (text: string) => {
    field.current = text;
    setName(text);
  };
  const take = (): string | null => {
    const typed = field.current.trim();
    type('');
    return typed === '' ? null : typed;
  };
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      <Chip name={you} label={you} on icon="lock" />
      {people.map((p) => {
        const label = p.name ?? t('owed.someone');
        return (
          <Chip
            key={p.key}
            name={p.name}
            label={label}
            on={p.on}
            icon={p.on ? 'close' : 'add'}
            accessibilityLabel={t(p.on ? 'owed.split.remove' : 'owed.split.add', { name: label })}
            onPress={() => {
              haptics.tap();
              onToggle(p.key);
            }}
          />
        );
      })}
      <Animated.View layout={reflow}>
        {typing ? (
          <View
            style={{
              height: 40,
              minWidth: 130,
              paddingHorizontal: 14,
              borderRadius: 99,
              borderWidth: 1.5,
              borderColor: palette.inkSoft,
              justifyContent: 'center',
            }}
          >
            <TextInput
              autoFocus
              value={name}
              onChangeText={type}
              // Return adds the name (or someone not named) and keeps the field for the next.
              submitBehavior="submit"
              onSubmitEditing={() => onAdd(take())}
              onBlur={() => {
                const typed = take();
                if (typed !== null) onAdd(typed);
                setTyping(false);
              }}
              placeholder={t('owed.split.namePlaceholder')}
              placeholderTextColor={palette.inkSoft}
              returnKeyType="next"
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={24}
              style={{ fontSize: 16, fontWeight: '600', color: palette.ink, padding: 0 }}
            />
          </View>
        ) : (
          <PressScale
            scaleTo={0.95}
            accessibilityRole="button"
            onPress={() => {
              haptics.tick();
              setTyping(true);
            }}
            style={{
              height: 40,
              paddingHorizontal: 14,
              borderRadius: 99,
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: palette.tabActive,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Symbol name="person" size={18} color={palette.inkSoft} />
            <Text style={{ ...body(15), color: palette.inkSoft }}>{t('owed.split.name')}</Text>
          </PressScale>
        )}
      </Animated.View>
    </View>
  );
}
