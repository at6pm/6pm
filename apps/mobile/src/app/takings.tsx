import { useRouter } from 'expo-router';
import { useWindowDimensions, View } from 'react-native';

import { useMoney } from '../data/money-provider';
import { TakingsHeader } from '../features/work/takings-step';
import { TakingsPanel } from '../features/work/takings-panel';
import { useDesignInsets } from '../ui/layout/design-insets';
import { FittedSheet } from '../ui/navigation/edge-sheet';

/** Where the canvas's takings sheet starts on the design phone. */
const SHEET_TOP = 226;

/**
 * Today's takings, opened from the takings line on Today: the close's last step on its own. Cancel
 * leaves everything as it was; Keep it keeps the caught transfers and the cash.
 */
export default function Takings() {
  const router = useRouter();
  const { today } = useMoney();
  const { top, bottom } = useDesignInsets();
  const { height } = useWindowDimensions();
  return (
    <FittedSheet>
      <View style={{ height: height - top(SHEET_TOP), paddingBottom: bottom(34) }}>
        <TakingsPanel
          day={today}
          onDone={() => router.back()}
          header={() => <TakingsHeader onCancel={() => router.back()} />}
        />
      </View>
    </FittedSheet>
  );
}
