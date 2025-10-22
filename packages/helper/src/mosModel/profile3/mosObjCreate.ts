import { IMOSObject } from '@mos-connection/model'
import { MosMessage } from '../MosMessage.js'
import * as XMLBuilder from 'xmlbuilder'
import { XMLMosObject } from '../profile1/xmlConversion.js'

// https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#mosObjCreate
export class MosObjCreate extends MosMessage {
	private object: IMOSObject

	constructor(object: IMOSObject, strict: boolean) {
		super('lower', strict)
		this.object = object
	}

	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const xml = XMLBuilder.create('mosObjCreate')

		XMLMosObject.toXML(xml, this.object, this.strict)

		return xml
	}
}
