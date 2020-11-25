import path from 'path';
import * as fs from 'fs';
import * as shell from 'shelljs';
import * as os from 'os';
import * as libTester from './lib-tester';

export const rootDir = process.cwd();
export const stageRootDir = isYarn2()
  ? path.join(os.tmpdir(), 'tsdx-test-stages')
  : rootDir;
export const tsdxBin = isYarn2()
  ? 'yarn tsdx'
  : `node ${rootDir}/dist/index.js`;

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
  if (!isYarn2()) {
    shell.ln(
      '-s',
      path.join(rootDir, 'node_modules'),
      path.join(stagePath, 'node_modules')
    );
  }
  shell.cd(stagePath);
  if (isYarn2()) {
    // Setup stage directory as a project root for yarn2
    fs.writeFileSync(
      '.yarnrc.yml',
      `yarnPath: ${path.join(
        rootDir,
        'test/yarn2/.yarn/releases/yarn-sources.cjs'
      )}\ncacheFolder: ${rootDir}/test/yarn2/.yarn/cache`
    );
    // Copy seed lockfile with most resolutions already performed.  Makes tests faster.
    shell.exec(`cp ${rootDir}/test/yarn2/yarn.lock ${stagePath}/`);
  }
  packageManagerInstall();
}

export function packageManagerInstall() {
  if (!isYarn2()) return;

  // Add tsdx dependency pointed to project directory
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  pkg.dependencies = pkg.dependencies ?? {};
  pkg.dependencies['tsdx'] = `portal:${rootDir}`;
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
  const { code } = shell.exec(`yarn`);
  if (code !== 0) throw new Error('yarn install failed');
}

export function teardownStage(stageName: string): void {
  shell.cd(rootDir);
  shell.rm('-rf', getStagePath(stageName));
}

export function isYarn2() {
  return process.env.SHOULD_USE_YARN2 === 'true';
}

export function getStagePath(stageName: string) {
  return path.join(stageRootDir, stageName);
}

export function getLibTester(libPath: string) {
  const absLibPath = path.resolve(libPath);
  function evaluate(expression: string): any {
    const libTesterPath = require.resolve('./lib-tester.js');
    const args: libTester.JsonArgs = { libPath: absLibPath, expression };
    const encodedValue = shell.exec(
      `${isYarn2() ? 'yarn ' : ''}node ${libTesterPath} ${Buffer.from(
        JSON.stringify(args)
      ).toString('base64')}`
    );
    if (encodedValue.trim() === 'undefined') return undefined;
    return JSON.parse(encodedValue);
  }
  return { evaluate };
}
