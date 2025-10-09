import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'

export default [
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'writable',
        module: 'writable',
        require: 'readonly',
        window: 'readonly',
        document: 'readonly',
        AbortSignal: 'readonly',
        AbortController: 'readonly',
        self: 'readonly',
        importScripts: 'readonly',
        globalThis: 'readonly',
        global: 'writable',
        btoa: 'readonly',
        fetch: 'readonly',
        DedicatedWorkerGlobalScope: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      'no-console': ['warn', { allow: ['error', 'warn'] }],
      'no-undef': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  },
  {
    files: ['tests/**/*.ts', 'tests/**/*.js'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'writable',
        module: 'writable',
        require: 'readonly',
        window: 'readonly',
        document: 'readonly',
        AbortSignal: 'readonly',
        AbortController: 'readonly',
        self: 'readonly',
        importScripts: 'readonly',
        globalThis: 'readonly',
        global: 'writable',
        btoa: 'readonly',
        fetch: 'readonly',
        DedicatedWorkerGlobalScope: 'readonly',
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      'no-console': ['warn', { allow: ['error', 'warn'] }],
      'no-undef': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  },
  {
    ignores: ['node_modules/', 'dist/', 'src/', 'tmp/', '**/*.test.ts', '**/*.spec.ts', 'eslint.config.js']
  }
]
