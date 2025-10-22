import { flattenXMLText } from '../lib.js'
import { describe, test, expect } from 'vitest'

describe('lib', () => {
	test('flattenXMLText', () => {
		expect(
			flattenXMLText(
				{
					elements: [
						{
							$name: 'p',
							$type: 'element',
							elements: [
								{
									$type: 'text',
									text: 'Exterior footage of',
								},
								{
									$name: 'em',
									$type: 'text',
									text: 'Baley Park Hotel',
								},
								{
									$type: 'text',
									text: 'on fire with natural sound. Trucks are visible for the first portion of the clip.',
								},
								{
									$name: 'em',
									$type: 'text',
									text: 'CG locator at 0:04 and duration 0:05, Baley Park Hotel.',
								},
							],
						},
						{
							$name: 'p',
							$type: 'element',
							elements: [
								{
									$name: 'tab',
									$type: 'element',
								},
								{
									$type: 'text',
									text: 'Cuts to view of fire personnel exiting hotel lobby and cleaning up after the fire is out.',
								},
							],
						},
						{
							$name: 'p',
							$type: 'element',
							em: 'Clip has been doubled for pad on voice over.',
						},
					],
				},
				true
			)
		).toEqual(
			'Exterior footage of Baley Park Hotel on fire with natural sound. Trucks are visible for the first portion of the clip. CG locator at 0:04 and duration 0:05, Baley Park Hotel.\nCuts to view of fire personnel exiting hotel lobby and cleaning up after the fire is out.\nClip has been doubled for pad on voice over.'
		)
	})
})
