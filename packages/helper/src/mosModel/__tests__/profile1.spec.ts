import {
	getMosTypes,
	IMOSAckStatus,
	IMOSExternalMetaData,
	IMOSObject,
	IMOSObjectAirStatus,
	IMOSObjectPath,
	IMOSObjectPathType,
	IMOSObjectStatus,
	IMOSObjectType,
	IMOSScope,
} from '@mos-connection/model'
import { getXMLString } from './lib.js'
import { MOSAck, MosListAll, MosObj, ReqMosObj, ReqMosObjAll } from '../profile1/index.js'
import { literal } from '../lib.js'
import { describe, test, expect } from 'vitest'

describe('Profile 1', () => {
	const mosTypes = getMosTypes(true)

	const mosObjForTest0: IMOSObject = literal<IMOSObject>({
		ID: mosTypes.mosString128.create('M000224'),
		Slug: mosTypes.mosString128.create('COLSTAT MURDER:VO'),
		// MosAbstract: ''
		// Group?: '
		Type: IMOSObjectType.VIDEO,
		TimeBase: 59.94,
		Revision: 4,
		Duration: 800,
		Status: IMOSObjectStatus.UPDATED,
		AirStatus: IMOSObjectAirStatus.READY,
		Paths: [
			literal<IMOSObjectPath>({
				Type: IMOSObjectPathType.PATH,
				Description: 'MPEG2 Video',
				Target: '\\server\\media\\clip392028cd2320s0d.mxf',
			}),
			literal<IMOSObjectPath>({
				Type: IMOSObjectPathType.PROXY_PATH,
				Description: 'WM9 750Kbps',
				Target: 'https://server/proxy/clipe.wmv',
			}),
			literal<IMOSObjectPath>({
				Type: IMOSObjectPathType.METADATA_PATH,
				Description: 'MOS Object',
				Target: 'https://server/proxy/clipe.xml',
			}),
		],
		CreatedBy: mosTypes.mosString128.create('Phil'),
		Created: mosTypes.mosTime.create('2009-11-01T15:19:01'),
		ChangedBy: mosTypes.mosString128.create('Chris'),
		Changed: mosTypes.mosTime.create('2009-11-01T15:21:15'),
		Description: 'VOICE OVER MATERIAL OF COLSTAT MURDER SITES SHOT ON 1-NOV.',
		MosExternalMetaData: [
			literal<IMOSExternalMetaData>({
				MosScope: IMOSScope.STORY,
				MosSchema: 'https://MOSA4.com/mos/supported_schemas/MOSAXML2.08',
				MosPayload: {
					Owner: 'SHOLMES',
					ModTime: '20010308142001',
					mediaTime: '0',
					TextTime: '278',
					ModBy: 'LJOHNSTON',
					Approved: '0',
					Creator: 'SHOLMES',
				},
			}),
		],
	})
	const mosObjForTest0XML = `<mosObj>
<objID>M000224</objID>
<objSlug>COLSTAT MURDER:VO</objSlug>
<objType>VIDEO</objType>
<objTB>59.94</objTB>
<objRev>4</objRev>
<objDur>800</objDur>
<status>UPDATED</status>
<objAir>READY</objAir>
<objPaths>
<objPath techDescription="MPEG2 Video">\\server\\media\\clip392028cd2320s0d.mxf</objPath>
<objProxyPath techDescription="WM9 750Kbps">https://server/proxy/clipe.wmv</objProxyPath>
<objMetadataPath techDescription="MOS Object">https://server/proxy/clipe.xml</objMetadataPath>
</objPaths>
<createdBy>Phil</createdBy>
<created>2009-11-01T15:19:01,000Z</created>
<changedBy>Chris</changedBy>
<changed>2009-11-01T15:21:15,000Z</changed>
<description>VOICE OVER MATERIAL OF COLSTAT MURDER SITES SHOT ON 1-NOV.</description>
<mosExternalMetadata>
<mosScope>STORY</mosScope>
<mosSchema>https://MOSA4.com/mos/supported_schemas/MOSAXML2.08</mosSchema>
<mosPayload>
<Owner>SHOLMES</Owner>
<ModTime>20010308142001</ModTime>
<mediaTime>0</mediaTime>
<TextTime>278</TextTime>
<ModBy>LJOHNSTON</ModBy>
<Approved>0</Approved>
<Creator>SHOLMES</Creator>
</mosPayload>
</mosExternalMetadata>
</mosObj>`

	test('mosAck', () => {
		const msg = new MOSAck(
			{
				Description: mosTypes.mosString128.create('Thank you'),
				ID: mosTypes.mosString128.create('M000123'),
				Status: IMOSAckStatus.ACK,
				Revision: 1,
			},
			true
		)
		expect(getXMLString(msg)).toBe(
			`<mosAck>
<objID>M000123</objID>
<objRev>1</objRev>
<status>ACK</status>
<statusDescription>Thank you</statusDescription>
</mosAck>`
		)
	})
	test('mosListAll', () => {
		const msg = new MosListAll([mosObjForTest0], true)
		expect(getXMLString(msg)).toBe(`<mosListAll>
${mosObjForTest0XML}
</mosListAll>`)
	})
	test('mosObj', () => {
		const msg = new MosObj(mosObjForTest0, true)
		expect(getXMLString(msg)).toBe(mosObjForTest0XML)
	})
	test('mosReqObj', () => {
		const msg = new ReqMosObj(mosTypes.mosString128.create('M000123'), true)
		expect(getXMLString(msg)).toBe(`<mosReqObj>
<objID>M000123</objID>
</mosReqObj>`)
	})
	test('mosReqObjAll', () => {
		const msg = new ReqMosObjAll(0, true)
		expect(getXMLString(msg)).toBe(`<mosReqAll>
<pause>0</pause>
</mosReqAll>`)
	})
})
