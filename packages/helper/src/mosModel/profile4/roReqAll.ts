import * as XMLBuilder from 'xmlbuilder'
import { MosMessage } from '../MosMessage.js'

export class ROReqAll extends MosMessage {
	/** */
	constructor(strict: boolean) {
		super('upper', strict)
	}

	/** */
	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const root = XMLBuilder.create('roReqAll')
		return root
	}
}
