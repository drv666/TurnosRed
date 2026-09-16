import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  { ignores: ['dist/**', 'node_modules/**'] },
  {
    files: ['src/**/*.ts'],
    languageOptions: { parserOptions: { project: './tsconfig.json' } },
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: Object.fromEntries(
        [
          'process',
          'Response',
          'fetch',
          'AbortSignal',
          'structuredClone',
          'console',
          'URL',
          'performance',
        ].map((name) => [name, 'readonly']),
      ),
    },
    rules: { 'no-empty': ['error', { allowEmptyCatch: true }] },
  },
);
