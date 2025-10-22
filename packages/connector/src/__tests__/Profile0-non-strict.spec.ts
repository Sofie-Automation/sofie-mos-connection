import {
	checkMessageSnapshot,
	clearMocks,
	decode,
	DEFAULT_TIMEOUT,
	delay,
	doBeforeAll,
	encode,
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
/* eslint-enable @typescript-eslint/no-unused-vars */

beforeAll(() => {
	setupMocks()
})
beforeEach(() => {
	clearMocks()
})
describe('Profile 0 - non strict', () => {
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

	beforeAll(async () => {
		mosConnection = await getMosConnection(
			{
				'0': true,
				'1': true, // Must support at least one other profile
			},
			false
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
	test('send heartbeats - no messageId', async () => {
		socketMockLower.setAutoReplyToHeartBeat(false) // Handle heartbeat manually
		socketMockUpper.setAutoReplyToHeartBeat(false) // Handle heartbeat manually

		const heartbeatCount = {
			upper: 0,
			lower: 0,
		}

		const mockReply = (portType: 'upper' | 'lower') => {
			return (data: any) => {
				const str = decode(data)

				if (str.match(/<heartbeat/)) {
					const repl = getXMLReply('', xmlData.heartbeat)
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
	test('requestMachineInfo - missing <time>', async () => {
		// Prepare mock server response:
		const mockReply = vitest.fn((data) => {
			const str = decode(data)
			const messageID = getMessageId(str)
			const replyMessage = xmlData.machineInfo.replace(/<time>.*<\/time>/, '')
			const repl = getXMLReply(messageID, replyMessage)
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
		replyMessage.time = mosTypes.mosTime.fallback()

		expect(returnedMachineInfo).toMatchObject(replyMessage)
		// expect(returnedMachineInfo.opTime).toBeUndefined()
	})
	test('requestMachineInfo - empty <time>', async () => {
		// Prepare mock server response:
		const mockReply = vitest.fn((data) => {
			const str = decode(data)
			const messageID = getMessageId(str)
			const replyMessage = xmlData.machineInfo.replace(/<time>.*<\/time>/, '<time></time>')
			const repl = getXMLReply(messageID, replyMessage)
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
		replyMessage.time = mosTypes.mosTime.fallback()

		expect(returnedMachineInfo).toMatchObject(replyMessage)
		// expect(returnedMachineInfo.opTime).toBeUndefined()
	})
	test('requestMachineInfo - empty <time>, no messageId', async () => {
		// Prepare mock server response:
		const mockReply = vitest.fn((_data) => {
			const replyMessage = xmlData.machineInfo.replace(/<time>.*<\/time>/, '<time></time>')
			const repl = getXMLReply('', replyMessage)
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
		replyMessage.time = mosTypes.mosTime.fallback()

		expect(returnedMachineInfo).toMatchObject(replyMessage)
		// expect(returnedMachineInfo.opTime).toBeUndefined()
	})
	test('requestMachineInfo - bad formatted <time>', async () => {
		// Prepare mock server response:
		const mockReply = vitest.fn((data) => {
			const str = decode(data)
			const messageID = getMessageId(str)
			const replyMessage = xmlData.machineInfo.replace(/<time>.*<\/time>/, '<time>BAD DATA</time>')
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

		expect(String(caughtError)).toMatch(/Unable to parse MOS reply.*Invalid timestamp/i)
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

		expect(String(caughtError)).toMatch(/Unable to parse MOS reply.*Invalid timestamp/i)
	})
})
