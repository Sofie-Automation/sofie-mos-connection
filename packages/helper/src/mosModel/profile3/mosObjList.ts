import { IMOSObjectList } from '@mos-connection/model'
import { MosMessage } from '../MosMessage.js'
import * as XMLBuilder from 'xmlbuilder'
import { XMLMosObjects } from '../profile1/xmlConversion.js'
import { addTextElementInternal } from '../../utils/Utils.js'

export class MosObjList extends MosMessage {
	private options: IMOSObjectList

	constructor(options: IMOSObjectList, strict: boolean) {
		super('upper', strict)
		this.options = options
	}

	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const xmlMosObjList = XMLBuilder.create('mosObjList')
		xmlMosObjList.att('username', this.options.username)

		addTextElementInternal(xmlMosObjList, 'queryID', this.options.queryID, undefined, this.strict)
		addTextElementInternal(xmlMosObjList, 'listReturnStart', this.options.listReturnStart, undefined, this.strict)
		addTextElementInternal(xmlMosObjList, 'listReturnEnd', this.options.listReturnEnd, undefined, this.strict)
		addTextElementInternal(xmlMosObjList, 'listReturnTotal', this.options.listReturnTotal, undefined, this.strict)
		if (this.options.listReturnStatus)
			addTextElementInternal(
				xmlMosObjList,
				'listReturnStatus',
				this.options.listReturnStatus,
				undefined,
				this.strict
			)

		if (this.options.list) {
			const xmlList = XMLBuilder.create('list')
			XMLMosObjects.toXML(xmlList, this.options.list, this.strict)

			xmlMosObjList.importDocument(xmlList)
		}

		return xmlMosObjList
	}
}
