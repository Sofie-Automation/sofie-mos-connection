import { pad } from './lib.js'

export interface IMOSDuration {
	_mosDuration: number // in seconds
	/** @deprecated use getMosTypes().mosDuration.stringify() instead! */
	toString: never
}

export function create(anyValue: AnyValue, strict: boolean): IMOSDuration {
	let value: number
	if (typeof anyValue === 'number') {
		value = anyValue // seconds
	} else if (typeof anyValue === 'string') {
		const m = /(\d+):(\d+):(\d+)/.exec(anyValue)
		if (!m) throw new Error(`MosDuration: Invalid input format: "${anyValue}"!`)

		const hh: number = parseInt(m[1], 10)
		const mm: number = parseInt(m[2], 10)
		const ss: number = parseInt(m[3], 10)

		if (isNaN(hh) || isNaN(mm) || isNaN(ss)) throw new Error(`MosDuration: Bad input format "${anyValue}"!`)

		value = hh * 3600 + mm * 60 + ss
	} else if (typeof anyValue === 'object' && anyValue?._mosDuration !== undefined) {
		value = anyValue._mosDuration
	} else {
		throw new Error(`MosDuration: Invalid input: "${anyValue}"`)
	}
	const mosDuration: IMOSDuration = { _mosDuration: value } as IMOSDuration
	validate(mosDuration, strict)
	return mosDuration
}
export type AnyValue = string | number | IMOSDuration
export function validate(_mosDuration: IMOSDuration, _strict: boolean): void {
	// nothing
}
export function valueOf(mosDuration: IMOSDuration): number {
	if (typeof mosDuration === 'number') return mosDuration // helpful hack
	return mosDuration._mosDuration
}
export function stringify(mosDuration: IMOSDuration): string {
	if (typeof mosDuration === 'string') return mosDuration // helpful hack
	let s = mosDuration._mosDuration

	const hh = Math.floor(s / 3600)
	s -= hh * 3600

	const mm = Math.floor(s / 60)
	s -= mm * 60

	const ss = Math.floor(s)

	return hh + ':' + pad(mm, 2) + ':' + pad(ss, 2)
}
export function is(mosDuration: IMOSDuration | any): mosDuration is IMOSDuration {
	if (typeof mosDuration !== 'object') return false
	if (mosDuration === null) return false
	return (mosDuration as IMOSDuration)._mosDuration !== undefined
}
export function fallback(): IMOSDuration {
	const mosDuration: IMOSDuration = { _mosDuration: 0 } as IMOSDuration
	validate(mosDuration, true)
	return mosDuration
}
