import * as XMLBuilder from 'xmlbuilder'
import { MosMessage } from '../MosMessage.js'
import { IMOSROFullStory, IMOSItem } from '@mos-connection/model'
import { XMLROStoryBase } from '../profile2/xmlConversion.js'
import { XMLMosExternalMetaData, XMLMosObjects, XMLObjectPaths } from '../profile1/xmlConversion.js'
import { addTextElementInternal } from '../../utils/Utils.js'

export class ROStory extends MosMessage {
	/** */
	constructor(
		private fullStory: IMOSROFullStory,
		strict: boolean
	) {
		super('upper', strict)
	}

	/** */
	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const xmlStory = XMLBuilder.create('roStorySend')

		XMLROStoryBase.toXML(xmlStory, this.fullStory, this.strict)
		addTextElementInternal(xmlStory, 'roID', this.fullStory.RunningOrderId, undefined, this.strict)

		const xmlStoryBody = addTextElementInternal(xmlStory, 'storyBody', undefined, undefined, this.strict)
		this.fullStory.Body.forEach((bodyItem) => {
			if (bodyItem.itemType === 'storyItem') {
				const xmlItem = addTextElementInternal(xmlStoryBody, 'storyItem', undefined, undefined, this.strict)

				const item: IMOSItem = bodyItem.Content

				addTextElementInternal(xmlItem, 'itemID', item.ID, undefined, this.strict)
				addTextElementInternal(xmlItem, 'objID', item.ObjectID, undefined, this.strict)
				addTextElementInternal(xmlItem, 'mosID', item.MOSID, undefined, this.strict)
				// TODO: mosAbstract?: string?
				// TODO: Channel?: MosString128?
				// TODO: MacroIn?: MosString128?
				// TODO: MacroOut?: MosString128?

				XMLObjectPaths.toXML(xmlItem, item.Paths, this.strict)
				if (item.MosExternalMetaData) XMLMosExternalMetaData.toXML(xmlItem, item.MosExternalMetaData)

				if (item.Slug) addTextElementInternal(xmlItem, 'itemSlug', item.Slug, undefined, this.strict)
				if (item.EditorialStart)
					addTextElementInternal(xmlItem, 'itemEdStart', item.EditorialStart, undefined, this.strict)
				if (item.EditorialDuration)
					addTextElementInternal(xmlItem, 'itemEdDur', item.EditorialDuration, undefined, this.strict)
				if (item.UserTimingDuration)
					addTextElementInternal(
						xmlItem,
						'itemUserTimingDur',
						item.UserTimingDuration,
						undefined,
						this.strict
					)
				if (item.Trigger) addTextElementInternal(xmlItem, 'itemTrigger', item.Trigger, undefined, this.strict)
				if (item.mosAbstract)
					addTextElementInternal(xmlItem, 'mosAbstract', item.mosAbstract, undefined, this.strict)
				if (item.ObjectSlug) addTextElementInternal(xmlItem, 'objSlug', item.ObjectSlug, undefined, this.strict)
				if (item.Channel) addTextElementInternal(xmlItem, 'itemChannel', item.Channel, undefined, this.strict)
				if (item.Duration) addTextElementInternal(xmlItem, 'objDur', item.Duration, undefined, this.strict)
				if (item.TimeBase) addTextElementInternal(xmlItem, 'objTB', item.TimeBase, undefined, this.strict)

				if (item.MacroIn) addTextElementInternal(xmlItem, 'macroIn', item.MacroIn, undefined, this.strict)
				if (item.MacroOut) addTextElementInternal(xmlItem, 'macroOut', item.MacroOut, undefined, this.strict)

				// Note: the <mosObj> is sent in roStorySend
				if (item.MosObjects) XMLMosObjects.toXML(xmlItem, item.MosObjects, this.strict)
			} else {
				// TODO: what is this?
				addTextElementInternal(xmlStoryBody, bodyItem.Type, bodyItem.Content, undefined, this.strict)
			}
		})

		return xmlStory
	}
}
