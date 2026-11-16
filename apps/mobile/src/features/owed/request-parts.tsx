import { localDateOf, type OwedPerson, type OwedRow } from '@6pm/domain';
import { requestInk } from '@6pm/theme';
import { Text, View } from 'react-native';

import { useI18n } from '../../i18n/i18n';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, mono } from '../../ui/type/fonts';
import { askedOn, requestsOf, shortDay } from './request-words';

/**
 * The line under a card's strips, once a request is on the list: when the oldest request was
 * asked (or last reminded) and its code, or "from a split" for a friend's shares.
 */
export function RequestLine({
  person,
  rows,
}: {
  readonly person: OwedPerson;
  readonly rows: ReadonlyMap<string, OwedRow>;
}) {
  const { palette } = useTheme();
  const { t, language } = useI18n();
  const request = requestsOf(person, rows)[0];
  const text = !request
    ? t('request.line.split')
    : request.remindedAt
      ? t('request.line.reminded', {
          date: shortDay(localDateOf(new Date(request.remindedAt)), language),
          code: request.code ?? '',
        })
      : t('request.line.asked', {
          date: shortDay(askedOn(request), language),
          code: request.code ?? '',
        });
  return (
    <Text numberOfLines={1} style={{ ...body(12.5), color: palette.inkSoft }}>
      {text}
    </Text>
  );
}

/** "+ Ask to be paid", under the list: a strip for a client and a job, without a split. */
export function AskToBePaid({ onPress }: { readonly onPress: () => void }) {
  const { palette } = useTheme();
  const { t } = useI18n();
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 }}>
      <PressScale
        scaleTo={0.97}
        accessibilityRole="button"
        onPress={onPress}
        style={{
          height: 56,
          borderRadius: 99,
          backgroundColor: palette.btnBg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <Symbol name="add" size={20} color={palette.btnFg} />
        <Text style={{ ...body(17, 650), color: palette.btnFg }}>{t('request.ask')}</Text>
      </PressScale>
    </View>
  );
}

/** A request's code as a transfer note prints it: indigo on a lavender chip. */
export function CodeChip({ code, size = 11 }: { readonly code: string; readonly size?: number }) {
  return (
    <View
      style={{
        paddingHorizontal: 4,
        borderRadius: 3,
        backgroundColor: requestInk.codeChip,
      }}
    >
      <Text style={{ ...mono(size, 600, 0.08), color: requestInk.codeInk }}>{code}</Text>
    </View>
  );
}
