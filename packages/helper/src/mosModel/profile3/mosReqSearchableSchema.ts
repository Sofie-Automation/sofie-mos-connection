import { MosMessage } from '../MosMessage.js'
import * as XMLBuilder from 'xmlbuilder'

export class MosReqSearchableSchema extends MosMessage {
	private options: { username: string }

	constructor(options: { username: string }, strict: boolean) {
		super('query', strict)
		this.options = options
	}

	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const xml = XMLBuilder.create('mosReqSearchableSchema')
		xml.att('username', this.options.username)

		return xml
	}
}
