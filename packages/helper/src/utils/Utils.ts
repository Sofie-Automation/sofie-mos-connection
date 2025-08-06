import { xml2js as xmlParser } from 'xml-js'
import * as XMLBuilder from 'xmlbuilder'
import {
	AnyXMLValue,
	getMosTypes,
	IMOSDuration,
	IMOSString128,
	IMOSTime,
	stringifyMosType,
} from '@mos-connection/model'
import { MosModel } from '..'

export function xml2js(messageString: string): MosModel.AnyXMLObject {
	const object = xmlParser(messageString, {
		compact: false,
		trim: true,
		nativeType: false, // we want to NOT auto-convert types, to avoid ambiguity
	}) as unknown as MosModel.AnyXMLObject
	// common tags we typically want to know the order of the contents of:
	const orderedTags = new Set(['storyBody', 'mosAbstract', 'description', 'p', 'em', 'span', 'h1', 'h2', 'i', 'b'])

	/**
	 * Doing a post-order tree traversal we try to make the objectified tree as compact as possible.
	 * Whenever we find an "orderedTag" we keep the order of it's children.
	 *
	 * ps: post-order means we make a node's children as compact as possible first, and then try to make
	 * that node compact.
	 */
	const concatChildrenAndTraverseObject = (element: { [key: string]: any }) => {
		if (element.name) {
			element.$name = element.name
			delete element.name
		}
		if (element.type) {
			element.$type = element.type
			delete element.type
		}

		if (element.elements) {
			if (element.elements.length === 1) {
				concatChildrenAndTraverseObject(element.elements[0])

				const childEl = element.elements[0]
				const name = childEl.$name ?? childEl.$type ?? 'unknownElement'
				if (childEl.$type && childEl.$type === 'text') {
					if (childEl.$name === undefined) {
						// pure text node, hoist it up:
						element.$type = 'text'
						element.text = childEl.text
					} else {
						// leave it as is
					}
				} else {
					delete childEl.$name
					delete childEl.$type
					element[name] = element.elements[0]
				}
				delete element.elements
				if (childEl.$type === 'text') {
					element[name] = childEl.text
					if (childEl.attributes) {
						for (const key in childEl.attributes) {
							element[key] = childEl.attributes[key]
						}
						delete childEl.attributes
					}
				}
			} else if (element.elements.length > 1) {
				for (const childEl of element.elements) {
					concatChildrenAndTraverseObject(childEl)
				}

				if (!orderedTags.has(element.$name)) {
					// if the element name is contained in the set of orderedTag names we don't make it any more compact
					const names: Array<string> = element.elements.map(
						(obj: { $name?: string; $type?: string }) => obj.$name || obj.$type || 'unknownElement'
					)
					const namesSet = new Set(names)
					if (namesSet.size === 1 && names.length !== 1 && !namesSet.has('type') && !namesSet.has('name')) {
						// make array compact:
						const array: any = []
						for (const childEl of element.elements) {
							if (childEl.$type && childEl.$type === 'text') {
								if (Object.keys(childEl).length > 2) {
									array.push(childEl)
								} else if (childEl.attributes) {
									childEl.attributes.text = childEl.text
									array.push(childEl.attributes)
								} else {
									array.push(childEl.text)
								}
							} else {
								if (childEl.$type) delete childEl.$type
								if (childEl.$name) delete childEl.$name
								if (Object.keys(childEl).length > 1) {
									// might contain something useful like attributes
									if (childEl.attributes) {
										for (const key in childEl.attributes) {
											childEl[key] = childEl.attributes[key]
										}
										delete childEl.attributes
									}
									array.push(childEl)
								} else {
									array.push(childEl[Object.keys(childEl)[0]])
								}
							}
						}
						element[names[0]] = array
						delete element.elements
					} else if (names.length === namesSet.size) {
						// all elements are unique
						for (const childEl of element.elements) {
							if (
								childEl.$type &&
								childEl.$type === 'text' &&
								(Object.keys(childEl).length <= 3 ||
									(!childEl.$name && Object.keys(childEl).length < 3))
							) {
								if (!childEl.text) {
									element.text = childEl.text
								}
								element[childEl.$name] = childEl.text
							} else {
								if (childEl.attributes) {
									for (const key in childEl.attributes) {
										childEl[key] = childEl.attributes[key]
									}
									delete childEl.attributes
								}
								const name = childEl.$name || childEl.$type || 'unknownEl'
								if (childEl.$type) delete childEl.$type
								if (childEl.$name) delete childEl.$name
								element[name] = childEl
							}
						}
						delete element.elements
					} else if (names.length !== namesSet.size) {
						const holder: { [key: string]: any } = {}
						for (let childEl of element.elements) {
							const name = childEl.$name
							if (childEl.$type === 'text' && Object.keys(childEl).length <= 3) {
								childEl = childEl.text
							} else if (childEl.attributes) {
								for (const key in childEl.attributes) {
									childEl[key] = childEl.attributes[key]
								}
								delete childEl.attributes
							} else {
								if (childEl.$type) delete childEl.$type
								if (childEl.$name) delete childEl.$name
							}
							if (holder[name]) {
								holder[name].push(childEl)
							} else {
								holder[name] = [childEl]
							}
						}
						for (const key in holder) {
							element[key] = holder[key].length > 1 ? holder[key] : holder[key][0]
						}
						delete element.elements
					}
				}
			}
		}
	}
	concatChildrenAndTraverseObject(object)

	const convertEmptyObjectToString = (obj: any): any => {
		if (!!obj && typeof obj === 'object' && Object.keys(obj).length === 0) {
			return ''
		} else {
			return obj
		}
	}
	const mosObject = object.mos as MosModel.AnyXMLObject | undefined
	if (mosObject?.mosID !== undefined) {
		mosObject.mosID = convertEmptyObjectToString(mosObject.mosID)
	}

	return object
}
export function addTextElement(
	root: XMLBuilder.XMLElement,
	elementName: string,
	text?: string | number | null | IMOSString128 | IMOSTime | IMOSDuration,
	attributes?: { [key: string]: string },
	strict = true
): XMLBuilder.XMLElement {
	return addTextElementInternal(root, elementName, text, attributes, strict)
}
export function addTextElementInternal(
	root: XMLBuilder.XMLElement,
	elementName: string,
	content: AnyXMLValue | number | null | IMOSString128 | IMOSTime | IMOSDuration,
	attributes: { [key: string]: string | undefined } | undefined,
	strict: boolean
): XMLBuilder.XMLElement {
	const mosTypes = getMosTypes(strict)
	let txt
	if (content === null) {
		txt = null
	} else if (content !== undefined) {
		const stringified = stringifyMosType(content, mosTypes)
		if (stringified.isMosType) txt = stringified.stringValue
		else txt = content.toString()
	} else {
		txt = undefined
	}
	const element = root.element(elementName, attributes || {}, txt)
	return element
}
/**
 * Utility-function to convert a XMLBuilder.XMLElement into the generic object which can be sent
 * into the ***.fromXML(xml:any) methods in MosModel
 */
export function xmlToObject(root: XMLBuilder.XMLElement): any {
	const obj: any = {}
	let hasAttribs = false

	if (root.attribs) {
		for (const attr of Object.values<XMLBuilder.XMLAttribute>(root.attribs)) {
			hasAttribs = true
			if (!obj.attributes) obj.attributes = {}
			obj.attributes[attr.name] = attr.value
		}
	}
	// @ts-expect-error hack
	if (root.children.length === 1 && root.children[0].name === '#text') {
		if (hasAttribs) {
			// @ts-expect-error hack
			obj.text = root.children[0].value
			return obj
		} else {
			// @ts-expect-error hack
			return root.children[0].value
		}
	}

	for (const child of root.children) {
		if ((child as any).name) {
			const ch = child as XMLBuilder.XMLElement
			if (obj[ch.name]) {
				if (!Array.isArray(obj[ch.name])) {
					obj[ch.name] = [obj[ch.name]] // make an array
				}
				obj[ch.name].push(xmlToObject(ch))
			} else {
				obj[ch.name] = xmlToObject(ch)
			}
		}
	}

	return obj
}
