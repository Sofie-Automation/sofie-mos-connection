/// <reference types="vitest/config" />
import { defineConfig } from 'vite'

export default defineConfig({
	test: {
		environment: 'node',
		coverage: {
			provider: 'v8',
			include: ['**/src/**/*.ts', '!**/node_modules/**'],
		},
	},
})
