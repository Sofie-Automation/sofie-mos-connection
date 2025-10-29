import { readFileSync } from 'fs'
import { join } from 'path'
import * as XMLBuilder from 'xmlbuilder'
import { xml2js } from '../../utils/Utils.js'
import { IMOSItem, MosModel, stringifyMosObject } from '../../index.js'
import { ensureArray, ensureXMLObject, isXMLObject } from '../../mosModel/index.js'
import { describe, test, expect } from 'vitest'

function parseMosPluginMessageXml(xmlString: string) {
	const doc = xml2js(xmlString)

	if (isXMLObject(doc.mos)) {
		const res: {
			ncsReqAppInfo: boolean
			items: IMOSItem[]
		} = {
			ncsReqAppInfo: !!doc.mos.ncsReqAppInfo,
			items: [],
		}

		if (isXMLObject(doc.mos.ncsItem) && doc.mos.ncsItem.item) {
			res.items = ensureArray(doc.mos.ncsItem.item).map((item) =>
				MosModel.XMLMosItem.fromXML('ncsItem.item', ensureXMLObject(item, true), true)
			)
		}

		return res
	} else {
		return undefined
	}
}

function generateMosPluginItemXml(item: IMOSItem): string {
	const builder = XMLBuilder.create('ncsItem')
	MosModel.XMLMosItem.toXML(builder, item, true)
	return `<mos>${builder.toString()}</mos>`
}

describe('MOS XML to JavaScript object parser', () => {
	describe('mosXml2Js', () => {
		describe('Sample1', () => {
			const sample1XmlStr = readFileSync(join(__dirname, './mosSample1.xml'), 'utf-8')
			const sample1JsonStr = readFileSync(join(__dirname, './mosSample1.json'), 'utf-8')

			const jsonDoc = JSON.parse(sample1JsonStr)

			test('should match the json representation', () => {
				const actual = parseMosPluginMessageXml(sample1XmlStr)
				const actualJson = actual && stringifyMosObject(actual.items, true) // Strip out any MosString etc

				expect(actualJson).toEqual(jsonDoc.items)
			})

			test('converting via xml should be lossless', () => {
				const generatedXml = generateMosPluginItemXml(jsonDoc.items[0])
				const actual = parseMosPluginMessageXml(generatedXml)
				const actualJson = actual && stringifyMosObject(actual.items, true) // Strip out any MosString etc

				expect(actualJson).toEqual(jsonDoc.items)
			})
		})

		describe('Sample2', () => {
			const sampleXmlStr = readFileSync(join(__dirname, './mosSample2.xml'), 'utf-8')
			const sampleJsonStr = readFileSync(join(__dirname, './mosSample2.json'), 'utf-8')

			const jsonDoc = JSON.parse(sampleJsonStr)

			test('should match the json representation', () => {
				const actual = parseMosPluginMessageXml(sampleXmlStr)
				const actualJson = actual && stringifyMosObject(actual.items, true) // Strip out any MosString etc

				expect(actualJson).toEqual(jsonDoc.items)
			})

			test('converting via xml should be lossless', () => {
				for (let i = 0; i < jsonDoc.items.length; i++) {
					const generatedXml = generateMosPluginItemXml(jsonDoc.items[i])
					const actual = parseMosPluginMessageXml(generatedXml)

					const actualJson = actual && stringifyMosObject(actual.items[0], true) // Strip out any MosString etc

					expect(actualJson).toEqual(jsonDoc.items[i])
				}
			})
		})
		describe('Sample3 - test for singlepath with and without attributes', () => {
			const sampleXmlStr = readFileSync(join(__dirname, './mosSample3.xml'), 'utf-8')
			const sampleJsonStr = readFileSync(join(__dirname, './mosSample3.json'), 'utf-8')

			const jsonDoc = JSON.parse(sampleJsonStr)

			test('should match the json representation', () => {
				const actual = parseMosPluginMessageXml(sampleXmlStr)
				const actualJson = actual && stringifyMosObject(actual.items, true) // Strip out any MosString etc

				expect(actualJson).toEqual(jsonDoc.items)
			})

			test('converting via xml should be lossless', () => {
				for (let i = 0; i < jsonDoc.items.length; i++) {
					const generatedXml = generateMosPluginItemXml(jsonDoc.items[i])
					const actual = parseMosPluginMessageXml(generatedXml)

					const actualJson = actual && stringifyMosObject(actual.items[0], true) // Strip out any MosString etc

					expect(actualJson).toEqual(jsonDoc.items[i])
				}
			})
		})
	})
})
