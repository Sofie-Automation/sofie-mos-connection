import * as XMLBuilder from 'xmlbuilder'
import { MosMessage } from '../MosMessage.js'
import { IMOSRunningOrder } from '@mos-connection/model'
import { XMLRunningOrderBase } from './xmlConversion.js'

export class ROListAll extends MosMessage {
	public ROs: IMOSRunningOrder[] = []

	/** */
	constructor(list: IMOSRunningOrder[], strict: boolean) {
		super('upper', strict)
		this.ROs = list
	}

	/** */
	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const root = XMLBuilder.create('roListAll')

		this.ROs.forEach((RO: IMOSRunningOrder) => {
			const xmlRO = XMLBuilder.create('ro')

			XMLRunningOrderBase.toXML(xmlRO, RO, this.strict)

			root.importDocument(xmlRO)
		})

		return root
	}
}
