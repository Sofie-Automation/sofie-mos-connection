import {
	IProfiles,
	IMOSListMachInfo,
	IMOSObject,
	MosItemReplaceOptions,
	IMOSListSearchableSchema,
	IMOSRequestObjectList,
	IMOSObjectList,
	IMOSAck,
	IMOSRunningOrder,
	IMOSItem,
	IMOSItemAction,
	IMOSItemStatus,
	IMOSROAck,
	IMOSROAction,
	IMOSROFullStory,
	IMOSROReadyToAir,
	IMOSROStory,
	IMOSRunningOrderBase,
	IMOSRunningOrderStatus,
	IMOSStoryAction,
	IMOSStoryStatus,
	IMOSString128,
} from '@mos-connection/model'
import { MosDevice } from './MosDevice.js'

/*
	This file defines the API for the MOS-connection.
	Most of these interfaces are derived from the MOS protocol.
	https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm
*/
export interface IMosConnection {
	readonly isListening: boolean

	readonly acceptsConnections: boolean
	readonly profiles: IProfiles
	readonly isCompliant: boolean
	readonly complianceText: string

	dispose: () => Promise<void>
	/*  */
	connect: (connectionOptions: IMOSDeviceConnectionOptions) => Promise<MosDevice> // resolved when connection has been made (before .onConnection is fired)
	onConnection: (cb: (mosDevice: MosDevice) => void) => void

	on(event: 'error', listener: (error: Error) => void): this
	on(event: 'warning', listener: (message: string) => void): this
	on(event: 'info', listener: (message: string, data?: any) => void): this
	on(event: 'rawMessage', listener: (source: string, type: string, message: string) => void): this
}

export interface IMOSDevice
	extends IMOSDeviceProfile0,
		IMOSDeviceProfile1,
		IMOSDeviceProfile2,
		IMOSDeviceProfile3,
		IMOSDeviceProfile4 {
	idPrimary: string // unique id for this device and session
	idSecondary: string | null // unique id for this device and session (buddy)
}
/**
 * Method definitions for Profile 1
 * see https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#Profile1
 */
export interface IMOSDeviceProfile0 {
	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * The reqMachInfo message is a method for an NCS or MOS to determine more information about its counterpart.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#reqMachInfo
	 */
	requestMachineInfo: () => Promise<IMOSListMachInfo>
	/**
	 * Send message (as NCS) to a MOS device:
	 * The reqMachInfo message is a method for an NCS or MOS to determine more information about its counterpart.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#reqMachInfo
	 */
	onRequestMachineInfo: (cb: () => Promise<IMOSListMachInfo>) => void

	/** Assign callback for when the connection status changes. */
	onConnectionChange: (cb: (connectionStatus: IMOSConnectionStatus) => void) => void
	/** Get the current connection status */
	getConnectionStatus: () => IMOSConnectionStatus

	// Deprecated methods:
	/** @deprecated getMachineInfo is deprecated, use requestMachineInfo instead */
	getMachineInfo: () => Promise<IMOSListMachInfo>
	/** @deprecated onGetMachineInfo is deprecated, use onRequestMachineInfo instead */
	onGetMachineInfo: (cb: () => Promise<IMOSListMachInfo>) => void
}
/**
 * Method definitions for Profile 1
 * see https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#Profile1
 */
export interface IMOSDeviceProfile1 {
	/**
	 * Contains information that describes a unique MOS Object to the NCS.
	 * The NCS uses this information to search for and reference the MOS Object.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#mosObj
	 */
	sendMOSObject(obj: IMOSObject): Promise<IMOSAck>

	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * Message used by the NCS to request the description of an object.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#mosReqObj
	 */
	onRequestMOSObject: (cb: (objId: string) => Promise<IMOSObject | null>) => void
	/**
	 * Send message (as NCS) to a MOS device:
	 * Message used by the NCS to request the description of an object.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#mosReqObj
	 */
	sendRequestMOSObject: (objId: IMOSString128) => Promise<IMOSObject>

	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * Contains information that describes a unique MOS Object to the NCS.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#mosObj
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#mosListAll
	 */
	onMOSObjects: (cb: (objs: IMOSObject[]) => Promise<IMOSAck>) => void

	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * Method for the NCS to request the MOS to send it a mosObj message for every Object in the MOS.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#mosReqAll
	 */
	onRequestAllMOSObjects: (cb: () => Promise<Array<IMOSObject>>) => void
	/**
	 * Method for the NCS to request the MOS to send it a mosObj message for every Object in the MOS.
	 * The replies will be sent to the callback set up in onMOSObjects()
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#mosReqAll
	 */
	sendRequestAllMOSObjects: (
		/**
		 * Pause, when greater than zero, indicates the number of seconds to pause between individual mosObj messages.
		 * Pause of zero indicates that all objects will be sent using the mosListAll message.
		 * @default 0
		 */
		pause?: number
	) => Promise<IMOSAck>

	// Deprecated methods:
	/** @deprecated getMOSObject is deprecated, use sendRequestMOSObject instead */
	getMOSObject: (objId: IMOSString128) => Promise<IMOSObject>
	/** @deprecated getAllMOSObjects is deprecated, use sendRequestAllMOSObjects instead */
	getAllMOSObjects: () => Promise<IMOSAck>
}
/**
 * Method definitions for Profile 2
 * see https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#Profile2
 */
export interface IMOSDeviceProfile2 {
	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * Message received from the NCS to the MOS that defines a new Running Order.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roCreate
	 */
	onCreateRunningOrder: (cb: (ro: IMOSRunningOrder) => Promise<IMOSROAck>) => void
	/**
	 * Send message (as NCS) to a MOS device:
	 * Message from the NCS to the MOS that defines a new Running Order.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roCreate
	 */
	sendCreateRunningOrder: (ro: IMOSRunningOrder) => Promise<IMOSROAck>

	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * Message received from the NCS to the MOS that defines a new Running Order, replacing an existing one.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roReplace
	 */
	onReplaceRunningOrder: (cb: (ro: IMOSRunningOrder) => Promise<IMOSROAck>) => void
	/**
	 * Send message (as NCS) to a MOS device:
	 * Message received from the NCS to the MOS that defines a new Running Order, replacing an existing one.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roReplace
	 */
	sendReplaceRunningOrder: (ro: IMOSRunningOrder) => Promise<IMOSROAck>

	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * Deletes a Running order in the MOS.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roDelete
	 */
	onDeleteRunningOrder: (cb: (runningOrderId: IMOSString128) => Promise<IMOSROAck>) => void
	/**
	 * Send message (as NCS) to a MOS device:
	 * Deletes a Running order in the MOS.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roDelete
	 */
	sendDeleteRunningOrder: (runningOrderId: IMOSString128) => Promise<IMOSROAck>

	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * Request for a complete build of a Running Order Playlist. NOTE:  This message can be used by either NCS or MOS.
	 * A MOS can use this to "resync" its Playlist with the NCS Running Order or to obtain a full description of the Playlist at any time.
	 * An NCS can use this as a diagnostic tool to check the order of the Playlist constructed in the MOS versus the sequence of Items in the Running Order.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roReq
	 * Response: https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roList
	 */
	onRequestRunningOrder: (cb: (runningOrderId: IMOSString128) => Promise<IMOSRunningOrder | null>) => void
	/**
	 * Send message (as NCS) to a MOS device:
	 * Request for a complete build of a Running Order Playlist. NOTE:  This message can be used by either NCS or MOS.
	 * A MOS can use this to "resync" its Playlist with the NCS Running Order or to obtain a full description of the Playlist at any time.
	 * An NCS can use this as a diagnostic tool to check the order of the Playlist constructed in the MOS versus the sequence of Items in the Running Order.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roReq
	 * Response: https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roList
	 */
	sendRequestRunningOrder: (runningOrderId: IMOSString128) => Promise<IMOSRunningOrder | null>

	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * The roMetadataReplace message allows metadata associated with a running order to be replaced without deleting the running order and sending the entire running order again.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roMetadataReplace
	 */
	onMetadataReplace: (cb: (metadata: IMOSRunningOrderBase) => Promise<IMOSROAck>) => void
	/**
	 * Send message (as NCS) to a MOS device:
	 * The roMetadataReplace message allows metadata associated with a running order to be replaced without deleting the running order and sending the entire running order again.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roMetadataReplace
	 */
	sendMetadataReplace: (metadata: IMOSRunningOrderBase) => Promise<IMOSROAck>

	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * A method for the MOS to update the NCS on the status of a RO. This allows the NCS to reflect the status of any element in the MOS Running Order in the NCS Running Order display.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#_3.7.2_roElementStat_-
	 */
	onRunningOrderStatus: (cb: (status: IMOSRunningOrderStatus) => Promise<IMOSROAck>) => void // get roElementStat
	/**
	 * Send message (as NCS) to a MOS device:
	 * A method for the MOS to update the NCS on the status of a RO. This allows the NCS to reflect the status of any element in the MOS Running Order in the NCS Running Order display.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#_3.7.2_roElementStat_-
	 */
	sendRunningOrderStatus: (status: IMOSRunningOrderStatus) => Promise<IMOSROAck> // send roElementStat

	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * A method for the MOS to update the NCS on the status of a STORY. This allows the NCS to reflect the status of any element in the MOS Running Order in the NCS Running Order display.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#_3.7.2_roElementStat_-
	 */
	onStoryStatus: (cb: (status: IMOSStoryStatus) => Promise<IMOSROAck>) => void // get roElementStat
	/**
	 * Send message (as NCS) to a MOS device:
	 * A method for the MOS to update the NCS on the status of a STORY. This allows the NCS to reflect the status of any element in the MOS Running Order in the NCS Running Order display.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#_3.7.2_roElementStat_-
	 */
	sendStoryStatus: (status: IMOSStoryStatus) => Promise<IMOSROAck> // send roElementStat

	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * A method for the MOS to update the NCS on the status of an ITEM. This allows the NCS to reflect the status of any element in the MOS Running Order in the NCS Running Order display.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#_3.7.2_roElementStat_-
	 */
	onItemStatus: (cb: (status: IMOSItemStatus) => Promise<IMOSROAck>) => void // get roElementStat
	/**
	 * Send message (as NCS) to a MOS device:
	 * A method for the MOS to update the NCS on the status of an ITEM. This allows the NCS to reflect the status of any element in the MOS Running Order in the NCS Running Order display.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#_3.7.2_roElementStat_-
	 */
	sendItemStatus: (status: IMOSItemStatus) => Promise<IMOSROAck> // send roElementStat

	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * The roReadyToAir message allows the NCS to signal the MOS that a Running Order has been editorially approved ready for air.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roReadyToAir
	 */
	onReadyToAir: (cb: (Action: IMOSROReadyToAir) => Promise<IMOSROAck>) => void
	/**
	 * Send message (as NCS) to a MOS device:
	 * The roReadyToAir message allows the NCS to signal the MOS that a Running Order has been editorially approved ready for air.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roReadyToAir
	 */
	sendReadyToAir: (Action: IMOSROReadyToAir) => Promise<IMOSROAck>

	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * Insert one or more story into a Running Order
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roElementAction
	 */
	onROInsertStories: (cb: (Action: IMOSStoryAction, Stories: Array<IMOSROStory>) => Promise<IMOSROAck>) => void
	/**
	 * Send message (as NCS) to a MOS device:
	 * Insert one or more story into a Running Order
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roElementAction
	 */
	sendROInsertStories: (Action: IMOSStoryAction, Stories: Array<IMOSROStory>) => Promise<IMOSROAck>

	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * Insert one or more Items into a Story
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roElementAction
	 */
	onROInsertItems: (cb: (Action: IMOSItemAction, Items: Array<IMOSItem>) => Promise<IMOSROAck>) => void
	/**
	 * Send message (as NCS) to a MOS device:
	 * Insert one or more Items into a Story
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roElementAction
	 */
	sendROInsertItems: (Action: IMOSItemAction, Items: Array<IMOSItem>) => Promise<IMOSROAck>

	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * Replace (update) a Story with a new story.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roElementAction
	 */
	onROReplaceStories: (cb: (Action: IMOSStoryAction, Stories: Array<IMOSROStory>) => Promise<IMOSROAck>) => void
	/**
	 * Send message (as NCS) to a MOS device:
	 * Replace (update) a Story with a new story.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roElementAction
	 */
	sendROReplaceStories: (Action: IMOSStoryAction, Stories: Array<IMOSROStory>) => Promise<IMOSROAck>

	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * Replace (update) an Item with a new Item.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roElementAction
	 */
	onROReplaceItems: (cb: (Action: IMOSItemAction, Items: Array<IMOSItem>) => Promise<IMOSROAck>) => void
	/**
	 * Send message (as NCS) to a MOS device:
	 * Replace (update) an Item with a new Item.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roElementAction
	 */
	sendROReplaceItems: (Action: IMOSItemAction, Items: Array<IMOSItem>) => Promise<IMOSROAck>

	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * Move one or more Stories within a Running Order
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roElementAction
	 */
	onROMoveStories: (cb: (Action: IMOSStoryAction, Stories: Array<IMOSString128>) => Promise<IMOSROAck>) => void
	/**
	 * Send message (as NCS) to a MOS device:
	 * Move one or more Stories within a Running Order
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roElementAction
	 */
	sendROMoveStories: (Action: IMOSStoryAction, Stories: Array<IMOSString128>) => Promise<IMOSROAck>

	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * Move one or more Items within a Story
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roElementAction
	 */
	onROMoveItems: (cb: (Action: IMOSItemAction, Items: Array<IMOSString128>) => Promise<IMOSROAck>) => void
	/**
	 * Send message (as NCS) to a MOS device:
	 * Move one or more Items within a Story
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roElementAction
	 */
	sendROMoveItems: (Action: IMOSItemAction, Items: Array<IMOSString128>) => Promise<IMOSROAck>

	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * Delete one or more Stories within a Running Order
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roElementAction
	 */
	onRODeleteStories: (cb: (Action: IMOSROAction, Stories: Array<IMOSString128>) => Promise<IMOSROAck>) => void
	/**
	 * Send message (as NCS) to a MOS device:
	 * Delete one or more Stories within a Running Order
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roElementAction
	 */
	sendRODeleteStories: (Action: IMOSROAction, Stories: Array<IMOSString128>) => Promise<IMOSROAck>

	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * Delete one or more Items within a Story
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roElementAction
	 */
	onRODeleteItems: (cb: (Action: IMOSStoryAction, Items: Array<IMOSString128>) => Promise<IMOSROAck>) => void
	/**
	 * Send message (as NCS) to a MOS device:
	 * Delete one or more Items within a Story
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roElementAction
	 */
	sendRODeleteItems: (Action: IMOSStoryAction, Items: Array<IMOSString128>) => Promise<IMOSROAck>

	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * Swap two Stories
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roElementAction
	 */
	onROSwapStories: (
		cb: (Action: IMOSROAction, StoryID0: IMOSString128, StoryID1: IMOSString128) => Promise<IMOSROAck>
	) => void
	/**
	 * Send message (as NCS) to a MOS device:
	 * Swap two Stories
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roElementAction
	 */
	sendROSwapStories: (Action: IMOSROAction, StoryID0: IMOSString128, StoryID1: IMOSString128) => Promise<IMOSROAck>

	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * Swap two Items
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roElementAction
	 */
	onROSwapItems: (
		cb: (Action: IMOSStoryAction, ItemID0: IMOSString128, ItemID1: IMOSString128) => Promise<IMOSROAck>
	) => void
	/**
	 * Send message (as NCS) to a MOS device:
	 * Swap two Items
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roElementAction
	 */
	sendROSwapItems: (Action: IMOSStoryAction, ItemID0: IMOSString128, ItemID1: IMOSString128) => Promise<IMOSROAck>

	// Deprecated methods:
	/** @deprecated getRunningOrder is deprecated, use sendRequestRunningOrder instead */
	getRunningOrder: (runningOrderId: IMOSString128) => Promise<IMOSRunningOrder | null>
	/** @deprecated setRunningOrderStatus is deprecated, use sendRunningOrderStatus instead */
	setRunningOrderStatus: (status: IMOSRunningOrderStatus) => Promise<IMOSROAck>
	/** @deprecated setStoryStatus is deprecated, use sendStoryStatus instead */
	setStoryStatus: (status: IMOSStoryStatus) => Promise<IMOSROAck>
	/** @deprecated setItemStatus is deprecated, use sendItemStatus instead */
	setItemStatus: (status: IMOSItemStatus) => Promise<IMOSROAck>
}
/**
 * Method definitions for Profile 3
 * see https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#Profile3
 */
export interface IMOSDeviceProfile3 {
	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * mosObjCreate allows an NCS to request the Media Object Server to create a Media Object with specific metadata associated with it.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#mosObjCreate
	 */
	onObjectCreate: (cb: (object: IMOSObject) => Promise<IMOSAck>) => void
	/**
	 * Send message (as NCS) to a MOS device:
	 * mosObjCreate allows an NCS to request the Media Object Server to create a Media Object with specific metadata associated with it.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#mosObjCreate
	 */
	sendObjectCreate: (object: IMOSObject) => Promise<IMOSAck>

	/**
	 * Assign callback (as a NCS device) for when receiving message from MOS:
	 * This message allows a Media Object Server to replace an Item Reference in a Story with new metadata values and/or additional tags.
	 * The Story must be in a MOS Active PlayList.
	 * This message is initiated by the Media Object Server, rather than the NCS.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#mosItemReplace
	 */
	onItemReplace: (cb: (roID: IMOSString128, storyID: IMOSString128, item: IMOSItem) => Promise<IMOSROAck>) => void
	/**
	 * Send message (as MOS) to a NCS:
	 * This message allows a Media Object Server to replace an Item Reference in a Story with new metadata values and/or additional tags.
	 * The Story must be in a MOS Active PlayList.
	 * This message is initiated by the Media Object Server, rather than the NCS.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#mosItemReplace
	 */
	sendItemReplace: (options: MosItemReplaceOptions) => Promise<IMOSROAck>

	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * mosReqSearchable Schema is a mechanism used by the NCS to request the MOS to send a pointer to a schema in which searchable fields are defined by the MOS device.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#mosReqSearchableSchema
	 */
	onRequestSearchableSchema: (cb: (username: string) => Promise<IMOSListSearchableSchema>) => void
	/**
	 * Send message (as NCS) to a MOS device:
	 * mosReqSearchable Schema is a mechanism used by the NCS to request the MOS to send a pointer to a schema in which searchable fields are defined by the MOS device.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#mosReqSearchableSchema
	 */
	sendRequestSearchableSchema: (username: string) => Promise<IMOSListSearchableSchema>

	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * mosReqObjList is a mechanism used by a NCS to retrieve only selected object descriptions from a MOS.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#mosReqObjList
	 */
	onRequestObjectList: (cb: (objList: IMOSRequestObjectList) => Promise<IMOSObjectList>) => void
	/**
	 * Send message (as NCS) to a MOS device:
	 * mosReqObjList is a mechanism used by a NCS to retrieve only selected object descriptions from a MOS.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#mosReqObjList
	 */
	sendRequestObjectList: (reqObjList: IMOSRequestObjectList) => Promise<IMOSObjectList>

	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * mosReqObjAction allows an NCS to request the Media Object Server to create, modify or delete a media object.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#_3.3.3_mosReqObjAction_%E2%80%93_NCS_request
	 */
	onRequestObjectActionNew: (cb: (obj: IMOSObject) => Promise<IMOSAck>) => void
	/**
	 * Send message (as NCS) to a MOS device:
	 * mosReqObjAction allows an NCS to request the Media Object Server to create, modify or delete a media object.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#_3.3.3_mosReqObjAction_%E2%80%93_NCS_request
	 */
	sendRequestObjectActionNew: (obj: IMOSObject) => Promise<IMOSAck>

	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * mosReqObjAction allows an NCS to request the Media Object Server to create, modify or delete a media object.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#_3.3.3_mosReqObjAction_%E2%80%93_NCS_request
	 */
	onRequestObjectActionUpdate: (cb: (objId: IMOSString128, obj: IMOSObject) => Promise<IMOSAck>) => void
	/**
	 * Send message (as NCS) to a MOS device:
	 * mosReqObjAction allows an NCS to request the Media Object Server to create, modify or delete a media object.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#_3.3.3_mosReqObjAction_%E2%80%93_NCS_request
	 */
	sendRequestObjectActionUpdate: (objId: IMOSString128, obj: IMOSObject) => Promise<IMOSAck>

	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * mosReqObjAction allows an NCS to request the Media Object Server to create, modify or delete a media object.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#_3.3.3_mosReqObjAction_%E2%80%93_NCS_request
	 */
	onRequestObjectActionDelete: (cb: (objId: IMOSString128) => Promise<IMOSAck>) => void
	/**
	 * Send message (as NCS) to a MOS device:
	 * mosReqObjAction allows an NCS to request the Media Object Server to create, modify or delete a media object.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#_3.3.3_mosReqObjAction_%E2%80%93_NCS_request
	 */
	sendRequestObjectActionDelete: (objId: IMOSString128) => Promise<IMOSAck>

	// Deprecated methods:
	/** @deprecated onMosObjCreate is deprecated, use onObjectCreate instead */
	onMosObjCreate: (cb: (object: IMOSObject) => Promise<IMOSAck>) => void
	/** @deprecated mosObjCreate is deprecated, use sendObjectCreate instead */
	mosObjCreate: (object: IMOSObject) => Promise<IMOSAck>
	/** @deprecated onMosItemReplace is deprecated, use onItemReplace instead */
	onMosItemReplace: (cb: (roID: IMOSString128, storyID: IMOSString128, item: IMOSItem) => Promise<IMOSROAck>) => void
	/** @deprecated mosItemReplace is deprecated, use sendItemReplace instead */
	mosItemReplace: (options: MosItemReplaceOptions) => Promise<IMOSROAck>
	/** @deprecated onMosReqSearchableSchema is deprecated, use onRequestSearchableSchema instead */
	onMosReqSearchableSchema: (cb: (username: string) => Promise<IMOSListSearchableSchema>) => void
	/** @deprecated mosRequestSearchableSchema is deprecated, use sendRequestSearchableSchema instead */
	mosRequestSearchableSchema: (username: string) => Promise<IMOSListSearchableSchema>
	/** @deprecated onMosReqObjectList is deprecated, use onRequestObjectList instead */
	onMosReqObjectList: (cb: (objList: IMOSRequestObjectList) => Promise<IMOSObjectList>) => void
	/** @deprecated mosRequestObjectList is deprecated, use sendRequestObjectList instead */
	mosRequestObjectList: (reqObjList: IMOSRequestObjectList) => Promise<IMOSObjectList>
	/** @deprecated onMosReqObjectAction is deprecated, use onRequestObjectAction*** instead */
	onMosReqObjectAction: (cb: (action: string, obj: IMOSObject) => Promise<IMOSAck>) => void
}
/**
 * Method definitions for Profile 4
 * see https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#Profile4
 */
export interface IMOSDeviceProfile4 {
	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * roReqAll is a request for a description of all Running Orders known by a NCS from a MOS.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roReqAll
	 */
	onRequestAllRunningOrders: (cb: () => Promise<IMOSRunningOrder[]>) => void
	/**
	 * Send message (as NCS) to a MOS device:
	 * roReqAll is a request for a description of all Running Orders known by a NCS from a MOS.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roReqAll
	 */
	sendRequestAllRunningOrders: () => Promise<Array<IMOSRunningOrderBase>>

	/**
	 * Assign callback (as a MOS device) for when receiving message from NCS:
	 * This message enables sending the body of story from the NCS to a Media Object Server.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roStorySend
	 */
	onRunningOrderStory: (cb: (story: IMOSROFullStory) => Promise<IMOSROAck>) => void
	/**
	 * Send message (as NCS) to a MOS device:
	 * This message enables sending the body of story from the NCS to a Media Object Server.
	 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roStorySend
	 */
	sendRunningOrderStory: (story: IMOSROFullStory) => Promise<IMOSROAck>

	// Deprecated methods:
	/** @deprecated onROReqAll is deprecated, use onRequestAllRunningOrders instead */
	onROReqAll: (cb: () => Promise<IMOSRunningOrder[]>) => void
	/** @deprecated getAllRunningOrders is deprecated, use sendRequestAllRunningOrders instead */
	getAllRunningOrders: () => Promise<Array<IMOSRunningOrderBase>> // send roReqAll
	/** @deprecated onROStory is deprecated, use onRunningOrderStory instead */
	onROStory: (cb: (story: IMOSROFullStory) => Promise<IMOSROAck>) => void // roStorySend
	/** @deprecated sendROStory is deprecated, use sendRunningOrderStory instead */
	sendROStory: (story: IMOSROFullStory) => Promise<IMOSROAck> // roStorySend
}

// /** */
export interface IMOSConnectionStatus {
	PrimaryConnected: boolean
	PrimaryStatus: string // if not connected this will contain human-readable error-message
	SecondaryConnected: boolean
	SecondaryStatus: string // if not connected this will contain human-readable error-message
}
/** Config object for creating a MOS-device */
export interface IConnectionConfig {
	/** The ID of this mos-device */
	mosID: string
	/** Whether this mosConnection accepts new connections from othe MOS clients (ie acts as an NCS) */
	acceptsConnections: boolean
	/** Only accept connections from this whitelist */
	accepsConnectionsFrom?: string[]
	/** A list of which profile this mos device is to support */
	profiles: IProfiles
	/** If true, this device is assumed to be an NCS (server). Defaults to a MOS (client). */
	isNCS?: boolean
	/** Debugging-mode: logs raw mos-messages */
	debug?: boolean
	offspecFailover?: boolean
	/** If set to true, a strict check is performed to ensure that all required callbacks are set up for specified profiles */
	strict?: boolean
	/** If set, overrides the standard port numbers */
	ports?: {
		/** Set MOS Lower port (standard: 10540) */
		lower: number
		/** Set MOS Upper port (standard: 10541) */
		upper: number
		/** Set MOS Query port (standard: 10542) */
		query: number
	}
	/** When enabled, automatically create new mos-devices on-the-fly when receiving messages to unregistered MOS-ID:s */
	openRelay?:
		| boolean
		| {
				// options for on-the-fly-created connections
				options: IMOSDeviceConnectionOptions['primary']
		  }
}
export interface IMOSDeviceConnectionOptions {
	/** Connection options for the Primary NCS-server */
	primary: {
		/** Name (NCS ID) of the NCS-server */
		id: string
		/** Host address (IP-address) of the NCS-server  */
		host: string // ip-addr
		/** (Optional): Custom ports for communication */
		ports?: {
			upper: number
			lower: number
			query: number
		}
		/** (Optional) Timeout for commands (ms) */
		timeout?: number
		/** (Optional) Interval for sending of hearbeats (ms) */
		heartbeatInterval?: number
		/** (Optional) Some server doesn't expose the Query port, which can cause connection-errors.
		 * Set this to true to not use that port (will cause some methods to stop working)
		 */
		dontUseQueryPort?: boolean
	}
	/** Connection options for the Secondary (Buddy) NCS-server */
	secondary?: {
		/** Name (NCS ID) of the Buddy NCS-server */
		id: string
		/** Host address (IP-address) of the NCS-server  */
		host: string
		/** (Optional): Custom ports for communication */
		ports?: {
			upper: number
			lower: number
			query: number
		}
		/** (Optional) Timeout for commands (ms) */
		timeout?: number
		/** (Optional) Interval for sending of hearbeats (ms) */
		heartbeatInterval?: number

		/** (Optional) Some server doesn't expose the Query port, which can cause connection-errors.
		 * Set this to true to not use that port (will cause some methods to stop working)
		 */
		dontUseQueryPort?: boolean

		/** (Optional) Treat the secondary server as a "hot standby".
		 * A "hot standby" is a server that is powered down / in standby while the primary server is up.
		 * When a server is a hot standby it is expected to be disconnected and hence we will not send
		 * heartbeat messages. The connection status will still be reported as disconnected however as we
		 * do not pretend to be connected to something that is powered down.
		 *
		 * (This was added to support the hot standby feature of OpenMedia NRCS.)
		 */
		openMediaHotStandby?: boolean
	}
}
