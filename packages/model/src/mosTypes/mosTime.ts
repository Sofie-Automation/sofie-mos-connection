import { pad } from './lib.js'

export interface IMOSTime {
	_mosTime: number
	_timezone: string
	_timezoneOffset: number

	/** @deprecated use getMosTypes().mosTime.stringify() instead! */
	toString: never
}

export function create(timestamp: AnyValue, strict: boolean): IMOSTime {
	// let value: number
	let time: Date
	let _timezone = ''
	let _timezoneOffset = 0

	if (timestamp === undefined) throw new Error(`MosTime: Invalid input: "${timestamp}"`)

	// create date from time-string or timestamp number
	if (typeof timestamp === 'number') {
		time = new Date(timestamp)
	} else if (typeof timestamp === 'string') {
		// formats:
		// YYYY-MM-DD'T'hh:mm:ss[,ddd]['Z']
		// Sun Feb 25 2018 08:59:08 GMT+0100 (CET)
		// 2018-02-25T08:00:45.528Z
		if (timestamp === '') throw new Error(`MosTime: Invalid input: "${timestamp}"`)

		let _timezoneZuluIndicator = ''
		let _timezoneDeclaration = ''

		// parse out custom Z indicator (mos-centric)
		const customFormatParseResult = parseMosCustomFormat(timestamp)
		// parse out custom timezones (mos local-local centric format)
		const timezoneParseResult = parseTimeOffset(timestamp)

		if (customFormatParseResult !== false) {
			_timezone = customFormatParseResult.timezoneIndicator
			_timezoneOffset = customFormatParseResult.timezoneOffset
			_timezoneZuluIndicator = customFormatParseResult.timezoneIndicator

			const r = customFormatParseResult
			const dateStr = `${r.yy}-${r.mm}-${r.dd}T${r.hh}:${r.ii}:${r.ss}${
				r.ms ? '.' + r.ms : ''
			}${_timezoneZuluIndicator}${_timezoneDeclaration}`
			time = new Date(dateStr)
		} else if (timezoneParseResult !== false) {
			_timezoneDeclaration = timezoneParseResult.timezoneDeclaration

			time = new Date(timestamp)
		} else {
			// try to parse the time directly with Date, for Date-supported formats
			time = new Date(timestamp)
		}
	} else if (typeof timestamp === 'object') {
		if (timestamp instanceof Date) {
			time = timestamp
		} else if (timestamp?._mosTime !== undefined) {
			time = new Date(timestamp._mosTime)
		} else if (!strict) {
			time = new Date()
		} else {
			throw new Error(`MosTime: Invalid input: ${JSON.stringify(timestamp)}`)
		}
	} else {
		throw new Error(`MosTime: Invalid input: "${timestamp}"`)
	}

	if (isNaN(time.getTime())) {
		throw new Error(`MosTime: Invalid timestamp: ${JSON.stringify(timestamp)}`)
	}

	const iMosTime: IMOSTime = {
		_mosTime: time.getTime(),
		_timezone,
		_timezoneOffset,
	} as IMOSTime
	validate(iMosTime, strict)
	return iMosTime
}
export type AnyValue = Date | number | string | IMOSTime

export function validate(_mosDuration: IMOSTime, _strict: boolean): void {
	// nothing
}
export function valueOf(mosTime: IMOSTime): number {
	if (typeof mosTime === 'number') return mosTime // helpful hack
	return mosTime._mosTime
}
export function stringify(mosTime: IMOSTime): string {
	if (typeof mosTime === 'string') return mosTime // helpful hack

	const localOffset = new Date(mosTime._mosTime).getTimezoneOffset()
	// Cheat a little bit to get the time-zone right:
	// First add the local offset to get the Date to display the time in UTC,
	// then add the timezoneOffset to get the time in the the correct time-zone:
	const d = new Date(mosTime._mosTime + (localOffset + mosTime._timezoneOffset) * 60000)

	const YYYY = pad(d.getFullYear(), 4)
	const MM = pad(d.getMonth() + 1, 2)
	const DD = pad(d.getDate(), 2)
	const HH = pad(d.getHours(), 2)
	const mm = pad(d.getMinutes(), 2)
	const ss = pad(d.getSeconds(), 2)
	const SSS = pad(d.getMilliseconds(), 3)
	const tz = mosTime._timezone

	return `${YYYY}-${MM}-${DD}T${HH}:${mm}:${ss},${SSS}${tz}`
}

export function is(mosTime: IMOSTime | any): mosTime is IMOSTime {
	if (typeof mosTime !== 'object') return false
	if (mosTime === null) return false
	return (
		(mosTime as IMOSTime)._mosTime !== undefined &&
		(mosTime as IMOSTime)._timezone !== undefined &&
		(mosTime as IMOSTime)._timezoneOffset !== undefined
	)
}
export function fallback(): IMOSTime {
	const iMosTime: IMOSTime = {
		_mosTime: 0,
		_timezone: '',
		_timezoneOffset: 0,
	} as IMOSTime
	validate(iMosTime, true)
	return iMosTime
}

function parseTimeOffset(timestamp: string): false | { timeOffsetValue: number; timezoneDeclaration: string } {
	let timeOffsetValue: number
	let timezoneDeclaration = ''
	const offsetregex = /([+-])(\d{1,2})(?::{0,1}(\d{2})){0,1}(?: {0,1}\(\S+\)){0,1}$/
	const match = timestamp.match(offsetregex)
	if (match) {
		let positiveNegativeValue = 0
		let hours = 0
		let minutes = 0
		if (match.length >= 2) {
			positiveNegativeValue = match[1] === '+' ? 1 : positiveNegativeValue
			positiveNegativeValue = match[1] === '-' ? -1 : positiveNegativeValue
			timezoneDeclaration = match[1]
		}
		if (match.length >= 3) {
			hours = parseInt(match[2], 10)
			timezoneDeclaration += pad(hours.toString(), 2)
		}
		if (match.length >= 4) {
			minutes = parseInt(match[3], 10)
			timezoneDeclaration += ':' + pad(minutes.toString(), 2)
		}
		timeOffsetValue = (hours * 60 + minutes) * positiveNegativeValue
		return {
			timeOffsetValue,
			timezoneDeclaration,
		}
	}
	return false
}

/** */
function parseMosCustomFormat(timestamp: string):
	| false
	| {
			yy: string
			mm: string
			dd: string
			hh: string
			ii: string
			ss: string
			ms: string
			timezoneIndicator: string
			/** in minutes */
			timezoneOffset: number
	  } {
	const timestampRegex = /(\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+)([,.](\d{3}))?(([+-Z])([:\d]+)?)?/i
	const match = timestamp.match(timestampRegex)
	if (match) {
		const yy = pad(match[1], 4)
		const mm = pad(match[2], 2)
		const dd = pad(match[3], 2)
		const hh = pad(match[4], 2)
		const ii = pad(match[5], 2)
		const ss = pad(match[6], 2)
		const ms = match[8]
		let timezoneIndicator = match[9] || 'Z'
		let timezoneOffset = 0

		const m = timezoneIndicator.match(/([+-])(\d+):(\d+)/) // +5:00,  -05:00
		if (m) {
			const tzSign = m[1]
			let tzHours = m[2]
			let tzMinutes = m[3]
			tzHours = pad(tzHours, 2)
			tzMinutes = pad(tzMinutes, 2)
			timezoneIndicator = tzSign + tzHours + ':' + tzMinutes
			timezoneOffset = parseInt(tzSign + tzHours) * 60 + parseInt(tzMinutes)
		}

		return {
			yy,
			mm,
			dd,
			hh,
			ii,
			ss,
			ms,
			timezoneIndicator,
			timezoneOffset,
		}
	}

	return false
}
