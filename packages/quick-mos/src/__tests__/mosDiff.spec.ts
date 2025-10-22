import { diffLists, applyOperations } from '../mosDiff.js'
import { describe, test, expect } from 'vitest'

function quickList(ids: string[]) {
	return ids.map((id) => ({ id: id, changedHash: '1', content: '' }))
}
function getAllPermutations(values: string[]): string[][] {
	if (values.length === 1) return [values]

	const permutations: string[][] = []
	for (const first of values) {
		const rest = values.filter((v) => v !== first)

		const restPermutations = getAllPermutations(rest)
		for (const restPermutation of restPermutations) {
			permutations.push([first, ...restPermutation])
		}
	}
	return permutations
}

describe('mosDiff', () => {
	test('Move: Mechanic test', () => {
		// Tests all possible permutations of a list
		// To check that diffLists works on a technical level

		const orgList0 = ['a', 'b', 'c', 'd', 'e', 'f']
		const lists0 = getAllPermutations(orgList0)

		const orgList = quickList(orgList0)

		for (const list0 of lists0) {
			// console.log('=================\n')
			const list = quickList(list0)
			const operations = diffLists(orgList, list)

			// Verify that a list with applied operations is equal the target
			const refList = applyOperations(orgList, operations)
			try {
				expect(list).toEqual(refList)
			} catch (e) {
				console.log(orgList0)
				console.log(list0)
				console.log('operations', operations)
				console.log(refList.map((e) => e.id))
				throw e
			}
		}
	})
	test('Inserts', () => {
		expect(
			diffLists(quickList(['a', 'b', 'c', 'd', 'e', 'f']), quickList(['a', 'b', 'x', 'c', 'd', 'e', 'f']))
		).toEqual([{ type: 'insert', beforeId: 'c', inserts: [{ id: 'x', changedHash: '1', content: '' }] }])

		expect(
			diffLists(
				quickList(['a', 'b', 'c', 'd', 'e', 'f']),
				quickList(['a', 'b', 'x', 'y', 'c', 'd', 'z', 'e', 'f'])
			)
		).toEqual([
			{
				type: 'insert',
				beforeId: 'c',
				inserts: [
					{ id: 'x', changedHash: '1', content: '' },
					{ id: 'y', changedHash: '1', content: '' },
				],
			},
			{ type: 'insert', beforeId: 'e', inserts: [{ id: 'z', changedHash: '1', content: '' }] },
		])
	})
	test('updates', () => {
		const orgList = quickList(['a', 'b', 'c', 'd', 'e', 'f'])
		const list0 = JSON.parse(JSON.stringify(orgList))
		list0[1].changedHash = '2'
		list0[4].changedHash = '3'
		expect(diffLists(orgList, list0)).toEqual([
			{ type: 'update', id: 'b', changedHash: '2', content: '' },
			{ type: 'update', id: 'e', changedHash: '3', content: '' },
		])
	})
	test('removes', () => {
		expect(diffLists(quickList(['a', 'b', 'c', 'd', 'e', 'f']), quickList(['a', 'b', 'd', 'e', 'f']))).toEqual([
			{ type: 'remove', ids: ['c'] },
		])

		expect(diffLists(quickList(['a', 'b', 'c', 'd', 'e', 'f']), quickList(['a', 'b', 'd', 'e']))).toEqual([
			{ type: 'remove', ids: ['c', 'f'] },
		])
	})
	test('various move operations', () => {
		// Nothing changed:
		expect(diffLists(quickList(['a', 'b', 'c', 'd', 'e', 'f']), quickList(['a', 'b', 'c', 'd', 'e', 'f']))).toEqual(
			[]
		)

		expect(diffLists(quickList(['a', 'b', 'c', 'd', 'e', 'f']), quickList(['a', 'c', 'b', 'd', 'e', 'f']))).toEqual(
			[{ type: 'move', ids: ['c'], beforeId: 'b' }]
		)

		expect(diffLists(quickList(['a', 'b', 'c', 'd', 'e', 'f']), quickList(['a', 'd', 'e', 'b', 'c', 'f']))).toEqual(
			[{ type: 'move', ids: ['d', 'e'], beforeId: 'b' }]
		)

		expect(diffLists(quickList(['a', 'b', 'c', 'd', 'e', 'f']), quickList(['e', 'd', 'a', 'b', 'c', 'f']))).toEqual(
			[{ type: 'move', ids: ['e', 'd'], beforeId: 'a' }]
		)

		expect(diffLists(quickList(['a', 'b', 'c', 'd', 'e', 'f']), quickList(['f', 'b', 'c', 'd', 'e', 'a']))).toEqual(
			[
				{ type: 'move', ids: ['f'], beforeId: 'b' },
				{ type: 'move', ids: ['a'], beforeId: '' },
			]
		)

		expect(diffLists(quickList(['a', 'b', 'c', 'd', 'e', 'f']), quickList(['a', 'd', 'c', 'b', 'e', 'f']))).toEqual(
			[
				{ type: 'move', ids: ['d'], beforeId: 'c' },
				{ type: 'move', ids: ['b'], beforeId: 'e' },
			]
		)

		expect(diffLists(quickList(['a', 'b', 'c', 'd', 'e', 'f']), quickList(['f', 'a', 'b', 'c', 'd', 'e']))).toEqual(
			[{ type: 'move', ids: ['f'], beforeId: 'a' }]
		)

		expect(diffLists(quickList(['a', 'b', 'c', 'd', 'e', 'f']), quickList(['b', 'c', 'd', 'e', 'f', 'a']))).toEqual(
			[{ type: 'move', ids: ['a'], beforeId: '' }]
		)

		expect(diffLists(quickList(['a', 'b', 'c', 'd', 'e', 'f']), quickList(['b', 'a', 'd', 'f', 'e', 'c']))).toEqual(
			[
				{ type: 'move', ids: ['b'], beforeId: 'a' },
				{ type: 'move', ids: ['d', 'f', 'e'], beforeId: 'c' },
			]
		)

		// expect(diffLists(
		// 	quickList(['a', 'b', 'c', 'd', 'e', 'f', 'g']),
		// 	quickList(['a', 'd', 'e', 'f', 'g', 'b', 'c'])
		// )).toEqual([
		// 	{ type: 'move', ids: ['b', 'c'], beforeId: '' }
		// ])
	})
	test('Combinations', () => {
		expect(diffLists(quickList(['a', 'b', 'c', 'd', 'e', 'f']), quickList(['a', 'b', 'x', 'c', 'e', 'd']))).toEqual(
			[
				{ type: 'insert', beforeId: 'c', inserts: [{ id: 'x', changedHash: '1', content: '' }] },
				{ type: 'remove', ids: ['f'] },
				{ type: 'move', ids: ['e'], beforeId: 'd' },
			]
		)

		expect(
			diffLists(quickList(['a', 'b', 'c', 'd', 'e', 'f']), quickList(['a', 'b', 'x', 'd', 'z', 'e', 'f']))
		).toEqual([
			{ type: 'insert', beforeId: 'd', inserts: [{ id: 'x', changedHash: '1', content: '' }] },
			{ type: 'insert', beforeId: 'e', inserts: [{ id: 'z', changedHash: '1', content: '' }] },
			{ type: 'remove', ids: ['c'] },
		])
	})
})
