/**
 * Settings, one way deeper: the heartbeat of each way spending is caught, the values on the rows
 * that open a page (Travel mode, Privacy, Read on this phone), the Privacy page's ledger, and the
 * slips of Read on this phone.
 */
export const enSettingsPages = {
  'catch.health.total': '{count} caught · 14 days',
  'catch.health.axisToday': 'TODAY',
  'catch.health.quietCheck': {
    one: 'Quiet {count} day · tap to check',
    other: 'Quiet {count} days · tap to check',
  },
  'catch.health.setUp': 'Set up',
  'catch.health.setUpWhy.alerts': 'Not set up · catches your bank’s alerts',
  'catch.health.setUpWhy.wallet': 'Not set up · catches a tap to pay',
  'catch.health.setUpWhy.email': 'Not set up · catches emailed receipts',
  'catch.reading.of': '{right} of {total}',
  'catch.reading.explain':
    'Receipts you share or scan are read by this iPhone. A dot marks one you had to fix: its amount or its shop.',
  'catch.reading.ghost': 'Share a receipt and it’s counted here',
  'settings.travel.off': 'Off',
  'settings.travel.auto': 'Automatic',
  'settings.travel.on': 'On · {place}',
  'settings.travel.needsLocation': 'Needs location',
  'settings.privacy.mostly': 'Mostly on this phone',
  'settings.privacy.all': 'All on this phone',
  'privacyPage.headline': 'Your money stays on this iPhone, encrypted.',
  'privacyPage.sub': 'A few things leave it to be worked out. Each one, and where it goes:',
  'privacyPage.subDevice':
    'With AI kept here too, nothing leaves it. Each one, and where it stays:',
  'privacyPage.what': 'WHAT LEAVES',
  'privacyPage.to': 'GOES TO',
  'privacyPage.ask': 'YOUR ASK QUESTION',
  'privacyPage.lines': 'A FEW FACTS FOR A COMPANION LINE',
  'privacyPage.receipts': 'A RECEIPT YOUR PHONE CAN’T READ',
  'privacyPage.voice': 'YOUR VOICE, WHILE YOU SPEAK',
  'privacyPage.spends': 'YOUR LIST OF SPENDS',
  'privacyPage.neverSent': 'NEVER SENT',
  'privacyPage.staysHere': 'STAYS HERE',
  'privacyPage.nothingLeaves': 'NOTHING LEAVES',
  'privacyPage.foot': 'ANTHROPIC DOESN’T TRAIN ON IT · DELETES IT WITHIN 30 DAYS',
  'privacyPage.backup': 'YOUR BACKUP LEAVES ONLY IF YOU TURN IT ON, END-TO-END ENCRYPTED',
  'privacyPage.crashes':
    'CRASH REPORTS GO TO SENTRY WITHOUT AMOUNTS, NAMES OR NOTES · REVENUECAT HANDLES PURCHASES',
  'privacyPage.purchases': 'NO CRASH REPORTS · REVENUECAT HANDLES PURCHASES',
  'privacyPage.keep': 'Keep all of it on this iPhone',
  'privacyPage.keepSub': 'Change AI to on this phone',
  'privacyPage.policy': 'Privacy policy',
  'privacyPage.policyFailed': 'Couldn’t open the page. Try again.',
} as const;
