import {
	checkAckSnapshot,
	checkMessageSnapshot,
	checkReplyToServer,
	clearMocks,
	decode,
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
	IMOSAck,
	MosConnection,
	MosDevice,
	IMOSObject,
	IMOSObjectList,
	IMOSRequestObjectList,
	IMOSROAck,
	IMOSListSearchableSchema,
	IMOSAckStatus,
	IMOSObjectType,
	IMOSObjectStatus,
	IMOSObjectAirStatus,
} from '../index.js'
import { SocketMock } from '../__mocks__/socket.js'
import { ServerMock } from '../__mocks__/server.js'
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
describe('Profile 3', () => {
	let mosDevice: MosDevice
	let mosConnection: MosConnection
	let socketMockLower: SocketMock
	let socketMockUpper: SocketMock
	let socketMockQuery: SocketMock

	let serverSocketMockLower: SocketMock
	let serverSocketMockUpper: SocketMock
	let serverSocketMockQuery: SocketMock

	let onMosObjCreate: MockedFunction<any>
	let onMosItemReplace: MockedFunction<any>
	let onMosReqSearchableSchema: MockedFunction<(username: string) => Promise<IMOSListSearchableSchema>>
	let onMosReqObjectList: MockedFunction<(options: IMOSRequestObjectList) => Promise<IMOSObjectList>>
	let onRequestObjectActionNew: MockedFunction<any>
	let onRequestObjectActionUpdate: MockedFunction<any>
	let onRequestObjectActionDelete: MockedFunction<any>

	const roAckReply = async () => {
		const ack: IMOSROAck = {
			ID: mosTypes.mosString128.create('runningOrderId'),
			Status: mosTypes.mosString128.create('OK'),
			Stories: [],
		}
		return ack
	}

	const mosAckReply = async () => {
		const ack: IMOSAck = {
			ID: mosTypes.mosString128.create('runningOrderId'),
			Revision: 1,
			Status: IMOSAckStatus.ACK,
			Description: mosTypes.mosString128.create(''),
		}
		return ack
	}

	beforeAll(async () => {
		SocketMock.mockClear()
		ServerMock.mockClear()

		mosConnection = await getMosConnection(
			{
				'0': true,
				'1': true,
				'2': true,
				'3': true,
			},
			false
		)
		mosDevice = await getMosDevice(mosConnection)

		// Profile 3:

		onMosObjCreate = vitest.fn(mosAckReply)
		onMosItemReplace = vitest.fn(roAckReply)
		onMosReqSearchableSchema = vitest.fn(async (username: string) => {
			const response: IMOSListSearchableSchema = {
				username,
				mosSchema: 'https://example.com/mosSearchableSchema',
			}
			return response
		})
		onMosReqObjectList = vitest.fn(async (options: IMOSRequestObjectList) => {
			const response: IMOSObjectList = {
				username: options.username,
				queryID: 'A392938329kdakd2039300d0s9l3l9d0bzAQ',
				listReturnStart: 0,
				listReturnEnd: 0,
				listReturnTotal: 0,
			}
			return response
		})
		onRequestObjectActionNew = vitest.fn(mosAckReply)
		onRequestObjectActionUpdate = vitest.fn(mosAckReply)
		onRequestObjectActionDelete = vitest.fn(mosAckReply)

		mosDevice.onObjectCreate((obj: IMOSObject) => {
			return onMosObjCreate(obj)
		})
		mosDevice.onItemReplace((roID, storyID, item) => {
			return onMosItemReplace(roID, storyID, item)
		})
		mosDevice.onRequestSearchableSchema(async (username) => {
			return onMosReqSearchableSchema(username)
		})
		mosDevice.onRequestObjectList(async (options: IMOSRequestObjectList) => {
			return onMosReqObjectList(options)
		})
		mosDevice.onRequestObjectActionNew((obj) => {
			return onRequestObjectActionNew(obj)
		})
		mosDevice.onRequestObjectActionUpdate((objId, obj) => {
			return onRequestObjectActionUpdate(objId, obj)
		})
		mosDevice.onRequestObjectActionDelete((objId) => {
			return onRequestObjectActionDelete(objId)
		})
		const b = doBeforeAll()
		socketMockLower = b.socketMockLower
		socketMockUpper = b.socketMockUpper
		socketMockQuery = b.socketMockQuery
		serverSocketMockLower = b.serverSocketMockLower
		serverSocketMockUpper = b.serverSocketMockUpper
		serverSocketMockQuery = b.serverSocketMockQuery

		mosConnection.checkProfileValidness()
		mosDevice.checkProfileValidness()
	})
	beforeEach(() => {
		onMosObjCreate.mockClear()
		onMosItemReplace.mockClear()
		onMosReqSearchableSchema.mockClear()
		onMosReqObjectList.mockClear()
		onRequestObjectActionNew.mockClear()
		onRequestObjectActionUpdate.mockClear()
		onRequestObjectActionDelete.mockClear()

		serverSocketMockLower.mockClear()
		serverSocketMockUpper.mockClear()
		serverSocketMockQuery.mockClear()
	})
	afterAll(async () => {
		await mosDevice.dispose()
		await mosConnection.dispose()
	})
	test('init', async () => {
		expect(mosDevice).toBeTruthy()
		expect(socketMockLower).toBeTruthy()
		expect(socketMockUpper).toBeTruthy()
		expect(socketMockQuery).toBeTruthy()
		mosDevice.checkProfileValidness()
	})
	test('onMosObjCreate', async () => {
		const messageId = await fakeIncomingMessage(serverSocketMockLower, xmlData.mosObjCreate)
		expect(onMosObjCreate).toHaveBeenCalledTimes(1)
		expect(onMosObjCreate.mock.calls[0][0]).toMatchObject(xmlApiData.mosObjCreate)
		expect(fixSnapshot(onMosObjCreate.mock.calls)).toMatchSnapshot()
		await checkReplyToServer(serverSocketMockLower, messageId, '<mosAck>')
	})
	test('mosObjCreate', async () => {
		// Prepare server response
		const mockReply = vitest.fn((data) => {
			const str = decode(data)
			const messageID = getMessageId(str)
			return encode(getXMLReply(messageID, xmlData.mosAck))
		})
		socketMockLower.mockAddReply(mockReply)
		const returnedAck = await mosDevice.sendObjectCreate({
			ID: mosTypes.mosString128.create('abc'),
			Slug: mosTypes.mosString128.create('my cool Object'),
			Type: IMOSObjectType.VIDEO,
			TimeBase: 25,
			Duration: 250,
		})
		await socketMockLower.mockWaitForSentMessages()
		expect(mockReply).toHaveBeenCalledTimes(1)
		const msg = decode(mockReply.mock.calls[0][0])
		expect(msg).toMatch(/<mosObjCreate>/)
		checkMessageSnapshot(msg)
		expect(returnedAck).toBeTruthy()
		checkAckSnapshot(returnedAck)
	})
	test('onMosItemReplace', async () => {
		const messageId = await fakeIncomingMessage(serverSocketMockUpper, xmlData.mosItemReplace)
		expect(onMosItemReplace).toHaveBeenCalledTimes(1)
		expect(onMosItemReplace.mock.calls[0][2]).toMatchObject(xmlApiData.mosItemReplace)
		expect(fixSnapshot(onMosItemReplace.mock.calls)).toMatchSnapshot()
		await checkReplyToServer(serverSocketMockUpper, messageId, '<roAck>')
	})
	test('mosItemReplace', async () => {
		// Prepare server response
		const mockReply = vitest.fn((data) => {
			const str = decode(data)
			const messageID = getMessageId(str)
			return encode(getXMLReply(messageID, xmlData.roAck))
		})
		socketMockUpper.mockAddReply(mockReply)
		const returnedAck: IMOSROAck = await mosDevice.sendItemReplace({
			roID: mosTypes.mosString128.create('roX'),
			storyID: mosTypes.mosString128.create('storyY'),
			item: {
				ID: mosTypes.mosString128.create('abc'),
				Slug: mosTypes.mosString128.create('my cool Object'),
				// Type: IMOSObjectType.VIDEO,
				TimeBase: 25,
				Duration: 250,
				ObjectID: mosTypes.mosString128.create('Object0'),
				MOSID: 'our.mos.id',
			},
		})
		await socketMockUpper.mockWaitForSentMessages()
		expect(mockReply).toHaveBeenCalledTimes(1)
		const msg = decode(mockReply.mock.calls[0][0])
		expect(msg).toMatch(/<mosItemReplace>/)
		expect(msg).toMatch(/<roID>roX<\/roID>/)
		expect(msg).toMatch(/<storyID>storyY<\/storyID>/)
		checkMessageSnapshot(msg)
		expect(returnedAck).toBeTruthy()
		checkAckSnapshot(returnedAck)
	})
	test('onMosReqSearchableSchema', async () => {
		const messageId = await fakeIncomingMessage(serverSocketMockQuery, xmlData.mosReqSearchableSchema)
		expect(onMosReqSearchableSchema).toHaveBeenCalledTimes(1)
		expect(onMosReqSearchableSchema.mock.calls[0][0]).toMatch(xmlApiData.mosReqSearchableSchema)
		expect(fixSnapshot(onMosReqSearchableSchema.mock.calls)).toMatchSnapshot()
		await checkReplyToServer(serverSocketMockQuery, messageId, '<mosListSearchableSchema username="jbob"')
	})
	test('mosReqSearchableSchema', async () => {
		// Prepare server response
		const mockReply = vitest.fn((data) => {
			const str = decode(data)
			const messageID = getMessageId(str)
			return encode(getXMLReply(messageID, xmlData.mosListSearchableSchema))
		})
		socketMockQuery.mockAddReply(mockReply)
		const returnedSchema: IMOSListSearchableSchema = await mosDevice.sendRequestSearchableSchema('myUsername')

		await socketMockQuery.mockWaitForSentMessages()
		expect(mockReply).toHaveBeenCalledTimes(1)
		const msg = decode(mockReply.mock.calls[0][0])
		expect(msg).toMatch(/<mosReqSearchableSchema username="myUsername"/)
		checkMessageSnapshot(msg)

		expect(returnedSchema.username).toEqual('myUsername')
		expect(returnedSchema.mosSchema).toEqual('https://MOSA4.com/mos/supported_schemas/MOSAXML2.08')
		expect(returnedSchema).toMatchSnapshot()
	})
	test('onMosReqObjectList', async () => {
		const messageId = await fakeIncomingMessage(serverSocketMockQuery, xmlData.mosReqObjList)
		expect(onMosReqObjectList).toHaveBeenCalledTimes(1)
		expect(onMosReqObjectList.mock.calls[0][0]).toMatchObject(xmlApiData.mosReqObjList)
		expect(fixSnapshot(onMosReqObjectList.mock.calls)).toMatchSnapshot()
		await checkReplyToServer(serverSocketMockQuery, messageId, '<mosObjList')
	})
	test('mosRequestObjectList', async () => {
		// Prepare server response
		const mockReply = vitest.fn((data) => {
			const str = decode(data)
			const messageID = getMessageId(str)
			return encode(getXMLReply(messageID, xmlData.mosObjList))
		})
		socketMockQuery.mockAddReply(mockReply)
		const returnedObjList: IMOSObjectList = await mosDevice.sendRequestObjectList({
			username: 'jbob',
			queryID: mosTypes.mosString128.create('A392938329kdakd2039300d0s9l3l9d0bzAQ'),
			listReturnStart: 1,
			listReturnEnd: 20,
			generalSearch: mosTypes.mosString128.create('boats'),
			mosSchema: '',
			searchGroups: [],
		})

		await socketMockQuery.mockWaitForSentMessages()
		expect(mockReply).toHaveBeenCalledTimes(1)
		const msg = decode(mockReply.mock.calls[0][0])
		expect(msg).toMatch(/<mosReqObjList username="jbob">/)
		checkMessageSnapshot(msg)

		expect(returnedObjList.username).toEqual('jbob')
		expect(returnedObjList.list).toHaveLength(3)
		expect(returnedObjList.list?.[0]).toMatchObject({
			ID: mosTypes.mosString128.create('M000121'),
			Slug: mosTypes.mosString128.create('Hotel Fire'),
			Group: 'Show 7',
			Type: IMOSObjectType.VIDEO,
			TimeBase: 59.94,
			Revision: 1,
			Duration: 1800,
			Status: IMOSObjectStatus.NEW,
			AirStatus: IMOSObjectAirStatus.READY,
		})
		expect(returnedObjList).toMatchSnapshot()
	})
	test('onMosReqObjectActionNew', async () => {
		const messageId = await fakeIncomingMessage(serverSocketMockQuery, xmlData.mosReqObjActionNew)
		expect(onRequestObjectActionNew).toHaveBeenCalledTimes(1)
		expect(onRequestObjectActionNew.mock.calls[0][0]).toMatchObject(xmlApiData.mosObjReqObjActionNew)
		expect(fixSnapshot(onRequestObjectActionNew.mock.calls)).toMatchSnapshot()
		await checkReplyToServer(serverSocketMockQuery, messageId, '<mosAck>')
	})
	test('onMosReqObjectActionUpdate', async () => {
		const messageId = await fakeIncomingMessage(serverSocketMockQuery, xmlData.mosReqObjActionUpdate)
		expect(onRequestObjectActionUpdate).toHaveBeenCalledTimes(1)
		expect(onRequestObjectActionUpdate.mock.calls[0][0]).toMatchObject(xmlApiData.mosObjReqObjActionUpdateObjId)
		expect(onRequestObjectActionUpdate.mock.calls[0][1]).toMatchObject(xmlApiData.mosObjReqObjActionUpdate)
		expect(fixSnapshot(onRequestObjectActionUpdate.mock.calls)).toMatchSnapshot()
		await checkReplyToServer(serverSocketMockQuery, messageId, '<mosAck>')
	})
	test('onMosReqObjectActionDelete', async () => {
		const messageId = await fakeIncomingMessage(serverSocketMockQuery, xmlData.mosReqObjActionDelete)
		expect(onRequestObjectActionDelete).toHaveBeenCalledTimes(1)
		expect(onRequestObjectActionDelete.mock.calls[0][0]).toMatchObject(xmlApiData.mosObjReqObjActionDeleteObjId)
		expect(fixSnapshot(onRequestObjectActionDelete.mock.calls)).toMatchSnapshot()
		await checkReplyToServer(serverSocketMockQuery, messageId, '<mosAck>')
	})
	test('sendMosReqObjectActionNew', async () => {
		// Prepare server response:
		const mockReply = vitest.fn((data) => {
			const str = decode(data)
			const messageID = getMessageId(str)
			return encode(getXMLReply(messageID, xmlData.mosAck))
		})
		socketMockLower.mockAddReply(mockReply)
		await mosDevice.sendRequestObjectActionNew({
			Slug: mosTypes.mosString128.create('abc123'),
			Type: IMOSObjectType.VIDEO,
			TimeBase: 25,
			Duration: 500,
		})
		await socketMockQuery.mockWaitForSentMessages()
		expect(mockReply).toHaveBeenCalledTimes(1)
		const msg = decode(mockReply.mock.calls[0][0])
		expect(msg).toMatch(/<mosReqObjAction operation="NEW">/)
		checkMessageSnapshot(msg)
	})
	test('sendMosReqObjectActionUpdateUpdate', async () => {
		// Prepare server response:
		const mockReply = vitest.fn((data) => {
			const str = decode(data)
			const messageID = getMessageId(str)
			return encode(getXMLReply(messageID, xmlData.mosAck))
		})
		socketMockLower.mockAddReply(mockReply)
		await mosDevice.sendRequestObjectActionUpdate(mosTypes.mosString128.create('OBJID1234'), {
			Slug: mosTypes.mosString128.create('abc123'),
			Type: IMOSObjectType.VIDEO,
			TimeBase: 25,
			Duration: 500,
		})
		await socketMockQuery.mockWaitForSentMessages()
		expect(mockReply).toHaveBeenCalledTimes(1)
		const msg = decode(mockReply.mock.calls[0][0])
		expect(msg).toMatch(/<mosReqObjAction operation="UPDATE" objID="OBJID1234">/)
		checkMessageSnapshot(msg)
	})
	test('sendMosReqObjectActionUpdateDelete', async () => {
		// Prepare server response:
		const mockReply = vitest.fn((data) => {
			const str = decode(data)
			const messageID = getMessageId(str)
			return encode(getXMLReply(messageID, xmlData.mosAck))
		})
		socketMockLower.mockAddReply(mockReply)
		await mosDevice.sendRequestObjectActionDelete(mosTypes.mosString128.create('OBJID1234'))
		await socketMockQuery.mockWaitForSentMessages()
		expect(mockReply).toHaveBeenCalledTimes(1)
		const msg = decode(mockReply.mock.calls[0][0])
		expect(msg).toMatch(/<mosReqObjAction operation="DELETE" objID="OBJID1234"\/>/)
		checkMessageSnapshot(msg)
	})
	test('sendRunningOrderStory', async () => {
		// Prepare server response:
		const mockReply = vitest.fn((data) => {
			const str = decode(data)
			const messageID = getMessageId(str)
			return encode(getXMLReply(messageID, xmlData.roAck))
		})
		socketMockUpper.mockAddReply(mockReply)
		await mosDevice.sendRunningOrderStory(xmlApiData.sendRunningOrderStory)
		await socketMockQuery.mockWaitForSentMessages()
		expect(mockReply).toHaveBeenCalledTimes(1)
		const msg = decode(mockReply.mock.calls[0][0])
		expect(msg).toMatch(/<roStorySend>/)
		expect(msg).toMatch(/<roID>96857485<\/roID>/)
		expect(msg).toMatch(/<storyID>5983A501:0049B924:8390EF1F<\/storyID>/)
		checkMessageSnapshot(msg)
	})
})
