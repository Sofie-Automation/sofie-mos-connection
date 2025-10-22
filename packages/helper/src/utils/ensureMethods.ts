import { AnyXMLObject, AnyXMLValue, AnyXMLValueSingular } from '@mos-connection/model'
import { assertStringLiteral, isEmpty } from '../mosModel/lib.js'

/**
 * Ensures that the returned value is an array.
 * If the input is not an array, it will be wrapped in an array.
 */
export function ensureArray<A, B>(v: A | B | B[]): (A | B)[]
export function ensureArray<T>(v: T | T[]): T[]
export function ensureArray<T>(v: T | T[]): T[] {
	if (typeof v === 'object' && Array.isArray(v)) return v
	else return [v]
}

/**
 * Ensures that the returned value is a string literal.
 * If the input value is not of the correct type, will throw (if strict) or return the fallback value.
 */
export function ensureStringLiteral<T extends string>(
	xmlValue: AnyXMLValue,
	options: T[],
	strict: boolean,
	fallback: T
): T {
	const value = ensureSingular(xmlValue, strict)

	if (!value) {
		if (strict) {
			throw new Error(`Expected a string, got: "${value}"`)
		} else {
			return fallback
		}
	}

	if (assertStringLiteral(value, options)) {
		return value
	} else if (strict) {
		throw new Error(`Invalid literal value: "${value}" (valid values: ${options.join(', ')})`)
	} else {
		return fallback
	}
}
/**
 * Ensures that the returned value is a string.
 * If the input value is not of the correct type, will throw (if strict) or return the fallback value.
 */
export function ensureString(value: AnyXMLValue, strict: boolean, fallback = ''): string {
	if (typeof value === 'string') {
		return value
	} else if (strict) throw new Error(`Expected a string, got: ${JSON.stringify(value)}`)
	else return fallback
}

/**
 * Ensures that the returned value is an object.
 * If the input value is not of the correct type, will throw (if strict) or return the fallback value.
 */
export function ensureXMLObject(value: AnyXMLValue, strict: boolean, fallback: AnyXMLObject = {}): AnyXMLObject {
	if (typeof value === 'object') {
		if (Array.isArray(value)) {
			if (value.length === 0) return {}
			if (value.length > 1) {
				if (strict)
					throw new Error(`Expected only one value, got ${value.length} values: ${JSON.stringify(value)}`)
				else return fallback
			}
			return ensureXMLObject(value[0], strict)
		} else {
			return value
		}
	} else if (strict) throw new Error(`Expected an object, got: ${value}`)
	else return fallback
}

/**
 * Ensures that the returned value is a singular value (ie a string or undefined).
 * If the input value is not of the correct type, will throw (if strict) or return the fallback value.
 */
export function ensureSingular(value: AnyXMLValue, strict: boolean): AnyXMLValueSingular {
	// Quick-fix if it is in a xml element:
	if (isXMLTextElement(value)) value = value.text
	// Quick-fix for empty object
	if (isEmpty(value)) value = ''

	if (typeof value === 'object') {
		if (Array.isArray(value)) {
			if (value.length === 0) return undefined
			if (value.length > 1) {
				if (strict)
					throw new Error(`Expected only one value, got ${value.length} values: ${JSON.stringify(value)}`)
				else return undefined
			}
			return ensureSingular(value[0], strict)
		} else if (strict) throw new Error(`Expected only one value, got object: ${JSON.stringify(value)}`)
		else return undefined
	} else {
		return value
	}
}
/**
 * Ensures that the returned value is an array containing only singular values
 * If the input value is not of the correct type, will throw (if strict) or return an empty array
 */
export function ensureSingularArray(value: AnyXMLValue, strict: boolean): AnyXMLValueSingular[] {
	if (typeof value === 'object' && Array.isArray(value)) {
		for (let i = 0; i < value.length; i++) {
			value[i] = ensureSingular(value[i], strict)
		}
		return value as AnyXMLValueSingular[]
	} else if (strict) throw new Error(`Expected an Array, got: ${JSON.stringify(value)}`)
	else return []
}
/**
 * Ensures that the returned value is an array containing only XMLObjects
 * If the input value is not of the correct type, will throw (if strict) or return an empty array
 */
export function ensureXMLObjectArray(value: AnyXMLValue, strict: boolean): AnyXMLObject[] {
	const objs: AnyXMLObject[] = []
	for (const obj of ensureArray(value)) {
		objs.push(ensureXMLObject(obj, strict))
	}
	return objs
}

export function isSingular(value: AnyXMLValue): value is AnyXMLValueSingular {
	try {
		ensureSingular(value, true)
		return true
	} catch {
		return false
	}
}
export function isSingularArray(value: AnyXMLValue): value is AnyXMLValueSingular[] {
	try {
		ensureSingularArray(value, true)
		return true
	} catch {
		return false
	}
}
export function isXMLObject(value: AnyXMLValue): value is AnyXMLObject {
	try {
		ensureXMLObject(value, true)
		return true
	} catch {
		return false
	}
}
function isXMLTextElement(xml: any): xml is TextElement {
	return (
		typeof xml === 'object' &&
		(xml as TextElement).$type === 'text' &&
		typeof (xml as TextElement).text === 'string'
	)
}
interface TextElement {
	$type: 'text'
	$name: string
	text: string
}
