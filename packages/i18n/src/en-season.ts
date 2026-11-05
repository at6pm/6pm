/**
 * The Lunar New Year season: Tết for those who keep it, Seollal for a phone in Korean and the
 * Spring Festival for one in Simplified Chinese. Each tradition has its own words
 * (`season.festival.*`, `season.envelope.*`); the rest take them as `{festival}`.
 */
export const enSeason = {
  'season.festival.tet': 'Tết',
  'season.festival.seollal': 'Seollal',
  'season.festival.chunjie': 'Chinese New Year',
  /** The money given in envelopes, as each tradition calls it: also the category's name. */
  'season.envelope.tet': 'Lì xì',
  'season.envelope.seollal': 'Sebaetdon',
  'season.envelope.chunjie': 'Red envelopes',

  'season.card.title': 'A jar for {festival}?',
  'season.card.sub': {
    one: '{festival} is a week away. Fill it a little each payday.',
    other: '{festival} is {count} weeks away. Fill it a little each payday.',
  },
  'season.card.open': 'Set it up',
  'season.card.later': 'Not now',

  'season.offer.later': 'Later',
  'season.offer.title': 'A jar for {festival}',
  'season.offer.kicker': {
    one: '{festival} · 1 week',
    other: '{festival} · {count} weeks',
  },
  'season.offer.perPay': {
    one: '{amount} on payday · 1 payday',
    other: '{amount} each payday · {count} paydays',
  },
  'season.offer.ask.gifts': 'Gifts home',
  'season.offer.ask.trip': 'The trip home',
  'season.offer.none': 'None',
  'season.offer.daily': 'Each day until {festival}',
  'season.offer.start': 'Start the {festival} jar',

  'season.bonus.kicker': 'MONEY IN',
  'season.bonus.title': 'Your {festival} bonus?',
  'season.bonus.slipJar': '{festival} jar',
  'season.bonus.jarFull': '{festival} jar · full',
  'season.bonus.jarIn': '{festival} jar · +{amount}',
  'season.bonus.today': 'TODAY',
  'season.bonus.payday': '{date} · PAYDAY',
  'season.bonus.spread': '{amount} spread · +{daily} a day to {date}',
  'season.bonus.allIn': 'All of it goes in the jar',
  'season.bonus.yes': 'Yes, split it like that',
  'season.bonus.yesAll': 'Yes, into the jar',
  'season.bonus.save': 'Save the {amount} instead',

  'season.quick.keypad': 'Keypad',
  'season.quick.voice': 'Voice',
  'season.quick.given': 'Given',
  'season.quick.received': 'Received',
  'season.quick.count': {
    one: '1 envelope × {each}',
    other: '{count} envelopes × {each}',
  },
  'season.quick.total': '= {amount}',
  'season.quick.fromJar': 'From the {festival} jar',
  'season.quick.jarLeft': '{from} → {to} left',
  'season.quick.counts': 'Counts today',
  'season.quick.countsSub': 'No {festival} jar to take it from',
  'season.quick.saved': 'Saved for Future you',
  'season.quick.savedSub': 'Suggested. Won’t raise today’s number.',
  'season.quick.keep': 'Keep it',
  'season.quick.less': 'One envelope fewer',
  'season.quick.more': 'One more envelope',
  'season.quick.merchant': {
    one: '{name} · 1 envelope',
    other: '{name} · {count} envelopes',
  },

  'season.kicker.countdown': {
    one: '1 day to {festival}',
    other: '{count} days to {festival}',
  },
  'season.kicker.holiday': '{festival}, day {day}',
  'season.card.saved': 'Suggested: save it for Future you',
} as const;
