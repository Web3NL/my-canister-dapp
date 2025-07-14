import rootConfig from '../../eslint.config.js';

export default [
  ...rootConfig,
  {
    files: ['src/**/*.js'],
    rules: {
      // Turn off TypeScript-specific rules for JavaScript files
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      // '@typescript-eslint/no-unsafe-argument': 'off',
      // '@typescript-eslint/no-unsafe-return': 'off',
    }
  }
];