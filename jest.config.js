// module.exports = {
//   testEnvironment: 'node',
//   reporters: ['default', './jest-reporter'],
//   transform: { '^.+\\.jsx?$': 'babel-jest' },
//   testMatch: ['__tests__/*.ts'],
// }

module.exports = {
  testEnvironment: 'node',
  reporters: ['default'],
  transform: { '^.+\\.jsx?$': 'babel-jest' },
  testMatch: ['**/__tests__/*.js'],
  moduleNameMapper: {
    'seleniumide/(.*)': '<rootDir>/$1',
  }
};
