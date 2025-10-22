export * from './MosMessage.js'
export { AnyXMLObject, AnyXMLValue, AnyXMLValueSingular } from '@mos-connection/model'
export * from './profile0/index.js'
export * from './profile1/index.js'
export * from './profile2/index.js'
export * from './profile3/index.js'
export * from './profile4/index.js'
export * from './parseMosTypes.js'
export { literal, omitUndefined, flattenXMLText } from './lib.js'
export * from '../utils/ensureMethods.js'
export * from './ParseError.js'

import { AnyXMLObject } from '@mos-connection/model'
/** @deprecated use AnyXMLObject instead  */
export type AnyXML = AnyXMLObject // for backwards compatibility
