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
  parser: '@babel/eslint-parser',
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
        'import/no-unresolved': 'error',
        // import/no-unresolved checks imports in TypeScript; eslint-plugin-node
        // can't resolve packages that only have "exports", such as ink
        'node/no-missing-import': 'off',
        '@typescript-eslint/array-type': ['error', { default: 'array' }],
        '@typescript-eslint/no-empty-object-type': 'error',
        '@typescript-eslint/no-unsafe-function-type': 'error',
        '@typescript-eslint/no-wrapper-object-types': 'error',
        '@typescript-eslint/no-unused-vars': [
          'error',
          // caughtErrors: 'none' was the default before typescript-eslint 8
          {
            argsIgnorePattern: '^_',
            caughtErrors: 'none',
            ignoreRestSiblings: true,
          },
        ],
        'no-dupe-class-members': 'off',
        'no-undef': 'off',
        'no-unused-vars': 'off',
        'no-inner-declarations': 0, // for typescript namespace
      },
    },
  ],
  plugins: [
    '@typescript-eslint',
    'import',
    'jest',
    'react',
    'prettier',
    'no-only-tests',
  ],
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
    'node/no-missing-require': [
      'error',
      {
        allowModules: ['electron'],
        tryExtensions: ['.js', '.jsx', '.json', '.ts', '.tsx', '.node'],
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
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        package: ['./tsconfig.json', './packages/*/tsconfig.json'],
      },
    },
    react: {
      // React is only installed in the packages that use it
      version: '18',
    },
  },
  root: true,
}
