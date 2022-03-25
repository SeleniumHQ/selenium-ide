module.exports = {
  extends: './../../.eslintrc.js',
  rules: {
    'node/no-missing-import': ['off'],
    'node/no-unpublished-import': [
      'error',
      {
        allowModules: [
          '@medv/finder',
          'electron',
          'scroll-into-view-if-needed',
        ],
      },
    ],
    'import/no-unresolved': ['off'],
  },
}
