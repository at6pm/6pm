import type { SymbolName } from '../../ui/icons/symbols.generated';

/**
 * Merchants recognised by name get their own glyph; everything else wears its category's. The
 * bakery, the coffee and the tea are known by their word in each of the app's languages.
 */
const MERCHANT_ICONS: readonly [RegExp, SymbolName][] = [
  [/phở|bún|hủ tiếu/, 'ramen_dining'],
  [/bánh mì|bakery|bäckerei|panadería|boulangerie/, 'bakery_dining'],
  [
    /cà phê|coffee|highlands|caf[eé]|kaffee|cappuccino|latte|kopi|カフェ|コーヒー|커피|아메리카노|กาแฟ|ลาเต้|咖啡|拿铁/,
    'coffee',
  ],
  [
    /trà|\btea\b|\btee\b|eistee|\bth?é(?![a-zà-ÿ])|\bteh\b|boba|ティー|タピオカ|버블티|밀크티|ชานม|奶茶/,
    'emoji_food_beverage',
  ],
  [/grab|ride/, 'two_wheeler'],
  [/circle k|gs25/, 'local_convenience_store'],
  [/parking/, 'local_parking'],
  [/mía|juice/, 'local_drink'],
  [/xôi|cơm/, 'rice_bowl'],
  [/market|veggies/, 'shopping_basket'],
  [/gift/, 'redeem'],
];

export function merchantIcon(merchant: string, categoryIcon: SymbolName): SymbolName {
  const name = merchant.toLowerCase();
  return MERCHANT_ICONS.find(([pattern]) => pattern.test(name))?.[1] ?? categoryIcon;
}
