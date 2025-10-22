/** An error that occurred while parsing a reply to a sent mos message */
export class MosReplyError extends Error {
	constructor(
		orgError: unknown,
		public readonly parsedReply: unknown | undefined
	) {
		super('N/A')
		this.name = 'MosReplyError'
		const orgMessage = orgError instanceof Error ? orgError.message : `${orgError}`
		if (orgError instanceof Error) this.stack = orgError.stack
		this.message = `Unable to parse MOS reply: ${orgMessage}`
	}
}
