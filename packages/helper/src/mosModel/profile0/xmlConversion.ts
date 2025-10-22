import * as XMLBuilder from 'xmlbuilder'
import {
	AnyXMLValue,
	IMOSDefaultActiveX,
	IMOSListMachInfo,
	IMOSListMachInfoDefaultActiveXMode,
	IMOSString128,
} from '@mos-connection/model'
import { has, omitUndefined } from '../lib.js'
import { ensureArray, ensureStringLiteral, ensureXMLObject } from '../../utils/ensureMethods.js'
import { addTextElementInternal } from '../../utils/Utils.js'
import { getParseMosTypes, getXMLAttributes } from '../parseMosTypes.js'
import { XMLMosExternalMetaData } from '../profile1/index.js'
import { ParseError } from '../ParseError.js'

/* eslint-disable @typescript-eslint/no-namespace */
export namespace XMLMosIDs {
	export function fromXML(path: string, xml: AnyXMLValue, strict: boolean): IMOSString128[] {
		try {
			const mosTypes = getParseMosTypes(strict)
			return ensureArray(xml).map((id, index) => mosTypes.mosString128.createRequired(id, `[${index}]`))
		} catch (e) {
			throw ParseError.handleCaughtError(path, e)
		}
	}
}

/* eslint-disable @typescript-eslint/no-namespace */
export namespace XMLMosListMachInfo {
	export function fromXML(path: string, xml: AnyXMLValue, strict: boolean): IMOSListMachInfo {
		try {
			xml = ensureXMLObject(xml, strict)
			const { mosString128, mosTime } = getParseMosTypes(strict)

			const list: IMOSListMachInfo = {
				manufacturer: mosString128.createRequired(xml.manufacturer, 'manufacturer'),
				model: mosString128.createRequired(xml.model, 'model'),
				hwRev: mosString128.createRequired(xml.hwRev, 'hwRev'),
				swRev: mosString128.createRequired(xml.swRev, 'swRev'),
				DOM: mosString128.createRequired(xml.DOM, 'DOM'),
				SN: mosString128.createRequired(xml.SN, 'SN'),
				ID: mosString128.createRequired(xml.ID, 'ID'),
				time: mosTime.createRequired(xml.time, 'time'),
				opTime: mosTime.createOptional(xml.opTime, 'opTime'),
				mosRev: mosString128.createRequired(xml.mosRev, 'mosRev'),

				supportedProfiles: XMLSupportedProfiles.fromXML('supportedProfiles', xml.supportedProfiles, strict),
				defaultActiveX: has(xml, 'defaultActiveX')
					? XMLDefaultActiveX.fromXML('defaultActiveX', xml.defaultActiveX, strict)
					: undefined,

				mosExternalMetaData: has(xml, 'mosExternalMetadata')
					? XMLMosExternalMetaData.fromXML('mosExternalMetaData', xml.mosExternalMetaData, strict)
					: undefined,
			}
			omitUndefined(list)
			return list
		} catch (e) {
			throw ParseError.handleCaughtError(path, e)
		}
	}
	export function toXML(xmlListMachInfo: XMLBuilder.XMLElement, info: IMOSListMachInfo, strict: boolean): void {
		addTextElementInternal(xmlListMachInfo, 'manufacturer', info.manufacturer, undefined, strict)
		addTextElementInternal(xmlListMachInfo, 'model', info.model, undefined, strict)
		addTextElementInternal(xmlListMachInfo, 'hwRev', info.hwRev, undefined, strict)
		addTextElementInternal(xmlListMachInfo, 'swRev', info.swRev, undefined, strict)
		addTextElementInternal(xmlListMachInfo, 'DOM', info.DOM, undefined, strict)
		addTextElementInternal(xmlListMachInfo, 'SN', info.SN, undefined, strict)
		addTextElementInternal(xmlListMachInfo, 'ID', info.ID, undefined, strict)
		addTextElementInternal(xmlListMachInfo, 'time', info.time, undefined, strict)
		if (info.opTime) addTextElementInternal(xmlListMachInfo, 'opTime', info.opTime, undefined, strict)
		addTextElementInternal(xmlListMachInfo, 'mosRev', info.mosRev, undefined, strict)

		XMLSupportedProfiles.toXML(xmlListMachInfo, info.supportedProfiles, strict)
		if (info.defaultActiveX) XMLDefaultActiveX.toXML(xmlListMachInfo, info.defaultActiveX, strict)
		if (info.mosExternalMetaData) XMLMosExternalMetaData.toXML(xmlListMachInfo, info.mosExternalMetaData)
	}
}

export namespace XMLSupportedProfiles {
	export function fromXML(
		path: string,
		xmlSupportedProfiles: AnyXMLValue,
		strict: boolean
	): IMOSListMachInfo['supportedProfiles'] {
		try {
			if (typeof xmlSupportedProfiles !== 'object')
				if (strict)
					throw new Error(`Invalid supportedProfiles! Expected object, got: "${xmlSupportedProfiles}"`)
				else return { deviceType: 'N/A' }
			if (Array.isArray(xmlSupportedProfiles))
				throw new Error(
					`Invalid supportedProfiles! Expected object, got array: "${JSON.stringify(xmlSupportedProfiles)}"`
				)

			const parsed: IMOSListMachInfo['supportedProfiles'] = {
				deviceType: ensureStringLiteral(xmlSupportedProfiles.deviceType, ['NCS', 'MOS', 'N/A'], strict, 'N/A'),
				// Note: .profiles are added below
			}

			for (const mosProfile of ensureArray(xmlSupportedProfiles.mosProfile)) {
				if (typeof mosProfile === 'string')
					throw new Error(`Invalid mosProfile! Expected object, got: "${mosProfile}"`)
				if (mosProfile === undefined) continue

				const attrs = getXMLAttributes(mosProfile)

				if (typeof attrs.number !== 'string') {
					if (strict) throw new Error(`attributes.number missing`)
					else continue
				}
				if (typeof mosProfile.text !== 'string') {
					if (strict) throw new Error(`mosProfile.text missing`)
					else continue
				}

				// @ts-expect-error hack
				parsed[`profile${attrs.number}`] = mosProfile.text === 'YES'
			}
			omitUndefined(parsed)
			return parsed
		} catch (e) {
			throw ParseError.handleCaughtError(path, e)
		}
	}
	export function toXML(
		xml: XMLBuilder.XMLElement,
		supportedProfiles: IMOSListMachInfo['supportedProfiles'],
		strict: boolean
	): void {
		const xmlSupportedProfiles = XMLBuilder.create('supportedProfiles')
		xmlSupportedProfiles.att('deviceType', supportedProfiles.deviceType)
		// let p = addTextElement(root, 'supportedProfiles').att('deviceType', info.supportedProfiles.deviceType)
		for (let i = 0; i < 8; i++) {
			addTextElementInternal(
				xmlSupportedProfiles,
				'mosProfile',
				(supportedProfiles as any)['profile' + i] ? 'YES' : 'NO',
				undefined,
				strict
			).att('number', i)
		}
		xml.importDocument(xmlSupportedProfiles)
	}
}

export namespace XMLDefaultActiveX {
	export function fromXML(path: string, xml: AnyXMLValue, strict: boolean): IMOSDefaultActiveX[] {
		try {
			const mosTypes = getParseMosTypes(strict)

			const defaultActiveX: IMOSDefaultActiveX[] = []
			for (const xmlObj of ensureArray(xml)) {
				if (!xmlObj) continue

				if (typeof xmlObj !== 'object') {
					if (strict) throw new Error(`defaultActiveX: Expected an object, got: "${xmlObj}"`)
					else continue
				}
				if (typeof xmlObj === 'object' && Array.isArray(xmlObj)) {
					if (strict)
						throw new Error(`defaultActiveX: Expected an object, got an array: "${JSON.stringify(xmlObj)}"`)
					else continue
				}

				const parsedObj: IMOSDefaultActiveX = {
					mode: mosTypes.stringEnum.createRequired(
						{ enum: IMOSListMachInfoDefaultActiveXMode, value: xmlObj.mode },
						'mode'
					),
					controlFileLocation: mosTypes.string.createRequired(
						xmlObj.controlFileLocation,
						'controlFileLocation'
					),
					controlSlug: mosTypes.mosString128.createRequired(xmlObj.controlSlug, 'controlSlug'),
					controlName: mosTypes.string.createRequired(xmlObj.controlName, 'controlName'),
					controlDefaultParams: mosTypes.string.createRequired(
						xmlObj.controlDefaultParams,
						'controlDefaultParams'
					),
				}

				defaultActiveX.push(parsedObj)
			}
			omitUndefined(defaultActiveX)
			return defaultActiveX
		} catch (e) {
			throw ParseError.handleCaughtError(path, e)
		}
	}
	export function toXML(xml: XMLBuilder.XMLElement, objs: IMOSDefaultActiveX[], strict: boolean): void {
		for (const obj of objs) {
			const xmlItem = addTextElementInternal(xml, 'defaultActiveX', undefined, undefined, strict)

			addTextElementInternal(xmlItem, 'mode', obj.mode, undefined, strict)
			addTextElementInternal(xmlItem, 'controlFileLocation', obj.controlFileLocation, undefined, strict)
			addTextElementInternal(xmlItem, 'controlSlug', obj.controlSlug, undefined, strict)
			addTextElementInternal(xmlItem, 'controlName', obj.controlName, undefined, strict)
			addTextElementInternal(xmlItem, 'controlDefaultParams', obj.controlDefaultParams, undefined, strict)
		}
	}
}
