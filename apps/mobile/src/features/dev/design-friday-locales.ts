import type { Language } from '@6pm/i18n';

/** The Friday's default categories, in the order onboarding lists them. */
export type FridayCategoryId = 'food' | 'drinks' | 'transport' | 'groceries' | 'shopping' | 'gifts';

/**
 * What the Friday's lines are called where a language is spoken: everyday descriptions, never a
 * real shop, brand, bank or wallet.
 */
export interface FridayNames {
  /** Paid in cash and typed at breakfast. */
  readonly breakfast: string;
  /** The morning coffee, paid by card and caught from the bank's alert. */
  readonly coffee: string;
  /** Lunch, paid by QR and never confirmed. */
  readonly lunch: string;
  /** The ride home, from its emailed receipt. */
  readonly ride: string;
  /** The afternoon drink, as it was said to the microphone. */
  readonly treat: string;
  /** The shop on the way home, from a photo of its receipt. */
  readonly shop: string;
  /** The earlier days of the cycle, one spend a day, taken in turn. */
  readonly earlier: {
    /** The big shop, paid by card. */
    readonly supermarket: string;
    /** A lunch out, typed. */
    readonly lunchOut: string;
    /** Cash at the market, as it was said to the microphone. */
    readonly market: string;
    /** The chemist's, paid by card. */
    readonly pharmacy: string;
  };
  readonly bills: {
    readonly rent: string;
    readonly phone: string;
    readonly internet: string;
    readonly power: string;
  };
  /** The dated jar: the season people there save for. */
  readonly jar: string;
}

export const FRIDAY_NAMES: Readonly<Record<Language, FridayNames>> = {
  en: {
    breakfast: 'Bakery',
    coffee: 'Coffee shop',
    lunch: 'Noodle bar',
    ride: 'Ride home',
    treat: 'Iced tea',
    shop: 'Corner store',
    earlier: {
      supermarket: 'Supermarket',
      lunchOut: 'Lunch with friends',
      market: 'Farmers market',
      pharmacy: 'Pharmacy',
    },
    bills: { rent: 'Rent', phone: 'Phone', internet: 'Internet', power: 'Electricity' },
    jar: 'Holidays',
  },
  vi: {
    breakfast: 'Bánh mì trứng',
    coffee: 'Cà phê sữa đá',
    lunch: 'Cơm tấm',
    ride: 'Đặt xe về nhà',
    treat: 'Trà sữa',
    shop: 'Cửa hàng tiện lợi',
    earlier: {
      supermarket: 'Siêu thị',
      lunchOut: 'Ăn trưa với bạn',
      market: 'Đi chợ',
      pharmacy: 'Nhà thuốc',
    },
    bills: { rent: 'Tiền nhà', phone: 'Điện thoại', internet: 'Internet', power: 'Tiền điện' },
    jar: 'Tết',
  },
  de: {
    breakfast: 'Bäckerei',
    coffee: 'Cappuccino',
    lunch: 'Mittagstisch',
    ride: 'Fahrt nach Hause',
    treat: 'Eistee',
    shop: 'Kiosk an der Ecke',
    earlier: {
      supermarket: 'Supermarkt',
      lunchOut: 'Mittagessen mit Freunden',
      market: 'Wochenmarkt',
      pharmacy: 'Drogerie',
    },
    bills: { rent: 'Miete', phone: 'Handy', internet: 'Internet', power: 'Strom' },
    jar: 'Weihnachten',
  },
  es: {
    breakfast: 'Panadería',
    coffee: 'Cafetería',
    lunch: 'Menú del día',
    ride: 'Taxi a casa',
    treat: 'Zumo de naranja',
    shop: 'Tienda de la esquina',
    earlier: {
      supermarket: 'Supermercado',
      lunchOut: 'Comida con amigos',
      market: 'Mercado',
      pharmacy: 'Farmacia',
    },
    bills: { rent: 'Alquiler', phone: 'Móvil', internet: 'Internet', power: 'Luz' },
    jar: 'Navidad',
  },
  fr: {
    breakfast: 'Boulangerie',
    coffee: 'Café crème',
    lunch: 'Plat du jour',
    ride: 'Retour en taxi',
    treat: 'Thé glacé',
    shop: 'Épicerie du coin',
    earlier: {
      supermarket: 'Supermarché',
      lunchOut: 'Déjeuner entre amis',
      market: 'Marché',
      pharmacy: 'Pharmacie',
    },
    bills: { rent: 'Loyer', phone: 'Forfait mobile', internet: 'Internet', power: 'Électricité' },
    jar: 'Noël',
  },
  id: {
    breakfast: 'Bubur ayam',
    coffee: 'Es kopi susu',
    lunch: 'Nasi padang',
    ride: 'Ojek pulang',
    treat: 'Es boba',
    shop: 'Minimarket',
    earlier: {
      supermarket: 'Swalayan',
      lunchOut: 'Makan siang bareng teman',
      market: 'Pasar',
      pharmacy: 'Apotek',
    },
    bills: { rent: 'Kos', phone: 'Paket data', internet: 'WiFi', power: 'Listrik' },
    jar: 'Lebaran',
  },
  ja: {
    breakfast: 'おにぎり',
    coffee: 'カフェラテ',
    lunch: '日替わり定食',
    ride: '帰りのタクシー',
    treat: 'タピオカミルクティー',
    shop: 'コンビニ',
    earlier: {
      supermarket: 'スーパー',
      lunchOut: '友達とランチ',
      market: 'お米と野菜',
      pharmacy: 'ドラッグストア',
    },
    bills: { rent: '家賃', phone: '携帯代', internet: 'ネット代', power: '電気代' },
    jar: 'お正月',
  },
  ko: {
    breakfast: '김밥',
    coffee: '아이스 아메리카노',
    lunch: '김치찌개',
    ride: '집 가는 택시',
    treat: '버블티',
    shop: '편의점',
    earlier: {
      supermarket: '마트 장보기',
      lunchOut: '친구랑 점심',
      market: '시장',
      pharmacy: '약국',
    },
    bills: { rent: '월세', phone: '휴대폰 요금', internet: '인터넷', power: '전기요금' },
    jar: '설날',
  },
  th: {
    breakfast: 'ข้าวเหนียวหมูปิ้ง',
    coffee: 'ลาเต้เย็น',
    lunch: 'ร้านอาหารตามสั่ง',
    ride: 'แท็กซี่กลับบ้าน',
    treat: 'ชานมไข่มุก',
    shop: 'ร้านสะดวกซื้อ',
    earlier: {
      supermarket: 'ซูเปอร์มาร์เก็ต',
      lunchOut: 'มื้อเที่ยงกับเพื่อน',
      market: 'ตลาดสด',
      pharmacy: 'ร้านขายยา',
    },
    bills: { rent: 'ค่าห้อง', phone: 'ค่าโทรศัพท์', internet: 'ค่าเน็ต', power: 'ค่าไฟ' },
    jar: 'สงกรานต์',
  },
  'zh-Hans': {
    breakfast: '包子豆浆',
    coffee: '拿铁',
    lunch: '牛肉面',
    ride: '打车回家',
    treat: '珍珠奶茶',
    shop: '便利店',
    earlier: {
      supermarket: '超市',
      lunchOut: '和朋友吃午饭',
      market: '菜市场',
      pharmacy: '药店',
    },
    bills: { rent: '房租', phone: '话费', internet: '宽带', power: '电费' },
    jar: '春节',
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
 * Round, everyday prices for a salaried person where each home currency is spent, chosen by hand:
 * a month's pay, its bills and a day whose spending ends a little under its line, as the
 * prototype's does. Every language's home currency has a list. A currency with none takes the
 * prototype's amounts by its rough rate.
 */
export const FRIDAY_PRICES: Readonly<Record<string, FridayPrices>> = {
  VND: DESIGN_PRICES,
  USD: {
    income: 4_200,
    futureYou: 400,
    bills: { rent: 1_450, phone: 45, internet: 60, power: 85 },
    jarGoal: 600,
    earlier: 465,
    today: { breakfast: 6.5, coffee: 4.5, lunch: 14, ride: 16, treat: 5.5, shop: 9.5 },
  },
  EUR: {
    income: 2_600,
    futureYou: 250,
    bills: { rent: 780, phone: 20, internet: 35, power: 55 },
    jarGoal: 450,
    earlier: 270,
    today: { breakfast: 3.5, coffee: 3.8, lunch: 11.5, ride: 9, treat: 3.5, shop: 6.5 },
  },
  IDR: {
    income: 9_000_000,
    futureYou: 1_000_000,
    bills: { rent: 2_200_000, phone: 100_000, internet: 350_000, power: 300_000 },
    jarGoal: 1_500_000,
    earlier: 1_030_000,
    today: {
      breakfast: 15_000,
      coffee: 28_000,
      lunch: 30_000,
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
      coffee: 5_500,
      lunch: 10_000,
      ride: 12_000,
      treat: 5_000,
      shop: 16_000,
    },
  },
  THB: {
    income: 32_000,
    futureYou: 3_000,
    bills: { rent: 8_500, phone: 400, internet: 600, power: 1_200 },
    jarGoal: 4_500,
    earlier: 3_800,
    today: { breakfast: 45, coffee: 85, lunch: 70, ride: 95, treat: 55, shop: 155 },
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
