// /* eslint-disable n/no-unpublished-require */
import { promisify } from 'util'
import globOrg from 'glob'
import deepExtend from 'deep-extend'
import fs from 'fs/promises'
import _ from 'lodash'
import path from 'path'
import { fileURLToPath } from 'url'

const glob = promisify(globOrg)

const rootPackageStr = await fs.readFile(path.join(path.dirname(fileURLToPath(import.meta.url)), '../package.json'))
const rootPackage = JSON.parse(rootPackageStr.toString())

/*
    This script copies some common properties (from commonPackage.json)
    into package.json of each of the packages.
    */

let count = 0
const extendPackageStr = await fs.readFile('commonPackage.json')
const extendPackage = JSON.parse(extendPackageStr)
delete extendPackage.description // don't copy this propery

for (const workspaceDef of rootPackage.workspaces) {
	const packageJsons = await glob(`${workspaceDef}/package.json`)
	for (const packageJsonPath of packageJsons) {
		try {
			if (!packageJsonPath.match(/node_modules/)) {
				const packageJsonStr = await fs.readFile(packageJsonPath)
				const packageJson = JSON.parse(packageJsonStr)

				const newPackageJson = deepExtend({}, packageJson, extendPackage)

				if (!_.isEqual(newPackageJson, packageJson)) {
					await fs.writeFile(packageJsonPath, JSON.stringify(newPackageJson, undefined, '\t') + '\n')
					count++
				}
			}
		} catch (err) {
			console.error(`Error when processing ${packageJsonPath}`)
			throw err
		}
	}
}

if (count) {
	console.log(`Updated package.json of ${count} packages`)
	console.log(`You should commit these changes and run yarn install again.`)
	process.exit(1)
}
