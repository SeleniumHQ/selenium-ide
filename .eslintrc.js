module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
    webextensions: true,
  },
  extends: ['eslint:recommended', 'plugin:react/recommended', 'prettier'],
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
      files: ["**/*.ts", "**/*.tsx"],
      parser: "@typescript-eslint/parser",
      rules: {
        '@typescript-eslint/array-type': ['error', {default: 'generic'}],
        '@typescript-eslint/ban-types': 'error',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {argsIgnorePattern: '^_'},
        ],
        '@typescript-eslint/interface-name-prefix': [
          'error',
          'never',
        ],
        'no-dupe-class-members': 'off',
        'no-unused-vars': 'off',
      },
    }
  ],
  plugins: ['@typescript-eslint', 'jest', 'react', 'prettier'],
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
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}
