#!/usr/bin/env bash
# Copies the Selenium Core scripts and atoms the extension needs from the
# selenium repo at a pinned commit into packages/selenium-ide/selenium.
# Only the needed folders are fetched, with a shallow sparse checkout.
# Then the patches in scripts/patches are applied, in name order.
set -euo pipefail

REV=07c4a7c99eb1ac8f2d82fd92141adcd3eefd5e42
REPO=https://github.com/SeleniumHQ/selenium

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/packages/selenium-ide/selenium"
SRC="$(mktemp -d)"
trap 'rm -rf "$SRC"' EXIT

git -C "$SRC" init -q
git -C "$SRC" remote add origin "$REPO"
git -C "$SRC" sparse-checkout set --no-cone \
  javascript/atoms \
  javascript/selenium-atoms \
  javascript/selenium-core/scripts \
  javascript/webdriver/atoms \
  third_party/js
git -C "$SRC" fetch -q --depth 1 --filter=blob:none origin "$REV"
git -C "$SRC" checkout -q FETCH_HEAD

rm -rf "$DEST"
mkdir -p "$DEST"
cp -R "$SRC/javascript/atoms" "$DEST/atoms"
cp -R "$SRC/javascript/selenium-atoms" "$DEST/selenium-atoms"
cp -R "$SRC/javascript/selenium-core/scripts" "$DEST/selenium-core-scripts"
cp -R "$SRC/javascript/webdriver/atoms" "$DEST/webdriver"
cp -R "$SRC/third_party/js" "$DEST/third_party"

shopt -s nullglob
for p in "$ROOT"/scripts/patches/*.patch; do
  patch -s -p1 -d "$DEST" < "$p"
  echo "Applied $(basename "$p")"
done

echo "Synced Selenium files at $REV into $DEST"
