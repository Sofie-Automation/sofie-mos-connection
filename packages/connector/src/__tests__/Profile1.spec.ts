/* eslint-disable @typescript-eslint/unbound-method */
import {
	checkMessageSnapshot,
	clearMocks,
	decode,
	delay,
	doBeforeAll,
	encode,
	fakeIncomingMessage,
	fixSnapshot,
	getMessageId,
	getMosConnection,
	getMosDevice,
	getXMLReply,
	mosTypes,
	setupMocks,
} from './lib'
import {
	MosConnection,
	MosDevice,
	IMOSObject,
	IMOSListMachInfo,
	IMOSObjectType,
	IMOSObjectStatus,
	IMOSObjectAirStatus,
	IMOSObjectPathType,
} from '..'
import { SocketMock } from '../__mocks__/socket'
import { xmlData, xmlApiData } from '../__mocks__/testData'
import { xml2js } from 'xml-js'
import * as Helper from '@mos-connection/helper'

/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-ignore imports are unused
import { Socket } from 'net'
/* eslint-enable @typescript-eslint/no-unused-vars */

beforeAll(() => {
	setupMocks()
})
beforeEach(() => {
	clearMocks()
})
describe('Profile 1', () => {
	let mosDevice: MosDevice
	let mosConnection: MosConnection

	let socketMockLower: SocketMock
	let socketMockUpper: SocketMock
	let socketMockQuery: SocketMock

	let serverSocketMockLower: SocketMock
	let serverSocketMockUpper: SocketMock
	let serverSocketMockQuery: SocketMock

	let onRequestMachineInfo: jest.Mock<any, any>
	let onRequestMOSObject: jest.Mock<any, any>
	let onRequestAllMOSObjects: jest.Mock<any, any>

	beforeAll(async () => {
		mosConnection = await getMosConnection(
			{
				'0': true,
				'1': true,
			},
			true
		)
		mosDevice = await getMosDevice(mosConnection)

		// Profile 0:
		onRequestMachineInfo = jest.fn(async () => {
			return xmlApiData.machineInfo
		})
		mosDevice.onRequestMachineInfo(async (): Promise<IMOSListMachInfo> => {
			return onRequestMachineInfo()
		})
		// Profile 1:
		onRequestMOSObject = jest.fn(async () => {
			return xmlApiData.mosObj
		})
		onRequestAllMOSObjects = jest.fn(async () => {
			return [xmlApiData.mosObj, xmlApiData.mosObj2]
		})
		mosDevice.onRequestMOSObject(async (objId: string): Promise<IMOSObject | null> => {
			return onRequestMOSObject(objId)
		})
		mosDevice.onRequestAllMOSObjects(async (): Promise<Array<IMOSObject>> => {
			return onRequestAllMOSObjects()
		})
		const b = doBeforeAll()
		socketMockLower = b.socketMockLower
		socketMockUpper = b.socketMockUpper
		socketMockQuery = b.socketMockQuery
		serverSocketMockLower = b.serverSocketMockLower
		serverSocketMockUpper = b.serverSocketMockUpper
		serverSocketMockQuery = b.serverSocketMockQuery

		mosDevice.checkProfileValidness()
		mosConnection.checkProfileValidness()
	})
	afterAll(async () => {
		await mosDevice.dispose()
		await mosConnection.dispose()
	})
	beforeEach(() => {
		// SocketMock.mockClear()
		onRequestMOSObject.mockClear()
		onRequestAllMOSObjects.mockClear()

		serverSocketMockLower.mockClear()
		serverSocketMockUpper.mockClear()
		if (serverSocketMockQuery) serverSocketMockQuery.mockClear()
		socketMockLower.mockClear()
		socketMockUpper.mockClear()
		if (socketMockQuery) socketMockQuery.mockClear()
	})
	test('init', async () => {
		expect(mosDevice).toBeTruthy()
		expect(socketMockLower).toBeTruthy()
		expect(socketMockUpper).toBeTruthy()
		mosDevice.checkProfileValidness()
	})

	test('onRequestMOSObject', async () => {
		// Fake incoming message on socket:
		await fakeIncomingMessage(serverSocketMockLower, xmlData.reqObj)
		expect(onRequestMOSObject).toHaveBeenCalledTimes(1)
		if (!xmlApiData.mosObj.ID) throw new Error('xmlApiData.mosObj.ID not set')
		expect(onRequestMOSObject.mock.calls[0][0]).toEqual(mosTypes.mosString128.stringify(xmlApiData.mosObj.ID))
		expect(fixSnapshot(onRequestMOSObject.mock.calls)).toMatchSnapshot()
		expect(onRequestAllMOSObjects).toHaveBeenCalledTimes(0)

		// Check reply to socket server:
		await serverSocketMockLower.mockWaitForSentMessages()
		expect(serverSocketMockLower.mockSentMessage).toHaveBeenCalledTimes(1)
		// @ts-ignore mock
		const reply = decode(serverSocketMockLower.mockSentMessage['mock'].calls[0][0])
		const parsedReply: any = xml2js(reply, { compact: true, nativeType: true, trim: true })

		expect(parsedReply.mos.mosObj.objID._text + '').toEqual(mosTypes.mosString128.stringify(xmlApiData.mosObj.ID))
		expect(parsedReply.mos.mosObj.objSlug._text + '').toEqual(
			mosTypes.mosString128.stringify(xmlApiData.mosObj.Slug)
		)
		expect(parsedReply).toMatchSnapshot()
	})
	test('onRequestAllMOSObjects', async () => {
		const mockReply = jest.fn((data) => {
			const str = decode(data)
			const messageID = getMessageId(str)
			const repl = getXMLReply(messageID, '<mosAck></mosAck>')

			return encode(repl)
		})
		socketMockLower.mockAddReply(mockReply)

		// Fake incoming message on socket:
		await fakeIncomingMessage(serverSocketMockLower, xmlData.mosReqAll)
		expect(onRequestAllMOSObjects).toHaveBeenCalledTimes(1)
		expect(fixSnapshot(onRequestAllMOSObjects.mock.calls)).toMatchSnapshot()
		expect(onRequestMOSObject).toHaveBeenCalledTimes(0)

		// Check reply to socket server:
		await serverSocketMockLower.mockWaitForSentMessages()
		expect(serverSocketMockLower.mockSentMessage).toHaveBeenCalledTimes(1)
		// @ts-ignore mock
		const reply = decode(serverSocketMockLower.mockSentMessage.mock.calls[0][0])
		const parsedReply: any = xml2js(reply, { compact: true, nativeType: true, trim: true })
		expect(parsedReply.mos.mosAck).toBeTruthy()
		expect(parsedReply).toMatchSnapshot()

		// @ts-ignore mock
		serverSocketMockLower.mockSentMessage.mockClear()
		await serverSocketMockLower.mockWaitForSentMessages()
		await delay(100) // to allow for async timers & events to triggered

		expect(mockReply).toHaveBeenCalledTimes(1)

		const sentData = Helper.xml2js(decode(mockReply.mock.calls[0][0])) as any

		expect(sentData.mos.mosListAll.mosObj).toHaveLength(2)
		if (!xmlApiData.mosObj.ID) throw new Error('xmlApiData.mosObj.ID not set')
		expect(sentData.mos.mosListAll.mosObj[0].objID + '').toEqual(
			mosTypes.mosString128.stringify(xmlApiData.mosObj.ID)
		)
		expect(sentData.mos.mosListAll.mosObj[0].objSlug + '').toEqual(
			mosTypes.mosString128.stringify(xmlApiData.mosObj.Slug)
		)
		if (!xmlApiData.mosObj2.ID) throw new Error('xmlApiData.mosObj2.ID not set')
		expect(sentData.mos.mosListAll.mosObj[1].objID + '').toEqual(
			mosTypes.mosString128.stringify(xmlApiData.mosObj2.ID)
		)
		expect(sentData.mos.mosListAll.mosObj[1].objSlug + '').toEqual(
			mosTypes.mosString128.stringify(xmlApiData.mosObj2.Slug)
		)
		sentData.mos.messageID = 99999 // not important
		expect(sentData).toMatchSnapshot()
	})
	test('getMOSObject', async () => {
		// Prepare mock server response:
		const mockReply = jest.fn((data) => {
			const str = decode(data)
			const messageID = getMessageId(str)
			const repl = getXMLReply(messageID, xmlData.mosObj)

			return encode(repl)
		})
		socketMockLower.mockAddReply(mockReply)
		if (!xmlApiData.mosObj.ID) throw new Error('xmlApiData.mosObj.ID not set')
		const returnedObj: IMOSObject = await mosDevice.sendRequestMOSObject(xmlApiData.mosObj.ID)
		expect(mockReply).toHaveBeenCalledTimes(1)
		const msg = decode(mockReply.mock.calls[0][0])
		expect(msg).toMatch(/<mosReqObj>/)
		checkMessageSnapshot(msg)

		expect(returnedObj).toMatchObject(xmlApiData.roList)
		expect(returnedObj).toMatchSnapshot()
	})
	test('sendMOSObject', async () => {
		// Prepare mock server response:
		const mockReplyMosAck = jest.fn((data) => {
			const str = decode(data)
			const messageID = getMessageId(str)
			return encode(getXMLReply(messageID, xmlData.mosAck))
		})
		socketMockLower.mockAddReply(mockReplyMosAck)
		if (!xmlApiData.mosObj.ID) throw new Error('xmlApiData.mosObj.ID not set')
		const reply = await mosDevice.sendMOSObject({
			ID: mosTypes.mosString128.create('M000123'),
			Slug: mosTypes.mosString128.create('theslug'),
			MosAbstract: 'abstract!',
			Group: 'grp',
			Type: IMOSObjectType.VIDEO,
			TimeBase: 50,
			Revision: 5, // max 999
			Duration: 1000,
			Status: IMOSObjectStatus.NOT_READY,
			AirStatus: IMOSObjectAirStatus.READY,
			Paths: [
				{
					Type: IMOSObjectPathType.PATH,
					Description: 'path',
					Target: 'folder/target',
				},
			],
			CreatedBy: mosTypes.mosString128.create('me!'),
			Created: mosTypes.mosTime.create('2005-07-01T15:23:18Z'),
		})
		expect(mockReplyMosAck).toHaveBeenCalledTimes(1)
		const msg = decode(mockReplyMosAck.mock.calls[0][0])
		expect(msg).toMatch(/<mosObj>/)
		checkMessageSnapshot(msg)

		expect(reply).toMatchObject({
			ID: mosTypes.mosString128.create('M000123'),
			Revision: 1,
			Status: 'ACK',
		})
	})
	test('getAllMOSObjects', async () => {
		expect(socketMockLower).toBeTruthy()
		// Prepare mock server response:
		const mockReply = jest.fn((data) => {
			const str = decode(data)
			const messageID = getMessageId(str)
			const repl = getXMLReply(messageID, xmlData.mosListAll)
			return encode(repl)
		})
		socketMockLower.mockAddReply(mockReply)
		const returnedObjs: Array<IMOSObject> = await mosDevice.sendRequestAllMOSObjects()

		expect(mockReply).toHaveBeenCalledTimes(1)
		const msg = decode(mockReply.mock.calls[0][0])
		expect(msg).toMatch(/<mosReqAll>/)
		checkMessageSnapshot(msg)

		expect(returnedObjs).toMatchObject(xmlApiData.mosListAll)
		expect(returnedObjs).toMatchSnapshot()
	})

	test('command timeout', async () => {
		expect(socketMockLower).toBeTruthy()
		// Prepare mock server response:
		const mockReply = jest.fn(async (data) => {
			return new Promise<Buffer>((resolve) => {
				setTimeout(() => {
					const str = decode(data)
					const messageID = getMessageId(str)
					const repl = getXMLReply(messageID, xmlData.mosListAll)
					resolve(encode(repl))
				}, 500)
			})
		})
		socketMockLower.mockAddReply(mockReply)

		let error
		try {
			await mosDevice.sendRequestAllMOSObjects()
		} catch (e) {
			error = `${e}`
		}

		expect(error).toMatch(/Sent command timed out after \d+ ms/)
		expect(mockReply).toHaveBeenCalledTimes(1)
	}, 500)
})
