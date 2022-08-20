/** eslint-disable **/
const path = require('path');
const process = require('process');

module.exports = {
  reporters: ['default'],
  rootDir: path.resolve(__dirname),
  testEnvironment: 'node',
  testPathIgnorePatterns: ["<rootDir>/node_modules/"],
  verbose: true,
};


