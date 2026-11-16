import { useEffect, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  FadeIn,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { PotRow } from '@6pm/domain';

import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import type { SymbolName } from '../../ui/icons/symbols.generated';
import { easeOut } from '../../ui/motion/curves';
import { ActionMenu } from '../../ui/primitives/action-menu';
import { ChoiceMenu } from '../../ui/primitives/choice-menu';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';
import { MiniJar } from '../details/from-jar-row';
import { photoActions } from '../details/photo-sources';
import { JarGlyph } from '../pots/jar-outline';
import { jarName } from '../pots/jar-name';
import { firstJarFor } from './wallet-row';

/** A lit tool fills with the button's cream from left to right. */
const FILL_MS = 220;
const NOT_FROM_A_JAR = 'not-from-a-jar';

/**
 * The tools under the categories, three labelled pills 8 pt apart: Photo (the camera or Photos;
 * the print on the ticket is its state), Split (the split sheet opens on the spend once it is
 * kept) and the jar it comes from (named, with what it holds, once picked).
 */
export function QuickTools({
  onPhoto,
  splitting,
  onSplit,
  jars,
  saved,
  fromPot,
  onFromPot,
  amount,
}: {
  readonly onPhoto: (key: string) => void;
  readonly splitting: boolean;
  readonly onSplit: (on: boolean) => void;
  readonly jars: readonly PotRow[];
  readonly saved: Readonly<Record<string, number>>;
  readonly fromPot: string | null;
  readonly onFromPot: (jarId: string | null) => void;
  /** The amount typed: turned on, the jar is the first that holds it all. */
  readonly amount: number;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const jar = fromPot === null ? undefined : jars.find((j) => j.id === fromPot);
  return (
    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
      <ActionMenu
        actions={photoActions({ camera: t('photo.take'), photos: t('photo.choose') })}
        onAction={onPhoto}
        label={t('photo.add')}
      >
        <Pill icon="photo_camera" iconSize={18} label={t('quick.tool.photo')} lit={false} />
      </ActionMenu>
      <PressScale
        accessibilityRole="switch"
        accessibilityLabel={t('owed.quick.split')}
        accessibilityState={{ checked: splitting }}
        onPress={() => {
          haptics.tap();
          onSplit(!splitting);
        }}
      >
        <Pill icon="content_cut" iconSize={17} label={t('quick.tool.split')} lit={splitting} />
      </PressScale>
      {jars.length === 0 ? null : jar ? (
        <ChoiceMenu
          label={t('potsClose.fromJar')}
          choices={[
            ...jars.map((j) => ({
              key: j.id,
              label: `${jarName(j, t)} · ${money.short(saved[j.id] ?? 0)}`,
            })),
            { key: NOT_FROM_A_JAR, label: t('quick.tool.noJar') },
          ]}
          selected={jar.id}
          onSelect={(key) => onFromPot(key === NOT_FROM_A_JAR ? null : key)}
        >
          <Pill
            glyph={<MiniJar jar={jar} saved={saved[jar.id] ?? 0} width={13} height={17} />}
            label={`${jarName(jar, t)} · ${money.short(saved[jar.id] ?? 0)}`}
            lit
          />
        </ChoiceMenu>
      ) : (
        <PressScale
          accessibilityRole="button"
          accessibilityLabel={t('potsClose.fromJar')}
          onPress={() => {
            haptics.tap();
            onFromPot(firstJarFor(jars, saved, amount));
          }}
        >
          <Pill
            glyph={<JarGlyph size={17} color={palette.ink} full={false} />}
            label={t('quick.tool.jar')}
            lit={false}
          />
        </PressScale>
      )}
    </View>
  );
}

/** One tool: 34 pt, its glyph and its word; lit, the button's cream fills it from the left. */
function Pill({
  icon,
  iconSize = 18,
  glyph,
  label,
  lit,
}: {
  readonly icon?: SymbolName;
  readonly iconSize?: number;
  readonly glyph?: ReactNode;
  readonly label: string;
  readonly lit: boolean;
}) {
  const { palette } = useTheme();
  const fill = useSharedValue(lit ? 1 : 0);
  useEffect(() => {
    fill.set(
      withTiming(lit ? 1 : 0, {
        duration: FILL_MS,
        easing: easeOut,
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [lit, fill]);
  const filled = useAnimatedStyle(() => ({ transform: [{ scaleX: fill.get() }] }));
  const ink = lit ? palette.btnFg : palette.ink;
  return (
    <View
      style={{
        height: 34,
        paddingLeft: 10,
        paddingRight: 13,
        borderRadius: 99,
        backgroundColor: palette.chipBg,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            inset: 0,
            backgroundColor: palette.btnBg,
            transformOrigin: 'left center',
          },
          filled,
        ]}
      />
      {glyph ?? (icon ? <Symbol name={icon} size={iconSize} color={ink} /> : null)}
      <Animated.View key={`${lit}`} entering={FadeIn.duration(FILL_MS)}>
        <Text numberOfLines={1} style={{ ...body(14, 650), color: ink }}>
          {label}
        </Text>
      </Animated.View>
    </View>
  );
}
