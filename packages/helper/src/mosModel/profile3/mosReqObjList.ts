import { IMOSRequestObjectList } from '@mos-connection/model'
import { MosMessage } from '../MosMessage.js'
import * as XMLBuilder from 'xmlbuilder'
import { XMLMosRequestObjectList } from './xmlConversion.js'

export class MosReqObjList extends MosMessage {
	private options: IMOSRequestObjectList

	constructor(options: IMOSRequestObjectList, strict: boolean) {
		super('query', strict)
		this.options = options
	}

	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const xmlMosReqObjList = XMLBuilder.create('mosReqObjList')
		XMLMosRequestObjectList.toXML(xmlMosReqObjList, this.options, this.strict)
		return xmlMosReqObjList
	}
}
