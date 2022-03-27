const pkg = require('./package.json')

module.exports = {
  extends: './../../.eslintrc.js',
  rules: {
    'node/no-missing-import': ['off'],
    'node/no-unpublished-import': [
      'error',
      {
        allowModules: Object.keys(pkg.devDependencies),
      },
    ],
    'import/no-unresolved': ['off'],
  },
}
