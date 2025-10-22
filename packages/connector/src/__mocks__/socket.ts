/* eslint-disable @typescript-eslint/unbound-method */
import { EventEmitter } from 'events'
import { Socket } from 'net'

import * as iconv from 'iconv-lite'
import { getMessageId } from '../__tests__/lib.js'
import { getMosTypes } from '@mos-connection/model'
import { Mocked, vitest } from 'vitest'
iconv.encodingExists('utf16-be')

const mosTypes = getMosTypes(true)

// Mock the Socket class in 'net':
const setTimeoutOrg = setTimeout

const instances: Array<ISocketMock> = []

export class SocketMock extends EventEmitter implements Socket {
	// Mock implementation:
	bufferSize = 0
	remoteAddress = ''
	remoteFamily = ''
	remotePort = 0
	localAddress = ''
	localPort = 0
	bytesRead = 0
	bytesWritten = 0
	connecting = false
	destroyed = false
	writable = false
	readable = false

	readonly readableEncoding: BufferEncoding | null = null
	readonly readableEnded: boolean = false
	readonly readableFlowing: boolean | null = null

	readonly writableEnded: boolean = false
	readonly writableFinished: boolean = false
	readonly writableHighWaterMark: number = 0
	readonly writableLength: number = 0
	readonly writableObjectMode: boolean = false

	readonly readableHighWaterMark: number = 0
	readonly readableLength: number = 0
	readonly readableObjectMode: boolean = false

	public name = ''
	public connectedPort = 0
	public connectedHost = ''

	// [Symbol.asyncIterator](): AsyncIterableIterator<any>

	private _responses: Array<ReplyTypes> = []
	private _autoReplyToHeartBeat = true
	public mockConnectCount = 0

	constructor() {
		super()

		// @ts-expect-error this is comparable with ISocketMock
		instances.push(this)

		// Wrap member functions in mocks:
		this.connect = vitest.fn(this.connect)
		this.setEncoding = vitest.fn(this.setEncoding)
		this.destroy = vitest.fn(this.destroy)
		this.pause = vitest.fn(this.pause)
		this.resume = vitest.fn(this.resume)
		this.setTimeout = vitest.fn(this.setTimeout)
		this.setNoDelay = vitest.fn(this.setNoDelay)
		this.setKeepAlive = vitest.fn(this.setKeepAlive)
		this.address = vitest.fn(this.address)
		this.unref = vitest.fn(this.unref)
		this.ref = vitest.fn(this.ref)
		this.end = vitest.fn(this.end)
		this._write = vitest.fn(this._write)
		this.setDefaultEncoding = vitest.fn(this.setDefaultEncoding)
		this._read = vitest.fn(this._read)
		this.read = vitest.fn(this.read)
		this.isPaused = vitest.fn(this.isPaused)
		this.pipe = vitest.fn(this.pipe) as any
		this.unpipe = vitest.fn(this.unpipe)
		this.unshift = vitest.fn(this.unshift)
		this.wrap = vitest.fn(this.wrap)
		this.push = vitest.fn(this.push)
		this._destroy = vitest.fn(this._destroy)
		this._final = vitest.fn(this._final)
		this.cork = vitest.fn(this.cork)
		this.uncork = vitest.fn(this.uncork)

		this.mockSentMessage0 = vitest.fn(this.mockSentMessage0)
		this.mockSentMessage = vitest.fn(this.mockSentMessage)
	}
	static mockClear(): void {
		instances.splice(0, 9999)
	}
	static get instances(): ISocketMock[] {
		return instances
	}

	write(data: unknown, encoding: unknown): boolean {
		this.mockSentMessage0(data, encoding as any)
		return true
	}
	// @ts-expect-error mock
	connect(port: number, host: string): this {
		this.mockConnectCount++
		this.connectedPort = port
		this.connectedHost = host

		return this
	}
	setEncoding(): this {
		return this
	}
	destroy(_error?: Error): this {
		this.destroyed = true
		this.emit('close')
		/* nothing */
		return this
	}
	pause(): this {
		return this
	}
	resume(): this {
		return this
	}
	setTimeout(timeout: number, callback?: (...args: any[]) => void): this {
		if (callback) setTimeout(callback, timeout)
		return this
	}
	setNoDelay(_noDelay?: boolean): this {
		return this
	}
	setKeepAlive(_enable?: boolean, _initialDelay?: number): this {
		return this
	}
	address(): { port: number; family: string; address: string } {
		return { port: 100, family: 'localhost', address: '127.0.0.1' }
	}
	unref(): this {
		return this
	}
	ref(): this {
		return this
	}
	end(): this {
		return this
	}
	_write(_chunk: unknown, _encoding: string, callback: () => void): void {
		callback() /* nothing */
	}
	setDefaultEncoding(_encoding: string): this {
		return this
	}
	_read(_size: number): void {
		// nothing
	}
	read(_size?: number): void {
		// nothing
	}
	isPaused(): boolean {
		return false
	}
	pipe<T extends NodeJS.WritableStream>(destination: T, _options?: { end?: boolean }): T {
		return destination
	}
	unpipe(_destination: NodeJS.WritableStream): this {
		return this
	}
	unshift(_chunk: unknown): void {
		// nothing
	}
	wrap(_oldStream: NodeJS.ReadableStream): this {
		return this
	}
	push(_chunk: unknown, _encoding?: string): boolean {
		return true
	}
	_destroy(): void {
		/* nothing */
	}
	_final(): void {
		/* nothing */
	}
	cork(): void {
		/* nothing */
	}
	uncork(): void {
		/* nothing */
	}

	// ------------------------------------------------------------------------
	// Mock methods:
	mockEmitConnected(): void {
		if (this.connectedPort === 10542) {
			// don't reply on heartbeats on query port
			this._autoReplyToHeartBeat = false
		}

		this.emit('connect')
	}
	mockEmitClose(): void {
		this.emit('close')
	}

	mockSentMessage0(data: unknown, encoding: string): void {
		if (this._autoReplyToHeartBeat) {
			const str: string = typeof data === 'string' ? data : this.decode(data as any)

			if (/<heartbeat>/.exec(str)) {
				try {
					const mosID = (str.match(/<mosID>([^<]+)<\/mosID>/) || [])[1]
					const ncsID = (str.match(/<ncsID>([^<]+)<\/ncsID>/) || [])[1]
					const messageId = getMessageId(str)

					const repl = `<mos>
<mosID>${mosID}</mosID>
<ncsID>${ncsID}</ncsID>
<messageID>${messageId}</messageID>\
  <heartbeat>
    <time>${mosTypes.mosTime.stringify(mosTypes.mosTime.create(Date.now()))}</time>
  </heartbeat>
</mos>\r\n`
					this.mockReceiveMessage(this.encode(repl))
				} catch (e) {
					// eslint-disable-next-line no-console
					console.error('mockReply', str)
					throw e
				}
				return
			}
		}
		this.mockSentMessage(data, encoding)
	}
	mockSentMessage(data: unknown, _encoding: string): void {
		const cb = this._responses.shift()
		if (cb) {
			// send reply:
			setTimeoutOrg(() => {
				Promise.resolve(typeof cb === 'function' ? cb(data) : cb)
					.then((msg) => {
						if (msg) {
							if (Array.isArray(msg)) {
								for (const m of msg) {
									this.mockReceiveMessage(m)
								}
							} else {
								this.mockReceiveMessage(msg)
							}
						}
					})
					// eslint-disable-next-line no-console
					.catch(console.error)
			}, 1)
		}
	}
	mockReceiveMessage(msg: string | Buffer): void {
		this.emit('data', msg)
	}
	mockAddReply(cb: ReplyTypes): void {
		this._responses.push(cb)
	}
	mockClear(): void {
		void this._responses.splice(0, 9999)
		// @ts-expect-error mock hack
		this.mockSentMessage0['mockClear']()
		// @ts-expect-error mock hack
		this.mockSentMessage['mockClear']()
	}
	async mockWaitForSentMessages(): Promise<void> {
		return new Promise<void>((resolve) => {
			const check = () => {
				if (this._responses.length === 0) {
					resolve()
				} else {
					setTimeoutOrg(() => {
						check()
					}, 1)
				}
			}
			check()
		})
	}

	decode(data: Buffer): string {
		return iconv.decode(data, 'utf16-be')
	}
	encode(str: string): Buffer {
		return iconv.encode(str, 'utf16-be')
	}
	setAutoReplyToHeartBeat(autoReplyToHeartBeat: boolean): void {
		this._autoReplyToHeartBeat = autoReplyToHeartBeat
	}
	get autoReplyToHeartBeat(): boolean {
		return this._autoReplyToHeartBeat
	}
}

type SimpleTypes = string | string[] | false | Buffer | Buffer[]

type ReplyTypes =
	| SimpleTypes
	| ((data: any) => SimpleTypes)
	| Promise<SimpleTypes>
	| ((data: any) => Promise<SimpleTypes>)

export type ISocketMock = Mocked<SocketMock>
