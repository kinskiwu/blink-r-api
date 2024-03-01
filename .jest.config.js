const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  globalSetup: './<rootDir>/src/jest_mongodb_setup.ts/setupDB',
  globalTeardown: './<rootDir>/src/jest_mongodb_setup.ts/teardownDB',
  setupFilesAfterEnv: ['./<rootDir>/src/jest_mongodb_setup.ts/clearDB'],
};
