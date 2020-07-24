module.exports = {
    testEnvironment: 'node',
    reporters: ['default', './jest-reporter'],
    transform: { '^.+\\.jsx?$': 'babel-jest' },
    testMatch: ['__tests__/*']
};
