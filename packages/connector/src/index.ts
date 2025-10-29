export * from './MosConnection.js'
export * from './api.js'
export * from '@mos-connection/helper'

export { ConnectionConfig } from './config/connectionConfig.js'

export { MosDevice } from './MosDevice.js'

// Backwards compatibility
import { xml2js, pad, addTextElement, xmlToObject } from '@mos-connection/helper'
export const Utils = {
	pad,
	xml2js,
	addTextElement,
	xmlToObject,
}
