import type { Entry } from '../catalogue-types';
import type { enTravel } from '../en-travel';

// The Live Activity lines sit after a large amount, so they read as its tail (残り, オーバー).
export const jaTravel: { readonly [Key in keyof typeof enTravel]: Entry } = {
  'travel.settings.label': '旅行モード',
  'travel.settings.sub': '海外では自動でオン',
  'travel.settings.locationOff': '海外にいると分かるように、位置情報を許可してください',
  'travel.settings.stale': '{date}時点のレート',
  'travel.settings.noRates': '今日のレートを待っています',
  'travel.pill': '{place} · {symbol}（下に{home}）',
  'travel.activity.place': '{place} · 今日',
  'travel.activity.left': '残り{amount}',
  'travel.activity.over': '{amount}オーバー',
  'travel.activity.of': '/ {line} · ≈ {vnd}',
  'travel.activity.leftOf': '残り（{line}中） · ≈ {home}',
  'travel.activity.overOf': 'オーバー（{line}超） · ≈ {home}',
  'travel.activity.leftHome': '残り · ≈ {home}',
  'travel.activity.overHome': 'オーバー · ≈ {home}',
  'travel.activity.log': '{symbol}で記録',
  'travel.quick.underneath': '≈ {amount}',
  'travel.quick.underneathStale': '≈ {amount} · {date}時点のレート',
  'travel.quick.currency': '通貨を切り替え',
  // A đồng home: Vietnamese banks pay the region's QRs. Any other home pays the local way.
  'travel.scan.body':
    '銀行アプリで支払ってください。ほとんどのベトナムの銀行で使えます。6pmは{symbol}で記録し、下に₫を表示します。',
  'travel.scan.bodyAway':
    '現地のいつもの方法で支払ってください。6pmは{symbol}で記録し、下に{home}を表示します。',
  'travel.scan.keep': '支払い済み · {amount}を残す',
  'travel.scan.logIn': '{symbol}で記録',
};
