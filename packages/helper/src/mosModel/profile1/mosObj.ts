import { MosMessage } from '../MosMessage.js'
import * as XMLBuilder from 'xmlbuilder'
import { IMOSObject } from '@mos-connection/model'
import { XMLMosObject } from './xmlConversion.js'

export class MosObj extends MosMessage {
	obj: IMOSObject

	/** */
	constructor(obj: IMOSObject, strict: boolean) {
		super('lower', strict)
		this.obj = obj
	}

	/** */
	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const xmlMosObj = XMLBuilder.create('mosObj')
		XMLMosObject.toXML(xmlMosObj, this.obj, this.strict)

		return xmlMosObj
	}
}
