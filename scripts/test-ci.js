const shell = require('shelljs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function main() {
  if (getPackageManager() === 'yarn2') {
    shell.rm('-rf', path.join(rootDir, 'node_modules'));
    shell.exec('yarn set version 2');
    shell.exec('yarn');
  }

  shell.exec('yarn test:post-build');
}

// TODO stop duplicating this function in 2x places
// TODO make the yarn2 tests run in `yarn test` / `npm test`?
// `npm test` doesn't do all OSes, so it technically doesn't run the entire test matrix.
// I'll have to see what the team wants here.
function getPackageManager() {
  if (process.env.TSDX_TEST_PACKAGE_MANAGER === 'yarn2') return 'yarn2';
  return 'npm';
}

main();
