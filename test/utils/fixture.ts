import * as path from 'path';
import * as fs from 'fs';
import * as shell from 'shelljs';

export const rootDir = process.cwd();

shell.config.silent = true;

export function setupStageWithFixture(
  testDir: string,
  stageName: string,
  fixtureName: string
): void {
  const stagePath = path.join(rootDir, stageName);
  shell.mkdir(stagePath);
  shell.exec(
    `cp -a ${rootDir}/test/${testDir}/fixtures/${fixtureName}/. ${stagePath}/`
  );
  if (getPackageManager() === 'npm') {
    shell.ln(
      '-s',
      path.join(rootDir, 'node_modules'),
      path.join(stagePath, 'node_modules')
    );
  }
  shell.cd(stagePath);
  if (getPackageManager() === 'yarn2') {
    // Tell yarn to run yarn2 & treat this directory as project root
    fs.writeFileSync('yarn.lock', '');
    fs.writeFileSync(
      '.yarnrc.yml',
      'yarnPath: ../yarn2-boilerplate/.yarn/releases/yarn-sources.cjs\n' +
      'cacheFolder: "../.yarn/stage-cache"\n'
    );
    shell.exec(`yarn`);
  }
}

export function teardownStage(stageName: string): void {
  shell.cd(rootDir);
  shell.rm('-rf', path.join(rootDir, stageName));
}

export function getPackageManager() {
  if (process.env.TSDX_TEST_PACKAGE_MANAGER === 'yarn2') return 'yarn2';
  return 'npm';
}
