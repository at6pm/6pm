/**
 * What 6pm's notifications say, and Settings › Your day › Notifications. The close reminder's
 * news lines follow the companion's tones (soft, cheeky, roast) and serious mode's plain words;
 * `{lead}` is the reminder's "It’s six." or "It’s {time}.". Lines that leave amounts out are what
 * the lock screen shows until the person allows amounts there. No line shames, sells, or warns
 * about a streak.
 */
export const enNotifications = {
  'notify.channel.payday': 'Payday',
  'notify.channel.capture': 'Capture',
  'notify.channel.reminders': 'Reminders you set',

  'notify.close.leadSix': 'It’s six.',
  'notify.close.leadAt': 'It’s {time}.',

  'notify.close.jarReady.soft': '{lead} Your {jar} jar is ready.',
  'notify.close.jarReady.cheeky': '{lead} Your {jar} jar is ready. Go have a look.',
  'notify.close.jarReady.roast': '{lead} Your {jar} jar is ready. Who knew you had it in you.',
  'notify.close.jarReady.plain': '{lead} Your {jar} jar is ready.',

  'notify.close.countdown.soft': {
    one: '{lead} 1 day to {festival}.',
    other: '{lead} {count} days to {festival}.',
  },
  'notify.close.countdown.cheeky': {
    one: '{lead} 1 day to {festival}. Nearly there.',
    other: '{lead} {count} days to {festival}. The lanterns are going up.',
  },
  'notify.close.countdown.roast': {
    one: '{lead} 1 day to {festival}. Brace your wallet.',
    other: '{lead} {count} days to {festival}. Brace your wallet.',
  },
  'notify.close.countdown.plain': {
    one: '{lead} 1 day to {festival}.',
    other: '{lead} {count} days to {festival}.',
  },
  'notify.close.countdownJar.soft': {
    one: '{lead} 1 day to {festival}. Your {festival} jar has {amount}.',
    other: '{lead} {count} days to {festival}. Your {festival} jar has {amount}.',
  },
  'notify.close.countdownJar.cheeky': {
    one: '{lead} 1 day to {festival}. Your jar’s holding {amount}.',
    other: '{lead} {count} days to {festival}. Your jar’s holding {amount}.',
  },
  'notify.close.countdownJar.roast': {
    one: '{lead} 1 day to {festival}. {amount} in the jar. Guard it.',
    other: '{lead} {count} days to {festival}. {amount} in the jar. Guard it.',
  },
  'notify.close.countdownJar.plain': {
    one: '{lead} 1 day to {festival}. The {festival} jar has {amount}.',
    other: '{lead} {count} days to {festival}. The {festival} jar has {amount}.',
  },

  'notify.close.pay.soft': '{lead} Your pay is waiting to be placed.',
  'notify.close.pay.cheeky': '{lead} Your pay’s in. Come give it a job.',
  'notify.close.pay.roast': '{lead} Your pay landed. Place it before it wanders off.',
  'notify.close.pay.plain': '{lead} Your pay is waiting to be placed.',

  'notify.close.bonus.soft': '{lead} Your {festival} bonus is waiting to be placed.',
  'notify.close.bonus.cheeky': '{lead} Your {festival} bonus is here. Come split it.',
  'notify.close.bonus.roast': '{lead} {festival} bonus landed. Place it before the shops find it.',
  'notify.close.bonus.plain': '{lead} Your {festival} bonus is waiting to be placed.',

  'notify.close.payback.soft': '{lead} {name} paid you back.',
  'notify.close.payback.cheeky': '{lead} {name} paid you back. Friendship intact.',
  'notify.close.payback.roast': '{lead} {name} actually paid you back.',
  'notify.close.payback.plain': '{lead} {name} paid you back.',

  'notify.close.moneyIn.soft': '{lead} Money came in. It’s waiting for the close.',
  'notify.close.moneyIn.cheeky': '{lead} Money came in. Come tell it where to go.',
  'notify.close.moneyIn.roast': '{lead} Money came in. Don’t let it get ideas.',
  'notify.close.moneyIn.plain': '{lead} Money came in. Place it in the close.',

  'notify.close.yearCard.soft': '{lead} Your {year} is ready to look back on.',
  'notify.close.yearCard.cheeky': '{lead} Your {year} is ready. Want to see it?',
  'notify.close.yearCard.roast': '{lead} Your {year}, all of it. Brave enough to look?',
  'notify.close.yearCard.plain': '{lead} Your {year} is ready to look back on.',

  'notify.payday.amounts.soft': 'Payday. {jars} into your jars, {daily} a day to {date}.',
  'notify.payday.amounts.cheeky': 'Payday! {jars} into your jars, {daily} a day to {date}.',
  'notify.payday.amounts.roast':
    'Payday. {jars} saved before you could blink, {daily} a day to {date}.',
  'notify.payday.amounts.plain': 'Payday. {jars} into your jars, {daily} a day to {date}.',
  'notify.payday.noJars': 'Payday. {daily} a day to {date}.',
  'notify.payday.hidden': 'Payday. Your jars are filled.',
  'notify.payday.hiddenNoJars': 'Payday. A new month starts.',

  'notify.firstCatch.amounts.soft':
    'Caught your first one: {amount} · {name}. That’s all it takes.',
  'notify.firstCatch.amounts.cheeky': 'Caught your first one: {amount} · {name}. Easy, right?',
  'notify.firstCatch.amounts.roast': 'Caught your first one: {amount} · {name}. Didn’t even hurt.',
  'notify.firstCatch.amounts.plain': 'First catch: {amount} · {name}.',
  'notify.firstCatch.hidden': 'Caught your first one from {name}. That’s all it takes.',
  'notify.firstCatch.noName': 'Caught your first one. That’s all it takes.',

  'notify.quiet.soft': 'Nothing from {way} in {count} days. Is the automation still on?',
  'notify.quiet.cheeky': 'Nothing from {way} in {count} days. Very calm, or is the automation off?',
  'notify.quiet.roast':
    'Nothing from {way} in {count} days. Either you’re a saint or the automation’s off.',
  'notify.quiet.plain': 'Nothing from {way} in {count} days. Check the automation is still on.',
  'notify.quiet.yourAlerts': 'your bank alerts',

  'notify.owed.one.soft': '{name} still owes you {amount}. Ask when it suits you.',
  'notify.owed.one.cheeky': '{name} still owes you {amount}. Time for a friendly nudge?',
  'notify.owed.one.roast': '{name} still owes you {amount}. Your money misses you.',
  'notify.owed.one.plain': '{name} still owes you {amount}.',
  'notify.owed.oneHidden': '{name} still owes you. Ask when it suits you.',
  'notify.owed.noName': '{amount} is still owed to you.',
  'notify.owed.noNameHidden': 'Someone still owes you. Ask when it suits you.',
  'notify.owed.many': '{count} people still owe you {amount}.',
  'notify.owed.manyHidden': '{count} people still owe you.',

  'settings.notifications': 'Notifications',
  'settings.notificationsOn': 'On',
  'notify.settings.title': 'Notifications',
  'notify.settings.phone': 'On this phone',
  'notify.settings.allowed': 'Allowed',
  'notify.settings.turnOn': 'Turn on',
  'notify.settings.offInSettings': 'Off in Settings',
  'notify.settings.offSub': 'Nothing reaches you until they’re on.',
  'notify.settings.kinds': 'What 6pm sends',
  'notify.kind.close': 'Close reminder',
  'notify.kind.close.sub': 'Every day at {time}, with the day’s news',
  'notify.kind.payday': 'Payday',
  'notify.kind.payday.sub': 'The morning your pay lands, at 08:30',
  'notify.kind.capture': 'Capture',
  'notify.kind.capture.sub': 'Your first catch, and a way gone quiet',
  'notify.kind.reminders': 'Reminders you set',
  'notify.kind.reminders.sub': 'Who owes you, on the day you chose',
  'notify.settings.lockScreen': 'Lock screen',
  'notify.settings.amounts': 'Show amounts on the lock screen',
  'notify.settings.amounts.sub': 'Off, the words leave the numbers out',
  'notify.settings.note':
    'One a day is the ritual: the close reminder carries the day’s news. At most one more a day, and nothing between 22:00 and 08:00 but your close.',

  'owed.remind.button': 'Remind me',
  'owed.remind.threeDays': 'In 3 days',
  'owed.remind.week': 'In a week',
  'owed.remind.payday': 'On payday',
  'owed.remind.set': 'Reminding you {date}',
  'owed.remind.cancel': 'Don’t remind me',
  'owed.remind.toast': 'I’ll remind you {date} at 10:00.',
  'owed.remind.off': 'Reminders you set are off in Settings.',
} as const;
