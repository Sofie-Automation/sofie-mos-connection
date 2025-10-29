import * as XMLBuilder from 'xmlbuilder'
import { MosMessage } from '../MosMessage.js'
import {
	IMOSStoryAction,
	IMOSROStory,
	IMOSItemAction,
	IMOSItem,
	IMOSROAction,
	IMOSString128,
} from '@mos-connection/model'
import { XMLROStory, XMLMosItem } from './xmlConversion.js'
import { addTextElementInternal } from '../../utils/Utils.js'

export abstract class MosSendMessage extends MosMessage {
	constructor(strict: boolean) {
		super('upper', strict)
	}
}
export class ROInsertStories extends MosSendMessage {
	constructor(
		private Action: IMOSStoryAction,
		private Stories: Array<IMOSROStory>,
		strict: boolean
	) {
		super(strict)
	}
	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const root = XMLBuilder.create('roElementAction')
		root.att('operation', 'INSERT')
		addTextElementInternal(root, 'roID', this.Action.RunningOrderID, undefined, this.strict)
		const xmlTarget = addTextElementInternal(root, 'element_target', undefined, undefined, this.strict)
		addTextElementInternal(xmlTarget, 'storyID', this.Action.StoryID, undefined, this.strict)
		const xmlSource = addTextElementInternal(root, 'element_source', undefined, undefined, this.strict)
		this.Stories.forEach((story) => {
			XMLROStory.toXML(xmlSource, story, true)
		})
		return root
	}
}
export class ROInsertItems extends MosSendMessage {
	constructor(
		private Action: IMOSItemAction,
		private Items: Array<IMOSItem>,
		strict: boolean
	) {
		super(strict)
	}
	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const root = XMLBuilder.create('roElementAction')
		root.att('operation', 'INSERT')
		addTextElementInternal(root, 'roID', this.Action.RunningOrderID, undefined, this.strict)
		const xmlTarget = addTextElementInternal(root, 'element_target', undefined, undefined, this.strict)
		addTextElementInternal(xmlTarget, 'storyID', this.Action.StoryID, undefined, this.strict)
		addTextElementInternal(xmlTarget, 'itemID', this.Action.ItemID, undefined, this.strict)
		const xmlSource = addTextElementInternal(root, 'element_source', undefined, undefined, this.strict)
		this.Items.forEach((item) => {
			XMLMosItem.toXML(xmlSource, item, true)
		})
		return root
	}
}
export class ROReplaceStories extends MosSendMessage {
	constructor(
		private Action: IMOSStoryAction,
		private Stories: Array<IMOSROStory>,
		strict: boolean
	) {
		super(strict)
	}
	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const root = XMLBuilder.create('roElementAction')
		root.att('operation', 'REPLACE')
		addTextElementInternal(root, 'roID', this.Action.RunningOrderID, undefined, this.strict)
		const xmlTarget = addTextElementInternal(root, 'element_target', undefined, undefined, this.strict)
		addTextElementInternal(xmlTarget, 'storyID', this.Action.StoryID, undefined, this.strict)
		const xmlSource = addTextElementInternal(root, 'element_source', undefined, undefined, this.strict)
		this.Stories.forEach((story) => {
			XMLROStory.toXML(xmlSource, story, true)
		})
		return root
	}
}
export class ROReplaceItems extends MosSendMessage {
	constructor(
		private Action: IMOSItemAction,
		private Items: Array<IMOSItem>,
		strict: boolean
	) {
		super(strict)
	}
	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const root = XMLBuilder.create('roElementAction')
		root.att('operation', 'REPLACE')
		addTextElementInternal(root, 'roID', this.Action.RunningOrderID, undefined, this.strict)
		const xmlTarget = addTextElementInternal(root, 'element_target', undefined, undefined, this.strict)
		addTextElementInternal(xmlTarget, 'storyID', this.Action.StoryID, undefined, this.strict)
		addTextElementInternal(xmlTarget, 'itemID', this.Action.ItemID, undefined, this.strict)
		const xmlSource = addTextElementInternal(root, 'element_source', undefined, undefined, this.strict)
		this.Items.forEach((item) => {
			XMLMosItem.toXML(xmlSource, item, true)
		})
		return root
	}
}
export class ROMoveStories extends MosSendMessage {
	constructor(
		private Action: IMOSStoryAction,
		private Stories: Array<IMOSString128>,
		strict: boolean
	) {
		super(strict)
	}
	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const root = XMLBuilder.create('roElementAction')
		root.att('operation', 'MOVE')
		addTextElementInternal(root, 'roID', this.Action.RunningOrderID, undefined, this.strict)
		const xmlTarget = addTextElementInternal(root, 'element_target', undefined, undefined, this.strict)
		addTextElementInternal(xmlTarget, 'storyID', this.Action.StoryID, undefined, this.strict)
		const xmlSource = addTextElementInternal(root, 'element_source', undefined, undefined, this.strict)
		this.Stories.forEach((storyID) => {
			addTextElementInternal(xmlSource, 'storyID', storyID, undefined, this.strict)
		})
		return root
	}
}
export class ROMoveItems extends MosSendMessage {
	constructor(
		private Action: IMOSItemAction,
		private Items: Array<IMOSString128>,
		strict: boolean
	) {
		super(strict)
	}
	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const root = XMLBuilder.create('roElementAction')
		root.att('operation', 'MOVE')
		addTextElementInternal(root, 'roID', this.Action.RunningOrderID, undefined, this.strict)
		const xmlTarget = addTextElementInternal(root, 'element_target', undefined, undefined, this.strict)
		addTextElementInternal(xmlTarget, 'storyID', this.Action.StoryID, undefined, this.strict)
		addTextElementInternal(xmlTarget, 'itemID', this.Action.ItemID, undefined, this.strict)
		const xmlSource = addTextElementInternal(root, 'element_source', undefined, undefined, this.strict)
		this.Items.forEach((itemID) => {
			addTextElementInternal(xmlSource, 'itemID', itemID, undefined, this.strict)
		})
		return root
	}
}
export class RODeleteStories extends MosSendMessage {
	constructor(
		private Action: IMOSROAction,
		private Stories: Array<IMOSString128>,
		strict: boolean
	) {
		super(strict)
	}
	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const root = XMLBuilder.create('roElementAction')
		root.att('operation', 'DELETE')
		addTextElementInternal(root, 'roID', this.Action.RunningOrderID, undefined, this.strict)
		const xmlSource = addTextElementInternal(root, 'element_source', undefined, undefined, this.strict)
		this.Stories.forEach((storyID) => {
			addTextElementInternal(xmlSource, 'storyID', storyID, undefined, this.strict)
		})
		return root
	}
}
export class RODeleteItems extends MosSendMessage {
	constructor(
		private Action: IMOSStoryAction,
		private Items: Array<IMOSString128>,
		strict: boolean
	) {
		super(strict)
	}
	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const root = XMLBuilder.create('roElementAction')
		root.att('operation', 'DELETE')
		addTextElementInternal(root, 'roID', this.Action.RunningOrderID, undefined, this.strict)
		const xmlTarget = addTextElementInternal(root, 'element_target', undefined, undefined, this.strict)
		addTextElementInternal(xmlTarget, 'storyID', this.Action.StoryID, undefined, this.strict)
		const xmlSource = addTextElementInternal(root, 'element_source', undefined, undefined, this.strict)
		this.Items.forEach((itemID) => {
			addTextElementInternal(xmlSource, 'itemID', itemID, undefined, this.strict)
		})
		return root
	}
}
export class ROSwapStories extends MosSendMessage {
	constructor(
		private Action: IMOSROAction,
		private StoryID0: IMOSString128,
		private StoryID1: IMOSString128,
		strict: boolean
	) {
		super(strict)
	}
	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const root = XMLBuilder.create('roElementAction')
		root.att('operation', 'SWAP')
		addTextElementInternal(root, 'roID', this.Action.RunningOrderID, undefined, this.strict)
		const xmlSource = addTextElementInternal(root, 'element_source', undefined, undefined, this.strict)
		addTextElementInternal(xmlSource, 'storyID', this.StoryID0, undefined, this.strict)
		addTextElementInternal(xmlSource, 'storyID', this.StoryID1, undefined, this.strict)
		return root
	}
}
export class ROSwapItems extends MosSendMessage {
	constructor(
		private Action: IMOSStoryAction,
		private ItemID0: IMOSString128,
		private ItemID1: IMOSString128,
		strict: boolean
	) {
		super(strict)
	}
	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const root = XMLBuilder.create('roElementAction')
		root.att('operation', 'SWAP')
		addTextElementInternal(root, 'roID', this.Action.RunningOrderID, undefined, this.strict)
		const xmlTarget = addTextElementInternal(root, 'element_target', undefined, undefined, this.strict)
		addTextElementInternal(xmlTarget, 'storyID', this.Action.StoryID, undefined, this.strict)
		const xmlSource = addTextElementInternal(root, 'element_source', undefined, undefined, this.strict)
		addTextElementInternal(xmlSource, 'itemID', this.ItemID0, undefined, this.strict)
		addTextElementInternal(xmlSource, 'itemID', this.ItemID1, undefined, this.strict)
		return root
	}
}
