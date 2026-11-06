import { createRequire } from 'node:module'
import js from '@eslint/js'
import eslintReact from '@eslint-react/eslint-plugin'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import prettierConfig from 'eslint-config-prettier/flat'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import importX from 'eslint-plugin-import-x'
import n from 'eslint-plugin-n'
import noOnlyTests from 'eslint-plugin-no-only-tests'
import prettier from 'eslint-plugin-prettier'
import globals from 'globals'

const require = createRequire(import.meta.url)
const idePackage = require('./packages/selenium-ide/package.json')

const tsFiles = ['**/*.ts', '**/*.mts', '**/*.tsx']

export default [
  {
    ignores: [
      '**/node_modules',
      '**/dist',
      '**/build',
      '**/gen',
      '**/trace',
      '**/third-party',
      '**/json',
      // Code export packages are outside the style guide
      'packages/code-export-*',
      'babel.config.js',
    ],
  },
  js.configs.recommended,
  n.configs['flat/recommended'],
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        ...globals.webextensions,
      },
    },
    plugins: {
      'no-only-tests': noOnlyTests,
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
      'no-only-tests/no-only-tests': 'error',
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          args: 'all',
          argsIgnorePattern: '^_',
          // caughtErrors: 'none' was the default before ESLint 9
          caughtErrors: 'none',
        },
      ],
      'n/no-unpublished-require': ['error', { allowModules: ['electron'] }],
      'n/no-unsupported-features/es-syntax': 'off',
      'n/no-unsupported-features/node-builtins': 'off',
      'n/hashbang': [
        'error',
        {
          convertPath: {
            'src/**/*.js': ['src/(.+)$', 'dist/$1'],
            'src/**/*.ts': ['src/(.+)ts$', 'dist/$1js'],
          },
        },
      ],
      'n/no-missing-require': [
        'error',
        {
          allowModules: ['electron'],
          tryExtensions: ['.js', '.jsx', '.json', '.ts', '.tsx', '.node'],
        },
      ],
      'n/no-missing-import': [
        'error',
        {
          allowModules: ['electron'],
          tryExtensions: ['.js', '.jsx', '.json', '.ts', '.tsx', '.node'],
        },
      ],
    },
  },
  {
    files: tsFiles,
    languageOptions: { parser: tsParser },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'import-x': importX,
    },
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
          project: ['./tsconfig.json', './packages/*/tsconfig.json'],
          noWarnOnMultipleProjects: true,
        }),
      ],
    },
    rules: {
      'import-x/no-unresolved': 'error',
      // import-x/no-unresolved checks imports in TypeScript; eslint-plugin-n
      // can't resolve packages that only have "exports"
      'n/no-missing-import': 'off',
      '@typescript-eslint/array-type': ['error', { default: 'array' }],
      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/no-unsafe-function-type': 'error',
      '@typescript-eslint/no-wrapper-object-types': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          // caughtErrors: 'none' was the default before typescript-eslint 8
          caughtErrors: 'none',
          ignoreRestSiblings: true,
        },
      ],
      'no-dupe-class-members': 'off',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      // TypeScript namespaces
      'no-inner-declarations': 'off',
    },
  },
  {
    files: ['**/*.tsx'],
    ...eslintReact.configs['recommended-typescript'],
  },
  {
    files: ['packages/selenium-ide/**'],
    rules: {
      'n/no-missing-import': 'off',
      'n/no-unpublished-import': [
        'error',
        { allowModules: Object.keys(idePackage.devDependencies) },
      ],
    },
  },
  {
    files: tsFiles.map((pattern) => `packages/selenium-ide/${pattern}`),
    rules: {
      'import-x/no-unresolved': 'off',
    },
  },
  prettierConfig,
]
