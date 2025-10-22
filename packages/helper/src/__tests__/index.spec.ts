import * as MOS from '../index.js'
import { describe, test, expect } from 'vitest'

describe('Index', () => {
	test('ensure that types and enums are exposed', () => {
		let a: any
		// Type checks:
		a = (_: MOS.IMOSItem) => null
		a = (_: MOS.IMOSRunningOrder) => null
		a = (_: MOS.IMOSRunningOrderBase) => null
		a = (_: MOS.IMOSRunningOrderStatus) => null
		a = (_: MOS.IMOSStoryStatus) => null
		a = (_: MOS.IMOSItemStatus) => null
		a = (_: MOS.IMOSStoryAction) => null
		a = (_: MOS.IMOSROStory) => null
		a = (_: MOS.IMOSItemAction) => null
		a = (_: MOS.IMOSItem) => null
		a = (_: MOS.IMOSROAction) => null
		a = (_: MOS.IMOSROReadyToAir) => null
		a = (_: MOS.IMOSROFullStory) => null

		// @ts-expect-error types test
		a = (_: MOS.ThisDoesNotExist) => null
		if (a) a()

		expect(typeof MOS.getMosTypes).toBe('function')

		expect(MOS.IMOSObjectStatus).toBeTruthy()

		expect(MOS.IMOSScope).toBeTruthy()
		expect(MOS.IMOSScope.PLAYLIST).toBeTruthy()
	})
	test('ensure that helpers are exposed', () => {
		expect(typeof MOS.xml2js).toBe('function')
		expect(MOS.MosModel.XMLMosItem.fromXML).toBeTruthy()
		expect(MOS.MosModel.XMLMosItem.toXML).toBeTruthy()
		expect(MOS.pad).toBeTruthy()
	})
	test('manipulate xml data', () => {
		// The ensure* methods are useful when reading the XML data

		const testTypes = (anyData: MOS.AnyXMLObject) => {
			// ensureString
			testType<string>(MOS.ensureString(anyData.strValue, true))

			testType<object>(MOS.ensureXMLObject(anyData.objA, true))
			// @ts-expect-error wrong return type
			testType<string>(MOS.ensureXMLObject(anyData.objA, true))

			testType<string>(MOS.ensureString(MOS.ensureXMLObject(anyData.objA, true).strValue, true))

			testType<string>(MOS.ensureString(MOS.ensureXMLObjectArray(anyData.arrayA, true)[0].strValue, true))

			expect(1).toBeTruthy()
		}

		const testType = <T>(_a: T) => {
			return
		}

		testTypes({
			strValue: 'test',
			objA: {
				strValue: 'test',
			},
			arrayA: [
				{
					strValue: 'test',
				},
			],
		})
	})
})
