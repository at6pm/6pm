import type { Language } from '@6pm/i18n';

/** The Friday's default categories, in the order onboarding lists them. */
export type FridayCategoryId = 'food' | 'drinks' | 'transport' | 'groceries' | 'shopping' | 'gifts';

/** What the Friday's lines are called where a language is spoken. */
export interface FridayNames {
  /** Typed at breakfast. */
  readonly breakfast: string;
  /** The morning coffee, caught from the bank. */
  readonly coffee: string;
  /** The lunch place paid by QR and never confirmed. */
  readonly lunch: string;
  /** The ride home, from an emailed receipt. */
  readonly ride: string;
  /** The afternoon drink, as it was said to the microphone. */
  readonly treat: string;
  /** The corner shop on the way home, from a shared receipt. */
  readonly shop: string;
  /** The one spend of each earlier day of the cycle. */
  readonly earlier: { readonly merchant: string; readonly categoryId: FridayCategoryId };
  readonly bills: {
    readonly rent: string;
    readonly phone: string;
    readonly internet: string;
    readonly power: string;
  };
  /** The dated jar: the season people there save for. */
  readonly jar: string;
  /**
   * The banks whose shared receipts caught the coffee and the shop (a spend's detail line). Null
   * where no bank is named: the coffee arrives as a bank alert and the shop as a shared photo,
   * which the app words without a name.
   */
  readonly receipts: { readonly coffee: string; readonly shop: string } | null;
  /** The unconfirmed QR's detail line; null for the catalogue's own words in the language. */
  readonly unconfirmed: string | null;
}

/** The prototype's own Friday in Hồ Chí Minh City: Vietnamese and English keep it. */
const SAIGON: FridayNames = {
  breakfast: 'Bánh mì Cô Ba',
  coffee: 'Cà phê sữa đá',
  lunch: 'Phở Hòa',
  ride: 'Grab ride home',
  treat: 'Trà sữa',
  shop: 'Circle K',
  earlier: { merchant: 'Lunch', categoryId: 'food' },
  bills: {
    rent: 'Rent',
    phone: 'Viettel phone',
    internet: 'FPT internet',
    power: 'EVN electricity',
  },
  jar: 'Tết',
  receipts: { coffee: 'MB Bank · FT26285XYZ', shop: 'Vietcombank · FT26285ABC' },
  unconfirmed: 'You didn’t say if it went through',
};

/**
 * Everyday names per language. Outside Vietnamese and English they are plain descriptions or
 * invented shops, never a real brand, and no bank is named.
 */
export const FRIDAY_NAMES: Readonly<Record<Language, FridayNames>> = {
  en: SAIGON,
  vi: SAIGON,
  de: {
    breakfast: 'Bäckerei am Markt',
    coffee: 'Cappuccino',
    lunch: 'Mittagstisch Zur Linde',
    ride: 'Fahrt nach Hause',
    treat: 'Eistee',
    shop: 'Kiosk an der Ecke',
    earlier: { merchant: 'Supermarkt', categoryId: 'groceries' },
    bills: { rent: 'Miete', phone: 'Handy', internet: 'Internet', power: 'Strom' },
    jar: 'Weihnachten',
    receipts: null,
    unconfirmed: null,
  },
  es: {
    breakfast: 'Panadería La Espiga',
    coffee: 'Café con leche',
    lunch: 'Bar La Plaza',
    ride: 'Taxi a casa',
    treat: 'Zumo de naranja',
    shop: 'Tienda de la esquina',
    earlier: { merchant: 'Supermercado', categoryId: 'groceries' },
    bills: { rent: 'Alquiler', phone: 'Móvil', internet: 'Internet', power: 'Luz' },
    jar: 'Navidad',
    receipts: null,
    unconfirmed: null,
  },
  fr: {
    breakfast: 'Boulangerie du coin',
    coffee: 'Café crème',
    lunch: 'Bistrot du marché',
    ride: 'Trajet retour',
    treat: 'Jus d’orange',
    shop: 'Épicerie du quartier',
    earlier: { merchant: 'Supermarché', categoryId: 'groceries' },
    bills: { rent: 'Loyer', phone: 'Forfait mobile', internet: 'Internet', power: 'Électricité' },
    jar: 'Noël',
    receipts: null,
    unconfirmed: null,
  },
  id: {
    breakfast: 'Bubur ayam',
    coffee: 'Es kopi susu',
    lunch: 'Warung Bu Sri',
    ride: 'Ojek pulang',
    treat: 'Es boba',
    shop: 'Minimarket',
    earlier: { merchant: 'Belanja harian', categoryId: 'groceries' },
    bills: { rent: 'Kos', phone: 'Paket data', internet: 'Internet', power: 'Listrik' },
    jar: 'Lebaran',
    receipts: null,
    unconfirmed: null,
  },
  ja: {
    breakfast: 'おにぎり',
    coffee: 'カフェラテ',
    lunch: 'さくら食堂',
    ride: '帰りのタクシー',
    treat: 'タピオカミルクティー',
    shop: 'コンビニ',
    earlier: { merchant: 'スーパー', categoryId: 'groceries' },
    bills: { rent: '家賃', phone: '携帯', internet: 'ネット', power: '電気' },
    jar: 'お正月',
    receipts: null,
    unconfirmed: null,
  },
  ko: {
    breakfast: '김밥',
    coffee: '아이스 아메리카노',
    lunch: '정든식당',
    ride: '집 가는 택시',
    treat: '버블티',
    shop: '편의점',
    earlier: { merchant: '장보기', categoryId: 'groceries' },
    bills: { rent: '월세', phone: '휴대폰', internet: '인터넷', power: '전기요금' },
    jar: '설날',
    receipts: null,
    unconfirmed: null,
  },
  th: {
    breakfast: 'หมูปิ้งข้าวเหนียว',
    coffee: 'กาแฟเย็น',
    lunch: 'ร้านตามสั่งป้าแดง',
    ride: 'แท็กซี่กลับบ้าน',
    treat: 'ชานมไข่มุก',
    shop: 'ร้านสะดวกซื้อ',
    earlier: { merchant: 'ตลาดสด', categoryId: 'groceries' },
    bills: { rent: 'ค่าห้อง', phone: 'ค่ามือถือ', internet: 'ค่าเน็ต', power: 'ค่าไฟ' },
    jar: 'สงกรานต์',
    receipts: null,
    unconfirmed: null,
  },
  'zh-Hans': {
    breakfast: '包子铺',
    coffee: '拿铁',
    lunch: '老张面馆',
    ride: '打车回家',
    treat: '珍珠奶茶',
    shop: '便利店',
    earlier: { merchant: '买菜', categoryId: 'groceries' },
    bills: { rent: '房租', phone: '话费', internet: '宽带', power: '电费' },
    jar: '春节',
    receipts: null,
    unconfirmed: null,
  },
};

/** The Friday's amounts in one currency, in whole units of it (3.5 is €3,50). */
export interface FridayPrices {
  /** Take-home pay for the month. */
  readonly income: number;
  readonly futureYou: number;
  readonly bills: {
    readonly rent: number;
    readonly phone: number;
    readonly internet: number;
    readonly power: number;
  };
  /** The dated jar's goal, three paydays away: a third of it is set aside each cycle. */
  readonly jarGoal: number;
  /** Spent in the cycle before the prototype's Friday (nine days of it). */
  readonly earlier: number;
  readonly today: {
    readonly breakfast: number;
    readonly coffee: number;
    readonly lunch: number;
    readonly ride: number;
    readonly treat: number;
    readonly shop: number;
  };
}

/** The prototype's amounts, in đồng. */
export const DESIGN_PRICES: FridayPrices = {
  income: 17_400_000,
  futureYou: 2_000_000,
  bills: { rent: 3_500_000, phone: 100_000, internet: 220_000, power: 380_000 },
  jarGoal: 2_250_000,
  earlier: 2_365_000,
  today: {
    breakfast: 25_000,
    coffee: 29_000,
    lunch: 45_000,
    ride: 38_000,
    treat: 45_000,
    shop: 120_000,
  },
};

/**
 * Round, everyday prices for a salaried person where each home currency is spent: a month's pay,
 * its bills and a day whose spending ends a little under its line, as the prototype's does. A
 * currency with no list here takes the prototype's amounts by its rough rate.
 */
export const FRIDAY_PRICES: Readonly<Record<string, FridayPrices>> = {
  VND: DESIGN_PRICES,
  EUR: {
    income: 2_400,
    futureYou: 250,
    bills: { rent: 780, phone: 20, internet: 35, power: 55 },
    jarGoal: 450,
    earlier: 250,
    today: { breakfast: 2.5, coffee: 3.5, lunch: 9.5, ride: 6, treat: 4, shop: 5.5 },
  },
  IDR: {
    income: 9_000_000,
    futureYou: 1_000_000,
    bills: { rent: 2_200_000, phone: 100_000, internet: 350_000, power: 300_000 },
    jarGoal: 1_500_000,
    earlier: 1_030_000,
    today: {
      breakfast: 15_000,
      coffee: 25_000,
      lunch: 28_000,
      ride: 22_000,
      treat: 18_000,
      shop: 27_000,
    },
  },
  JPY: {
    income: 280_000,
    futureYou: 30_000,
    bills: { rent: 78_000, phone: 3_000, internet: 5_000, power: 7_000 },
    jarGoal: 45_000,
    earlier: 32_000,
    today: { breakfast: 320, coffee: 480, lunch: 950, ride: 1_200, treat: 550, shop: 580 },
  },
  KRW: {
    income: 3_200_000,
    futureYou: 400_000,
    bills: { rent: 650_000, phone: 55_000, internet: 33_000, power: 42_000 },
    jarGoal: 600_000,
    earlier: 410_000,
    today: {
      breakfast: 4_000,
      coffee: 4_500,
      lunch: 9_500,
      ride: 12_000,
      treat: 5_500,
      shop: 16_000,
    },
  },
  THB: {
    income: 32_000,
    futureYou: 3_000,
    bills: { rent: 8_500, phone: 400, internet: 600, power: 1_200 },
    jarGoal: 4_500,
    earlier: 3_800,
    today: { breakfast: 45, coffee: 65, lunch: 70, ride: 95, treat: 55, shop: 155 },
  },
  CNY: {
    income: 12_000,
    futureYou: 1_500,
    bills: { rent: 3_800, phone: 60, internet: 100, power: 150 },
    jarGoal: 1_800,
    earlier: 1_300,
    today: { breakfast: 8, coffee: 18, lunch: 28, ride: 26, treat: 16, shop: 68 },
  },
};
