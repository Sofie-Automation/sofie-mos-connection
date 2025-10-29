import {
	checkMessageSnapshot,
	clearMocks,
	decode,
	doBeforeAll,
	encode,
	getMessageId,
	getMosConnection,
	getMosDevice,
	getXMLReply,
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
describe('Profile 0 - Open Media (non strict)', () => {
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
	test('requestMachineInfo - missing <time>', async () => {
		// Prepare mock server response:
		const mockReply = vitest.fn((data) => {
			const str = decode(data)
			const messageID = getMessageId(str)
			const replyMessage = xmlData.machineInfoOpenMedia.replace(/<time>.*<\/time>/, '')
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

		const replyMessage = { ...xmlApiData.machineInfoOpenMediaReply }
		replyMessage.time = returnedMachineInfo.time
		delete replyMessage.opTime

		expect(returnedMachineInfo).toMatchObject(replyMessage)
		// expect(returnedMachineInfo.opTime).toBeUndefined()
	})
	test('requestMachineInfo - empty <time>', async () => {
		// Prepare mock server response:
		const mockReply = vitest.fn((data) => {
			const str = decode(data)
			const messageID = getMessageId(str)
			const replyMessage = xmlData.machineInfoOpenMedia.replace(/<time>.*<\/time>/, '<time></time>')
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

		const replyMessage = { ...xmlApiData.machineInfoOpenMediaReply }
		replyMessage.time = returnedMachineInfo.time
		delete replyMessage.opTime

		expect(returnedMachineInfo).toMatchObject(replyMessage)
		// expect(returnedMachineInfo.opTime).toBeUndefined()
	})
	test('requestMachineInfo - bad formatted <time>', async () => {
		// Prepare mock server response:
		const mockReply = vitest.fn((data) => {
			const str = decode(data)
			const messageID = getMessageId(str)
			const replyMessage = xmlData.machineInfoOpenMedia.replace(/<time>.*<\/time>/, '<time>BAD DATA</time>')
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
			const replyMessage = xmlData.machineInfoOpenMedia.replace(/<opTime>.*<\/opTime>/, '')
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

		const replyMessage = { ...xmlApiData.machineInfoOpenMediaReply }
		delete replyMessage.opTime
		replyMessage.time = returnedMachineInfo.time

		expect(returnedMachineInfo).toMatchObject(replyMessage)
		expect(returnedMachineInfo.opTime).toBeUndefined()
	})
})
