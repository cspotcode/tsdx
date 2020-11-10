import { Config } from '@jest/types';
import { createRequire } from 'module';
import * as path from 'path';

export type JestConfigOptions = Partial<Config.InitialOptions>;

export function createJestConfig(
  _: (relativePath: string) => void,
  rootDir: string
): JestConfigOptions {
  function resolveRelativeTo(dir: string, moduleSpecifier: string) {
    const req = createRequire(dir);
    try {
      return req.resolve(moduleSpecifier);
    } catch {
      return null;
    }
  }
  // Temporary hack while this PR is in proof-of-concept phase:
  // Do not attempt `createRequire` if running old node which does not have it.
  // If `createRequire` is necessary in final implementation,
  // we can copy paste a backwards-compatible implementation from here:
  // https://github.com/TypeStrong/ts-node/blob/48fc3903b11921339ea98787ed2d99753e684fd2/src/index.ts#L1219-L1226
  // https://github.com/TypeStrong/ts-node/blob/master/dist-raw/node-createrequire.js
  function resolveBabelJest() {
    if (typeof createRequire === 'function') {
      const jestLocation =
        resolveRelativeTo(path.join(rootDir, 'file.js'), 'jest') ||
        require.resolve('jest');
      const jestCoreLocation = resolveRelativeTo(jestLocation, '@jest/core')!;
      const jestConfigLocation = resolveRelativeTo(
        jestCoreLocation,
        'jest-config'
      )!;
      return (
        resolveRelativeTo(rootDir, 'babel-jest') ||
        resolveRelativeTo(jestConfigLocation, 'babel-jest')!
      );
    } else {
      return require.resolve('babel-jest');
    }
  }
  const config: JestConfigOptions = {
    transform: {
      '.(ts|tsx)$': require.resolve('ts-jest/dist'),
      '.(js|jsx)$': resolveBabelJest(), // jest's default
    },
    transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}'],
    testMatch: ['<rootDir>/**/*.(spec|test).{ts,tsx,js,jsx}'],
    testURL: 'http://localhost',
    rootDir,
    watchPlugins: [
      require.resolve('jest-watch-typeahead/filename'),
      require.resolve('jest-watch-typeahead/testname'),
    ],
  };

  return config;
}
