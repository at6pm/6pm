#!/usr/bin/env python3
"""Checks the rules `build.py` holds the app list to. Run: python3 build_test.py"""

import plistlib
import sys
import unittest
from pathlib import Path

# Nothing is left beside the script: no cache folder to commit by mistake.
sys.dont_write_bytecode = True

from build import PRODUCTION_BUNDLE, Refused, build, build_list, lists, selected_apps

HERE = Path(__file__).resolve().parent
OWN = {"bundle": PRODUCTION_BUNDLE, "name": "6pm", "team": "TEAM000000"}


def template() -> dict:
    with open(HERE / "template.plist", "rb") as file:
        return plistlib.load(file)


class AppList(unittest.TestCase):
    def test_writes_bundle_alone_or_with_name_and_team(self):
        apps = [OWN, {"bundle": "com.example.bank"}, {"bundle": "com.example.pay", "team": "T1"}]
        self.assertEqual(
            selected_apps(apps),
            [
                {"BundleIdentifier": PRODUCTION_BUNDLE, "Name": "6pm", "TeamIdentifier": "TEAM000000"},
                {"BundleIdentifier": "com.example.bank"},
                {"BundleIdentifier": "com.example.pay", "TeamIdentifier": "T1"},
            ],
        )

    def test_refuses_a_name_without_a_team_id(self):
        with self.assertRaisesRegex(Refused, "without a team id"):
            selected_apps([OWN, {"bundle": "com.example.bank", "name": "Example Bank"}])

    def test_refuses_an_empty_name_or_team_a_missing_bundle_and_a_repeat(self):
        for bad in (
            {"bundle": "com.example.bank", "name": "", "team": "T1"},
            {"bundle": "com.example.bank", "name": "Example Bank", "team": " "},
            {"name": "Example Bank", "team": "T1"},
            {"bundle": PRODUCTION_BUNDLE.upper()},
        ):
            with self.assertRaises(Refused):
                selected_apps([OWN, bad])

    def test_refuses_a_bundle_alone_that_shares_a_chat_app_s_prefix(self):
        with self.assertRaisesRegex(Refused, "Zalo"):
            selected_apps([OWN, {"bundle": "vn.com.vng.zalopay"}])
        with self.assertRaisesRegex(Refused, "Gojek"):
            selected_apps([OWN, {"bundle": "com.go-jek.gopay"}])
        # With its team id the entry is the app itself.
        selected_apps([OWN, {"bundle": "com.go-jek.gopay", "name": "GoPay", "team": "T1"}])

    def test_refuses_a_list_without_6pm_itself(self):
        with self.assertRaisesRegex(Refused, "test alert"):
            selected_apps([{"bundle": "com.example.bank"}])


class Template(unittest.TestCase):
    def test_fills_the_trigger_and_keeps_the_action(self):
        shortcut = build(template(), [OWN, {"bundle": "com.example.bank"}])
        trigger = shortcut["WFWorkflowTriggers"][0]["WFTriggerSerializedParameters"]
        self.assertEqual(len(trigger["SelectedApps"]), 2)
        action = shortcut["WFWorkflowActions"][0]["WFWorkflowActionParameters"]
        self.assertEqual(sorted(k for k in action if k[0].islower()), ["alertTitle", "app", "body", "date", "subtitle"])

    def test_refuses_a_dev_build_s_action(self):
        dev = template()
        dev["WFWorkflowActions"][0]["WFWorkflowActionParameters"]["AppIntentDescriptor"][
            "BundleIdentifier"
        ] = f"{PRODUCTION_BUNDLE}.dev"
        with self.assertRaisesRegex(Refused, "dev build"):
            build(dev, [OWN])


class Lists(unittest.TestCase):
    def test_vietnam_every_country_and_the_world_each_build(self):
        every = lists()
        self.assertIn("VN", every)
        self.assertIn("world", every)
        self.assertGreaterEqual(len(every), 30)
        for country, path in every.items():
            with self.subTest(country=country):
                self.assertTrue(country == "world" or (len(country) == 2 and country.isupper()))
                apps = build_list(path)["WFWorkflowTriggers"][0]["WFTriggerSerializedParameters"]
                self.assertEqual(apps["SelectedApps"][0]["BundleIdentifier"], PRODUCTION_BUNDLE)
                self.assertLessEqual(len(apps["SelectedApps"]), 22)


if __name__ == "__main__":
    unittest.main()
