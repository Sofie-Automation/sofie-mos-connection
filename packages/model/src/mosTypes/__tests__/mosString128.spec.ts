import { getMosTypes } from '../../mosTypes.js'
import { describe, test, expect } from 'vitest'

describe('MosString128', () => {
	test('basic', () => {
		const mosTypes = getMosTypes(true)

		const mosString = mosTypes.mosString128.create('test test')
		expect(mosTypes.mosString128.stringify(mosString)).toBe('test test')
		expect(mosTypes.mosString128.valueOf(mosString)).toBe('test test')
		expect(() => mosTypes.mosString128.validate(mosString)).not.toThrow()

		// @ts-expect-error wrong input, but still:
		expect(mosTypes.mosString128.valueOf('test test')).toBe('test test')
		// @ts-expect-error wrong input, but still:
		expect(mosTypes.mosString128.stringify('test test')).toBe('test test')
	})
	test('is', () => {
		const mosTypes = getMosTypes(true)

		const mosString = mosTypes.mosString128.create('test test')
		expect(mosTypes.mosString128.is(mosString)).toBe(true)
		expect(mosTypes.mosDuration.is(mosString)).toBe(false)
		expect(mosTypes.mosTime.is(mosString)).toBe(false)

		expect(mosTypes.mosString128.is({})).toBe(false)
		expect(mosTypes.mosString128.is(null)).toBe(false)
		expect(mosTypes.mosString128.is('abc')).toBe(false)
		expect(mosTypes.mosString128.is(123)).toBe(false)
	})
	test('should throw when a too long string is created', () => {
		const strict = getMosTypes(true)
		const notStrict = getMosTypes(false)

		let tooLongStr = ''
		for (let i = 0; i < 130; i++) {
			tooLongStr += '' + i
		}
		expect(() => {
			notStrict.mosString128.create(tooLongStr)
		}).not.toThrow()
		expect(() => {
			strict.mosString128.create(tooLongStr)
		}).toThrow(/too long/)
	})
	test('Various values', () => {
		const mosTypes = getMosTypes(true)
		function toStr(input: any) {
			return mosTypes.mosString128.stringify(mosTypes.mosString128.create(input))
		}

		expect(toStr('test test')).toEqual('test test')
		expect(toStr('')).toEqual('')
		expect(toStr({})).toEqual('')
		expect(toStr(12)).toEqual('12')
		expect(toStr(true)).toEqual('true')
		expect(toStr(null)).toEqual('null')
		expect(toStr({ text: 'hello' })).toEqual('hello')
		expect(toStr({ a: 'b' })).toEqual('{"a":"b"}')

		expect(toStr(mosTypes.mosString128.create('test test'))).toEqual('test test')

		expect(
			mosTypes.mosString128.stringify(
				JSON.parse(JSON.stringify({ a: mosTypes.mosString128.create('test test') })).a
			)
		).toEqual('test test')

		// special case: "undefined" is parsed as an empty string
		expect(toStr('undefined')).toEqual('')
	})
})
