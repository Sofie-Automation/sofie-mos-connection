// @ts-check

import { generateEslintConfig } from '@sofie-automation/code-standard-preset/eslint/main.mjs'

const baseConfig = await generateEslintConfig({
	ignores: ['vitest.config.ts', 'packages/quick-mos/input/**'],
	testRunner: 'vitest',
})

const customConfig = [
	...baseConfig,

	{
		files: ['**/*.ts', '**/*.tsx'],
		rules: {
			'no-console': 'error',
		},
	},
	{
		files: [
			'packages/mos-dummy-device/**',
			'packages/quick-mos/**',
			'scripts/**',
			'packages/examples/**',
			'**/__tests__/**/*',
		],
		rules: {
			'n/no-extraneous-require': 'off',
			'n/no-extraneous-import': 'off',
			'n/no-process-exit': 'off',
			'no-console': 'off',
		},
	},

	// {
	// 	files: ['**/examples/*.js', '**/*.cjs'],
	// 	rules: {
	// 		'@typescript-eslint/no-require-imports': 'off',
	// 	},
	// },
	// {
	// 	files: ['**/__tests__/**/*', '**/examples/**/*'],
	// 	rules: {
	// 		'n/no-extraneous-require': 'off',
	// 		'n/no-extraneous-import': 'off',
	// 		'n/no-process-exit': 'off',
	// 	},
	// },
	// {
	// 	files: ['packages/webhid-demo/src/**/*'],
	// 	rules: {
	// 		'@typescript-eslint/no-require-imports': 'off',
	// 		'n/no-missing-import': 'off',
	// 	},
	// },
]

export default customConfig
