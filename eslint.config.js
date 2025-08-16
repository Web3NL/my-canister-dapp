import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    // Minimal, standard recommended setup: no custom project parser (fast), no extra rules.
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
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
      '.github/**',
      'coverage/**',
      '.nyc_output/**',
      'test-results/**',
      'test-output/**',
      '**/*.d.ts',
      '**/declarations/**',
      '**/wasm/**',
    ],
  },
];
