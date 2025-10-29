/* eslint-disable @typescript-eslint/unbound-method */
import { EventEmitter } from 'events'
import { Server } from 'net'
import { SocketMock } from './socket.js'

import * as iconv from 'iconv-lite'
import { Mocked, vitest } from 'vitest'
iconv.encodingExists('utf16-be')

// Mock the Server class in 'net':
const setTimeoutOrg = setTimeout

const instances: Array<IServerMock> = []

export class ServerMock extends EventEmitter implements Server {
	// Mock implementation:

	maxConnections = 0
	connections = 0
	listening = false
	listenToPort = 0

	private _responses: Array<(data: any) => string | Buffer> = []

	constructor() {
		super()

		// @ts-expect-error this is comparable with IServerMock
		instances.push(this)

		this.listen = vitest.fn(this.listen)
		this.close = vitest.fn(this.close)
		this.address = vitest.fn(this.address)
		this.getConnections = vitest.fn(this.getConnections)
		this.ref = vitest.fn(this.ref)
		this.unref = vitest.fn(this.unref)
	}
	static mockClear(): void {
		instances.splice(0, 9999)
	}
	static get instances(): IServerMock[] {
		return instances
	}

	// @ts-expect-error mock hack
	listen(port: number): this {
		this.listenToPort = port
		setTimeoutOrg(() => {
			this.listening = true
			this.emit('listening', {})
		}, 1)
		return this
	}
	close(callback?: () => void): this {
		if (callback) callback()
		setTimeoutOrg(() => {
			this.emit('close')
		}, 1)
		return this
	}
	address(): { port: number; family: string; address: string } {
		return { port: 0, family: 'string', address: 'string' }
	}
	getConnections(cb: (error: Error | null, count: number) => void): this {
		cb(null, 0)
		return this
	}
	ref(): this {
		return this
	}
	unref(): this {
		return this
	}

	// Mock methods:
	mockNewConnection(): SocketMock {
		// "Someone has connected"
		const socket = new SocketMock()
		socket.on('data', (d) => {
			this.emit('data', d)
		})

		this.emit('connection', socket)

		return socket
	}

	mockSentMessage(data: string, _encoding: unknown): void {
		const cb = this._responses.shift()
		if (cb) {
			// send reply:
			let msg

			setTimeoutOrg(() => {
				if (typeof cb === 'string') {
					msg = cb
				} else {
					msg = cb(data)
				}

				this.mockReceiveMessage(msg)
			}, 1)
		}
	}
	mockReceiveMessage(msg: string | Buffer): void {
		this.emit('data', msg)
	}
	mockAddReply(cb: (data: any) => string | Buffer): void {
		this._responses.push(cb)
	}
	mockClear(): void {
		this._responses.splice(0, 9999)
	}
	decode(data: Buffer): string {
		return iconv.decode(data, 'utf16-be')
	}
	encode(str: string): Buffer {
		return iconv.encode(str, 'utf16-be')
	}
}

export type IServerMock = Mocked<ServerMock>
