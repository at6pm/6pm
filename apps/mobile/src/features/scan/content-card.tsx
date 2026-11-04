import { Linking, Platform, Text, View } from 'react-native';

import type { QrContent } from '@6pm/domain';

import { useI18n } from '../../i18n/i18n';
import { Symbol } from '../../ui/icons/symbol';
import type { SymbolName } from '../../ui/icons/symbols.generated';
import { body } from '../../ui/type/fonts';
import { CardButton, ScanCard } from './scan-card';
import { scanColours as c } from './scan-colours';

interface Action {
  readonly label: string;
  readonly run: () => void;
}

/** What the card shows for a code, and what it offers to do. */
interface Plan {
  readonly icon: SymbolName;
  readonly title: string;
  readonly headline: string;
  readonly detail: string | null;
  readonly primary: Action | null;
  /** Everything the code says, for Copy; null when the primary action already copies it. */
  readonly copy: string | null;
}

function phoneUri(number: string): string {
  return `tel:${number.replace(/[^\d+]/g, '')}`;
}

function query(params: Readonly<Record<string, string | null>>, first: '?' | '&' = '?'): string {
  const pairs = Object.entries(params)
    .filter((entry): entry is [string, string] => entry[1] !== null)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`);
  return pairs.length === 0 ? '' : `${first}${pairs.join('&')}`;
}

/**
 * A code that is not a payment, read and offered for what it is: a link to open, Wi-Fi sign-in to
 * copy, a number to call, a place to see, a contact to reach. Nothing opens by itself; every
 * action is a tap, and only web links open in a browser.
 */
export function ContentCard({
  content,
  onCopy,
  onRetry,
  onFail,
}: {
  readonly content: QrContent;
  /** Puts `text` on the clipboard and says so. */
  readonly onCopy: (text: string) => void;
  readonly onRetry: () => void;
  /** The phone had nothing to open it with. */
  readonly onFail: () => void;
}) {
  const { t } = useI18n();
  const open = (url: string) => () => void Linking.openURL(url).catch(onFail);
  const plan = planFor(content, t, open, onCopy);

  return (
    <ScanCard>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            backgroundColor: c.alertTile,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Symbol name={plan.icon} size={27} color={c.alertGlyph} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ ...body(13, 600), color: c.cardBody }}>{plan.title}</Text>
          <Text numberOfLines={3} selectable style={{ ...body(18, 650, -0.02), color: c.cardInk }}>
            {plan.headline}
          </Text>
          {plan.detail === null ? null : (
            <Text
              numberOfLines={2}
              selectable
              style={{ ...body(14), lineHeight: 19.6, color: c.cardBody }}
            >
              {plan.detail}
            </Text>
          )}
        </View>
      </View>
      {plan.primary ? (
        <CardButton solid label={plan.primary.label} onPress={plan.primary.run} />
      ) : null}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {plan.copy === null ? null : (
          <CardButton
            flex={1}
            label={t('scan.content.copy')}
            onPress={() => onCopy(plan.copy ?? '')}
          />
        )}
        <CardButton flex={1} label={t('scan.tryAgain')} onPress={onRetry} />
      </View>
    </ScanCard>
  );
}

function planFor(
  content: QrContent,
  t: ReturnType<typeof useI18n>['t'],
  open: (url: string) => () => void,
  onCopy: (text: string) => void,
): Plan {
  switch (content.kind) {
    case 'link':
      return {
        icon: 'link',
        title: t('scan.content.link'),
        headline: content.host,
        detail: content.url,
        primary: { label: t('scan.content.open'), run: open(content.url) },
        copy: content.url,
      };
    case 'wifi': {
      const password = content.password;
      return {
        icon: 'wifi',
        title: t('scan.content.wifi'),
        headline: content.network,
        detail:
          password === null
            ? t('scan.content.wifiOpen')
            : t('scan.content.wifiPassword', { password }),
        primary:
          password === null
            ? null
            : { label: t('scan.content.copyPassword'), run: () => onCopy(password) },
        copy: password === null ? content.network : null,
      };
    }
    case 'phone':
      return {
        icon: 'call',
        title: t('scan.content.phone'),
        headline: content.number,
        detail: null,
        primary: { label: t('scan.content.call'), run: open(phoneUri(content.number)) },
        copy: content.number,
      };
    case 'sms':
      return {
        icon: 'chat',
        title: t('scan.content.sms'),
        headline: content.number,
        detail: content.body,
        primary: {
          label: t('scan.content.message'),
          run: open(
            `sms:${content.number.replace(/[^\d+]/g, '')}${query(
              { body: content.body },
              Platform.OS === 'ios' ? '&' : '?',
            )}`,
          ),
        },
        copy: content.number,
      };
    case 'email':
      return {
        icon: 'mail',
        title: t('scan.content.email'),
        headline: content.address,
        detail: content.subject,
        primary: {
          label: t('scan.content.write'),
          run: open(
            `mailto:${content.address}${query({ subject: content.subject, body: content.body })}`,
          ),
        },
        copy: content.address,
      };
    case 'place': {
      const where = `${content.latitude},${content.longitude}`;
      return {
        icon: 'place',
        title: t('scan.content.place'),
        headline: content.label ?? where,
        detail: content.label === null ? null : where,
        primary: {
          label: t('scan.content.maps'),
          run: open(`https://www.google.com/maps/search/?api=1&query=${where}`),
        },
        copy: where,
      };
    }
    case 'contact': {
      const phone = content.phones[0];
      const email = content.emails[0];
      const lines = [content.name, content.organisation, ...content.phones, ...content.emails];
      const everything = lines.filter((line): line is string => line !== null).join('\n');
      return {
        icon: 'person',
        title: t('scan.content.contact'),
        headline: content.name ?? phone ?? email ?? '',
        detail: [content.organisation, phone, email]
          .filter((line): line is string => line !== null && line !== undefined)
          .join(' · '),
        primary:
          phone !== undefined
            ? { label: t('scan.content.call'), run: open(phoneUri(phone)) }
            : email !== undefined
              ? { label: t('scan.content.write'), run: open(`mailto:${email}`) }
              : null,
        copy: everything,
      };
    }
    case 'text':
      return {
        icon: 'qr_code_2',
        title: t('scan.content.text'),
        headline: content.text,
        detail: null,
        primary: { label: t('scan.content.copy'), run: () => onCopy(content.text) },
        copy: null,
      };
  }
}
