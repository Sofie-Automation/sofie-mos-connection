const fs = require('fs')
const path = require('path')
const cp = require('child_process')

// This script fixes a few things after a release version has been bumped

async function run() {
	await removeFile('packages/examples/CHANGELOG.md')
	await fixPackageVersion('packages/examples/package.json')

	await removeFile('packages/quick-mos/CHANGELOG.md')
	await fixPackageVersion('packages/quick-mos/package.json')

	await removeFile('packages/mos-dummy-device/CHANGELOG.md')
	await fixPackageVersion('packages/mos-dummy-device/package.json')

	await commit()
}

async function fixPackageVersion(filePath) {
	filePath = path.resolve(filePath)
	const packageJsonStr = await fs.promises.readFile(filePath, 'utf8')
	const packageJson = JSON.parse(packageJsonStr)
	packageJson.version = '0.0.0'

	await fs.promises.writeFile(filePath, JSON.stringify(packageJson, null, '\t') + '\n', 'utf8')
}
async function removeFile(filePath) {
	try {
		await fs.promises.unlink(filePath)
	} catch (e) {
		if (e.code === 'ENOENT') {
			// File does not exist, do nothing
			return
		}
		throw e
	}
}
async function commit() {
	const latestGitCommit = cp.execSync('git log -1')

	// get last git commit message
	const message = latestGitCommit.toString().split('\n')[4].trim()
	// Check that the last commit message is a version bump
	if (message.match(/v\d+\.\d+.\d+/)) {
		const tag = message
		console.log('Amending last commit with changes...')
		exec('git add .')
		exec('git commit --amend --no-edit --no-verify')

		// Move tag:
		exec(`git tag -d ${tag}`)
		exec(`git tag ${tag}`)
	} else {
		console.log('NOT committing changes!')
	}
}
function exec(cmd) {
	console.log(cmd)
	cp.execSync(cmd)
}
run()
	.then(() => console.log('Done'))
	.catch(console.error)
