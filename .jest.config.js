const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  preset: ['ts-jest', '@shelf/jest-mongodb'],
  testEnvironment: 'node',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  globalSetup: './<rootDir>/jestDbSetup.ts/setupDB',
  globalTeardown: './<rootDir>/jestDbSetup.ts/teardownDB',
  setupFilesAfterEnv: ['./<rootDir>/jestDbSetup.ts/clearDB'],
};
