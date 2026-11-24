#!/usr/bin/env python3
"""Builds the unsigned "Catch a bank alert" shortcuts that the published templates are made from.

It starts from `template.plist` (the shortcut with 6pm's action and an empty app list) and fills
the Notification trigger's apps from a list: `apps.json` for Vietnam, `apps/<country>.json` for
each other country 6pm has banks for, and `apps/world.json` for anywhere else. The README beside
this file says how each result becomes the iCloud link the app points at, and where each rule
below was learned.

    python3 build.py <out.shortcut>                  Vietnam's (keep it out of the repo)
    python3 build.py --country <CC> <out.shortcut>   one country's, or `world`
    python3 build.py --all <out folder>              every list, as <CC>.shortcut
    python3 build.py --check                         only check every list and the template
"""

from __future__ import annotations

import json
import plistlib
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent

# The action must be the App Store app's: a shortcut built on 6pm Dev's action finds no action on
# a phone that has only 6pm.
PRODUCTION_BUNDLE = "ai.sixpm.app"
ACTION = f"{PRODUCTION_BUNDLE}.CatchBankAlertIntent"


# Chat and super-apps, by their iPhone bundle id. An entry with no team id can attach itself to an
# installed app whose bundle id shares its maker's prefix: Zalopay's attached itself to Zalo. So an
# app of the same maker as one of these is never listed by its bundle id alone.
CHAT_APPS = {
    "vn.com.vng.zingalo": "Zalo",
    "com.go-jek.ios": "Gojek",
    "com.alipay.iphoneclient": "Alipay",
    "com.turkcell.bip": "BiP",
    "com.tencent.xin": "WeChat",
    "jp.naver.line": "LINE",
    "com.iwilab.KakaoTalk": "KakaoTalk",
    "com.grabtaxi.iphone": "Grab",
    "com.shopee.id": "Shopee",
    "net.whatsapp.WhatsApp": "WhatsApp",
    "com.facebook.Messenger": "Messenger",
    "ph.telegra.Telegraph": "Telegram",
}


class Refused(Exception):
    """The list or the template would make a shortcut that misbehaves on a phone."""


def selected_apps(apps: object) -> list[dict[str, str]]:
    """The trigger's `SelectedApps` for a list of `{bundle, name?, team?}`, or `Refused`.

    iOS knows an installed app by its bundle id alone. An app that is not installed is kept as a
    grey placeholder only when its entry has a team id or has no name. A name without a team id
    makes iOS put the installed app with the nearest name in its place, so that is refused here.
    """
    if not isinstance(apps, list) or not apps:
        raise Refused("apps.json must be a list with at least one app")
    selected: list[dict[str, str]] = []
    seen: set[str] = set()
    for app in apps:
        if not isinstance(app, dict):
            raise Refused(f"not an app: {app!r}")
        bundle, name, team = app.get("bundle"), app.get("name"), app.get("team")
        if not isinstance(bundle, str) or not bundle.strip():
            raise Refused(f"an app has no bundle id: {app!r}")
        for label, value in (("name", name), ("team", team)):
            if value is not None and (not isinstance(value, str) or not value.strip()):
                raise Refused(f"{bundle}: an empty {label}; leave it out instead")
        if bundle.lower() in seen:
            raise Refused(f"{bundle}: listed twice")
        seen.add(bundle.lower())
        if team is None:
            for chat, chat_name in CHAT_APPS.items():
                maker = chat.lower().rsplit(".", 1)[0]
                if bundle.lower().startswith(maker + "."):
                    raise Refused(
                        f"{bundle}: shares {maker} with {chat_name}, a chat or super-app; "
                        "without a team id iOS may attach the entry to it"
                    )
        if name is not None and team is None:
            raise Refused(
                f"{bundle}: a name ({name!r}) without a team id. iOS would swap in whichever "
                "installed app has the nearest name. Add the real team id, or drop the name."
            )
        entry = {"BundleIdentifier": bundle}
        if name is not None:
            entry["Name"] = name
        if team is not None:
            entry["TeamIdentifier"] = team
        selected.append(entry)
    if PRODUCTION_BUNDLE.lower() not in seen:
        raise Refused(
            f"{PRODUCTION_BUNDLE} is not in the list: 6pm's own test alert would never reach "
            "the action"
        )
    return selected


def build(template: dict, apps: object) -> dict:
    """The template with its trigger's apps filled in, or `Refused`."""
    actions = template.get("WFWorkflowActions") or []
    if len(actions) != 1 or actions[0].get("WFWorkflowActionIdentifier") != ACTION:
        raise Refused(f"the template must hold one action, {ACTION}")
    described = actions[0].get("WFWorkflowActionParameters", {}).get("AppIntentDescriptor", {})
    if described.get("BundleIdentifier") != PRODUCTION_BUNDLE:
        raise Refused(f"the action must be {PRODUCTION_BUNDLE}'s, not a dev build's")
    triggers = template.get("WFWorkflowTriggers") or []
    if len(triggers) != 1 or triggers[0].get("WFTriggerIdentifier") != "WFNotificationTrigger":
        raise Refused("the template must hold one Notification trigger")
    triggers[0]["WFTriggerSerializedParameters"]["SelectedApps"] = selected_apps(apps)
    return template


def lists() -> dict[str, Path]:
    """Every list by its country (ISO 3166-1 alpha-2, or `world` for anywhere else)."""
    found = {"VN": HERE / "apps.json"}
    for path in sorted((HERE / "apps").glob("*.json")):
        found[path.stem] = path
    return found


def build_list(path: Path) -> dict:
    """The shortcut for one list, or `Refused`."""
    with open(HERE / "template.plist", "rb") as file:
        template = plistlib.load(file)
    with open(path, encoding="utf-8") as file:
        apps = json.load(file)
    return build(template, apps)


def count(shortcut: dict) -> int:
    return len(shortcut["WFWorkflowTriggers"][0]["WFTriggerSerializedParameters"]["SelectedApps"])


def write(shortcut: dict, out: Path) -> None:
    if HERE.parents[2] in out.resolve().parents:
        raise Refused("write the shortcut outside the repo; it is never committed")
    with open(out, "wb") as file:
        plistlib.dump(shortcut, file, fmt=plistlib.FMT_BINARY)


def main(argv: list[str]) -> int:
    every = lists()
    try:
        if argv == ["--check"]:
            for country, path in every.items():
                print(f"ok: {country}, {count(build_list(path))} apps on the trigger")
            return 0
        if len(argv) == 2 and argv[0] == "--all":
            folder = Path(argv[1]).resolve()
            folder.mkdir(parents=True, exist_ok=True)
            for country, path in every.items():
                shortcut = build_list(path)
                write(shortcut, folder / f"{country}.shortcut")
                print(f"wrote {folder / country}.shortcut with {count(shortcut)} apps")
            return 0
        if len(argv) == 3 and argv[0] == "--country":
            country, target = argv[1], argv[2]
        elif len(argv) == 1 and not argv[0].startswith("--"):
            country, target = "VN", argv[0]
        else:
            print(__doc__, file=sys.stderr)
            return 2
        if country not in every:
            raise Refused(f"no list for {country}: {', '.join(every)}")
        shortcut = build_list(every[country])
        out = Path(target).resolve()
        write(shortcut, out)
        print(f"wrote {out} with {count(shortcut)} apps on the trigger")
        return 0
    except Refused as refused:
        print(f"refused: {refused}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
