import * as XMLBuilder from 'xmlbuilder'
import { MosMessage } from '../MosMessage.js'
import { IMOSString128 } from '@mos-connection/model'
import { addTextElementInternal } from '../../utils/Utils.js'

export class ReqMosObj extends MosMessage {
	private objId: IMOSString128
	/** */
	constructor(objId: IMOSString128, strict: boolean) {
		super('lower', strict)
		this.objId = objId
	}

	/** */
	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const root = XMLBuilder.create('mosReqObj')
		addTextElementInternal(root, 'objID', this.objId, undefined, this.strict)
		return root
	}
}
