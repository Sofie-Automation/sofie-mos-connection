import { IMOSTime, IMOSString128, IMOSDuration, IMOSExternalMetaData } from './mosTypes.js'
import { AnyXMLValue } from './xmlParse.js'

export interface IMOSROAction {
	RunningOrderID: IMOSString128
}
export interface IMOSStoryAction extends IMOSROAction {
	StoryID: IMOSString128
}
export interface IMOSItemAction extends IMOSStoryAction {
	ItemID: IMOSString128
}
export interface IMOSROReadyToAir {
	ID: IMOSString128
	Status: IMOSObjectAirStatus
}
export interface IMOSRunningOrderStatus {
	ID: IMOSString128
	Status: IMOSObjectStatus
	Time: IMOSTime
}
export interface IMOSStoryStatus {
	RunningOrderId: IMOSString128
	ID: IMOSString128
	Status: IMOSObjectStatus
	Time: IMOSTime
}
export interface IMOSItemStatus {
	RunningOrderId: IMOSString128
	StoryId: IMOSString128
	ID: IMOSString128
	Status: IMOSObjectStatus
	Time: IMOSTime
	ObjectId?: IMOSString128
	Channel?: IMOSString128
}
export interface IMOSRunningOrderBase {
	ID: IMOSString128 // running order id
	Slug: IMOSString128
	DefaultChannel?: IMOSString128
	EditorialStart?: IMOSTime
	EditorialDuration?: IMOSDuration
	Trigger?: IMOSString128
	MacroIn?: IMOSString128
	MacroOut?: IMOSString128
	MosExternalMetaData?: Array<IMOSExternalMetaData>
}
export interface IMOSRunningOrder extends IMOSRunningOrderBase {
	Stories: Array<IMOSROStory>
}
export interface IMOSStory {
	ID: IMOSString128
	Slug?: IMOSString128
	Number?: IMOSString128
	MosExternalMetaData?: Array<IMOSExternalMetaData>
}
export interface IMOSROStory extends IMOSStory {
	Items: Array<IMOSItem>
}
export interface IMOSROFullStory extends IMOSStory {
	RunningOrderId: IMOSString128
	Body: Array<IMOSROFullStoryBodyItem>
}

export type IMOSROFullStoryBodyItem = IMOSROFullStoryBodyStoryItem | IMOSROFullStoryBodyOtherItem
export type IMOSROFullStoryBodyStoryItem = {
	itemType: 'storyItem'
	Type: 'storyItem'
	Content: IMOSItem // TODO: Make this stricter? IMOSItemObject??
}
export type IMOSROFullStoryBodyOtherItem = {
	itemType: 'other'
	Type: string // e.g. 'p'
	Content: AnyXMLValue
}
export interface IMOSItem {
	ID: IMOSString128
	Slug?: IMOSString128
	ObjectSlug?: IMOSString128
	ObjectID: IMOSString128
	MOSID: string
	mosAbstract?: string
	Paths?: Array<IMOSObjectPath>
	Channel?: IMOSString128
	EditorialStart?: number
	EditorialDuration?: number
	Duration?: number
	TimeBase?: number
	UserTimingDuration?: number
	Trigger?: AnyXMLValue
	MacroIn?: IMOSString128
	MacroOut?: IMOSString128
	MosExternalMetaData?: Array<IMOSExternalMetaData>
	MosObjects?: Array<IMOSObject>
}

export interface IMOSAck {
	ID: IMOSString128
	Revision: number // max 999
	Status: IMOSAckStatus
	Description: IMOSString128
}

export interface IMOSROAck {
	ID: IMOSString128 // Running order id
	Status: IMOSString128 // OK or error desc
	Stories: Array<IMOSROAckStory>
}

export interface IMOSROAckStory {
	ID: IMOSString128 // storyID
	Items: Array<IMOSROAckItem>
}

export interface IMOSROAckItem {
	ID: IMOSString128
	Channel: IMOSString128
	Objects: Array<IMOSROAckObject>
}

export interface IMOSROAckObject {
	Status: 'OK' | string
	ID: IMOSString128
}

export interface IProfiles {
	[key: string]: boolean | undefined
	'0': boolean
	'1'?: boolean
	'2'?: boolean
	'3'?: boolean
	'4'?: boolean
	'5'?: boolean
	'6'?: boolean
	'7'?: boolean
}

/** https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#mosObj */
export interface IMOSObject {
	ID?: IMOSString128
	Slug: IMOSString128
	MosAbstract?: AnyXMLValue // xml json
	/** A stringified version of MosAbstract, where all HTML have been flattened */
	MosAbstractStr?: string
	Group?: string
	Type: IMOSObjectType
	TimeBase: number
	Revision?: number // max 999
	Duration: number
	Status?: IMOSObjectStatus
	AirStatus?: IMOSObjectAirStatus
	Paths?: Array<IMOSObjectPath>
	CreatedBy?: IMOSString128
	Created?: IMOSTime
	ChangedBy?: IMOSString128 // if not present, defaults to CreatedBy
	Changed?: IMOSTime // if not present, defaults to Created
	Description?: AnyXMLValue // xml json
	/** A stringified version of Description, where all HTML have been flattened */
	DescriptionStr?: string
	MosExternalMetaData?: Array<IMOSExternalMetaData>
	MosItemEditorProgID?: IMOSString128
}

/**
 * Returns selected object descriptions from a MOS.
 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#mosObjList
 */
export interface IMOSObjectList {
	username: string
	queryID: string
	listReturnStart: number
	listReturnEnd: number
	listReturnTotal: number
	listReturnStatus?: string
	list?: Array<IMOSObject>
}

/**
 * mosReqObjList is a mechanism used by a NCS to retrieve only selected object descriptions from a MOS.
 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#mosReqObjList
 */
export interface IMOSRequestObjectList {
	username: string
	queryID: IMOSString128
	listReturnStart: number | null
	listReturnEnd: number | null
	generalSearch: IMOSString128
	mosSchema: string
	searchGroups: Array<{
		searchFields: Array<IMOSSearchField>
	}>
}
/** @see IMOSRequestObjectList */
export interface IMOSSearchField {
	XPath: string
	sortByOrder?: number
	sortType?: string
}

/**
 * mosListSearchableSchema is a mechanism used by the MOS to send a pointer to a schema in which searchable fields are defined for the NCS device.
 * https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#mosListSearchableSchema
 */
export interface IMOSListSearchableSchema {
	username: string
	mosSchema: string
}

export enum IMOSObjectType {
	STILL = 'STILL',
	AUDIO = 'AUDIO',
	VIDEO = 'VIDEO',
	OTHER = 'OTHER', // unknown/not specified
}

export enum IMOSObjectStatus {
	NEW = 'NEW',
	UPDATED = 'UPDATED',
	MOVED = 'MOVED',
	BUSY = 'BUSY',
	DELETED = 'DELETED',
	NCS_CTRL = 'NCS CTRL',
	MANUAL_CTRL = 'MANUAL CTRL',
	READY = 'READY',
	NOT_READY = 'NOT READY',
	PLAY = 'PLAY',
	STOP = 'STOP',
}

export enum IMOSAckStatus {
	ACK = 'ACK',
	NACK = 'NACK',
}

export enum IMOSObjectAirStatus {
	READY = 'READY',
	NOT_READY = 'NOT READY',
}

export interface IMOSObjectPath {
	Type: IMOSObjectPathType
	Description: string
	Target: string // Max 255
}

export enum IMOSObjectPathType {
	PATH = 'PATH',
	PROXY_PATH = 'PROXY PATH',
	METADATA_PATH = 'METADATA PATH',
}
export { IMOSExternalMetaData }

export interface MosItemReplaceOptions {
	roID: IMOSString128
	storyID: IMOSString128
	item: IMOSItem
}

export enum IMOSListMachInfoDefaultActiveXMode {
	MODALDIALOG = 'MODALDIALOG',
	MODELESS = 'MODELESS',
	CONTAINED = 'CONTAINED',
	TOOLBAR = 'TOOLBAR',
}

export interface IMOSListMachInfo {
	/** Used in MOS ActiveX messages. Manufacturer: Text description. 128 chars max. */
	manufacturer: IMOSString128
	/** Model: Text description. 128 chars max. */
	model: IMOSString128
	/** HW Revision: 128 chars max. */
	hwRev: IMOSString128
	/** Software Revision: (MOS) Text description. 128 chars max., example: '2.1.0.37' */
	swRev: IMOSString128
	/** Date of Manufacture. */
	DOM: IMOSString128
	/** Serial Number: text serial number. 128 chars max. ex: '927748927' */
	SN: IMOSString128
	/** Identification of a Machine: text. 128 chars max. */
	ID: IMOSString128
	/** Time: Time object changed status. Format is YYYY-MM-DD'T'hh:mm:ss[,ddd]['Z'] */
	time: IMOSTime
	/** Operational Time: date and time of last machine start. Format is YYYY-MM-DD'T'hh:mm:ss[,ddd]['Z'] */
	opTime?: IMOSTime
	/** MOS Revision: Text description. 128 chars max. */
	mosRev: IMOSString128

	supportedProfiles: {
		deviceType: 'NCS' | 'MOS' | 'N/A'
		profile0?: boolean
		profile1?: boolean
		profile2?: boolean
		profile3?: boolean
		profile4?: boolean
		profile5?: boolean
		profile6?: boolean
		profile7?: boolean
	}
	/** defaultActiveX contains tags that describe the correct settings for the ActiveX control (NOTE: no two <defaultActivX> elements can have the same <mode> value). */
	defaultActiveX?: Array<IMOSDefaultActiveX>
	mosExternalMetaData?: Array<IMOSExternalMetaData>
}
export interface IMOSDefaultActiveX {
	/** Used in MOS ActiveX messages. How the ActiveX Plug-In window appears in the NCS Host window: MODALDIALOG, MODELESS, CONTAINED, TOOLBAR. */
	mode: IMOSListMachInfoDefaultActiveXMode
	/** controlFileLocation is the file location for the default ActiveX control. */
	controlFileLocation: string
	/** Defined by MOS 128 characters max */
	controlSlug: IMOSString128
	/** This value represents the key/classId key used to load the ActiveX from the registry., ex: "contained.containedCTRL.1" */
	controlName: string
	/** This value represents the parameters that can be passed to an ActiveX. ex "URL=http:" */
	controlDefaultParams: string
}
