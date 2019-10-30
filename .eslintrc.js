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
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      rules: {
        '@typescript-eslint/array-type': ['error', { default: 'array' }],
        '@typescript-eslint/ban-types': 'error',
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/interface-name-prefix': ['error', 'never'],
        'no-dupe-class-members': 'off',
        'no-unused-vars': 'off',
        'no-inner-declarations': 0, // for typescript namespace
      },
    },
  ],
  plugins: ['@typescript-eslint', 'jest', 'react', 'prettier', 'no-only-tests'],
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
    'node/no-unpublished-require': [
      'error',
      {
        allowModules: ['electron'],
      },
    ],
    'node/no-unsupported-features/es-syntax': 0,
    'node/no-unsupported-features/node-builtins': 0,
    'node/shebang': [
      'error',
      {
        convertPath: {
          'src/**/*.js': ['src/(.+)$', 'dist/$1'],
          'src/**/*.ts': ['src/(.+)ts$', 'dist/$1js'],
        },
      },
    ],
    'node/no-missing-import': [
      'error',
      {
        allowModules: ['electron'],
        tryExtensions: ['.js', '.jsx', '.json', '.ts', '.tsx', '.node'],
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}
