import * as MOS from '../index.js'
import { describe, test, expect } from 'vitest'

describe('Index', () => {
	test('ensure that types and enums are exposed', () => {
		// Type checks:
		const fcn = (
			_exposedTypes: [
				MOS.IMOSItem,
				MOS.IMOSRunningOrder,
				MOS.IMOSRunningOrderBase,
				MOS.IMOSRunningOrderStatus,
				MOS.IMOSStoryStatus,
				MOS.IMOSItemStatus,
				MOS.IMOSStoryAction,
				MOS.IMOSROStory,
				MOS.IMOSItemAction,
				MOS.IMOSItem,
				MOS.IMOSROAction,
				MOS.IMOSROReadyToAir,
				MOS.IMOSROFullStory,
				MOS.IMOSAck,
			],
			// @ts-expect-error types test
			_falsePositiveTest: MOS.ThisDoesNotExist
		) => null

		// @ts-expect-error
		fcn()

		expect(MOS.getMosTypes).toBeTruthy()

		expect(MOS.IMOSObjectStatus).toBeTruthy()

		expect(MOS.IMOSScope).toBeTruthy()
		expect(MOS.IMOSScope.PLAYLIST).toBeTruthy()
	})

	test('ensure that dataTypes are exposed', () => {
		const mosTypes = MOS.getMosTypes(false)

		expect(mosTypes.mosString128).toBeTruthy()
		expect(mosTypes.mosDuration).toBeTruthy()
		expect(mosTypes.mosTime).toBeTruthy()
	})
	test('ensure that helper functions are exposed', () => {
		expect(MOS.pad).toBeTruthy()
	})
})
