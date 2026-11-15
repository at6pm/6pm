import { BANKS, channelOfSource } from '@6pm/domain';

import type { WitnessLine } from '../../data/capture-answers';
import type { I18n } from '../../i18n/i18n';

/** Labels of a mail's domain that only say where it is registered: `com`, `vn` in `com.vn`. */
const REGISTRY = new Set(['com', 'net', 'org', 'co', 'io', 'app', 'vn', 'example', 'mail', 'www']);

/** A shop's mail domain as its name: `hoadon.shopee.vn` is "Shopee"; any other name as it is. */
function shopName(name: string): string {
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(name)) return name;
  const core = name
    .toLowerCase()
    .split('.')
    .filter((label) => !REGISTRY.has(label))
    .at(-1);
  return core ? `${core.charAt(0).toUpperCase()}${core.slice(1)}` : name;
}

/** Who spoke, as Details names them: "You", "MB", "Apple Pay", "Shopee". */
function whoOf(line: WitnessLine, t: I18n['t']): string {
  const witness =
    line.witness ??
    (line.source === 'alert'
      ? 'bank'
      : line.source === 'applePay'
        ? 'wallet'
        : line.source === 'email' || line.source === 'shared'
          ? 'shop'
          : 'person');
  switch (witness) {
    case 'person':
      return t('details.who.you');
    case 'bank': {
      const name = line.name ?? line.bank;
      if (!name) return t('details.who.bank');
      return BANKS.find((bank) => bank.shortName === name)?.id ?? name;
    }
    case 'wallet':
      return line.name ?? t('details.who.bank');
    case 'shop':
      return line.name ? shopName(line.name) : t('details.who.shop');
  }
}

/** One witness as the "Seen by" line says it: "MB alert 10:31", "Shopee receipt 10:34". */
export function witnessLabel(line: WitnessLine, t: I18n['t'], time: string): string {
  const who = whoOf(line, t);
  const way = (() => {
    switch (line.channel ?? channelOfSource(line.source)) {
      case 'alert':
        return t('details.way.alert', { who });
      case 'email':
        return t('details.way.email', { who });
      case 'shared':
      case 'receiptPhoto':
        return t('details.way.receipt', { who });
      case 'wallet':
        return t('details.way.wallet', { who });
      case 'qr':
        return t('details.way.qr');
      case 'typed':
        return t('details.way.typed', { who });
      case 'voice':
        return t('details.way.voice', { who });
      case 'cash':
        return t('details.way.cash', { who });
      case 'import':
        return t('details.way.import', { who });
    }
  })();
  return `${way} ${time}`;
}
