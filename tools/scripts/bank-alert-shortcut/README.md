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
| AE | `apps/AE.json` | 13 | <https://www.icloud.com/shortcuts/1261dfb5259245a88a078acd4ee705f9> |
| AU | `apps/AU.json` | 21 | <https://www.icloud.com/shortcuts/d200b856dc4b4447acd65bbb7518c551> |
| BD | `apps/BD.json` | 11 | <https://www.icloud.com/shortcuts/e0cf0df44ea34382af34e06af3ec361f> |
| BR | `apps/BR.json` | 21 | <https://www.icloud.com/shortcuts/5ce1d426a5f7426cb70a3e3d26874ac2> |
| CA | `apps/CA.json` | 20 | <https://www.icloud.com/shortcuts/49836df465604e658ab34c364115ae22> |
| CH | `apps/CH.json` | 17 | <https://www.icloud.com/shortcuts/88cf7b2d47b7447a854b64433b3aa8ca> |
| CN | `apps/CN.json` | 15 | <https://www.icloud.com/shortcuts/e0bebfdf8989471d942cc4e08fe6fe1c> |
| DE | `apps/DE.json` | 19 | <https://www.icloud.com/shortcuts/79c581e7ecbf49828cc29ac4adb604c1> |
| ES | `apps/ES.json` | 15 | <https://www.icloud.com/shortcuts/60e0c92318744cb9ba9119a975d41220> |
| FR | `apps/FR.json` | 19 | <https://www.icloud.com/shortcuts/5905bac87f4a4d0a9594f7e60c9f57a6> |
| GB | `apps/GB.json` | 21 | <https://www.icloud.com/shortcuts/67ebffe06a8947a494745697c4e13ecd> |
| HK | `apps/HK.json` | 14 | <https://www.icloud.com/shortcuts/b4f680614cc346aca82a61bd33ac783b> |
| ID | `apps/ID.json` | 19 | <https://www.icloud.com/shortcuts/3c8acf6c2c404c7c847b303c6a80bb61> |
| IE | `apps/IE.json` | 7 | <https://www.icloud.com/shortcuts/8c7374c6ac8e41c49e1e11d870bb4a49> |
| IN | `apps/IN.json` | 22 | <https://www.icloud.com/shortcuts/0d290dd7ede2416ea949f77b2f4c7815> |
| IT | `apps/IT.json` | 19 | <https://www.icloud.com/shortcuts/c681cbfadcdf40d0a5b46fbae03e20d4> |
| JP | `apps/JP.json` | 21 | <https://www.icloud.com/shortcuts/db069f11db074cfc8038362d9174abcd> |
| KE | `apps/KE.json` | 9 | <https://www.icloud.com/shortcuts/829f4a2eedfd47d8af857fb1147df9d0> |
| KH | `apps/KH.json` | 13 | <https://www.icloud.com/shortcuts/ca9284d65c384715ab3dd69d5d524d34> |
| KR | `apps/KR.json` | 21 | <https://www.icloud.com/shortcuts/62e6a6a0f64c4ead9156b5005cea50dd> |
| LA | `apps/LA.json` | 9 | <https://www.icloud.com/shortcuts/946899de4dc140738aa65dd7baf9baad> |
| MX | `apps/MX.json` | 17 | <https://www.icloud.com/shortcuts/436916527fbb4c3cbb04887a10a86f2b> |
| MY | `apps/MY.json` | 21 | <https://www.icloud.com/shortcuts/910cdda498814ed38312810af54ecb76> |
| NG | `apps/NG.json` | 14 | <https://www.icloud.com/shortcuts/ebfd851b01f346f4b6ba9c7069692aa2> |
| NL | `apps/NL.json` | 14 | <https://www.icloud.com/shortcuts/b08ade38c6bb45158f2f184498af5b4b> |
| NZ | `apps/NZ.json` | 10 | <https://www.icloud.com/shortcuts/5f73cdc11a89462389801da3ad6dc8bf> |
| PH | `apps/PH.json` | 19 | <https://www.icloud.com/shortcuts/b1a50a4b412e40b5b0e62b3eca4693b2> |
| PK | `apps/PK.json` | 13 | <https://www.icloud.com/shortcuts/a9606a8f0ce14db289bd7c660d0bcba2> |
| PL | `apps/PL.json` | 15 | <https://www.icloud.com/shortcuts/73a4a0a436bd448eb13f5a401279d548> |
| SA | `apps/SA.json` | 13 | <https://www.icloud.com/shortcuts/9a2517c03be84a07bb70fecd7db10109> |
| SE | `apps/SE.json` | 13 | <https://www.icloud.com/shortcuts/fe2af5633aeb4d51a05a3202a855eb18> |
| SG | `apps/SG.json` | 17 | <https://www.icloud.com/shortcuts/6f2a6b4aa2d44cd9b474c18268155635> |
| TH | `apps/TH.json` | 18 | <https://www.icloud.com/shortcuts/f0f1d452f77c4bca9ac5310ddd383858> |
| TR | `apps/TR.json` | 17 | <https://www.icloud.com/shortcuts/08e2fd029d0e4858924d92f3f7ffe965> |
| TW | `apps/TW.json` | 19 | <https://www.icloud.com/shortcuts/43ad793687714060a9229793680ac176> |
| US | `apps/US.json` | 22 | <https://www.icloud.com/shortcuts/cf379198952247d9ad8c8b607368d842> |
| ZA | `apps/ZA.json` | 11 | <https://www.icloud.com/shortcuts/9b296307701d40a18375c91330448c3e> |
| world | `apps/world.json` | 6 | <https://www.icloud.com/shortcuts/10cd14b9138744c59f58d4b8e7c9e2bf> |

Vietnam's was published on 23 Nov 2026, the others on 25 Nov 2026. Each published shortcut was checked against its build as in step 5 below.

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
   Shortcuts app can. The shared name is the shortcut's name in the Mac's library. When the
   library already holds a "Catch a bank alert", choose **Replace** when Shortcuts asks: the new
   one keeps the exact name and the older one is renamed "Catch a bank alert 2" (and so on), so
   the newest is the one to share; "Keep Both" would share it as "Catch a bank alert 2". Links
   already made keep working when their shortcut is renamed or deleted. Shortcuts asks "Create
   iCloud Link" only for a shortcut not shared before, which confirms the right one is selected.
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
