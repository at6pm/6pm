/**
 * Ways of catching spending that ride on iOS: bank and wallet alerts read by a Shortcuts
 * automation, Back Tap and Siri. The labels inside the pictured screens are iOS's own, as its
 * English screens show them.
 */
export const enCaptureAlerts = {
  'native.intents.catchAlert.title': 'Catch a bank alert',
  'native.intents.catchAlert.description':
    'Reads a bank or wallet notification on your iPhone and leaves the money that moved in 6pm’s Inbox. Codes, failed payments and promotions are skipped.',
  'native.intents.catchAlert.alertTitle': 'Title',
  'native.intents.catchAlert.subtitle': 'Subtitle',
  'native.intents.catchAlert.body': 'Body',
  'native.intents.catchAlert.date': 'Date',
  'native.intents.catchAlert.app': 'App',

  'capture.alerts.name': 'Bank alerts',
  'capture.alerts.sub': 'Your bank and wallet alerts log themselves',
  'capture.alerts.headline': 'Your bank and wallet alerts log themselves.',
  'capture.alerts.time': 'About a minute, once',
  'capture.alerts.step1': 'In Shortcuts, make an automation for notifications',
  'capture.alerts.step1Chip': 'Automation → Notification',
  'capture.alerts.step2': 'Choose your bank and wallet apps',
  'capture.alerts.step3': 'Make it run “Catch a bank alert”',
  'capture.alerts.step3Chip': 'Catch a bank alert',
  'capture.alerts.tip':
    'Codes, failed payments and promos are skipped. A payment Apple Pay or an email already caught isn’t added twice.',
  'capture.alerts.privacy': 'Alerts are read on your iPhone and never leave it.',
  'capture.alerts.cameIn': '{amount} in',
  'capture.alerts.skip.code': 'a code, skipped',
  'capture.alerts.skip.failed': 'failed payment, skipped',
  'capture.alerts.skip.promo': 'promo, skipped',
  'capture.alerts.skip.balance': 'balance notice, skipped',
  'capture.alerts.skip.security': 'security notice, skipped',
  'capture.alerts.skip.unread': 'not a payment, skipped',
  'capture.alerts.actionAdd': 'Get the 6pm shortcut',
  'capture.alerts.actionOpen': 'Open Shortcuts',

  'capture.walk.alerts.s1Title': 'Open Automation and tap +',
  'capture.walk.alerts.s1Body':
    'In Shortcuts, tap Library, then Automation, then +. If you see “Describe a shortcut”, tap Edit.',
  'capture.walk.alerts.s2Title': 'Add the Notification trigger',
  'capture.walk.alerts.s2Body':
    'In the panel at the bottom, tap Automation, then Notification. The card “When I receive a notification from App” appears.',
  'capture.walk.alerts.s3Title': 'Choose your banks and wallets',
  'capture.walk.alerts.s3Body':
    'Tap App and pick your bank. Tap + to add each other bank and wallet app you pay with.',
  'capture.walk.alerts.s4Title': 'Add “Catch a bank alert”',
  'capture.walk.alerts.s4Body':
    'Tap Search, type “bank alert” and tap Catch a bank alert from 6pm. Set Title, Subtitle, Body and Date to the Notification’s own.',
  'capture.walk.alerts.s5Title': 'Keep Notify off, then go back',
  'capture.walk.alerts.s5Body':
    'Tap › on the trigger: leave Automation on and Notify off, so alerts are caught quietly. Going back saves it.',
  'capture.walk.alerts.s6Title': 'Try it',
  'capture.walk.alerts.s6Body':
    'Pay a little from one of those apps. When its alert arrives, the payment is in your Inbox.',
  'capture.walk.alerts.l1Title': 'Add the 6pm shortcut',
  'capture.walk.alerts.l1Body':
    'Tap “Get the 6pm shortcut” above, then Add Shortcut. It’s called “Catch a bank alert”.',
  'capture.walk.alerts.l2Body':
    'Open it in Shortcuts, tap App at the top and pick your bank, then + for each other bank and wallet.',
  'capture.walk.alerts.mistake1':
    'Title, Body or Date left empty. Tap each and pick the Notification’s own, or alerts log nothing.',
  'capture.walk.alerts.mistake2':
    'Notify turned on. Every alert then pings you a second time instead of being caught quietly.',
  'capture.walk.alerts.mistake3':
    'Only one app chosen. Tick each bank and wallet you use, MoMo and ZaloPay included.',

  'capture.walk.ios.notification': 'Notification',
  'capture.walk.ios.notificationEx': '“When I receive a notification from News”',
  'capture.walk.ios.whenNotified': 'When I receive a notification from',
  'capture.walk.ios.notificationTitle': 'Notification › Title',
  'capture.walk.ios.notificationBody': 'Notification › Body',
  'capture.walk.ios.notificationDate': 'Notification › Date',
  'capture.walk.ios.notificationSummary': 'When I receive a notification from MB Bank or MoMo',
  'capture.walk.ios.alertSearch': 'bank alert',
  'capture.walk.ios.now': 'now',
  'capture.walk.test.alertRow': 'Bank alert · to review',

  'capture.siri.name': 'Say it to Siri',
  'capture.siri.sub': 'Say “Log in 6pm”, then what it was',
  'capture.siri.headline': 'Log a spend out loud, without opening 6pm.',
  'capture.siri.time': 'Nothing to set up',
  'capture.siri.step1': 'Say “Hey Siri, log in 6pm”',
  'capture.siri.step1Chip': 'Log in 6pm',
  'capture.siri.step2': 'Siri asks how much. Say what and how much',
  'capture.siri.step2Chip': '“phở forty-five k”',
  'capture.siri.step3': 'It’s in today’s spending straight away',
  'capture.siri.step3Chip': 'Today',
  'capture.siri.tip':
    'Siri doesn’t speak Vietnamese yet, so talk to it in English. To say it in Vietnamese, hold Quick add.',

  'capture.backTap.name': 'Back Tap',
  'capture.backTap.sub': 'Tap the back of your iPhone twice to log a spend',
  'capture.backTap.headline': 'Two taps on the back, and Quick add is open.',
  'capture.backTap.time': 'Thirty seconds, once',
  'capture.backTap.step1': 'Open Settings, then Accessibility, Touch, Back Tap',
  'capture.backTap.step1Chip': 'Back Tap',
  'capture.backTap.step2': 'Choose Double Tap, then Quick add from 6pm',
  'capture.backTap.step2Chip': 'Double Tap → Quick add',
  'capture.backTap.step3': 'Tap the back of your iPhone twice. Quick add opens',
  'capture.backTap.step3Chip': 'Quick add',
  'capture.backTap.tip':
    'Don’t see Quick add? In Shortcuts, tap +, add 6pm’s Quick add and save it. Triple Tap works too.',
  'capture.walk.ios.notificationSubtitle': 'Notification › Subtitle',
  'capture.walk.ios.notify': 'Notify',
  'capture.walk.ios.cancel': 'Cancel',
} as const;
