import { MosConnection, ConnectionConfig, getMosTypes, IMOSRunningOrder, MosDevice } from '@mos-connection/connector'
import * as fs from 'fs'
import * as path from 'path'
import * as chokidar from 'chokidar'

const SERVER_CONFIG = {
	mosID: 'DUMMY.MOS.PRIMARY',
	acceptsConnections: true,
	profiles: {
		'0': true, // Profile 0 is mandatory
		'1': true, // Basic object exchange
		'2': true, // Running order/playlist exchange
		'3': true, // Advanced object-based workflow
		'4': true, // Advanced rundown functionality
	},
	debug: true,
	ports: {
		lower: 10540, // Default MOS ports
		upper: 10541,
		query: 10542,
	},
	openRelay: true,
}

class DummyMosServer {
	private mosConnection: MosConnection
	private rundownsDir: string
	private devicesMap: Map<string, MosDevice> = new Map()
	private rundowns: Map<string, IMOSRunningOrder> = new Map()
	private isServerOnline = true
	private mosTypes = getMosTypes(false) // Non-strict mode
	private primaryDevice = false

	constructor(rundownsDir: string) {
		this.rundownsDir = rundownsDir

		this.mosConnection = new MosConnection(new ConnectionConfig(SERVER_CONFIG))
		// Set up device connection callback
		this.mosConnection.onConnection(this.handleNewConnection.bind(this))

		this.setupRundownWatcher()
		this.loadRundowns()
	}

	public async start(): Promise<void> {
		console.log('Starting dummy MOS server...')

		await this.mosConnection.init()

		console.log(`MOS server started with ID: ${SERVER_CONFIG.mosID}`)
		console.log(
			`Listening on ports: ${SERVER_CONFIG.ports.lower}, ${SERVER_CONFIG.ports.upper}, ${SERVER_CONFIG.ports.query}`
		)
	}

	// Handle new MOS device connections
	private handleNewConnection(mosDevice: MosDevice): void {
		console.log(
			`New connection from device: ${this.primaryDevice ? mosDevice.idPrimary : mosDevice.idSecondary || ''}`
		)

		// Store reference to the device
		this.devicesMap.set(this.primaryDevice ? mosDevice.idPrimary : mosDevice.idSecondary || '', mosDevice)

		// Set up callbacks for Profile 0
		mosDevice.onRequestMachineInfo(async () => {
			console.log('Received machine info request')
			return {
				manufacturer: this.mosTypes.mosString128.create('DummyMosServer'),
				model: this.mosTypes.mosString128.create('Testing Device'),
				hwRev: this.mosTypes.mosString128.create('1.0'),
				swRev: this.mosTypes.mosString128.create('1.0.0'),
				DOM: this.mosTypes.mosString128.create('2023-01-01'),
				SN: this.mosTypes.mosString128.create('DUMMY001'),
				ID: this.mosTypes.mosString128.create(SERVER_CONFIG.mosID),
				time: this.mosTypes.mosTime.create(new Date()),
				mosRev: this.mosTypes.mosString128.create('2.8.5'),
				supportedProfiles: {
					deviceType: 'MOS',
					profile0: true,
					profile1: true,
					profile2: true,
					profile3: true,
					profile4: true,
				},
			}
		})

		// Set up callbacks for Profile 2
		mosDevice.onRequestRunningOrder(async (roId) => {
			const roIdStr = this.mosTypes.mosString128.stringify(roId)
			console.log(`Received request for running order: ${roIdStr}`)

			if (this.rundowns.has(roIdStr)) {
				console.log(`Returning running order: ${roIdStr}`)
				return this.rundowns.get(roIdStr) || null
			}

			console.log(`Running order not found: ${roIdStr}`)
			return null
		})

		// Set up Profile 4 callbacks
		mosDevice.onRequestAllRunningOrders(async () => {
			console.log('Received request for all running orders')
			return Array.from(this.rundowns.values())
		})

		// Send all rundowns to the device on connection
		this.sendAllRunningOrders(mosDevice)
	}

	// Load all rundowns from the rundowns directory
	private loadRundowns(): void {
		try {
			if (!fs.existsSync(this.rundownsDir)) {
				fs.mkdirSync(this.rundownsDir, { recursive: true })
			}

			const files = fs.readdirSync(this.rundownsDir).filter((file) => file.endsWith('.json'))

			files.forEach((file) => {
				try {
					const filePath = path.join(this.rundownsDir, file)
					const content = fs.readFileSync(filePath, 'utf8')
					const rundown = JSON.parse(content) as IMOSRunningOrder

					// Ensure ID is set correctly
					if (!rundown.ID) {
						const id = path.basename(file, '.json')
						rundown.ID = this.mosTypes.mosString128.create(id)
					}

					// Process and validate rundown (convert strings to MOS types)
					const processedRundown = this.processRundown(rundown)

					// Add to rundowns map
					const roId = this.mosTypes.mosString128.stringify(processedRundown.ID)
					this.rundowns.set(roId, processedRundown)

					console.log(`Loaded rundown: ${roId}`)
				} catch (error) {
					console.error(`Error loading rundown from ${file}:`, error)
				}
			})

			console.log(`Loaded ${this.rundowns.size} rundowns`)
		} catch (error) {
			console.error('Error loading rundowns:', error)
		}
	}

	// Watch the rundowns directory for changes
	private setupRundownWatcher(): void {
		const watcher = chokidar.watch(this.rundownsDir, {
			persistent: true,
			ignoreInitial: true,
		})

		watcher
			.on('add', this.handleRundownFileAdded.bind(this))
			.on('change', this.handleRundownFileChanged.bind(this))
			.on('unlink', this.handleRundownFileRemoved.bind(this))

		console.log(`Watching directory: ${this.rundownsDir} for rundown changes`)
	}

	// Handle new rundown file
	private handleRundownFileAdded(filePath: string): void {
		if (!filePath.endsWith('.json')) return

		try {
			console.log(`New rundown file detected: ${filePath}`)
			const content = fs.readFileSync(filePath, 'utf8')
			const rundown = JSON.parse(content) as IMOSRunningOrder

			// Ensure ID is set correctly
			if (!rundown.ID) {
				const id = path.basename(filePath, '.json')
				rundown.ID = this.mosTypes.mosString128.create(id)
			}

			// Process and validate rundown
			const processedRundown = this.processRundown(rundown)

			// Add to rundowns map
			const roId = this.mosTypes.mosString128.stringify(processedRundown.ID)
			this.rundowns.set(roId, processedRundown)

			console.log(`Added new rundown: ${roId}`)

			// Send to all connected devices
			this.broadcastRunningOrder(processedRundown)
		} catch (error) {
			console.error(`Error processing new rundown file: ${filePath}`, error)
		}
	}

	// Handle rundown file changes
	private handleRundownFileChanged(filePath: string): void {
		if (!filePath.endsWith('.json')) return

		try {
			console.log(`Rundown file changed: ${filePath}`)
			const content = fs.readFileSync(filePath, 'utf8')
			const rundown = JSON.parse(content) as IMOSRunningOrder

			// Process and validate rundown
			const processedRundown = this.processRundown(rundown)

			// Update in rundowns map
			const roId = this.mosTypes.mosString128.stringify(processedRundown.ID)
			this.rundowns.set(roId, processedRundown)

			console.log(`Updated rundown: ${roId}`)

			// Send to all connected devices
			this.broadcastRunningOrder(processedRundown, true)
		} catch (error) {
			console.error(`Error processing changed rundown file: ${filePath}`, error)
		}
	}

	// Handle rundown file removals
	private handleRundownFileRemoved(filePath: string): void {
		if (!filePath.endsWith('.json')) return

		try {
			const id = path.basename(filePath, '.json')
			console.log(`Rundown file removed: ${filePath} (ID: ${id})`)

			// Remove from rundowns map
			if (this.rundowns.has(id)) {
				this.rundowns.delete(id)
				console.log(`Removed rundown: ${id}`)

				// Notify all connected devices
				this.broadcastRunningOrderDelete(id)
			}
		} catch (error) {
			console.error(`Error handling removed rundown file: ${filePath}`, error)
		}
	}

	// Process a rundown to ensure all required MOS types are properly formatted
	private processRundown(rundown: IMOSRunningOrder): IMOSRunningOrder {
		// Deep copy to avoid modifying the original
		const result = JSON.parse(JSON.stringify(rundown))

		// Convert string values to MOS types
		if (typeof result.ID === 'string') {
			result.ID = this.mosTypes.mosString128.create(result.ID)
		}

		if (typeof result.Slug === 'string') {
			result.Slug = this.mosTypes.mosString128.create(result.Slug)
		}

		if (typeof result.DefaultChannel === 'string') {
			result.DefaultChannel = this.mosTypes.mosString128.create(result.DefaultChannel)
		}

		// Process each story
		if (Array.isArray(result.Stories)) {
			result.Stories.forEach((story: any) => {
				if (typeof story.ID === 'string') {
					story.ID = this.mosTypes.mosString128.create(story.ID)
				}

				if (typeof story.Slug === 'string') {
					story.Slug = this.mosTypes.mosString128.create(story.Slug)
				}

				// Process items in each story
				if (Array.isArray(story.Items)) {
					story.Items.forEach((item: any) => {
						if (typeof item.ID === 'string') {
							item.ID = this.mosTypes.mosString128.create(item.ID)
						}

						if (typeof item.Slug === 'string') {
							item.Slug = this.mosTypes.mosString128.create(item.Slug)
						}

						if (typeof item.ObjectID === 'string') {
							item.ObjectID = this.mosTypes.mosString128.create(item.ObjectID)
						}
					})
				}
			})
		}

		return result
	}

	// Send a running order to all connected devices
	private broadcastRunningOrder(rundown: IMOSRunningOrder, isUpdate = false): void {
		if (this.devicesMap.size === 0) {
			console.log('No connected devices to broadcast to')
			return
		}

		for (const [id, device] of this.devicesMap) {
			try {
				if (isUpdate) {
					console.log(
						`Sending updated running order to device ${id}: ${this.mosTypes.mosString128.stringify(
							rundown.ID
						)}`
					)
					device
						.sendReplaceRunningOrder(rundown)
						.catch((err) => console.error(`Error sending updated rundown to device ${id}:`, err))
				} else {
					console.log(
						`Sending new running order to device ${id}: ${this.mosTypes.mosString128.stringify(rundown.ID)}`
					)
					device
						.sendCreateRunningOrder(rundown)
						.catch((err) => console.error(`Error sending new rundown to device ${id}:`, err))
				}
			} catch (error) {
				console.error(`Error broadcasting rundown to device ${id}:`, error)
			}
		}
	}

	// Notify all connected devices about a deleted running order
	private broadcastRunningOrderDelete(roId: string): void {
		if (this.devicesMap.size === 0) {
			console.log('No connected devices to broadcast to')
			return
		}

		const mosRoId = this.mosTypes.mosString128.create(roId)

		for (const [id, device] of this.devicesMap) {
			try {
				console.log(`Sending running order delete notification to device ${id}: ${roId}`)
				device
					.sendDeleteRunningOrder(mosRoId)
					.catch((err) => console.error(`Error sending rundown delete to device ${id}:`, err))
			} catch (error) {
				console.error(`Error broadcasting rundown delete to device ${id}:`, error)
			}
		}
	}

	// Send all loaded rundowns to a newly connected device
	private sendAllRunningOrders(_device: MosDevice): void {
		// This part has not been implemented, quickTSR works for now
		return
		/*
		if (this.rundowns.size === 0) {
			console.log('No rundowns to send to new device')
			return
		}

		console.log(
			`Sending ${this.rundowns.size} rundowns to device: ${
				this.primaryDevice ? device.idPrimary : device.idSecondary || ''
			}`
		)

		for (const [id, rundown] of this.rundowns) {
			try {
				console.log(
					`Sending rundown to device ${
						this.primaryDevice ? device.idPrimary : device.idSecondary || ''
					}: ${id}`
				)
				device
					.sendCreateRunningOrder(rundown)
					.catch((err) =>
						console.error(
							`Error sending rundown to device ${
								this.primaryDevice ? device.idPrimary : device.idSecondary || ''
							}:`,
							err
						)
					)
			} catch (error) {
				console.error(
					`Error sending rundown to device ${
						this.primaryDevice ? device.idPrimary : device.idSecondary || ''
					}:`,
					error
				)
			}
		}
		*/
	}

	// Simulate a server outage
	public simulateOutage(durationMs = 5000): void {
		if (!this.isServerOnline) {
			console.log('Server is already offline')
			return
		}

		console.log(`Simulating server outage for ${durationMs}ms`)
		this.isServerOnline = false

		setTimeout(() => {
			console.log('Recovering from simulated outage')
			this.isServerOnline = true
		}, durationMs)
	}

	// Shutdown the server
	public async shutdown(): Promise<void> {
		console.log('Shutting down MOS server...')

		try {
			await this.mosConnection.dispose()
			console.log('MOS server stopped')
		} catch (error) {
			console.error('Error shutting down MOS server:', error)
		}
	}
}

// Main function
async function main() {
	const rundownsDir = path.join(process.cwd(), 'rundowns')

	if (!fs.existsSync(rundownsDir) || fs.readdirSync(rundownsDir).filter((f) => f.endsWith('.json')).length === 0) {
		console.log(`No rundowns found in ${rundownsDir}. Creating example rundown...`)
	}

	// Is the server secondary:
	if (process.argv.includes('--secondary')) {
		SERVER_CONFIG.mosID = 'DUMMY.MOS.SERVER.SECONDARY'
		SERVER_CONFIG.ports.lower = 10640
		SERVER_CONFIG.ports.upper = 10641
		SERVER_CONFIG.ports.query = 10642
	}

	const server = new DummyMosServer(rundownsDir)
	// Create and start the MOS server
	await server.start()

	// Handle process termination
	process.on('SIGINT', () => {
		console.log('Received SIGINT signal')
		shutdownServerAndExit(server)
	})

	process.on('SIGTERM', () => {
		console.log('Received SIGTERM signal')
		shutdownServerAndExit(server)
	})

	// Command line interface for manual testing
	console.log('\nCommands:')
	console.log('  outage [duration_ms] - Simulate server outage')
	console.log('  exit - Shutdown the server and exit')

	// Simple command processing
	process.stdin.on('data', (data) => {
		const input = data.toString().trim()
		const args = input.split(' ')
		const command = args[0].toLowerCase()

		switch (command) {
			case 'outage':
				server.simulateOutage(parseInt(args[1]) || 5000)
				break

			case 'exit':
				shutdownServerAndExit(server)
				break

			default:
				console.log('Unknown command:', command)
				break
		}
	})
}
function shutdownServerAndExit(server: DummyMosServer) {
	server
		.shutdown()
		.then(() => {
			process.exit(0)
		})
		.catch((e) => {
			console.error('Error shutting down server:', e)
			process.exit(1)
		})
}

// Run the application
main().catch((error) => {
	console.error('Fatal error:', error)
	process.exit(1)
})
