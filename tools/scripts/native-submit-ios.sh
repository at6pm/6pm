#!/usr/bin/env bash
# Sends a signed store build to App Store Connect (TestFlight) with `eas submit`, straight from the
# runner that built it: the .ipa is never an artifact or a release asset of this public repository.
#
#   tools/scripts/native-submit-ios.sh <profile> <path to the .ipa>
#
# A submission that runs unattended needs the App Store Connect app id and an API key in the submit
# profile. They are written into this checkout's eas.json only (never committed): the key file
# lives in the runner's temp folder and is removed when the script ends.
#
# Env: EXPO_TOKEN, ASC_API_KEY_P8 (the key file's contents), EXPO_ASC_KEY_ID, EXPO_ASC_ISSUER_ID,
# ASC_APP_ID, EAS_CLI (the pinned eas-cli package); WHAT_TO_TEST (optional), the build's
# "What to Test" in TestFlight, set by testflight-notes.ts once Apple has the build.
set -euo pipefail

profile=$1
ipa=$2
repo_root=$(cd "$(dirname "$0")/../.." && pwd)

for name in EXPO_TOKEN ASC_API_KEY_P8 EXPO_ASC_KEY_ID EXPO_ASC_ISSUER_ID ASC_APP_ID; do
  [ -n "${!name:-}" ] || { echo "::error::$name is missing: nothing was submitted"; exit 1; }
done
[ -s "$ipa" ] || { echo "::error::No signed build at $ipa"; exit 1; }

key_file=${RUNNER_TEMP:-$(mktemp -d)}/asc-api-key.p8
trap 'rm -f "$key_file"' EXIT
(umask 077 && printf '%s' "$ASC_API_KEY_P8" >"$key_file")

cd "$repo_root/apps/mobile"
jq --arg profile "$profile" --arg app "$ASC_APP_ID" --arg key "$key_file" \
  --arg key_id "$EXPO_ASC_KEY_ID" --arg issuer "$EXPO_ASC_ISSUER_ID" \
  '.submit[$profile].ios = ((.submit[$profile].ios // {}) + {
     ascAppId: $app, ascApiKeyPath: $key, ascApiKeyId: $key_id, ascApiKeyIssuerId: $issuer
   })' eas.json >eas.json.new
mv eas.json.new eas.json

# The same key lets eas-cli check the app's TestFlight setup without an Apple ID login.
export EXPO_ASC_API_KEY_PATH=$key_file
export EXPO_APPLE_TEAM_ID=YFND2EEW8S EXPO_APPLE_TEAM_TYPE=INDIVIDUAL
npx --yes "${EAS_CLI:?}" submit --profile "$profile" --platform ios --path "$ipa" \
  --non-interactive --wait

echo "Apple accepted the \`$profile\` build of \`$(git rev-parse --short=12 HEAD)\`; it appears in TestFlight when processing ends." \
  >>"${GITHUB_STEP_SUMMARY:-/dev/stdout}"

# "What to Test" goes through App Store Connect itself (EAS sends it on its Enterprise plan only).
# The build is already with Apple, so a note that cannot be set only warns.
# `set -e` does not reach inside a function run before `||`, so each step returns on failure.
set_notes() {
  local plist version build
  plist=$(mktemp) || return 1
  unzip -p "$ipa" 'Payload/*.app/Info.plist' >"$plist" || return 1
  version=$(plutil -extract CFBundleShortVersionString raw "$plist") || return 1
  build=$(plutil -extract CFBundleVersion raw "$plist") || return 1
  rm -f "$plist"
  ASC_KEY_PATH=$key_file node "$repo_root/tools/scripts/testflight-notes.ts" "$version" "$build" ||
    return 1
  echo "\"What to Test\" is set on $version ($build)." >>"${GITHUB_STEP_SUMMARY:-/dev/stdout}"
}
if [ -n "${WHAT_TO_TEST:-}" ]; then
  set_notes || echo "::warning::\"What to Test\" was not set; add it in App Store Connect."
fi
