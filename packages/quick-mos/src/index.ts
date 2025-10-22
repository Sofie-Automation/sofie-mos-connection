import * as chokidar from 'chokidar'

import * as fs from 'fs'
import * as _ from 'underscore'
import * as path from 'path'
import {
	MosConnection,
	IMOSRunningOrder,
	IMOSROStory,
	IMOSROFullStory,
	IConnectionConfig,
	IMOSDeviceConnectionOptions,
	MosDevice,
	IMOSListMachInfo,
	IMOSObjectAirStatus,
	getMosTypes,
} from '@mos-connection/connector'
import { diffLists, ListEntry, OperationType } from './mosDiff.js'
import * as crypto from 'crypto'
import { convertFromSofieSnapshot } from './convertFromSofieSnapshot.js'

console.log('Starting Quick-MOS')

const DELAY_TIME = 300 // ms

const watcher = chokidar.watch('input/**', { ignored: /^\./, persistent: true })

const simulateFrequentEditing = false

watcher
	.on('add', () => {
		triggerReload()
	})
	.on('change', () => {
		triggerReload()
	})
	.on('unlink', () => {
		triggerReload()
	})
	.on('error', (error) => {
		console.error('Error', error)
	})

export interface Config {
	mosConnection: IConnectionConfig
	devices: IMOSDeviceConnectionOptions[]
}
const config: Config = {
	// @ts-expect-error just a stub, will be overwritten by /input/config.ts
	mosConnection: {},
	devices: [],
}

const mosTypes = getMosTypes(true)

const mos: {
	mosConnection?: MosConnection
} = {}

let running = false
let waiting = false
function triggerReload() {
	setTimeout(() => {
		waiting = false
		if (running) {
			waiting = true
		} else {
			running = true
			reloadInner()
				.then(() => {
					running = false
					if (waiting) triggerReload()
				})
				.catch((e) => {
					running = false
					console.error(e)
					if (waiting) triggerReload()
				})
		}
	}, DELAY_TIME)
}
function loadFile(requirePath: string): any {
	delete require.cache[require.resolve(requirePath)]
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const content = require(requirePath)

	return content
}
const monitors: { [id: string]: MOSMonitor } = {}
const runningOrderIds: { [id: string]: string } = {}

async function reloadInner() {
	const newConfig: Config = loadFile('../input/config.ts').config
	if (!mos.mosConnection || !_.isEqual(newConfig.mosConnection, config.mosConnection)) {
		if (!mos.mosConnection) {
			console.log('Starting MosConnection')
		} else {
			console.log('Restarting MosConnection')
		}

		// Save the new config:
		config.mosConnection = newConfig.mosConnection
		config.devices = newConfig.devices

		// Kill the old:
		if (mos.mosConnection) {
			await mos.mosConnection.dispose()
		}

		// Set up the new:
		mos.mosConnection = new MosConnection(config.mosConnection)
		mos.mosConnection.on('error', (err) => {
			console.log('Error emitted from MosConnection', err)
		})

		mos.mosConnection.onConnection((mosDevice: MosDevice) => {
			console.log('new mos connection', mosDevice.ID)

			mosDevice.onRequestMachineInfo(async () => {
				const machineInfo: IMOSListMachInfo = {
					manufacturer: mosTypes.mosString128.create('<<<Mock Manufacturer>>>'),
					model: mosTypes.mosString128.create('<<<Mock model>>>'),
					hwRev: mosTypes.mosString128.create('1.0'),
					swRev: mosTypes.mosString128.create('1.0'),
					DOM: mosTypes.mosString128.create('0'),
					SN: mosTypes.mosString128.create('<<<Mock SN>>>'),
					ID: mosTypes.mosString128.create(config.mosConnection.mosID),
					time: mosTypes.mosTime.create(Date.now()),
					// opTime?: MosTime;
					mosRev: mosTypes.mosString128.create('0'),
					supportedProfiles: {
						deviceType: 'NCS',
						profile0: true,
						profile1: true,
						profile2: true,
						// profile3?: boolean;
						// profile4?: boolean;
						// profile5?: boolean;
						// profile6?: boolean;
						// profile7?: boolean;
					},
					// defaultActiveX?: Array<IMOSDefaultActiveX>;
					// 	mosExternalMetaData?: Array<IMOSExternalMetaData>;
				}
				return machineInfo
			})
			mosDevice.onConnectionChange(() => {
				console.log(mosDevice.ID, 'connection change', mosDevice.getConnectionStatus())
			})

			const mosId = mosTypes.mosString128.stringify(mosDevice.ID)

			if (!monitors[mosId]) {
				monitors[mosId] = new MOSMonitor(mosDevice)
			}
			// mosDevice.onRequestMOSObject((objId: string) => Promise<IMOSObject | null>): void;
			// mosDevice.onRequestAllMOSObjects((pause: number) => Promise<Array<IMOSObject> | IMOSAck>): void;
			// mosDevice.onCreateRunningOrder((ro: IMOSRunningOrder) => Promise<IMOSROAck>): void;
			// mosDevice.onReplaceRunningOrder((ro: IMOSRunningOrder) => Promise<IMOSROAck>): void;
			// mosDevice.onDeleteRunningOrder((runningOrderId: MosString128) => Promise<IMOSROAck>): void;
			// mosDevice.onRequestRunningOrder((runningOrderId: MosString128) => Promise<IMOSRunningOrder | null>): void;
			// mosDevice.onMetadataReplace((metadata: IMOSRunningOrderBase) => Promise<IMOSROAck>): void;
			// mosDevice.onRunningOrderStatus((status: IMOSRunningOrderStatus) => Promise<IMOSROAck>): void;
			// mosDevice.onStoryStatus((status: IMOSStoryStatus) => Promise<IMOSROAck>): void;
			// mosDevice.onItemStatus((status: IMOSItemStatus) => Promise<IMOSROAck>): void;
			// mosDevice.onReadyToAir((Action: IMOSROReadyToAir) => Promise<IMOSROAck>): void;
			// mosDevice.onROInsertStories((Action: IMOSStoryAction, Stories: Array<IMOSROStory>) => Promise<IMOSROAck>): void;
			// mosDevice.onROInsertItems((Action: IMOSItemAction, Items: Array<IMOSItem>) => Promise<IMOSROAck>): void;
			// mosDevice.onROReplaceStories((Action: IMOSStoryAction, Stories: Array<IMOSROStory>) => Promise<IMOSROAck>): void;
			// mosDevice.onROReplaceItems((Action: IMOSItemAction, Items: Array<IMOSItem>) => Promise<IMOSROAck>): void;
			// mosDevice.onROMoveStories((Action: IMOSStoryAction, Stories: Array<MosString128>) => Promise<IMOSROAck>): void;
			// mosDevice.onROMoveItems((Action: IMOSItemAction, Items: Array<MosString128>) => Promise<IMOSROAck>): void;
			// mosDevice.onRODeleteStories((Action: IMOSROAction, Stories: Array<MosString128>) => Promise<IMOSROAck>): void;
			// mosDevice.onRODeleteItems((Action: IMOSStoryAction, Items: Array<MosString128>) => Promise<IMOSROAck>): void;
			// mosDevice.onROSwapStories((Action: IMOSROAction, StoryID0: MosString128, StoryID1: MosString128) => Promise<IMOSROAck>): void;
			// mosDevice.onROSwapItems((Action: IMOSStoryAction, ItemID0: MosString128, ItemID1: MosString128) => Promise<IMOSROAck>): void;
			// mosDevice.onMosObjCreate((object: IMOSObject) => Promise<IMOSAck>): void;
			// mosDevice.onMosItemReplace((roID: MosString128, storyID: MosString128, item: IMOSItem) => Promise<IMOSROAck>): void;
			// mosDevice.onMosReqSearchableSchema((username: string) => Promise<IMOSSearchableSchema>): void;
			// mosDevice.onMosReqObjectList((objList: IMosRequestObjectList) => Promise<IMosObjectList>): void;
			// mosDevice.onMosReqObjectAction((action: string, obj: IMOSObject) => Promise<IMOSAck>): void;
			mosDevice.onRequestAllRunningOrders(async () => {
				const ros = fetchRunningOrders()
				if (!ros) return []
				return ros.map((r) => r.ro)
			})
			mosDevice.onRequestRunningOrder(async (roId) => {
				const ro = monitors[mosId].resendRunningOrder(mosTypes.mosString128.stringify(roId))
				return ro
			})
			// mosDevice.onROStory((story: IMOSROFullStory) => Promise<IMOSROAck>): void;
			setTimeout(() => {
				refreshFiles()
			}, 500)
		})
		await mos.mosConnection.init()

		for (const deviceConfig of config.devices) {
			const mosDevice = await mos.mosConnection.connect(deviceConfig)
			console.log('Created mosDevice', mosDevice.ID)
		}
		console.log('MosConnection initialized')
	}

	refreshFiles()
}
function refreshFiles() {
	// Check data
	const timestamp = `${Date.now()}`
	for (const r of fetchRunningOrders() || []) {
		const runningOrder = r.ro
		const stories = r.stories
		const readyToAir = r.readyToAir

		const id = mosTypes.mosString128.stringify(runningOrder.ID)
		runningOrderIds[id] = timestamp
		if (_.isEmpty(monitors)) {
			fakeOnUpdatedRunningOrder(runningOrder, stories)
		} else {
			_.each(monitors, (monitor) => {
				monitor.onUpdatedRunningOrder(runningOrder, stories, readyToAir)
			})
		}
	}
	for (const [oldT, id] of Object.entries<string>(runningOrderIds)) {
		if (oldT !== timestamp) {
			_.each(monitors, (monitor) => {
				monitor.onDeletedRunningOrder(id)
			})
		}
	}
}
function fetchRunningOrders() {
	const runningOrders: { ro: IMOSRunningOrder; stories: IMOSROFullStory[]; readyToAir: boolean }[] = []
	for (const filePath of getAllFilesInDirectory('input/runningorders')) {
		const requirePath = '../' + filePath.replace(/\\/g, '/')
		try {
			if (
				requirePath.match(/[/\\]_/) || // ignore and folders files that begin with "_"
				requirePath.match(/[/\\]lib\.ts/) // ignore lib files
			) {
				continue
			}
			if (filePath.match(/(\.ts|.json)$/)) {
				const fileContents = loadFile(requirePath)

				if (fileContents.runningOrder) {
					const ro = fileContents.runningOrder
					ro.ID = mosTypes.mosString128.create(filePath.replace(/\W/g, '_'))

					if (ro.EditorialStart && !mosTypes.mosTime.is(ro.EditorialStart)) {
						ro.EditorialStart = mosTypes.mosTime.create(ro.EditorialStart._time)
					}

					if (
						ro.EditorialDuration &&
						!mosTypes.mosDuration.is(ro.EditorialDuration) &&
						typeof ro.EditorialDuration._duration === 'number'
					) {
						ro.EditorialDuration = mosTypes.mosDuration.create(ro.EditorialDuration._duration)
					}

					runningOrders.push({
						ro,
						stories: fileContents.stories ?? [],
						readyToAir: fileContents.READY_TO_AIR,
					})
				} else if (fileContents.snapshot && fileContents.snapshot.type === 'rundownplaylist') {
					// Is a Sofie snapshot
					convertFromSofieSnapshot(filePath, fileContents).forEach(({ ro, stories, readyToAir }) => {
						runningOrders.push({
							ro,
							stories,
							readyToAir,
						})
					})
				} else {
					throw new Error('Unsupported file')
				}
			}
		} catch (err) {
			console.log(`Error when parsing file "${requirePath}"`)
			throw err
		}
	}

	return runningOrders
}
function getAllFilesInDirectory(dir: string): string[] {
	const files = fs.readdirSync(dir)

	const filelist: string[] = []
	files.forEach((file) => {
		if (fs.statSync(path.join(dir, file)).isDirectory()) {
			getAllFilesInDirectory(path.join(dir, file)).forEach((innerFile) => {
				filelist.push(innerFile)
			})
		} else {
			filelist.push(path.join(dir, file))
		}
	})
	return filelist
}

// ------------
triggerReload()
console.log('Listening to changes in /input...')

type MOSCommand = () => Promise<any>
class MOSMonitor {
	private commands: MOSCommand[] = []

	private ros: {
		[roId: string]: {
			ro: IMOSRunningOrder
			storyList: ListEntry<IMOSROStory>[]
			fullStories: { [id: string]: IMOSROFullStory }
			readyToAir: boolean
		}
	} = {}
	private queueRunning = false

	constructor(private mosDevice: MosDevice) {
		setTimeout(() => this.triggerRandomUpdate(), 10000) // startup delay
	}

	triggerRandomUpdate() {
		if (simulateFrequentEditing) {
			const roIds = Object.keys(this.ros)

			// only fire if the queue is sufficiently small (to avoid a backlog)
			if (roIds.length > 0 && (!this.queueRunning || this.commands.length < 5)) {
				const roId = roIds[_.random(roIds.length - 1)]
				const ro = this.ros[roId]
				if (ro) {
					const storyIds = ro.storyList.map((s) => s.id)
					const storyId = storyIds[_.random(storyIds.length - 1)]
					const story = ro.fullStories[storyId]
					if (story) {
						// send it
						console.log('simulating edit')
						this.commands.push(async () => {
							console.log('sendFullStory', story.ID)
							return this.mosDevice.sendROStory(story)
						})
						this.triggerCheckQueue()
					}
				}

				// run again
				setTimeout(() => this.triggerRandomUpdate(), 500) // abritrary gap
			} else {
				console.log('skipping simulated edit')
				// run again
				setTimeout(() => this.triggerRandomUpdate(), 10000) // abritrary gap
			}
		}
	}

	onDeletedRunningOrder(roId: string) {
		console.log('onDeletedRunningOrder', roId)
		if (this.ros[roId]) {
			this.commands.push(async () => {
				console.log('sendDeleteRunningOrder')
				return this.mosDevice.sendDeleteRunningOrder(mosTypes.mosString128.create(roId))
			})
		}
		// At the end, store the updated RO:
		delete this.ros[roId]
		this.triggerCheckQueue()
	}
	resendRunningOrder(roId: string): IMOSRunningOrder {
		const local = this.ros[roId]
		if (local) {
			setTimeout(() => {
				Object.values<IMOSROFullStory>(local.fullStories).forEach((story) => {
					this.commands.push(async () => {
						console.log('sendFullStory', story.ID)
						return this.mosDevice.sendROStory(story)
					})
				})

				this.triggerCheckQueue()
			}, 100)
			return local.ro
		} else {
			console.log('ros', Object.keys(this.ros))
			throw new Error(`ro ${roId} not found`)
		}
	}
	onUpdatedRunningOrder(ro: IMOSRunningOrder, fullStories: IMOSROFullStory[], readyToAir: boolean | undefined): void {
		// compare with
		const roId = mosTypes.mosString128.stringify(ro.ID)
		readyToAir = readyToAir ?? false
		console.log('onUpdatedRunningOrder ----------', roId)

		const local = this.ros[roId]
		const newStoryList = MOSMonitor.prepareStories(ro.Stories)

		if (!local) {
			// New RO
			this.commands.push(async () => {
				console.log('sendCreateRunningOrder', ro.ID)
				return this.mosDevice.sendCreateRunningOrder(ro)
			})
		} else {
			const metadataEqual = _.isEqual(local.ro.MosExternalMetaData, ro.MosExternalMetaData)
			const roStoriesEqual = _.isEqual(local.ro.Stories, ro.Stories)
			const roBaseDataEqual = _.isEqual(
				_.omit(local.ro, 'MosExternalMetaData', 'Stories'),
				_.omit(ro, 'MosExternalMetaData', 'Stories')
			)
			if (roBaseDataEqual && metadataEqual && roStoriesEqual) {
				// nothing changed, do nothing
			} else if ((!roBaseDataEqual || !metadataEqual) && roStoriesEqual) {
				// Only RO metadata has changed
				this.commands.push(async () => {
					console.log('sendMetadataReplace', ro.ID)
					return this.mosDevice.sendMetadataReplace(ro)
				})
			} else if (roBaseDataEqual && metadataEqual && !roStoriesEqual) {
				// Only Stories has changed
				const operations = diffLists(local.storyList, newStoryList)

				for (const operation of operations) {
					if (operation.type === OperationType.INSERT) {
						const inserts = operation.inserts.map((i) => i.content)
						this.commands.push(async () => {
							console.log('sendROInsertStories', ro.ID)
							return this.mosDevice.sendROInsertStories(
								{
									RunningOrderID: ro.ID,
									StoryID: mosTypes.mosString128.create(operation.beforeId),
								},
								inserts
							)
						})
					} else if (operation.type === OperationType.UPDATE) {
						const updatedStory = operation.content
						this.commands.push(async () => {
							console.log('sendROReplaceStories', ro.ID)
							return this.mosDevice.sendROReplaceStories(
								{
									RunningOrderID: ro.ID,
									StoryID: mosTypes.mosString128.create(operation.id),
								},
								[updatedStory]
							)
						})
					} else if (operation.type === OperationType.REMOVE) {
						const removeIds = operation.ids
						console.log('sendRODeleteStories', ro.ID, removeIds)
						this.commands.push(async () => {
							return this.mosDevice.sendRODeleteStories(
								{
									RunningOrderID: ro.ID,
								},
								removeIds.map((id) => mosTypes.mosString128.create(id))
							)
						})
					} else if (operation.type === OperationType.MOVE) {
						const beforeId = operation.beforeId
						const moveIds = operation.ids
						console.log('sendROMoveStories', ro.ID, moveIds, beforeId)
						this.commands.push(async () => {
							return this.mosDevice.sendROMoveStories(
								{
									RunningOrderID: ro.ID,
									StoryID: mosTypes.mosString128.create(beforeId),
								},
								moveIds.map((id) => mosTypes.mosString128.create(id))
							)
						})
					}
				}
				/*
				// const addedGroups = this.groupIndexes(o.added)
				_.each(o.added, (stories, beforeId) => {
					// const index = parseInt(index0, 10)
				})
				_.each(o.changed, c => {
					this.commands.push(() => {
						console.log('sendROReplaceStories', ro.ID)
						const story = ro.Stories[c.id]
						return this.mosDevice.sendROReplaceStories({
							RunningOrderID: ro.ID,
							StoryID: mosTypes.mosString128.create(c.id)
						}, [ c.story ])
					})
				})
				// Swap logic:
				// if (
				// 	o.moved.length === 2 &&
				// 	o.moved[0].ids.length === 1 &&
				// 	o.moved[1].ids.length === 1 &&

				// 	o.moved[0].beforeId

				// 	o.moved[0].beforeId === o.moved[1].oldIndex &&
				// 	o.moved[1].index === o.moved[0].oldIndex
				// ) {
				// 	this.commands.push(() => {
				// 		console.log('sendROSwapStories', ro.ID)
				// 		return this.mosDevice.sendROSwapStories({
				// 			RunningOrderID: ro.ID
				// 		},
				// 		mosTypes.mosString128.create(o.moved[0].id),
				// 		mosTypes.mosString128.create(o.moved[1].id)
				// 		)
				// 	})
				// } else {
				// const movedGroups = this.groupIndexes(o.moved)
				// console.log('movedGroups', movedGroups)
				_.each(o.moved, (m) => {
					// const index = parseInt(index0, 10)
					this.commands.push(() => {
						console.log('sendROMoveStories', ro.ID, m.afterId, m.ids)
						// const behindStory = index > 0 && ro.Stories[index - 1]
						return this.mosDevice.sendROMoveStories({
							RunningOrderID: ro.ID,
							StoryID: mosTypes.mosString128.create(m.afterId)
						}, m.ids.map(m => mosTypes.mosString128.create(m)))
					})
				})
				*/
			} else {
				// last resort: replace the whole rundown
				this.commands.push(async () => {
					console.log('sendReplaceRunningOrder')
					return this.mosDevice.sendReplaceRunningOrder(ro)
				})
			}
		}
		if (readyToAir !== local?.readyToAir) {
			this.commands.push(async () => {
				console.log('sendReadyToAir', ro.ID, readyToAir)
				return this.mosDevice.sendReadyToAir({
					ID: ro.ID,
					Status: readyToAir ? IMOSObjectAirStatus.READY : IMOSObjectAirStatus.NOT_READY,
				})
			})
		}

		console.log('stories', fullStories.length)
		const newStories: { [id: string]: IMOSROFullStory } = {}
		fullStories.forEach((story) => {
			story.RunningOrderId = mosTypes.mosString128.create(roId)

			newStories[mosTypes.mosString128.stringify(story.ID)] = story

			const localStory = local?.fullStories[mosTypes.mosString128.stringify(story.ID)]
			if (!local || !_.isEqual(localStory, story)) {
				this.commands.push(async () => {
					console.log('sendFullStory', story.ID)
					return this.mosDevice.sendROStory(story)
				})
			}
		})

		// At the end, store the updated RO:
		this.ros[roId] = {
			ro: ro,
			storyList: newStoryList,
			fullStories: newStories,
			readyToAir: readyToAir || false,
		}

		this.triggerCheckQueue()
	}
	groupIndexes<T extends { index: number }>(added: T[]) {
		let groupIndex = -99999
		let nextIndex = -99999
		return _.groupBy(added, (a) => {
			if (nextIndex !== a.index - 1) {
				groupIndex = a.index
			}
			nextIndex = a.index
			return groupIndex
		})
	}
	static prepareStories(stories: IMOSROStory[]): ListEntry<IMOSROStory>[] {
		return stories.map((story) => {
			return {
				id: mosTypes.mosString128.stringify(story.ID),
				changedHash: this.md5(JSON.stringify(story)),
				content: story,
			}
		})
	}
	static md5(str: string): string {
		return crypto.createHash('md5').update(str).digest('hex')
	}

	private triggerCheckQueue() {
		if (!this.queueRunning) {
			if (this.commands.length) {
				const nextCommand = this.commands[0]
				this.queueRunning = true
				nextCommand()
					.then(() => {
						this.queueRunning = false
						this.commands.splice(0, 1) // remove the command from queue, as it has now been executed successfully
						setTimeout(() => this.triggerCheckQueue(), 100)
					})
					.catch((err) => {
						console.log('err', err)
						this.queueRunning = false
						setTimeout(() => this.triggerCheckQueue(), 2000)
					})
			}
		}
	}
}

const fake: any = {
	ros: {},
}
function fakeOnUpdatedRunningOrder(ro: IMOSRunningOrder, _fullStories: IMOSROFullStory[]): void {
	// compare with
	const roId = mosTypes.mosString128.stringify(ro.ID)
	// console.log('fakeOnUpdatedRunningOrder', roId)

	const localRo = fake.ros[roId]
	const newStoryList = MOSMonitor.prepareStories(ro.Stories)

	if (!localRo) {
		// New RO
		console.log('sendCreateRunningOrder', ro.ID)
	} else {
		const metadataEqual = _.isEqual(localRo.ro.MosExternalMetaData, ro.MosExternalMetaData)
		const roStoriesEqual = _.isEqual(localRo.ro.Stories, ro.Stories)
		const roBaseDataEqual = _.isEqual(
			_.omit(localRo.ro, 'MosExternalMetaData', 'Stories'),
			_.omit(ro, 'MosExternalMetaData', 'Stories')
		)
		// console.log(_.omit(localRo.ro,	'MosExternalMetaData', 'Stories'))
		// console.log(_.omit(ro,		'MosExternalMetaData', 'Stories'))
		// console.log(metadataEqual)
		// console.log(roStoriesEqual)
		// console.log(roBaseDataEqual)
		if (roBaseDataEqual && metadataEqual && roStoriesEqual) {
			// nothing changed, do nothing
		} else if ((!roBaseDataEqual || !metadataEqual) && roStoriesEqual) {
			// Only RO metadata has changed
			console.log('sendMetadataReplace', ro.ID)
			// this.commands.push(() => {
			// 	return this.mosDevice.sendMetadataReplace(ro)
			// })
		} else if (roBaseDataEqual && metadataEqual && !roStoriesEqual) {
			// Only Stories has changed
			const operations = diffLists(localRo.storyList, newStoryList)

			for (const operation of operations) {
				if (operation.type === OperationType.INSERT) {
					// const inserts = operation.inserts.map((i) => i.content)
					console.log('sendROInsertStories', ro.ID)
					// this.commands.push(() => {
					// 	return this.mosDevice.sendROInsertStories({
					// 		RunningOrderID: ro.ID,
					// 		StoryID: mosTypes.mosString128.create(operation.beforeId)
					// 	}, inserts)
					// })
				} else if (operation.type === OperationType.UPDATE) {
					// const updatedStory = operation.content
					console.log('sendROReplaceStories', ro.ID)
					// this.commands.push(() => {
					// 	return this.mosDevice.sendROReplaceStories({
					// 		RunningOrderID: ro.ID,
					// 		StoryID: mosTypes.mosString128.create(operation.id)
					// 	}, [ updatedStory ])
					// })
				} else if (operation.type === OperationType.REMOVE) {
					const removeIds = operation.ids
					console.log('sendRODeleteStories', ro.ID, removeIds)
					// this.commands.push(() => {
					// 	return this.mosDevice.sendRODeleteStories({
					// 		RunningOrderID: ro.ID
					// 	}, removeIds.map(id => mosTypes.mosString128.create(id)))
					// })
				} else if (operation.type === OperationType.MOVE) {
					const beforeId = operation.beforeId
					const moveIds = operation.ids
					console.log('sendROMoveStories', ro.ID, moveIds, 'before ' + beforeId)
					// this.commands.push(() => {
					// 	return this.mosDevice.sendROMoveStories({
					// 		RunningOrderID: ro.ID,
					// 		StoryID: mosTypes.mosString128.create(beforeId)
					// 	}, moveIds.map(id => mosTypes.mosString128.create(id)))
					// })
				}
			}
		} else {
			// last resort: replace the whole rundown
			console.log('sendReplaceRunningOrder')
			// this.commands.push(() => {
			// 	return this.mosDevice.sendReplaceRunningOrder(ro)
			// })
		}
	}
	// At the end, store the updated RO:
	fake.ros[roId] = {
		ro: ro,
		storyList: newStoryList,
	}

	// this.triggerCheckQueue()
}
