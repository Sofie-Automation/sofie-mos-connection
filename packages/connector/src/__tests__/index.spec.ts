import * as MOS from '../index.js'
import { describe, test, expect } from 'vitest'

describe('Index', () => {
	test('ensure that types and enums are exposed', () => {
		const a = [
			// Check that types are exported:
			(_: MOS.IMOSItem) => null,
			(_: MOS.IMOSRunningOrder) => null,
			(_: MOS.IMOSRunningOrderBase) => null,
			(_: MOS.IMOSRunningOrderStatus) => null,
			(_: MOS.IMOSStoryStatus) => null,
			(_: MOS.IMOSItemStatus) => null,
			(_: MOS.IMOSStoryAction) => null,
			(_: MOS.IMOSROStory) => null,
			(_: MOS.IMOSItemAction) => null,
			(_: MOS.IMOSItem) => null,
			(_: MOS.IMOSROAction) => null,
			(_: MOS.IMOSROReadyToAir) => null,
			(_: MOS.IMOSROFullStory) => null,
			// @ts-expect-error types test
			(_: MOS.ThisDoesNotExist) => null,
		]
		expect(a.length).toBeGreaterThan(0)

		expect(typeof MOS.getMosTypes).toBe('function')

		expect(MOS.IMOSObjectStatus).toBeTruthy()

		expect(MOS.IMOSScope).toBeTruthy()
		expect(MOS.IMOSScope.PLAYLIST).toBeTruthy()
	})
	test('ensure that helpers are exposed', () => {
		expect(MOS.Utils).toBeTruthy() // For backwards compatibility
		expect(typeof MOS.Utils.xml2js).toBe('function') // For backwards compatibility
		expect(MOS.MosModel.XMLMosItem.fromXML).toBeTruthy() // For backwards compatibility
		expect(MOS.MosModel.XMLMosItem.toXML).toBeTruthy() // For backwards compatibility
	})
	test('ensure that types are backwards compatible', () => {
		const a = (mosDevice: MOS.MosDevice, getMosRoAck: () => MOS.IMOSROAck) => {
			mosDevice.onCreateRunningOrder(async (_ro: MOS.IMOSRunningOrder) => {
				return getMosRoAck()
			})
			mosDevice.onReplaceRunningOrder(async (_ro: MOS.IMOSRunningOrder) => {
				return getMosRoAck()
			})
			mosDevice.onDeleteRunningOrder(async (_runningOrderId: MOS.IMOSString128) => {
				return getMosRoAck()
			})
			mosDevice.onMetadataReplace(async (_ro: MOS.IMOSRunningOrderBase) => {
				return getMosRoAck()
			})
			mosDevice.onRunningOrderStatus(async (_status: MOS.IMOSRunningOrderStatus) => {
				return getMosRoAck()
			})
			mosDevice.onStoryStatus(async (_status: MOS.IMOSStoryStatus) => {
				return getMosRoAck()
			})
			mosDevice.onItemStatus(async (_status: MOS.IMOSItemStatus) => {
				return getMosRoAck()
			})
			mosDevice.onROInsertStories(async (_Action: MOS.IMOSStoryAction, _Stories: Array<MOS.IMOSROStory>) => {
				return getMosRoAck()
			})
			mosDevice.onROInsertItems(async (_Action: MOS.IMOSItemAction, _Items: Array<MOS.IMOSItem>) => {
				return getMosRoAck()
			})
			mosDevice.onROReplaceStories(async (_Action: MOS.IMOSStoryAction, _Stories: Array<MOS.IMOSROStory>) => {
				return getMosRoAck()
			})
			mosDevice.onROReplaceItems(async (_Action: MOS.IMOSItemAction, _Items: Array<MOS.IMOSItem>) => {
				return getMosRoAck()
			})
			mosDevice.onROMoveStories(async (_Action: MOS.IMOSStoryAction, _Stories: Array<MOS.IMOSString128>) => {
				return getMosRoAck()
			})
			mosDevice.onROMoveItems(async (_Action: MOS.IMOSItemAction, _Items: Array<MOS.IMOSString128>) => {
				return getMosRoAck()
			})
			mosDevice.onRODeleteStories(async (_Action: MOS.IMOSROAction, _Stories: Array<MOS.IMOSString128>) => {
				return getMosRoAck()
			})
			mosDevice.onRODeleteItems(async (_Action: MOS.IMOSStoryAction, _Items: Array<MOS.IMOSString128>) => {
				return getMosRoAck()
			})
			mosDevice.onROSwapStories(
				async (_Action: MOS.IMOSROAction, _StoryID0: MOS.IMOSString128, _StoryID1: MOS.IMOSString128) => {
					return getMosRoAck()
				}
			)
			mosDevice.onROSwapItems(
				async (_Action: MOS.IMOSStoryAction, _ItemID0: MOS.IMOSString128, _ItemID1: MOS.IMOSString128) => {
					return getMosRoAck()
				}
			)
			mosDevice.onReadyToAir(async (_Action: MOS.IMOSROReadyToAir) => {
				return getMosRoAck()
			})
			mosDevice.onRunningOrderStory(async (_story: MOS.IMOSROFullStory) => {
				return getMosRoAck()
			})
		}
		expect(a).toBeTruthy()
	})
})
