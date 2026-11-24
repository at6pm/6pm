import { BANKS } from '@6pm/domain';
import type { Language } from '@6pm/i18n';

/**
 * What the seeds' tests hold every sample name to. Real names that must never be in sample data,
 * with every bank the app knows: banks and wallets, ride and delivery apps, shop and phone brands.
 */
export const BANNED: readonly string[] = [
  ...BANKS.flatMap((bank) => [bank.shortName, bank.name]),
  ...['MB Bank', 'Vietcombank', 'Techcombank', 'BIDV', 'VietinBank', 'TPBank', 'VPBank'],
  ...['MoMo', 'ZaloPay', 'VNPay', 'ShopeePay', 'Shopee', 'Viettel', 'FPT', 'EVN', 'Grab'],
  ...['Gojek', 'Circle K', '7-Eleven', 'Starbucks', 'Highlands', 'Uber', 'PayPal', 'Venmo'],
  ...['Revolut', 'Chase', 'Sparkasse', 'GoPay', 'OVO', 'DANA', 'PromptPay', 'PayPay'],
  ...['LINE Pay', 'Alipay', 'WeChat', 'Vietjet', 'Manwah', 'Phương Trang', 'Điện Máy Xanh'],
  ...['Bách hoá Xanh', '카카오', '토스', '支付宝', '微信', 'セブン', 'เซเว่น'],
].filter((name) => name.length > 2);

/** The banned names a word carries, whatever its case. */
export function bannedIn(word: string): string[] {
  const lower = word.toLowerCase();
  return BANNED.filter((name) => lower.includes(name.toLowerCase()));
}

/** Letters only Vietnamese writes. */
export const VIETNAMESE = /[ăđơưảãạằẳẵắặầẩẫấậẻẽẹềểễếệỉĩịỏõọồổỗốộờởỡớợủũụừửữứựỳỷỹỵ]/i;

/** The script a language is written in, where it is not Latin. */
export const SCRIPT: Partial<Record<Language, RegExp>> = {
  ja: /[\u3040-\u30ff\u4e00-\u9fff]/,
  ko: /[\uac00-\ud7af]/,
  th: /[\u0e00-\u0e7f]/,
  'zh-Hans': /[\u4e00-\u9fff]/,
};
