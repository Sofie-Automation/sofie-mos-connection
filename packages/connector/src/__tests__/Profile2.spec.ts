/* eslint-disable @typescript-eslint/unbound-method */
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
} from './lib'
import {
	MosConnection,
	MosDevice,
	IMOSObject,
	IMOSItem,
	IMOSItemAction,
	IMOSItemStatus,
	IMOSROAck,
	IMOSROAction,
	IMOSROReadyToAir,
	IMOSROStory,
	IMOSRunningOrder,
	IMOSRunningOrderBase,
	IMOSRunningOrderStatus,
	IMOSStoryAction,
	IMOSStoryStatus,
	IMOSListMachInfo,
	IMOSObjectAirStatus,
	IMOSScope,
	IMOSString128,
} from '..'
import { SocketMock } from '../__mocks__/socket'
import { ServerMock } from '../__mocks__/server'
import { xmlData, xmlApiData } from '../__mocks__/testData'
import { xml2js } from 'xml-js'

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
describe('Profile 2', () => {
	let mosDevice: MosDevice
	let mosConnection: MosConnection
	let socketMockLower: SocketMock
	let socketMockUpper: SocketMock

	let serverSocketMockLower: SocketMock
	let serverSocketMockUpper: SocketMock
	let serverSocketMockQuery: SocketMock

	let onRequestMachineInfo: jest.Mock<any, any>
	let onRequestMOSObject: jest.Mock<any, any>
	let onRequestAllMOSObjects: jest.Mock<any, any>
	let onCreateRunningOrder: jest.Mock<any, any>
	let onReplaceRunningOrder: jest.Mock<any, any>
	let onDeleteRunningOrder: jest.Mock<any, any>
	let onRequestRunningOrder: jest.Mock<any, any>
	let onMetadataReplace: jest.Mock<any, any>
	let onRunningOrderStatus: jest.Mock<any, any>
	let onStoryStatus: jest.Mock<any, any>
	let onItemStatus: jest.Mock<any, any>
	let onReadyToAir: jest.Mock<any, any>
	let onROInsertStories: jest.Mock<any, any>
	let onROInsertItems: jest.Mock<any, any>
	let onROReplaceStories: jest.Mock<any, any>
	let onROReplaceItems: jest.Mock<any, any>
	let onROMoveStories: jest.Mock<any, any>
	let onROMoveItems: jest.Mock<any, any>
	let onRODeleteStories: jest.Mock<any, any>
	let onRODeleteItems: jest.Mock<any, any>
	let onROSwapStories: jest.Mock<any, any>
	let onROSwapItems: jest.Mock<any, any>

	const mockReplyRoAck = jest.fn((data) => {
		const str = decode(data)
		const messageID = getMessageId(str)
		return encode(getXMLReply(messageID, xmlData.roAck))
	})

	beforeAll(async () => {
		SocketMock.mockClear()
		ServerMock.mockClear()

		mosConnection = await getMosConnection(
			{
				'0': true,
				'1': true,
				'2': true,
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
		onRequestMOSObject = jest.fn()
		onRequestAllMOSObjects = jest.fn()
		mosDevice.onRequestMOSObject(async (objId: string): Promise<IMOSObject | null> => {
			return onRequestMOSObject(objId)
		})
		mosDevice.onRequestAllMOSObjects(async (): Promise<Array<IMOSObject>> => {
			return onRequestAllMOSObjects()
		})

		// Profile 2:
		const roAckReply = async () => {
			const ack: IMOSROAck = {
				ID: mosTypes.mosString128.create('runningOrderId'),
				Status: mosTypes.mosString128.create('OK'),
				Stories: [],
			}
			return ack
		}
		onCreateRunningOrder = jest.fn(roAckReply)
		onReplaceRunningOrder = jest.fn(roAckReply)
		onDeleteRunningOrder = jest.fn(roAckReply)
		onRequestRunningOrder = jest.fn(async () => {
			return xmlApiData.roCreate
		})
		onMetadataReplace = jest.fn(roAckReply)
		onRunningOrderStatus = jest.fn(roAckReply)
		onStoryStatus = jest.fn(roAckReply)
		onItemStatus = jest.fn(roAckReply)
		onReadyToAir = jest.fn(roAckReply)
		onROInsertStories = jest.fn(roAckReply)
		onROInsertItems = jest.fn(roAckReply)
		onROReplaceStories = jest.fn(roAckReply)
		onROReplaceItems = jest.fn(roAckReply)
		onROMoveStories = jest.fn(roAckReply)
		onROMoveItems = jest.fn(roAckReply)
		onRODeleteStories = jest.fn(roAckReply)
		onRODeleteItems = jest.fn(roAckReply)
		onROSwapStories = jest.fn(roAckReply)
		onROSwapItems = jest.fn(roAckReply)

		mosDevice.onCreateRunningOrder(async (ro: IMOSRunningOrder): Promise<IMOSROAck> => {
			return onCreateRunningOrder(ro)
		})
		mosDevice.onReplaceRunningOrder(async (ro: IMOSRunningOrder): Promise<IMOSROAck> => {
			return onReplaceRunningOrder(ro)
		})
		mosDevice.onDeleteRunningOrder(async (runningOrderId: IMOSString128): Promise<IMOSROAck> => {
			return onDeleteRunningOrder(runningOrderId)
		})
		mosDevice.onRequestRunningOrder(async (runningOrderId: IMOSString128): Promise<IMOSRunningOrder | null> => {
			return onRequestRunningOrder(runningOrderId)
		})
		mosDevice.onMetadataReplace(async (metadata: IMOSRunningOrderBase): Promise<IMOSROAck> => {
			return onMetadataReplace(metadata)
		})
		mosDevice.onRunningOrderStatus(async (status: IMOSRunningOrderStatus): Promise<IMOSROAck> => {
			return onRunningOrderStatus(status)
		})
		mosDevice.onStoryStatus(async (status: IMOSStoryStatus): Promise<IMOSROAck> => {
			return onStoryStatus(status)
		})
		mosDevice.onItemStatus(async (status: IMOSItemStatus): Promise<IMOSROAck> => {
			return onItemStatus(status)
		})
		mosDevice.onReadyToAir(async (Action: IMOSROReadyToAir): Promise<IMOSROAck> => {
			return onReadyToAir(Action)
		})
		mosDevice.onROInsertStories(
			async (Action: IMOSStoryAction, Stories: Array<IMOSROStory>): Promise<IMOSROAck> => {
				return onROInsertStories(Action, Stories)
			}
		)
		mosDevice.onROInsertItems(async (Action: IMOSItemAction, Items: Array<IMOSItem>): Promise<IMOSROAck> => {
			return onROInsertItems(Action, Items)
		})
		mosDevice.onROReplaceStories(
			async (Action: IMOSStoryAction, Stories: Array<IMOSROStory>): Promise<IMOSROAck> => {
				return onROReplaceStories(Action, Stories)
			}
		)
		mosDevice.onROReplaceItems(async (Action: IMOSItemAction, Items: Array<IMOSItem>): Promise<IMOSROAck> => {
			return onROReplaceItems(Action, Items)
		})
		mosDevice.onROMoveStories(
			async (Action: IMOSStoryAction, Stories: Array<IMOSString128>): Promise<IMOSROAck> => {
				return onROMoveStories(Action, Stories)
			}
		)
		mosDevice.onROMoveItems(async (Action: IMOSItemAction, Items: Array<IMOSString128>): Promise<IMOSROAck> => {
			return onROMoveItems(Action, Items)
		})
		mosDevice.onRODeleteStories(async (Action: IMOSROAction, Stories: Array<IMOSString128>): Promise<IMOSROAck> => {
			return onRODeleteStories(Action, Stories)
		})
		mosDevice.onRODeleteItems(async (Action: IMOSStoryAction, Items: Array<IMOSString128>): Promise<IMOSROAck> => {
			return onRODeleteItems(Action, Items)
		})
		mosDevice.onROSwapStories(
			async (Action: IMOSROAction, StoryID0: IMOSString128, StoryID1: IMOSString128): Promise<IMOSROAck> => {
				return onROSwapStories(Action, StoryID0, StoryID1)
			}
		)
		mosDevice.onROSwapItems(
			async (Action: IMOSStoryAction, ItemID0: IMOSString128, ItemID1: IMOSString128): Promise<IMOSROAck> => {
				return onROSwapItems(Action, ItemID0, ItemID1)
			}
		)
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
		onRequestMOSObject.mockClear()
		onRequestAllMOSObjects.mockClear()

		onCreateRunningOrder.mockClear()
		onReplaceRunningOrder.mockClear()
		onDeleteRunningOrder.mockClear()
		onRequestRunningOrder.mockClear()
		onMetadataReplace.mockClear()
		onRunningOrderStatus.mockClear()
		onStoryStatus.mockClear()
		onItemStatus.mockClear()
		onReadyToAir.mockClear()
		onROInsertStories.mockClear()
		onROInsertItems.mockClear()
		onROReplaceStories.mockClear()
		onROReplaceItems.mockClear()
		onROMoveStories.mockClear()
		onROMoveItems.mockClear()
		onRODeleteStories.mockClear()
		onRODeleteItems.mockClear()
		onROSwapStories.mockClear()
		onROSwapItems.mockClear()

		serverSocketMockLower.mockClear()
		serverSocketMockUpper.mockClear()
		serverSocketMockQuery.mockClear()

		mockReplyRoAck.mockClear()
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
	test('onCreateRunningOrder', async () => {
		// Fake incoming message on socket:
		const messageId = await fakeIncomingMessage(serverSocketMockLower, xmlData.roCreate)
		expect(onCreateRunningOrder).toHaveBeenCalledTimes(1)
		expect(onCreateRunningOrder.mock.calls[0][0]).toMatchObject(xmlApiData.roCreate)
		expect(fixSnapshot(onCreateRunningOrder.mock.calls)).toMatchSnapshot()
		await checkReplyToServer(serverSocketMockLower, messageId, '<roAck>')
	})
	test('onReplaceRunningOrder', async () => {
		// Fake incoming message on socket:
		const messageId = await fakeIncomingMessage(serverSocketMockLower, xmlData.roReplace)
		expect(onReplaceRunningOrder).toHaveBeenCalledTimes(1)
		expect(onReplaceRunningOrder.mock.calls[0][0]).toMatchObject(xmlApiData.roReplace)
		expect(fixSnapshot(onReplaceRunningOrder.mock.calls)).toMatchSnapshot()
		await checkReplyToServer(serverSocketMockLower, messageId, '<roAck>')
	})
	test('onDeleteRunningOrder', async () => {
		// Fake incoming message on socket:
		const messageId = await fakeIncomingMessage(serverSocketMockLower, xmlData.roDelete)
		expect(onDeleteRunningOrder).toHaveBeenCalledTimes(1)
		expect(onDeleteRunningOrder.mock.calls[0][0]).toEqual(xmlApiData.roDelete)
		expect(fixSnapshot(onDeleteRunningOrder.mock.calls)).toMatchSnapshot()
		await checkReplyToServer(serverSocketMockLower, messageId, '<roAck>')
	})

	test('onRequestRunningOrder', async () => {
		// Fake incoming message on socket:
		const messageId = await fakeIncomingMessage(serverSocketMockUpper, xmlData.roReq)
		expect(onRequestRunningOrder).toHaveBeenCalledTimes(1)

		expect(onRequestRunningOrder.mock.calls[0][0]).toEqual(96857485)
		expect(fixSnapshot(onRequestRunningOrder.mock.calls)).toMatchSnapshot()
		// Check reply to socket server:
		await serverSocketMockUpper.mockWaitForSentMessages()
		expect(serverSocketMockUpper.mockSentMessage).toHaveBeenCalledTimes(1)
		await checkReplyToServer(serverSocketMockUpper, messageId, '<roList>')
		// @ts-ignore mock
		const reply = decode(serverSocketMockUpper.mockSentMessage.mock.calls[0][0])
		const parsedReply: any = xml2js(reply, { compact: true, nativeType: true, trim: true })

		expect(parsedReply.mos.roList.roID._text + '').toEqual(mosTypes.mosString128.stringify(xmlApiData.roCreate.ID))
		expect(parsedReply.mos.roList.roSlug._text + '').toEqual(
			mosTypes.mosString128.stringify(xmlApiData.roCreate.Slug)
		)
		expect(parsedReply.mos.roList.story).toHaveLength(xmlApiData.roCreate.Stories.length)
		expect(parsedReply.mos.roList.story[0].storyID._text + '').toEqual(
			mosTypes.mosString128.stringify(xmlApiData.roCreate.Stories[0].ID)
		)
		expect(parsedReply.mos.roList.story[0].item).toBeTruthy()
		expect(parsedReply.mos.roList.story[0].item.itemID._text + '').toEqual(
			mosTypes.mosString128.stringify(xmlApiData.roCreate.Stories[0].Items[0].ID)
		)
		expect(parsedReply.mos.roList.story[0].item.objID._text + '').toEqual(
			mosTypes.mosString128.stringify(xmlApiData.roCreate.Stories[0].Items[0].ObjectID)
		)

		expect(parsedReply).toMatchSnapshot()
	})
	test('onRequestRunningOrder not found', async () => {
		// setup for "RO not found":
		mosDevice.onRequestRunningOrder(async (_runningOrderId: IMOSString128): Promise<IMOSRunningOrder | null> => {
			return null
		})

		// Fake incoming message on socket:
		const messageId = await fakeIncomingMessage(serverSocketMockUpper, xmlData.roReq)

		// Check reply to socket server:
		await serverSocketMockUpper.mockWaitForSentMessages()
		expect(serverSocketMockUpper.mockSentMessage).toHaveBeenCalledTimes(1)
		await checkReplyToServer(serverSocketMockUpper, messageId, '<roStatus>NACK</roStatus>')
		// @ts-ignore mock
		const reply = decode(serverSocketMockUpper.mockSentMessage.mock.calls[0][0])
		const parsedReply: any = xml2js(reply, { compact: true, nativeType: true, trim: true })

		// roAck is sent with the status value of NACK if the roID is not valid, or if the Running Order is not available
		expect(parsedReply.mos.roAck.roID._text + '').toEqual('96857485')
		expect(parsedReply.mos.roAck.roStatus._text + '').toEqual('NACK')
	})
	test('sendRequestRunningOrder', async () => {
		// Prepare server response
		const mockReply = jest.fn((data) => {
			const str = decode(data)
			const messageID = getMessageId(str)
			const repl = getXMLReply(messageID, xmlData.roList)
			return encode(repl)
		})
		socketMockUpper.mockAddReply(mockReply)
		if (!xmlApiData.roList.ID) throw new Error('xmlApiData.roList.ID not set')
		const returnedObj = (await mosDevice.sendRequestRunningOrder(xmlApiData.roList.ID)) as IMOSRunningOrder
		await socketMockUpper.mockWaitForSentMessages()
		expect(mockReply).toHaveBeenCalledTimes(1)
		const msg = decode(mockReply.mock.calls[0][0])
		expect(msg).toMatch(/<roReq>/)
		checkMessageSnapshot(msg)
		expect(returnedObj).toMatchObject(xmlApiData.roList2)
		expect(returnedObj).toMatchSnapshot()
	})
	test('onMetadataReplace', async () => {
		// Fake incoming message on socket:
		const messageId = await fakeIncomingMessage(serverSocketMockLower, xmlData.roMetadataReplace)
		expect(onMetadataReplace).toHaveBeenCalledTimes(1)
		expect(onMetadataReplace.mock.calls[0][0]).toEqual(xmlApiData.roMetadataReplace)
		expect(fixSnapshot(onMetadataReplace.mock.calls)).toMatchSnapshot()
		await checkReplyToServer(serverSocketMockLower, messageId, '<roAck>')
	})
	test('onRunningOrderStatus', async () => {
		// Fake incoming message on socket:
		const messageId = await fakeIncomingMessage(serverSocketMockLower, xmlData.roElementStat_ro)
		expect(onRunningOrderStatus).toHaveBeenCalledTimes(1)
		expect(onRunningOrderStatus.mock.calls[0][0]).toEqual(xmlApiData.roElementStat_ro)
		expect(fixSnapshot(onRunningOrderStatus.mock.calls)).toMatchSnapshot()
		await checkReplyToServer(serverSocketMockLower, messageId, '<roAck>')
	})
	test('onStoryStatus', async () => {
		// Fake incoming message on socket:
		const messageId = await fakeIncomingMessage(serverSocketMockLower, xmlData.roElementStat_story)
		expect(onStoryStatus).toHaveBeenCalledTimes(1)
		expect(onStoryStatus.mock.calls[0][0]).toEqual(xmlApiData.roElementStat_story)
		expect(fixSnapshot(onStoryStatus.mock.calls)).toMatchSnapshot()
		await checkReplyToServer(serverSocketMockLower, messageId, '<roAck>')
	})
	// TODO: sendStoryStatus
	test('onItemStatus', async () => {
		// Fake incoming message on socket:
		const messageId = await fakeIncomingMessage(serverSocketMockLower, xmlData.roElementStat_item)
		expect(onItemStatus).toHaveBeenCalledTimes(1)
		expect(onItemStatus.mock.calls[0][0]).toEqual(xmlApiData.roElementStat_item)
		expect(fixSnapshot(onItemStatus.mock.calls)).toMatchSnapshot()
		await checkReplyToServer(serverSocketMockLower, messageId, '<roAck>')
	})
	test('sendRunningOrderStatus', async () => {
		// Prepare server response
		const mockReply = jest.fn((data) => {
			const str = decode(data)
			const messageID = getMessageId(str)
			const repl = getXMLReply(messageID, xmlData.roAck)
			return encode(repl)
		})
		socketMockUpper.mockAddReply(mockReply)
		const returnedAck: IMOSROAck = await mosDevice.sendRunningOrderStatus(xmlApiData.roElementStat_ro)
		await socketMockUpper.mockWaitForSentMessages()
		expect(mockReply).toHaveBeenCalledTimes(1)
		const msg = decode(mockReply.mock.calls[0][0])
		expect(msg).toMatch(/<roElementStat element="RO">/)
		checkMessageSnapshot(msg)
		expect(returnedAck).toBeTruthy()
		expect(mosTypes.mosString128.stringify(returnedAck.ID)).toEqual('96857485')
		checkAckSnapshot(returnedAck)
	})
	test('sendStoryStatus', async () => {
		// Prepare server response
		socketMockUpper.mockAddReply(mockReplyRoAck)
		const returnedAck: IMOSROAck = await mosDevice.sendStoryStatus(xmlApiData.roElementStat_story)
		await socketMockUpper.mockWaitForSentMessages()
		expect(mockReplyRoAck).toHaveBeenCalledTimes(1)
		const msg = decode(mockReplyRoAck.mock.calls[0][0])
		expect(msg).toMatch(/<roElementStat element="STORY">/)
		checkMessageSnapshot(msg)
		expect(returnedAck).toBeTruthy()
		expect(mosTypes.mosString128.stringify(returnedAck.ID)).toEqual('96857485')
		checkAckSnapshot(returnedAck)
	})
	test('sendItemStatus', async () => {
		// Prepare server response
		socketMockUpper.mockAddReply(mockReplyRoAck)
		const returnedAck: IMOSROAck = await mosDevice.sendItemStatus(xmlApiData.roElementStat_item)
		await socketMockUpper.mockWaitForSentMessages()
		expect(mockReplyRoAck).toHaveBeenCalledTimes(1)
		const msg = decode(mockReplyRoAck.mock.calls[0][0])
		expect(msg).toMatch(/<roElementStat element="ITEM">/)
		checkMessageSnapshot(msg)
		expect(returnedAck).toBeTruthy()
		expect(mosTypes.mosString128.stringify(returnedAck.ID)).toEqual('96857485')
		checkAckSnapshot(returnedAck)
	})
	test('onReadyToAir', async () => {
		// Fake incoming message on socket:
		const messageId = await fakeIncomingMessage(serverSocketMockLower, xmlData.roReadyToAir)
		expect(onReadyToAir).toHaveBeenCalledTimes(1)
		expect(onReadyToAir.mock.calls[0][0]).toEqual(xmlApiData.roReadyToAir)
		expect(fixSnapshot(onReadyToAir.mock.calls)).toMatchSnapshot()
		await checkReplyToServer(serverSocketMockLower, messageId, '<roAck>')
	})
	test('onROInsertStories', async () => {
		// Fake incoming message on socket:
		const messageId = await fakeIncomingMessage(serverSocketMockLower, xmlData.roElementAction_insert_story)
		expect(onROInsertStories).toHaveBeenCalledTimes(1)
		expect(onROInsertStories.mock.calls[0][0]).toEqual(xmlApiData.roElementAction_insert_story_Action)
		expect(onROInsertStories.mock.calls[0][1]).toEqual(xmlApiData.roElementAction_insert_story_Stories)
		expect(fixSnapshot(onROInsertStories.mock.calls)).toMatchSnapshot()
		await checkReplyToServer(serverSocketMockLower, messageId, '<roAck>')
	})
	test('onROInsertItems', async () => {
		// Fake incoming message on socket:
		const messageId = await fakeIncomingMessage(serverSocketMockLower, xmlData.roElementAction_insert_item)
		expect(onROInsertItems).toHaveBeenCalledTimes(1)
		expect(onROInsertItems.mock.calls[0][0]).toEqual(xmlApiData.roElementAction_insert_item_Action)
		expect(onROInsertItems.mock.calls[0][1]).toEqual(xmlApiData.roElementAction_insert_item_Items)
		expect(fixSnapshot(onROInsertItems.mock.calls)).toMatchSnapshot()
		await checkReplyToServer(serverSocketMockLower, messageId, '<roAck>')
	})
	test('onROReplaceStories', async () => {
		// Fake incoming message on socket:
		const messageId = await fakeIncomingMessage(serverSocketMockLower, xmlData.roElementAction_replace_story)
		expect(onROReplaceStories).toHaveBeenCalledTimes(1)
		expect(onROReplaceStories.mock.calls[0][0]).toEqual(xmlApiData.roElementAction_replace_story_Action)
		expect(onROReplaceStories.mock.calls[0][1]).toEqual(xmlApiData.roElementAction_replace_story_Stories)
		expect(fixSnapshot(onROReplaceStories.mock.calls)).toMatchSnapshot()
		await checkReplyToServer(serverSocketMockLower, messageId, '<roAck>')
	})
	test('onROReplaceItems', async () => {
		// Fake incoming message on socket:
		const messageId = await fakeIncomingMessage(serverSocketMockLower, xmlData.roElementAction_replace_item)
		expect(onROReplaceItems).toHaveBeenCalledTimes(1)
		expect(onROReplaceItems.mock.calls[0][0]).toEqual(xmlApiData.roElementAction_replace_item_Action)
		expect(onROReplaceItems.mock.calls[0][1]).toEqual(xmlApiData.roElementAction_replace_item_Items)
		expect(fixSnapshot(onROReplaceItems.mock.calls)).toMatchSnapshot()
		await checkReplyToServer(serverSocketMockLower, messageId, '<roAck>')
	})
	test('onROMoveStory', async () => {
		// Fake incoming message on socket:
		const messageId = await fakeIncomingMessage(serverSocketMockLower, xmlData.roElementAction_move_story)
		expect(onROMoveStories).toHaveBeenCalledTimes(1)
		expect(onROMoveStories.mock.calls[0][0]).toEqual(xmlApiData.roElementAction_move_story_Action)
		expect(onROMoveStories.mock.calls[0][1]).toEqual(xmlApiData.roElementAction_move_story_Stories)
		expect(fixSnapshot(onROMoveStories.mock.calls)).toMatchSnapshot()
		await checkReplyToServer(serverSocketMockLower, messageId, '<roAck>')
	})
	test('onROMoveStories', async () => {
		// Fake incoming message on socket:
		const messageId2 = await fakeIncomingMessage(serverSocketMockLower, xmlData.roElementAction_move_stories)
		expect(onROMoveStories).toHaveBeenCalledTimes(1)
		expect(onROMoveStories.mock.calls[0][0]).toEqual(xmlApiData.roElementAction_move_stories_Action)
		expect(onROMoveStories.mock.calls[0][1]).toEqual(xmlApiData.roElementAction_move_stories_Stories)
		expect(fixSnapshot(onROMoveStories.mock.calls)).toMatchSnapshot()
		await checkReplyToServer(serverSocketMockLower, messageId2, '<roAck>')
	})
	test('onROMoveItems', async () => {
		// Fake incoming message on socket:
		const messageId = await fakeIncomingMessage(serverSocketMockLower, xmlData.roElementAction_move_items)
		expect(onROMoveItems).toHaveBeenCalledTimes(1)
		expect(onROMoveItems.mock.calls[0][0]).toEqual(xmlApiData.roElementAction_move_items_Action)
		expect(onROMoveItems.mock.calls[0][1]).toEqual(xmlApiData.roElementAction_move_items_Items)
		expect(fixSnapshot(onROMoveItems.mock.calls)).toMatchSnapshot()
		await checkReplyToServer(serverSocketMockLower, messageId, '<roAck>')
	})
	test('onRODeleteStories', async () => {
		// Fake incoming message on socket:
		const messageId = await fakeIncomingMessage(serverSocketMockLower, xmlData.roElementAction_delete_story)
		expect(onRODeleteStories).toHaveBeenCalledTimes(1)
		expect(onRODeleteStories.mock.calls[0][0]).toEqual(xmlApiData.roElementAction_delete_story_Action)
		expect(onRODeleteStories.mock.calls[0][1]).toEqual(xmlApiData.roElementAction_delete_story_Stories)
		expect(fixSnapshot(onRODeleteStories.mock.calls)).toMatchSnapshot()
		await checkReplyToServer(serverSocketMockLower, messageId, '<roAck>')
	})
	test('onRODeleteItems', async () => {
		// Fake incoming message on socket:
		const messageId = await fakeIncomingMessage(serverSocketMockLower, xmlData.roElementAction_delete_items)
		expect(onRODeleteItems).toHaveBeenCalledTimes(1)
		expect(onRODeleteItems.mock.calls[0][0]).toEqual(xmlApiData.roElementAction_delete_items_Action)
		expect(onRODeleteItems.mock.calls[0][1]).toEqual(xmlApiData.roElementAction_delete_items_Items)
		expect(fixSnapshot(onRODeleteItems.mock.calls)).toMatchSnapshot()
		await checkReplyToServer(serverSocketMockLower, messageId, '<roAck>')
	})
	test('onROSwapStories', async () => {
		// Fake incoming message on socket:
		const messageId = await fakeIncomingMessage(serverSocketMockLower, xmlData.roElementAction_swap_stories)
		expect(onROSwapStories).toHaveBeenCalledTimes(1)
		expect(onROSwapStories.mock.calls[0][0]).toEqual(xmlApiData.roElementAction_swap_stories_Action)
		expect(onROSwapStories.mock.calls[0][1]).toEqual(xmlApiData.roElementAction_swap_stories_StoryId0)
		expect(onROSwapStories.mock.calls[0][2]).toEqual(xmlApiData.roElementAction_swap_stories_StoryId1)
		expect(fixSnapshot(onROSwapStories.mock.calls)).toMatchSnapshot()
		await checkReplyToServer(serverSocketMockLower, messageId, '<roAck>')
	})
	test('onROSwapItems', async () => {
		// Fake incoming message on socket:
		const messageId = await fakeIncomingMessage(serverSocketMockLower, xmlData.roElementAction_swap_items)
		expect(onROSwapItems).toHaveBeenCalledTimes(1)
		expect(onROSwapItems.mock.calls[0][0]).toEqual(xmlApiData.roElementAction_swap_items_Action)
		expect(onROSwapItems.mock.calls[0][1]).toEqual(xmlApiData.roElementAction_swap_items_ItemId0)
		expect(onROSwapItems.mock.calls[0][2]).toEqual(xmlApiData.roElementAction_swap_items_ItemId1)
		expect(fixSnapshot(onROSwapItems.mock.calls)).toMatchSnapshot()
		await checkReplyToServer(serverSocketMockLower, messageId, '<roAck>')
	})
	async function testSendFunctions(sendFcn: () => Promise<IMOSROAck>): Promise<any> {
		mockReplyRoAck.mockClear()
		socketMockUpper.mockAddReply(mockReplyRoAck)

		const returnedAck: IMOSROAck = await sendFcn()
		await socketMockUpper.mockWaitForSentMessages()
		expect(mockReplyRoAck).toHaveBeenCalledTimes(1)
		const msg = decode(mockReplyRoAck.mock.calls[0][0])
		const parsed: any = xml2js(msg, { compact: true, nativeType: true, trim: true })

		checkMessageSnapshot(msg)
		expect(returnedAck).toBeTruthy()
		expect(mosTypes.mosString128.stringify(returnedAck.ID)).toEqual('96857485')
		checkAckSnapshot(returnedAck)

		return parsed
	}

	test('sendCreateRunningOrder, sendReplaceRunningOrder', async () => {
		const ro: IMOSRunningOrder = {
			ID: mosTypes.mosString128.create('96857485'),
			Slug: mosTypes.mosString128.create('the slug'),
			DefaultChannel: mosTypes.mosString128.create('14'),
			EditorialStart: mosTypes.mosTime.create('2005-07-01T13:15:00Z'),
			EditorialDuration: mosTypes.mosDuration.create('1:23:45'),
			Trigger: mosTypes.mosString128.create('A'),
			// MacroIn?: mosTypes.mosString128.create(''),
			// MacroOut?: mosTypes.mosString128.create(''),
			// MosExternalMetaData?: Array<IMOSExternalMetaData>
			Stories: [
				{
					ID: mosTypes.mosString128.create('story0'),
					Slug: mosTypes.mosString128.create('slug0'),
					Items: [],
				},
				{
					ID: mosTypes.mosString128.create('story1'),
					Slug: mosTypes.mosString128.create('slug1'),
					Items: [],
				},
			],
		}
		const roVerify = {
			roID: { _text: 96857485 },
			roSlug: { _text: 'the slug' },
			roEdStart: { _text: '2005-07-01T13:15:00,000Z' },
			roEdDur: { _text: '1:23:45' },
			story: [
				{
					storyID: { _text: 'story0' },
					storySlug: { _text: 'slug0' },
				},
				{
					storyID: { _text: 'story1' },
					storySlug: { _text: 'slug1' },
				},
			],
		}
		{
			const sentMessage = await testSendFunctions(async () => {
				return mosDevice.sendCreateRunningOrder(ro)
			})
			expect(sentMessage.mos.roCreate).toMatchObject(roVerify)
		}
		{
			const sentMessage = await testSendFunctions(async () => {
				return mosDevice.sendReplaceRunningOrder(ro)
			})
			expect(sentMessage.mos.roReplace).toMatchObject(roVerify)
		}
	})
	test('sendDeleteRunningOrder', async () => {
		const sentMessage = await testSendFunctions(async () => {
			return mosDevice.sendDeleteRunningOrder(mosTypes.mosString128.create('96857485'))
		})
		expect(sentMessage.mos.roDelete).toMatchObject({
			roID: { _text: 96857485 },
		})
	})
	test('sendMetadataReplace', async () => {
		const sentMessage = await testSendFunctions(async () => {
			return mosDevice.sendMetadataReplace({
				ID: mosTypes.mosString128.create('96857485'),
				Slug: mosTypes.mosString128.create('the slug'),
				DefaultChannel: mosTypes.mosString128.create('14'),
				EditorialStart: mosTypes.mosTime.create('2005-07-01T13:15:00Z'),
				EditorialDuration: mosTypes.mosDuration.create('1:23:45'),
				Trigger: mosTypes.mosString128.create('A'),
				MosExternalMetaData: [
					{
						MosSchema: 'http://localhost/mySchema0',
						MosScope: IMOSScope.PLAYLIST,
						MosPayload: {
							prop0: 'a',
							prop1: 'b',
						},
					},
					{
						MosSchema: 'http://localhost/mySchema1',
						MosScope: IMOSScope.PLAYLIST,
						MosPayload: {
							prop2: 'x',
							prop3: 'y',
						},
					},
				],
			})
		})
		expect(sentMessage.mos.roMetadataReplace).toMatchObject({
			roID: { _text: 96857485 },
			roSlug: { _text: 'the slug' },
			roEdStart: { _text: '2005-07-01T13:15:00,000Z' },
			roEdDur: { _text: '1:23:45' },
			mosExternalMetadata: [
				{
					mosScope: { _text: 'PLAYLIST' },
					mosSchema: { _text: 'http://localhost/mySchema0' },
					mosPayload: {
						prop0: { _text: 'a' },
						prop1: { _text: 'b' },
					},
				},
				{
					mosScope: { _text: 'PLAYLIST' },
					mosSchema: { _text: 'http://localhost/mySchema1' },
					mosPayload: {
						prop2: { _text: 'x' },
						prop3: { _text: 'y' },
					},
				},
			],
		})
	})

	test('sendReadyToAir', async () => {
		const sentMessage = await testSendFunctions(async () => {
			return mosDevice.sendReadyToAir({
				ID: mosTypes.mosString128.create('96857485'),
				Status: IMOSObjectAirStatus.READY,
			})
		})
		expect(sentMessage.mos.roReadyToAir).toBeTruthy()
		expect(sentMessage.mos.roReadyToAir.roID._text).toBe(96857485)
		expect(sentMessage.mos.roReadyToAir.roAir._text).toBe('READY')
	})
	test('sendROInsertStories', async () => {
		const sentMessage = await testSendFunctions(async () => {
			return mosDevice.sendROInsertStories(
				{
					RunningOrderID: mosTypes.mosString128.create('96857485'),
					StoryID: mosTypes.mosString128.create('existing0'),
				},
				[
					{
						ID: mosTypes.mosString128.create('insert0'),
						Slug: mosTypes.mosString128.create('slug0'),
						Number: mosTypes.mosString128.create('number0'),
						// MosExternalMetaData?: Array<IMOSExternalMetaData>
						Items: [], // Array<IMOSItem>
					},
					{
						ID: mosTypes.mosString128.create('insert1'),
						Slug: mosTypes.mosString128.create('slug1'),
						Number: mosTypes.mosString128.create('number1'),
						Items: [],
					},
				]
			)
		})
		expect(sentMessage.mos.roElementAction).toMatchObject({
			_attributes: { operation: 'INSERT' },
			roID: { _text: 96857485 },
			element_target: {
				storyID: { _text: 'existing0' },
			},
			element_source: {
				story: [
					{
						storyID: { _text: 'insert0' },
						storySlug: { _text: 'slug0' },
						storyNum: { _text: 'number0' },
					},
					{
						storyID: { _text: 'insert1' },
						storySlug: { _text: 'slug1' },
						storyNum: { _text: 'number1' },
					},
				],
			},
		})
	})
	test('sendROInsertItems', async () => {
		const sentMessage = await testSendFunctions(async () => {
			return mosDevice.sendROInsertItems(
				{
					RunningOrderID: mosTypes.mosString128.create('96857485'),
					StoryID: mosTypes.mosString128.create('existing0'),
					ItemID: mosTypes.mosString128.create('existing0_0'),
				},
				[
					{
						ID: mosTypes.mosString128.create('insert0'),
						Slug: mosTypes.mosString128.create('slug0'),
						ObjectID: mosTypes.mosString128.create('objid0'),
						MOSID: 'mosid0',
					},
					{
						ID: mosTypes.mosString128.create('insert1'),
						Slug: mosTypes.mosString128.create('slug1'),
						ObjectID: mosTypes.mosString128.create('objid1'),
						MOSID: 'mosid1',
					},
				]
			)
		})
		expect(sentMessage.mos.roElementAction).toMatchObject({
			_attributes: { operation: 'INSERT' },
			roID: { _text: 96857485 },
			element_target: {
				storyID: { _text: 'existing0' },
				itemID: { _text: 'existing0_0' },
			},
			element_source: {
				item: [
					{
						itemID: { _text: 'insert0' },
						itemSlug: { _text: 'slug0' },
						objID: { _text: 'objid0' },
						mosID: { _text: 'mosid0' },
					},
					{
						itemID: { _text: 'insert1' },
						itemSlug: { _text: 'slug1' },
						objID: { _text: 'objid1' },
						mosID: { _text: 'mosid1' },
					},
				],
			},
		})
	})
	test('sendROReplaceStories', async () => {
		const sentMessage = await testSendFunctions(async () => {
			return mosDevice.sendROReplaceStories(
				{
					RunningOrderID: mosTypes.mosString128.create('96857485'),
					StoryID: mosTypes.mosString128.create('existing0'),
				},
				[
					{
						ID: mosTypes.mosString128.create('insert0'),
						Slug: mosTypes.mosString128.create('slug0'),
						Number: mosTypes.mosString128.create('number0'),
						// MosExternalMetaData?: Array<IMOSExternalMetaData>
						Items: [], // Array<IMOSItem>
					},
					{
						ID: mosTypes.mosString128.create('insert1'),
						Slug: mosTypes.mosString128.create('slug1'),
						Number: mosTypes.mosString128.create('number1'),
						Items: [],
					},
				]
			)
		})
		expect(sentMessage.mos.roElementAction).toMatchObject({
			_attributes: { operation: 'REPLACE' },
			roID: { _text: 96857485 },
			element_target: {
				storyID: { _text: 'existing0' },
			},
			element_source: {
				story: [
					{
						storyID: { _text: 'insert0' },
						storySlug: { _text: 'slug0' },
						storyNum: { _text: 'number0' },
					},
					{
						storyID: { _text: 'insert1' },
						storySlug: { _text: 'slug1' },
						storyNum: { _text: 'number1' },
					},
				],
			},
		})
	})
	test('sendROReplaceItems', async () => {
		const sentMessage = await testSendFunctions(async () => {
			return mosDevice.sendROReplaceItems(
				{
					RunningOrderID: mosTypes.mosString128.create('96857485'),
					StoryID: mosTypes.mosString128.create('existing0'),
					ItemID: mosTypes.mosString128.create('existing0_0'),
				},
				[
					{
						ID: mosTypes.mosString128.create('insert0'),
						Slug: mosTypes.mosString128.create('slug0'),
						ObjectID: mosTypes.mosString128.create('objid0'),
						MOSID: 'mosid0',
					},
					{
						ID: mosTypes.mosString128.create('insert1'),
						Slug: mosTypes.mosString128.create('slug1'),
						ObjectID: mosTypes.mosString128.create('objid1'),
						MOSID: 'mosid1',
					},
				]
			)
		})
		expect(sentMessage.mos.roElementAction).toMatchObject({
			_attributes: { operation: 'REPLACE' },
			roID: { _text: 96857485 },
			element_target: {
				storyID: { _text: 'existing0' },
				itemID: { _text: 'existing0_0' },
			},
			element_source: {
				item: [
					{
						itemID: { _text: 'insert0' },
						itemSlug: { _text: 'slug0' },
						objID: { _text: 'objid0' },
						mosID: { _text: 'mosid0' },
					},
					{
						itemID: { _text: 'insert1' },
						itemSlug: { _text: 'slug1' },
						objID: { _text: 'objid1' },
						mosID: { _text: 'mosid1' },
					},
				],
			},
		})
	})
	test('sendROMoveStories', async () => {
		const sentMessage = await testSendFunctions(async () => {
			return mosDevice.sendROMoveStories(
				{
					RunningOrderID: mosTypes.mosString128.create('96857485'),
					StoryID: mosTypes.mosString128.create('existing0'),
				},
				[
					mosTypes.mosString128.create('existing1'),
					mosTypes.mosString128.create('existing2'),
					mosTypes.mosString128.create('existing3'),
					mosTypes.mosString128.create('existing4'),
				]
			)
		})
		expect(sentMessage.mos.roElementAction).toMatchObject({
			_attributes: { operation: 'MOVE' },
			roID: { _text: 96857485 },
			element_target: {
				storyID: { _text: 'existing0' },
			},
			element_source: {
				storyID: [
					{ _text: 'existing1' },
					{ _text: 'existing2' },
					{ _text: 'existing3' },
					{ _text: 'existing4' },
				],
			},
		})
	})
	test('sendROMoveItems', async () => {
		const sentMessage = await testSendFunctions(async () => {
			return mosDevice.sendROMoveItems(
				{
					RunningOrderID: mosTypes.mosString128.create('96857485'),
					StoryID: mosTypes.mosString128.create('existing0'),
					ItemID: mosTypes.mosString128.create('existing0_0'),
				},
				[
					mosTypes.mosString128.create('existing0_1'),
					mosTypes.mosString128.create('existing0_2'),
					mosTypes.mosString128.create('existing0_3'),
					mosTypes.mosString128.create('existing0_4'),
				]
			)
		})
		expect(sentMessage.mos.roElementAction).toMatchObject({
			_attributes: { operation: 'MOVE' },
			roID: { _text: 96857485 },
			element_target: {
				storyID: { _text: 'existing0' },
				itemID: { _text: 'existing0_0' },
			},
			element_source: {
				itemID: [
					{ _text: 'existing0_1' },
					{ _text: 'existing0_2' },
					{ _text: 'existing0_3' },
					{ _text: 'existing0_4' },
				],
			},
		})
	})
	test('sendRODeleteStories', async () => {
		const sentMessage = await testSendFunctions(async () => {
			return mosDevice.sendRODeleteStories(
				{
					RunningOrderID: mosTypes.mosString128.create('96857485'),
				},
				[
					mosTypes.mosString128.create('existing0'),
					mosTypes.mosString128.create('existing1'),
					mosTypes.mosString128.create('existing2'),
					mosTypes.mosString128.create('existing3'),
				]
			)
		})
		expect(sentMessage.mos.roElementAction).toMatchObject({
			_attributes: { operation: 'DELETE' },
			roID: { _text: 96857485 },
			element_source: {
				storyID: [
					{ _text: 'existing0' },
					{ _text: 'existing1' },
					{ _text: 'existing2' },
					{ _text: 'existing3' },
				],
			},
		})
	})
	test('sendRODeleteItems', async () => {
		const sentMessage = await testSendFunctions(async () => {
			return mosDevice.sendRODeleteItems(
				{
					RunningOrderID: mosTypes.mosString128.create('96857485'),
					StoryID: mosTypes.mosString128.create('existing0'),
				},
				[
					mosTypes.mosString128.create('existing0_1'),
					mosTypes.mosString128.create('existing0_2'),
					mosTypes.mosString128.create('existing0_3'),
					mosTypes.mosString128.create('existing0_4'),
				]
			)
		})
		expect(sentMessage.mos.roElementAction).toMatchObject({
			_attributes: { operation: 'DELETE' },
			roID: { _text: 96857485 },
			element_target: {
				storyID: { _text: 'existing0' },
			},
			element_source: {
				itemID: [
					{ _text: 'existing0_1' },
					{ _text: 'existing0_2' },
					{ _text: 'existing0_3' },
					{ _text: 'existing0_4' },
				],
			},
		})
	})
	test('sendROSwapStories', async () => {
		const sentMessage = await testSendFunctions(async () => {
			return mosDevice.sendROSwapStories(
				{
					RunningOrderID: mosTypes.mosString128.create('96857485'),
				},
				mosTypes.mosString128.create('existing0'),
				mosTypes.mosString128.create('existing1')
			)
		})
		expect(sentMessage.mos.roElementAction).toMatchObject({
			_attributes: { operation: 'SWAP' },
			roID: { _text: 96857485 },
			element_source: {
				storyID: [{ _text: 'existing0' }, { _text: 'existing1' }],
			},
		})
	})
	test('sendROSwapItems', async () => {
		const sentMessage = await testSendFunctions(async () => {
			return mosDevice.sendROSwapItems(
				{
					RunningOrderID: mosTypes.mosString128.create('96857485'),
					StoryID: mosTypes.mosString128.create('existing0'),
				},
				mosTypes.mosString128.create('existing0_1'),
				mosTypes.mosString128.create('existing0_2')
			)
		})
		expect(sentMessage.mos.roElementAction).toMatchObject({
			_attributes: { operation: 'SWAP' },
			roID: { _text: 96857485 },
			element_target: {
				storyID: { _text: 'existing0' },
			},
			element_source: {
				itemID: [{ _text: 'existing0_1' }, { _text: 'existing0_2' }],
			},
		})
	})
})
