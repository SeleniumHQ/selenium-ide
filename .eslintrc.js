module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
    webextensions: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'plugin:react/recommended',
    'prettier',
  ],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
      jsx: true,
      legacyDecorators: true,
    },
    sourceType: 'module',
  },
  plugins: ['jest', 'react', 'prettier', 'no-only-tests'],
  rules: {
    'prettier/prettier': 'error',
    'react/prop-types': [0],
    'no-const-assign': 'error',
    'no-this-before-super': 'error',
    'no-undef': 'error',
    'no-unreachable': 'error',
    'no-unused-vars': [
      'error',
      { varsIgnorePattern: '^_', args: 'all', argsIgnorePattern: '^_' },
    ],
    'constructor-super': 'error',
    'valid-typeof': 'error',
    'no-only-tests/no-only-tests': 'error',
    'node/no-unsupported-features/es-syntax': 0,
    'node/no-unsupported-features/node-builtins': 0,
    'node/shebang': [
      'error',
      {
        convertPath: {
          'src/**/*.js': ['src/(.+)$', 'dist/$1'],
        },
      },
    ],
  },
}
