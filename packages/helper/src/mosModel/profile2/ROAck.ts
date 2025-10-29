import * as XMLBuilder from 'xmlbuilder'
import { MosMessage } from '../MosMessage.js'
import { IMOSROAck, IMOSROAckStory, IMOSString128 } from '@mos-connection/model'
import { addTextElementInternal } from '../../utils/Utils.js'

export class ROAck extends MosMessage implements IMOSROAck {
	ID: IMOSString128
	Status: IMOSString128
	Stories: Array<IMOSROAckStory>

	/** */
	constructor(roAck: IMOSROAck, strict: boolean) {
		super('upper', strict)

		this.ID = roAck.ID
		this.Status = roAck.Status
		this.Stories = roAck.Stories
	}

	/** */
	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const root = XMLBuilder.create('roAck')

		addTextElementInternal(root, 'roID', this.ID, undefined, this.strict)
		addTextElementInternal(root, 'roStatus', this.Status, undefined, this.strict)

		// Loop over Stories, Items and Object
		for (const story of this.Stories) {
			for (const item of story.Items) {
				for (const obj of item.Objects) {
					addTextElementInternal(root, 'storyID', story.ID, undefined, this.strict)
					addTextElementInternal(root, 'itemID', item.ID, undefined, this.strict)
					addTextElementInternal(root, 'objID', obj.ID, undefined, this.strict)

					const channelStr = this.mosTypes.mosString128.stringify(item.Channel)
					if (channelStr && channelStr !== 'undefined') {
						addTextElementInternal(root, 'itemChannel', item.Channel, undefined, this.strict)
					}
					addTextElementInternal(root, 'status', obj.Status, undefined, this.strict)
				}
			}
		}
		return root
	}
}
