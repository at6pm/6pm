import { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { birthdayPassword, daysInMonth } from '@6pm/domain';

import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { useTheme } from '../../ui/theme/theme';
import { body, display, families } from '../../ui/type/fonts';
import { FileCard, ImportFoot, PillButton, PrivacyLine } from './import-parts';

/** "05011970" → "05 / 01 / 1970", as far as it is typed. */
function spaced(digits: string): string {
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
  return parts.join(' / ');
}

/** The day, month and year typed, when they make a real birthday. */
function birthdayOf(digits: string): { day: number; month: number; year: number } | null {
  if (digits.length !== 8) return null;
  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const year = Number(digits.slice(4));
  if (month < 1 || month > 12 || year < 1900 || year > 2100) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;
  return { day, month, year };
}

/**
 * MoMo locks its emailed history with the account holder's birthday (ddmmyyyy). Asked as a
 * birthday, typed as digits; it opens the file on this phone and is never kept.
 */
export function ImportPassword({
  wrong,
  onUnlock,
}: {
  readonly wrong: boolean;
  readonly onUnlock: (password: string) => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const [digits, setDigits] = useState('');
  const birthday = birthdayOf(digits);
  useEffect(() => {
    if (wrong) haptics.tap();
  }, [wrong]);
  const open = () => {
    if (!birthday) return;
    haptics.tap();
    onUnlock(birthdayPassword(birthday.day, birthday.month, birthday.year));
  };
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingTop: 12, paddingHorizontal: 16, gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 4 }}>
          <View>
            <FileCard ext="XLSX" tilt={-6} />
            <View style={{ position: 'absolute', right: -6, top: -6 }}>
              <Symbol name="lock" size={18} fill={1} color={palette.accent} />
            </View>
          </View>
          <Text style={{ flex: 1, ...display(22, 500), lineHeight: 25.3, color: palette.ink }}>
            {t('import.password.title')}
          </Text>
        </View>
        <Text
          style={{ ...body(13.5), lineHeight: 18.9, color: palette.inkSoft, paddingHorizontal: 4 }}
        >
          {t('import.password.body')}
        </Text>
        <View
          style={{
            borderRadius: 22,
            backgroundColor: palette.cell,
            boxShadow: palette.cardShadow,
            paddingVertical: 14,
            paddingHorizontal: 16,
            gap: 6,
          }}
        >
          <Text
            style={{ ...body(13, 600, 0.04), textTransform: 'uppercase', color: palette.inkSoft }}
          >
            {t('import.password.label')}
          </Text>
          <TextInput
            autoFocus
            value={spaced(digits)}
            onChangeText={(text) => {
              const next = text.replace(/\D/g, '').slice(0, 8);
              setDigits(next);
              // The number pad has no return key: a whole, real birthday opens the file at once.
              const typed = birthdayOf(next);
              if (typed && next !== digits) {
                haptics.tap();
                onUnlock(birthdayPassword(typed.day, typed.month, typed.year));
              }
            }}
            onSubmitEditing={open}
            keyboardType="number-pad"
            textContentType="birthdate"
            autoComplete="birthdate-full"
            accessibilityLabel={t('import.password.label')}
            placeholder={t('import.password.placeholder')}
            placeholderTextColor={palette.inkSoft}
            selectionColor={palette.accent}
            style={{
              padding: 0,
              paddingVertical: 4,
              fontFamily: families.display,
              fontSize: 30,
              fontWeight: '500',
              fontVariant: ['tabular-nums'],
              color: palette.ink,
            }}
          />
        </View>
        {wrong ? (
          <Animated.Text
            entering={FadeIn.duration(200)}
            style={{
              ...body(13.5, 600),
              lineHeight: 18.9,
              color: palette.accent,
              paddingHorizontal: 4,
            }}
          >
            {t('import.password.wrong')}
          </Animated.Text>
        ) : null}
      </View>
      <ImportFoot>
        <PillButton enabled={birthday !== null} label={t('import.password.open')} onPress={open} />
        <PrivacyLine />
      </ImportFoot>
    </View>
  );
}

/** "Opening…": the file card breathing while the phone reads (or unlocks) the file. */
export function ImportOpening({ locked }: { readonly locked: boolean }) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const t1 = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) return;
    t1.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [reduceMotion, t1]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -6 * t1.value }, { rotate: `${-6 + 4 * t1.value}deg` }],
  }));
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <Animated.View style={style}>
        <FileCard ext={locked ? 'XLSX' : ''} />
      </Animated.View>
      <Text accessibilityLiveRegion="polite" style={{ ...body(15, 600), color: palette.inkSoft }}>
        {locked ? t('import.unlocking') : t('import.opening')}
      </Text>
    </View>
  );
}
