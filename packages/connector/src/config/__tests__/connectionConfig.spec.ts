import { ConnectionConfig } from '../connectionConfig.js'
import { describe, test, expect } from 'vitest'

describe('ConnectionConfig', () => {
	test('new ConnectionConfig', () => {
		const config = new ConnectionConfig({
			mosID: 'test',
			acceptsConnections: true,
			accepsConnectionsFrom: [],
			profiles: {
				'0': true,
				'1': true,
			},
			// debug: false,
			// openRelay: true,
			// offspecFailover: false
		})

		expect(config.mosID).toEqual('test')
		expect(config.acceptsConnections).toEqual(true)
		expect(config.accepsConnectionsFrom).toEqual([])
		expect(config.debug).toBeFalsy()
		expect(config.openRelay).toBeFalsy()
		expect(config.offspecFailover).toBeFalsy()
	})

	test('invalid ConnectionConfig', () => {
		expect(() => {
			// @ts-ignore
			return new ConnectionConfig(undefined)
		}).toThrow(/object.*missing/)

		expect(() => {
			// @ts-ignore
			return new ConnectionConfig(1)
		}).toThrow(/not an object/)

		expect(() => {
			// @ts-ignore
			return new ConnectionConfig({
				mosID: 'test',
				acceptsConnections: true,
			})
		}).toThrow(/profiles.*missing/)

		expect(() => {
			// @ts-ignore
			return new ConnectionConfig({
				mosID: 'test',
				profiles: {
					'0': true,
					'1': true,
				},
			})
		}).toThrow(/acceptsConnections.*missing/)

		expect(() => {
			// @ts-ignore
			return new ConnectionConfig({
				acceptsConnections: true,
				profiles: {
					'0': true,
					'1': true,
				},
			})
		}).toThrow(/mosID.*missing/)

		expect(() => {
			return new ConnectionConfig({
				mosID: 'test',
				acceptsConnections: true,
				// @ts-ignore
				profiles: {
					'1': true,
				},
			})
		}).toThrow(/profile.*0.*mandatory/i)

		expect(() => {
			return new ConnectionConfig({
				mosID: 'test',
				acceptsConnections: true,
				profiles: {
					'0': true,
				},
			})
		}).toThrow(/must support at least one profile/i)
	})
})
