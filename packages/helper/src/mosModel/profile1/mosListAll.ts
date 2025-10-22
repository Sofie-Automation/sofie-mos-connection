import { MosMessage } from '../MosMessage.js'
import * as XMLBuilder from 'xmlbuilder'
import { IMOSObject } from '@mos-connection/model'
import { XMLMosObject } from '../profile1/xmlConversion.js'

export class MosListAll extends MosMessage {
	objs: Array<IMOSObject>

	/** */
	constructor(objs: Array<IMOSObject>, strict: boolean) {
		super('lower', strict)
		this.objs = objs
	}

	/** */
	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const root = XMLBuilder.create('mosListAll')

		this.objs.forEach((obj: IMOSObject) => {
			const xmlMosObj = XMLBuilder.create('mosObj')
			XMLMosObject.toXML(xmlMosObj, obj, this.strict)
			root.importDocument(xmlMosObj)
		})

		return root
	}
}
