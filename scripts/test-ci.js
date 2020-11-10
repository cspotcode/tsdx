const shell = require('shelljs');

function main() {
  if(getPackageManager() === 'yarn2') {
      shell.rm('-rf', path.join(rootDir, 'node_modules'));
      shell.exec('yarn set version 2');
      shell.exec('yarn');
  }

  shell.exec('yarn test:post-build');
}

function getPackageManager() {
  if (process.env.TSDX_TEST_PACKAGE_MANAGER === 'yarn2') return 'yarn2';
  return 'npm';
}

main();
