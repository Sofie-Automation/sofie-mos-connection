import * as XMLBuilder from 'xmlbuilder'
import { MosMessage } from '../MosMessage.js'
import { IMOSRunningOrder } from '@mos-connection/model'
import { XMLROStory, XMLRunningOrderBase } from './xmlConversion.js'

export class ROList extends MosMessage {
	/** */
	constructor(
		private ro: IMOSRunningOrder,
		strict: boolean
	) {
		super('upper', strict)
	}

	/** */
	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const root = XMLBuilder.create('roList')

		this.fillXMLWithROData(root)

		return root
	}

	protected fillXMLWithROData(root: XMLBuilder.XMLElement): void {
		XMLRunningOrderBase.toXML(root, this.ro, this.strict)

		this.ro.Stories.forEach((story) => {
			XMLROStory.toXML(root, story, this.strict)
		})
	}
}
