module.exports = {
  // The snapshots were written with the format from before Jest 29
  snapshotFormat: { escapeString: true, printBasicPrototype: true },
  testEnvironmentOptions: {
    url: 'http://localhost/index.html',
  },
  testMatch: ['**/packages/**/__test?(s)__/**/*.spec.[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transform: {
    // Find the repo's babel.config.js from the package folder
    '^.+\\.jsx?$': ['babel-jest', { rootMode: 'upward' }],
    '^.+\\.ts?$': 'ts-jest',
  },
}
