#!/usr/bin/env python3
"""Builds the unsigned "Catch a bank alert" shortcut that the published template is made from.

It starts from `template.plist` (the shortcut with 6pm's action and an empty app list) and fills
the Notification trigger's apps from `apps.json`. The README beside this file says how the result
becomes the iCloud link the app points at, and where each rule below was learned.

    python3 build.py <out.shortcut>    write the unsigned shortcut (keep it out of the repo)
    python3 build.py --check           only check the list and the template
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


def main(argv: list[str]) -> int:
    if len(argv) != 1:
        print(__doc__, file=sys.stderr)
        return 2
    with open(HERE / "template.plist", "rb") as file:
        template = plistlib.load(file)
    with open(HERE / "apps.json", encoding="utf-8") as file:
        apps = json.load(file)
    try:
        shortcut = build(template, apps)
    except Refused as refused:
        print(f"refused: {refused}", file=sys.stderr)
        return 1
    count = len(shortcut["WFWorkflowTriggers"][0]["WFTriggerSerializedParameters"]["SelectedApps"])
    if argv[0] == "--check":
        print(f"ok: {count} apps on the trigger")
        return 0
    out = Path(argv[0]).resolve()
    if HERE.parents[2] in out.parents:
        print("refused: write the shortcut outside the repo; it is never committed", file=sys.stderr)
        return 1
    with open(out, "wb") as file:
        plistlib.dump(shortcut, file, fmt=plistlib.FMT_BINARY)
    print(f"wrote {out} with {count} apps on the trigger")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
