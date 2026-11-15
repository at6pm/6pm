/**
 * Quick add's two faces: the header's "Spent · Got paid" switch, the tools under the categories,
 * the "Got paid" ticket and its "Who from", and voice that did not catch the amount.
 */
export const enQuickAdd = {
  'quick.face.out': 'Spent',
  'quick.face.in': 'Got paid',
  'quick.tool.photo': 'Photo',
  'quick.tool.split': 'Split',
  'quick.tool.jar': 'From a jar',
  'quick.tool.noJar': 'Not from a jar',
  'quick.todayStays': 'TODAY STAYS {amount}',
  'quick.in.ticket': '6pm · Money in',
  'quick.in.whoFrom': 'Who from',
  'quick.in.name': 'Name',
  'quick.in.who': 'Who was it from?',
  'quick.in.into': 'Came into',
  'quick.in.days': 'Into your days',
  'quick.in.daysLast': 'Into your days, as last time',
  'quick.in.jarLast': 'Into {jar}, as last time',
  'quick.in.pay': 'Your pay',
  'quick.in.payLast': 'Your pay, as last time',
  'quick.in.landing': {
    one: '+{count} DAY · COVERED TO {date}',
    other: '+{count} DAYS · COVERED TO {date}',
  },
  'quick.in.work': 'WORK',
  'voice.missed': 'Didn’t catch that.',
  'voice.heardFirst': 'I heard {said}. Say the amount first: “45k, phở”.',
  'voice.sayFirst': 'Say the amount first: “45k, phở”.',
  'voice.nothingHeard': 'I didn’t hear anything. Is the mic allowed?',
  'voice.tryAgain': 'Try again',
  'voice.toKeypad': 'Back to the keypad',
} as const;
