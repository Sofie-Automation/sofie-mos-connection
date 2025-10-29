import { ParseError } from '../mosModel/ParseError.js'
import { describe, test, expect } from 'vitest'

describe('ParseError', () => {
	function throwsError() {
		throw new Error('test')
	}
	function throwsParseError(path: string) {
		throw ParseError.handleCaughtError(path, 'test')
	}
	function handleError(fcn: () => any) {
		try {
			fcn()
		} catch (e) {
			throw ParseError.handleCaughtError('outer', e)
		}
	}
	function getThrownStack(fcn: () => any) {
		try {
			fcn()
		} catch (e) {
			return (e as any).stack
		}
	}
	test('handle thrown errors', () => {
		expect(() => throwsError()).toThrow('test')

		expect(() => throwsParseError('a')).toThrow('a: test')

		expect(() => handleError(() => throwsParseError('a'))).toThrow('outer.a: test')

		// Test thrown stack
		expect(getThrownStack(() => throwsError())).toMatch(/Error: test[\w\W]*at getThrownStack/gm)
		expect(getThrownStack(() => throwsParseError('a'))).toMatch(/ParseError: a: test[\w\W]*at getThrownStack/gm)
		expect(getThrownStack(() => handleError(() => throwsParseError('a')))).toMatch(
			/ParseError: outer.a: test[\w\W]*at getThrownStack/gm
		)
	})
})
