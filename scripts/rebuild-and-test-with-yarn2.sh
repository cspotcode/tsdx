#!/usr/bin/env bash
set -euxo pipefail

# Delete all yarn2 boilerplate and reset yarn.lock to master
rm -r .yarnrc.yml .yarn node_modules || true
git checkout origin/master -- yarn.lock
yarn --version

# Build tsdx with yarn 1, which matches tsdx's current build process on CI
yarn

# Switch to yarn 2 so that running tsdx *and* running stage builds happens in PNP
# Necessary so that jest's node processes have PnP and can require() stage builds
cp -r ./yarn2-boilerplate/.yarn ./yarn2-boilerplate/.yarnrc.yml ./
yarn

# Run tests.  Start with a single suite for quicker feedback.
TSDX_TEST_PACKAGE_MANAGER=yarn2 yarn test:post-build ./test/e2e/tsdx-build-default.test.ts
TSDX_TEST_PACKAGE_MANAGER=yarn2 yarn test:post-build
