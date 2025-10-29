import * as XMLBuilder from 'xmlbuilder'
import { MosMessage } from '../MosMessage.js'
import { IMOSString128 } from '@mos-connection/model'
import { addTextElementInternal } from '../../utils/Utils.js'

export class ROReq extends MosMessage {
	private roId: IMOSString128
	/** */
	constructor(roId: IMOSString128, strict: boolean) {
		super('upper', strict)
		this.roId = roId
	}

	/** */
	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const root = XMLBuilder.create('roReq')
		addTextElementInternal(root, 'roID', this.roId, undefined, this.strict)
		return root
	}
}
