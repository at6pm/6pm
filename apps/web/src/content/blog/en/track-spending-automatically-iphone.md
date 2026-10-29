---
title: "How to Track Spending Automatically on iPhone"
description: "Track spending automatically on iPhone with Apple Pay, receipt photos, bank alert emails and voice. Every spend lands in one inbox; close the day at 6pm."
slug: track-spending-automatically-iphone
lang: en
pubDate: 2026-10-21
featured: true
tags: [expense tracking, iphone, apple pay, automation, how-to]
related: [cach-ghi-chi-tieu-tu-dong-tren-iphone, scan-receipts-track-expenses, log-expenses-by-voice, bank-alert-emails-expense-log]
cta: "Every spend, caught. Try 6pm on iPhone."
hero: [close-caught, today]
---

# How to track spending automatically on iPhone (without linking your bank)

To track spending automatically on iPhone, catch each spend at the moment you pay: an Apple Pay automation in Shortcuts, a photo of the receipt, your bank's alert emails forwarded to one address, or a sentence said out loud. In 6pm, all of it lands in one inbox, and at 6pm you swipe once to close the day.

## Why manual tracking dies by week two

You know the arc. Week one, you log every $6 latte. Week two, you start "catching up tonight." Week three, you open the app, see a blank since Wednesday, feel vaguely judged, and delete it.

That's not a willpower problem. Manual logging asks you to be a shopper and a bookkeeper at the same moment. Automatic tracking splits those jobs: the spend is caught when it happens, and the checking happens once, at the end of the day, in about a minute.

That's the whole idea behind 6pm. **Every spend, caught.**

## Bank sync vs. catching spends: the honest trade-off

The usual way to automate is bank sync: you hand an aggregator your bank login and it pulls transactions in. It works well for a lot of people, especially if you want every account and investment in one dashboard.

6pm takes the other road. It never asks for a bank login and can't move a cent. Instead, it catches spends from things you already have: the Apple Pay tap, the paper receipt, the alert email your bank sends anyway, your voice. The upside is no credentials and no aggregator in the middle. The trade-off: you set up a couple of things once, and anything your bank doesn't email you about needs a tap or a sentence.

## Six ways a spend gets caught

<!-- media: diagram-capture -->

### 1. Apple Pay, via a one-time Shortcuts automation

If you pay with your iPhone, this is the big one. Set it up once in the Shortcuts app:

1. Add the "Log to 6pm" shortcut from inside 6pm.
2. In Shortcuts, open **Automation** and tap **+**.
3. Pick the **Wallet** trigger, "When Any Card is tapped" (or choose specific cards).
4. Add **Run Shortcut** and pick "Log to 6pm".
5. Turn off **Show When Run** and go back to save.

From then on, every Apple Pay tap on that iPhone drops into your Inbox with the amount and the merchant. Your coffee is logged before the receipt prints.

### 2. Bank and card alert emails

Many banks and card issuers, Chase, Bank of America and Capital One among them, can email you when your card is used, and shops already email you order receipts. 6pm gives each phone its own address, something like `k7m2qx@at6pm.app`. Point those alerts there, either straight from your bank's alert settings or with a mail filter (Gmail filters on the web, Outlook rules, iCloud Mail rules).

An AI model reads emails that print an amount and tells a real purchase from a transfer between your own accounts, a refund, a failed charge or a promo. The real spends show up in your Inbox; a card charged in dollars stays in dollars. More in [Turn bank alert emails into an expense log](/blog/bank-alert-emails-expense-log).

### 3. Receipt photos

Open **Scan**, point at the receipt. 6pm outlines it live, takes the picture once you hold still, squares it up and reads the total on your phone. Splitting a dinner bill? A receipt of roughly $20 or more can be split between up to 20 people, and only your share is saved. See [Scan receipts to track expenses](/blog/scan-receipts-track-expenses).

### 4. Your voice

"Lunch, twelve dollars." That's the whole entry. Hold the mic, say it like you'd text a friend, and 6pm picks out the amount and the category. Or skip the app entirely: "Hey Siri, log in 6pm," then say the amount when Siri asks. Details in [Log expenses by voice](/blog/log-expenses-by-voice).

### 5. Share to 6pm

Paid someone in a banking app and got a "payment sent" screen? Tap **Share**, pick 6pm. The phone reads the amount and who you paid, you confirm. Same for a screenshot of an order confirmation.

### 6. QR codes and the keypad

Travelling in Asia, where shops show a QR code at the counter? Scan reads payment codes from Vietnam, Thailand, Singapore and more, and keeps the spend in that currency. (6pm only pays Vietnam's VietQR, through your bank app. More in [Track spending from QR payments](/blog/track-spending-from-qr-payments).)

For cash, there's **Quick add**: three taps. Put it in Control Center (iOS 18 and later) or on the Action button (iPhone 15 Pro and later) and you never have to find the app.

## Which method for which moment

| Moment | Best method | Effort |
|---|---|---|
| Coffee, groceries, transit with Apple Pay | Shortcuts automation | Zero, after setup |
| Online orders, subscriptions, card on file | Bank alert emails | Zero, after setup |
| Restaurant bill, paper receipt | Scan | A few seconds |
| Venmo or bank transfer to a person | Share the confirmation, or say it | Two taps |
| Farmers market, tip in cash | Quick add or voice | One sentence |

## No double counting

A $45 dinner paid with Apple Pay might also trigger your bank's alert email. 6pm merges two sightings of the same amount from different sources a few minutes apart into one item marked "Seen 2 ways." You don't play duplicate whack-a-mole.

<!-- media: store-inbox -->

And anything caught but not yet confirmed already counts against today. Your number never pretends that $45 didn't happen.

## 6pm: close the day in a minute

Catching is half of it. The other half is **the close**.

<!-- media: close-swipe-clip -->

At your close time (6pm by default, anywhere from 3pm to 11:45pm), 6pm nudges you. Each spend comes up as a receipt card: **Keep**, **Edit**, or **Not mine**. The last one stamps the day **CLOSED**. Most days it takes under a minute.

Miss a day? Nothing breaks. It waits for you, and the spending already counts. And the 1am taco? It belongs to yesterday: 6pm's money day ends at 4am.

## Next morning: one number

After the close, the morning starts with one number: **Safe to spend today**. It takes your pay, sets aside bills, your pots and Future you first, and spreads what's left evenly to payday. Spend less today and tomorrow grows. Go big and the next few days shrink a little. No category budgets to babysit.

<!-- media: close-tomorrow -->

Want it without opening the app? Put the 6pm widget on your Lock Screen.

## FAQ

### Can my iPhone track spending automatically without connecting my bank?

Yes. With 6pm, Apple Pay taps (via a Shortcuts automation), bank alert emails, receipt photos and voice all log spends without a bank login. 6pm never asks for your bank credentials and can't move money.

### Does Apple Wallet track spending on its own?

Wallet can show recent transactions for some cards, but it doesn't build a budget or a daily number. A Shortcuts automation can pass each tap's amount and merchant to an app like 6pm, which does.

### What about cash and Venmo?

Use Quick add (three taps) or say it out loud. For a Venmo or bank transfer, share the confirmation screen to 6pm.

### Is automatic tracking free in 6pm?

Every capture method and the daily close are free forever. A few cloud features have daily allowances on the free plan (10 cloud voice transcriptions, 50 AI email reads); past those, on-device speech and simpler rules take over. 6pm Max removes the caps.

### Where does my spending data live?

We never store your transactions; they live on your iPhone, encrypted. No bank login. The few things that do leave the phone, like forwarded emails being read, are spelled out in the [privacy policy](/privacy).

### Is 6pm on Android?

iPhone first. Android comes later.

## Try 6pm

6pm is on [the App Store](https://apps.apple.com/app/id6504689878). Everything else is at [at6pm.app](https://at6pm.app).

Every spend, caught.
