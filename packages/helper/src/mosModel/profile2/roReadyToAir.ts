import * as XMLBuilder from 'xmlbuilder'
import { MosMessage } from '../MosMessage.js'
import { IMOSString128 } from '@mos-connection/model'
import { addTextElementInternal } from '../../utils/Utils.js'

// https://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS-Protocol-2.8.4-Current.htm#roReadyToAir

export interface ROReadyToAirOptions {
	roId: IMOSString128
	roAir: 'READY' | 'NOT READY'
}
export class ROReadyToAir extends MosMessage {
	private options: ROReadyToAirOptions

	constructor(options: ROReadyToAirOptions, strict: boolean) {
		super('upper', strict)
		this.options = options
	}

	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const root = XMLBuilder.create('roReadyToAir')
		addTextElementInternal(root, 'roID', this.options.roId, undefined, this.strict)
		addTextElementInternal(root, 'roAir', this.options.roAir, undefined, this.strict)
		return root
	}
}
