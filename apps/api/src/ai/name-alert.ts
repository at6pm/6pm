import { generate, type AnthropicConfig, type Generated } from './anthropic';
import {
  nameMerchantMaxTokens,
  nameMerchantOutputSchema,
  nameMerchantRequestSchema,
  nameMerchantTimeoutMs,
  type NameMerchantOutput,
  type NameMerchantRequest,
} from './name-merchant';

/**
 * What the phone sends to name who a bank or wallet alert says was paid: the name it read (often
 * none), the alert's words with every number taken out, and the names of the user's categories.
 * The same shape, and the same refusal of any digit, as a shared receipt's.
 */
export const nameAlertRequestSchema = nameMerchantRequestSchema;
export type NameAlertRequest = NameMerchantRequest;
export type NameAlertOutput = NameMerchantOutput;

export const nameAlertSystem = `You read the notification a Vietnamese bank or wallet app sent when money left a person's account, and say who was paid and which of their categories the payment belongs in. Every number in the notification has been removed, so amounts, accounts, times and codes are missing where they stood.

merchant: the shop, brand or person paid, written the way people say it ("Circle K", "Highlands Coffee", "Phở Hòa", "Nguyễn Văn An"). Drop legal words (CÔNG TY, TNHH, CP, JSC, CHI NHÁNH, VN, VIETNAM) and bank words (chuyển khoản, CK, thanh toán, QR). Use title case unless it is a brand written otherwise.
Give an empty merchant when the notification does not say who was paid. The bank or wallet that sent it is never the merchant. A transfer's own words ("ND:", "Nội dung:") often start with the sender's name ("NGUYEN VAN A chuyen tien"): that is the account's owner, not who was paid, so it is never the merchant either. Never guess a name the words do not hold.
category: exactly one of the category names given, copied as written. Pick the one the merchant is most likely for; a person's name with no other hint goes to the closest everyday category.`;

/** The prompt for one alert: the read name, its words, and the categories to choose from. */
export function nameAlertPrompt(request: NameAlertRequest): string {
  return [
    `Name read on the phone: ${request.name === '' ? '(none)' : request.name}`,
    'Notification:',
    ...request.lines.map((line) => `- ${line}`),
    'Categories:',
    ...request.categories.map((name) => `- ${name}`),
  ].join('\n');
}

/** Names who a bank or wallet alert says was paid, choosing among the categories the phone sent. */
export function nameAlert(
  config: AnthropicConfig,
  request: NameAlertRequest,
): Promise<Generated<NameAlertOutput>> {
  return generate(config, {
    system: nameAlertSystem,
    prompt: nameAlertPrompt(request),
    schema: nameMerchantOutputSchema(request.categories),
    maxTokens: nameMerchantMaxTokens,
    timeoutMs: nameMerchantTimeoutMs,
    totalMs: nameMerchantTimeoutMs,
  });
}
