import { IMOSListMachInfo } from '@mos-connection/model'
import { MosMessage } from '../MosMessage.js'
import * as XMLBuilder from 'xmlbuilder'
import { XMLMosListMachInfo } from './xmlConversion.js'

export class ListMachineInfo extends MosMessage {
	info: IMOSListMachInfo

	/** */
	constructor(info: IMOSListMachInfo, port: 'upper' | 'lower', strict: boolean) {
		super(port, strict)
		this.info = info
	}

	/** */
	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const xmlListMachInfo = XMLBuilder.create('listMachInfo')
		XMLMosListMachInfo.toXML(xmlListMachInfo, this.info, this.strict)
		return xmlListMachInfo
	}
}
