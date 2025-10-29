import { IMOSROFullStoryBodyItem, IMOSROFullStory, AnyXMLValue } from '@mos-connection/model'
import { XMLROStory, XMLMosItem } from '../profile2/xmlConversion.js'
import { omitUndefined } from '../lib.js'
import { getParseMosTypes } from '../parseMosTypes.js'
import { ParseError } from '../ParseError.js'
import { ensureXMLObject, ensureXMLObjectArray } from '../../utils/ensureMethods.js'

/* eslint-disable @typescript-eslint/no-namespace */
export namespace XMLROFullStory {
	export function fromXML(path: string, xml0: AnyXMLValue, strict: boolean): IMOSROFullStory {
		try {
			const xml = ensureXMLObject(xml0, strict)
			const mosTypes = getParseMosTypes(strict)

			const story0 = XMLROStory.fromXML('', xml, strict)
			const story: IMOSROFullStory = {
				ID: story0.ID,
				Slug: story0.Slug,
				Number: story0.Number,
				MosExternalMetaData: story0.MosExternalMetaData,
				RunningOrderId: mosTypes.mosString128.createRequired(xml.roID, 'roID'),
				Body: ParseError.handleError(() => fromXMLStoryBody(xml.storyBody, strict), 'storyBody'),
			}
			omitUndefined(story)
			return story
		} catch (e) {
			throw ParseError.handleCaughtError(path, e)
		}
	}
}
function fromXMLStoryBody(xml: AnyXMLValue, strict: boolean): IMOSROFullStoryBodyItem[] {
	const body: IMOSROFullStoryBodyItem[] = []
	const mosTypes = getParseMosTypes(strict)

	xml = ensureXMLObject(xml, strict)

	/*
	// Not able to implement this currently, need to change {arrayNotation: true} in xml2json option
	let elementKeys = Object.keys(xml)
	elementKeys.forEach((key: string) => {
		// let elements
		let d = xml[key]

		if (!Array.isArray(d)) d = [d]

		d.forEach((el: any) => {
			let bodyItem: IMOSROFullStoryBodyItem = {
				Type: key,
				Content: el
			}
			body.push(bodyItem)
		})
	})
	*/
	if (xml.elements && Array.isArray(xml.elements)) {
		for (const item of ensureXMLObjectArray(xml.elements, strict)) {
			const type = mosTypes.string.createRequired(item.$name || item.$type, 'name/type')

			let bodyItem: IMOSROFullStoryBodyItem
			if (type === 'storyItem') {
				bodyItem = {
					itemType: 'storyItem',
					Type: 'storyItem',
					Content: XMLMosItem.fromXML('elements', item, strict),
				}
			} else {
				bodyItem = {
					itemType: 'other',
					Type: type,
					Content: item,
				}
			}

			body.push(bodyItem)
		}
	}
	// Temporary implementation:
	if (xml.storyItem) {
		for (const item of ensureXMLObjectArray(xml.storyItem, strict)) {
			const bodyItem: IMOSROFullStoryBodyItem = {
				itemType: 'storyItem',
				Type: 'storyItem',
				Content: XMLMosItem.fromXML('storyItem', item, strict),
			}
			body.push(bodyItem)
		}
	}
	return body
}
