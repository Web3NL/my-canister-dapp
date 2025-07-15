import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import path from 'path';
import { fileURLToPath } from 'url';

const isCI = process.env.CI === 'true' || process.env.NODE_ENV === 'production';
const cicdRule = isCI ? 'off' : 'off'; // off for now

// Robust way to get the current directory that works in all environments
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...svelte.configs['flat/recommended'],
  prettier,
  ...svelte.configs['flat/prettier'],
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        project: [
          './tsconfig.json',
          './my-canister-dapp-js/canister-dashboard-frontend/tsconfig.json',
          './my-canister-app/tsconfig.json',
          './my-canister-dapp-js/my-canister-dashboard-js/tsconfig.json',
          './examples/my-hello-world/src/my-hello-world-frontend/tsconfig.json',
        ],
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      'no-console': 'warn',
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-proto': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          'args': 'none',
        },
      ],
      '@typescript-eslint/no-explicit-any': cicdRule,
      '@typescript-eslint/prefer-nullish-coalescing': cicdRule,
      '@typescript-eslint/prefer-optional-chain': cicdRule,
      '@typescript-eslint/consistent-type-imports': cicdRule,
      '@typescript-eslint/no-unsafe-assignment': cicdRule,
      '@typescript-eslint/no-unsafe-member-access': cicdRule,
      '@typescript-eslint/no-unsafe-call': cicdRule,
      '@typescript-eslint/no-unsafe-argument': cicdRule,
      '@typescript-eslint/no-unsafe-return': cicdRule,
      '@typescript-eslint/no-unnecessary-condition': cicdRule,
      '@typescript-eslint/no-unnecessary-type-assertion': cicdRule,
      '@typescript-eslint/strict-boolean-expressions': cicdRule,
      '@typescript-eslint/restrict-template-expressions': cicdRule,
      '@typescript-eslint/no-floating-promises': cicdRule,
      '@typescript-eslint/await-thenable': cicdRule,
    },
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        $Generic: 'readonly',
        $Props: 'readonly',
        $Events: 'readonly',
        $Slots: 'readonly',
      },
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.svelte'],
      },
    },
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'build/**',
      '.svelte-kit/**',
      'target/**',
      '.dfx/**',
      'assets/**',
      '**/*.config.js',
      '**/*.config.ts',
      // CI/CD specific ignores
      '.github/**',
      'coverage/**',
      '.nyc_output/**',
      'test-results/**',
      'test-output/**',
      // Compiled outputs
      '**/*.d.ts',
      '**/declarations/**',
      '**/wasm/**',
    ],
  },
];
