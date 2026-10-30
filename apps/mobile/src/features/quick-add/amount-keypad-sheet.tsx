import { useState } from 'react';
import { Modal, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import { homeKeypad, keypadHomeMinor, pressKey, type KeypadKey } from '@6pm/domain';
import { sheetScrim } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Keypad } from '../../ui/keypad';
import { useDesignInsets } from '../../ui/layout/design-insets';
import { FitWidth } from '../../ui/layout/fit-width';
import { useDragDismiss } from '../../ui/motion/use-drag-dismiss';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, display, leading, tabular } from '../../ui/type/fonts';
import { AmountText } from './amount-text';
import { homeDecimalMark, typedParts } from './typed-amount';

/** The design phone's width: the sheet keeps it on a wider screen. */
const SHEET_WIDTH = 402;

/** The sheet's own inks, where the screen under it has its own palette (onboarding). */
export interface KeypadSheetInks {
  readonly sheet: string;
  readonly ink: string;
  readonly key: string;
  readonly button: string;
  readonly buttonInk: string;
}

/**
 * An exact amount in the home currency, typed on Quick add's keypad in a sheet over the screen:
 * the money wheels open it from their centre row. Done hands the amount over and the sheet slides
 * away; a tap behind it or a pull down leaves things as they were.
 */
export function AmountKeypadSheet({
  title,
  decimals = false,
  inks,
  onAmount,
  onClose,
}: {
  readonly title: string;
  /** Inks of the screen it opens over; the look's otherwise. */
  readonly inks?: KeypadSheetInks | undefined;
  /** Offer the decimal key when the home currency has decimals. */
  readonly decimals?: boolean;
  readonly onAmount: (amount: number) => void;
  /** Runs once the sheet has left. */
  readonly onClose: () => void;
}) {
  const { palette } = useTheme();
  const ink = inks ?? {
    sheet: palette.sheetSolid,
    ink: palette.ink,
    key: palette.chipBg,
    button: palette.btnBg,
    buttonInk: palette.btnFg,
  };
  const { t } = useI18n();
  const { bottom, rail } = useDesignInsets();
  const { height } = useWindowDimensions();
  const sheet = useDragDismiss({ area: height, onDismissed: onClose });
  const money = useMoneyFormat();
  const [keys, setKeys] = useState(() => homeKeypad(money.currency));
  const amount = keypadHomeMinor({ ...keys, home: money.currency.code });

  return (
    <Modal transparent visible animationType="none" onRequestClose={sheet.dismiss}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View style={[{ position: 'absolute', inset: 0 }, sheet.backdrop]}>
          <Pressable
            accessibilityLabel={t('quick.cancel')}
            onPress={sheet.dismiss}
            style={{ flex: 1, backgroundColor: sheetScrim }}
          />
        </Animated.View>
        <View
          onLayout={sheet.onLayout}
          // A phone's width at most, clear of the iPhone Duo's side rail.
          style={{ position: 'absolute', left: 0, right: rail, bottom: 0, alignItems: 'center' }}
        >
          <GestureDetector gesture={sheet.drag}>
            <Animated.View
              style={[
                {
                  width: '100%',
                  maxWidth: SHEET_WIDTH,
                  borderTopLeftRadius: 32,
                  borderTopRightRadius: 32,
                  backgroundColor: ink.sheet,
                  paddingTop: 22,
                  paddingHorizontal: 16,
                  paddingBottom: bottom(24),
                  gap: 14,
                },
                sheet.panel,
              ]}
            >
              {/* The sheet colour carries on below, so a pull upward never shows a gap. */}
              <View
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: '100%',
                  height: 240,
                  backgroundColor: ink.sheet,
                }}
              />
              <Text style={{ ...body(17, 650), color: ink.ink, textAlign: 'center' }}>{title}</Text>
              <FitWidth height={52} align="center">
                <AmountText
                  parts={typedParts(keys.digits, money)}
                  numberOfLines={1}
                  style={{
                    ...leading(display(48, 500, -0.02), 52, true),
                    ...tabular,
                    textAlign: 'center',
                    color: ink.ink,
                    opacity: amount > 0 ? 1 : 0.35,
                  }}
                />
              </FitWidth>
              <Keypad
                onPress={(key: KeypadKey) => setKeys((k) => pressKey(k, key))}
                ink={ink.ink}
                keyBg={ink.key}
                decimal={decimals ? homeDecimalMark(money) : undefined}
              />
              <PressScale
                scaleTo={0.97}
                accessibilityRole="button"
                disabled={amount <= 0}
                onPress={() => {
                  haptics.tap();
                  onAmount(amount);
                  sheet.dismiss();
                }}
                style={{
                  height: 56,
                  borderRadius: 99,
                  backgroundColor: ink.button,
                  opacity: amount > 0 ? 1 : 0.4,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ ...body(17, 650), color: ink.buttonInk }}>{t('common.done')}</Text>
              </PressScale>
            </Animated.View>
          </GestureDetector>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
