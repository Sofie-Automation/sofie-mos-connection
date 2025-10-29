import * as XMLBuilder from 'xmlbuilder'
import {
	AnyXMLValue,
	IMOSListSearchableSchema,
	IMOSObjectList,
	IMOSRequestObjectList,
	IMOSSearchField,
} from '@mos-connection/model'
import { omitUndefined } from '../lib.js'
import { getParseMosTypes, getXMLAttributes } from '../parseMosTypes.js'
import { addTextElementInternal } from '../../utils/Utils.js'
import { XMLMosObjects } from '../profile1/index.js'
import { ParseError } from '../ParseError.js'
import { ensureXMLObject, ensureXMLObjectArray, isXMLObject } from '../../utils/ensureMethods.js'
/* eslint-disable @typescript-eslint/no-namespace */

export namespace XMLMosRequestObjectList {
	export function fromXML(path: string, xml: AnyXMLValue, strict: boolean): IMOSRequestObjectList {
		try {
			xml = ensureXMLObject(xml, strict)
			const mosTypes = getParseMosTypes(strict)

			const list: IMOSRequestObjectList = {
				username: mosTypes.string.createRequired(xml.username, 'username'),
				queryID: mosTypes.mosString128.createRequired(xml.queryID, 'queryID'),
				listReturnStart: mosTypes.number.createOptional(xml.listReturnStart, 'listReturnStart') ?? null,
				listReturnEnd: mosTypes.number.createOptional(xml.listReturnEnd, 'listReturnEnd') ?? null,
				generalSearch: mosTypes.mosString128.createRequired(xml.generalSearch, 'generalSearch'),
				mosSchema: mosTypes.string.createRequired(xml.mosSchema, 'mosSchema'),
				searchGroups: [],
			}

			if ('searchGroup' in xml) {
				for (const searchGroup of ensureXMLObjectArray(xml.searchGroup, strict)) {
					const searchFields: IMOSSearchField[] = []
					for (const xmlSearchField of ensureXMLObjectArray(searchGroup.searchField, strict)) {
						const values = {
							...xmlSearchField,
							...getXMLAttributes(xmlSearchField),
						}
						if (values.XPath === undefined) continue
						const searchField: IMOSSearchField = {
							XPath: mosTypes.string.createRequired(values.XPath, 'XPath'),
							sortByOrder: mosTypes.number.createOptional(values.sortByOrder, 'sortByOrder'),
							sortType: mosTypes.string.createOptional(values.sortType, 'sortType'),
						}
						omitUndefined(searchField)
						searchFields.push(searchField)
					}
					list.searchGroups.push({ searchFields })
				}
			}
			omitUndefined(list)
			return list
		} catch (e) {
			throw ParseError.handleCaughtError(path, e)
		}
	}
	export function toXML(xml: XMLBuilder.XMLElement, objList: IMOSRequestObjectList, strict: boolean): void {
		xml.att('username', objList.username)

		addTextElementInternal(xml, 'username', objList.username, undefined, strict)
		addTextElementInternal(xml, 'queryID', objList.queryID, undefined, strict)
		addTextElementInternal(xml, 'listReturnStart', objList.listReturnStart, undefined, strict)
		addTextElementInternal(xml, 'listReturnEnd', objList.listReturnEnd, undefined, strict)
		addTextElementInternal(xml, 'generalSearch', objList.generalSearch, undefined, strict)
		addTextElementInternal(xml, 'mosSchema', objList.mosSchema, undefined, strict)

		for (const searchGroup of objList.searchGroups) {
			const xmlSearchGroup = XMLBuilder.create('searchGroup')
			for (const searchField of searchGroup.searchFields) {
				addTextElementInternal(
					xmlSearchGroup,
					'searchField',
					'',
					{
						XPath: searchField.XPath,
						sortByOrder: searchField.sortByOrder + '',
						sortType: searchField.sortType,
					},
					strict
				)
			}
			xml.importDocument(xmlSearchGroup)
		}
	}
}

export namespace XMLMosObjectList {
	export function fromXML(path: string, xml: AnyXMLValue, strict: boolean): IMOSObjectList {
		try {
			xml = ensureXMLObject(xml, strict)
			const mosTypes = getParseMosTypes(strict)

			const attrs = getXMLAttributes(xml)

			const objList: IMOSObjectList = {
				username: mosTypes.string.createRequired(xml.username || attrs.username, 'username'),
				queryID: mosTypes.string.createRequired(xml.queryID, 'queryID'),
				listReturnStart: mosTypes.number.createRequired(xml.listReturnStart, 'listReturnStart'),
				listReturnEnd: mosTypes.number.createRequired(xml.listReturnEnd, 'listReturnEnd'),
				listReturnTotal: mosTypes.number.createRequired(xml.listReturnTotal, 'listReturnTotal'),
				listReturnStatus: mosTypes.string.createOptional(xml.listReturnStatus, 'listReturnStatus'),
				list: isXMLObject(xml.list) ? XMLMosObjects.fromXML('list.mosObj', xml.list.mosObj, strict) : undefined,
			}
			omitUndefined(objList)
			return objList
		} catch (e) {
			throw ParseError.handleCaughtError(path, e)
		}
	}
	export function toXML(xml: XMLBuilder.XMLElement, objList: IMOSObjectList, strict: boolean): void {
		xml.att('username', objList.username)
		addTextElementInternal(xml, 'queryID', objList.queryID, undefined, strict)
		addTextElementInternal(xml, 'listReturnStart', objList.listReturnStart, undefined, strict)
		addTextElementInternal(xml, 'listReturnEnd', objList.listReturnEnd, undefined, strict)
		addTextElementInternal(xml, 'listReturnTotal', objList.listReturnTotal, undefined, strict)
		addTextElementInternal(xml, 'listReturnStatus', objList.listReturnStatus, undefined, strict)
		if (objList.list) {
			const xmlList = addTextElementInternal(xml, 'list', '', undefined, strict)
			XMLMosObjects.toXML(xmlList, objList.list, strict)
		}
	}
}

export namespace XMLMosListSearchableSchema {
	export function fromXML(path: string, xml: AnyXMLValue, strict: boolean): IMOSListSearchableSchema {
		try {
			xml = ensureXMLObject(xml, strict)
			const mosTypes = getParseMosTypes(strict)

			const attrs = getXMLAttributes(xml)

			const schema: IMOSListSearchableSchema = {
				username: mosTypes.string.createRequired(xml.username || attrs.username, 'username'),
				mosSchema: mosTypes.string.createRequired(xml.mosSchema, 'mosSchema'),
			}
			omitUndefined(schema)
			return schema
		} catch (e) {
			throw ParseError.handleCaughtError(path, e)
		}
	}
	export function toXML(xml: XMLBuilder.XMLElement, schema: IMOSListSearchableSchema, strict: boolean): void {
		xml.att('username', schema.username)
		addTextElementInternal(xml, 'mosSchema', schema.mosSchema, undefined, strict)
	}
}
