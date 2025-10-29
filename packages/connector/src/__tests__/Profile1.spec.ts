/* eslint-disable @typescript-eslint/unbound-method */
import {
	DEFAULT_TIMEOUT,
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
} from './lib.js'
import {
	MosConnection,
	MosDevice,
	IMOSObject,
	IMOSListMachInfo,
	IMOSObjectType,
	IMOSObjectStatus,
	IMOSObjectAirStatus,
	IMOSObjectPathType,
	IMOSAck,
	IMOSAckStatus,
} from '../index.js'
import { SocketMock } from '../__mocks__/socket.js'
import { xmlData, xmlApiData } from '../__mocks__/testData.js'
import { xml2js } from 'xml-js'
import * as Helper from '@mos-connection/helper'
import { describe, test, expect, beforeAll, beforeEach, MockedFunction, vitest, afterAll } from 'vitest'

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

	let onRequestMachineInfo: MockedFunction<any>
	let onRequestMOSObject: MockedFunction<any>
	let onRequestAllMOSObjects: MockedFunction<any>
	let onMOSObjects: MockedFunction<(objs: IMOSObject[]) => Promise<IMOSAck>>
	const receivedMosObjects: Array<IMOSObject> = []

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
		onRequestMachineInfo = vitest.fn(async () => {
			return xmlApiData.machineInfo
		})
		mosDevice.onRequestMachineInfo(async (): Promise<IMOSListMachInfo> => {
			return onRequestMachineInfo()
		})
		// Profile 1:
		onRequestMOSObject = vitest.fn(async () => {
			return xmlApiData.mosObj
		})
		onRequestAllMOSObjects = vitest.fn(async () => {
			return [xmlApiData.mosObj, xmlApiData.mosObj2]
		})
		mosDevice.onRequestMOSObject(async (objId: string): Promise<IMOSObject | null> => {
			return onRequestMOSObject(objId)
		})
		mosDevice.onRequestAllMOSObjects(async (): Promise<Array<IMOSObject>> => {
			return onRequestAllMOSObjects()
		})
		onMOSObjects = vitest.fn(async (objs: IMOSObject[]): Promise<IMOSAck> => {
			receivedMosObjects.push(...objs)

			return {
				ID: mosTypes.mosString128.create(''),
				Revision: 1,
				Status: IMOSAckStatus.ACK,
				Description: mosTypes.mosString128.create(''),
			}
		})
		mosDevice.onMOSObjects(async (objs: IMOSObject[]): Promise<IMOSAck> => {
			return onMOSObjects(objs)
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
		onMOSObjects.mockClear()
		receivedMosObjects.splice(0, 99999)

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
		const mockReply = vitest.fn((data) => {
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
		const mockReply = vitest.fn((data) => {
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
		const mockReplyMosAck = vitest.fn((data) => {
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
	test('receive mosObj', async () => {
		// Fake incoming message on socket:
		await fakeIncomingMessage(serverSocketMockLower, xmlData.mosObj)
		expect(onMOSObjects).toHaveBeenCalledTimes(1)
		expect(onMOSObjects.mock.calls[0][0]).toHaveLength(1)
		expect(fixSnapshot(onMOSObjects.mock.calls)).toMatchSnapshot()

		// Check reply to socket server:
		await serverSocketMockLower.mockWaitForSentMessages()
		expect(serverSocketMockLower.mockSentMessage).toHaveBeenCalledTimes(1)
		// @ts-ignore mock
		const reply = decode(serverSocketMockLower.mockSentMessage.mock.calls[0][0])
		const parsedReply: any = xml2js(reply, { compact: true, nativeType: true, trim: true })
		expect(parsedReply.mos.mosAck).toBeTruthy()
		expect(parsedReply).toMatchSnapshot()
	})
	test('receive mosListAll', async () => {
		// Fake incoming message on socket:
		await fakeIncomingMessage(serverSocketMockLower, xmlData.mosListAll)
		expect(onMOSObjects).toHaveBeenCalledTimes(1)
		expect(onMOSObjects.mock.calls[0][0]).toHaveLength(2)
		expect(fixSnapshot(onMOSObjects.mock.calls)).toMatchSnapshot()

		// Check reply to socket server:
		await serverSocketMockLower.mockWaitForSentMessages()
		expect(serverSocketMockLower.mockSentMessage).toHaveBeenCalledTimes(1)
		// @ts-ignore mock
		const reply = decode(serverSocketMockLower.mockSentMessage.mock.calls[0][0])
		const parsedReply: any = xml2js(reply, { compact: true, nativeType: true, trim: true })
		expect(parsedReply.mos.mosAck).toBeTruthy()
		expect(parsedReply).toMatchSnapshot()
	})
	test('getAllMOSObjects', async () => {
		expect(socketMockLower).toBeTruthy()

		const REPLY_WAIT_TIME = 100
		// Prepare mock server response:
		const mockReply = vitest.fn((data) => {
			const str = decode(data)
			const messageID = getMessageId(str)
			const repl = getXMLReply(messageID, xmlData.mosAck)

			setTimeout(() => {
				fakeIncomingMessage(serverSocketMockLower, xmlData.mosListAll).catch(console.error)
			}, REPLY_WAIT_TIME)
			return encode(repl)
		})
		socketMockLower.mockAddReply(mockReply)
		await mosDevice.sendRequestAllMOSObjects()

		await delay(REPLY_WAIT_TIME + 100)

		expect(mockReply).toHaveBeenCalledTimes(1)
		const msg = decode(mockReply.mock.calls[0][0])
		expect(msg).toMatch(/<mosReqAll>/)
		checkMessageSnapshot(msg)

		expect(receivedMosObjects).toMatchObject(xmlApiData.mosListAll)
		expect(receivedMosObjects).toMatchSnapshot()
	})

	test(
		'command timeout',
		async () => {
			expect(socketMockLower).toBeTruthy()
			// Prepare mock server response:
			const mockReply = vitest.fn(async (data) => {
				return new Promise<Buffer>((resolve) => {
					setTimeout(() => {
						const str = decode(data)
						const messageID = getMessageId(str)
						const repl = getXMLReply(messageID, xmlData.mosListAll)
						resolve(encode(repl))
					}, DEFAULT_TIMEOUT + 1000)
				})
			})
			socketMockLower.mockAddReply(mockReply)

			let error = undefined
			try {
				await mosDevice.sendRequestAllMOSObjects()
			} catch (e) {
				error = `${e}`
			}

			expect(error).toMatch(/Sent command timed out after \d+ ms/)
			expect(mockReply).toHaveBeenCalledTimes(1)
		},
		DEFAULT_TIMEOUT + 2000
	)
})
