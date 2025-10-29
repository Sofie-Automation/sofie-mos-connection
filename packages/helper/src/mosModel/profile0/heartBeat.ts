import { getMosTypes, IMOSTime } from '@mos-connection/model'
import * as XMLBuilder from 'xmlbuilder'

import { addTextElementInternal } from '../../utils/Utils.js'
import { MosMessage, PortType } from '../MosMessage.js'

export class HeartBeat extends MosMessage {
	time: IMOSTime

	/** */
	constructor(port: PortType, time: IMOSTime | undefined, strict: boolean) {
		super(port, strict)
		if (!time) time = getMosTypes(true).mosTime.create(Date.now())
		this.time = time
	}

	/** */
	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const heartbeat = XMLBuilder.create('heartbeat')
		addTextElementInternal(heartbeat, 'time', this.time, undefined, this.strict)
		return heartbeat
	}
}
