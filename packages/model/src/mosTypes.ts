import * as MosString128 from './mosTypes/mosString128.js'
import * as MosDuration from './mosTypes/mosDuration.js'
import * as MosTime from './mosTypes/mosTime.js'
import { AnyXMLValue } from './xmlParse.js'

export { IMOSString128 } from './mosTypes/mosString128.js'
export { IMOSDuration } from './mosTypes/mosDuration.js'
export { IMOSTime } from './mosTypes/mosTime.js'

/**
 * Returns utility-functions for handling of MosTypes.
 * @example
 * const mosTypes = getMosTypes(true)
 * const myString128 = mosTypes.mosString128.create('Hello world')
 * const myString = mosTypes.mosString128.stringify(myString128)
 * @param strict If true, creating out-of-spec values will throw an error (Example: Creating longer-than-128-characters long MosString128).
 */
export function getMosTypes(strict: boolean): MosTypes {
	return {
		strict,
		mosString128: getMosType(MosString128, strict),
		mosDuration: getMosType(MosDuration, strict),
		mosTime: getMosType(MosTime, strict),
	}
}
export interface MosTypes {
	strict: boolean
	mosString128: MosType<MosString128.IMOSString128, string, MosString128.AnyValue>
	mosDuration: MosType<MosDuration.IMOSDuration, number, MosDuration.AnyValue>
	mosTime: MosType<MosTime.IMOSTime, number, MosTime.AnyValue>
}
/**
 * If value is a MosType, stringify it.
 * Throw error otherwise
 */
export function stringifyMosType(
	value: MosString128.IMOSString128 | MosDuration.IMOSDuration | MosTime.IMOSTime | any,
	mosTypes: MosTypes
):
	| {
			isMosType: true
			stringValue: string
	  }
	| {
			isMosType: false
	  } {
	if (mosTypes.mosTime.is(value)) return { isMosType: true, stringValue: mosTypes.mosTime.stringify(value) }
	if (mosTypes.mosDuration.is(value)) return { isMosType: true, stringValue: mosTypes.mosDuration.stringify(value) }
	if (mosTypes.mosString128.is(value)) return { isMosType: true, stringValue: mosTypes.mosString128.stringify(value) }

	return { isMosType: false }
}

export interface MosType<Serialized, Value, CreateValue> {
	/** Creates a MosType using provided data. The MosType is then used in data sent into MOS-connection  */
	create: (anyValue: CreateValue) => Serialized
	/** (internal function) Validate the data. Throws if something is wrong with the data */
	validate: (value: Serialized) => void
	/** Returns the value of the MosType */
	valueOf: (value: Serialized) => Value
	/** Returns a stringified representation of the MosType */
	stringify: (value: Serialized) => string
	/** Returns true if the provided data is of this MosType */
	is: (value: Serialized | any) => value is Serialized

	/** Returns a fallback value, used to replace missing or non-parsable data in non-strict mode */
	fallback: () => Serialized
}

interface InternalMosType<Serialized, Value> {
	create: (anyValue: any, strict: boolean) => Serialized
	validate: (value: Serialized, strict: boolean) => void
	valueOf(value: Serialized): Value
	stringify(value: Serialized): string
	is(value: Serialized | any): value is Serialized
	fallback(): Serialized
}
function getMosType<Serialized, Value, CreateValue>(
	mosType: InternalMosType<Serialized, Value>,
	strict: boolean
): MosType<Serialized, Value, CreateValue> {
	return {
		create: (value: CreateValue): Serialized => mosType.create(value, strict),
		validate: (value: Serialized): void => mosType.validate(value, strict),
		stringify: (value: Serialized): string => mosType.stringify(value),
		valueOf: (value: Serialized): Value => mosType.valueOf(value),
		is: (value: Serialized): value is Serialized => mosType.is(value),
		fallback: (): Serialized => mosType.fallback(),
	}
}

export interface IMOSExternalMetaData {
	MosScope?: IMOSScope
	MosSchema: string
	MosPayload: AnyXMLValue
}
export enum IMOSScope {
	OBJECT = 'OBJECT',
	STORY = 'STORY',
	PLAYLIST = 'PLAYLIST',
}
