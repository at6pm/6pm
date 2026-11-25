# Translating the site

The home page, privacy and terms speak the app's ten languages. Each language's words live in its
own files. A new language starts as a copy of the English text, marked
`// Translation pending: English text.` (or `<!-- … -->` in the legal documents). Replace the text,
then delete that line.

## The files one language owns

For Japanese (`ja`), all under `apps/web/src/`:

| File                              | What it holds                                                                  |
| --------------------------------- | ------------------------------------------------------------------------------ |
| `data/site/copy-ja.ts`            | The home page: meta title and description, nav, every section, FAQ, footer     |
| `data/site/surfaces-copy-ja.ts`   | The "Before six" section: Lock Screen, Dynamic Island, widgets, Siri, buttons  |
| `data/site/duo-copy-ja.ts`        | The iPhone Duo section and its phone screens                                    |
| `data/site/duo-amounts-ja.ts`     | The iPhone Duo screens' amounts, and how they are written (`duoMoneyJa`)        |
| `data/site/live-lines-ja.ts`      | Lines the page writes in the browser: the clock, countdowns, form messages      |
| `data/legal-copy-ja.ts`           | The words around the legal documents, and how their dates are written          |
| `legal/privacy.ja.md`             | The privacy policy                                                             |
| `legal/terms.ja.md`               | The terms of use                                                               |

The other languages use the same names with their code: `vi`, `zh-hans`, `ja`, `ko`, `th`, `id`,
`es`, `fr`, `de`. Simplified Chinese is `zh-hans` in the `.ts` files and `zh-Hans` in the legal
documents (`privacy.zh-Hans.md`).

Change nothing else. The shared files (`copy.ts`, `langs.ts`, `config.ts`, `prices.ts`, `legal.ts`,
the components) are the same for every language; if your language needs one changed, say so
instead.

## What stays as it is

- **Prices of 6pm Max.** They come from `config.ts` (`maxPrices`) and are written by `prices.ts` in
  your market's money. Do not type them into the copy. `pricing.zero` (the free plan's `$0`) and
  `pricing.storeNote` (which market the prices are for) are yours to write.
- **Names.** 6pm, 6pm Max, Apple Pay, App Store, Google Play, TestFlight, iPhone, iPhone Duo, Siri,
  Dynamic Island, Odd Eggs. Use Apple's own names for its features in your language where Apple has
  one (Lock Screen, Action button, Control Center, Back Tap, Shortcuts).
- **Code in the copy.** Keys, types and the order of list items; icon names (`'local_cafe'`), hues
  and sizes (`numSize`, `cardNumSize`, `size`: shrink one only if your number does not fit);
  `${playStoreUrl}` and other `${…}` parts; the arguments of the small functions (`(a) => …`).
- **The legal documents' shape.** The front matter keys (`title`, `description`, `lede`,
  `updated`) with `updated` unchanged; every section, in the same order, at the same heading level;
  the `{{OWNER}}`, `{{CONTACT_PHONE}}` and `{{CONTACT_TEL}}` tokens exactly as written; links to the
  site in your language (`/ja/privacy`, as the copy already has).
- **What is not translated.** The blog, `/r/<channel>`, `/c/<card>` and `/app` stay in English and
  Vietnamese; your nav and footer link to the English blog.

## Money in the examples

Every example amount is in your market's money, written the way people there write it: the
receipts in the close, the capture rows, Ask's answers, the hero phone, the plan, the pot, Siri,
the Lock Screen. Keep the story adding up as the English does: the day's number in the hero phone
is the one in "The number", what is left at six on the Lock Screen is what the iPhone Duo shows,
and each close receipt's `from` plus its `amount` is its `to`.

In `duo-amounts-ja.ts` the amounts are whole steps of your money (English counts in ten cents,
Vietnamese in thousands of đồng); `format` writes a step count out, and `keypad` says what the
propped-up keypad shows around the typed digits and how many steps one typed unit is. The four
`rows` add up to `today.spent`, and `today.start` minus `today.spent` is `today.left`.

## Checking your work

From the repository root:

```sh
pnpm --filter @6pm/web typecheck
pnpm --filter @6pm/web build
pnpm --filter @6pm/web dev
```

Then look at `http://localhost:4321/ja`, `/ja/privacy` and `/ja/terms`, on a wide window and at
phone width (375 px): no text runs off the screen or out of a phone, and every number fits. Try the
close (Keep and swipe), Ask, the iPhone Duo poses and its keypad, and the Monthly / Yearly switch.
