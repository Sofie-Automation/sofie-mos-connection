/* eslint-disable vitest/no-conditional-expect */
import { MosConnection } from '../MosConnection.js'
import { getMosConnection, setupMocks } from './lib.js'
import { NCSServerConnection } from '../connection/NCSServerConnection.js'
import { SocketMock } from '../__mocks__/socket.js'
import { describe, test, expect, beforeAll, beforeEach, afterEach } from 'vitest'

const PRIMARY_IP = '127.0.0.1'
const SECONDARY_IP = '127.0.0.2'

describe('Hot Standby Feature', () => {
	let mosConnection: MosConnection
	let primary: NCSServerConnection | null
	let secondary: NCSServerConnection | null
	let socketMocks: SocketMock[]

	beforeAll(() => {
		setupMocks()
	})

	beforeEach(async () => {
		mosConnection = await getMosConnection(
			{
				'0': true,
				'1': true,
			},
			false,
			{
				openMediaHotStandby: true,
			}
		)

		const device = await mosConnection.connect({
			primary: {
				id: 'primary',
				host: PRIMARY_IP,
			},
			secondary: {
				id: 'secondary',
				host: SECONDARY_IP,
				openMediaHotStandby: true,
			},
		})

		primary = device['_primaryConnection']
		secondary = device['_secondaryConnection']
		socketMocks = SocketMock.instances

		// Connect primary sockets and wait for connection to be established
		socketMocks.forEach((socket) => {
			if (socket.connectedHost === PRIMARY_IP) {
				socket.mockEmitConnected()
				socket.setAutoReplyToHeartBeat(true)
			}
		})
		await new Promise((resolve) => setTimeout(resolve, 500))
	})

	const discconnectPrimary = async () => {
		if (!primary) return
		// disable heartbeats and auto-reconnection
		socketMocks.forEach((socket) => {
			if (socket.connectedHost === PRIMARY_IP) {
				socket.setAutoReplyToHeartBeat(false)

				// Get the MosSocketClient bound to this socket
				const listeners = socket.listeners('close')
				for (const listener of listeners) {
					const fn = listener as any
					const boundTo = fn?._boundTo
					if (boundTo) {
						boundTo._shouldBeConnected = false
						boundTo.autoReconnect = false
					}
				}
			}
		})
		await new Promise((resolve) => setTimeout(resolve, 100))

		// Force primary connection state update
		primary['_connected'] = false
		primary.emit('connectionChanged')

		// Simulate socket disconnection
		socketMocks.forEach((socket) => {
			if (socket.connectedHost === PRIMARY_IP) {
				socket.destroy()
			}
		})
		await new Promise((resolve) => setTimeout(resolve, 100))
	}

	const disconnectSecondary = async () => {
		if (!secondary) return
		// disable heartbeats and auto-reconnection
		socketMocks.forEach((socket) => {
			if (socket.connectedHost === SECONDARY_IP) {
				socket.setAutoReplyToHeartBeat(false)

				// Get the MosSocketClient bound to this socket
				const listeners = socket.listeners('close')
				for (const listener of listeners) {
					const fn = listener as any
					const boundTo = fn?._boundTo
					if (boundTo) {
						boundTo._shouldBeConnected = false
						boundTo.autoReconnect = false
					}
				}
			}
		})
		await new Promise((resolve) => setTimeout(resolve, 100))

		// Force secondary connection state update
		secondary['_connected'] = false
		secondary.emit('connectionChanged')

		// Simulate socket disconnection
		socketMocks.forEach((socket) => {
			if (socket.connectedHost === SECONDARY_IP) {
				socket.destroy()
			}
		})
		await new Promise((resolve) => setTimeout(resolve, 100))
	}

	test('should disable secondary heartbeats when primary is connected', async () => {
		expect(primary).toBeTruthy()
		expect(secondary).toBeTruthy()

		if (primary && secondary) {
			expect(primary.getConnectedStatus().connected).toBe(true)
			// Hot standby only connects one connection at a time:
			expect(secondary.getConnectedStatus().connected).toBe(false)

			// Verify heartbeat states
			expect(primary.isHearbeatEnabled()).toBe(true)
			expect(secondary.isHearbeatEnabled()).toBe(false)
		}
	})

	test('should enable secondary heartbeats when primary disconnects', async () => {
		expect(primary).toBeTruthy()
		expect(secondary).toBeTruthy()

		if (primary && secondary) {
			expect(primary.connected).toBe(true)
			expect(secondary.connected).toBe(false)

			// Disconnect primary connection:
			await discconnectPrimary()

			// Verify primary is properly disconnected
			expect(primary.getConnectedStatus().connected).toBe(false)

			// connect secondary
			socketMocks.forEach((socket) => {
				if (socket.connectedHost === SECONDARY_IP) {
					socket.mockEmitConnected()
					socket.setAutoReplyToHeartBeat(true)
				}
			})
			await new Promise((resolve) => setTimeout(resolve, 100))

			// Verify heartbeat states
			expect(primary.isHearbeatEnabled()).toBe(false)
			expect(secondary.isHearbeatEnabled()).toBe(true)
		}
	})

	test('should disable primary heartbeats when secondary is connected and primary is disconnected', async () => {
		expect(primary).toBeTruthy()
		expect(secondary).toBeTruthy()

		if (primary && secondary) {
			// Initially, primary should be connected and secondary should be connected but with heartbeats disabled
			expect(primary.connected).toBe(true)
			// Hot standby only connects one connection at a time:
			expect(secondary.connected).toBe(false)
			expect(primary.isHearbeatEnabled()).toBe(true)
			expect(secondary.isHearbeatEnabled()).toBe(false)

			// Disconnect primary
			await discconnectPrimary()

			// Connect secondary
			socketMocks.forEach((socket) => {
				if (socket.connectedHost === SECONDARY_IP) {
					socket.mockEmitConnected()
					socket.setAutoReplyToHeartBeat(true)
				}
			})
			await new Promise((resolve) => setTimeout(resolve, 100))

			// Verify primary is properly disconnected
			expect(primary.getConnectedStatus().connected).toBe(false)

			// Verify heartbeat states after primary disconnect and secondary connect
			expect(primary.isHearbeatEnabled()).toBe(false)
			expect(secondary.isHearbeatEnabled()).toBe(true)
		}
	})

	test('should enable secondary heartbeats when secondary is connected and primary disconnects', async () => {
		expect(primary).toBeTruthy()
		expect(secondary).toBeTruthy()

		if (primary && secondary) {
			// Initially, both should be connected with primary heartbeats enabled and secondary disabled
			expect(primary.connected).toBe(true)
			// Hot standby only connects one connection at a time:
			expect(secondary.connected).toBe(false)
			expect(primary.isHearbeatEnabled()).toBe(true)
			expect(secondary.isHearbeatEnabled()).toBe(false)

			// Connect secondary first to ensure it's ready
			socketMocks.forEach((socket) => {
				if (socket.connectedHost === SECONDARY_IP) {
					socket.mockEmitConnected()
					socket.setAutoReplyToHeartBeat(true)
				}
			})
			await new Promise((resolve) => setTimeout(resolve, 100))

			// Disconnect primary
			await discconnectPrimary()

			// Verify state after primary disconnect
			expect(primary.getConnectedStatus().connected).toBe(false)

			// Verify secondary heartbeats are enabled after primary disconnect
			expect(primary.isHearbeatEnabled()).toBe(false)
			expect(secondary.isHearbeatEnabled()).toBe(true)
		}
	})

	test('should enable primary heartbeats when secondary disconnects', async () => {
		expect(primary).toBeTruthy()
		expect(secondary).toBeTruthy()

		if (primary && secondary) {
			// Initial setup - primary connected and secondary not but with heartbeats disabled
			expect(primary.connected).toBe(true)
			// Hot standby only connects one connection at a time:
			expect(secondary.connected).toBe(false)

			// First disconnect primary to force secondary active
			await discconnectPrimary()

			// Connect secondary
			socketMocks.forEach((socket) => {
				if (socket.connectedHost === SECONDARY_IP) {
					socket.mockEmitConnected()
					socket.setAutoReplyToHeartBeat(true)
				}
			})
			await new Promise((resolve) => setTimeout(resolve, 100))

			// Verify secondary is active with heartbeats
			expect(secondary.isHearbeatEnabled()).toBe(true)
			expect(primary.isHearbeatEnabled()).toBe(false)

			// Now disconnect secondary
			await disconnectSecondary()

			await new Promise((resolve) => setTimeout(resolve, 100))

			// Reconnect primary
			socketMocks.forEach((socket) => {
				if (socket.connectedHost === PRIMARY_IP) {
					socket.mockEmitConnected()
					socket.setAutoReplyToHeartBeat(true)
				}
			})
			await new Promise((resolve) => setTimeout(resolve, 100))

			// Verify primary heartbeats are re-enabled
			expect(primary.isHearbeatEnabled()).toBe(true)
			expect(secondary.isHearbeatEnabled()).toBe(false)
		}
	})

	afterEach(async () => {
		await new Promise((resolve) => setTimeout(resolve, 100))
		await mosConnection?.dispose()

		void primary?.dispose()
		void secondary?.dispose()
	})
})
