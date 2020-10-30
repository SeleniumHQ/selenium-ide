module.exports = {
  testEnvironment: 'node',
  reporters: ['default'],
  transform: { '^.+\\.jsx?$': 'babel-jest' },
  testMatch: ['**/__tests__/*.js', '**/__tests__/**/*.js'],
  moduleNameMapper: {
    'seleniumide/(.*)': '<rootDir>/$1',
  }
};
