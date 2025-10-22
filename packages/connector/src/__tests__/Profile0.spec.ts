import {
	checkMessageSnapshot,
	clearMocks,
	decode,
	DEFAULT_TIMEOUT,
	delay,
	doBeforeAll,
	encode,
	fakeIncomingMessage,
	getMessageId,
	getMosConnection,
	getMosDevice,
	getXMLReply,
	mosTypes,
	setupMocks,
} from './lib.js'
import { MosConnection, MosDevice, IMOSObject, IMOSListMachInfo } from '../index.js'
import { SocketMock } from '../__mocks__/socket.js'
import { xmlData, xmlApiData } from '../__mocks__/testData.js'
import { describe, test, expect, beforeAll, beforeEach, afterAll, MockedFunction, vitest } from 'vitest'

/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-ignore imports are unused
import { Socket } from 'net'
import { IMOSAck, IMOSAckStatus } from '@mos-connection/model'
/* eslint-enable @typescript-eslint/no-unused-vars */

beforeAll(() => {
	setupMocks()
})
beforeEach(() => {
	clearMocks()
})
describe('Profile 0', () => {
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
	let onMOSObjects: MockedFunction<any>

	beforeAll(async () => {
		mosConnection = await getMosConnection(
			{
				'0': true,
				'1': true, // Must support at least one other profile
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
		onMOSObjects = vitest.fn(async (): Promise<IMOSAck> => {
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
		expect(serverSocketMockLower).toBeTruthy()
	})
	test('heartbeat from other party', async () => {
		expect(serverSocketMockLower).toBeTruthy()

		serverSocketMockLower.setAutoReplyToHeartBeat(false) // Handle heartbeat manually

		const serverReply: MockedFunction<(data: any) => false> = vitest.fn((_data: any) => false)
		serverSocketMockLower.mockAddReply(serverReply)
		// Fake incoming message on socket:
		const sendMessageId = await fakeIncomingMessage(serverSocketMockLower, xmlData.heartbeat)
		await delay(10) // to allow for async timers & events to triggered

		expect(serverReply).toHaveBeenCalledTimes(1)

		const msg = serverSocketMockLower.decode(serverReply.mock.calls[0][0])

		expect(msg).toMatch(/<heartbeat/)
		expect(msg).toMatch('<messageID>' + sendMessageId)

		serverSocketMockLower.setAutoReplyToHeartBeat(true) // reset
	})
	test('send heartbeats', async () => {
		socketMockLower.setAutoReplyToHeartBeat(false) // Handle heartbeat manually
		socketMockUpper.setAutoReplyToHeartBeat(false) // Handle heartbeat manually

		const heartbeatCount = {
			upper: 0,
			lower: 0,
		}

		const mockReply = (portType: 'upper' | 'lower') => {
			return (data: any) => {
				const str = decode(data)
				const messageID = getMessageId(str)

				if (str.match(/<heartbeat/)) {
					const repl = getXMLReply(messageID, xmlData.heartbeat)
					heartbeatCount[portType]++
					return encode(repl)
				} else throw new Error('Mock: Unhandled message: ' + str)
			}
		}

		for (let i = 0; i < 100; i++) {
			socketMockUpper.mockAddReply(mockReply('upper'))
			socketMockLower.mockAddReply(mockReply('lower'))
		}

		// During this time, there should have been sent a few heartbeats to the server:
		await delay(DEFAULT_TIMEOUT * 4.5)
		expect(heartbeatCount.upper).toBeGreaterThanOrEqual(4)
		expect(heartbeatCount.lower).toBeGreaterThanOrEqual(4)
		expect(mosDevice.getConnectionStatus()).toMatchObject({ PrimaryConnected: true })

		socketMockLower.setAutoReplyToHeartBeat(true) // reset
		socketMockUpper.setAutoReplyToHeartBeat(true) // reset
	})

	test('unknown party connects', async () => {
		expect(serverSocketMockLower).toBeTruthy()
		serverSocketMockLower.setAutoReplyToHeartBeat(false)
		const serverReply: MockedFunction<(data: any) => false> = vitest.fn((_data: any) => false)
		serverSocketMockLower.mockAddReply(serverReply)

		// Fake incoming message on socket:
		let sendMessageId = await fakeIncomingMessage(serverSocketMockLower, xmlData.heartbeat, 'ourUnknownMosId')
		await delay(10) // to allow for async timers & events to triggered

		expect(serverReply).toHaveBeenCalledTimes(1)
		let msg = serverSocketMockLower.decode(serverReply.mock.calls[0][0])
		expect(msg).toMatch(/<mosAck>/)
		expect(msg).toMatch('<messageID>' + sendMessageId)
		expect(msg).toMatch('<status>NACK')

		serverReply.mockClear()
		serverSocketMockLower.mockAddReply(serverReply)

		// Fake incoming message on socket:
		sendMessageId = await fakeIncomingMessage(
			serverSocketMockLower,
			xmlData.heartbeat,
			undefined,
			'theirUnknownMosId'
		)
		await delay(10) // to allow for async timers & events to triggered

		expect(serverReply).toHaveBeenCalledTimes(1)
		msg = serverSocketMockLower.decode(serverReply.mock.calls[0][0])
		expect(msg).toMatch(/<mosAck>/)
		expect(msg).toMatch('<messageID>' + sendMessageId)
		expect(msg).toMatch('<status>NACK')
	})
	// TODO: listMachInfo

	test('requestMachineInfo', async () => {
		// Prepare mock server response:
		const mockReply = vitest.fn((data) => {
			const str = decode(data)
			const messageID = getMessageId(str)
			const repl = getXMLReply(messageID, xmlData.machineInfo)
			return encode(repl)
		})
		socketMockLower.mockAddReply(mockReply)
		if (!xmlApiData.mosObj.ID) throw new Error('xmlApiData.mosObj.ID not set')

		const returnedMachineInfo: IMOSListMachInfo = await mosDevice.requestMachineInfo()
		expect(mockReply).toHaveBeenCalledTimes(1)
		const msg = decode(mockReply.mock.calls[0][0])
		expect(msg).toMatch(/<reqMachInfo\/>/)
		checkMessageSnapshot(msg)

		expect(returnedMachineInfo).toMatchObject(xmlApiData.machineInfoReply)
		expect(returnedMachineInfo).toMatchSnapshot()
	})
	test('requestMachineInfo - missing <opTime>', async () => {
		// Prepare mock server response:
		const mockReply = vitest.fn((data) => {
			const str = decode(data)
			const replyMessage = xmlData.machineInfo.replace(/<opTime>.*<\/opTime>/, '')
			const repl = getXMLReply(getMessageId(str), replyMessage)
			return encode(repl)
		})
		socketMockLower.mockAddReply(mockReply)
		if (!xmlApiData.mosObj.ID) throw new Error('xmlApiData.mosObj.ID not set')

		const returnedMachineInfo: IMOSListMachInfo = await mosDevice.requestMachineInfo()
		expect(mockReply).toHaveBeenCalledTimes(1)
		const msg = decode(mockReply.mock.calls[0][0])
		expect(msg).toMatch(/<reqMachInfo\/>/)
		checkMessageSnapshot(msg)

		const replyMessage = { ...xmlApiData.machineInfoReply }
		delete replyMessage.opTime

		expect(returnedMachineInfo).toMatchObject(replyMessage)
		expect(returnedMachineInfo.opTime).toBeUndefined()
	})
	test('requestMachineInfo - empty <opTime>', async () => {
		// Prepare mock server response:
		const mockReply = vitest.fn((data) => {
			const str = decode(data)
			const replyMessage = xmlData.machineInfo.replace(/<opTime>.*<\/opTime>/, '<opTime></opTime>')
			const repl = getXMLReply(getMessageId(str), replyMessage)
			return encode(repl)
		})
		socketMockLower.mockAddReply(mockReply)
		if (!xmlApiData.mosObj.ID) throw new Error('xmlApiData.mosObj.ID not set')

		const returnedMachineInfo: IMOSListMachInfo = await mosDevice.requestMachineInfo()
		expect(mockReply).toHaveBeenCalledTimes(1)
		const msg = decode(mockReply.mock.calls[0][0])
		expect(msg).toMatch(/<reqMachInfo\/>/)
		checkMessageSnapshot(msg)

		const replyMessage = { ...xmlApiData.machineInfoReply }
		delete replyMessage.opTime

		expect(returnedMachineInfo).toMatchObject(replyMessage)
		expect(returnedMachineInfo.opTime).toBeUndefined()
	})
	test('requestMachineInfo - bad formatted <opTime>', async () => {
		// Prepare mock server response:
		const mockReply = vitest.fn((data) => {
			const str = decode(data)
			const messageID = getMessageId(str)
			const replyMessage = xmlData.machineInfo.replace(/<opTime>.*<\/opTime>/, '<opTime>>BAD DATA</opTime>')
			const repl = getXMLReply(messageID, replyMessage)
			return encode(repl)
		})
		socketMockLower.mockAddReply(mockReply)
		if (!xmlApiData.mosObj.ID) throw new Error('xmlApiData.mosObj.ID not set')

		let caughtError: Error | undefined = undefined
		await mosDevice.requestMachineInfo().catch((err) => {
			caughtError = err
		})
		expect(mockReply).toHaveBeenCalledTimes(1)

		expect(String(caughtError)).toMatch(/Unable to parse MOS reply.*listMachInfo.opTime.*Invalid timestamp/i)
	})
	test('requestMachineInfo - missing <time>', async () => {
		// Prepare mock server response:
		const mockReply = vitest.fn((data) => {
			const str = decode(data)
			const replyMessage = xmlData.machineInfo.replace(/<time>.*<\/time>/, '')
			const repl = getXMLReply(getMessageId(str), replyMessage)
			return encode(repl)
		})
		socketMockLower.mockAddReply(mockReply)
		if (!xmlApiData.mosObj.ID) throw new Error('xmlApiData.mosObj.ID not set')

		let caughtError: Error | undefined = undefined
		await mosDevice.requestMachineInfo().catch((err) => {
			caughtError = err
		})
		expect(mockReply).toHaveBeenCalledTimes(1)

		expect(String(caughtError)).toMatch(/Unable to parse MOS reply.*listMachInfo.time.*Invalid input/i)
	})
	test('requestMachineInfo - empty <time>', async () => {
		// Prepare mock server response:
		const mockReply = vitest.fn((data) => {
			const str = decode(data)
			const replyMessage = xmlData.machineInfo.replace(/<time>.*<\/time>/, '<time></time>')
			const repl = getXMLReply(getMessageId(str), replyMessage)
			return encode(repl)
		})
		socketMockLower.mockAddReply(mockReply)
		if (!xmlApiData.mosObj.ID) throw new Error('xmlApiData.mosObj.ID not set')

		let caughtError: Error | undefined = undefined
		await mosDevice.requestMachineInfo().catch((err) => {
			caughtError = err
		})
		expect(mockReply).toHaveBeenCalledTimes(1)

		expect(String(caughtError)).toMatch(/Unable to parse MOS reply.*listMachInfo.time.*Invalid input/i)
	})
	test('requestMachineInfo - bad formatted <time>', async () => {
		// Prepare mock server response:
		const mockReply = vitest.fn((data) => {
			const str = decode(data)
			const replyMessage = xmlData.machineInfo.replace(/<time>.*<\/time>/, '<time>BAD DATA</time>')
			const repl = getXMLReply(getMessageId(str), replyMessage)
			return encode(repl)
		})
		socketMockLower.mockAddReply(mockReply)
		if (!xmlApiData.mosObj.ID) throw new Error('xmlApiData.mosObj.ID not set')

		let caughtError: Error | undefined = undefined
		await mosDevice.requestMachineInfo().catch((err) => {
			caughtError = err
		})
		expect(mockReply).toHaveBeenCalledTimes(1)

		expect(String(caughtError)).toMatch(/Unable to parse MOS reply.*listMachInfo.time.*Invalid timestamp/i)
	})
})
