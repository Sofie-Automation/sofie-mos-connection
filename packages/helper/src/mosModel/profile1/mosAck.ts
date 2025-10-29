import * as XMLBuilder from 'xmlbuilder'
import { MosMessage } from '../MosMessage.js'
import { IMOSAck, IMOSAckStatus, IMOSString128 } from '@mos-connection/model'
import { addTextElementInternal } from '../../utils/Utils.js'

export class MOSAck extends MosMessage implements IMOSAck {
	ID: IMOSString128
	Revision: number // max 999
	Status: IMOSAckStatus
	Description: IMOSString128

	/** */
	constructor(ack: IMOSAck, strict: boolean) {
		super('lower', strict)

		this.ID = ack.ID
		this.Status = ack.Status
		this.Description = ack.Description
		this.Revision = ack.Revision
	}

	/** */
	get messageXMLBlocks(): XMLBuilder.XMLElement {
		const root = XMLBuilder.create('mosAck')

		addTextElementInternal(root, 'objID', this.ID, undefined, this.strict)
		addTextElementInternal(root, 'objRev', this.Revision, undefined, this.strict)
		addTextElementInternal(root, 'status', (IMOSAckStatus as any)[this.Status], undefined, this.strict)
		addTextElementInternal(root, 'statusDescription', this.Description, undefined, this.strict)

		return root
	}
}
