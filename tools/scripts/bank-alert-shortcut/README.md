# The "Catch a bank alert" shortcut

The iPhone app's bank alert guide adds a shared shortcut, one per country
(`BANK_ALERT_SHORTCUTS` in `apps/mobile/src/features/capture-guide/bank-alert-shortcut.ts`).
It is an iOS 27 automation: a Notification trigger that runs 6pm's "Catch a bank alert" with the
notification's App, Title, Subtitle, Body and Date. A shared shortcut carries its automation and
the apps chosen on its trigger, so the person does not pick apps one by one: the trigger arrives
with 6pm itself and the person's country's most used bank and wallet apps on it.

The guide picks the country the way the bank picker does (`bankAlertShortcutFor`): Vietnam's
whenever the phone's region, currency or clock points at Vietnam; otherwise the country it points
at most strongly that has a list, its region winning a tie; otherwise the world's. A country whose
link is not published yet is given the world's, and Vietnam's while that is missing too.

This folder is what the published shortcut is built from, so it can be built again.

| File | What it is |
| --- | --- |
| `template.plist` | The shortcut with the action and an empty app list, as XML |
| `apps.json` | Vietnam's apps on the trigger, in order |
| `apps/<CC>.json` | Each other country's, and `apps/world.json` for anywhere else |
| `build.py` | Fills a list into the template and writes the unsigned shortcut |
| `build_test.py` | Checks the rules `build.py` holds the list to |

## Published

| Country | List | Apps (6pm included) | Link |
| --- | --- | --- | --- |
| VN | `apps.json` | 21 | <https://www.icloud.com/shortcuts/d13f5fcf5417402aa280c51b7ac0eb68> |
| AE | `apps/AE.json` | 13 | not yet published |
| AU | `apps/AU.json` | 21 | not yet published |
| BD | `apps/BD.json` | 11 | not yet published |
| BR | `apps/BR.json` | 21 | not yet published |
| CA | `apps/CA.json` | 20 | not yet published |
| CH | `apps/CH.json` | 17 | not yet published |
| CN | `apps/CN.json` | 15 | not yet published |
| DE | `apps/DE.json` | 19 | not yet published |
| ES | `apps/ES.json` | 15 | not yet published |
| FR | `apps/FR.json` | 19 | not yet published |
| GB | `apps/GB.json` | 21 | not yet published |
| HK | `apps/HK.json` | 14 | not yet published |
| ID | `apps/ID.json` | 19 | not yet published |
| IE | `apps/IE.json` | 7 | not yet published |
| IN | `apps/IN.json` | 22 | not yet published |
| IT | `apps/IT.json` | 19 | not yet published |
| JP | `apps/JP.json` | 21 | not yet published |
| KE | `apps/KE.json` | 9 | not yet published |
| KH | `apps/KH.json` | 13 | not yet published |
| KR | `apps/KR.json` | 21 | not yet published |
| LA | `apps/LA.json` | 9 | not yet published |
| MX | `apps/MX.json` | 17 | not yet published |
| MY | `apps/MY.json` | 21 | not yet published |
| NG | `apps/NG.json` | 14 | not yet published |
| NL | `apps/NL.json` | 14 | not yet published |
| NZ | `apps/NZ.json` | 10 | not yet published |
| PH | `apps/PH.json` | 19 | not yet published |
| PK | `apps/PK.json` | 13 | not yet published |
| PL | `apps/PL.json` | 15 | not yet published |
| SA | `apps/SA.json` | 13 | not yet published |
| SE | `apps/SE.json` | 13 | not yet published |
| SG | `apps/SG.json` | 17 | not yet published |
| TH | `apps/TH.json` | 18 | not yet published |
| TR | `apps/TR.json` | 17 | not yet published |
| TW | `apps/TW.json` | 19 | not yet published |
| US | `apps/US.json` | 22 | not yet published |
| ZA | `apps/ZA.json` | 11 | not yet published |
| world | `apps/world.json` | 6 | not yet published |

Vietnam's was published on 23 Nov 2026.

## Rules for the app list

Found on an iPhone with iOS 27, 22 and 23 Nov 2026, by adding shortcuts built with different lists.

- An **installed** app is recognised by its bundle id alone.
- An app that is **not installed** stays on the trigger as a grey placeholder only if its entry
  has a team id, or has no name. It starts working once the person installs that app.
- An entry with **a name and no team id** makes iOS put the installed app with the nearest name in
  its place. It swapped in Zalo, Tips, X and others. `build.py` refuses such an entry.
- So an entry is either `bundle` alone, or `bundle` with `name` and the real `team`. A team id is
  written only where it is known for certain: it is the prefix in the `appID` of the app's
  `https://<its domain>/.well-known/apple-app-site-association`. Never guess one.
- **6pm itself is on the list** (`"own": true`). The test alert 6pm sends from the guide is a
  notification of 6pm's, and reaches the action only because 6pm is on the trigger. The action
  takes nothing else from 6pm.
- **Zalopay is left out.** Its bundle-only entry (`vn.com.vng.zalopay`) attached itself to the
  Zalo chat app on a phone without Zalopay, which would have handed every chat notification to
  the action. Its team id is not known for certain, so it cannot be listed with a name either.
  A person who uses it adds it on the trigger with +.
- The action must be the App Store app's (`ai.sixpm.app`), not 6pm Dev's: a shortcut built on the
  dev build's action finds no action on a phone that has only 6pm. `build.py` checks this.
- The shortcut arrives with its automation **turned off**; the guide's second step turns it on.

- **No app whose maker also makes a chat or super-app with the same bundle prefix** goes on a list
  by its bundle id alone: GoPay (Gojek), AlipayHK (Alipay), Paycell (BiP), d払い (+Message), U-Money
  (Mocha). `build.py` refuses a bundle-only entry that shares its maker's prefix with a chat or
  super-app it knows of (`CHAT_APPS`). Chat and super-apps, and their wallets (ShopeePay, LINE Pay,
  GrabPay, WeChat Pay, Toss, the M-PESA app), are never listed at all.
- **A country's list is its bank picker's list.** Each `apps/<CC>.json` holds 6pm, then exactly
  the banks and wallets the picker offers in that country (`WORLD_DIRECTORY`) that have an iPhone
  app in `packages/domain/src/vietqr/world-ios-apps.ts`, in the picker's order, then PayPal, Wise
  and Revolut. A test in `packages/domain` holds every list to this.

`bank` in a list is the app's id in 6pm's bank catalogue. It is not written to the shortcut:
a test in `packages/domain` holds every listed app to one the alert reader knows, since the
action drops a notification from any app it does not know (and a listed name must be one it
knows the app by).

## Changing the list

1. Edit the list (for a country outside Vietnam, its rows in `world-banks.ts` and
   `world-ios-apps.ts` too, and its list to match). `python3 build.py --check` says whether every
   list can be built, and `python3 build_test.py` checks the rules.
2. Build the unsigned shortcut somewhere outside the repo:
   `python3 build.py --country US /tmp/us-unsigned.shortcut` (`python3 build.py --all <folder>`
   builds every list as `<CC>.shortcut`).
3. Sign it for sharing, into a folder of its own so the file is named exactly as the shortcut:
   `shortcuts sign --mode anyone --input /tmp/us-unsigned.shortcut --output "/tmp/US/Catch a bank alert.shortcut"`
4. Open the signed file in Shortcuts **on a Mac** and add it. Then Share › Copy iCloud Link. A file
   signed on the Mac cannot be added on the phone directly; the iCloud link made from the Mac's
   Shortcuts app can. The shared name is the shortcut's name in the Mac's library, which must
   therefore hold no other "Catch a bank alert" when the file is added: a second one is added as
   "Catch a bank alert 2" and shared under that name.
5. Check what was published: `https://www.icloud.com/shortcuts/api/records/<id>` (the id is the
   end of the link). Its `fields.shortcut.value.downloadURL` (replace `${f}` with any file name)
   is the unsigned plist: its `SelectedApps` must equal what `build.py` wrote, and its action's
   `BundleIdentifier` must be `ai.sixpm.app`.
6. Add it from the link on an iPhone that has 6pm from the App Store: the action and the app list
   arrive intact, installed apps show their icons, the rest are grey. Turn the automation on,
   then send a test alert from 6pm's guide.
7. Put the new link in `BANK_ALERT_SHORTCUTS` under its country, and in the table above. The link is in the JavaScript, so it
   ships over the air.

Signed files, and the unsigned build, are never committed: `build.py` refuses to write inside
the repo.

## Changing the action

`template.plist` is the shortcut as Shortcuts wrote it, with the app list emptied. If the action
gains or loses a parameter, build the automation by hand in Shortcuts on a Mac with the App Store
app installed, share it, take the unsigned plist from its record as in step 5, empty
`SelectedApps` and save it here as XML (`plutil -convert xml1`).
