/** Money that came in: its cards and questions in the close, and where it shows after. */
export const enMoneyIn = {
  'moneyIn.name': 'Money in',
  'moneyIn.hint': 'Right to spread it · up to save it',
  'moneyIn.hintNoSave': 'Right to spread it · down if not yours',
  'moneyIn.card.asIs': 'TOMORROW AS IT IS',
  'moneyIn.card.spread': {
    one: 'SPREAD OVER {count} DAY',
    other: 'SPREAD OVER {count} DAYS',
  },
  'moneyIn.stamp.spread': 'SPREAD',
  'moneyIn.stamp.futureYou': 'FUTURE YOU',
  'moneyIn.btn.spread': 'Spread it',
  'moneyIn.btn.futureYou': 'Future you',
  'moneyIn.undoSpread': 'Spread {name}',
  'moneyIn.undoSaved': 'Saved {name}',
  'moneyIn.pill': 'FUTURE YOU',

  'moneyIn.extra.kicker': '{date} · PAYDAY',
  'moneyIn.extra.title': 'Your pay came in bigger',
  'moneyIn.extra.category': 'Extra on payday',
  'moneyIn.extra.counted': '{amount} counted as your pay',
  'moneyIn.extra.plan': 'Every month now?',
  'moneyIn.extra.planTo': 'Make it {amount}',

  'moneyIn.pay.title': 'Is this your pay?',
  'moneyIn.pay.sub': 'Your plan counts on {income}. If this is it, it’s in your days already.',
  'moneyIn.pay.subExtra':
    'Your plan counts on {income}. If this is it, the extra {extra} comes next for you to place.',
  'moneyIn.pay.yes': 'Yes, that’s my pay',
  'moneyIn.no': 'No, it’s something else',
  'moneyIn.today': 'TODAY',

  'moneyIn.refund.title': 'Is this for your {name}?',
  'moneyIn.refund.sub':
    'If it is, it’s crossed out in your diary and the {amount} goes back into your days.',
  'moneyIn.refund.yes': 'Yes, that’s the refund',
  'moneyIn.refund.line': 'REFUND',

  'moneyIn.payback.title': '{from} paying you back for {name}?',
  'moneyIn.payback.titleNoName': 'Paying you back for {name}?',
  'moneyIn.payback.sub': 'Only your share ever counted, so your number stays as it is.',
  'moneyIn.payback.subClaim': 'Your claim is paid back. Your number stays as it is.',
  'moneyIn.payback.yes': 'Yes, paying me back',
  'moneyIn.payback.line': 'PAID BACK',

  'moneyIn.goesTo.label': 'Where it goes',
  'moneyIn.goesTo.spread': 'Spread it',
  'moneyIn.goesTo.spreadSub': 'Tomorrow becomes {amount}',
  'moneyIn.goesTo.futureYou': 'Future you',
  'moneyIn.goesTo.savedSub': '{from}, then {to}',
  'moneyIn.goesTo.potSub': '{saved} of {goal}, then {after}',
  'moneyIn.goesTo.payback': 'Paying me back',
  'moneyIn.goesTo.paybackSub': 'For a split bill or a work claim',
  'moneyIn.goesTo.effectSpread': 'Every day till payday gets {amount} more.',
  'moneyIn.goesTo.effectSaved': 'Today’s number stays as it is.',
  'moneyIn.goesTo.effectPot':
    'Today’s number stays as it is, and {pot} needs less each month from next payday.',
  'moneyIn.goesTo.effectPayback': 'Your number stays as it is.',
  'moneyIn.goesTo.done': 'Done',

  'moneyIn.diary.spread': 'SPREAD · +{amount} A DAY',
  'moneyIn.diary.saved': 'SAVED · {pot}',
  'moneyIn.diary.pay': 'PAY',
  'moneyIn.diary.refund': 'REFUND',
  'moneyIn.diary.payback': 'PAID BACK',
  'moneyIn.diary.back': 'BACK {date}',
  'moneyIn.row.tag': 'Money in',

  'plan.month.countOn': 'What you can count on',
  'plan.month.countOnHelp':
    'The least that lands each month, after tax. If it varies, go low: anything more comes in through the close.',
} as const;
