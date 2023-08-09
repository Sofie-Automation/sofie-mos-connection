import {
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
	getReplyToServer,
	getXMLReply,
	mosTypes,
	setupMocks,
} from './lib'
import { MosConnection, MosDevice, IMOSROAck, IMOSROFullStory, IMOSRunningOrder } from '..'
import { SocketMock } from '../__mocks__/socket'
import { ServerMock } from '../__mocks__/server'
import { xmlData, xmlApiData } from '../__mocks__/testData'

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

describe('Profile 4', () => {
	let mosDevice: MosDevice
	let mosConnection: MosConnection
	let socketMockLower: SocketMock
	let socketMockUpper: SocketMock

	let serverSocketMockLower: SocketMock
	let serverSocketMockUpper: SocketMock
	let serverSocketMockQuery: SocketMock

	let onROStory: jest.Mock<any, any>

	beforeAll(async () => {
		SocketMock.mockClear()
		ServerMock.mockClear()

		mosConnection = await getMosConnection(
			{
				'0': true,
				'1': true,
				'2': true,
				'4': true,
			},
			false
		)
		mosDevice = await getMosDevice(mosConnection)

		const roAckReply = async () => {
			const ack: IMOSROAck = {
				ID: mosTypes.mosString128.create('runningOrderId'),
				Status: mosTypes.mosString128.create('OK'),
				Stories: [],
			}
			return ack
		}
		// Profile 4:
		onROStory = jest.fn(roAckReply)

		mosDevice.onRunningOrderStory(async (story: IMOSROFullStory): Promise<IMOSROAck> => {
			return onROStory(story)
		})
		const b = doBeforeAll()
		socketMockLower = b.socketMockLower
		socketMockUpper = b.socketMockUpper
		serverSocketMockLower = b.serverSocketMockLower
		serverSocketMockUpper = b.serverSocketMockUpper
		serverSocketMockQuery = b.serverSocketMockQuery

		mosConnection.checkProfileValidness()
		mosDevice.checkProfileValidness()
	})
	beforeEach(() => {
		onROStory.mockClear()

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
		mosDevice.checkProfileValidness()
	})
	test('onRunningOrderStory', async () => {
		// Fake incoming message on socket:

		const messageId = await fakeIncomingMessage(serverSocketMockLower, xmlData.roStorySend)
		expect(onROStory).toHaveBeenCalledTimes(1)

		const o = Object.assign({}, xmlApiData.roStorySend)
		// @ts-ignore optional property
		delete o.Body
		expect(onROStory.mock.calls[0][0]).toMatchObject(o)

		expect(fixSnapshot(onROStory.mock.calls)).toMatchSnapshot()
		xmlApiData.roStorySend.Body.forEach((testItem, key) => {
			let item: any
			try {
				item = onROStory.mock.calls[0][0].Body[key]
				if (!testItem.Content) delete testItem.Content

				expect(item).toMatchObject(testItem)
			} catch (e) {
				console.error(key)
				console.error('item', item)
				console.error('testItem', testItem)
				throw e
			}
		})
		await checkReplyToServer(serverSocketMockLower, messageId, '<roAck>')
	})
	test('onRequestAllRunningOrders', async () => {
		const onRoReqAll = jest.fn(async (): Promise<IMOSRunningOrder[]> => {
			return [
				{
					ID: mosTypes.mosString128.create('96857485'),
					Slug: mosTypes.mosString128.create('the slug'),
					DefaultChannel: mosTypes.mosString128.create('14'),
					EditorialStart: mosTypes.mosTime.create('2005-07-01T13:15:00Z'),
					EditorialDuration: mosTypes.mosDuration.create('1:23:45'),
					Trigger: mosTypes.mosString128.create('A'),
					Stories: [],
				},
				{
					ID: mosTypes.mosString128.create('96857486'),
					Slug: mosTypes.mosString128.create('the slug2'),
					DefaultChannel: mosTypes.mosString128.create('19'),
					Stories: [],
				},
			]
		})
		mosDevice.onRequestAllRunningOrders(onRoReqAll)

		// Fake incoming message on socket:
		const messageId = await fakeIncomingMessage(serverSocketMockLower, xmlData.roReqAll)
		expect(onRoReqAll).toHaveBeenCalledTimes(1)

		const reply = await getReplyToServer(serverSocketMockLower, messageId)
		expect(reply.mos.roListAll).toMatchObject({
			ro: [
				{
					roID: { _text: 96857485 },
					roSlug: { _text: 'the slug' },
					roChannel: { _text: 14 },
					roEdStart: { _text: '2005-07-01T13:15:00,000Z' },
					roEdDur: { _text: '1:23:45' },
					roTrigger: { _text: 'A' },
				},
				{
					roID: { _text: 96857486 },
				},
			],
		})
	})
	test('getAllRunningOrders', async () => {
		// Prepare server response
		const mockReply = jest.fn((data) => {
			const str = decode(data)
			const messageID = getMessageId(str)
			return encode(getXMLReply(messageID, xmlData.roListAll))
		})
		socketMockUpper.mockAddReply(mockReply)
		const returnedListAll = await mosDevice.sendRequestAllRunningOrders()
		await socketMockUpper.mockWaitForSentMessages()
		expect(mockReply).toHaveBeenCalledTimes(1)
		const msg = decode(mockReply.mock.calls[0][0])
		expect(msg).toMatch(/<roReqAll/)
		checkMessageSnapshot(msg)

		expect(returnedListAll).toHaveLength(2)
		expect(returnedListAll[0]).toMatchObject(xmlApiData.roListAll[0])
		expect(returnedListAll[1]).toMatchObject(xmlApiData.roListAll[1])
		expect(returnedListAll).toMatchSnapshot()
	})
	// onRequestAllRunningOrders
	// sendRunningOrderStory
})
