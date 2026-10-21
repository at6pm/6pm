---
title: "Turn Bank Alert Emails Into an Expense Log"
description: "Your bank already emails you every card charge. Forward those alerts to one address and 6pm turns them into an expense log, sorted and ready to review."
slug: bank-alert-emails-expense-log
lang: en
pubDate: 2026-10-21
tags: [bank alerts, expense tracking, email forwarding, gmail filters, automation]
related: [tu-dong-ghi-chi-tieu-tu-email-ngan-hang, track-spending-automatically-iphone, scan-receipts-track-expenses, why-expense-tracking-fails]
cta: "Get your own 6pm receipt address, set one filter, and let the alerts do the logging."
hero: [close-caught]
---

# Turn bank alert emails into an expense log

Turn on your bank's purchase alerts by email, then add a mail filter that forwards them to your own 6pm address (something like k7m2qx@at6pm.app). 6pm reads the amount, who you paid and the category, and drops each spend into one Inbox for your evening review. No bank login, no spreadsheet, about ten minutes of setup.

## Why bank alert emails are the quiet hero

Most expense trackers either ask for your bank password through an aggregator, or ask you to type. Alert emails sit in the middle. Your bank already sends them, they arrive within moments of a charge, and they print the amount and usually the merchant.

Several big US banks offer them. Chase lets you get email, text or push alerts for a charge, a refund or other transactions. Bank of America sets up email or text alerts from Online Banking's alert settings, with no fee. Capital One sends purchase alerts by push, email or text above an amount you choose. If your bank is not on that list, look for "Alerts" or "Notifications" in its app or website.

One exception worth knowing: Apple Card alerts are push notifications in Wallet, not emails. For Apple Card and any other card in Wallet, 6pm's Apple Pay automation catches the tap instead (see [how to track spending automatically on iPhone](/blog/track-spending-automatically-iphone)).

It is not just banks. Shop receipts, ride receipts, subscription renewals and order confirmations with a total on them all work the same way.

## Set it up in four steps

### 1. Turn on alerts at your bank

Pick email as the channel and set the threshold low. A $0.01 or $1 minimum catches the coffee too. If you only want big purchases, set it higher and catch small ones another way.

### 2. Copy your 6pm address

In 6pm, open the capture guide (or Settings) and tap **Copy address**. Every phone gets its own. It is tied to an anonymous device ID, not your name, email or phone number.

### 3. Forward only what matters

Forward receipts, not your whole inbox.

**Gmail.** Forwarding cannot be set in the Gmail app, so use Gmail on the web:

1. Click the gear, then **See all settings**.
2. Open **Forwarding and POP/IMAP** and click **Add a forwarding address**. Paste your 6pm address, then **Next** and **Proceed**.
3. Gmail sends a confirmation to your 6pm address, and 6pm shows you the code. Type it next to **Verify**.
4. Open the search options and put your receipt senders in **From**, such as your bank's alert address.
5. Click **Create filter**, tick **Forward it to**, choose your 6pm address, and **Create filter** again.

**Outlook.com.** On the web, open **Settings → Mail → Rules**. Add a rule: when a message is from your receipt senders, forward it to your 6pm address. Outlook may ask you to sign in again first.

**iCloud Mail.** On icloud.com/mail, open **Settings → Rules → +**. If a message is from a receipt sender, forward it to your 6pm address. Add one rule per sender; it can take about 15 minutes to start.

### 4. Test it

Forward an old alert by hand. Open 6pm. It should be sitting in your Inbox.

## What happens to each email

This is the part most apps gloss over, so here it is plainly.

<!-- media: diagram-email -->

- **No amount, no reading.** An email that prints no amount is dropped unread. Newsletters cost you nothing.
- **An AI model reads the rest.** Emails with an amount go to Anthropic's model, which tells a real payment from a transfer between your own accounts, a refund, a failed charge, an order update or a promotion. It reads who you actually paid, the category and the currency. A card charged in euros on holiday stays in euros.
- **Amounts come from the email, never from a guess.** If the amount is not printed in the email, it is not kept.
- **Nothing is stored as an email.** 6pm never stores or logs the email. What was read (amount, currency, merchant, category, time) is held encrypted until your phone collects it, then deleted. Anything your phone has not collected after 30 days is deleted unread.
- **Free has a generous daily allowance.** The model reads 50 emails a day on the free plan; past that, or if the model does not answer, simpler rules read the email instead, so no receipt is lost. 6pm Max removes the daily allowance.

## Double alerts, one spend

Order a $38.40 dinner on DoorDash and you might get two emails: your bank's alert and DoorDash's receipt. 6pm treats two different senders with the same amount, within three minutes of each other, as one spend seen two ways. When the bank alert names no shop, the merged spend keeps the name from the receipt. If you also paid with Apple Pay, that tap joins the same item. Two emails from the same sender never merge, so two real $5 coffees stay two.

<!-- media: store-inbox -->

## A week of alerts, closed in a minute

Say you forward Chase alerts and a couple of shop receipts. By Thursday evening your Inbox looks like this:

| Source | Spend | Amount |
|---|---|---|
| Bank alert | Trader Joe's | $47.12 |
| Bank alert + receipt | DoorDash, Thai Basil | $38.40 |
| Shop receipt | Target order | $26.99 |
| Bank alert | Refund, Amazon | not a spend, skipped |

<!-- media: close-swipe-clip -->

At 6pm your phone nudges you. Each spend comes up as a receipt: Keep, Edit or Not mine. The last one stamps the day **CLOSED**. Tomorrow morning, **Safe to spend today** already accounts for all of it.

## Privacy, in one paragraph

Receipt email is the one capture method where a server reads your mail, so it is opt-in by nature: nothing arrives unless you forward it. Emails go to Anthropic only, which does not train on them and deletes them within 30 days. Anyone who knows the address can send to it, so share it only with your bank and the shops you buy from. If you switch 6pm to keep AI on your iPhone (Settings → AI), receipt email turns off. We never store your transactions; they live on your iPhone, encrypted. No bank login.

## FAQ

### Which banks send transaction alert emails?

Many do. Chase, Bank of America and Capital One all offer transaction or purchase alerts by email, set up in their app or website. Apple Card sends push notifications instead.

### Will promotional emails show up as spending?

No. Emails without an amount are dropped unread, and emails with one that turn out to be promotions, refunds or transfers between your own accounts are recognised and not logged as spends.

### Is receipt email free in 6pm?

Yes. The free plan includes 50 AI reads a day, then simpler rules read the rest. 6pm Max has no daily allowance.

### Does 6pm read my whole inbox?

No. It only sees what you forward to your 6pm address. Use a filter so only receipt senders are forwarded.

### What if the alert and the shop receipt both arrive?

Same amount from two different senders within three minutes becomes one spend, seen two ways, and keeps the shop's name if the alert had none.

## Try 6pm

6pm arrives on the App Store on Friday 6 November 2026 at 18:00 Vietnam time (6:00 a.m. Eastern). Want it now? Join the public TestFlight beta: [testflight.apple.com/join/a8UrvT5P](https://testflight.apple.com/join/a8UrvT5P). More at [at6pm.app](https://at6pm.app).

Every spend, caught.

Sources: [Chase alerts](https://www.chase.com/digital/alerts), [Bank of America alerts](https://info.bankofamerica.com/en/digital-banking/alerts), [Capital One security and alerts](https://www.capitalone.com/learn-grow/privacy-security/your-security-matters), [6pm privacy policy](https://at6pm.app/privacy).
