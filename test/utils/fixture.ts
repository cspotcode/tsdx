import * as path from 'path';
import * as fs from 'fs';
import * as shell from 'shelljs';
import * as os from 'os';

export const rootDir = process.cwd();
export const stageRootDir =
  getPackageManager() === 'yarn2'
    ? path.join(os.tmpdir(), 'tsdx-test-stages')
    : rootDir;

shell.config.silent = true;

export function setupStageWithFixture(
  testDir: string,
  stageName: string,
  fixtureName: string
): void {
  const stagePath = getStagePath(stageName);
  shell.mkdir('-p', stagePath);
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
    // Setup stage directory as a project root for yarn2
    fs.writeFileSync('yarn.lock', '');
    fs.writeFileSync(
      '.yarnrc.yml',
      `yarnPath: ${path.join(
        rootDir,
        'yarn2-boilerplate/.yarn/releases/yarn-sources.cjs'
      )}\n`
    );
    shell.exec(`yarn`);
    shell.exec(`yarn add tsdx@portal:${rootDir}`);
  }
}

export function teardownStage(stageName: string): void {
  shell.cd(rootDir);
  shell.rm('-rf', getStagePath(stageName));
}

export function getPackageManager() {
  if (process.env.TSDX_TEST_PACKAGE_MANAGER === 'yarn2') return 'yarn2';
  return 'npm';
}

export function getStagePath(stageName: string) {
  return path.join(stageRootDir, stageName);
}
