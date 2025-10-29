import { IProfiles } from '@mos-connection/model'
import { IConnectionConfig, IMOSDeviceConnectionOptions } from '../api.js'

/** */

export class ConnectionConfig implements IConnectionConfig {
	mosID: string
	acceptsConnections: boolean
	accepsConnectionsFrom: string[]
	debug: boolean
	openRelay:
		| boolean
		| undefined
		| {
				// options for on-the-fly-created connections
				options: IMOSDeviceConnectionOptions['primary']
		  }
	offspecFailover: boolean
	strict?: boolean
	ports?: {
		lower: number
		upper: number
		query: number
	}

	private _profiles: IProfiles = {
		'0': false,
		'1': false,
		'2': false,
		'3': false,
		'4': false,
		'5': false,
		'6': false,
		'7': false,
	}

	constructor(init: IConnectionConfig) {
		/* tslint:disable */
		if (!init) throw new Error('Config object missing')
		if (typeof init !== 'object') throw new Error('Config object is not an object')
		if (init.mosID === undefined) throw new Error('Config argument "mosID" missing')
		if (init.acceptsConnections === undefined) throw new Error('Config argument "acceptsConnections" missing')
		if (init.profiles === undefined) throw new Error('Config argument "profiles" missing')
		/* tslint:enable */

		this.mosID = init.mosID
		this.acceptsConnections = init.acceptsConnections
		this.accepsConnectionsFrom = init.accepsConnectionsFrom || []
		this.debug = init.debug || false
		this.openRelay = init.openRelay || undefined
		this.offspecFailover = init.offspecFailover || false
		this.profiles = init.profiles
		this.strict = init.strict
		this.ports = init.ports
	}

	/** */
	get profiles(): IProfiles {
		return this._profiles
	}

	/** */
	set profiles(profileSupport: IProfiles) {
		let atLeastOneOtherProfile = false

		// profile 0 is mandatory
		if (profileSupport['0'] === true) {
			this._profiles['0'] = true
		} else {
			throw new Error(`Invalid MOS configuration: Profile 0 is mandatory.`)
		}

		// Profile 1 depends on 0
		if (profileSupport['1'] === true) {
			if (this._profiles['0'] !== true) {
				throw new Error(`Invalid MOS configuration: Profile 1 depends on Profile 0.`)
			} else {
				this._profiles['1'] = true
				atLeastOneOtherProfile = true
			}
		}

		// Profile 2 depends on 0 and 1
		if (profileSupport['2'] === true) {
			if (!(this._profiles['0'] === true && this._profiles['1'] === true)) {
				throw new Error(`Invalid MOS configuration: Profile 2 depends on Profile 0 and 1.`)
			} else {
				this._profiles['2'] = true
				atLeastOneOtherProfile = true
			}
		}

		// Profile 3 depends on 0, 1 and 2
		if (profileSupport['3'] === true) {
			if (!(this._profiles['0'] === true && this._profiles['1'] === true && this._profiles['2'] === true)) {
				throw new Error(`Invalid MOS configuration: Profile 3 depends on Profile 0, 1 and 2.`)
			} else {
				this._profiles['3'] = true
				atLeastOneOtherProfile = true
			}
		}

		// Profile 4 depends on 0, 1 and 2
		if (profileSupport['4'] === true) {
			if (!(this._profiles['0'] === true && this._profiles['1'] === true && this._profiles['2'] === true)) {
				throw new Error(`Invalid MOS configuration: Profile 4 depends on Profile 0, 1 and 2.`)
			} else {
				this._profiles['4'] = true
				atLeastOneOtherProfile = true
			}
		}

		// Profile 5 depends on 0, 1 and 2
		if (profileSupport['5'] === true) {
			if (!(this._profiles['0'] === true && this._profiles['1'] === true && this._profiles['2'] === true)) {
				throw new Error(`Invalid MOS configuration: Profile 5 depends on Profile 0, 1 and 2.`)
			} else {
				this._profiles['5'] = true
				atLeastOneOtherProfile = true
			}
		}

		// Profile 6 depends on 0, 1 and 2
		if (profileSupport['6'] === true) {
			if (!(this._profiles['0'] === true && this._profiles['1'] === true && this._profiles['2'] === true)) {
				throw new Error(`Invalid MOS configuration: Profile 6 depends on Profile 0, 1 and 2.`)
			} else {
				this._profiles['6'] = true
				atLeastOneOtherProfile = true
			}
		}

		// Profile 7 depends on 0, 1 and 2
		if (profileSupport['7'] === true) {
			if (!(this._profiles['0'] === true && this._profiles['1'] === true && this._profiles['2'] === true)) {
				throw new Error(`Invalid MOS configuration: Profile 7 depends on Profile 0, 1 and 2.`)
			} else {
				this._profiles['7'] = true
				atLeastOneOtherProfile = true
			}
		}

		// must support at least one other profile, other than Profile 0
		if (!atLeastOneOtherProfile) {
			throw new Error(
				`Invalid MOS configuration: Mos device must support at least one profile other than the mandantory Profile 0.`
			)
		}
	}

	// machineInfo: {
	// 	manufacturer: "SuperFly.tv",
	//     model: 	"YAAS"
	//     //hwRev:	 ,
	//     swRev: 	'0.0.1.0'
	//     DOM: 	'', // date of manufacture
	//     /*<SN>927748927</SN>
	//     <ID>airchache.newscenter.com</ID>
	//     <time>2009-04-11T17:20:42</time>
	//     <opTime>2009-03-01T23:55:10</opTime>
	//     <mosRev>2.8.2</mosRev>
	//     */
	// }
}
