/* eslint-disable @typescript-eslint/no-base-to-string */
import { MosTypes, getMosTypes, MosType, AnyXMLObject } from '@mos-connection/model'
import { AnyXMLValue } from './lib.js'
import { ParseError } from './ParseError.js'
import { ensureSingular } from '../utils/ensureMethods.js'

export function getParseMosTypes(strict: boolean): MosParseTypes {
	const mosTypes = getMosTypes(strict)

	const specialMosTypes = getSpecialMosTypes(strict)
	return {
		strict: mosTypes.strict,
		mosString128: wrapParseMethods(mosTypes.mosString128, true, strict),
		mosDuration: wrapParseMethods(mosTypes.mosDuration, true, strict),
		mosTime: wrapParseMethods(mosTypes.mosTime, true, strict),

		string: wrapParseMethods(specialMosTypes.string, true, strict),
		stringEnum: wrapParseMethods(specialMosTypes.stringEnum, false, strict),
		number: wrapParseMethods(specialMosTypes.number, true, strict),
	}
}
export type MosParseTypes = {
	[key in keyof MosTypes]: MosTypes[key] extends MosType<infer Serialized, infer Value, infer CreateValue>
		? MosTypeParse<Serialized, Value, CreateValue | AnyXMLValue>
		: MosTypes[key]
} & {
	string: MosTypeParse<string, string, AnyXMLValue>
	stringEnum: MosTypeParse<any, string, { enum: { [key: string]: string }; value: AnyXMLValue }>
	number: MosTypeParse<number, number, AnyXMLValue>
}
interface MosTypeParse<Serialized, Value, CreateValue> extends Omit<MosType<Serialized, Value, CreateValue>, 'create'> {
	/**
	 * Used to parse data that is optional.
	 * If the data is missing, undefined is returned.
	 */
	createOptional: (anyValue: CreateValue, path: string) => Serialized | undefined
	/**
	 * Used to parse data that is required.
	 * If in strict mode, the data must be present and parsable, otherwise an error is thrown.
	 * If not in strict mode, a fallback value will be used.
	 */
	createRequired: (anyValue: CreateValue, path: string) => Serialized
}

function wrapParseMethods<Serialized, Value, CreateValue>(
	mosType: MosType<Serialized, Value, CreateValue>,
	valueIsSingular: boolean,
	strict: boolean
): MosTypeParse<Serialized, Value, CreateValue | AnyXMLValue> {
	return {
		createOptional: wrapParseMethodCreateOptional(mosType, valueIsSingular, strict),
		createRequired: wrapParseMethodCreateRequired(mosType, valueIsSingular, strict),
		validate: mosType.validate,
		valueOf: mosType.valueOf,
		stringify: mosType.stringify,
		is: mosType.is,
	} as MosTypeParse<Serialized, Value, CreateValue | AnyXMLValue>
}
function wrapParseMethodCreateOptional<Serialized, Value, CreateValue>(
	mosType: MosType<Serialized, Value, CreateValue>,
	valueIsSingular: boolean,
	strict: boolean
): MosTypeParse<Serialized, Value, CreateValue | AnyXMLValue>['createOptional'] {
	return parseOptional(mosType.create, valueIsSingular, strict)
}
function wrapParseMethodCreateRequired<Serialized, Value, CreateValue>(
	mosType: MosType<Serialized, Value, CreateValue>,
	valueIsSingular: boolean,
	strict: boolean
): MosTypeParse<Serialized, Value, CreateValue | AnyXMLValue>['createRequired'] {
	return parseRequired(mosType.create, mosType.fallback, valueIsSingular, strict)
}

export function parseOptional<V, R>(
	parser: (value: V) => R,
	valueIsSingular: boolean,
	strict: boolean
): (value: V | AnyXMLValue, path: string) => R | undefined {
	return (value: any, path: string) => {
		try {
			// handle empty string:
			if (typeof value === 'string' && !value.trim()) value = undefined
			// handle empty object (can happen when parsing an empty xml tag):
			if (typeof value === 'object' && Object.keys(value).length === 0) value = undefined

			if (valueIsSingular) value = ensureSingular(value, strict)

			if (
				(valueIsSingular && (value === undefined || value === '')) ||
				(!valueIsSingular && (value.value === undefined || value.value === ''))
			)
				return undefined

			return parser(value)
		} catch (e) {
			throw ParseError.handleCaughtError(path, e)
		}
	}
}
export function parseRequired<V, R>(
	parser: (value: V) => R,
	fallback: () => R,
	valueIsSingular: boolean,
	strict: boolean
): (value: V | AnyXMLValue, path: string) => R {
	return (value: any, path: string) => {
		try {
			// handle empty string:
			if (typeof value === 'string' && !value.trim()) value = undefined
			// handle empty object (can happen when parsing an empty xml tag):
			if (typeof value === 'object' && Object.keys(value).length === 0) value = undefined

			if (valueIsSingular) value = ensureSingular(value, strict)

			if (value === undefined || value === '') {
				// Something might be wrong. value is undefined, but should not be (?)
				if (strict) {
					// This will throw if the mosType doesn't handle undefined:
					return parser(value)
				} else {
					return fallback()
				}
			} else {
				return parser(value)
			}
		} catch (e) {
			throw ParseError.handleCaughtError(path, e)
		}
	}
}

function getSpecialMosTypes(strict: boolean) {
	const string: MosType<string, string, AnyXMLValue> = {
		create: (anyValue: AnyXMLValue) => {
			if (typeof anyValue !== 'string') throw new Error(`Expected a string, got: "${anyValue}"`)
			return anyValue
		},
		validate: (_value: string) => true,
		valueOf: (value: string) => value,
		stringify: (value: string) => value,
		is: (value: any): value is string => typeof value !== 'string',
		fallback: () => '',
	}
	const stringEnum: MosType<string, string, { enum: { [key: string]: string }; value: AnyXMLValue }> = {
		create: (createValue) => {
			if (!createValue.enum) throw new Error(`Expected an object with an "enum" key, got: "${createValue}"`)

			const key = `${createValue.value}`
			if (!key) throw new Error(`Expected a value, got: "${createValue.value}"`)

			const enumValues = Object.values<string>(createValue.enum)
			if (!enumValues.includes(key)) {
				if (strict) {
					throw new Error(`Unknown value, got: "${key}", possible values: ${enumValues.join(', ')}`)
				} else return ''
			}

			return key
		},
		validate: (_value: string) => true,
		valueOf: (value: string) => value,
		stringify: (value: string) => value,
		is: (value: any): value is string => typeof value !== 'string',
		fallback: () => '',
	}
	const number: MosType<number, number, AnyXMLValue> = {
		create: (anyValue: AnyXMLValue) => {
			if (typeof anyValue !== 'string') throw new Error(`Expected a string, got: "${anyValue}"`)
			return parseFloat(anyValue)
		},
		validate: (_value: number) => true,
		valueOf: (value: number) => value,
		stringify: (value: number) => `${value}`,
		is: (value: any): value is number => typeof value !== 'number',
		fallback: () => 0,
	}

	return {
		string,
		stringEnum,
		number,
	}
}
export function getXMLAttributes(obj: AnyXMLObject): { [key: string]: string } {
	if (obj.attributes && typeof obj.attributes === 'object' && !Array.isArray(obj.attributes))
		return obj.attributes as any
	else return {}
}
