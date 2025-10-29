import {
	getMosTypes,
	IMOSItem,
	IMOSObjectPathType,
	IMOSObjectStatus,
	IMOSROStory,
	IMOSRunningOrder,
} from '@mos-connection/model'
import { getXMLString } from './lib.js'
import {
	ROAck,
	ROInsertStories,
	ROInsertItems,
	ROReplaceStories,
	ROReplaceItems,
	ROMoveStories,
	ROMoveItems,
	RODeleteStories,
	RODeleteItems,
	ROSwapStories,
	ROSwapItems,
	ROCreate,
	RODelete,
} from '../profile2/index.js'
import { literal } from '../lib.js'
import { describe, test, expect } from 'vitest'

describe('Profile 2', () => {
	const mosTypes = getMosTypes(true)

	const roItem00 = literal<IMOSItem>({
		ID: mosTypes.mosString128.create('27'),
		ObjectID: mosTypes.mosString128.create('M73627'),
		MOSID: 'testmos',
		EditorialStart: 0,
		EditorialDuration: 715,
		UserTimingDuration: 415,
		Paths: [
			{
				Type: IMOSObjectPathType.PATH,
				Description: 'MPEG2 Video',
				Target: '\\server\\media\\clip392028cd2320s0d.mxf',
			},
			{
				Type: IMOSObjectPathType.PROXY_PATH,
				Description: 'WM9 750Kbps',
				Target: 'https://server/proxy/clipe.wmv',
			},
			{
				Type: IMOSObjectPathType.METADATA_PATH,
				Description: 'MOS Object',
				Target: 'https://server/proxy/clipe.xml',
			},
		],
	})
	const roItem00XML = `<item>
<itemID>27</itemID>
<objID>M73627</objID>
<mosID>testmos</mosID>
<objPaths>
<objPath techDescription="MPEG2 Video">\\server\\media\\clip392028cd2320s0d.mxf</objPath>
<objProxyPath techDescription="WM9 750Kbps">https://server/proxy/clipe.wmv</objProxyPath>
<objMetadataPath techDescription="MOS Object">https://server/proxy/clipe.xml</objMetadataPath>
</objPaths>
<itemEdStart>0</itemEdStart>
<itemEdDur>715</itemEdDur>
<itemUserTimingDur>415</itemUserTimingDur>
</item>`
	const roItem01 = literal<IMOSItem>({
		ID: mosTypes.mosString128.create('28'),
		ObjectID: mosTypes.mosString128.create('M73628'),
		MOSID: 'testmos',
		EditorialStart: 0,
		EditorialDuration: 315,
	})
	const roItem01XML = `<item>
<itemID>28</itemID>
<objID>M73628</objID>
<mosID>testmos</mosID>
<itemEdStart>0</itemEdStart>
<itemEdDur>315</itemEdDur>
</item>`
	const roStory0 = literal<IMOSROStory>({
		ID: mosTypes.mosString128.create('17'),
		Slug: mosTypes.mosString128.create('Barcelona Football'),
		Number: mosTypes.mosString128.create('A2'),
		Items: [roItem00, roItem01],
	})
	const roStory0XML = `<story>
<storyID>17</storyID>
<storySlug>Barcelona Football</storySlug>
<storyNum>A2</storyNum>
${roItem00XML}
${roItem01XML}
</story>`

	const ro0 = literal<IMOSRunningOrder>({
		ID: mosTypes.mosString128.create('96857485'),
		Slug: mosTypes.mosString128.create('5PM RUNDOWN'),
		EditorialStart: mosTypes.mosTime.create('2009-04-17T17:02:00'),
		EditorialDuration: mosTypes.mosDuration.create('00:58:25'),
		Stories: [roStory0],
	})
	const ro0XML = `<roID>96857485</roID>
<roSlug>5PM RUNDOWN</roSlug>
<roEdStart>2009-04-17T17:02:00,000Z</roEdStart>
<roEdDur>0:58:25</roEdDur>
${roStory0XML}`

	test('roAck basic', () => {
		const msg = new ROAck(
			{
				ID: mosTypes.mosString128.create('96857485'),
				Status: mosTypes.mosString128.create('OK'),
				Stories: [],
			},
			true
		)
		expect(getXMLString(msg)).toBe(
			`<roAck>
<roID>96857485</roID>
<roStatus>OK</roStatus>
</roAck>`
		)
	})
	test('roAck detailed', () => {
		const msg = new ROAck(
			{
				ID: mosTypes.mosString128.create('96857485'),
				Status: mosTypes.mosString128.create('Unknown object M000133'),
				Stories: [
					{
						ID: mosTypes.mosString128.create('5983A501:0049B924:8390EF2B'),
						Items: [
							{
								ID: mosTypes.mosString128.create('0'),
								Channel: mosTypes.mosString128.create(''),
								Objects: [
									{
										Status: IMOSObjectStatus.READY,
										ID: mosTypes.mosString128.create('M000224'),
									},
								],
							},
						],
					},
					{
						ID: mosTypes.mosString128.create('3854737F:0003A34D:983A0B28'),
						Items: [
							{
								ID: mosTypes.mosString128.create('0'),
								Channel: mosTypes.mosString128.create('A'),
								Objects: [
									{
										Status: IMOSObjectStatus.NOT_READY,
										ID: mosTypes.mosString128.create('M000133'),
									},
								],
							},
						],
					},
				],
			},
			true
		)
		expect(getXMLString(msg)).toBe(
			`<roAck>
<roID>96857485</roID>
<roStatus>Unknown object M000133</roStatus>
<storyID>5983A501:0049B924:8390EF2B</storyID>
<itemID>0</itemID>
<objID>M000224</objID>
<status>READY</status>
<storyID>3854737F:0003A34D:983A0B28</storyID>
<itemID>0</itemID>
<objID>M000133</objID>
<itemChannel>A</itemChannel>
<status>NOT READY</status>
</roAck>`
		)
	})

	describe('roElementAction', () => {
		test('ROInsertStories', () => {
			const msg = new ROInsertStories(
				{
					RunningOrderID: mosTypes.mosString128.create('5PM'),
					StoryID: mosTypes.mosString128.create('2'),
				},
				[roStory0],
				true
			)
			expect(getXMLString(msg)).toBe(`<roElementAction operation="INSERT">
<roID>5PM</roID>
<element_target>
<storyID>2</storyID>
</element_target>
<element_source>
${roStory0XML}
</element_source>
</roElementAction>`)
		})
		test('ROInsertItems', () => {
			const msg = new ROInsertItems(
				{
					RunningOrderID: mosTypes.mosString128.create('5PM'),
					StoryID: mosTypes.mosString128.create('2'),
					ItemID: mosTypes.mosString128.create('23'),
				},
				[roItem00],
				true
			)
			expect(getXMLString(msg)).toBe(`<roElementAction operation="INSERT">
<roID>5PM</roID>
<element_target>
<storyID>2</storyID>
<itemID>23</itemID>
</element_target>
<element_source>
${roItem00XML}
</element_source>
</roElementAction>`)
		})
		test('ROReplaceStories', () => {
			const msg = new ROReplaceStories(
				{
					RunningOrderID: mosTypes.mosString128.create('5PM'),
					StoryID: mosTypes.mosString128.create('2'),
				},
				[roStory0],
				true
			)
			expect(getXMLString(msg)).toBe(`<roElementAction operation="REPLACE">
<roID>5PM</roID>
<element_target>
<storyID>2</storyID>
</element_target>
<element_source>
${roStory0XML}
</element_source>
</roElementAction>`)
		})
		test('ROReplaceItems', () => {
			const msg = new ROReplaceItems(
				{
					RunningOrderID: mosTypes.mosString128.create('5PM'),
					StoryID: mosTypes.mosString128.create('2'),
					ItemID: mosTypes.mosString128.create('23'),
				},
				[roItem00],
				true
			)
			expect(getXMLString(msg)).toBe(`<roElementAction operation="REPLACE">
<roID>5PM</roID>
<element_target>
<storyID>2</storyID>
<itemID>23</itemID>
</element_target>
<element_source>
${roItem00XML}
</element_source>
</roElementAction>`)
		})
		test('ROMoveStories - moving a story', () => {
			const msg = new ROMoveStories(
				{
					RunningOrderID: mosTypes.mosString128.create('5PM'),
					StoryID: mosTypes.mosString128.create('2'),
				},
				[mosTypes.mosString128.create('7')],
				true
			)
			expect(getXMLString(msg)).toBe(`<roElementAction operation="MOVE">
<roID>5PM</roID>
<element_target>
<storyID>2</storyID>
</element_target>
<element_source>
<storyID>7</storyID>
</element_source>
</roElementAction>`)
		})
		test('ROMoveStories - move a block of stories', () => {
			const msg = new ROMoveStories(
				{
					RunningOrderID: mosTypes.mosString128.create('5PM'),
					StoryID: mosTypes.mosString128.create('2'),
				},
				[mosTypes.mosString128.create('7'), mosTypes.mosString128.create('12')],
				true
			)
			expect(getXMLString(msg)).toBe(`<roElementAction operation="MOVE">
<roID>5PM</roID>
<element_target>
<storyID>2</storyID>
</element_target>
<element_source>
<storyID>7</storyID>
<storyID>12</storyID>
</element_source>
</roElementAction>`)
		})
		test('ROMoveItems - moving items within a story', () => {
			const msg = new ROMoveItems(
				{
					RunningOrderID: mosTypes.mosString128.create('5PM'),
					StoryID: mosTypes.mosString128.create('2'),
					ItemID: mosTypes.mosString128.create('12'),
				},
				[mosTypes.mosString128.create('23'), mosTypes.mosString128.create('24')],
				true
			)
			expect(getXMLString(msg)).toBe(`<roElementAction operation="MOVE">
<roID>5PM</roID>
<element_target>
<storyID>2</storyID>
<itemID>12</itemID>
</element_target>
<element_source>
<itemID>23</itemID>
<itemID>24</itemID>
</element_source>
</roElementAction>`)
		})
		test('RODeleteStories', () => {
			const msg = new RODeleteStories(
				{
					RunningOrderID: mosTypes.mosString128.create('5PM'),
				},
				[mosTypes.mosString128.create('3')],
				true
			)
			expect(getXMLString(msg)).toBe(`<roElementAction operation="DELETE">
<roID>5PM</roID>
<element_source>
<storyID>3</storyID>
</element_source>
</roElementAction>`)
		})
		test('RODeleteItems', () => {
			const msg = new RODeleteItems(
				{
					RunningOrderID: mosTypes.mosString128.create('5PM'),
					StoryID: mosTypes.mosString128.create('2'),
				},
				[mosTypes.mosString128.create('23'), mosTypes.mosString128.create('24')],
				true
			)
			expect(getXMLString(msg)).toBe(`<roElementAction operation="DELETE">
<roID>5PM</roID>
<element_target>
<storyID>2</storyID>
</element_target>
<element_source>
<itemID>23</itemID>
<itemID>24</itemID>
</element_source>
</roElementAction>`)
		})
		test('ROSwapStories', () => {
			const msg = new ROSwapStories(
				{
					RunningOrderID: mosTypes.mosString128.create('5PM'),
				},
				mosTypes.mosString128.create('3'),
				mosTypes.mosString128.create('5'),
				true
			)
			expect(getXMLString(msg)).toBe(`<roElementAction operation="SWAP">
<roID>5PM</roID>
<element_source>
<storyID>3</storyID>
<storyID>5</storyID>
</element_source>
</roElementAction>`)
		})
		test('ROSwapItems', () => {
			const msg = new ROSwapItems(
				{
					RunningOrderID: mosTypes.mosString128.create('5PM'),
					StoryID: mosTypes.mosString128.create('2'),
				},
				mosTypes.mosString128.create('23'),
				mosTypes.mosString128.create('24'),
				true
			)
			expect(getXMLString(msg)).toBe(`<roElementAction operation="SWAP">
<roID>5PM</roID>
<element_target>
<storyID>2</storyID>
</element_target>
<element_source>
<itemID>23</itemID>
<itemID>24</itemID>
</element_source>
</roElementAction>`)
		})
	})

	test('roCreate', () => {
		const msg = new ROCreate(ro0, true)
		expect(getXMLString(msg)).toBe(`<roCreate>
${ro0XML}
</roCreate>`)
	})
	test('roDelete', () => {
		const msg = new RODelete(mosTypes.mosString128.create('49478285'), true)
		expect(getXMLString(msg)).toBe(`<roDelete>
<roID>49478285</roID>
</roDelete>`)
	})
})
