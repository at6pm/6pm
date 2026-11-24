/**
 * The cards worth sharing: the quiet Share chip where each is offered, the preview sheet, and the
 * words printed on each card (My month, the close streak, My split, My year, a full jar). Kickers
 * are uppercased on the card. "Jar" is the pot, as everywhere else.
 */
export const enShareCards = {
  'shareCards.chip': 'Share',
  'shareCards.chipSplit': 'Share your split',
  'shareCards.sheetTitle': 'Share',
  'shareCards.story': 'Story',
  'shareCards.post': 'Post',
  'shareCards.showAmounts': 'Show amounts',
  'shareCards.hiddenSub': 'Hidden: only shares and counts',
  'shareCards.shownSub': 'Shown: every amount on the card',
  'shareCards.shareImage': 'Share image',
  'shareCards.streak.reveal': {
    one: '{count} evening in a row',
    other: '{count} evenings in a row',
  },
  'shareCards.split.kicker': 'My split · {month}',
  'shareCards.split.lead': 'Pay',
  'shareCards.split.jars': { one: ': {count} jar', other: ': {count} jars' },
  'shareCards.split.bills': 'Bills',
  'shareCards.split.free': 'Free money',
  'shareCards.year.title': 'My {year}, itemised.',
  'shareCards.year.receipt': '6pm · year',
  'shareCards.year.no': 'Nº {year}',
  'shareCards.year.closed': 'Evenings closed',
  'shareCards.year.noSpend': 'No-spend days',
  'shareCards.year.setAside': 'Set aside',
  'shareCards.year.biggest': 'Biggest pot',
  'shareCards.year.none': 'None yet',
  'shareCards.year.today': 'Your {year}',
  'shareCards.year.todaySub': 'evenings closed this year',
  'shareCards.year.todayTap': 'Tap for the whole year',
  'shareCards.goal.kicker': 'Saved up · {month}',
  'shareCards.goal.title': '{jar}: {amount} saved',
  'shareCards.habit.kicker': 'My {month}',
  'shareCards.habit.title': '{name} ×{count}.',
  'shareCards.habit.spent': '{amount} in all',
  'shareCards.habit.switchHint': 'Tap the headline to switch between the place and the category',
  'shareCards.streak.title': {
    one: '{count} evening, books closed.',
    other: '{count} evenings in a row, books closed.',
  },
} as const;
