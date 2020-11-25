#!/usr/bin/env bash
set -euxo pipefail

###
# TODO do not merge this file.  Delete this file before requesting a review of this pull request.
###

# Delete all yarn2 boilerplate and reset yarn.lock to master
# rm -r .yarnrc.yml .yarn node_modules || true
rm -r node_modules || true
git checkout origin/master -- yarn.lock
yarn --version

# Build tsdx with yarn 1, which matches tsdx's current build process on CI
yarn

# Populate yarn's cache
pushd test/yarn2
yarn
popd

# Run tests
SHOULD_USE_YARN2=true yarn test:post-build

##############################

# Switch to yarn 2 so that running tsdx *and* running stage builds happens in PNP
# Necessary so that jest's node processes have PnP and can require() stage builds
#cp -r ./yarn2-boilerplate/.yarn ./yarn2-boilerplate/.yarnrc.yml ./
#yarn

# Regenerate lockfile in each fixture
# for dir in ./test/**/fixtures/* ; do
#     if [ -d "$dir" ] ; then
#         pushd "$dir"
#         echo 'yarnPath: ../../../yarn2/.yarn/releases/yarn-sources.cjs' > .yarnrc.yml
#         # Copy the seed lockfile
#         cp ../../../yarn2/yarn.lock ./
#         yarn
#         yarn add tsdx@portal:../../../..
#         rm -r .yarn .pnp.js .yarnrc.yml
#         popd
#     fi
# done

# SHOULD_USE_YARN2=true yarn test:post-build ./test/e2e/tsdx-build-default.test.ts
# SHOULD_USE_YARN2=true yarn test:post-build ./test/e2e/tsdx-build-withTsconfig.test
# SHOULD_USE_YARN2=true yarn test:post-build ./test/integration/tsdx-build-withConfig.test
# for file in ./test/**/*.test.ts ; do
#     SHOULD_USE_YARN2=true yarn test:post-build "$file"
# done
# SHOULD_USE_YARN2=true yarn test:post-build --maxWorkers=1
