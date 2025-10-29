import { IMOSObject, IMOSString128 } from '@mos-connection/model'
import { MosMessage } from '../MosMessage.js'
import * as XMLBuilder from 'xmlbuilder'
import { XMLMosObject } from '../profile1/xmlConversion.js'
export interface MosReqObjActionOptionsNew {
	object: IMOSObject
}
export class MosReqObjActionNew extends MosMessage {
	private options: MosReqObjActionOptionsNew
	constructor(options: MosReqObjActionOptionsNew, strict: boolean) {
		super('lower', strict)
		this.options = options
	}
	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const xml = XMLBuilder.create('mosReqObjAction')
		xml.att('operation', 'NEW')
		XMLMosObject.toXML(xml, this.options.object, this.strict)
		return xml
	}
}
export interface MosReqObjActionOptionsUpdate {
	object: IMOSObject
	objectId: IMOSString128
}
export class MosReqObjActionUpdate extends MosMessage {
	private options: MosReqObjActionOptionsUpdate
	constructor(options: MosReqObjActionOptionsUpdate, strict: boolean) {
		super('lower', strict)
		this.options = options
	}
	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const xml = XMLBuilder.create('mosReqObjAction')
		xml.att('operation', 'UPDATE')
		xml.att('objID', this.mosTypes.mosString128.stringify(this.options.objectId))
		XMLMosObject.toXML(xml, this.options.object, this.strict)
		return xml
	}
}
export interface MosReqObjActionOptionsDelete {
	objectId: IMOSString128
}
export class MosReqObjActionDelete extends MosMessage {
	private options: MosReqObjActionOptionsDelete
	constructor(options: MosReqObjActionOptionsDelete, strict: boolean) {
		super('lower', strict)
		this.options = options
	}
	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const xml = XMLBuilder.create('mosReqObjAction')
		xml.att('operation', 'DELETE')
		xml.att('objID', this.mosTypes.mosString128.stringify(this.options.objectId))
		return xml
	}
}
