const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  preset: ['ts-jest', '@shelf/jest-mongodb'],
  testEnvironment: 'node',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  globalSetup: './<rootDir>/jest_mongodb_setup.ts/setupDB',
  globalTeardown: './<rootDir>/jest_mongodb_setup.ts/teardownDB',
  setupFilesAfterEnv: ['./<rootDir>/jest_mongodb_setup.ts/clearDB'],
};
