#!/bin/bash
set -e

CURRENT_VERSION=$(node -p "require('./package.json').version")

if npm view "barkql@$CURRENT_VERSION" version 2>/dev/null; then
  echo "Version $CURRENT_VERSION already published, skipping"
else
  npm publish
fi
