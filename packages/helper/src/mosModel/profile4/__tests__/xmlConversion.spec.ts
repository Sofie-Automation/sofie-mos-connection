import { describe, expect, test } from 'vitest'
import { XMLROFullStory } from '../xmlConversion.js'
import { xml2js } from '../../../utils/Utils.js'
import { ensureXMLObject } from '../../../utils/ensureMethods.js'

function parseBody(body: string, strict: boolean) {
	const xml = xml2js(
		`<mos><roStorySend><roID>qa-rundown</roID><storyID>desk</storyID><storyBody>${body}</storyBody></roStorySend></mos>`
	)
	const envelope = ensureXMLObject(xml.mos, strict)
	return XMLROFullStory.fromXML('roStorySend', envelope.roStorySend, strict).Body
}

const paragraph = (text: string) => ({
	itemType: 'other',
	Type: 'p',
	Content: { $name: 'p', $type: 'text', text },
})

describe.each([false, true])('XMLROFullStory (strict: %s)', (strict) => {
	test('preserves a single plain-text paragraph without a story item', () => {
		expect(parseBody('<p>İstanbul &amp; Ankara &lt; 5 mm.</p>', strict)).toEqual([
			paragraph('İstanbul & Ankara < 5 mm.'),
		])
	})

	test('preserves the order of repeated paragraphs', () => {
		expect(parseBody('<p>First</p><p>Second</p>', strict)).toEqual([paragraph('First'), paragraph('Second')])
	})

	test('preserves paragraph and story item order', () => {
		const body = parseBody(
			'<p>First</p><storyItem><itemID>item</itemID><objID>clip</objID><mosID>MOS.QA</mosID></storyItem><p>Second</p>',
			strict
		)
		expect(body.map((item) => item.Type)).toEqual(['p', 'storyItem', 'p'])
		expect(body[0]).toEqual(paragraph('First'))
		expect(body[2]).toEqual(paragraph('Second'))
	})
})
