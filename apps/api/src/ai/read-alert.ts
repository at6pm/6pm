import { z } from 'zod';

import {
  ALERT_READ_AMOUNTS_MAX,
  ALERT_READ_APP_MAX,
  ALERT_READ_NAME_MAX,
  ALERT_READ_TEXT_MAX,
  holdsLongNumber,
} from '@6pm/domain';

import { generate, type AnthropicConfig, type Generated } from './anthropic';

/**
 * What the phone sends to have one bank or wallet alert read: the app it came from, the alert's
 * words with long numbers dotted out and every printed amount marked «n: …», how many marks
 * there are, the currency the person counts in, and the names of their categories. Nothing else
 * about the person or their money. A text still holding a long number, or missing a mark it
 * counts, is turned away before the model is called.
 */
export const readAlertRequestSchema = z
  .object({
    app: z.string().max(ALERT_READ_APP_MAX),
    text: z.string().trim().min(1).max(ALERT_READ_TEXT_MAX),
    amounts: z.number().int().min(1).max(ALERT_READ_AMOUNTS_MAX),
    home: z.string().regex(/^[A-Z]{3}$/),
    categories: z.array(z.string().trim().min(1).max(40)).max(50),
  })
  .refine((request) => !holdsLongNumber(request.text) && !holdsLongNumber(request.app), {
    message: 'long numbers are not accepted',
  })
  .refine(
    (request) =>
      Array.from({ length: request.amounts }, (_, i) => `«${i + 1}: `).every((mark) =>
        request.text.includes(mark),
      ),
    { message: 'every amount counted must be marked' },
  );
export type ReadAlertRequest = z.infer<typeof readAlertRequestSchema>;

/**
 * The model's answer. It never writes a number: `amount` is one of the marks the phone made
 * ("0" for none), and `category` one of the names the phone sent ("" for none). The model is told
 * the choices but not held to them, so an answer outside them is read as none of them rather
 * than failing the call; a name of any length is taken and cut.
 */
export function readAlertOutputSchema(request: Pick<ReadAlertRequest, 'amounts' | 'categories'>) {
  const marks = Array.from({ length: request.amounts }, (_, i) => String(i + 1));
  return z.object({
    moved: z.enum(['out', 'in', 'none']),
    amount: z.enum(['0', ...marks]).catch('0'),
    merchant: z.string(),
    category: z.enum(['', ...request.categories]).catch(''),
  });
}
export type ReadAlertOutput = z.infer<ReturnType<typeof readAlertOutputSchema>>;

/** What the route answers: the model's answer with the mark as a number. */
export type AlertRead = Omit<ReadAlertOutput, 'amount'> & { readonly amount: number };

export const readAlertSystem = `You read one notification that a bank, card or wallet app showed on a person's phone, and say what it tells about their money. Most are Vietnamese; some are English or another language. You are given the app's name, the notification's text, the currency the person counts in and the names of their categories.

Long numbers (accounts, cards, phone numbers) are hidden as dots. Every amount the text prints is marked «n: amount», where n is the mark's number. You never write an amount yourself: you answer with a mark's number.

moved:
- "out" when the notification says money has left the person's own account, card or wallet: a payment, a purchase, a transfer they sent, a withdrawal, a fee or a bill taken.
- "in" when it says money has arrived: a transfer received, a salary, a refund, a reversal, cash put in, a top-up of this wallet.
- "none" for anything else: a one-time code or a request to confirm, a payment that failed or was declined, a promotion, an offer or a voucher, a reminder or a bill that is due and not yet paid, a statement or a summary of spending over a week or a month, a balance with nothing moved, a sign-in or security notice, news, or words that do not clearly say money moved. When unsure whether money really moved, answer "none".
A "+" before the amount, "ghi có", "nhận", "received", "credited" mean in. A "-" before it, "ghi nợ", "trừ", "thanh toán", "chuyển đến", "paid", "debited", "charged" mean out.

amount: the number of the mark holding the amount that moved in this one transaction. Never the balance left afterwards ("SD", "Số dư", "Số dư cuối", "Balance", "Avail"), a limit, a fee printed beside the amount, a discount, a reward or points. When the same payment is printed in two currencies, take the one in the currency that was charged to the account. "0" when moved is "none", or when no mark holds the amount that moved.

merchant: for "out", the shop, brand or person who was paid; for "in", who sent the money. Write it the way people say it ("Circle K", "Highlands Coffee", "Phở Hòa", "Nguyễn Văn An"): drop legal words (CÔNG TY, TNHH, CP, JSC, CHI NHÁNH, VN, VIETNAM) and bank words (chuyển khoản, CK, thanh toán, QR, MBVCB, FT codes), and use title case unless it is a brand written otherwise. Give an empty merchant when the notification does not say who. The bank or wallet that sent the notification is never the merchant. For "out", a transfer's own words ("ND:", "Nội dung:") often start with the sender's own name ("NGUYEN VAN A chuyen tien"): that is the account's owner, not who was paid, so it is not the merchant unless the words say it is the receiver. Never guess a name the text does not hold.

category: for "out", exactly one of the category names given, copied as written: the one this merchant or these words most likely belong in; a person's name with no other hint goes to the closest everyday category. "" for "in" and "none", and when no category names are given.`;

/** The prompt for one alert. */
export function readAlertPrompt(request: ReadAlertRequest): string {
  return [
    `App: ${request.app === '' ? '(not given)' : request.app}`,
    `The person counts in: ${request.home}`,
    'Notification:',
    request.text,
    'Categories:',
    ...(request.categories.length > 0 ? request.categories.map((name) => `- ${name}`) : ['(none)']),
  ].join('\n');
}

/** The import waits on the phone for at most 7 s; the call, a second attempt included, gets 6 s. */
export const readAlertTimeoutMs = 6_000;
/** Four short fields, plus the model's own thinking, which counts against this too. */
export const readAlertMaxTokens = 1_024;

/** Reads one bank or wallet alert, choosing among the marks and categories the phone sent. */
export async function readAlert(
  config: AnthropicConfig,
  request: ReadAlertRequest,
): Promise<Generated<AlertRead>> {
  const generated = await generate(config, {
    system: readAlertSystem,
    prompt: readAlertPrompt(request),
    schema: readAlertOutputSchema(request),
    maxTokens: readAlertMaxTokens,
    timeoutMs: readAlertTimeoutMs,
    totalMs: readAlertTimeoutMs,
  });
  const { moved } = generated.output;
  const merchant = generated.output.merchant
    .replace(/\s+/gu, ' ')
    .trim()
    .slice(0, ALERT_READ_NAME_MAX);
  // An answer that contradicts itself is read as the more careful one: no money, no mark.
  const amount = moved === 'none' ? 0 : Number(generated.output.amount);
  return {
    ...generated,
    output: {
      moved,
      amount,
      merchant: moved === 'none' ? '' : merchant,
      category: moved === 'out' ? generated.output.category : '',
    },
  };
}
