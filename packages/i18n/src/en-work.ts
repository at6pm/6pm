/**
 * Work of one's own (the Money Reaches You canvas, boards 1e, 5 and 6): the WORK stamp and which
 * bank is for work, the stamp at the close, today's takings, Today's takings line, the Diary's
 * Work filter, Plan's Work card and how work pays the person.
 */
export const enWork = {
  'work.stamp': 'WORK',
  'work.stampOffered': 'WORK?',
  'work.perDay': '+{amount} A DAY',
  'work.landing': 'From work',

  'work.banks.title': 'Which of these is for work?',
  'work.banks.sub': 'So shop money stays out of your number. Change it any time in Banks.',
  'work.banks.line': 'Tap to stamp.',
  'work.banks.payWith': 'PAY WITH',
  'work.banks.places': { one: '{count} PLACE', other: '{count} PLACES' },
  'work.banks.alwaysSub': 'Shop transfers land here',
  'work.banks.sometimesSub': 'Some shop, some home',
  'work.banks.neverSub': 'Home money',
  'work.key.always': 'Always work',
  'work.key.alwaysSub': 'arrives stamped',
  'work.key.sometimes': 'Sometimes',
  'work.key.sometimesSub': '6pm asks, one tap',
  'work.key.never': 'Never',
  'work.key.neverSub': 'never asked',

  'work.close.hint': 'Right to keep it · tap the stamp if it was for work',
  'work.close.yoursSpend': 'AS YOURS · COUNTS TODAY',
  'work.close.workSpend': 'AS WORK · YOUR DAY STAYS',
  'work.close.yoursIn': 'AS YOURS · INTO YOUR DAYS',
  'work.close.workIn': 'AS WORK · TODAY’S TAKINGS',
  'work.close.rememberedIn': 'Stamped. {name}’s money is work from now on.',
  'work.close.rememberedShop': 'Stamped. {name} is work from now on.',

  'work.takings.title': 'Today’s takings',
  'work.takings.caught': {
    one: 'CAUGHT · {count} TRANSFER',
    other: 'CAUGHT · {count} TRANSFERS',
  },
  'work.takings.cash': 'CASH',
  'work.takings.total': 'TAKINGS',
  'work.takings.costs': 'WORK COSTS TODAY',
  'work.takings.kept': 'KEPT',
  'work.takings.into': 'INTO YOUR DAYS FROM TOMORROW',
  'work.takings.waits': 'WAITS WITH THE WORK',

  'work.today.takings': 'Takings {amount}',
  'work.today.soFar': ' · so far',
  'work.today.row': { one: 'For work · {count} spend', other: 'For work · {count} spends' },
  'work.today.notCounted': 'not counted',

  'work.diary.everything': 'Everything',
  'work.diary.work': 'Work',
  'work.diary.in': 'IN',
  'work.diary.caught': { one: 'CAUGHT · {count} TRANSFER', other: 'CAUGHT · {count} TRANSFERS' },
  'work.diary.week': 'THIS WEEK',
  'work.diary.weekLine': 'IN {in} · OUT {out} · KEPT {kept}',
  'work.diary.empty': 'Nothing stamped for work this week.',
  'work.diary.open': 'Not closed yet',

  'work.card.title': 'Work',
  'work.card.month': '{month}, to the {day}',
  'work.card.in': 'In',
  'work.card.out': 'Out',
  'work.card.kept': 'Kept',
  'work.card.notPaid': 'NOT PAID YET',
  'work.card.days': { one: '{count} day', other: '{count} days' },
  'work.card.diary': 'Work diary',
  'work.card.waiting': 'Not paid to you yet · {amount}',

  'work.money.title': 'Work money',
  'work.money.asItComes': 'As it comes',
  'work.money.asItComesSub':
    'What the shop keeps reaches your days at each close. Most sellers choose this.',
  'work.money.payMyself': 'Pay myself',
  'work.money.payMyselfSub':
    'A set amount every week, like a wage. The rest stays with the shop until you move it.',
  'work.money.note': 'Pay myself asks for an amount and a weekday, then works like weekly pay.',
  'work.money.wage': 'Paid every {weekday}',
  'work.card.owed': 'The shop owes you {amount}',
} as const;
