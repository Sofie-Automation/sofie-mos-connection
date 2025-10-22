import * as XMLBuilder from 'xmlbuilder'
import { IMOSRunningOrderBase } from '@mos-connection/model'
import { MosMessage } from '../MosMessage.js'
import { XMLRunningOrderBase } from './xmlConversion.js'

export class ROMetadataReplace extends MosMessage {
	constructor(
		private metadata: IMOSRunningOrderBase,
		strict: boolean
	) {
		super('upper', strict)
	}
	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const root = XMLBuilder.create('roMetadataReplace')

		XMLRunningOrderBase.toXML(root, this.metadata, this.strict)

		return root
	}
}
