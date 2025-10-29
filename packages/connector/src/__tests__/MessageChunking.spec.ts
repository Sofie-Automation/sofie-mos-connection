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
	makeFakeIncomingMessage,
	mosTypes,
	sendFakeIncomingMessage,
	setupMocks,
} from './lib.js'
import {
	IMOSListMachInfo,
	IMOSObject,
	IMOSROAck,
	IMOSROFullStory,
	IMOSRunningOrder,
	MosConnection,
	MosDevice,
} from '../index.js'
import { SocketMock } from '../__mocks__/socket.js'
import { xmlData, xmlApiData } from '../__mocks__/testData.js'
import { describe, test, expect, beforeAll, beforeEach, afterAll, MockedFunction, vitest } from 'vitest'

beforeAll(() => {
	setupMocks()
})
beforeEach(() => {
	clearMocks()
})

describe('message chunking', () => {
	let mosDevice: MosDevice
	let mosConnection: MosConnection
	let socketMockLower: SocketMock
	let socketMockUpper: SocketMock

	let serverSocketMockLower: SocketMock
	let serverSocketMockUpper: SocketMock
	let serverSocketMockQuery: SocketMock

	let onRequestMachineInfo: MockedFunction<any>
	let onRequestMOSObject: MockedFunction<any>
	let onRequestAllMOSObjects: MockedFunction<any>

	let onRunningOrderStory: MockedFunction<any>

	beforeAll(async () => {
		SocketMock.mockClear()
		// ServerMock.mockClear()

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

		const roAckReply = async () => {
			const ack: IMOSROAck = {
				ID: mosTypes.mosString128.create('runningOrderId'),
				Status: mosTypes.mosString128.create('OK'),
				Stories: [],
			}
			return ack
		}
		// Profile 3:
		onRunningOrderStory = vitest.fn(roAckReply)

		mosDevice.onRunningOrderStory(async (story: IMOSROFullStory): Promise<IMOSROAck> => {
			return onRunningOrderStory(story)
		})
		const b = doBeforeAll()
		socketMockLower = b.socketMockLower
		socketMockUpper = b.socketMockUpper

		serverSocketMockLower = b.serverSocketMockLower
		serverSocketMockUpper = b.serverSocketMockUpper
		serverSocketMockQuery = b.serverSocketMockQuery
	})
	afterAll(async () => {
		await mosConnection.dispose()
	})
	beforeEach(() => {
		onRunningOrderStory.mockClear()

		serverSocketMockLower.mockClear()
		serverSocketMockUpper.mockClear()
		serverSocketMockQuery.mockClear()
	})
	test('init', async () => {
		expect(mosDevice).toBeTruthy()
		expect(socketMockLower).toBeTruthy()
		expect(socketMockUpper).toBeTruthy()
	})

	function chunkSubstr(str: string, size: number) {
		const numChunks = Math.ceil(str.length / size)
		const chunks = new Array(numChunks)

		/* tslint:disable-next-line */
		for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
			chunks[i] = str.slice(o, o + size)
		}

		return chunks
	}

	test('chunks', async () => {
		// Prepare server response
		const mockReply = vitest.fn((data: Buffer) => {
			const str = decode(data)
			const messageID = getMessageId(str)
			const repl = getXMLReply(messageID, xmlData.roList)
			const chunks = chunkSubstr(repl, 500)
			expect(chunks).toHaveLength(4)
			return chunks.map((c) => encode(c))
		})

		socketMockUpper.mockAddReply(mockReply)
		if (!xmlApiData.roList.ID) throw new Error(`xmlApiData.roList.ID not set`)
		const returnedObj = (await mosDevice.sendRequestRunningOrder(xmlApiData.roList.ID)) as IMOSRunningOrder
		await socketMockUpper.mockWaitForSentMessages()
		expect(mockReply).toHaveBeenCalledTimes(1)
		const msg = decode(mockReply.mock.calls[0][0])
		expect(msg).toMatch(/<roReq>/)
		checkMessageSnapshot(msg)
		expect(returnedObj).toMatchObject(xmlApiData.roList2)
		expect(returnedObj).toMatchSnapshot()
	})

	test('chunk around space', async () => {
		// Prepare server response
		const mockReply = vitest.fn((data) => {
			const str = decode(data)
			const messageID = getMessageId(str)
			const repl = getXMLReply(messageID, xmlData.roList)

			const splitPoint = repl.indexOf('Test MOS')
			expect(splitPoint).not.toEqual(-1)

			const chunks = [repl.slice(0, splitPoint + 4), repl.slice(splitPoint + 4)]
			return chunks.map((c) => encode(c))
		})

		socketMockUpper.mockAddReply(mockReply)
		if (!xmlApiData.roList.ID) throw new Error(`xmlApiData.roList.ID not set`)
		const returnedObj = (await mosDevice.sendRequestRunningOrder(xmlApiData.roList.ID)) as IMOSRunningOrder
		await socketMockUpper.mockWaitForSentMessages()
		expect(mockReply).toHaveBeenCalledTimes(1)
		const msg = decode(mockReply.mock.calls[0][0])
		expect(msg).toMatch(/<roReq>/)
		checkMessageSnapshot(msg)
		expect(returnedObj).toMatchObject(xmlApiData.roList2)
		expect(returnedObj).toMatchSnapshot()

		// This is what we split in half
		const storySlug = mosTypes.mosString128.create(returnedObj.Stories[1].Slug)
		expect(storySlug).toBeTruthy()
		expect(mosTypes.mosString128.stringify(storySlug)).toEqual('Test MOS')
	})

	test('junk data before', async () => {
		// Prepare server response
		const mockReply = vitest.fn((data) => {
			const str = decode(data)
			const messageID = getMessageId(str)
			const repl = getXMLReply(messageID, xmlData.roList)

			const padded = '         JUNK DATA   ' + repl
			return encode(padded)
		})

		socketMockUpper.mockAddReply(mockReply)
		if (!xmlApiData.roList.ID) throw new Error(`xmlApiData.roList.ID not set`)
		const returnedObj = (await mosDevice.sendRequestRunningOrder(xmlApiData.roList.ID)) as IMOSRunningOrder
		await socketMockUpper.mockWaitForSentMessages()
		expect(mockReply).toHaveBeenCalledTimes(1)
		const msg = decode(mockReply.mock.calls[0][0])
		expect(msg).toMatch(/<roReq>/)
		checkMessageSnapshot(msg)
		expect(returnedObj).toMatchObject(xmlApiData.roList2)
		expect(returnedObj).toMatchSnapshot()
	})

	test('junk data packet before', async () => {
		// Prepare server response
		const mockReply = vitest.fn((data) => {
			const str = decode(data)
			const messageID = getMessageId(str)
			const repl = getXMLReply(messageID, xmlData.roList)

			const chunks = ['         JUNK DATA   ', repl]
			return chunks.map((c) => encode(c))
		})

		socketMockUpper.mockAddReply(mockReply)
		if (!xmlApiData.roList.ID) throw new Error(`xmlApiData.roList.ID not set`)
		const returnedObj = (await mosDevice.sendRequestRunningOrder(xmlApiData.roList.ID)) as IMOSRunningOrder
		await socketMockUpper.mockWaitForSentMessages()
		expect(mockReply).toHaveBeenCalledTimes(1)
		const msg = decode(mockReply.mock.calls[0][0])
		expect(msg).toMatch(/<roReq>/)
		checkMessageSnapshot(msg)
		expect(returnedObj).toMatchObject(xmlApiData.roList2)
		expect(returnedObj).toMatchSnapshot()
	})

	test('incoming chunked message', async () => {
		const onRequestMOSObject = vitest.fn(async (_objId: string) => {
			return xmlApiData.mosObj
		})
		onRequestMOSObject.mockClear()
		mosDevice.onRequestMOSObject(async (objId: string): Promise<IMOSObject | null> => {
			return onRequestMOSObject(objId)
		})

		const message = makeFakeIncomingMessage(`<mosReqObj><objID>M000123</objID></mosReqObj>`)

		const chunks = [message.message.slice(0, 100), message.message.slice(100)]

		// Send first part of the message:
		sendFakeIncomingMessage(serverSocketMockLower, chunks[0])
		expect(onRequestMOSObject).toHaveBeenCalledTimes(0)

		// Send rest of the message:
		sendFakeIncomingMessage(serverSocketMockLower, chunks[1])
		expect(onRequestMOSObject).toHaveBeenCalledTimes(1)
	})

	test('multiple mos tags', async () => {
		const onRequestMOSObject = vitest.fn(async (_objId: string) => {
			return xmlApiData.mosObj
		})
		onRequestMOSObject.mockClear()
		mosDevice.onRequestMOSObject(async (objId: string): Promise<IMOSObject | null> => {
			return onRequestMOSObject(objId)
		})

		const message = makeFakeIncomingMessage(
			`<mosReqObj><objID>M000123</objID><mos><test>hehehe</test></mos></mosReqObj>`
		)

		const i0 = message.message.indexOf('<mos>', 10)
		const i1 = message.message.indexOf('</mos>', i0 + 1)
		const i2 = message.message.indexOf('</mos>', i1 + 1)

		const chunks = [
			message.message.slice(0, i0),
			message.message.slice(i0, i1),
			message.message.slice(i1, i2),
			message.message.slice(i2),
		]

		// Send the parts of the message:
		sendFakeIncomingMessage(serverSocketMockLower, chunks[0])
		expect(onRequestMOSObject).toHaveBeenCalledTimes(0)
		sendFakeIncomingMessage(serverSocketMockLower, chunks[1])
		expect(onRequestMOSObject).toHaveBeenCalledTimes(0)
		sendFakeIncomingMessage(serverSocketMockLower, chunks[2])
		expect(onRequestMOSObject).toHaveBeenCalledTimes(0)
		sendFakeIncomingMessage(serverSocketMockLower, chunks[2])
		expect(onRequestMOSObject).toHaveBeenCalledTimes(1)
	})
	test('multiple messages', async () => {
		const onRequestMOSObject = vitest.fn(async (_objId: string) => {
			return xmlApiData.mosObj
		})
		onRequestMOSObject.mockClear()
		mosDevice.onRequestMOSObject(async (objId: string): Promise<IMOSObject | null> => {
			return onRequestMOSObject(objId)
		})

		const message0 = makeFakeIncomingMessage(
			`<mosReqObj><objID>M000123</objID><mos><test>hehehe</test></mos></mosReqObj>`
		)
		const message1 = makeFakeIncomingMessage(
			`<mosReqObj><objID>M000124</objID><mos><test>hahaha</test></mos></mosReqObj>`
		)

		// Send both messages right away:
		sendFakeIncomingMessage(serverSocketMockLower, message0.message + message1.message)
		expect(onRequestMOSObject).toHaveBeenCalledTimes(2)
	})
})
