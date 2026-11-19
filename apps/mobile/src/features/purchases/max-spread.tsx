import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '../../i18n/i18n';
import { Symbol } from '../../ui/icons/symbol';
import type { Page } from '../../ui/layout/fold-form';
import { SystemBars } from '../../ui/layout/system-bars';
import { PressScale } from '../../ui/primitives/press-scale';
import { MAX_PAGE } from './max-colours';

/** The widest the plans and the button are drawn: the phone sheet's own width. */
const OFFER_WIDTH = 402;
/** How far the hero's glow is faded out before the fold, so it does not end on a hard edge. */
const GLOW_FADE = 110;
const GLOW_HEIGHT = 510;

/**
 * 6pm Max on a folding phone opened flat: the whole screen, in two pages either side of the fold.
 * The left page is the pitch and scrolls (the hero, what Max adds, who makes it); the right page
 * is the offer and stays put (the headline for the reason it was opened, the plans, the button,
 * its terms, and Restore, Terms and Privacy). Nothing has to be scrolled out from under the
 * button, as it does on the sheet.
 */
export function MaxSpread({
  left,
  right,
  rail,
  pitch,
  offer,
  onClose,
}: {
  readonly left: Page;
  readonly right: Page;
  /** The iPhone Duo's status column down the right edge, which the right page stops at. */
  readonly rail: number;
  readonly pitch: ReactNode;
  readonly offer: ReactNode;
  readonly onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const edge = rail > 0 ? rail : insets.right;
  return (
    <View style={{ flex: 1, backgroundColor: MAX_PAGE }}>
      <SystemBars dark />
      <ScrollView
        style={{ position: 'absolute', left: left.x, width: left.width, top: 0, bottom: 0 }}
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {pitch}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: GLOW_FADE,
            height: GLOW_HEIGHT + insets.top,
            backgroundImage: `linear-gradient(90deg, rgba(15,12,20,0) 0%, ${MAX_PAGE} 100%)`,
          }}
        />
      </ScrollView>
      <View
        style={{
          position: 'absolute',
          left: right.x,
          right: edge,
          top: insets.top,
          bottom: insets.bottom,
          paddingHorizontal: 16,
          justifyContent: 'center',
        }}
      >
        <View style={{ width: '100%', maxWidth: OFFER_WIDTH, alignSelf: 'center', gap: 20 }}>
          {offer}
        </View>
      </View>
      <CloseButton top={insets.top + 16} right={edge + 16} onClose={onClose} />
    </View>
  );
}

/**
 * The same screen once that phone is folded shut: one column on the cover screen, still the whole
 * screen (it cannot become a sheet while it is open), so it keeps clear of the status bar itself.
 * `children` gets the top inset to pad its scroll with.
 */
export function MaxPage({
  children,
  onClose,
}: {
  readonly children: (topInset: number) => ReactNode;
  readonly onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: MAX_PAGE }}>
      <SystemBars dark />
      {children(insets.top)}
      <CloseButton top={insets.top + 16} right={insets.right + 16} onClose={onClose} />
    </View>
  );
}

function CloseButton({
  top,
  right,
  onClose,
}: {
  readonly top: number;
  readonly right: number;
  readonly onClose: () => void;
}) {
  const { t } = useI18n();
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={t('max.close')}
      scaleTo={0.92}
      onPress={onClose}
      hitSlop={8}
      style={{
        position: 'absolute',
        top,
        right,
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: 'rgba(255,255,255,.1)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Symbol name="close" size={19} color="#ffffff" />
    </PressScale>
  );
}
