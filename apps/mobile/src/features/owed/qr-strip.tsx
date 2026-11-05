import { Text, View } from 'react-native';

import { owedInk } from '@6pm/theme';

import { DashedRule } from '../../ui/dashed-rule';
import { PaperEdge } from '../../ui/paper-edge';
import { display, mono } from '../../ui/type/fonts';
import { Avatar, QrCode } from './owed-parts';

/**
 * A strip with a QR on it, to be scanned or sent: whose strips and what they were, the amount, the
 * code, and the bank and name it pays. Drawn untilted; a parent tilts it (a captured view must
 * carry no transform of its own).
 */
export function QrStrip({
  kicker,
  what,
  name,
  amount,
  payload,
  bank,
  holder,
  qrSize = 250,
}: {
  readonly kicker: string;
  readonly what: string;
  readonly name: string | null;
  readonly amount: string;
  readonly payload: string;
  readonly bank: string;
  readonly holder: string;
  readonly qrSize?: number;
}) {
  return (
    <View collapsable={false}>
      <View style={{ transform: [{ scaleY: -1 }] }}>
        <PaperEdge color={owedInk.qrPaper} height={10} shadow={false} />
      </View>
      <View
        style={{
          backgroundColor: owedInk.qrPaper,
          paddingTop: 14,
          paddingHorizontal: 24,
          paddingBottom: 20,
          alignItems: 'center',
          gap: 14,
        }}
      >
        <View
          style={{
            alignSelf: 'stretch',
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <Text
            numberOfLines={1}
            style={{ ...mono(10.5, 400, 0.14), color: owedInk.qrSoft, flexShrink: 1 }}
          >
            {kicker}
          </Text>
          <Text
            numberOfLines={1}
            style={{ ...mono(10.5, 400, 0.14), color: owedInk.qrSoft, flexShrink: 1 }}
          >
            {what}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            alignSelf: 'stretch',
            justifyContent: 'center',
          }}
        >
          <Avatar name={name} size={34} />
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
            style={{ ...display(52, 500, -0.03), color: owedInk.qrInk, flexShrink: 1 }}
          >
            {amount}
          </Text>
        </View>
        <QrCode payload={payload} size={qrSize} />
        <View style={{ alignSelf: 'stretch', gap: 12 }}>
          <DashedRule color={owedInk.qrRule} width={1.5} />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Text
              numberOfLines={1}
              style={{ ...mono(11, 600, 0.08), color: owedInk.qrInk, flexShrink: 1 }}
            >
              {bank}
            </Text>
            <Text
              numberOfLines={1}
              style={{ ...mono(11, 400, 0.08), color: owedInk.qrMuted, flexShrink: 1 }}
            >
              {holder}
            </Text>
          </View>
        </View>
      </View>
      <PaperEdge color={owedInk.qrPaper} height={10} shadow={false} />
    </View>
  );
}
