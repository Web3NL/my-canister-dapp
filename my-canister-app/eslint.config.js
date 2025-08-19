import rootConfig from '../eslint.config.js';
import svelte from 'eslint-plugin-svelte';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import svelteConfig from './svelte.config.js';

export default [
  ...rootConfig,
  // Svelte-specific setup lives only here (app is sole Svelte code owner)
  ...svelte.configs['flat/recommended'],
  ...svelte.configs['flat/prettier'],
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        $Generic: 'readonly',
        $Props: 'readonly',
        $Events: 'readonly',
        $Slots: 'readonly',
      },
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.svelte'],
        // Provide Svelte config for rules that auto-adjust (per official docs)
        svelteConfig,
        // Avoid project-wide type service for speed; rely on tsc/svelte-check instead.
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { args: 'none', ignoreRestSiblings: true },
      ],
    },
  },
];
