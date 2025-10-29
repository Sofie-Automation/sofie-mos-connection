import * as XMLBuilder from 'xmlbuilder'
import { IMOSRunningOrder } from '@mos-connection/model'
import { ROCreate } from './roCreate.js'

export class ROReplace extends ROCreate {
	constructor(ro: IMOSRunningOrder, strict: boolean) {
		super(ro, strict)
	}
	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const root = XMLBuilder.create('roReplace')
		this.fillXMLWithROData(root)
		return root
	}
}
