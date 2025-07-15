import rootConfig from '../eslint.config.js';

export default [
  ...rootConfig,
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        // Don't use project-based type-aware linting for Svelte files
        // as they can have complex import/export patterns
        project: null,
      },
    },
    rules: {
      // Disable type-aware rules for Svelte files to avoid parsing issues
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
];
