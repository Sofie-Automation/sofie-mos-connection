/* eslint-disable @typescript-eslint/unbound-method */
import { clearMocks, decode, delay, encode, getMessageId, getXMLReply, initMosConnection, setupMocks } from './lib.js'
import { SocketMock } from '../__mocks__/socket.js'
import { ServerMock } from '../__mocks__/server.js'
import { xmlData, xmlApiData } from '../__mocks__/testData.js'
import { MosConnection, MosDevice, IMOSObject, IMOSConnectionStatus, ConnectionConfig } from '../index.js'
import { describe, test, expect, beforeAll, beforeEach, vitest } from 'vitest'

// @ts-ignore imports are unused
import { Socket } from 'net'

beforeAll(() => {
	setupMocks()
})
beforeEach(() => {
	clearMocks()
})
describe('MosDevice: General', () => {
	test('the Socket mock', async () => {
		const conn = new Socket()

		const onData = vitest.fn()
		const onConnect = vitest.fn()
		const onClose = vitest.fn()
		const onError = vitest.fn()

		conn.on('data', onData)
		conn.on('connect', onConnect)
		conn.on('close', onClose)
		conn.on('error', onError)

		conn.connect('127.0.0.1')

		expect(conn.connect).toHaveBeenCalledTimes(1)

		expect(SocketMock.instances).toHaveLength(1)

		const connMock = SocketMock.instances[0]

		// Simulate us getting som data:
		connMock.mockReceiveMessage(
			'<mos>\
			<mosID>me</mosID>\
			<ncsID>you</ncsID>\
			<messageID>42</messageID>\
			<hello></hello>\
		</mos>\r\n'
		)

		expect(onData).toHaveBeenCalledTimes(1)

		// Send some data:
		conn.write(
			'<mos>\
			<mosID>me</mosID>\
			<ncsID>you</ncsID>\
			<messageID>42</messageID>\
			<hello></hello>\
		</mos>\r\n'
		)

		expect(connMock.mockSentMessage).toHaveBeenCalledTimes(1)
	})
	test('basic initialization', async () => {
		const mos = new MosConnection(
			new ConnectionConfig({
				mosID: 'jestMOS',
				acceptsConnections: false,
				profiles: {
					'0': true,
					'1': true,
				},
			})
		)

		const onError = vitest.fn((e) => console.log(e))
		const onWarning = vitest.fn((e) => console.log(e))
		mos.on('error', onError)
		mos.on('warning', onWarning)

		expect(mos.profiles).toMatchObject({
			'0': true,
			'1': true,
			'2': false,
			'3': false,
			'4': false,
			'5': false,
			'6': false,
			'7': false,
		})

		expect(onError).toHaveBeenCalledTimes(0)
		expect(onWarning).toHaveBeenCalledTimes(0)

		await mos.dispose()
	})
	test('Incoming connections', async () => {
		const mos = new MosConnection({
			mosID: 'jestMOS',
			acceptsConnections: true,
			profiles: {
				'0': true,
				'1': true,
			},
		})
		const onError = vitest.fn((e) => console.log(e))
		const onWarning = vitest.fn((e) => console.log(e))
		mos.on('error', onError)
		mos.on('warning', onWarning)
		expect(mos.acceptsConnections).toBe(true)
		await initMosConnection(mos)
		expect(mos.isListening).toBe(true)
		expect(SocketMock.instances).toHaveLength(0)

		expect(onError).toHaveBeenCalledTimes(0)
		expect(onWarning).toHaveBeenCalledTimes(0)

		// close sockets after test
		await mos.dispose()
	})
	test('MosDevice primary', async () => {
		const mos = new MosConnection({
			mosID: 'jestMOS',
			acceptsConnections: true,
			profiles: {
				'0': true,
				'1': true,
			},
		})
		const onError = vitest.fn((e) => console.log(e))
		const onWarning = vitest.fn((e) => console.log(e))
		mos.on('error', onError)
		mos.on('warning', onWarning)

		expect(mos.acceptsConnections).toBe(true)
		await initMosConnection(mos)
		expect(mos.isListening).toBe(true)

		const mosDevice = await mos.connect({
			primary: {
				id: 'primary',
				host: '192.168.0.1',
			},
		})
		expect(mosDevice).toBeTruthy()
		expect(mosDevice.idPrimary).toEqual('jestMOS_primary')

		expect(SocketMock.instances).toHaveLength(4)
		expect(SocketMock.instances[1].connectedHost).toEqual('192.168.0.1')
		expect(SocketMock.instances[1].connectedPort).toEqual(10540)
		expect(SocketMock.instances[2].connectedHost).toEqual('192.168.0.1')
		expect(SocketMock.instances[2].connectedPort).toEqual(10541)
		expect(SocketMock.instances[3].connectedHost).toEqual('192.168.0.1')
		expect(SocketMock.instances[3].connectedPort).toEqual(10542)

		expect(mosDevice.hasConnection).toEqual(true)
		expect(mosDevice.primaryHost).toEqual('192.168.0.1')
		expect(mosDevice.primaryId).toEqual('primary')
		expect(mosDevice.secondaryHost).toEqual(null)
		expect(mosDevice.secondaryId).toEqual(null)

		// close sockets after test
		await mos.dispose()

		expect(SocketMock.instances).toHaveLength(4)
		expect(SocketMock.instances[1].destroy).toHaveBeenCalledTimes(1)
		expect(SocketMock.instances[2].destroy).toHaveBeenCalledTimes(1)
		expect(SocketMock.instances[3].destroy).toHaveBeenCalledTimes(1)

		expect(onError).toHaveBeenCalledTimes(0)
		expect(onWarning).toHaveBeenCalledTimes(0)

		expect(mosDevice.hasConnection).toEqual(false)
	})
	test('MosDevice secondary', async () => {
		const mos = new MosConnection({
			mosID: 'jestMOS',
			acceptsConnections: true,
			profiles: {
				'0': true,
				'1': true,
			},
		})
		const onError = vitest.fn((e) => {
			if (`${e}`.match(/Sent command timed out/)) return // ignore these
			console.log(e)
		})
		const onWarning = vitest.fn((e) => console.log(e))
		mos.on('error', onError)
		mos.on('warning', onWarning)

		expect(mos.acceptsConnections).toBe(true)
		await initMosConnection(mos)
		expect(mos.isListening).toBe(true)

		const mosDevice = await mos.connect({
			primary: {
				id: 'primary',
				host: '192.168.0.1',
				timeout: 200,
			},
			secondary: {
				id: 'secondary',
				host: '192.168.0.2',
				timeout: 200,
			},
		})
		expect(mosDevice).toBeTruthy()
		expect(mosDevice.idPrimary).toEqual('jestMOS_primary')

		const s = new Promise<void>((resolve) => {
			const status = mosDevice.getConnectionStatus()
			if (status.PrimaryConnected && status.SecondaryConnected) {
				resolve()
			} else {
				mosDevice.onConnectionChange((status) => {
					if (status.PrimaryConnected && status.SecondaryConnected) {
						resolve()
					}
				})
			}
		})

		for (const i of SocketMock.instances) {
			i.mockEmitConnected()
		}

		await s

		expect(SocketMock.instances).toHaveLength(7)
		expect(SocketMock.instances[1].connectedHost).toEqual('192.168.0.1')
		expect(SocketMock.instances[1].connectedPort).toEqual(10540)
		expect(SocketMock.instances[2].connectedHost).toEqual('192.168.0.1')
		expect(SocketMock.instances[2].connectedPort).toEqual(10541)
		expect(SocketMock.instances[3].connectedHost).toEqual('192.168.0.1')
		expect(SocketMock.instances[3].connectedPort).toEqual(10542)

		expect(SocketMock.instances[4].connectedHost).toEqual('192.168.0.2')
		expect(SocketMock.instances[4].connectedPort).toEqual(10540)
		expect(SocketMock.instances[5].connectedHost).toEqual('192.168.0.2')
		expect(SocketMock.instances[5].connectedPort).toEqual(10541)
		expect(SocketMock.instances[6].connectedHost).toEqual('192.168.0.2')
		expect(SocketMock.instances[6].connectedPort).toEqual(10542)

		expect(mosDevice.hasConnection).toEqual(true)
		expect(mosDevice.primaryHost).toEqual('192.168.0.1')
		expect(mosDevice.primaryId).toEqual('primary')
		expect(mosDevice.secondaryHost).toEqual('192.168.0.2')
		expect(mosDevice.secondaryId).toEqual('secondary')

		// Prepare mock server response:
		const mockReply = vitest.fn((data) => {
			const str = decode(data)
			const messageID = getMessageId(str)
			const repl = getXMLReply(messageID, xmlData.mosObj)

			return encode(repl)
		})

		// add reply to secondary server, causes timeout on primary:
		SocketMock.instances[4].mockAddReply(mockReply)
		if (!xmlApiData.mosObj.ID) throw new Error('xmlApiData.mosObj.ID not set')
		let returnedObj: IMOSObject = await mosDevice.sendRequestMOSObject(xmlApiData.mosObj.ID)
		expect(returnedObj).toBeTruthy()

		// add reply to primary server, causes timeout on secondary:
		SocketMock.instances[1].mockAddReply(mockReply)
		returnedObj = await mosDevice.sendRequestMOSObject(xmlApiData.mosObj.ID)
		expect(returnedObj).toBeTruthy()

		expect(onError).toHaveBeenCalledTimes(2)
		expect(onError.mock.calls[0][0] + '').toMatch(/Error before switching connections: Sent command timed out/)
		expect(onError.mock.calls[1][0] + '').toMatch(/Error before switching connections: Sent command timed out/)
		expect(onWarning).toHaveBeenCalledTimes(0)

		await mos.dispose()
	})
	test('init and connectionStatusChanged', async () => {
		SocketMock.mockClear()
		ServerMock.mockClear()

		const mosConnection = new MosConnection(
			new ConnectionConfig({
				mosID: 'jestMOS',
				acceptsConnections: false,
				profiles: {
					'0': true,
					'1': true,
				},
			})
		)
		const onError = vitest.fn((e) => console.log(e))
		const onWarning = vitest.fn((e) => console.log(e))
		mosConnection.on('error', onError)
		mosConnection.on('warning', onWarning)

		await initMosConnection(mosConnection)

		const mosDevice = await mosConnection.connect({
			primary: {
				id: 'mockServer',
				host: '127.0.0.1',
				timeout: 200,
			},
		})
		for (const i of SocketMock.instances) {
			i.mockEmitConnected()
		}
		await delay(800) // to allow for async timers & events to triggered

		expect(mosDevice).toBeTruthy()

		expect(SocketMock.instances).toHaveLength(4)
		const connMocks = SocketMock.instances
		expect(connMocks[1].connect).toHaveBeenCalledTimes(1)
		expect(connMocks[1].connect.mock.calls[0][0]).toEqual(10540)
		expect(connMocks[1].connect.mock.calls[0][1]).toEqual('127.0.0.1')
		expect(connMocks[2].connect).toHaveBeenCalledTimes(1)
		expect(connMocks[2].connect.mock.calls[0][0]).toEqual(10541)
		expect(connMocks[2].connect.mock.calls[0][1]).toEqual('127.0.0.1')
		expect(connMocks[3].connect).toHaveBeenCalledTimes(1)
		expect(connMocks[3].connect.mock.calls[0][0]).toEqual(10542)
		expect(connMocks[3].connect.mock.calls[0][1]).toEqual('127.0.0.1')

		const connectionStatusChanged = vitest.fn()

		mosDevice.onConnectionChange((connectionStatus: IMOSConnectionStatus) => {
			connectionStatusChanged(connectionStatus)
		})

		expect(mosDevice.getConnectionStatus()).toMatchObject({
			PrimaryConnected: true,
			PrimaryStatus: 'Primary: Connected', // if not connected this will contain human-readable error-message
			SecondaryConnected: false,
			// SecondaryStatus: string // if not connected this will contain human-readable error-message
		})

		connectionStatusChanged.mockClear()

		// @todo: add timeout test
		// mock cause timeout

		mosConnection.checkProfileValidness()

		expect(onError).toHaveBeenCalledTimes(0)
		expect(onWarning).toHaveBeenCalledTimes(0)

		await mosConnection.dispose()
	})
	test('buddy failover', async () => {
		const mos = new MosConnection({
			mosID: 'jestMOS',
			acceptsConnections: false,
			profiles: {
				'0': true,
				'1': true,
			},
		})
		const onError = vitest.fn((e) => console.log(e))
		const onWarning = vitest.fn((e) => console.log(e))
		mos.on('error', (e) => {
			// filter out heartbeat errors:
			if (!(e + '').match(/heartbeat.*timed out/i)) onError(e)
		})
		mos.on('warning', onWarning)

		await initMosConnection(mos)
		const mosDevice: MosDevice = await mos.connect({
			primary: {
				id: 'mockServer',
				host: '127.0.0.1',
				timeout: 200,
			},
			secondary: {
				id: 'mockServer',
				host: '127.0.0.2',
				timeout: 200,
			},
		})

		expect(mosDevice).toBeTruthy()

		expect(SocketMock.instances).toHaveLength(7)
		const connMocks = SocketMock.instances
		expect(connMocks[1].connect).toHaveBeenCalledTimes(1)
		expect(connMocks[1].connect.mock.calls[0][0]).toEqual(10540)
		expect(connMocks[1].connect.mock.calls[0][1]).toEqual('127.0.0.1')
		expect(connMocks[2].connect).toHaveBeenCalledTimes(1)
		expect(connMocks[2].connect.mock.calls[0][0]).toEqual(10541)
		expect(connMocks[2].connect.mock.calls[0][1]).toEqual('127.0.0.1')

		const connectionStatusChanged = vitest.fn()

		const errorReported = vitest.fn()
		mos.on('error', errorReported)

		mosDevice.onConnectionChange((connectionStatus: IMOSConnectionStatus) => {
			connectionStatusChanged(connectionStatus)
		})
		for (const i of SocketMock.instances) {
			i.mockEmitConnected()
		}

		await delay(800) // to allow for async timers & events to triggered

		expect(mosDevice.getConnectionStatus()).toMatchObject({
			PrimaryConnected: true,
			PrimaryStatus: 'Primary: Connected', // if not connected this will contain human-readable error-message
			SecondaryConnected: true,
			// SecondaryStatus: string // if not connected this will contain human-readable error-message
		})

		connectionStatusChanged.mockClear()

		// test timeout:
		connMocks[1].setAutoReplyToHeartBeat(false)
		connMocks[2].setAutoReplyToHeartBeat(true)

		await delay(800) // to allow for timeout:
		expect(mosDevice.getConnectionStatus()).toMatchObject({
			PrimaryConnected: false,
			PrimaryStatus: 'Primary: No heartbeats on port lower', // if not connected this will contain human-readable error-message
			SecondaryConnected: true,
			SecondaryStatus: 'Secondary: Connected', // if not connected this will contain human-readable error-message
		})

		expect(errorReported).toHaveBeenCalledTimes(1)
		expect(`${errorReported.mock.calls[0][0]}`).toMatch(
			/primary: Heartbeat error on lower: Sent command timed out after/
		)

		// Test proper dispose:
		await mosDevice.dispose()

		expect(connMocks[1].destroy).toHaveBeenCalledTimes(1)
		expect(connMocks[2].destroy).toHaveBeenCalledTimes(1)

		expect(onError).toHaveBeenCalledTimes(0)
		expect(onWarning).toHaveBeenCalledTimes(0)

		await mos.dispose()
	})
	test('buddy failover - primary starts offline', async () => {
		const mos = new MosConnection({
			mosID: 'jestMOS',
			acceptsConnections: false,
			profiles: {
				'0': true,
				'1': true,
			},
		})
		const onError = vitest.fn((e) => console.log(e))
		const onWarning = vitest.fn((e) => console.log(e))
		mos.on('error', (e) => {
			// filter out heartbeat errors:
			if (!(e + '').match(/heartbeat.*timed out/i)) onError(e)
		})
		mos.on('warning', onWarning)

		await initMosConnection(mos)
		const mosDevice: MosDevice = await mos.connect({
			primary: {
				id: 'mockServer',
				host: '127.0.0.1',
				timeout: 200,
			},
			secondary: {
				id: 'mockServer',
				host: '127.0.0.2',
				timeout: 200,
			},
		})

		expect(mosDevice).toBeTruthy()

		expect(SocketMock.instances).toHaveLength(7)
		const connMocks = SocketMock.instances

		expect(connMocks[1].connect).toHaveBeenCalledTimes(1)
		expect(connMocks[1].connect.mock.calls[0][0]).toEqual(10540)
		expect(connMocks[1].connect.mock.calls[0][1]).toEqual('127.0.0.1')
		expect(connMocks[2].connect).toHaveBeenCalledTimes(1)
		expect(connMocks[2].connect.mock.calls[0][0]).toEqual(10541)
		expect(connMocks[2].connect.mock.calls[0][1]).toEqual('127.0.0.1')

		connMocks[4].mockEmitConnected()
		connMocks[5].mockEmitConnected()
		connMocks[6].mockEmitConnected()

		const connectionStatusChanged = vitest.fn()

		const errorReported = vitest.fn()
		mos.on('error', errorReported)

		mosDevice.onConnectionChange((connectionStatus: IMOSConnectionStatus) => {
			connectionStatusChanged(connectionStatus)
		})

		await delay(800) // to allow for async timers & events to triggered

		expect(mosDevice.getConnectionStatus()).toMatchObject({
			PrimaryConnected: false,
			PrimaryStatus: 'Primary: No heartbeats on port upper', // if not connected this will contain human-readable error-message
			SecondaryConnected: true,
			SecondaryStatus: 'Secondary: Connected', // if not connected this will contain human-readable error-message
		})

		await mosDevice.requestMachineInfo().catch(() => null) // we don't care what happens, just need to trigger a handover

		connectionStatusChanged.mockClear()

		// test timeout:
		connMocks[0].mockEmitConnected()
		connMocks[1].mockEmitConnected()
		connMocks[2].mockEmitConnected()
		connMocks[3].mockEmitConnected()

		await delay(800) // to allow for timeout:
		expect(mosDevice.getConnectionStatus()).toMatchObject({
			PrimaryConnected: true,
			PrimaryStatus: 'Primary: Connected', // if not connected this will contain human-readable error-message
			SecondaryConnected: true,
			SecondaryStatus: 'Secondary: Connected', // if not connected this will contain human-readable error-message
		})

		// expect(errorReported).toHaveBeenCalledTimes(1)
		// expect(errorReported).nthCalledWith(
		// 	1,
		// 	expect.stringContaining('primary: Heartbeat error on lower: Error: Sent command timed out after')
		// )

		// Test proper dispose:
		await mosDevice.dispose()

		expect(connMocks[1].destroy).toHaveBeenCalledTimes(1)
		expect(connMocks[2].destroy).toHaveBeenCalledTimes(1)

		expect(onError).toHaveBeenCalledTimes(0)
		expect(onWarning).toHaveBeenCalledTimes(0)

		await mos.dispose()
	})
})
