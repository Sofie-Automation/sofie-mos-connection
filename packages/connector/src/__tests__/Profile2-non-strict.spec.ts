import {
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
	IMOSString128,
} from '../index.js'
import { SocketMock } from '../__mocks__/socket.js'
import { ServerMock } from '../__mocks__/server.js'
import { xmlData, xmlApiData } from '../__mocks__/testData.js'
import { describe, test, expect, beforeAll, beforeEach, afterAll, vitest, MockedFunction } from 'vitest'

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
describe('Profile 2 - non strict', () => {
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
	let onCreateRunningOrder: MockedFunction<any>
	let onReplaceRunningOrder: MockedFunction<any>
	let onDeleteRunningOrder: MockedFunction<any>
	let onRequestRunningOrder: MockedFunction<any>
	let onMetadataReplace: MockedFunction<any>
	let onRunningOrderStatus: MockedFunction<any>
	let onStoryStatus: MockedFunction<any>
	let onItemStatus: MockedFunction<any>
	let onReadyToAir: MockedFunction<any>
	let onROInsertStories: MockedFunction<any>
	let onROInsertItems: MockedFunction<any>
	let onROReplaceStories: MockedFunction<any>
	let onROReplaceItems: MockedFunction<any>
	let onROMoveStories: MockedFunction<any>
	let onROMoveItems: MockedFunction<any>
	let onRODeleteStories: MockedFunction<any>
	let onRODeleteItems: MockedFunction<any>
	let onROSwapStories: MockedFunction<any>
	let onROSwapItems: MockedFunction<any>

	const mockReplyRoAck = vitest.fn((data) => {
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
		onRequestMOSObject = vitest.fn()
		onRequestAllMOSObjects = vitest.fn()
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
		onCreateRunningOrder = vitest.fn(roAckReply)
		onReplaceRunningOrder = vitest.fn(roAckReply)
		onDeleteRunningOrder = vitest.fn(roAckReply)
		onRequestRunningOrder = vitest.fn(async () => {
			return xmlApiData.roCreate
		})
		onMetadataReplace = vitest.fn(roAckReply)
		onRunningOrderStatus = vitest.fn(roAckReply)
		onStoryStatus = vitest.fn(roAckReply)
		onItemStatus = vitest.fn(roAckReply)
		onReadyToAir = vitest.fn(roAckReply)
		onROInsertStories = vitest.fn(roAckReply)
		onROInsertItems = vitest.fn(roAckReply)
		onROReplaceStories = vitest.fn(roAckReply)
		onROReplaceItems = vitest.fn(roAckReply)
		onROMoveStories = vitest.fn(roAckReply)
		onROMoveItems = vitest.fn(roAckReply)
		onRODeleteStories = vitest.fn(roAckReply)
		onRODeleteItems = vitest.fn(roAckReply)
		onROSwapStories = vitest.fn(roAckReply)
		onROSwapItems = vitest.fn(roAckReply)

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

		socketMockLower.mockClear()
		socketMockUpper.mockClear()
		serverSocketMockLower.mockClear()
		serverSocketMockUpper.mockClear()
		serverSocketMockQuery.mockClear()

		mockReplyRoAck.mockClear()
	})
	afterAll(async () => {
		await mosDevice.dispose()
		await mosConnection.dispose()
	})
	describe('deprecated messages', () => {
		// These methods are still supported, but will be removed in future versions of the mos protocol
		test('roStoryMove - missing second <storyID>', async () => {
			// Note: from documentation:
			// https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS_Protocol_Version_2.8.5_Final.htm#roStoryMove
			// **Note**: If the second <storyID> tag is blank move the story to the bottom of the Running Order.

			// Fake incoming message on socket:
			const messageId = await fakeIncomingMessage(serverSocketMockLower, xmlData.roStoryMove_offspec_missing)
			expect(onROMoveStories).toHaveBeenCalledTimes(1)
			expect(onROMoveStories.mock.calls[0][0]).toEqual(xmlApiData.roElementAction_roStoryMove_blank_action)
			expect(onROMoveStories.mock.calls[0][1]).toEqual(xmlApiData.roElementAction_roStoryMove_stories)
			expect(fixSnapshot(onROMoveStories.mock.calls)).toMatchSnapshot()
			await checkReplyToServer(serverSocketMockLower, messageId, '<roAck>')
		})
		test('roStoryMoveMultiple with single storyId', async () => {
			// Fake incoming message on socket:
			const messageId = await fakeIncomingMessage(
				serverSocketMockLower,
				xmlData.roStoryMoveMultiple_single_storyId
			)
			expect(onROMoveStories).toHaveBeenCalledTimes(1)
			expect(onROMoveStories.mock.calls[0][0]).toEqual(
				xmlApiData.roElementAction_roStoryMoveMultiple_single_storyId_offspec_action
			)
			expect(onROMoveStories.mock.calls[0][1]).toEqual(
				xmlApiData.roElementAction_roStoryMoveMultiple_single_storyId_offspec_stories
			)
			expect(fixSnapshot(onROMoveStories.mock.calls)).toMatchSnapshot()
			await checkReplyToServer(serverSocketMockLower, messageId, '<roAck>')
		})
	})
})
