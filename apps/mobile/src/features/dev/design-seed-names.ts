import type { Language } from '@6pm/i18n';

/**
 * What the seeds that build on the Friday (jars, who owes me, the year, money in, the New Year
 * season) are called where a language is spoken. People are invented, an employer is a plain
 * placeholder, and nothing names a real shop, brand, bank or wallet. A line a bank prints (a
 * sender, a memo) is written the way banks there print it.
 */
export interface SeedNames {
  readonly jars: {
    /** The jar for what cannot be planned, filled each payday. */
    readonly rainyDay: string;
    readonly phone: string;
    readonly bike: string;
    /** The jar shared with a partner. */
    readonly home: string;
    readonly me: string;
    readonly partner: string;
    /** The way to the trip, taken from its jar by hand. */
    readonly bus: string;
    /** Where the trip stays: the jar covers it. */
    readonly hotel: string;
    /** The way back, bigger than the jar. */
    readonly flight: string;
    /** The one buy that takes the month past its plan. */
    readonly bigBuy: string;
  };
  readonly owed: {
    /** The dinner split four ways. */
    readonly dinner: string;
    /** The three who owe a share, as the person wrote them. */
    readonly friends: readonly [string, string, string];
    /** The first of them, as the bank prints who sent money. */
    readonly payer: string;
    readonly memo: string;
  };
  /** Lines the Diary keeps on some closed days. */
  readonly notes: readonly [string, string, string, string];
  readonly moneyIn: {
    /** The goal a gift can be saved in. */
    readonly cushion: string;
    /** Something bought online and sent back. */
    readonly order: string;
    readonly employer: string;
    readonly payMemo: string;
    /** Who sent the gift. */
    readonly giver: string;
    readonly giftMemo: string;
    /** The memo of the year-end bonus. */
    readonly bonusMemo: string;
  };
}

export const SEED_NAMES: Readonly<Record<Language, SeedNames>> = {
  en: {
    jars: {
      rainyDay: 'Rainy day',
      phone: 'New phone',
      bike: 'Bike',
      home: 'Home',
      me: 'Sam',
      partner: 'Alex',
      bus: 'Bus to the coast',
      hotel: 'Beach hotel',
      flight: 'Flights',
      bigBuy: 'New fridge',
    },
    owed: {
      dinner: 'Dinner out',
      friends: ['Mia', 'Noah', 'Liam'],
      payer: 'MIA CARTER',
      memo: 'Dinner, thanks',
    },
    notes: ['Tacos with Mia', 'Rainy, stayed in', 'Birthday dinner', 'Nothing much'],
    moneyIn: {
      cushion: 'Cushion',
      order: 'Online order',
      employer: 'Acme Co',
      payMemo: 'PAYROLL',
      giver: 'Grandma',
      giftMemo: 'Happy birthday',
      bonusMemo: 'YEAR END BONUS',
    },
  },
  vi: {
    jars: {
      rainyDay: 'Quỹ dự phòng',
      phone: 'Điện thoại mới',
      bike: 'Xe đạp',
      home: 'Tổ ấm',
      me: 'Hà',
      partner: 'Bảo',
      bus: 'Xe khách đi Đà Lạt',
      hotel: 'Khách sạn Đà Lạt',
      flight: 'Vé máy bay Đà Lạt',
      bigBuy: 'Tủ lạnh mới',
    },
    owed: {
      dinner: 'Ăn lẩu với bạn',
      friends: ['Linh', 'Nam', 'Huy'],
      payer: 'NGUYEN THU LINH',
      memo: 'NGUYEN THU LINH chuyen tien',
    },
    notes: ['Bún chả với Linh', 'Mưa, ở nhà', 'Sinh nhật mẹ', 'Không có gì nhiều'],
    moneyIn: {
      cushion: 'Quỹ khẩn cấp',
      order: 'Đơn hàng online',
      employer: 'CONG TY MAY XANH',
      payMemo: 'CHUYEN LUONG',
      giver: 'Lan Nguyễn',
      giftMemo: 'Chuc mung sinh nhat em',
      bonusMemo: 'THUONG TET',
    },
  },
  de: {
    jars: {
      rainyDay: 'Notgroschen',
      phone: 'Neues Handy',
      bike: 'Fahrrad',
      home: 'Zuhause',
      me: 'Lena',
      partner: 'Jonas',
      bus: 'Zug ans Meer',
      hotel: 'Hotel am Meer',
      flight: 'Flüge',
      bigBuy: 'Neuer Kühlschrank',
    },
    owed: {
      dinner: 'Abendessen beim Italiener',
      friends: ['Hanna', 'Felix', 'Paul'],
      payer: 'HANNA BECKER',
      memo: 'Abendessen, danke',
    },
    notes: [
      'Pizza mit Hanna',
      'Regen, zu Hause geblieben',
      'Geburtstagsessen',
      'Nichts Besonderes',
    ],
    moneyIn: {
      cushion: 'Rücklage',
      order: 'Online-Bestellung',
      employer: 'Muster GmbH',
      payMemo: 'LOHN/GEHALT',
      giver: 'Oma Inge',
      giftMemo: 'Alles Gute zum Geburtstag',
      bonusMemo: 'JAHRESBONUS',
    },
  },
  es: {
    jars: {
      rainyDay: 'Imprevistos',
      phone: 'Móvil nuevo',
      bike: 'Bici',
      home: 'Casa',
      me: 'Lucía',
      partner: 'Dani',
      bus: 'Tren a la playa',
      hotel: 'Hotel en la playa',
      flight: 'Vuelos',
      bigBuy: 'Frigorífico nuevo',
    },
    owed: {
      dinner: 'Cena de tapas',
      friends: ['Marta', 'Pablo', 'Javi'],
      payer: 'MARTA GARCIA LOPEZ',
      memo: 'Cena, gracias',
    },
    notes: ['Tapas con Marta', 'Lluvia, en casa', 'Cena de cumpleaños', 'Poca cosa'],
    moneyIn: {
      cushion: 'Colchón',
      order: 'Pedido online',
      employer: 'Empresa Ejemplo S.L.',
      payMemo: 'NOMINA',
      giver: 'Abuela Carmen',
      giftMemo: 'Feliz cumpleaños',
      bonusMemo: 'PAGA EXTRA',
    },
  },
  fr: {
    jars: {
      rainyDay: 'Imprévus',
      phone: 'Nouveau téléphone',
      bike: 'Vélo',
      home: 'Maison',
      me: 'Camille',
      partner: 'Hugo',
      bus: 'Train pour la mer',
      hotel: 'Hôtel en bord de mer',
      flight: 'Billets d’avion',
      bigBuy: 'Nouveau frigo',
    },
    owed: {
      dinner: 'Dîner au resto',
      friends: ['Léa', 'Jules', 'Théo'],
      payer: 'LEA MARTIN',
      memo: 'Dîner, merci',
    },
    notes: [
      'Crêpes avec Léa',
      'Pluie, soirée à la maison',
      'Dîner d’anniversaire',
      'Rien de spécial',
    ],
    moneyIn: {
      cushion: 'Matelas de sécurité',
      order: 'Commande en ligne',
      employer: 'Société Exemple',
      payMemo: 'SALAIRE',
      giver: 'Mamie Jeanne',
      giftMemo: 'Joyeux anniversaire',
      bonusMemo: 'PRIME ANNUELLE',
    },
  },
  id: {
    jars: {
      rainyDay: 'Tabungan darurat',
      phone: 'HP baru',
      bike: 'Sepeda',
      home: 'Rumah',
      me: 'Dewi',
      partner: 'Rizky',
      bus: 'Bus ke pantai',
      hotel: 'Penginapan',
      flight: 'Tiket pesawat',
      bigBuy: 'Kulkas baru',
    },
    owed: {
      dinner: 'Makan malam bareng',
      friends: ['Putri', 'Bayu', 'Andi'],
      payer: 'PUTRI LESTARI',
      memo: 'Patungan makan malam',
    },
    notes: ['Bakso bareng Putri', 'Hujan, di rumah aja', 'Makan malam ulang tahun', 'Biasa aja'],
    moneyIn: {
      cushion: 'Uang cadangan',
      order: 'Belanja online',
      employer: 'PT Contoh',
      payMemo: 'GAJI',
      giver: 'Tante Rina',
      giftMemo: 'Selamat ulang tahun',
      bonusMemo: 'BONUS AKHIR TAHUN',
    },
  },
  ja: {
    jars: {
      rainyDay: 'もしもの備え',
      phone: '新しいスマホ',
      bike: '自転車',
      home: 'ふたりの家',
      me: '結衣',
      partner: '颯太',
      bus: '温泉行きのバス',
      hotel: '温泉旅館',
      flight: '航空券',
      bigBuy: '新しい冷蔵庫',
    },
    owed: {
      dinner: '焼肉',
      friends: ['美咲', '健太', '悠人'],
      payer: '佐藤 美咲',
      memo: '焼肉代',
    },
    notes: ['美咲とラーメン', '雨、家でのんびり', '誕生日ディナー', '特になし'],
    moneyIn: {
      cushion: '生活防衛資金',
      order: 'ネット注文',
      employer: '株式会社サンプル',
      payMemo: 'キュウヨ',
      giver: 'おばあちゃん',
      giftMemo: 'お誕生日おめでとう',
      bonusMemo: 'ショウヨ',
    },
  },
  ko: {
    jars: {
      rainyDay: '비상금',
      phone: '새 휴대폰',
      bike: '자전거',
      home: '우리 집',
      me: '지우',
      partner: '민준',
      bus: '바다 가는 버스',
      hotel: '바닷가 숙소',
      flight: '항공권',
      bigBuy: '새 냉장고',
    },
    owed: {
      dinner: '삼겹살 저녁',
      friends: ['김서연', '박도윤', '이하준'],
      payer: '김서연',
      memo: '저녁값',
    },
    notes: ['서연이랑 떡볶이', '비 와서 집콕', '생일 저녁', '별일 없음'],
    moneyIn: {
      cushion: '예비 자금',
      order: '온라인 주문',
      employer: '샘플 주식회사',
      payMemo: '급여',
      giver: '이모',
      giftMemo: '생일 축하해',
      bonusMemo: '설 상여금',
    },
  },
  th: {
    jars: {
      rainyDay: 'เงินสำรองฉุกเฉิน',
      phone: 'มือถือใหม่',
      bike: 'จักรยาน',
      home: 'บ้านของเรา',
      me: 'ฝน',
      partner: 'ต้น',
      bus: 'รถทัวร์ไปทะเล',
      hotel: 'ที่พักริมทะเล',
      flight: 'ตั๋วเครื่องบิน',
      bigBuy: 'ตู้เย็นใหม่',
    },
    owed: {
      dinner: 'หมูกระทะ',
      friends: ['ฟ้าใส', 'ภูมิ', 'นนท์'],
      payer: 'น.ส. ฟ้าใส สุขใจ',
      memo: 'ค่าหมูกระทะ',
    },
    notes: ['ก๋วยเตี๋ยวกับฟ้าใส', 'ฝนตก อยู่บ้าน', 'มื้อวันเกิด', 'ไม่มีอะไรมาก'],
    moneyIn: {
      cushion: 'เงินเก็บสำรอง',
      order: 'สั่งของออนไลน์',
      employer: 'บริษัท ตัวอย่าง จำกัด',
      payMemo: 'เงินเดือน',
      giver: 'คุณยาย',
      giftMemo: 'สุขสันต์วันเกิด',
      bonusMemo: 'โบนัสปลายปี',
    },
  },
  'zh-Hans': {
    jars: {
      rainyDay: '应急金',
      phone: '新手机',
      bike: '自行车',
      home: '小家',
      me: '小雨',
      partner: '阿杰',
      bus: '去海边的大巴',
      hotel: '海边酒店',
      flight: '机票',
      bigBuy: '新冰箱',
    },
    owed: {
      dinner: '火锅',
      friends: ['王小琳', '李南', '陈辉'],
      payer: '王小琳',
      memo: '火锅钱',
    },
    notes: ['和小琳吃烧烤', '下雨，宅家', '生日晚餐', '没什么特别'],
    moneyIn: {
      cushion: '备用金',
      order: '网购订单',
      employer: '示例科技有限公司',
      payMemo: '工资',
      giver: '外婆',
      giftMemo: '生日快乐',
      bonusMemo: '年终奖',
    },
  },
};
