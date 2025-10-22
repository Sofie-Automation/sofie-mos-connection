import { getMosTypes } from '@mos-connection/model'
import { getXMLString } from './lib.js'
import { HeartBeat, ListMachineInfo, ReqMachInfo } from '../profile0/index.js'
import { describe, test, expect } from 'vitest'

describe('Profile 0', () => {
	const mosTypes = getMosTypes(true)
	test('heartBeat', () => {
		const msg = new HeartBeat('lower', mosTypes.mosTime.create(1577836800000), true)

		expect(getXMLString(msg)).toBe(
			`<heartbeat>
<time>2020-01-01T00:00:00,000</time>
</heartbeat>`
		)
	})
	test('listMachineInfo', () => {
		const msg = new ListMachineInfo(
			{
				manufacturer: mosTypes.mosString128.create('NRK'),
				model: mosTypes.mosString128.create('Sofie'),
				hwRev: mosTypes.mosString128.create('1.2.3'),
				swRev: mosTypes.mosString128.create('0.0.1.0'),
				DOM: mosTypes.mosString128.create('1989-07-01'),
				SN: mosTypes.mosString128.create('927748927'),
				ID: mosTypes.mosString128.create('airchache.newscenter.com'),
				time: mosTypes.mosTime.create(1577836801000),
				opTime: mosTypes.mosTime.create(1577836802000),
				mosRev: mosTypes.mosString128.create('2.8.2'),
				supportedProfiles: {
					deviceType: 'MOS',
					profile0: true,
				},
			},
			'lower',
			true
		)

		expect(getXMLString(msg)).toBe(
			`<listMachInfo>
<manufacturer>NRK</manufacturer>
<model>Sofie</model>
<hwRev>1.2.3</hwRev>
<swRev>0.0.1.0</swRev>
<DOM>1989-07-01</DOM>
<SN>927748927</SN>
<ID>airchache.newscenter.com</ID>
<time>2020-01-01T00:00:01,000</time>
<opTime>2020-01-01T00:00:02,000</opTime>
<mosRev>2.8.2</mosRev>
<supportedProfiles deviceType="MOS">
<mosProfile number="0">YES</mosProfile>
<mosProfile number="1">NO</mosProfile>
<mosProfile number="2">NO</mosProfile>
<mosProfile number="3">NO</mosProfile>
<mosProfile number="4">NO</mosProfile>
<mosProfile number="5">NO</mosProfile>
<mosProfile number="6">NO</mosProfile>
<mosProfile number="7">NO</mosProfile>
</supportedProfiles>
</listMachInfo>`
		)
	})
	test('reqMachineInfo', () => {
		const msg = new ReqMachInfo(true)

		expect(getXMLString(msg)).toBe(`<reqMachInfo/>`)
	})
})
