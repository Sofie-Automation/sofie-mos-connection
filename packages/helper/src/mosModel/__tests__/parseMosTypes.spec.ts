import { AnyXMLValue, AnyXMLValueSingular, IMOSObjectType } from '@mos-connection/model'
import { getParseMosTypes } from '../parseMosTypes.js'
import { describe, test, expect } from 'vitest'

describe('parseMosTypes', () => {
	test('createRequired types', () => {
		const parseMosTypes = getParseMosTypes(true)

		const testTypes = (xmlValue: AnyXMLValue, xmlValueSingular: AnyXMLValueSingular) => {
			parseMosTypes.mosString128.createRequired(xmlValue, '')
			parseMosTypes.mosTime.createRequired(xmlValue, '')
			parseMosTypes.mosDuration.createRequired(xmlValue, '')

			parseMosTypes.mosString128.createRequired(xmlValueSingular, '')
			parseMosTypes.mosTime.createRequired(xmlValueSingular, '')
			parseMosTypes.mosDuration.createRequired(xmlValueSingular, '')

			// @ts-expect-error bad type
			parseMosTypes.mosString128.createRequired({ somethingNonXml: 1234 }, '')
			// @ts-expect-error bad type
			parseMosTypes.mosTime.createRequired({ somethingNonXml: 1234 }, '')
			// @ts-expect-error bad type
			parseMosTypes.mosDuration.createRequired({ somethingNonXml: 1234 }, '')
		}
		try {
			testTypes('', '')
		} catch {
			// Ignore any errors
		}

		expect(1).toEqual(1)
	})
	test('createOptional types', () => {
		const parseMosTypes = getParseMosTypes(true)

		const testTypes = (xmlValue: AnyXMLValue, xmlValueSingular: AnyXMLValueSingular) => {
			parseMosTypes.mosString128.createOptional(xmlValue, '')
			parseMosTypes.mosTime.createOptional(xmlValue, '')
			parseMosTypes.mosDuration.createOptional(xmlValue, '')

			parseMosTypes.mosString128.createOptional(xmlValueSingular, '')
			parseMosTypes.mosTime.createOptional(xmlValueSingular, '')
			parseMosTypes.mosDuration.createOptional(xmlValueSingular, '')

			// @ts-expect-error bad type
			parseMosTypes.mosString128.createOptional({ somethingNonXml: 1234 }, '')
			// @ts-expect-error bad type
			parseMosTypes.mosTime.createOptional({ somethingNonXml: 1234 }, '')
			// @ts-expect-error bad type
			parseMosTypes.mosDuration.createOptional({ somethingNonXml: 1234 }, '')
		}
		try {
			testTypes('', '')
		} catch {
			// Ignore any errors
		}

		expect(1).toEqual(1)
	})
	test('stringEnum', () => {
		const parseMosTypes = getParseMosTypes(true)

		expect(parseMosTypes.stringEnum.createRequired({ value: 'STILL', enum: IMOSObjectType }, '')).toBe(
			IMOSObjectType.STILL
		)

		expect(() => {
			parseMosTypes.stringEnum.createRequired({ value: 'wrongValue', enum: IMOSObjectType }, '')
		}).toThrow()

		expect(1).toEqual(1)
	})
})
