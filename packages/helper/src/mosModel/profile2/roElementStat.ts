import * as XMLBuilder from 'xmlbuilder'
import { MosMessage } from '../MosMessage.js'
import { getMosTypes, IMOSObjectStatus, IMOSString128, IMOSTime } from '@mos-connection/model'
import { addTextElementInternal } from '../../utils/Utils.js'

export enum ROElementStatType {
	RO = 'RO',
	STORY = 'STORY',
	ITEM = 'ITEM',
}
export interface ROElementStatOptions {
	type: ROElementStatType
	roId: IMOSString128
	storyId?: IMOSString128
	itemId?: IMOSString128
	objId?: IMOSString128
	itemChannel?: IMOSString128
	status: IMOSObjectStatus
}
export class ROElementStat extends MosMessage {
	private options: ROElementStatOptions
	private time: IMOSTime
	/** */
	constructor(options: ROElementStatOptions, strict: boolean) {
		super('upper', strict)
		this.options = options
		this.time = getMosTypes(strict).mosTime.create(Date.now())
	}

	/** */
	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const root = XMLBuilder.create('roElementStat')
		root.attribute('element', this.options.type.toString())

		addTextElementInternal(root, 'roID', this.options.roId, undefined, this.strict)
		if (this.options.storyId) addTextElementInternal(root, 'storyID', this.options.storyId, undefined, this.strict)
		if (this.options.itemId) addTextElementInternal(root, 'itemID', this.options.itemId, undefined, this.strict)
		if (this.options.objId) addTextElementInternal(root, 'objID', this.options.objId, undefined, this.strict)
		if (this.options.itemChannel)
			addTextElementInternal(root, 'itemChannel', this.options.itemChannel, undefined, this.strict)
		addTextElementInternal(root, 'status', this.options.status, undefined, this.strict)
		addTextElementInternal(root, 'time', this.time, undefined, this.strict)
		return root
	}
}
