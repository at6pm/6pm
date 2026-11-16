import type { MerchantRuleRow } from '../contracts/local-rows';

/** The key a merchant's rule is stored under: trimmed, lower case, single spaces. */
export function merchantKeyOf(merchant: string): string {
  return merchant.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** The rule table as a lookup by merchant key. */
export function ruleIndex(rules: readonly MerchantRuleRow[]): ReadonlyMap<string, MerchantRuleRow> {
  return new Map(rules.map((rule) => [rule.merchantKey, rule]));
}

/**
 * The category a rule files a merchant under, when that category still exists. A rule pointing at
 * a category that was archived or deleted is ignored rather than filing money nowhere.
 */
export function ruleCategoryFor(
  rules: ReadonlyMap<string, MerchantRuleRow>,
  merchant: string,
  categoryIds: ReadonlySet<string>,
): string | null {
  const rule = rules.get(merchantKeyOf(merchant));
  return rule && categoryIds.has(rule.categoryId) ? rule.categoryId : null;
}

/**
 * Saying "always" for a merchant: a new rule, or the existing one pointed at the new category.
 * Every time the user confirms it, 6pm has learned it once more. What the rule remembers about the
 * merchant's money in and work stays.
 */
export function learnedRule(
  existing: MerchantRuleRow | null,
  merchant: string,
  categoryId: string,
): MerchantRuleRow {
  return {
    ...(existing ? memoryOf(existing) : {}),
    merchantKey: merchantKeyOf(merchant),
    merchant: merchant.trim(),
    categoryId,
    learnedTimes: (existing?.learnedTimes ?? 0) + 1,
    setByUser: true,
  };
}

/** What a rule remembers beside the category: money in from the sender, and work. */
function memoryOf(rule: MerchantRuleRow): Partial<MerchantRuleRow> {
  const memory: Partial<MerchantRuleRow> = {};
  if (rule.work != null) memory.work = rule.work;
  if (rule.moneyIn != null) memory.moneyIn = rule.moneyIn;
  if (rule.savedTo != null) memory.savedTo = rule.savedTo;
  if (rule.incomeId != null) memory.incomeId = rule.incomeId;
  return memory;
}

/**
 * A sender's rule once money in from it was placed as `place`: the existing rule with the place
 * remembered, or a new one filed under the money's own category. Null with no sender to key it.
 */
export function rememberedRule(
  existing: MerchantRuleRow | null,
  merchant: string,
  categoryId: string,
  place: {
    readonly moneyIn: 'spread' | 'saved' | 'pay';
    readonly savedTo: string | null;
    readonly incomeId: string | null;
  },
): MerchantRuleRow | null {
  const key = merchantKeyOf(merchant);
  if (key === '') return null;
  const base: MerchantRuleRow = existing ?? {
    merchantKey: key,
    merchant: merchant.trim(),
    categoryId,
    learnedTimes: 0,
    setByUser: false,
  };
  return { ...base, moneyIn: place.moneyIn, savedTo: place.savedTo, incomeId: place.incomeId };
}
