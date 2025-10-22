import { getMosTypes, MosTypes } from '@mos-connection/model'
import * as XMLBuilder from 'xmlbuilder'
import { addTextElementInternal } from '../utils/Utils.js'

export type PortType = 'upper' | 'lower' | 'query'
export abstract class MosMessage {
	private static MAX_MESSAGE_ID = Math.pow(2, 31) - 2
	private static _staticMessageID = 1

	public mosID: string | undefined = undefined
	public ncsID: string | undefined = undefined

	protected readonly mosTypes: MosTypes

	constructor(
		public port: PortType,
		protected readonly strict: boolean
	) {
		this.mosTypes = getMosTypes(strict)
	}

	private _messageID = 0

	private static getNewMessageID(): number {
		// increments and returns a signed 32-bit int counting from 1, resetting to 1 when wrapping
		MosMessage._staticMessageID++
		if (MosMessage._staticMessageID >= MosMessage.MAX_MESSAGE_ID) MosMessage._staticMessageID = 1
		return MosMessage._staticMessageID
	}

	/** */
	prepare(messageID?: number): void {
		if (!this.mosID) throw new Error(`Can't prepare message: mosID missing`)
		if (!this.ncsID) throw new Error(`Can't prepare message: ncsID missing`)
		this._messageID = messageID ?? MosMessage.getNewMessageID()
	}

	/** */
	get messageID(): number {
		return this._messageID
	}

	/** */
	toString(): string {
		const xml = XMLBuilder.create('mos', undefined, undefined, {
			headless: true,
		})
		addTextElementInternal(xml, 'ncsID', this.ncsID, undefined, this.strict)
		addTextElementInternal(xml, 'mosID', this.mosID, undefined, this.strict)
		addTextElementInternal(xml, 'messageID', this.messageID, undefined, this.strict)
		xml.importDocument(this.messageXMLBlocks)

		return xml.end({ pretty: true })
	}

	/** */
	protected abstract get messageXMLBlocks(): XMLBuilder.XMLElement

	/**  */
}
