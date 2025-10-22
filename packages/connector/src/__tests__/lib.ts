/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { IMOSAck, MosConnection, MosDevice, IMOSROAck, IProfiles, getMosTypes } from '../index.js'

import { SocketMock } from '../__mocks__/socket.js'
import { IServerMock, ServerMock } from '../__mocks__/server.js'
// @ts-ignore imports are unused
import { Socket, Server } from 'net'
import { xml2js } from 'xml-js'

import * as iconv from 'iconv-lite'
import { NCSServerConnection } from '../connection/NCSServerConnection.js'
import { expect, vitest } from 'vitest'
iconv.encodingExists('utf16-be')

// breaks net.Server, disabled for now
vitest.mock('net')

export function setupMocks(): void {
	// Mock tcp connection
	// @ts-ignore Replace Socket with the mocked varaint:
	// eslint-disable-next-line no-import-assign
	Socket = SocketMock
	// @ts-ignore Replace Server with the mocked varaint:
	// eslint-disable-next-line no-import-assign
	Server = ServerMock

	/* eslint-enable @typescript-eslint/no-unused-vars */
}

export function clearMocks(): void {
	SocketMock.mockClear()
}

export function getMessageId(str: string): string {
	const m = str.match(/<messageID>([^<]+)<\/messageID>/)
	const messageID = m ? m[1] : undefined
	if (!messageID) throw new Error(`No messageID in "${str}"`)

	return messageID
}

const setTimeoutOrg = setTimeout
export async function delay(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeoutOrg(resolve, ms)
	})
}
export async function initMosConnection(
	mos: MosConnection,
	testOptions?: {
		openMediaHotStandby?: boolean
	}
): Promise<void> {
	mos.on('error', (err) => {
		if (!(err + '').match(/heartbeat/i)) {
			console.error(err)
		}
	})
	mos.on('warning', (warning) => {
		if (testOptions?.openMediaHotStandby && `${warning}`.match(/Socket should reconnect/)) {
			// Ignore this when testing hot-standby
			return
		}
		console.error('Warning emitted from MosConnection', warning)
	})
	await mos.init()
}

export async function getMosConnection(
	profiles: IProfiles,
	strict: boolean,
	testOptions?: {
		openMediaHotStandby?: boolean
	}
): Promise<MosConnection> {
	ServerMock.mockClear()

	const mos = new MosConnection({
		mosID: 'our.mos.id',
		acceptsConnections: true,
		profiles: profiles,
		strict: strict,
		debug: false,
	})
	await initMosConnection(mos, testOptions)

	expect(ServerMock.instances).toHaveLength(3)

	return Promise.resolve(mos)
}
export const DEFAULT_TIMEOUT = 600
export async function getMosDevice(mos: MosConnection): Promise<MosDevice> {
	SocketMock.mockClear()

	const device = await mos.connect({
		primary: {
			id: 'their.mos.id',
			host: '127.0.0.1',
			timeout: DEFAULT_TIMEOUT,
		},
	})

	for (const i of SocketMock.instances) {
		i.mockEmitConnected()
	}

	await delay(320) // to allow for async timers & events to triggered

	return Promise.resolve(device)
}
let fakeIncomingMessageMessageId = 1632
export async function fakeIncomingMessage(
	socketMockLower: SocketMock,
	message: string,
	ourMosId?: string,
	theirMosId?: string
): Promise<number> {
	const m = makeFakeIncomingMessage(message, ourMosId, theirMosId)
	sendFakeIncomingMessage(socketMockLower, m.message)

	return Promise.resolve(m.messageId)
}
export function makeFakeIncomingMessage(
	message: string,
	ourMosId?: string,
	theirMosId?: string
): { messageId: number; message: string } {
	fakeIncomingMessageMessageId++
	return {
		message: getXMLReply(fakeIncomingMessageMessageId, message, ourMosId, theirMosId),
		messageId: fakeIncomingMessageMessageId,
	}
}
export function sendFakeIncomingMessage(socketMockLower: SocketMock, message: string): void {
	socketMockLower.mockReceiveMessage(encode(message))
}
export function getXMLReply(
	messageId: string | number,
	content: string,
	ourMosId?: string,
	theirMosId?: string
): string {
	//add field only if messageId exist
	if (messageId) messageId = '<messageID>' + messageId + '</messageID>'
	return (
		'<mos>' +
		'<mosID>' +
		(ourMosId ?? 'our.mos.id') +
		'</mosID>' +
		'<ncsID>' +
		(theirMosId ?? 'their.mos.id') +
		'</ncsID>' +
		messageId +
		content +
		'</mos>\r\n'
	)
}
export function decode(data: Buffer): string {
	return iconv.decode(data, 'utf16-be')
}
export function encode(str: string): Buffer {
	return iconv.encode(str, 'utf16-be')
}
export async function checkReplyToServer(
	socket: SocketMock,
	messageId: number,
	...replyStrings: string[]
): Promise<void> {
	// check reply to server:
	await socket.mockWaitForSentMessages()

	expect(socket.mockSentMessage).toHaveBeenCalledTimes(1)
	// @ts-ignore mock
	const reply = decode(socket.mockSentMessage.mock.calls[0][0])
	expect(reply).toContain('<messageID>' + messageId + '</messageID>')
	for (const replyString of Array.isArray(replyStrings) ? replyStrings : [replyStrings]) {
		expect(reply).toContain(replyString)
	}
	expect(reply).toMatchSnapshot(reply)
}
export async function getReplyToServer(socket: SocketMock, messageId: number): Promise<any> {
	// check reply to server:
	await socket.mockWaitForSentMessages()

	expect(socket.mockSentMessage).toHaveBeenCalledTimes(1)
	// @ts-ignore mock
	const reply = decode(socket.mockSentMessage.mock.calls[0][0])
	expect(reply).toContain('<messageID>' + messageId + '</messageID>')
	return xml2js(reply, { compact: true, nativeType: true, trim: true })
}
export function checkMessageSnapshot(msg: string): void {
	expect(
		msg
			.replace(/<messageID>\d+<\/messageID>/, '<messageID>xx</messageID>')
			.replace(/<time>[^<>]+<\/time>/, '<time>xx</time>')
	).toMatchSnapshot()
}
export function checkAckSnapshot(ack: IMOSAck | IMOSROAck): void {
	const ack2: any = {
		...ack,
	}
	if (ack2.mos) {
		ack2.mos = {
			...ack2.mos,
			messageID: 999,
		}
	}
	expect(ack2).toMatchSnapshot()
}
export function doBeforeAll(): {
	socketMockLower: SocketMock
	socketMockUpper: SocketMock
	socketMockQuery: SocketMock
	serverMockLower: IServerMock
	serverMockUpper: IServerMock
	serverMockQuery: IServerMock
	serverSocketMockLower: SocketMock
	serverSocketMockUpper: SocketMock
	serverSocketMockQuery: SocketMock
} {
	const socketMockLower = SocketMock.instances.find((s) => s.connectedPort === 10540) as SocketMock
	const socketMockUpper = SocketMock.instances.find((s) => s.connectedPort === 10541) as SocketMock
	const socketMockQuery = SocketMock.instances.find((s) => s.connectedPort === 10542) as SocketMock

	expect(socketMockLower).toBeTruthy()
	expect(socketMockUpper).toBeTruthy()
	expect(socketMockQuery).toBeTruthy()

	expect(ServerMock.instances).toHaveLength(3)

	const serverMockLower = ServerMock.instances[0]
	const serverMockUpper = ServerMock.instances[2]
	const serverMockQuery = ServerMock.instances[1]
	expect(serverMockLower).toBeTruthy()
	expect(serverMockUpper).toBeTruthy()
	expect(serverMockQuery).toBeTruthy()

	// Pretend a server connects to us:
	const serverSocketMockLower = serverMockLower.mockNewConnection()
	const serverSocketMockUpper = serverMockUpper.mockNewConnection()
	const serverSocketMockQuery = serverMockQuery.mockNewConnection()

	socketMockLower.name = 'lower'
	socketMockUpper.name = 'upper'
	socketMockQuery.name = 'query'

	serverSocketMockLower.name = 'serverLower'
	serverSocketMockUpper.name = 'serverUpper'
	serverSocketMockQuery.name = 'serverQuery'

	socketMockLower.mockEmitConnected()
	socketMockUpper.mockEmitConnected()
	socketMockQuery.mockEmitConnected()

	return {
		socketMockLower,
		socketMockUpper,
		socketMockQuery,
		serverMockLower,
		serverMockUpper,
		serverMockQuery,
		serverSocketMockLower,
		serverSocketMockUpper,
		serverSocketMockQuery,
	}
}

export function fixSnapshot(data: unknown): any {
	return fixSnapshotInner(data)[1]
}
export const mosTypes = getMosTypes(true)
function fixSnapshotInner(data: any): [boolean, any] {
	let changed = false

	if (!data) {
		return [false, data]
	} else if (Array.isArray(data)) {
		for (let i = 0; i < data.length; i++) {
			const f = fixSnapshotInner(data[i])
			if (f[0]) {
				changed = true
				data[i] = f[1]
			}
		}
	} else if (typeof data === 'object') {
		if (mosTypes.mosTime.is(data)) {
			if (mosTypes.mosTime.valueOf(data) > 1609459200000) {
				// 2021-01-01 00:00:00+00:00
				// data.setTime(1609459200000)
				return [true, mosTypes.mosTime.create(1609459200000)]
			}
			// changed = true
		} else {
			for (const [key, value] of Object.entries<any>(data)) {
				const f = fixSnapshotInner(value)
				if (f[0]) {
					changed = true
					data[key] = f[1]
				}
			}
		}
	} else {
		// nothing
	}
	return [changed, data]
}

export function getConnectionsFromDevice(device: MosDevice): {
	primary: NCSServerConnection | null
	secondary: NCSServerConnection | null
	current: NCSServerConnection | null
} {
	return {
		// @ts-expect-error private property
		primary: device._primaryConnection,
		// @ts-expect-error private property
		secondary: device._secondaryConnection,
		// @ts-expect-error private property
		current: device._currentConnection,
	}
}
