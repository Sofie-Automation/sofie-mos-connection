/* eslint-disable @typescript-eslint/promise-function-async */
// Note: All imports in this file should come from "../" ie index.ts'
// To ensure that all types used are exported properly
import {
	MosConnection,
	MosDevice,
	IConnectionConfig,
	IMOSConnectionStatus,
	IMOSDeviceConnectionOptions,
} from '../index.js'
import {
	IMOSListMachInfo,
	IMOSAck,
	MosItemReplaceOptions,
	IProfiles,
	IMOSObject,
	IMOSItem,
	IMOSItemAction,
	IMOSItemStatus,
	IMOSObjectList,
	IMOSRequestObjectList,
	IMOSROAck,
	IMOSROAction,
	IMOSROFullStory,
	IMOSROReadyToAir,
	IMOSROStory,
	IMOSRunningOrder,
	IMOSRunningOrderBase,
	IMOSRunningOrderStatus,
	IMOSListSearchableSchema,
	IMOSStoryAction,
	IMOSStoryStatus,
	IMOSString128,
} from '@mos-connection/model'
import { test, expect } from 'vitest'

test('api & exports', () => {
	// Note: This test doesn't test anything during runtime, but it touches types instead.

	function justTestTypings() {
		let f: any = null

		// MosConnection
		f = function (options: IConnectionConfig) {
			const mosConnection = new MosConnection(options)

			f = function (): Promise<boolean> {
				return mosConnection.init()
			}
			f = function (connectionOptions: IMOSDeviceConnectionOptions): Promise<MosDevice> {
				return mosConnection.connect(connectionOptions)
			}
			f = function (cb: (mosDevice: MosDevice) => void): void {
				return mosConnection.onConnection(cb)
			}
			f = function (): boolean {
				return mosConnection.isListening
			}
			f = function (): boolean {
				return mosConnection.isCompliant
			}
			f = function (): boolean {
				return mosConnection.acceptsConnections
			}
			f = function (): IProfiles {
				return mosConnection.profiles
			}
			f = function (): Promise<void> {
				return mosConnection.dispose()
			}
			f = function (id: string): MosDevice {
				return mosConnection.getDevice(id)
			}
			f = function (): MosDevice[] {
				return mosConnection.getDevices()
			}
			f = function (mosDevice: MosDevice): Promise<void> {
				return mosConnection.disposeMosDevice(mosDevice)
			}
			f = function (myMosID: string, theirMosId0: string, theirMosId1: string | null): Promise<void> {
				return mosConnection.disposeMosDevice(myMosID, theirMosId0, theirMosId1)
			}
			f = function (): string {
				return mosConnection.complianceText
			}
			f = function (debug: boolean): void {
				return mosConnection.setDebug(debug)
			}
		}
		// MosDevice

		// consumer won't have to construct the mosDevice, it is returned from mosConnection.connect()
		f = function (mosDevice: MosDevice) {
			f = function (): string {
				return mosDevice.idPrimary
			}
			f = function (): string | null {
				return mosDevice.idSecondary
			}
			/* Profile 0 */
			f = function (): Promise<IMOSListMachInfo> {
				return mosDevice.requestMachineInfo()
			}
			f = function (cb: () => Promise<IMOSListMachInfo>): void {
				return mosDevice.onRequestMachineInfo(cb)
			}
			f = function (cb: (connectionStatus: IMOSConnectionStatus) => void): void {
				return mosDevice.onConnectionChange(cb)
			}
			f = function (): IMOSConnectionStatus {
				return mosDevice.getConnectionStatus()
			}

			/* Profile 1 */
			f = function (obj: IMOSObject): Promise<IMOSAck> {
				return mosDevice.sendMOSObject(obj)
			}
			f = function (cb: (objId: string) => Promise<IMOSObject | null>): void {
				return mosDevice.onRequestMOSObject(cb)
			}
			f = function (objId: IMOSString128): Promise<IMOSObject> {
				return mosDevice.sendRequestMOSObject(objId)
			}
			f = function (cb: () => Promise<Array<IMOSObject>>): void {
				return mosDevice.onRequestAllMOSObjects(cb)
			}
			f = function (cb: (objs: IMOSObject[]) => Promise<IMOSAck>): void {
				return mosDevice.onMOSObjects(cb)
			}
			f = function (): Promise<IMOSAck> {
				return mosDevice.sendRequestAllMOSObjects()
			}

			/* Profile 2 */
			f = function (cb: (ro: IMOSRunningOrder) => Promise<IMOSROAck>): void {
				return mosDevice.onCreateRunningOrder(cb)
			}
			f = function (ro: IMOSRunningOrder): Promise<IMOSROAck> {
				return mosDevice.sendCreateRunningOrder(ro)
			}
			f = function (cb: (ro: IMOSRunningOrder) => Promise<IMOSROAck>): void {
				return mosDevice.onReplaceRunningOrder(cb)
			}
			f = function (ro: IMOSRunningOrder): Promise<IMOSROAck> {
				return mosDevice.sendReplaceRunningOrder(ro)
			}
			f = function (cb: (runningOrderId: IMOSString128) => Promise<IMOSROAck>): void {
				return mosDevice.onDeleteRunningOrder(cb)
			}
			f = function (runningOrderId: IMOSString128): Promise<IMOSROAck> {
				return mosDevice.sendDeleteRunningOrder(runningOrderId)
			}
			f = function (cb: (runningOrderId: IMOSString128) => Promise<IMOSRunningOrder | null>): void {
				return mosDevice.onRequestRunningOrder(cb)
			}
			f = function (runningOrderId: IMOSString128): Promise<IMOSRunningOrder | null> {
				return mosDevice.sendRequestRunningOrder(runningOrderId)
			}
			// f = function (runningOrderId: IMOSString128): Promise<IMOSRunningOrder | null> { return mosDevice.getRunningOrder(runningOrderId) }
			f = function (cb: (metadata: IMOSRunningOrderBase) => Promise<IMOSROAck>): void {
				return mosDevice.onMetadataReplace(cb)
			}
			f = function (metadata: IMOSRunningOrderBase): Promise<IMOSROAck> {
				return mosDevice.sendMetadataReplace(metadata)
			}
			f = function (cb: (status: IMOSRunningOrderStatus) => Promise<IMOSROAck>): void {
				return mosDevice.onRunningOrderStatus(cb)
			}
			f = function (cb: (status: IMOSStoryStatus) => Promise<IMOSROAck>): void {
				return mosDevice.onStoryStatus(cb)
			}
			f = function (cb: (status: IMOSItemStatus) => Promise<IMOSROAck>): void {
				return mosDevice.onItemStatus(cb)
			}
			f = function (status: IMOSRunningOrderStatus): Promise<IMOSROAck> {
				return mosDevice.sendRunningOrderStatus(status)
			}
			f = function (status: IMOSStoryStatus): Promise<IMOSROAck> {
				return mosDevice.sendStoryStatus(status)
			}
			f = function (status: IMOSItemStatus): Promise<IMOSROAck> {
				return mosDevice.sendItemStatus(status)
			}
			f = function (cb: (Action: IMOSROReadyToAir) => Promise<IMOSROAck>): void {
				return mosDevice.onReadyToAir(cb)
			}
			f = function (cb: (Action: IMOSStoryAction, Stories: Array<IMOSROStory>) => Promise<IMOSROAck>): void {
				return mosDevice.onROInsertStories(cb)
			}
			f = function (Action: IMOSStoryAction, Stories: Array<IMOSROStory>): Promise<IMOSROAck> {
				return mosDevice.sendROInsertStories(Action, Stories)
			}
			f = function (cb: (Action: IMOSItemAction, Items: Array<IMOSItem>) => Promise<IMOSROAck>): void {
				return mosDevice.onROInsertItems(cb)
			}
			f = function (Action: IMOSItemAction, Items: Array<IMOSItem>): Promise<IMOSROAck> {
				return mosDevice.sendROInsertItems(Action, Items)
			}
			f = function (cb: (Action: IMOSStoryAction, Stories: Array<IMOSROStory>) => Promise<IMOSROAck>): void {
				return mosDevice.onROReplaceStories(cb)
			}
			f = function (Action: IMOSStoryAction, Stories: Array<IMOSROStory>): Promise<IMOSROAck> {
				return mosDevice.sendROReplaceStories(Action, Stories)
			}
			f = function (cb: (Action: IMOSItemAction, Items: Array<IMOSItem>) => Promise<IMOSROAck>): void {
				return mosDevice.onROReplaceItems(cb)
			}
			f = function (Action: IMOSItemAction, Items: Array<IMOSItem>): Promise<IMOSROAck> {
				return mosDevice.sendROReplaceItems(Action, Items)
			}
			f = function (cb: (Action: IMOSStoryAction, Stories: Array<IMOSString128>) => Promise<IMOSROAck>): void {
				return mosDevice.onROMoveStories(cb)
			}
			f = function (Action: IMOSStoryAction, Stories: Array<IMOSString128>): Promise<IMOSROAck> {
				return mosDevice.sendROMoveStories(Action, Stories)
			}
			f = function (cb: (Action: IMOSItemAction, Items: Array<IMOSString128>) => Promise<IMOSROAck>): void {
				return mosDevice.onROMoveItems(cb)
			}
			f = function (Action: IMOSItemAction, Items: Array<IMOSString128>): Promise<IMOSROAck> {
				return mosDevice.sendROMoveItems(Action, Items)
			}
			f = function (cb: (Action: IMOSROAction, Stories: Array<IMOSString128>) => Promise<IMOSROAck>): void {
				return mosDevice.onRODeleteStories(cb)
			}
			f = function (Action: IMOSROAction, Stories: Array<IMOSString128>): Promise<IMOSROAck> {
				return mosDevice.sendRODeleteStories(Action, Stories)
			}
			f = function (cb: (Action: IMOSStoryAction, Items: Array<IMOSString128>) => Promise<IMOSROAck>): void {
				return mosDevice.onRODeleteItems(cb)
			}
			f = function (Action: IMOSStoryAction, Items: Array<IMOSString128>): Promise<IMOSROAck> {
				return mosDevice.sendRODeleteItems(Action, Items)
			}
			f = function (
				cb: (Action: IMOSROAction, StoryID0: IMOSString128, StoryID1: IMOSString128) => Promise<IMOSROAck>
			): void {
				return mosDevice.onROSwapStories(cb)
			}
			f = function (Action: IMOSROAction, StoryID0: IMOSString128, StoryID1: IMOSString128): Promise<IMOSROAck> {
				return mosDevice.sendROSwapStories(Action, StoryID0, StoryID1)
			}
			f = function (
				cb: (Action: IMOSStoryAction, ItemID0: IMOSString128, ItemID1: IMOSString128) => Promise<IMOSROAck>
			): void {
				return mosDevice.onROSwapItems(cb)
			}
			f = function (Action: IMOSStoryAction, ItemID0: IMOSString128, ItemID1: IMOSString128): Promise<IMOSROAck> {
				return mosDevice.sendROSwapItems(Action, ItemID0, ItemID1)
			}

			/* Profile 3 */
			f = function (cb: (object: IMOSObject) => Promise<IMOSAck>): void {
				return mosDevice.onObjectCreate(cb)
			}
			f = function (object: IMOSObject): Promise<IMOSAck> {
				return mosDevice.sendObjectCreate(object)
			}
			f = function (
				cb: (roID: IMOSString128, storyID: IMOSString128, item: IMOSItem) => Promise<IMOSROAck>
			): void {
				return mosDevice.onItemReplace(cb)
			}
			f = function (options: MosItemReplaceOptions): Promise<IMOSROAck> {
				return mosDevice.sendItemReplace(options)
			}
			f = function (cb: (username: string) => Promise<IMOSListSearchableSchema>): void {
				return mosDevice.onRequestSearchableSchema(cb)
			}
			f = function (username: string): Promise<IMOSListSearchableSchema> {
				return mosDevice.sendRequestSearchableSchema(username)
			}
			f = function (cb: (objList: IMOSRequestObjectList) => Promise<IMOSObjectList>): void {
				return mosDevice.onRequestObjectList(cb)
			}
			f = function (reqObjList: IMOSRequestObjectList): Promise<IMOSObjectList> {
				return mosDevice.sendRequestObjectList(reqObjList)
			}
			f = function (cb: (obj: IMOSObject) => Promise<IMOSAck>): void {
				return mosDevice.onRequestObjectActionNew(cb)
			}
			f = function (cb: (objId: IMOSString128, obj: IMOSObject) => Promise<IMOSAck>): void {
				return mosDevice.onRequestObjectActionUpdate(cb)
			}
			f = function (cb: (objId: IMOSString128) => Promise<IMOSAck>): void {
				return mosDevice.onRequestObjectActionDelete(cb)
			}

			/* Profile 4 */
			f = function (cb: () => Promise<IMOSRunningOrder[]>): void {
				return mosDevice.onRequestAllRunningOrders(cb)
			}
			f = function (): Promise<Array<IMOSRunningOrderBase>> {
				return mosDevice.sendRequestAllRunningOrders()
			}
			f = function (cb: (story: IMOSROFullStory) => Promise<IMOSROAck>): void {
				return mosDevice.onRunningOrderStory(cb)
			}
			f = function (story: IMOSROFullStory): Promise<IMOSROAck> {
				return mosDevice.sendRunningOrderStory(story)
			}
		}

		expect(f).toBeTruthy()
	}

	expect(typeof justTestTypings).toBe('function')
})
