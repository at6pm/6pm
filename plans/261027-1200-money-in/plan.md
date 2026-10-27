# Money in

Status: built · Written 27 Oct 2026 · Branch `feat/money-in-close`, from `main` · Ships in 2.1
Decided by the founder 27 Oct 2026 (M12 in product decisions). Design: the "6pm Money in" canvas (https://claude.ai/artifact/DVYgNqu9ejJ3ws9inr7ZCW), nine screens with their motion notes.

## Why

6pm knew one income number. Bonuses, gifts, side jobs, refunds and friends paying back were dropped on the floor, or worse, read as spending: the email reader already told them apart and threw them away. People whose pay varies had no honest way to set the plan.

## The model

- A captured row has a direction. Money in is never spending, and changes nothing while it waits: the number never flatters the day on a guess.
- At the close it is placed: spread over the days left, saved for Future you (a top-up of its goals, so today holds), saved in a pot, or a payback. Spread, saved and refunds add to the cycle's free money; the pay and paybacks do not.
- The close asks before placing what looks like something: the pay (its extra peels off as a card of its own), a refund (the spend struck through, its money back), a payback (settles a split or a claim, the number holds).
- The plan's income is what the person can count on. Variable pay goes low; the rest arrives through the close.

## Phases

| # | Phase | Owns | Status |
|---|---|---|---|
| 1 | Rows and capture: `direction`, `money_in`, `gives_back`, `saved_to`, the `alert` source, the migration, direction-aware merging, backup format 5 | `contracts/*`, `spend/*`, `capture/duplicate.ts`, `db/migrations/*` | done |
| 2 | Domain: money in in the daily number, pay / refund / payback matching, spread preview, Future you split, the close's money questions and money cards, voice | `spend/money-in.ts`, `plan/daily-number.ts`, `close/close-flow.ts`, `capture/spoken-spend.ts` | done |
| 3 | Data: place, take back, keep the pay; email incoming and refunds carried to the phone | `data/money-in-actions.ts`, `data/email-import.ts`, `apps/api` read and receive | done |
| 4 | Screens: the money card and its up swipe, the Future you pill, the edit sheet, the questions, Today's rows and line, the Diary slip, the Plan sheet, Quick add by voice | `features/close/*`, `features/today/*`, `features/diary/*`, `app/month.tsx`, `app/quick-add.tsx` | done |

Bank alerts from iOS notifications are their own lane (`feat/capture-bank-alerts`), stacked on phase 1.

## Acceptance

- 2tr spread with 22 days left: tomorrow rises by its floored share; saved for Future you: today's line is unchanged and the goals hold 2tr more by share.
- A 19,5tr pay against an 18tr plan near payday, "Yes": the pay is kept at 18tr and a 1,5tr card follows; "Make it 19,5tr" opens the Plan sheet prefilled.
- A Shopee refund of a 349k spend from six days ago: asked, struck through in that day's Diary with BACK and its date, 349k back in the days.
- A same-amount spend and money in three minutes apart never merge.
- Domain and mobile tests; the close driven on the simulator with the `moneyIn` dev seed.
