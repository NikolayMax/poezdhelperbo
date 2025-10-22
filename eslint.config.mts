import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';

export default defineConfig([
	{
		ignores: ['node_modules/**', 'dist/**', '*.config.*'],
	},
	{
		files: ['**/*.{js,ts,mts}'],
		plugins: { js },
		extends: ['js/recommended'],
		languageOptions: { globals: globals.node },
		ignores: ['**/*.test.ts', '**/*.spec.ts', '**/*.mock.ts'],
	},
	{
		files: ['**/*.test.ts', '**/*.spec.ts', '**/*.mock.ts'],
		languageOptions: {
			globals: {
				...globals.jest, // или ...globals.mocha etc.
			},
		},
		rules: {},
	},
	tseslint.configs.recommended,
	prettier,
]);
