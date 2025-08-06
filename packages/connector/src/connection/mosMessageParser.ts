import { EventEmitter } from 'eventemitter3'
import { MosModel, xml2js } from '@mos-connection/helper'

export interface MosMessageParserEvents {
	message: (parsedData: ParsedMosMessage, messageString: string) => void
}
export class MosMessageParser extends EventEmitter<MosMessageParserEvents> {
	private dataChunks = ''

	public debug = false

	constructor(private description: string) {
		super()
	}

	public parseMessage(messageString: string): void {
		this.debugTrace(`Socket got data (${this.description}): "${messageString}"`)

		this.dataChunks += messageString

		// parse as many messages as possible from the data
		while (this.dataChunks.length > 0) {
			// whitespace before a mos message is junk
			this.dataChunks = this.dataChunks.trimStart()

			const lengthBefore = this.dataChunks.length
			this._tryParseData()
			const lengthAfter = this.dataChunks.length

			if (lengthAfter === lengthBefore) {
				// Nothing was plucked, so abort
				break
			}
		}
	}
	private _tryParseData() {
		const startMatch = '<mos>' // <mos>
		const endMatch = '</mos>' // </mos>

		let messageString: string | undefined

		const startIndexes = this.indexesOf(this.dataChunks, startMatch)
		if (startIndexes.length === 0) {
			// No start tag, so looks like we have jibberish
			this.dataChunks = ''
		} else {
			const firstStartIndex = startIndexes[0]
			if (firstStartIndex > 0) {
				const junkStr = this.dataChunks.slice(0, firstStartIndex)
				this.debugTrace(`${this.description} Discarding message fragment: "${junkStr}"`)

				// trim off anything before <mos>, as we'll never be able to parse that anyway.
				this.dataChunks = this.dataChunks.slice(firstStartIndex)
			}

			const endIndexes = this.indexesOf(this.dataChunks, endMatch)
			if (endIndexes.length > 0) {
				// We have an end tag too

				/** null = message is not complete */
				let useEndIndex: number | null = null

				if (startIndexes.length === 1 && endIndexes.length === 1) {
					// fast-path:
					useEndIndex = endIndexes[0]
				} else {
					const tags: { start: boolean; index: number }[] = [
						...startIndexes.map((index) => ({
							start: true,
							index,
						})),
						...endIndexes.map((index) => ({
							start: false,
							index,
						})),
					].sort((a, b) => a.index - b.index)

					// Figure out where in the message the end tag closes the start tag:
					let tagBalance = 0
					for (const tag of tags) {
						if (tag.start) tagBalance++
						else tagBalance--

						if (tagBalance < 0) {
							// Hmm, something is wrong, there should never be more end tags than start tags

							// trim off anything before this end tag, we'll never be able to parse that anyway.
							this.dataChunks = this.dataChunks.slice(tag.index + endMatch.length)
							break
						} else if (tagBalance === 0) {
							// We have a complete message, so pluck it out
							useEndIndex = tag.index

							break
						}
					}
				}

				if (useEndIndex !== null) {
					const endIndex2 = useEndIndex + endMatch.length
					messageString = this.dataChunks.slice(0, endIndex2)
					this.dataChunks = this.dataChunks.slice(endIndex2)
				}
			}
		}
		let parsed: {
			data: ParsedMosMessage
			messageString: string
		} | null = null

		try {
			if (messageString) {
				const data = xml2js(messageString) as any as ParsedMosMessage // , { compact: true, trim: true, nativeType: true })

				if (typeof data.mos !== 'object') throw Error(`Bad mos message, <mos> missing`)
				if (typeof data.mos.mosID !== 'string') throw Error(`Bad mos message, <mosID> missing`)
				if (typeof data.mos.ncsID !== 'string') throw Error(`Bad mos message, <ncsID> missing`)
				if (data.mos.messageID && typeof data.mos.messageID !== 'string')
					throw Error(`Bad mos message, <messageID> missing`)

				parsed = {
					data: data,
					messageString,
				}
			}
		} catch (err) {
			// eslint-disable-next-line no-console
			console.log('dataChunks-------------\n' + this.dataChunks)
			// eslint-disable-next-line no-console
			console.log('messageString---------\n' + messageString)
			// this.emit('error', e)

			throw err
		}
		if (parsed) {
			this.emit('message', parsed.data, parsed.messageString)
		}
	}
	private debugTrace(str: string) {
		if (this.debug) {
			// Suppress console spam:
			if (!/<heartbeat>/.exec(`${str}`)) {
				// eslint-disable-next-line no-console
				console.log(str)
			}
		}
	}
	/** Returns a list of indexes for the occurences of searchString in str */
	private indexesOf(str: string, searchString: string): number[] {
		if (!searchString.length) throw new Error('searchString cannot be empty')
		const indexes: number[] = []

		let prevIndex = 0
		for (let i = 0; i < str.length; i++) {
			// ^ Just to avoid an infinite loop

			const index = str.indexOf(searchString, prevIndex)
			if (index === -1) break
			indexes.push(index)
			prevIndex = index + searchString.length
		}
		return indexes
	}
}

/** Definition of an incoming MOS Message */
export interface ParsedMosMessage {
	mos: {
		ncsID: string
		mosID: string
		messageID?: string // Note: messageID is optional for some messages in older versions of the MOS Protocol

		[key: string]: MosModel.AnyXMLValue
	}
}
