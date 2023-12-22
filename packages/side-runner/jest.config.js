module.exports = {
  testEnvironmentOptions: {
    url: 'http://localhost/index.html',
  },
  testMatch: ['**/packages/**/__test?(s)__/**/*.spec.[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
}
