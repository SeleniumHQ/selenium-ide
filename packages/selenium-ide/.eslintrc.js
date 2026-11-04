const pkg = require('./package.json')

module.exports = {
  extends: './../../.eslintrc.js',
  rules: {
    'n/no-missing-import': ['off'],
    'n/no-unpublished-import': [
      'error',
      {
        allowModules: Object.keys(pkg.devDependencies),
      },
    ],
    'import/no-unresolved': ['off'],
  },
}
