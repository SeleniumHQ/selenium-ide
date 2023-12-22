module.exports = {
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.base.json',
    },
  },
  projects: ['<rootDir>/packages/*/jest.config.js'],
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost/index.html',
  },
  moduleNameMapper: {
    '^.+\\.(css|scss)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['./scripts/jest/test.config.js'],
  testMatch: ['**/__test?(s)__/**/*.spec.[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
}
