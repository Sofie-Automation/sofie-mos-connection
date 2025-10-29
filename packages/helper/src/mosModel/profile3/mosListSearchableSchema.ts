import { MosMessage } from '../MosMessage.js'
import * as XMLBuilder from 'xmlbuilder'
import { IMOSListSearchableSchema } from '@mos-connection/model'
import { XMLMosListSearchableSchema } from './xmlConversion.js'

export class MosListSearchableSchema extends MosMessage {
	private options: IMOSListSearchableSchema

	constructor(options: IMOSListSearchableSchema, strict: boolean) {
		super('query', strict)
		this.options = options
	}

	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const xml = XMLBuilder.create('mosListSearchableSchema')

		XMLMosListSearchableSchema.toXML(xml, this.options, this.strict)

		return xml
	}
}
