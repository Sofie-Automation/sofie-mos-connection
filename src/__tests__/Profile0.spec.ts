import {
	checkMessageSnapshot,
	clearMocks,
	decode,
	DEFAULT_TIMEOUT,
	delay,
	doBeforeAll,
	encode,
	fakeIncomingMessage,
	getMessageId,
	getMosConnection,
	getMosDevice,
	getXMLReply,
	setupMocks,
} from './lib'
import { MosConnection, MosDevice, IMOSObject, IMOSListMachInfo, MosString128, MosTime } from '..'
import { SocketMock } from '../__mocks__/socket'
import { xmlData, xmlApiData } from '../__mocks__/testData'

/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-ignore imports are unused
import { Socket } from 'net'
/* eslint-enable @typescript-eslint/no-unused-vars */

beforeAll(() => {
	setupMocks()
})
beforeEach(() => {
	clearMocks()
})
describe('Profile 0', () => {
	let mosDevice: MosDevice
	let mosConnection: MosConnection

	let socketMockLower: SocketMock
	let socketMockUpper: SocketMock
	let socketMockQuery: SocketMock

	let serverSocketMockLower: SocketMock
	let serverSocketMockUpper: SocketMock
	let serverSocketMockQuery: SocketMock

	let onRequestMachineInfo: jest.Mock<any, any>
	let onRequestMOSObject: jest.Mock<any, any>
	let onRequestAllMOSObjects: jest.Mock<any, any>

	beforeAll(async () => {
		mosConnection = await getMosConnection(
			{
				'0': true,
				'1': true, // Must support at least one other profile
			},
			true
		)
		mosDevice = await getMosDevice(mosConnection)

		// Profile 0:
		onRequestMachineInfo = jest.fn(async () => {
			return xmlApiData.machineInfo
		})
		mosDevice.onRequestMachineInfo(async (): Promise<IMOSListMachInfo> => {
			return onRequestMachineInfo()
		})
		// Profile 1:
		onRequestMOSObject = jest.fn(async () => {
			return xmlApiData.mosObj
		})
		onRequestAllMOSObjects = jest.fn(async () => {
			return [xmlApiData.mosObj, xmlApiData.mosObj2]
		})
		mosDevice.onRequestMOSObject(async (objId: string): Promise<IMOSObject | null> => {
			return onRequestMOSObject(objId)
		})
		mosDevice.onRequestAllMOSObjects(async (): Promise<Array<IMOSObject>> => {
			return onRequestAllMOSObjects()
		})
		const b = doBeforeAll()
		socketMockLower = b.socketMockLower
		socketMockUpper = b.socketMockUpper
		socketMockQuery = b.socketMockQuery
		serverSocketMockLower = b.serverSocketMockLower
		serverSocketMockUpper = b.serverSocketMockUpper
		serverSocketMockQuery = b.serverSocketMockQuery
	})
	afterAll(async () => {
		await mosDevice.dispose()
		await mosConnection.dispose()
	})
	beforeEach(() => {
		onRequestMOSObject.mockClear()
		onRequestAllMOSObjects.mockClear()

		serverSocketMockLower.mockClear()
		serverSocketMockUpper.mockClear()
		if (serverSocketMockQuery) serverSocketMockQuery.mockClear()
		socketMockLower.mockClear()
		socketMockUpper.mockClear()
		if (socketMockQuery) socketMockQuery.mockClear()
	})
	test('init', async () => {
		expect(mosDevice).toBeTruthy()
		expect(socketMockLower).toBeTruthy()
		expect(socketMockUpper).toBeTruthy()
		expect(serverSocketMockLower).toBeTruthy()
	})
	test('heartbeat from other party', async () => {
		expect(serverSocketMockLower).toBeTruthy()

		serverSocketMockLower.setAutoReplyToHeartBeat(false) // Handle heartbeat manually

		const serverReply: jest.Mock<any, any> = jest.fn(() => false)
		serverSocketMockLower.mockAddReply(serverReply)
		// Fake incoming message on socket:
		const sendMessageId = await fakeIncomingMessage(serverSocketMockLower, xmlData.heartbeat)
		await delay(10) // to allow for async timers & events to triggered

		expect(serverReply).toHaveBeenCalledTimes(1)

		const msg = serverSocketMockLower.decode(serverReply.mock.calls[0][0])

		expect(msg).toMatch(/<heartbeat/)
		expect(msg).toMatch('<messageID>' + sendMessageId)
	})

	test('unknown party connects', async () => {
		expect(serverSocketMockLower).toBeTruthy()
		serverSocketMockLower.setAutoReplyToHeartBeat(false)
		const serverReply: jest.Mock<any, any> = jest.fn(() => false)
		serverSocketMockLower.mockAddReply(serverReply)

		// Fake incoming message on socket:
		let sendMessageId = await fakeIncomingMessage(serverSocketMockLower, xmlData.heartbeat, 'ourUnknownMosId')
		await delay(10) // to allow for async timers & events to triggered

		expect(serverReply).toHaveBeenCalledTimes(1)
		let msg = serverSocketMockLower.decode(serverReply.mock.calls[0][0])
		expect(msg).toMatch(/<mosAck>/)
		expect(msg).toMatch('<messageID>' + sendMessageId)
		expect(msg).toMatch('<status>NACK')

		serverReply.mockClear()
		serverSocketMockLower.mockAddReply(serverReply)

		// Fake incoming message on socket:
		sendMessageId = await fakeIncomingMessage(
			serverSocketMockLower,
			xmlData.heartbeat,
			undefined,
			'theirUnknownMosId'
		)
		await delay(10) // to allow for async timers & events to triggered

		expect(serverReply).toHaveBeenCalledTimes(1)
		msg = serverSocketMockLower.decode(serverReply.mock.calls[0][0])
		expect(msg).toMatch(/<mosAck>/)
		expect(msg).toMatch('<messageID>' + sendMessageId)
		expect(msg).toMatch('<status>NACK')
	})
	// TODO: listMachInfo

	test('requestMachineInfo', async () => {
		// Prepare mock server response:
		const mockReply = jest.fn((data) => {
			const str = decode(data)
			const messageID = getMessageId(str)
			const repl = getXMLReply(messageID, xmlData.machineInfo)
			return encode(repl)
		})
		socketMockLower.mockAddReply(mockReply)
		if (!xmlApiData.mosObj.ID) throw new Error('xmlApiData.mosObj.ID not set')

		const returnedMachineInfo: IMOSListMachInfo = await mosDevice.requestMachineInfo()
		expect(mockReply).toHaveBeenCalledTimes(1)
		const msg = decode(mockReply.mock.calls[0][0])
		expect(msg).toMatch(/<reqMachInfo\/>/)
		checkMessageSnapshot(msg)

		expect(returnedMachineInfo).toMatchObject({
			manufacturer: new MosString128('RadioVision, Ltd.'),
			model: new MosString128('TCS6000'),
			hwRev: new MosString128(''),
			swRev: new MosString128('2.1.0.37'),
			DOM: undefined,
			SN: new MosString128('927748927'),
			ID: new MosString128('airchache.newscenter.com'),
			time: new MosTime('2009-04-11T17:20:42'),
			opTime: new MosTime('2009-03-01T23:55:10'),
			mosRev: new MosString128('2.8.2'),

			supportedProfiles: {
				deviceType: 'NCS',
				profile0: true,
				profile1: true,
				profile2: true,
				profile3: true,
				profile4: true,
				profile5: true,
				profile6: true,
				profile7: true,
			},
		} as IMOSListMachInfo)
		expect(returnedMachineInfo).toMatchSnapshot()
	})
})
