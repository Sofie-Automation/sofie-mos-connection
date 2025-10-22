import {
	stringifyMosObject,
	Stringified,
	IMOSString128,
	IMOSDuration,
	IMOSTime,
	getMosTypes,
} from '../../../../helper/src/index.js'
import { describe, test, expect } from 'vitest'

function assertTypes<_A extends _B, _B>(): void {
	// nothing, just a type check
}

describe('stringifyMosObject', () => {
	test('type', () => {
		type A = {
			str: IMOSString128
			dur: IMOSDuration
			time: IMOSTime
			num: number
			date: Date
			obj: {
				prop: {
					str: IMOSString128
					dur: IMOSDuration
					time: IMOSTime
					num: number
					date: Date
				}
			}
			valueArray: [IMOSString128]
			objArray: [
				{
					str: IMOSString128
					dur: IMOSDuration
					time: IMOSTime
					num: number
					date: Date
				},
			]
		}
		type Astr = {
			str: string
			dur: string
			time: string
			num: number
			date: Date
			obj: {
				prop: {
					str: string
					dur: string
					time: string
					num: number
					date: Date
				}
			}
			valueArray: [string]
			objArray: [
				{
					str: string
					dur: string
					time: string
					num: number
					date: Date
				},
			]
		}

		assertTypes<Astr, Stringified<A>>()

		expect(1).toBe(1) // no test, just a type check
	})

	test('conversion', () => {
		const mosTypes = getMosTypes(true)

		const org = {
			str: mosTypes.mosString128.create('str'),
			dur: mosTypes.mosDuration.create('2:05:14'),
			time: mosTypes.mosTime.create('2001-01-01T01:23:45'),
			num: 42,
			nul: null,
			bool: false,
			date: new Date('2001-01-01T12:34:56'),
			map: new Map([
				[1, 'one'],
				[2, 'two'],
				[3, 'three'],
			]),
			obj: {
				prop: {
					str: mosTypes.mosString128.create('str'),
					dur: mosTypes.mosDuration.create('2:05:14'),
					time: mosTypes.mosTime.create('2001-01-01T01:23:45'),
					num: 42,
					nul: null,
					bool: false,
					date: new Date('2001-01-01T12:34:56'),
					map: new Map([
						[1, 'one'],
						[2, 'two'],
						[3, 'three'],
					]),
				},
			},
			valueArray: [mosTypes.mosString128.create('str')],
			objArray: [
				{
					str: mosTypes.mosString128.create('str'),
					dur: mosTypes.mosDuration.create('2:05:14'),
					time: mosTypes.mosTime.create('2001-01-01T01:23:45'),
					num: 42,
					nul: null,
					undef: undefined,
					bool: false,
					date: new Date('2001-01-01T12:34:56'),
					map: new Map([
						[1, 'one'],
						[2, 'two'],
						[3, 'three'],
					]),
				},
			],
		}
		const stringified = {
			str: 'str',
			dur: '2:05:14',
			time: '2001-01-01T01:23:45,000Z',
			num: 42,
			nul: null,
			bool: false,
			date: new Date('2001-01-01T12:34:56'),
			map: new Map([
				[1, 'one'],
				[2, 'two'],
				[3, 'three'],
			]),
			obj: {
				prop: {
					str: 'str',
					dur: '2:05:14',
					time: '2001-01-01T01:23:45,000Z',
					num: 42,
					nul: null,
					bool: false,
					date: new Date('2001-01-01T12:34:56'),
					map: new Map([
						[1, 'one'],
						[2, 'two'],
						[3, 'three'],
					]),
				},
			},
			valueArray: ['str'],
			objArray: [
				{
					str: 'str',
					dur: '2:05:14',
					time: '2001-01-01T01:23:45,000Z',
					num: 42,
					nul: null,
					bool: false,
					date: new Date('2001-01-01T12:34:56'),
					map: new Map([
						[1, 'one'],
						[2, 'two'],
						[3, 'three'],
					]),
				},
			],
		}

		expect(stringifyMosObject(org, true)).toStrictEqual(stringified)
	})
})
