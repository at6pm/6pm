# The "Catch a bank alert" shortcut

The iPhone app's bank alert guide adds one shared shortcut
(`BANK_ALERT_SHORTCUT_URL` in `apps/mobile/src/features/capture-guide/bank-alert-shortcut.ts`).
It is an iOS 27 automation: a Notification trigger that runs 6pm's "Catch a bank alert" with the
notification's App, Title, Subtitle, Body and Date. A shared shortcut carries its automation and
the apps chosen on its trigger, so the person does not pick apps one by one: the trigger arrives
with 6pm itself and Vietnam's most used bank and wallet apps on it.

This folder is what the published shortcut is built from, so it can be built again.

| File | What it is |
| --- | --- |
| `template.plist` | The shortcut with the action and an empty app list, as XML |
| `apps.json` | The apps on the trigger, in order |
| `build.py` | Fills the list into the template and writes the unsigned shortcut |
| `build_test.py` | Checks the rules `build.py` holds the list to |

Published now: <https://www.icloud.com/shortcuts/d13f5fcf5417402aa280c51b7ac0eb68> (6pm and 20
bank and wallet apps, 23 Nov 2026).

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

`bank` in `apps.json` is the app's id in 6pm's bank catalogue. It is not written to the shortcut:
a test in `packages/domain` holds every listed app to one the alert reader knows, since the
action drops a notification from any app it does not know (and a listed name must be one it
knows the app by).

## Changing the list

1. Edit `apps.json`. `python3 build.py --check` says whether the list can be built, and
   `python3 build_test.py` checks the rules.
2. Build the unsigned shortcut somewhere outside the repo:
   `python3 build.py ~/Desktop/catch-a-bank-alert-unsigned.shortcut`
3. Sign it for sharing:
   `shortcuts sign --mode anyone --input ~/Desktop/catch-a-bank-alert-unsigned.shortcut --output "$HOME/Desktop/Catch a bank alert.shortcut"`
4. Open the signed file in Shortcuts **on a Mac** and add it. Then Share › Copy iCloud Link. A file
   signed on the Mac cannot be added on the phone directly; the iCloud link made from the Mac's
   Shortcuts app can.
5. Check what was published: `https://www.icloud.com/shortcuts/api/records/<id>` (the id is the
   end of the link). Its `fields.shortcut.value.downloadURL` (replace `${f}` with any file name)
   is the unsigned plist: its `SelectedApps` must equal what `build.py` wrote, and its action's
   `BundleIdentifier` must be `ai.sixpm.app`.
6. Add it from the link on an iPhone that has 6pm from the App Store: the action and the app list
   arrive intact, installed apps show their icons, the rest are grey. Turn the automation on,
   then send a test alert from 6pm's guide.
7. Put the new link in `BANK_ALERT_SHORTCUT_URL` and above. The link is in the JavaScript, so it
   ships over the air.

Signed files, and the unsigned build, are never committed: `build.py` refuses to write inside
the repo.

## Changing the action

`template.plist` is the shortcut as Shortcuts wrote it, with the app list emptied. If the action
gains or loses a parameter, build the automation by hand in Shortcuts on a Mac with the App Store
app installed, share it, take the unsigned plist from its record as in step 5, empty
`SelectedApps` and save it here as XML (`plutil -convert xml1`).
