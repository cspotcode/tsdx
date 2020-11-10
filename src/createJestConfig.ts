import { Config } from '@jest/types';
import { createRequire } from 'module';
import * as Path from 'path';

export type JestConfigOptions = Partial<Config.InitialOptions>;

export function createJestConfig(
  _: (relativePath: string) => void,
  rootDir: string
): JestConfigOptions {

  function resolveRelativeTo (dir: string, moduleSpecifier: string) {
    const req = createRequire(dir);
    try {
      return req.resolve(moduleSpecifier);
    } catch {
      return null;
    }
  }
  const jestLocation = resolveRelativeTo(Path.join(rootDir, 'file.js'), 'jest') || require.resolve('jest')
  const jestCoreLocation = resolveRelativeTo(jestLocation, '@jest/core')!
  const jestConfigLocation = resolveRelativeTo(jestCoreLocation, 'jest-config')!

  const config: JestConfigOptions = {
    transform: {
      '.(ts|tsx)$': require.resolve('ts-jest/dist'),
      '.(js|jsx)$': resolveRelativeTo(rootDir, 'babel-jest') || resolveRelativeTo(jestConfigLocation, 'babel-jest')!, // jest's default
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
