import { ConnectionType } from './socketConnection.js'
import { MosSocketClient, CallBackFunction, QueueMessage } from '../connection/mosSocketClient.js'
import { MosModel } from '@mos-connection/helper'
import { EventEmitter } from 'eventemitter3'
import { ParsedMosMessage } from './mosMessageParser.js'

export const DEFAULT_COMMAND_TIMEOUT = 5000

export interface ClientDescription {
	useHeartbeats: boolean
	heartbeatConnected: boolean
	client: MosSocketClient
	clientDescription: MosModel.PortType
}

export interface INCSServerConnection {
	on(event: 'rawMessage', listener: (type: string, message: string) => void): this
}

export interface HandedOverQueue {
	messages: QueueMessage[]
	callbacks: { [messageId: string]: CallBackFunction }
}
export interface NCSServerConnectionEvents {
	rawMessage: (...args: any[]) => void
	warning: (str: string) => void
	error: (err: Error) => void
	info: (str: string) => void
	connectionChanged: () => void
}

/** Handles connections to a NCS (server) */
export class NCSServerConnection extends EventEmitter<NCSServerConnectionEvents> implements INCSServerConnection {
	private _connected: boolean
	// private _lastSeen: number
	private _id: string
	private _host: string
	private _timeout: number
	private _mosID: string
	private _debug: boolean
	private _strict = false
	private _disposed = false

	private _clients: { [clientID: string]: ClientDescription } = {}

	private _emittedConnected = false

	private _heartBeatsTimer?: NodeJS.Timeout
	private _heartBeatsInterval: number
	private _isOpenMediaHotStandby = false

	constructor(
		id: string,
		host: string,
		mosID: string,
		timeout: number | undefined,
		heartbeatsInterval: number | undefined,
		debug: boolean,
		strict: boolean,
		isOpenMediaHotStandby: boolean
	) {
		super()
		this._id = id
		this._host = host
		this._timeout = timeout ?? DEFAULT_COMMAND_TIMEOUT
		this._heartBeatsInterval = Math.max(heartbeatsInterval ?? 0, this._timeout)
		this._mosID = mosID
		this._connected = false
		this._debug = debug ?? false
		this._strict = strict ?? false
		this._isOpenMediaHotStandby = isOpenMediaHotStandby
	}
	get timeout(): number {
		return this._timeout
	}
	/** Create a MOS client, which talks to  */
	createClient(clientID: string, port: number, clientDescription: ConnectionType, useHeartbeats: boolean): void {
		const client = new MosSocketClient(
			this._host,
			port,
			clientDescription,
			this._timeout,
			this._debug,
			this._strict
		)
		this.debugTrace('registerOutgoingConnection', clientID)

		this._clients[clientID] = {
			useHeartbeats: useHeartbeats,
			heartbeatConnected: false,
			client: client,
			clientDescription: clientDescription,
		}
		client.on('rawMessage', (type: string, message: string) => {
			this.emit('rawMessage', type, message)
		})
		client.on('warning', (str: string) => {
			this.emit('warning', 'MosSocketClient: ' + str)
		})
		client.on('error', (err: Error) => {
			err.message = 'MosSocketClient: ' + err.message
			this.emit('error', err)
		})
	}

	/** */
	removeClient(clientID: string): void {
		this._clients[clientID].client.dispose()
		delete this._clients[clientID]
	}

	/** */
	disableHeartbeats(): void {
		for (const i in this._clients) {
			this._clients[i].useHeartbeats = false
		}
	}

	/** */
	enableHeartbeats(): void {
		for (const i in this._clients) {
			this._clients[i].useHeartbeats = true
		}
	}

	/** */
	isHearbeatEnabled(): boolean {
		for (const i in this._clients) {
			if (this._clients[i].useHeartbeats) return true
		}
		return false
	}

	setAutoReconnectInterval(interval: number): void {
		for (const i in this._clients) {
			this._clients[i].client.autoReconnectInterval = interval
		}
	}

	connect(): void {
		for (const i in this._clients) {
			// Connect client
			this.emit(
				'info',
				`Connect client ${i} on ${this._clients[i].clientDescription} on host ${this._host} (${this._clients[i].client.port})`
			)
			this.debugTrace(
				`Connect client ${i} on ${this._clients[i].clientDescription} on host ${this._host} (${this._clients[i].client.port})`
			)
			this._clients[i].client.connect()
		}
		this._connected = true

		// Send heartbeat and check connection
		this._sendHeartBeats()

		// Emit to _callbackOnConnectionChange
		// if (this._callbackOnConnectionChange) this._callbackOnConnectionChange()
	}

	/**
	 * Sends a mos message.
	 * Returns a Promise which resolves when a MOS reply has been received.
	 */
	async executeCommand(message: MosModel.MosMessage): Promise<ParsedMosMessage> {
		// Fill with clients
		let clients: Array<MosSocketClient>

		// Set mosID and ncsID
		message.mosID = this._mosID
		message.ncsID = this._id

		// Example: Port based on message type
		if (message.port === 'lower') {
			clients = this.lowerPortClients
		} else if (message.port === 'upper') {
			clients = this.upperPortClients
		} else if (message.port === 'query') {
			clients = this.queryPortClients
		} else {
			throw Error(`No "${message.port}" ports found`)
		}
		return new Promise<ParsedMosMessage>((resolve, reject) => {
			if (clients?.length) {
				clients[0].queueCommand(message, (response) => {
					if ('error' in response) {
						reject(response.error instanceof Error ? response.error : new Error(response.error))
					} else {
						resolve(response.reply)
					}
				})
			} else {
				reject(new Error('executeCommand: No clients found for ' + message.port))
			}
		})
	}

	public setDebug(debug: boolean): void {
		this._debug = debug

		Object.keys(this._clients).forEach((clientID) => {
			const cd = this._clients[clientID]
			if (cd) {
				cd.client.setDebug(debug)
			}
		})
	}
	get connected(): boolean {
		return this.getConnectedStatus().connected
	}
	getConnectedStatus(): {
		connected: boolean
		status: string
	} {
		if (!this._connected)
			return {
				connected: false,
				status: 'Not connected',
			}

		// Check if we have any clients at all
		const clientCount = Object.keys(this._clients).length
		if (clientCount === 0) {
			return {
				connected: false,
				status: 'No clients available',
			}
		}

		if (this._isOpenMediaHotStandby) {
			// In OpenMedia Standby mode

			let isConnectedToSomeDevice = false
			for (const client of Object.values<ClientDescription>(this._clients)) {
				if (client.client.isConnected) {
					isConnectedToSomeDevice = true
				}
			}
			if (isConnectedToSomeDevice) {
				return {
					connected: true,
					status: 'Connected',
				}
			} else {
				return {
					connected: false,
					status: 'No heartbeats on any connected client',
				}
			}
		} else {
			// In normal mode

			let notConnectedStatus: string | undefined = undefined
			for (const client of Object.values<ClientDescription>(this._clients)) {
				if (client.useHeartbeats && !client.heartbeatConnected) {
					notConnectedStatus = `No heartbeats on port ${client.clientDescription}`
				}
			}
			if (!notConnectedStatus) {
				return {
					connected: true,
					status: 'Connected',
				}
			} else {
				return {
					connected: false,
					status: notConnectedStatus,
				}
			}
		}
	}

	private _getClients(clientDescription: string): MosSocketClient[] {
		const clients: MosSocketClient[] = []
		for (const i in this._clients) {
			if (this._clients[i].clientDescription === clientDescription) {
				clients.push(this._clients[i].client)
			}
		}

		return clients
	}
	/** */
	get lowerPortClients(): MosSocketClient[] {
		return this._getClients('lower')
	}

	/** */
	get upperPortClients(): MosSocketClient[] {
		return this._getClients('upper')
	}

	/** */
	get queryPortClients(): MosSocketClient[] {
		return this._getClients('query')
	}
	get host(): string {
		return this._host
	}
	get id(): string {
		return this._id
	}

	handOverQueue(otherConnection: NCSServerConnection): void {
		const cmds: { [clientId: string]: HandedOverQueue } = {}
		// this._clients.forEach((client, id) => {
		// 	// cmds[id] = client.client.handOverQueue()
		// })
		this.debugTrace(this.id + ' ' + this.host + ' handOverQueue')

		for (const id in this._clients) {
			cmds[id] = this._clients[id].client.handOverQueue()
		}
		otherConnection.receiveQueue(cmds)
	}
	receiveQueue(queue: { [clientId: string]: HandedOverQueue }): void {
		// @todo: keep order
		// @todo: prevent callback-promise horror...
		for (const clientId of Object.keys(queue)) {
			for (const msg of queue[clientId].messages) {
				this.executeCommand(msg.msg).then(
					(data) => {
						const cb = queue[clientId].callbacks[msg.msg.messageID]
						if (cb) cb({ reply: data })
					},
					(error) => {
						const cb = queue[clientId].callbacks[msg.msg.messageID]
						if (cb) cb({ error })
					}
				)
			}
		}
	}

	async dispose(): Promise<void> {
		this._disposed = true

		for (const key in this._clients) {
			this.removeClient(key)
		}
		if (this._heartBeatsTimer) {
			global.clearTimeout(this._heartBeatsTimer)
			delete this._heartBeatsTimer
		}
		this._connected = false
		this.emit('connectionChanged')
	}

	private _sendHeartBeats(): void {
		if (this._heartBeatsTimer) {
			clearTimeout(this._heartBeatsTimer)
			delete this._heartBeatsTimer
		}
		if (this._disposed) return

		const triggerNextHeartBeat = () => {
			if (this._disposed) return
			this._heartBeatsTimer = global.setTimeout(() => {
				if (!this._disposed) this._sendHeartBeats()
			}, this._heartBeatsInterval)
		}

		Promise.all(
			Object.keys(this._clients).map(async (key) => {
				const client = this._clients[key]

				if (client.useHeartbeats) {
					const heartbeat = new MosModel.HeartBeat(this._clients[key].clientDescription, undefined, true)
					try {
						await this.executeCommand(heartbeat)
						client.heartbeatConnected = true
					} catch (err0) {
						// probably a timeout
						client.heartbeatConnected = false

						const err = err0 instanceof Error ? err0 : new Error(`${err0}`)
						err.message = `Heartbeat error on ${this._clients[key].clientDescription}: ${err.message}`
						this.emit('error', err)
						this.debugTrace(`Heartbeat on ${this._clients[key].clientDescription}: ${err0}`)
					}
				}
			})
		)
			.catch((e) => {
				triggerNextHeartBeat()
				this.emit('error', e)
			})
			.then(() => {
				const connected = this.connected
				if (connected !== this._emittedConnected) {
					this._emittedConnected = connected
					this.emit('connectionChanged')
				}
				triggerNextHeartBeat()
			})
			.catch((e) => {
				this.emit('error', e)
			})
	}
	private debugTrace(...strs: any[]) {
		// eslint-disable-next-line no-console
		if (this._debug) console.log(...strs)
	}
}
