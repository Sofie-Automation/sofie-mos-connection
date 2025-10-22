import { getMosTypes, stringifyMosType } from '../mosTypes.js'
import { describe, test, expect } from 'vitest'

describe('mosTypes', () => {
	test('getMosTypes', () => {
		const mosTypes = getMosTypes(false)

		expect(mosTypes.mosString128).toBeTruthy()
		expect(mosTypes.mosDuration).toBeTruthy()
		expect(mosTypes.mosTime).toBeTruthy()
	})

	test('stringifyMosType', () => {
		const mosTypes = getMosTypes(false)

		const mosDuration = mosTypes.mosDuration.create('1:23:45')
		const mosTime = mosTypes.mosTime.create('2009-04-11T14:22:07Z')
		const mosString = mosTypes.mosString128.create('test test')

		expect(stringifyMosType(mosDuration, mosTypes)).toEqual({
			isMosType: true,
			stringValue: '1:23:45',
		})
		expect(stringifyMosType(mosTime, mosTypes)).toEqual({
			isMosType: true,
			stringValue: '2009-04-11T14:22:07,000Z',
		})
		expect(stringifyMosType(mosString, mosTypes)).toEqual({
			isMosType: true,
			stringValue: 'test test',
		})

		expect(stringifyMosType(124, mosTypes)).toEqual({
			isMosType: false,
		})
	})
})
