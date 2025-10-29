import * as XMLBuilder from 'xmlbuilder'
import {
	IMOSObject,
	IMOSAck,
	IMOSAckStatus,
	IMOSObjectPath,
	IMOSObjectPathType,
	IMOSExternalMetaData,
	AnyXMLValue,
	AnyXMLValueSingular,
	IMOSObjectType,
	IMOSObjectStatus,
	IMOSObjectAirStatus,
	IMOSScope,
} from '@mos-connection/model'
import { AnyXMLObject, flattenXMLText, has, isEmpty, literal, omitUndefined } from '../lib.js'
import { ensureArray, ensureXMLObject, ensureXMLObjectArray, isXMLObject } from '../../utils/ensureMethods.js'
import { addTextElementInternal } from '../../utils/Utils.js'
import { getParseMosTypes } from '../parseMosTypes.js'
import { ParseError } from '../ParseError.js'

/* eslint-disable @typescript-eslint/no-namespace */
export namespace XMLMosAck {
	export function fromXML(path: string, xml: AnyXMLValue, strict: boolean): IMOSAck {
		try {
			xml = ensureXMLObject(xml, strict)
			const mosTypes = getParseMosTypes(strict)

			const ack: IMOSAck = {
				ID: mosTypes.mosString128.createRequired(xml.objID, 'objID'),
				Revision: mosTypes.number.createOptional(xml.objRev, 'objRev') ?? 0,
				Status:
					mosTypes.stringEnum.createOptional({ value: xml.status, enum: IMOSAckStatus }, 'status') ||
					IMOSAckStatus.ACK,
				Description: mosTypes.mosString128.createRequired(xml.statusDescription || '', 'statusDescription'),
			}
			omitUndefined(ack)
			return ack
		} catch (e) {
			throw ParseError.handleCaughtError(path, e)
		}
	}
}
export namespace XMLMosObjects {
	export function fromXML(path: string, xml: AnyXMLValue, strict: boolean): IMOSObject[] {
		try {
			const mosObj = isXMLObject(xml) && xml.mosObj ? xml.mosObj : xml
			const mosObjs: IMOSObject[] = []
			for (const xmlObj of ensureArray<AnyXMLObject | AnyXMLValueSingular>(mosObj)) {
				mosObjs.push(XMLMosObject.fromXML(`mosObj`, xmlObj, strict))
			}
			omitUndefined(mosObjs)
			return mosObjs
		} catch (e) {
			throw ParseError.handleCaughtError(path, e)
		}
	}
	export function toXML(xml: XMLBuilder.XMLElement, objs: IMOSObject[], strict: boolean): void {
		for (const obj of objs) {
			const xmlMosObj = XMLBuilder.create('mosObj')
			XMLMosObject.toXML(xmlMosObj, obj, strict)
			xml.importDocument(xmlMosObj)
		}
	}
}
export namespace XMLMosObject {
	export function fromXML(path: string, xml: AnyXMLValue, strict: boolean): IMOSObject {
		try {
			const mosTypes = getParseMosTypes(strict)
			xml = ensureXMLObject(xml, strict)

			const mosObj = literal<IMOSObject>({
				ID: mosTypes.mosString128.createOptional(xml.objID, 'objID'),
				Slug: mosTypes.mosString128.createRequired(xml.objSlug, 'objSlug'),
				MosAbstract: xml.mosAbstract,
				MosAbstractStr: flattenXMLText(xml.mosAbstract, strict),
				Group: mosTypes.string.createOptional(xml.objGroup, 'objGroup'),
				Type:
					mosTypes.stringEnum.createOptional({ value: xml.objType, enum: IMOSObjectType }, 'objType') ||
					IMOSObjectType.OTHER,
				TimeBase: mosTypes.number.createRequired(xml.objTB, 'objTB'),
				Revision: mosTypes.number.createOptional(xml.objRev, 'objRev'),
				Duration: mosTypes.number.createRequired(xml.objDur, 'objDur'),
				Status: mosTypes.stringEnum.createOptional({ value: xml.status, enum: IMOSObjectStatus }, 'status'),
				AirStatus: mosTypes.stringEnum.createOptional(
					{ value: xml.objAir, enum: IMOSObjectAirStatus },
					'objAir'
				),
				Paths: XMLObjectPaths.fromXML('objPaths', xml.objPaths, strict),
				CreatedBy: mosTypes.mosString128.createOptional(xml.createdBy, 'createdBy'),
				Created: mosTypes.mosTime.createOptional(xml.created, 'created'),
				ChangedBy: mosTypes.mosString128.createOptional(xml.changedBy, 'changedBy'),
				Changed: mosTypes.mosTime.createOptional(xml.changed, 'changed'),
				Description: xml.description,
				DescriptionStr: mosTypes.string.createOptional(flattenXMLText(xml.description, strict), 'description'),

				MosItemEditorProgID: mosTypes.mosString128.createOptional(
					xml.mosItemEditorProgID,
					'mosItemEditorProgID'
				),
				MosExternalMetaData: has(xml, 'mosExternalMetadata')
					? XMLMosExternalMetaData.fromXML('mosExternalMetadata', xml.mosExternalMetadata, strict)
					: undefined,
			})
			omitUndefined(mosObj)
			return mosObj
		} catch (e) {
			throw ParseError.handleCaughtError(path, e)
		}
	}
	export function toXML(xml: XMLBuilder.XMLElement, obj: IMOSObject, strict: boolean): void {
		if (obj.ID) addTextElementInternal(xml, 'objID', obj.ID, undefined, strict)
		addTextElementInternal(xml, 'objSlug', obj.Slug, undefined, strict)
		if (obj.MosAbstract) addTextElementInternal(xml, 'mosAbstract', obj.MosAbstract, undefined, strict)
		if (obj.Group) addTextElementInternal(xml, 'objGroup', obj.Group, undefined, strict)
		addTextElementInternal(xml, 'objType', obj.Type, undefined, strict)
		addTextElementInternal(xml, 'objTB', obj.TimeBase, undefined, strict)
		addTextElementInternal(xml, 'objRev', obj.Revision, undefined, strict)
		addTextElementInternal(xml, 'objDur', obj.Duration, undefined, strict)
		addTextElementInternal(xml, 'status', obj.Status, undefined, strict)
		addTextElementInternal(xml, 'objAir', obj.AirStatus, undefined, strict)
		if (obj.Paths) XMLObjectPaths.toXML(xml, obj.Paths, strict)
		addTextElementInternal(xml, 'createdBy', obj.CreatedBy, undefined, strict)
		addTextElementInternal(xml, 'created', obj.Created, undefined, strict)
		if (obj.ChangedBy) addTextElementInternal(xml, 'changedBy', obj.ChangedBy, undefined, strict)
		if (obj.Changed) addTextElementInternal(xml, 'changed', obj.Changed, undefined, strict)
		if (obj.Description) addTextElementInternal(xml, 'description', obj.Description, undefined, strict) // not handled (todo)
		if (obj.MosItemEditorProgID)
			addTextElementInternal(xml, 'mosItemEditorProgID', obj.MosItemEditorProgID, undefined, strict)
		if (obj.MosExternalMetaData) XMLMosExternalMetaData.toXML(xml, obj.MosExternalMetaData)
	}
}

export namespace XMLObjectPaths {
	export function fromXML(path: string, xmlObjPaths: AnyXMLValue, strict: boolean): IMOSObjectPath[] {
		try {
			if (!xmlObjPaths) {
				if (strict) throw new Error(`objPaths: Expected an object or array, got: ${xmlObjPaths}`)
			}

			const parseMosTypes = getParseMosTypes(strict)

			const xmlToArray = (obj: AnyXMLValue): IMOSObjectPath[] => {
				const paths: IMOSObjectPath[] = []

				obj = ensureXMLObject(obj, strict)

				// Possible inputs:
				/*
				Single obj path
					{
						objPath: '41cfc641849c417eaa10e4f3c377f181',
						techDescription: 'VIDEO'
					}

					{
						objPath: {
							text: '41cfc641849c417eaa10e4f3c377f181',
							techDescription: 'VIDEO'
						},
						objProxyPath: {
							text: 'http://server/proxy/clipe.wmv',
							techDescription: 'WM9 750Kbps'
						}
					}

					{
						objPath: { attributes: { techDescription: 'asdfasdf' }, text: 'asdfasdf' },
						objMetadataPath: { attributes: { techDescription: 'skdjhfb' }, text: '8372h4fv' }
					}
					{
						objPath: [
							{
								'$name': 'objPath',
								'$type': 'text',
								text: '41cfc641849c417eaa10e4f3c377f181',
								techDescription: 'VIDEO'
							},
							{
								'$name': 'objPath',
								'$type': 'text',
								text: 'abc123.mp4',
								techDescription: 'MYVIDEO'
							}
						],
						objProxyPath: {
							'$name': 'objProxyPath',
							'$type': 'text',
							text: 'http://server/proxy/clipe.wmv',
							techDescription: 'WM9 750Kbps'
						}
					}
				*/

				const tmpPaths: {
					Type: IMOSObjectPathType
					techDescription: AnyXMLValue
					Target: AnyXMLValue
				}[] = []

				// When there is only one: -------------------------------------------
				if (typeof obj.objPath === 'string' && obj.techDescription) {
					// A single objPath
					tmpPaths.push({
						Type: IMOSObjectPathType.PATH,
						techDescription: obj.techDescription,
						Target: obj.objPath,
					})
				}
				if (typeof obj.objProxyPath === 'string' && obj.techDescription) {
					// A single objProxyPath
					tmpPaths.push({
						Type: IMOSObjectPathType.PROXY_PATH,
						techDescription: obj.techDescription,
						Target: obj.objProxyPath,
					})
				}
				if (typeof obj.objMetadataPath === 'string' && obj.techDescription) {
					// A single objMetadataPath
					tmpPaths.push({
						Type: IMOSObjectPathType.METADATA_PATH,
						techDescription: obj.techDescription,
						Target: obj.objMetadataPath,
					})
				}

				// When there are multiple: -------------------------------------------

				if (Array.isArray(obj.objPath)) {
					for (const objPath of ensureXMLObjectArray(obj.objPath, strict)) {
						tmpPaths.push({
							Type: IMOSObjectPathType.PATH,
							techDescription: objPath.techDescription,
							Target: objPath.text,
						})
					}
				} else if (isXMLObject(obj.objPath) && isXMLObject(obj.objPath.attributes)) {
					tmpPaths.push({
						Type: IMOSObjectPathType.PATH,
						techDescription: obj.objPath.attributes.techDescription,
						Target: obj.objPath.text,
					})
				} else if (isXMLObject(obj.objPath) && obj.objPath.text) {
					tmpPaths.push({
						Type: IMOSObjectPathType.PATH,
						techDescription: obj.objPath.techDescription,
						Target: obj.objPath.text,
					})
				}
				if (Array.isArray(obj.objProxyPath)) {
					for (const objProxyPath of ensureXMLObjectArray(obj.objProxyPath, strict)) {
						tmpPaths.push({
							Type: IMOSObjectPathType.PROXY_PATH,
							techDescription: objProxyPath.techDescription,
							Target: objProxyPath.text,
						})
					}
				} else if (isXMLObject(obj.objProxyPath) && isXMLObject(obj.objProxyPath.attributes)) {
					tmpPaths.push({
						Type: IMOSObjectPathType.PROXY_PATH,
						techDescription: obj.objProxyPath.attributes.techDescription,
						Target: obj.objProxyPath.text,
					})
				} else if (isXMLObject(obj.objProxyPath) && obj.objProxyPath.text) {
					tmpPaths.push({
						Type: IMOSObjectPathType.PROXY_PATH,
						techDescription: obj.objProxyPath.techDescription,
						Target: obj.objProxyPath.text,
					})
				}

				if (Array.isArray(obj.objMetadataPath)) {
					for (const objMetadataPath of ensureXMLObjectArray(obj.objMetadataPath, strict)) {
						tmpPaths.push({
							Type: IMOSObjectPathType.METADATA_PATH,
							techDescription: objMetadataPath.techDescription,
							Target: objMetadataPath.text,
						})
					}
				} else if (isXMLObject(obj.objMetadataPath) && isXMLObject(obj.objMetadataPath.attributes)) {
					tmpPaths.push({
						Type: IMOSObjectPathType.METADATA_PATH,
						techDescription: obj.objMetadataPath.attributes.techDescription,
						Target: obj.objMetadataPath.text,
					})
				} else if (isXMLObject(obj.objMetadataPath) && obj.objMetadataPath.text) {
					tmpPaths.push({
						Type: IMOSObjectPathType.METADATA_PATH,
						techDescription: obj.objMetadataPath.techDescription,
						Target: obj.objMetadataPath.text,
					})
				}

				for (const tmpPath of tmpPaths) {
					paths.push({
						Type: tmpPath.Type,
						Description: parseMosTypes.string.createRequired(tmpPath.techDescription, 'techDescription'),
						Target: parseMosTypes.string.createRequired(tmpPath.Target, 'target'),
					})
				}

				return paths
			}
			const xmlPaths = xmlToArray(xmlObjPaths)
			omitUndefined(xmlPaths)
			return xmlPaths
		} catch (e) {
			throw ParseError.handleCaughtError(path, e)
		}
	}

	export function toXML(xmlItem: XMLBuilder.XMLElement, paths: IMOSObjectPath[] | undefined, strict: boolean): void {
		if (paths) {
			const xmlObjPaths = addTextElementInternal(xmlItem, 'objPaths', undefined, undefined, strict)
			paths.forEach((path: IMOSObjectPath) => {
				if (path.Type === IMOSObjectPathType.PATH) {
					addTextElementInternal(
						xmlObjPaths,
						'objPath',
						path.Target,
						{
							techDescription: path.Description,
						},
						strict
					)
				} else if (path.Type === IMOSObjectPathType.PROXY_PATH) {
					addTextElementInternal(
						xmlObjPaths,
						'objProxyPath',
						path.Target,
						{
							techDescription: path.Description,
						},
						strict
					)
				} else if (path.Type === IMOSObjectPathType.METADATA_PATH) {
					addTextElementInternal(
						xmlObjPaths,
						'objMetadataPath',
						path.Target,
						{
							techDescription: path.Description,
						},
						strict
					)
				}
			})
		}
	}
}
export namespace XMLMosExternalMetaData {
	export function fromXML(path: string, xml: AnyXMLValue, strict: boolean): IMOSExternalMetaData[] {
		try {
			const mosTypes = getParseMosTypes(strict)

			const metadata: IMOSExternalMetaData[] = []
			for (const xmlMetadata of ensureXMLObjectArray(xml, strict)) {
				metadata.push({
					MosScope: mosTypes.stringEnum.createRequired(
						{ value: xmlMetadata.mosScope, enum: IMOSScope },
						'mosScope'
					),
					MosSchema: mosTypes.string.createRequired(xmlMetadata.mosSchema, 'mosSchema'),
					MosPayload: fixXMLMosPayload(xmlMetadata.mosPayload),
				})
			}
			omitUndefined(metadata)
			return metadata
		} catch (e) {
			throw ParseError.handleCaughtError(path, e)
		}
	}

	export function toXML(xml: XMLBuilder.XMLElement, metadatas: IMOSExternalMetaData[]): void {
		for (const metadata of metadatas) {
			const xmlMetadata = XMLBuilder.create({
				mosExternalMetadata: {
					mosScope: metadata.MosScope,
					mosSchema: metadata.MosSchema,
					mosPayload: metadata.MosPayload,
				},
			})
			xml.importDocument(xmlMetadata)
		}
	}
}

/** Replace any empty objects with "" */
function fixXMLMosPayload(value: AnyXMLValueSingular): AnyXMLValueSingular
function fixXMLMosPayload(value: AnyXMLObject): AnyXMLObject
function fixXMLMosPayload(value: AnyXMLValue): AnyXMLValue
function fixXMLMosPayload(value: AnyXMLValue): AnyXMLValue {
	if (typeof value === 'object') {
		if (Array.isArray(value)) {
			for (let i = 0; i < value.length; i++) {
				value[i] = fixXMLMosPayload(value[i]) as any
			}
		} else {
			if (isEmpty(value)) return '' // In xml, an empty tag results in an empty object

			for (const key of Object.keys(value)) {
				value[key] = fixXMLMosPayload(value[key])
			}
		}
	}
	return value
}
