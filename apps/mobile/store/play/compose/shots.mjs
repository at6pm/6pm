// Every large-screen shot of the Play listing: its canvas, caption and capture.
// Captions follow the App Store set (`design/prototype/StoreShot.dc.html`) where a screen has one.

const CAPTIONS = {
  'en-US': {
    home: ['MADE FOR FOLDING PHONES', 'Open it. ', 'October unfolds.'],
    foldClose: ['18:07 · THE CLOSE', 'Close your day ', 'like a book'],
    cover: ['18:07 · TODAY', 'Know what’s ', 'safe to spend today'],
    foldDiary: ['DIARY', 'Open it, and ', 'the diary opens too'],
    stand: ['AT THE COUNTER', 'Stand it up. ', 'Tap as you buy.'],
    foldPlan: ['PLAN', 'A budget planner that ', 'pays you first'],
    today: ['18:07 · TODAY', 'Know what’s ', 'safe to spend today'],
    close: ['18:07 · THE CLOSE', 'Close your day ', 'in one swipe'],
    add: ['ALL DAY', 'Six ways to log, ', 'one Inbox'],
    plan: ['PLAN', 'A budget planner that ', 'pays you first'],
    diary: ['DIARY', 'A money diary ', 'you’ll actually keep'],
  },
  vi: {
    home: ['CHO ĐIỆN THOẠI GẬP', 'Mở ra. ', 'Cả tháng 10 hiện ra.'],
    foldClose: ['18:07 · CHỐT NGÀY', 'Chốt ngày ', 'như lật một cuốn sổ'],
    cover: ['APP QUẢN LÝ CHI TIÊU', 'Biết hôm nay ', 'tiêu được bao nhiêu'],
    foldDiary: ['NHẬT KÝ', 'Mở ra, ', 'nhật ký cũng mở theo'],
    stand: ['Ở QUẦY', 'Dựng máy lên. ', 'Mua tới đâu, bấm tới đó.'],
    foldPlan: ['KẾ HOẠCH', 'Kế hoạch chi tiêu ', 'trả cho bạn trước'],
    today: ['APP QUẢN LÝ CHI TIÊU', 'Biết hôm nay ', 'tiêu được bao nhiêu'],
    close: ['18:07 · CHỐT NGÀY', 'Chốt ngày ', 'bằng một cú vuốt'],
    add: ['CẢ NGÀY', 'Sáu cách ghi, ', 'một hộp thư'],
    plan: ['KẾ HOẠCH', 'Kế hoạch chi tiêu ', 'trả cho bạn trước'],
    diary: ['NHẬT KÝ', 'Nhật ký chi tiêu ', 'bạn sẽ giữ được'],
  },
};

const ACCENT = {
  home: '#ffb38a',
  foldClose: '#ffb38a',
  cover: '#ffb38a',
  foldDiary: '#ff9fbf',
  stand: '#ffc46b',
  foldPlan: '#ffc46b',
  today: '#ffb38a',
  close: '#ffb38a',
  add: '#ffc46b',
  plan: '#ffc46b',
  diary: '#ff9fbf',
};

/** A device `width` wide showing a capture of `ratio` (height over width), centred from `y`. */
function device(canvasWidth, width, ratio, y) {
  return {
    x: Math.round((canvasWidth - width) / 2),
    y,
    width,
    height: Math.round(width * ratio),
    radius: Math.round(width * 0.034),
    bezel: Math.round(width * 0.011),
  };
}

// The folding phone's captures: opened 2448 × 1848, turned upright 1848 × 2448, cover 1248 × 1972.
const OPENED = 1848 / 2448;
const UPRIGHT = 2448 / 1848;
const COVER = 1972 / 1248;

/** Play's foldable slot: one 4:3 and one 1:1 opened, one 10:16 of the cover screen, then more. */
const FOLD = [
  {
    n: '01',
    key: 'home',
    capture: 'fold-home',
    width: 2880,
    height: 2160,
    device: device(2880, 2040, OPENED, 520),
    fold: true,
    lines: 1,
  },
  {
    n: '02',
    key: 'foldClose',
    capture: 'fold-close',
    width: 2160,
    height: 2160,
    type: 1.25,
    device: device(2160, 1900, OPENED, 600),
    fold: true,
    lines: 1,
  },
  {
    n: '03',
    key: 'cover',
    capture: 'cover-today',
    width: 1350,
    height: 2160,
    type: 1.6,
    device: device(1350, 940, COVER, 590),
  },
  {
    n: '04',
    key: 'foldDiary',
    capture: 'fold-diary',
    width: 2880,
    height: 2160,
    device: device(2880, 2040, OPENED, 520),
    fold: true,
    lines: 1,
  },
  {
    n: '05',
    key: 'stand',
    capture: 'fold-stand',
    width: 2160,
    height: 2880,
    type: 1.25,
    device: device(2160, 1640, UPRIGHT, 660),
  },
  {
    n: '06',
    key: 'foldPlan',
    capture: 'fold-plan',
    width: 2880,
    height: 2160,
    device: device(2880, 2040, OPENED, 520),
    fold: true,
    lines: 1,
  },
];

/** Play's tablet slots take 9:16 only; the captures are 10:16 (800 × 1280 dp and 600 × 960 dp). */
const TABLET = [
  { n: '01', key: 'today', capture: 'today' },
  { n: '02', key: 'close', capture: 'close' },
  { n: '03', key: 'add', capture: 'quick-add' },
  { n: '04', key: 'plan', capture: 'plan' },
  { n: '05', key: 'diary', capture: 'diary' },
].map((shot) => ({
  ...shot,
  width: 1620,
  height: 2880,
  type: 1.45,
  device: device(1620, 1340, 1.6, 650),
}));

function shotsFor(lang) {
  const say = (shot, folder, capture) => {
    const [kick, capA, capB] = CAPTIONS[lang][shot.key];
    const { n, key, ...canvas } = shot;
    return {
      ...canvas,
      out: `${lang}/${folder}/${n}.png`,
      capture,
      kick,
      capA,
      capB,
      accent: ACCENT[key],
    };
  };
  return [
    ...FOLD.map((s) => say(s, 'foldable', `${lang}-${s.capture}.png`)),
    ...TABLET.map((s) => say(s, 'tablet-7', `${lang}-tablet7-${s.capture}.png`)),
    ...TABLET.map((s) => say(s, 'tablet-10', `${lang}-tablet10-${s.capture}.png`)),
  ];
}

export const shots = [...shotsFor('en-US'), ...shotsFor('vi')];
