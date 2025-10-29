import { Server, Socket } from 'net'
import { EventEmitter } from 'eventemitter3'
import { IncomingConnectionType, SocketServerEvent } from './socketConnection.js'

export interface MosSocketServerEvents {
	[SocketServerEvent.CLIENT_CONNECTED]: (options: { socket: Socket; portDescription: IncomingConnectionType }) => void
	[SocketServerEvent.ERROR]: (err: Error) => void
	[SocketServerEvent.CLOSE]: () => void
}
export class MosSocketServer extends EventEmitter<MosSocketServerEvents> {
	private _port: number
	private _portDescription: IncomingConnectionType
	private _socketServer: Server
	private _debug: boolean
	private _connectedSockets: Array<Socket> = []

	/** */
	constructor(port: number, description: IncomingConnectionType, debug: boolean) {
		super()
		this._port = port
		this._portDescription = description
		this._debug = debug ?? false

		this._socketServer = new Server()
		this._socketServer.on('connection', (socket: Socket) => this._onClientConnection(socket))
		this._socketServer.on('close', () => this._onServerClose())
		this._socketServer.on('error', (error) => this._onServerError(error))
	}
	async dispose(sockets: Socket[]): Promise<void> {
		const closePromises: Promise<void>[] = []

		// close clients
		sockets.forEach((socket) => {
			closePromises.push(
				new Promise((resolve) => {
					socket.on('close', resolve)
					socket.end()
					socket.destroy()
				})
			)
		})

		// close server
		closePromises.push(
			new Promise((resolve) => {
				// this._socketServer.on('close', resolve)
				this._socketServer.close(() => {
					resolve()
				})
			})
		)
		// close any server connections:
		this._connectedSockets.forEach((socket: Socket) => {
			socket.destroy()
		})
		await Promise.all(closePromises)
	}

	/** */
	async listen(): Promise<void> {
		this.debugTrace('listen', this._portDescription, this._port)
		return new Promise<void>((resolve, reject) => {
			try {
				this.debugTrace('inside promise', this._portDescription, this._port)
				// already listening
				if (this._socketServer.listening) {
					this.debugTrace('already listening', this._portDescription, this._port)
					resolve()
					return
				}

				// Listens and handles error and events
				this._socketServer.once('error', (e) => {
					reject(e)
				})
				this._socketServer.once('close', () => {
					reject(Error('Socket was closed'))
				})
				this._socketServer.once('listening', () => {
					resolve()

					this._socketServer.on('error', (e) => {
						this.emit(SocketServerEvent.ERROR, e)
					})
					this._socketServer.on('close', () => {
						this.emit(SocketServerEvent.CLOSE)
					})
				})

				this._socketServer.listen(this._port)
			} catch (e) {
				reject(e instanceof Error ? e : new Error(`${e}`))
			}
		})
	}
	public setDebug(debug: boolean): void {
		this._debug = debug
	}
	get port(): number {
		return this._port
	}
	get portDescription(): IncomingConnectionType {
		return this._portDescription
	}

	/** */
	private _onClientConnection(socket: Socket) {
		this._connectedSockets.push(socket)
		socket.on('close', () => {
			const i = this._connectedSockets.indexOf(socket)
			if (i !== -1) {
				this._connectedSockets.splice(i, 1)
			}
		})
		this.emit(SocketServerEvent.CLIENT_CONNECTED, {
			socket: socket,
			portDescription: this._portDescription,
		})
	}

	/** */
	private _onServerError(error: Error) {
		// @todo: implement
		this.debugTrace('Server error:', error)
	}

	/** */
	private _onServerClose() {
		// @todo: implement
		this.debugTrace(`Server closed: on port ${this._port}`)
	}
	private debugTrace(...strs: any[]) {
		// eslint-disable-next-line no-console
		if (this._debug) console.log(...strs)
	}
}
