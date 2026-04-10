#!/bin/bash
set -e

# Read current version from app.json
CURRENT=$(node -p "require('./app.json').expo.version")

# Split into major.minor.patch and bump patch
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"
NEW_PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"

echo "Bumping version: $CURRENT → $NEW_VERSION"

# Update app.json
node -e "
  const fs = require('fs');
  const config = JSON.parse(fs.readFileSync('./app.json', 'utf8'));
  config.expo.version = '$NEW_VERSION';
  fs.writeFileSync('./app.json', JSON.stringify(config, null, 2) + '\n');
"

# Commit and push
git add app.json
git commit -m "Bump version to $NEW_VERSION"
git push origin main

echo "Launching EAS build for iOS..."
eas build --platform ios
