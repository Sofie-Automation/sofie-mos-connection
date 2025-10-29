import { getMosTypes } from '../../mosTypes.js'
import { describe, test, expect } from 'vitest'

describe('MosDuration', () => {
	test('basic', () => {
		const mosTypes = getMosTypes(true)

		const mosDuration = mosTypes.mosDuration.create('1:23:45')
		expect(mosTypes.mosDuration.valueOf(mosDuration)).toBe(5025)
		expect(() => mosTypes.mosDuration.validate(mosDuration)).not.toThrow()

		expect(() => mosTypes.mosDuration.create('asdf')).toThrow(/Invalid input/)
		expect(() => mosTypes.mosDuration.create('1:23:xx')).toThrow(/Invalid input/)
		expect(() => mosTypes.mosDuration.create('0:00:00')).not.toThrow()
		// @ts-expect-error wrong input type
		expect(() => mosTypes.mosDuration.create([])).toThrow(/Invalid input/)

		// @ts-expect-error wrong input, but still:
		expect(mosTypes.mosDuration.valueOf(5025)).toBe(5025)
	})
	test('is', () => {
		const mosTypes = getMosTypes(true)

		const mosDuration = mosTypes.mosDuration.create('1:23:45')
		expect(mosTypes.mosDuration.is(mosDuration)).toBe(true)
		expect(mosTypes.mosString128.is(mosDuration)).toBe(false)
		expect(mosTypes.mosTime.is(mosDuration)).toBe(false)

		expect(mosTypes.mosDuration.is({})).toBe(false)
		expect(mosTypes.mosDuration.is(null)).toBe(false)
		expect(mosTypes.mosDuration.is('abc')).toBe(false)
		expect(mosTypes.mosDuration.is(123)).toBe(false)

		expect(mosTypes.mosDuration.is({ _mosDuration: 1234 })).toBe(true)
	})
	test('stringify', () => {
		const mosTypes = getMosTypes(true)

		const mosDuration = mosTypes.mosDuration.create('1:23:45')
		expect(mosTypes.mosDuration.stringify(mosDuration)).toBe('1:23:45')

		// @ts-expect-error wrong input, but still:
		expect(mosTypes.mosDuration.stringify('1:23:45')).toBe('1:23:45')
	})
	test('parse durations correctly', () => {
		const mosTypes = getMosTypes(true)
		function toValue(input: any) {
			return mosTypes.mosDuration.valueOf(mosTypes.mosDuration.create(input))
		}
		function toString(input: any) {
			return mosTypes.mosDuration.stringify(mosTypes.mosDuration.create(input))
		}
		expect(toValue('1:23:45')).toBe(5025)
		expect(toString(toValue('1:23:45'))).toBe('1:23:45')
		expect(toString('1:23:45')).toBe('1:23:45')
		expect(toString('1:2:3')).toBe('1:02:03')

		expect(toString('01:23:45')).toBe('1:23:45')
		expect(toString('2:05:23')).toBe('2:05:23')
		expect(toString('1:65:23')).toBe('2:05:23')
	})
})
