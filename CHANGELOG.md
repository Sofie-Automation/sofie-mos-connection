# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.2.3](https://github.com/nrkno/tv-automation-mos-connection/compare/v4.2.2...v4.2.3) (2025-08-06)


### Bug Fixes

* handle empty mosID in acks ([#113](https://github.com/nrkno/tv-automation-mos-connection/issues/113)) ([8c5c199](https://github.com/nrkno/tv-automation-mos-connection/commit/8c5c1998bca37d006862af86d719fa6a4c39019f))





## [4.2.2](https://github.com/nrkno/tv-automation-mos-connection/compare/v4.2.2-alpha.0...v4.2.2) (2025-01-22)


### Bug Fixes

* ExternalMetadata.MosPayload wasn't passed through when containing string. Changed MosPayload to be AnyXMLValue instead of AnyXMLObject. ([d5cfec5](https://github.com/nrkno/tv-automation-mos-connection/commit/d5cfec50b3a1ccfeb60c4992f0e8ce50c4043bf1))





## [4.2.1-alpha.0](https://github.com/nrkno/tv-automation-mos-connection/compare/v4.2.0...v4.2.1-alpha.0) (2025-01-10)


### Bug Fixes

* add helper functions for dealing with AnyXmlValue and export them ([e4a5f48](https://github.com/nrkno/tv-automation-mos-connection/commit/e4a5f482efb1bd07ce0a9f07d1bdfd9a1ed8063d))





# [4.2.0](https://github.com/nrkno/tv-automation-mos-connection/compare/v4.1.0...v4.2.0) (2024-12-05)


### Bug Fixes

* bug fix in quick-mos ([7fd531b](https://github.com/nrkno/tv-automation-mos-connection/commit/7fd531bc3149d357291388f20e0e9503d3b63f30))
* Disable heartbeat on primary if secondary is active in openMediaHotStandby mode. ([f550bd5](https://github.com/nrkno/tv-automation-mos-connection/commit/f550bd54cbd48cda0ab1becab011d4af5ff72658))
* failover to buddy when main not up to date ([8554f60](https://github.com/nrkno/tv-automation-mos-connection/commit/8554f6051c277be7d254bdcd9e3aa1b3ab801a10))
* hotStandby - set heartbeats state no matter secondary's state ([c2b35be](https://github.com/nrkno/tv-automation-mos-connection/commit/c2b35bec5db5c85ab91e97f09db2d33bb104589e))
* parse incoming data as strings (Big Refactor) ([0f0f8d3](https://github.com/nrkno/tv-automation-mos-connection/commit/0f0f8d3986b3fe80153971d271742cc46c0301d1))
* Quick-MOS: Add support for Sofie Snapshots ([ab2d17e](https://github.com/nrkno/tv-automation-mos-connection/commit/ab2d17e01b2459aacce283387602c5ab86bbc02d))
* rename new test ([248a4f8](https://github.com/nrkno/tv-automation-mos-connection/commit/248a4f8e8e8bf550dde35e06ce86689298d57256))
* revert renaming to isHotStandby to avoid conflict with MOS-Gateway ([562d74b](https://github.com/nrkno/tv-automation-mos-connection/commit/562d74badae2a17feceddbe43b590390c7ac8015))
* update typings for mosTime, undefined was allowed in types, but not in code. ([fb2369a](https://github.com/nrkno/tv-automation-mos-connection/commit/fb2369abb3a876675c7e941092f96460e2da45f8))


### Features

* Add tests for openMediaHotStandby ([5985b19](https://github.com/nrkno/tv-automation-mos-connection/commit/5985b191fcaea9d54d2bec73d4abf87b02f8bd26))
* Support for openMediaHotStandby disable heartbeat on secondary when not used ([ab04e49](https://github.com/nrkno/tv-automation-mos-connection/commit/ab04e4900f1a73324a0ff7de6363421ad579bf26))





# [4.2.0-alpha.1](https://github.com/nrkno/tv-automation-mos-connection/compare/v4.1.1...v4.2.0-alpha.1) (2024-08-27)



# [4.2.0-alpha.0](https://github.com/nrkno/tv-automation-mos-connection/compare/v4.1.0...v4.2.0-alpha.0) (2024-07-05)


### Bug Fixes

* parse incoming data as strings (Big Refactor) ([0f0f8d3](https://github.com/nrkno/tv-automation-mos-connection/commit/0f0f8d3986b3fe80153971d271742cc46c0301d1))





## [4.1.1](https://github.com/nrkno/tv-automation-mos-connection/compare/v4.1.0...v4.1.1) (2024-08-20)


### Bug Fixes

* failover to buddy when main not up to date ([8554f60](https://github.com/nrkno/tv-automation-mos-connection/commit/8554f6051c277be7d254bdcd9e3aa1b3ab801a10))
* update typings for mosTime, undefined was allowed in types, but not in code. ([fb2369a](https://github.com/nrkno/tv-automation-mos-connection/commit/fb2369abb3a876675c7e941092f96460e2da45f8))





# [4.1.0](https://github.com/nrkno/tv-automation-mos-connection/compare/v4.0.0...v4.1.0) (2024-04-02)


### Bug Fixes

* add .snap file for open media test ([9bb6825](https://github.com/nrkno/tv-automation-mos-connection/commit/9bb6825cb2986d3ce3ac90a8c7ef2c7f3a6f5adc))
* add 'N/A' to supported profiles ([c56007a](https://github.com/nrkno/tv-automation-mos-connection/commit/c56007a161b034ebe411b9848fa079f684bc9d51))
* lint fix and Porfile0-non-strict snapsot ([dfbc4c1](https://github.com/nrkno/tv-automation-mos-connection/commit/dfbc4c1fccf66b717aec16ea033b81e28a68455e))
* OpenMedia returns an empty object {} as time, will be set as current time instead. ([7a2531a](https://github.com/nrkno/tv-automation-mos-connection/commit/7a2531afd711f1d62d3bb121592b6f6194c42a91))
* optional on xmlSupportedProfiles as OpemMedia has this undefined ([b0ed480](https://github.com/nrkno/tv-automation-mos-connection/commit/b0ed48051134c39f105ed15e5c660d2c9819d4ef))


### Features

* add access to stric t value un mosSocketClient ([c85b837](https://github.com/nrkno/tv-automation-mos-connection/commit/c85b837cbfb0b7b7367f9ca0bf402e70d181930e))
* add test for opem media ([18362f7](https://github.com/nrkno/tv-automation-mos-connection/commit/18362f74f2362eac650bddd257e3d2ef391f6c5d))
* new function _getMessageId to manage when no messageId ([19f8231](https://github.com/nrkno/tv-automation-mos-connection/commit/19f82311252c9b5e8c1a0ba8b901438c42e3c9d3))





# [4.0.0](https://github.com/nrkno/tv-automation-mos-connection/compare/v3.0.7...v4.0.0) (2024-02-02)

### ⚠ BREAKING CHANGES

- Changes to `mosDevice.sendRequestAllMOSObjects()`. MosObjects are now returned to the `mosDevice.onMOSObjects()` callback.

**Migration guide:**

```typescript
// Before:
const mosObjs = await mosDevice.sendRequestAllMOSObjects()

// After:
mosDevice.onMOSObjects((mosObjs: IMOSObject[]) => {
  //
})
const ack = await mosDevice.sendRequestAllMOSObjects()
```

### Bug Fixes

* better handling of non-spec errors. ([4b1f97c](https://github.com/nrkno/tv-automation-mos-connection/commit/4b1f97cf4112f465c353b482b35201fcaef9864e))
* change how data fields is parsed, better handling of missing data. ([bf4a084](https://github.com/nrkno/tv-automation-mos-connection/commit/bf4a0845a7f836015aa452db45c023debef94480))
* connectionStatus now returns textual status, not just empty strings, addressing [#93](https://github.com/nrkno/tv-automation-mos-connection/issues/93) ([23d9b16](https://github.com/nrkno/tv-automation-mos-connection/commit/23d9b161d597223ed750a61dc7d87bacec4def51))
* revert mosTime support of empty string. ([cfc036f](https://github.com/nrkno/tv-automation-mos-connection/commit/cfc036f5c2604ae193bc2d683e02ad2a9d6bb477))
* roStoryMove: off-spec support of single storyID tag ([58ff304](https://github.com/nrkno/tv-automation-mos-connection/commit/58ff30429976655b30596181041449b3e8060ff9))
* roStoryMoveMultiple: handle edge case of single storyID ([4684116](https://github.com/nrkno/tv-automation-mos-connection/commit/46841160704e11e6ac00bcdee0e3bbf828c54393))


### Features

* support for receiving Profile 1 <mosObj> and <mosListAll> messages. ([786710a](https://github.com/nrkno/tv-automation-mos-connection/commit/786710ad1d71015b76dc7e01cdc7a286a02c96a4))





## [3.0.7](https://github.com/nrkno/tv-automation-mos-connection/compare/v3.0.6...v3.0.7) (2023-12-27)


### Bug Fixes

* Add support for receiving roStoryX, roStoryY messages. ([a4c110e](https://github.com/nrkno/tv-automation-mos-connection/commit/a4c110e229134d11f1d7a755086d68b002281264))





## [3.0.5](https://github.com/nrkno/tv-automation-mos-connection/compare/v3.0.4...3.0.5) (2023-12-18)


### Bug Fixes

* better handling of incoming data chunks. Deals with multiple <mos> and </mos> tags. ([59cacb2](https://github.com/nrkno/tv-automation-mos-connection/commit/59cacb21c178ea14c7ad4c8771198e6ec656459c))
* better handling of single xml elements ([f96ea1a](https://github.com/nrkno/tv-automation-mos-connection/commit/f96ea1a61cef385435d1088acc46cd1e25c5c4bf))
* case roStorySend one storyItem ([77dfff5](https://github.com/nrkno/tv-automation-mos-connection/commit/77dfff5c36c2dd7d42efa0932a561b800af636a4))
* Handle empty MOS time string ([85fbc88](https://github.com/nrkno/tv-automation-mos-connection/commit/85fbc886d7b577db07bece23efc53f6058a92a43))
* handle replies to roReq ([c100b4d](https://github.com/nrkno/tv-automation-mos-connection/commit/c100b4d017f21d45529c0c912754808f8a0431bc))





## [3.0.4](https://github.com/nrkno/tv-automation-mos-connection/compare/v3.0.1...v3.0.4) (2023-06-09)


### Bug Fixes

* handover logic should leave heartbearts ([d8ccca0](https://github.com/nrkno/tv-automation-mos-connection/commit/d8ccca0af14e5d3d3574fec4284b4df91336803d))
* minor improvement to RoAck ([7cb0bb6](https://github.com/nrkno/tv-automation-mos-connection/commit/7cb0bb68be07507a86a20615b3d0b751430e79f9))





## [3.0.3](https://github.com/nrkno/tv-automation-mos-connection/compare/v3.0.2...v3.0.3) (2023-06-09)


### Bug Fixes

* handover logic should leave heartbearts ([d8ccca0](https://github.com/nrkno/tv-automation-mos-connection/commit/d8ccca0af14e5d3d3574fec4284b4df91336803d))





## [3.0.2](https://github.com/nrkno/tv-automation-mos-connection/compare/v3.0.1...v3.0.2) (2023-03-27)


### Bug Fixes

* minor improvement to RoAck ([7cb0bb6](https://github.com/nrkno/tv-automation-mos-connection/commit/7cb0bb68be07507a86a20615b3d0b751430e79f9))





# [3.0.0](https://github.com/nrkno/tv-automation-mos-connection/compare/v3.0.0-alpha.3...v3.0.0) (2023-02-03)

**Note:** Version bump only for package mos-connection-monorepo





# [3.0.0-alpha.3](https://github.com/nrkno/tv-automation-mos-connection/compare/v3.0.0-alpha.2...v3.0.0-alpha.3) (2023-01-27)

**Note:** Version bump only for package mos-connection-monorepo





# [3.0.0-alpha.2](https://github.com/nrkno/tv-automation-mos-connection/compare/v3.0.0-alpha.0...v3.0.0-alpha.2) (2023-01-27)


### Bug Fixes

* add stringifyMosObject, an utility-function used to convert objects containing IMOSString128 etc to strings ([f3806ab](https://github.com/nrkno/tv-automation-mos-connection/commit/f3806ab4e72a02b450e91ab19fbbfca34c605caa))





# [3.0.0-alpha.1](https://github.com/nrkno/tv-automation-mos-connection/compare/v3.0.0-alpha.0...3.0.0-alpha.1) (2023-01-27)


### Bug Fixes

* add stringifyMosObject, an utility-function used to convert objects containing IMOSString128 etc to strings ([f3806ab](https://github.com/nrkno/tv-automation-mos-connection/commit/f3806ab4e72a02b450e91ab19fbbfca34c605caa))





# [v3.0.0-alpha.0](https://github.com/nrkno/tv-automation-mos-connection/compare/2.0.1...v3.0.0-alpha.0) (2022-12-09)

### BREAKING CHANGES

- mos-connection is now distributed as 3 separate npm-packages.
  - **@mos-connection/model** contains types, enums and a few data-handling functions. This is useful for consuming apps that handles the MOS-data indirectly.
  - **@mos-connection/helper** contains all of the /model but also includes functions fox xml-conversion. This is useful for consuming apps that creates/parses MOS-data, such as web-client-plugin handlers.
  - **@mos-connection/connector** contains all of the above, as well as the MOS connector. This is equivalent to the previous `mos-connection` library.

Notable code changes:

```typescript
this_is_the_new_code // old code
```

```typescript
import * from '@mos-connection/connector' // previously: import * from 'mos-connection'
```

```typescript
import { getDataHandlers } from '@mos-connection/model'
const mosTypes = getMosTypes(true)

// Removed classes MosString128, MosTime & MosDuration
// These are replaces with the MosTypes methods described below as well as the types:
type IMOSString128 // previously: MosString128
type IMOSTime // previously: MosTime
type IMOSDuration // previously: MosDuration

// Create mos-types:
const mosString128 = mosTypes.mosString128.create('abc') // previously: new MosString128('abc')
const mosDuration = mosTypes.mosDuration.create(someDuration) // previously: new MosTime(someDuration)
const mosTime = mosTypes.mosTime.create(someTime) // previously: const new MosTime(someTime)

// Parse mos-types data:
mosTypes.mosString128.stringify(mosString128) // previously: mosString128.toString() or hackish: mosString128['_str']
mosTypes.mosTime.valueOf(mosTime)  // previously: mosTime.getTime()

// Check if a data-point is of a certain MosType:
mosTypes.mosTime.is(data) // previously: data instanceof MosTime

addTextElement(xml, elementName, content, attributes, strict) // added the "strict" parameter
```

```typescript
import { addTextElement } from '@mos-connection/model'

// XML generation:
addTextElement(xml, elementName, content, attributes, strict) // added the "strict" parameter
```

### Bug Fixes

- better cleanup on dispose ([a241d78](https://github.com/nrkno/tv-automation-mos-connection/commit/a241d78e0dd0b4f8a24fb17964ea45b791afca6f))

### Features

- move helper functions into a separate package: $mos-connection/helper ([ecb51ec](https://github.com/nrkno/tv-automation-mos-connection/commit/ecb51ec3ca26c15a61fd629e59265345c247f82e))
- move types and enums to @mos-connection/model ([2266488](https://github.com/nrkno/tv-automation-mos-connection/commit/2266488f4062da6a1f2949a3374c58c26a20d79e))

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.0.1](https://github.com/nrkno/sofie-mos-connection/compare/2.0.0...2.0.1) (2022-08-01)

### Bug Fixes

- gracefully handle failure to parse DOM in IMOSListMachInfo ([72aa53a](https://github.com/nrkno/sofie-mos-connection/commit/72aa53a35bc36f479c4db76fbdce26efeed30ca0))

## [2.0.0](https://github.com/nrkno/sofie-mos-connection/compare/1.0.7...2.0.0) (2022-06-08)

### ⚠ BREAKING CHANGES

- Drop support for Node 12

### Features

- Drop support for Node 12 ([abd326d](https://github.com/nrkno/tv-automation-mos-connection/commit/abd326d3d44a9b04320ea7d7800fe786bd96b855))

### Bug Fixes

- add heartbeatInterval property ([79b5523](https://github.com/nrkno/tv-automation-mos-connection/commit/79b55231693f2c4093c085e51bf940abe276f088))
- more helpful messages for "Unknown response" errors ([4a91fa5](https://github.com/nrkno/tv-automation-mos-connection/commit/4a91fa53661060cc62c528294540752c5b4dde78))
- bug in roElementAction command for REPLACE and SWAP items ([42034d9](https://github.com/nrkno/sofie-mos-connection/commit/42034d9b92dfac0801a8fe6f64b1ebc0c32cd483))
- bug in roListAll message ([b4b79c8](https://github.com/nrkno/sofie-mos-connection/commit/b4b79c899a47ebfa231600c0dd16a0ebd7df79f2))
- typedoc ([d71c354](https://github.com/nrkno/sofie-mos-connection/commit/d71c354f7eb2c4463dda5056e015174c93c5704f))
- update unit tests & fix prsing-issue in requestMachineInfo response ([2b73347](https://github.com/nrkno/sofie-mos-connection/commit/2b733478cc03f9bfbcf65f9783cde6e4ffef3e6c))

### [1.0.7](https://github.com/nrkno/tv-automation-mos-connection/compare/1.0.5-1...1.0.7) (2022-05-13)

### Bug Fixes

- improve command timeouts ([5304209](https://github.com/nrkno/tv-automation-mos-connection/commit/53042095ca82f0a049b2f789b82e4f53082d9e28))
- usc2 is not a valid encoding. ([e25d618](https://github.com/nrkno/tv-automation-mos-connection/commit/e25d6183560899e26e8c4ad2c80f924fcfdaca70))

### [1.0.6](https://github.com/nrkno/tv-automation-mos-connection/compare/1.0.5...1.0.6) (2022-03-29)

### Bug Fixes

- usc2 is not a valid encoding. ([e25d618](https://github.com/nrkno/tv-automation-mos-connection/commit/e25d6183560899e26e8c4ad2c80f924fcfdaca70))

### [1.0.5](https://github.com/nrkno/tv-automation-mos-connection/compare/1.0.5-1...1.0.5) (2021-12-17)

### [1.0.5-1](https://github.com/nrkno/tv-automation-mos-connection/compare/1.0.5-0...1.0.5-1) (2021-11-18)

### Bug Fixes

- bug fix ([8f420d9](https://github.com/nrkno/tv-automation-mos-connection/commit/8f420d9fde1521c87ee35715139ad104df3b231e))
- improve error message for if function isn't supported ([5218fcb](https://github.com/nrkno/tv-automation-mos-connection/commit/5218fcb140174c43026956f82b3f7d26b831e53c))
- supress heartbeat debug messages. ([8144671](https://github.com/nrkno/tv-automation-mos-connection/commit/81446716f0d7d15f101242752e3b89ba03265270))

### [1.0.5-0](https://github.com/nrkno/tv-automation-mos-connection/compare/1.0.3...1.0.5-0) (2021-11-18)

### Bug Fixes

- remove debugTrace of heartbeats, to reduce logging amount [release] ([c82e09b](https://github.com/nrkno/tv-automation-mos-connection/commit/c82e09b9756347ae9d1f8625e055ad575698264a))
- remove debugTrace to remove duplicate logs (since rawMessage is also emitted there) ([b2f1a27](https://github.com/nrkno/tv-automation-mos-connection/commit/b2f1a27dd564358602d323148eb0cf032edd993d))

### [1.0.4](https://github.com/nrkno/tv-automation-mos-connection/compare/1.0.3...1.0.4) (2021-09-21)

### Bug Fixes

- remove debugTrace of heartbeats, to reduce logging amount [release] ([c82e09b](https://github.com/nrkno/tv-automation-mos-connection/commit/c82e09b9756347ae9d1f8625e055ad575698264a))
- remove debugTrace to remove duplicate logs (since rawMessage is also emitted there) ([b2f1a27](https://github.com/nrkno/tv-automation-mos-connection/commit/b2f1a27dd564358602d323148eb0cf032edd993d))

### [1.0.3](https://github.com/nrkno/tv-automation-mos-connection/compare/1.0.2...1.0.3) (2021-08-16)

### Bug Fixes

- add check for that the profile is set when registering a method (strict mode only) ([800f63c](https://github.com/nrkno/tv-automation-mos-connection/commit/800f63cbc9a08a61a93a62f4c495ad0300e52676))
- bad merge [publish] ([8f29ca9](https://github.com/nrkno/tv-automation-mos-connection/commit/8f29ca93b613467c9b45f4ce259b19db0f2de8ff))
- bug in index ([45af280](https://github.com/nrkno/tv-automation-mos-connection/commit/45af280c8a10fa436e5356c363993542c61b1cee))
- minor typings issues ([68f4b20](https://github.com/nrkno/tv-automation-mos-connection/commit/68f4b20888c4c00a61cf0d72b791e6328f0cda15))
- rare issue on closed connection / timeout ([457992d](https://github.com/nrkno/tv-automation-mos-connection/commit/457992df5092db47f9eb033ecfdd68f237942a2c))
- roList encoding missing most properties ([a2d7650](https://github.com/nrkno/tv-automation-mos-connection/commit/a2d765097994e9b8de343a6bd567fd115a267533))
- temporary fix for a long objSlug we've encountered ([0e0b694](https://github.com/nrkno/tv-automation-mos-connection/commit/0e0b694384656242949d7630d45f89e8f27c5cc2))

### [1.0.2](https://github.com/nrkno/tv-automation-mos-connection/compare/1.0.1...1.0.2) (2021-04-21)

### Bug Fixes

- add missing properties in xml-conversion of mosItem [release] ([4c20a6e](https://github.com/nrkno/tv-automation-mos-connection/commit/4c20a6e5aada2a772a6db6ccda0f2e2f7f4cf35c))
- export MosModel methods ([8794b9d](https://github.com/nrkno/tv-automation-mos-connection/commit/8794b9ddab03b326877bb3ec501e0a74ab11fc59))
- move interface into api.ts [release] ([0317ea2](https://github.com/nrkno/tv-automation-mos-connection/commit/0317ea28167f6a7b1dad22a5485eeb3785715a32))

### [1.0.1](https://github.com/nrkno/tv-automation-mos-connection/compare/1.0.0...1.0.1) (2021-04-21)

### Bug Fixes

- stricter handling of the debug flag, to fix minor bug; The debug flag wasn't properly passed into MosSocketServer on init. [release] ([47abd73](https://github.com/nrkno/tv-automation-mos-connection/commit/47abd73e8015dda839ec54948299f21dc6c36ae9))

## [1.0.0](https://github.com/nrkno/tv-automation-mos-connection/compare/0.9.0...1.0.0) (2021-04-16)

### Features

- add many of the ncs-triggerable functions (wip) ([11636a2](https://github.com/nrkno/tv-automation-mos-connection/commit/11636a25cd44c29ccf359752f3e0b16dc5a38d64))
- add sendReadyToAir message ([8ad31f3](https://github.com/nrkno/tv-automation-mos-connection/commit/8ad31f30bcc7fc25d92aabaa5d721b772c84036a))
- added support for roReqAll command ([2f6d6da](https://github.com/nrkno/tv-automation-mos-connection/commit/2f6d6da40f9b5fa0112ca9719af28f1c2b93eed5))
- allow using non-standard ports ([6a12942](https://github.com/nrkno/tv-automation-mos-connection/commit/6a1294296aec97dca93f2bbd6b67ec0fe0654852))
- continued work on NCS functionality (wip) ([b462a95](https://github.com/nrkno/tv-automation-mos-connection/commit/b462a95c52dfb7ae21293fe386259c1009ea7061))
- strict mode, which when set will trace to console if not all callbacks are set up for a certain profile ([3f1d132](https://github.com/nrkno/tv-automation-mos-connection/commit/3f1d1321476d464d475b8a4a3985dddd9da05d6a))
- when a mos-client connects, set up a "primary" connection back to it, so that data can be pushed back ([0ab244e](https://github.com/nrkno/tv-automation-mos-connection/commit/0ab244e3f65ea438e89f3e27fff114697845d4a4))

### Bug Fixes

- add setTime property ([9eef2e5](https://github.com/nrkno/tv-automation-mos-connection/commit/9eef2e57837790e3a2050de0267c72ef40196ee8))
- bug in \_checkProfileValidness ([0a7ecbf](https://github.com/nrkno/tv-automation-mos-connection/commit/0a7ecbfce8bcee43c292eec4f654a7e8fc0d18d7))
- bug in currentConnection ([2d3a69b](https://github.com/nrkno/tv-automation-mos-connection/commit/2d3a69bb65440cda04ae701c7388f46bd2ca3ab7))
- correct return type for mosObjCreate ([93441d0](https://github.com/nrkno/tv-automation-mos-connection/commit/93441d0fa31edea16f32ea2d529782304cabc0d5))
- encoding ROStory missing roId ([0304e92](https://github.com/nrkno/tv-automation-mos-connection/commit/0304e920279f7d16491717b8628b0e1691b4c20f))
- ensure all message constructors has a defined port ([0196407](https://github.com/nrkno/tv-automation-mos-connection/commit/019640745de45aa3262a68dc364e7228607ddce8))
- issue where socket could be tried written to after being disposed ([fe121da](https://github.com/nrkno/tv-automation-mos-connection/commit/fe121daaec14f2db862ac8b1cd001c2be05a06c6))
- made listMachInfo.supportedProfiles.deviceTypes stricter, according to spec ([47ada35](https://github.com/nrkno/tv-automation-mos-connection/commit/47ada35c7c0740649dbad0636534ff97c1c98b54))
- minor bug in return values ([52157c2](https://github.com/nrkno/tv-automation-mos-connection/commit/52157c2206c02471d56418288c500f67e35a48a3))
- refactor mosDevice.routeData into async/await [publish] ([1e7cc3c](https://github.com/nrkno/tv-automation-mos-connection/commit/1e7cc3c78f246dab08eb78b356532c55589739e3))
- refactor: moved the xml-parsing functions into separate files under each profile ([e97e196](https://github.com/nrkno/tv-automation-mos-connection/commit/e97e196b85bb768d5b66536b3db5164036152085))
- rename setXXXStatus to sendXXXStatus ([5dc63c6](https://github.com/nrkno/tv-automation-mos-connection/commit/5dc63c69bcdb311efd94d57c0ffaaf8d5a6aace9))
- reversed order of parameters in addTextElement. This reduces complexity in the code, and fixes a bug in retuned data from reqMachInfo. ([4f35b2f](https://github.com/nrkno/tv-automation-mos-connection/commit/4f35b2ffeb07aba277357a1f3d2bbe5a2bb6a325))
- update api.ts: rename/clarify/harminize method names & add documentation. ([7a8d6a6](https://github.com/nrkno/tv-automation-mos-connection/commit/7a8d6a62b1bde00dee2f427dbcf5dbd86aabf551))

## [0.9.0](https://github.com/nrkno/tv-automation-mos-connection/compare/0.8.10...0.9.0) (2020-09-29)

### ⚠ BREAKING CHANGES

- drop support for node 8

### Features

- drop support for node 8 ([d42e556](https://github.com/nrkno/tv-automation-mos-connection/commit/d42e55601f1a6b5e3d5b8d12829ec88e3f0a9eb8))
- drop support for node 8 ([9a2d44c](https://github.com/nrkno/tv-automation-mos-connection/commit/9a2d44c07c6803a09385f30864035cfec708f272))

### [0.8.10](https://github.com/nrkno/tv-automation-mos-connection/compare/0.8.9...0.8.10) (2020-03-24)

### Features

- **ci:** optionally skip the audit [skip ci] ([df946f2](https://github.com/nrkno/tv-automation-mos-connection/commit/df946f21d21d45b186ae70bea5b71f3918e2b50d))
- add prerelease flow [publish] ([1acec89](https://github.com/nrkno/tv-automation-mos-connection/commit/1acec894f5902a751b07450d19beb0ed6fb22baa))

### Bug Fixes

- start and duration can be 0 ([b5f47a5](https://github.com/nrkno/tv-automation-mos-connection/commit/b5f47a52c69fbad41a840ea29688f0bcaf41b1e4))

### [0.8.9](https://github.com/nrkno/tv-automation-mos-connection/compare/0.8.8...0.8.9) (2020-01-24)

### Bug Fixes

- A private static does not set a return value when compiled, which gives errors downstream. ([44d8b65](https://github.com/nrkno/tv-automation-mos-connection/commit/44d8b6562672df671818d8ce6c2f88aa7d0ac981))

### [0.8.8](https://github.com/nrkno/tv-automation-mos-connection/compare/0.8.7...0.8.8) (2020-01-24)

### Bug Fixes

- corrected <objMetadataPath> name (it had a space in it) ([9a8dbe0](https://github.com/nrkno/tv-automation-mos-connection/commit/9a8dbe068769f10ef72e3cb8af9d2d7e5b85d14b))
- update xmlBuilder and typescript dependency ([cb5e985](https://github.com/nrkno/tv-automation-mos-connection/commit/cb5e985c6d424c4d18a64d6dc0fe23874cf18ef1))
- wrap all xml.ele() into addTextElement() in order to make sure that what's added is a string (through .toString() ). ([e56a75e](https://github.com/nrkno/tv-automation-mos-connection/commit/e56a75ecbdb34adc42109f250f0592daf433e259))

### [0.8.7](https://github.com/nrkno/tv-automation-mos-connection/compare/0.8.6...0.8.7) (2020-01-19)

### Bug Fixes

- resolve an issue with a duplicated type MosDuration ([60de1cc](https://github.com/nrkno/tv-automation-mos-connection/commit/60de1cc071b834a304381faa961b3a9b9bfc9643))

### [0.8.6](https://github.com/nrkno/tv-automation-mos-connection/compare/0.8.5...0.8.6) (2020-01-08)

### Features

- add dontUseQueryPort option, to suppress some logging output ([41ca963](https://github.com/nrkno/tv-automation-mos-connection/commit/41ca9633a976de4199e0556ec0b6d2d977408ab1))
- update ci to run for node 8,10,12 ([858ee35](https://github.com/nrkno/tv-automation-mos-connection/commit/858ee356d474b488c7c9d5f0ab5a64ec548cc80c))

### [0.8.5](https://github.com/nrkno/tv-automation-mos-connection/compare/0.8.4...0.8.5) (2019-10-25)

### [0.8.4](https://github.com/nrkno/tv-automation-mos-connection/compare/0.8.3...0.8.4) (2019-08-20)

### Bug Fixes

- types/xmlbuilder must be a dependency for the library to work properly ([04f9181](https://github.com/nrkno/tv-automation-mos-connection/commit/04f9181))

### [0.8.3](https://github.com/nrkno/tv-automation-mos-connection/compare/0.8.2...0.8.3) (2019-08-01)

### Bug Fixes

- downgrade gh-pages dep, due to issues with it. ([1d852a9](https://github.com/nrkno/tv-automation-mos-connection/commit/1d852a9))
- update dependencies, after security audit ([13b8e41](https://github.com/nrkno/tv-automation-mos-connection/commit/13b8e41))

### [0.8.2](https://github.com/nrkno/tv-automation-mos-connection/compare/0.8.1...0.8.2) (2019-06-07)

## [0.8.1](https://github.com/nrkno/tv-automation-mos-connection/compare/0.8.0...0.8.1) (2019-04-11)

### Bug Fixes

- don't send heartbeat on query port ([fd1219f](https://github.com/nrkno/tv-automation-mos-connection/commit/fd1219f))

<a name="0.6.6"></a>

## [0.6.6](https://github.com/nrkno/tv-automation-mos-connection/compare/0.6.5...0.6.6) (2019-01-29)

### Bug Fixes

- techDescription can be a string (Merge branch 'develop') ([d1f057f](https://github.com/nrkno/tv-automation-mos-connection/commit/d1f057f))

<a name="0.6.5"></a>

## [0.6.5](https://github.com/nrkno/tv-automation-mos-connection/compare/0.6.4...0.6.5) (2018-12-11)

### Bug Fixes

- add exports ([918f486](https://github.com/nrkno/tv-automation-mos-connection/commit/918f486))
- add missing dependency ([22089f9](https://github.com/nrkno/tv-automation-mos-connection/commit/22089f9))

<a name="0.6.4"></a>

## [0.6.4](https://github.com/nrkno/tv-automation-mos-connection/compare/0.6.3...0.6.4) (2018-11-16)

### Bug Fixes

- new MosString from another MosString ([f694623](https://github.com/nrkno/tv-automation-mos-connection/commit/f694623))
- refactor MosString128 & add tests ([0839e10](https://github.com/nrkno/tv-automation-mos-connection/commit/0839e10))

<a name="0.6.3"></a>

## [0.6.3](https://github.com/nrkno/tv-automation-mos-connection/compare/0.6.2...0.6.3) (2018-11-06)

### Bug Fixes

- method called with wrong context ([4768757](https://github.com/nrkno/tv-automation-mos-connection/commit/4768757))
- proper handling of empty string ([22d8da6](https://github.com/nrkno/tv-automation-mos-connection/commit/22d8da6))

<a name="0.6.2"></a>

## [0.6.2](https://github.com/nrkno/tv-automation-mos-connection/compare/0.6.1...0.6.2) (2018-10-11)

### Bug Fixes

- added \_lingeringMessage, to allow heartbeat replies to come through, even after a handOver ([e515560](https://github.com/nrkno/tv-automation-mos-connection/commit/e515560))

<a name="0.6.1"></a>

## [0.6.1](https://github.com/nrkno/tv-automation-mos-connection/compare/0.6.0...0.6.1) (2018-10-11)

<a name="0.6.0"></a>

# [0.6.0](https://github.com/nrkno/tv-automation-mos-connection/compare/0.5.6...0.6.0) (2018-10-10)

### Features

- set debug flag dynamically ([51c3718](https://github.com/nrkno/tv-automation-mos-connection/commit/51c3718))

<a name="0.5.6"></a>

## [0.5.6](https://github.com/nrkno/tv-automation-mos-connection/compare/0.5.5...0.5.6) (2018-09-25)

### Bug Fixes

- case sensitive import ([bc636b6](https://github.com/nrkno/tv-automation-mos-connection/commit/bc636b6))

<a name="0.5.5"></a>

## [0.5.5](https://github.com/nrkno/tv-automation-mos-connection/compare/0.5.4...0.5.5) (2018-09-04)

<a name="0.5.4"></a>

## [0.5.4](https://github.com/nrkno/tv-automation-mos-connection/compare/0.5.3...0.5.4) (2018-08-28)

### Bug Fixes

- missing properties ObjDur and ObjTB ([1f6f564](https://github.com/nrkno/tv-automation-mos-connection/commit/1f6f564))

<a name="0.5.3"></a>

## [0.5.3](https://github.com/nrkno/tv-automation-mos-connection/compare/0.5.2...0.5.3) (2018-08-21)

### Bug Fixes

- proper bubbling of error & warning events ([5d14e55](https://github.com/nrkno/tv-automation-mos-connection/commit/5d14e55))

<a name="0.5.2"></a>

## [0.5.2](https://github.com/nrkno/tv-automation-mos-connection/compare/0.5.1...0.5.2) (2018-08-20)

### Bug Fixes

- parse last chunk of xml data ([0e54f03](https://github.com/nrkno/tv-automation-mos-connection/commit/0e54f03))

<a name="0.5.1"></a>

## [0.5.1](https://github.com/nrkno/tv-automation-mos-connection/compare/0.5.0...0.5.1) (2018-08-17)

### Bug Fixes

- mosTime: implemented change from default local to UTC ([b93b8e5](https://github.com/nrkno/tv-automation-mos-connection/commit/b93b8e5))
- updated mosTime tests: default timezone is UTC, not local ([be158a4](https://github.com/nrkno/tv-automation-mos-connection/commit/be158a4))

<a name="0.5.0"></a>

# [0.5.0](https://github.com/nrkno/tv-automation-mos-connection/compare/0.4.0...0.5.0) (2018-08-17)

### Bug Fixes

- 0 reconnects implies infinite reconnects ([7749dc3](https://github.com/nrkno/tv-automation-mos-connection/commit/7749dc3))
- extra guards in switching logic ([a66584e](https://github.com/nrkno/tv-automation-mos-connection/commit/a66584e))
- reconnect timer reset ([970da0d](https://github.com/nrkno/tv-automation-mos-connection/commit/970da0d))
- roAck may contain error regarding buddy server ([4ef32ff](https://github.com/nrkno/tv-automation-mos-connection/commit/4ef32ff))
- timeout messages even before being sent ([39ba705](https://github.com/nrkno/tv-automation-mos-connection/commit/39ba705))

### Features

- failover prototype ([2f979e6](https://github.com/nrkno/tv-automation-mos-connection/commit/2f979e6))
- failover upon NACK: Main Available ([5bb64e4](https://github.com/nrkno/tv-automation-mos-connection/commit/5bb64e4))
- option to enable offspec failover behaviour ([86f7b0d](https://github.com/nrkno/tv-automation-mos-connection/commit/86f7b0d))

<a name="0.4.0"></a>

# [0.4.0](https://github.com/nrkno/tv-automation-mos-connection/compare/0.3.17...0.4.0) (2018-08-03)

### Bug Fixes

- changes in parser when data structures has changed ([4491b8f](https://github.com/nrkno/tv-automation-mos-connection/commit/4491b8f))
- metadata tag might be empty ([897df5c](https://github.com/nrkno/tv-automation-mos-connection/commit/897df5c))
- mosString, flat attributes and removed usage of xml2json ([92bbe41](https://github.com/nrkno/tv-automation-mos-connection/commit/92bbe41))
- single child xml data ([b3dc170](https://github.com/nrkno/tv-automation-mos-connection/commit/b3dc170))
- tests ([cdea898](https://github.com/nrkno/tv-automation-mos-connection/commit/cdea898))
- update xml2Body to retain order ([681fd68](https://github.com/nrkno/tv-automation-mos-connection/commit/681fd68))
- xml2js: changed internal structure to $name & $type, instead of name & type, to avoid collisions ([1706185](https://github.com/nrkno/tv-automation-mos-connection/commit/1706185))

### Features

- added dependency on xml-js ([f2ac082](https://github.com/nrkno/tv-automation-mos-connection/commit/f2ac082))
- keep order of tags inside some fields ([95fe1f8](https://github.com/nrkno/tv-automation-mos-connection/commit/95fe1f8))
- tweaked the parsing, got the test to pass ([ec9c3bd](https://github.com/nrkno/tv-automation-mos-connection/commit/ec9c3bd))

<a name="0.3.17"></a>

## [0.3.17](https://github.com/nrkno/tv-automation-mos-connection/compare/0.3.16...0.3.17) (2018-06-15)

<a name="0.3.16"></a>

## [0.3.16](https://github.com/nrkno/tv-automation-mos-connection/compare/0.3.15...0.3.16) (2018-06-13)

<a name="0.3.15"></a>

## [0.3.15](https://github.com/nrkno/tv-automation-mos-connection/compare/0.3.14...0.3.15) (2018-06-12)

<a name="0.3.14"></a>

## [0.3.14](https://github.com/nrkno/tv-automation-mos-connection/compare/0.3.13...0.3.14) (2018-06-11)

<a name="0.3.13"></a>

## [0.3.13](https://github.com/nrkno/tv-automation-mos-connection/compare/0.3.12...0.3.13) (2018-06-11)

### Bug Fixes

- **mosDuration:** fixes bug with mosDurations displaying wrong values once consumed ([c558777](https://github.com/nrkno/tv-automation-mos-connection/commit/c558777))

<a name="0.3.12"></a>

## [0.3.12](https://github.com/nrkno/tv-automation-mos-connection/compare/0.3.11...0.3.12) (2018-06-05)

### Bug Fixes

- rename in readme ([69dd953](https://github.com/nrkno/tv-automation-mos-connection/commit/69dd953))

<a name="0.3.11"></a>

## [0.3.11](https://github.com/nrkno/tv-automation-mos-connection/compare/0.3.10...0.3.11) (2018-06-05)

### Bug Fixes

- improve changes.md ([3dc5eaf](https://github.com/nrkno/tv-automation-mos-connection/commit/3dc5eaf))
- use generic project name in config. Add more steps to do ([773c469](https://github.com/nrkno/tv-automation-mos-connection/commit/773c469))

<a name="0.3.10"></a>

## [0.3.10](https://github.com/nrkno/tv-automation-mos-connection/compare/0.3.9...0.3.10) (2018-06-01)

<a name="0.3.9"></a>

## [0.3.9](https://github.com/nrkno/tv-automation-mos-connection/compare/0.3.8...0.3.9) (2018-06-01)

<a name="0.3.8"></a>

## [0.3.8](https://github.com/nrkno/tv-automation-mos-connection/compare/0.3.7...0.3.8) (2018-05-31)

### Bug Fixes

- remove dist from git repo ([0607d24](https://github.com/nrkno/tv-automation-mos-connection/commit/0607d24))
- update documentation on scripts ([261ae04](https://github.com/nrkno/tv-automation-mos-connection/commit/261ae04))

<a name="0.3.7"></a>

## [0.3.7](https://github.com/nrkno/tv-automation-mos-connection/compare/0.3.6...0.3.7) (2018-05-31)

### Bug Fixes

- correction to license ([3667644](https://github.com/nrkno/tv-automation-mos-connection/commit/3667644))

<a name="0.3.6"></a>

## [0.3.6](https://github.com/nrkno/tv-automation-mos-connection/compare/0.3.5...0.3.6) (2018-05-31)

### Bug Fixes

- **mosDuration:** fixes bug with mosDurations displaying wrong values once consumed ([8a8af4e](https://github.com/nrkno/tv-automation-mos-connection/commit/8a8af4e))

<a name="0.3.5"></a>

## [0.3.5](https://github.com/nrkno/tv-automation-mos-connection/compare/0.3.4...0.3.5) (2018-05-30)

### Bug Fixes

- add more changes to the list ([042dafb](https://github.com/nrkno/tv-automation-mos-connection/commit/042dafb))

<a name="0.3.4"></a>

## [0.3.4](https://github.com/nrkno/tv-automation-mos-connection/compare/0.3.3...0.3.4) (2018-05-30)

### Bug Fixes

- add more to gitignore ([6ac3591](https://github.com/nrkno/tv-automation-mos-connection/commit/6ac3591))
- remove a bunch of junk from npm releases, also add important files? ([90340c1](https://github.com/nrkno/tv-automation-mos-connection/commit/90340c1))
- remove docs from non-gh-pages branchs ([fb7fdfc](https://github.com/nrkno/tv-automation-mos-connection/commit/fb7fdfc))
- remove travis.yml ([6f31ff3](https://github.com/nrkno/tv-automation-mos-connection/commit/6f31ff3))

<a name="0.3.3"></a>

## [0.3.3](https://github.com/nrkno/tv-automation-mos-connection/compare/0.3.2...0.3.3) (2018-05-30)

### Bug Fixes

- remove persist to workspace on last step ([6c075a9](https://github.com/nrkno/tv-automation-mos-connection/commit/6c075a9))

<a name="0.3.2"></a>

## [0.3.2](https://github.com/nrkno/tv-automation-mos-connection/compare/0.3.1...0.3.2) (2018-05-30)

### Bug Fixes

- yarn timeout ([162a7dd](https://github.com/nrkno/tv-automation-mos-connection/commit/162a7dd))

<a name="0.3.1"></a>

## [0.3.1](https://github.com/nrkno/tv-automation-mos-connection/compare/0.3.0...0.3.1) (2018-05-30)

### Bug Fixes

- missed rename ([9f550a4](https://github.com/nrkno/tv-automation-mos-connection/commit/9f550a4))
- rename steps, workflows, and jobs ([5db0434](https://github.com/nrkno/tv-automation-mos-connection/commit/5db0434))
- typo in send coverage command ([92bb8a2](https://github.com/nrkno/tv-automation-mos-connection/commit/92bb8a2))
- yet another typo in config ([25e4df8](https://github.com/nrkno/tv-automation-mos-connection/commit/25e4df8))
- yet another typoI feel bad. This time I am 87% certain it will work ([004a0ff](https://github.com/nrkno/tv-automation-mos-connection/commit/004a0ff))

<a name="0.3.0"></a>

# [0.3.0](https://github.com/nrkno/tv-automation-mos-connection/compare/0.2.0...0.3.0) (2018-05-30)

### Bug Fixes

- add important change step ([1f7bb12](https://github.com/nrkno/tv-automation-mos-connection/commit/1f7bb12))
- clean out manual release commentsadd comment about yarn publish possibly failing for some users ([d2635f4](https://github.com/nrkno/tv-automation-mos-connection/commit/d2635f4))
- Remove incorrect guide in changes ([7b4a0a2](https://github.com/nrkno/tv-automation-mos-connection/commit/7b4a0a2))
- Remove manual release workflow ([49f110b](https://github.com/nrkno/tv-automation-mos-connection/commit/49f110b))
- run docs generation during CI test ([18729c1](https://github.com/nrkno/tv-automation-mos-connection/commit/18729c1))

### Features

- license check ([c47df39](https://github.com/nrkno/tv-automation-mos-connection/commit/c47df39))

<a name="0.2.0"></a>

# [0.2.0](https://github.com/nrkno/tv-automation-mos-connection/compare/0.1.0...0.2.0) (2018-05-26)

### Bug Fixes

- Add build status badge and documentation ([f97c8aa](https://github.com/nrkno/tv-automation-mos-connection/commit/f97c8aa))
- add suggested documentation on how to force a release to go out to NPM ([a85bcfb](https://github.com/nrkno/tv-automation-mos-connection/commit/a85bcfb))
- remove duplicate release code? ([0b385f7](https://github.com/nrkno/tv-automation-mos-connection/commit/0b385f7))

### Features

- adding auto-generated docs ([934be79](https://github.com/nrkno/tv-automation-mos-connection/commit/934be79))
- Renaming to tv-automation-mos-connection ([e885ea5](https://github.com/nrkno/tv-automation-mos-connection/commit/e885ea5))

<a name="0.1.0"></a>

# 0.1.0 (2018-05-26)

### Bug Fixes

- **Clean:** Removes unsused connectionManager.ts ([57cafd1](https://github.com/superflytv/mos-connection/commit/57cafd1))
- **ConnectionCinfig:** removed ports, as they are defined in the MOS protocol ([6e08047](https://github.com/superflytv/mos-connection/commit/6e08047))
- **Interface:** Makes Scope optional in MosExternalMetaData ([47fe63f](https://github.com/superflytv/mos-connection/commit/47fe63f))
- **MosConnection:** Confform config object and socket client ([fb584e6](https://github.com/superflytv/mos-connection/commit/fb584e6))
- wrong key ([e8f94fd](https://github.com/superflytv/mos-connection/commit/e8f94fd))
- **MosConnection:** typo ([fa977d2](https://github.com/superflytv/mos-connection/commit/fa977d2))
- activate codecoverage ([1adcfe3](https://github.com/superflytv/mos-connection/commit/1adcfe3))
- Add editorconfig for easier development ([2e839fc](https://github.com/superflytv/mos-connection/commit/2e839fc))
- add editorconfig for yaml files ([9ede55d](https://github.com/superflytv/mos-connection/commit/9ede55d))
- Add github.com to known_hosts ([ea92e8a](https://github.com/superflytv/mos-connection/commit/ea92e8a))
- added test for index, for full code coverage status ([6e3136d](https://github.com/superflytv/mos-connection/commit/6e3136d))
- always convert MosStrings to strings ([1ff977a](https://github.com/superflytv/mos-connection/commit/1ff977a))
- Block ds_stores from mac ([0a92fa9](https://github.com/superflytv/mos-connection/commit/0a92fa9))
- change from build to dist ([5408756](https://github.com/superflytv/mos-connection/commit/5408756))
- check for elementStat.element ([fba4819](https://github.com/superflytv/mos-connection/commit/fba4819))
- clean up specs ([183fabc](https://github.com/superflytv/mos-connection/commit/183fabc))
- Corrects wrongly named specs, and fixes compile error ([9d8ba44](https://github.com/superflytv/mos-connection/commit/9d8ba44))
- create .ssh-dir if not exists ([7cd219a](https://github.com/superflytv/mos-connection/commit/7cd219a))
- explicitly set coverage on cov command ([a82e12f](https://github.com/superflytv/mos-connection/commit/a82e12f))
- fixed tests ([558872b](https://github.com/superflytv/mos-connection/commit/558872b))
- ignore test files in compile output ([53be8db](https://github.com/superflytv/mos-connection/commit/53be8db))
- **spec:** Fixes iconv-related decoding bug in Jest context ([e8c4c65](https://github.com/superflytv/mos-connection/commit/e8c4c65))
- Initial src restructure ([a7fb3f2](https://github.com/superflytv/mos-connection/commit/a7fb3f2))
- manual release workflow ([6504bfd](https://github.com/superflytv/mos-connection/commit/6504bfd))
- missing chars in testdata + missing MosString on roCreate ([6f007d8](https://github.com/superflytv/mos-connection/commit/6f007d8))
- mosString128 from multiple types ([999bf6f](https://github.com/superflytv/mos-connection/commit/999bf6f))
- move tests to correct class ([73e46ff](https://github.com/superflytv/mos-connection/commit/73e46ff))
- onDelete test. onDelete works now ([5fc929c](https://github.com/superflytv/mos-connection/commit/5fc929c))
- re-add known_hosts statement ([f5a6682](https://github.com/superflytv/mos-connection/commit/f5a6682))
- re-added wrongly deleted file. ([86e38cc](https://github.com/superflytv/mos-connection/commit/86e38cc))
- relative path fix ([45b783c](https://github.com/superflytv/mos-connection/commit/45b783c))
- remove a couple of ts-ignore causing doc-gen issues ([ed3f217](https://github.com/superflytv/mos-connection/commit/ed3f217))
- remove incorrect job dependency ([b8c81ba](https://github.com/superflytv/mos-connection/commit/b8c81ba))
- Remove node-6 tests ([dd58459](https://github.com/superflytv/mos-connection/commit/dd58459))
- rename xml2ID to xml2IDs ([c970466](https://github.com/superflytv/mos-connection/commit/c970466))
- Resolve script problems ([e79677a](https://github.com/superflytv/mos-connection/commit/e79677a))
- Resolve tslint errors ([b52e5ba](https://github.com/superflytv/mos-connection/commit/b52e5ba))
- Restructure tsconfig and tests ([924f414](https://github.com/superflytv/mos-connection/commit/924f414))
- set correct node version ([a1eaaac](https://github.com/superflytv/mos-connection/commit/a1eaaac))
- Set coverage requirement to 100% ([f9d4bb1](https://github.com/superflytv/mos-connection/commit/f9d4bb1))
- set push-enabled ssh key, remove known_host statement ([c0867bb](https://github.com/superflytv/mos-connection/commit/c0867bb))
- set skip ci message on chore release ([33ff2b2](https://github.com/superflytv/mos-connection/commit/33ff2b2))
- Sets Profile 0 as mandatory, todo: add profile dependency resolution ([2ce96e3](https://github.com/superflytv/mos-connection/commit/2ce96e3))
- split xml2story & bugfix ([3640841](https://github.com/superflytv/mos-connection/commit/3640841))
- test mockClear ([183f7f7](https://github.com/superflytv/mos-connection/commit/183f7f7))
- typo ([f001e32](https://github.com/superflytv/mos-connection/commit/f001e32))
- updated yarn.lock ([bd97cd9](https://github.com/superflytv/mos-connection/commit/bd97cd9))
- Use the same mosID as in testdata ([c7a6fb8](https://github.com/superflytv/mos-connection/commit/c7a6fb8))
- **MosMessage:** Fixes ncsID and mosTime time format ([894250a](https://github.com/superflytv/mos-connection/commit/894250a))
- **mosString128:** Changed "set" to "string" member. Refactored validation ([8ea405c](https://github.com/superflytv/mos-connection/commit/8ea405c))
- **MosTime:** Fixes bug with time-offset parsing ([e453d18](https://github.com/superflytv/mos-connection/commit/e453d18))
- **spec:** 100% MORE fixed bug than previously ([cef7811](https://github.com/superflytv/mos-connection/commit/cef7811))
- **spec:** Fixes mosTime spec with local timezone ([dac5a28](https://github.com/superflytv/mos-connection/commit/dac5a28))

### Features

- **ConnectionConfig:** Adds profile validation for compliancy in profile combinations ([7bf7107](https://github.com/superflytv/mos-connection/commit/7bf7107))
- MosDevice onConnectionChange + getConnectionStatus ([3ddb270](https://github.com/superflytv/mos-connection/commit/3ddb270))
- **heatBeat:** Implemented heartbeat interface ([f280217](https://github.com/superflytv/mos-connection/commit/f280217))
- add ci and validate jobs ([6b4bb02](https://github.com/superflytv/mos-connection/commit/6b4bb02))
- add manual NPM deploy step ([1751712](https://github.com/superflytv/mos-connection/commit/1751712))
- Add vscode laucnh config for jest ([6a2f55f](https://github.com/superflytv/mos-connection/commit/6a2f55f))
- added basic MosConnection test ([97e2c4e](https://github.com/superflytv/mos-connection/commit/97e2c4e))
- added exclude mock-folder rule ([3fa4834](https://github.com/superflytv/mos-connection/commit/3fa4834))
- added export ([a0694f9](https://github.com/superflytv/mos-connection/commit/a0694f9))
- added interface for profile0 ([d585fbf](https://github.com/superflytv/mos-connection/commit/d585fbf))
- added mock for net.Socket ([5510e34](https://github.com/superflytv/mos-connection/commit/5510e34))
- added socket server mock and prepared for testing ([5e7c880](https://github.com/superflytv/mos-connection/commit/5e7c880))
- added test for messageId ([143dd13](https://github.com/superflytv/mos-connection/commit/143dd13))
- basic circleci integration ([f4c7da4](https://github.com/superflytv/mos-connection/commit/f4c7da4))
- dispose of NCSServerConnection + store callbacks on MosDevice ([3f9fb3b](https://github.com/superflytv/mos-connection/commit/3f9fb3b))
- getRunningOrder ([d4ebee6](https://github.com/superflytv/mos-connection/commit/d4ebee6))
- Implement mosAck ([3750e7e](https://github.com/superflytv/mos-connection/commit/3750e7e))
- implemented roRequestRunningorder ([7fb1945](https://github.com/superflytv/mos-connection/commit/7fb1945))
- insert item ([f52e55d](https://github.com/superflytv/mos-connection/commit/f52e55d))
- minor changes to data api, after closer look at the protocol ([91c0358](https://github.com/superflytv/mos-connection/commit/91c0358))
- new way of handling mosDevices ([4fabf15](https://github.com/superflytv/mos-connection/commit/4fabf15))
- onItemStatus ([f9039b2](https://github.com/superflytv/mos-connection/commit/f9039b2))
- onReplaceRunningOrder ([534db1d](https://github.com/superflytv/mos-connection/commit/534db1d))
- onROMoveItems ([0060204](https://github.com/superflytv/mos-connection/commit/0060204))
- onROMoveStories ([b0bae0f](https://github.com/superflytv/mos-connection/commit/b0bae0f))
- onROSwapItems ([3cb3818](https://github.com/superflytv/mos-connection/commit/3cb3818))
- onROSwapStories ([b20dcc1](https://github.com/superflytv/mos-connection/commit/b20dcc1))
- onRunningOrderStatus ([67a8bf8](https://github.com/superflytv/mos-connection/commit/67a8bf8))
- onStoryStatus ([20613aa](https://github.com/superflytv/mos-connection/commit/20613aa))
- parameter for messageID in MosMessage.prepare() ([c0a51c4](https://github.com/superflytv/mos-connection/commit/c0a51c4))
- replace stories & items ([f40f4d3](https://github.com/superflytv/mos-connection/commit/f40f4d3))
- roCreate ([8b8c477](https://github.com/superflytv/mos-connection/commit/8b8c477))
- roDelete ([8246bcb](https://github.com/superflytv/mos-connection/commit/8246bcb))
- roElementAction DELETE ([fcb0ef3](https://github.com/superflytv/mos-connection/commit/fcb0ef3))
- roMetadataReplace + metadata in testdata ([d58dad4](https://github.com/superflytv/mos-connection/commit/d58dad4))
- roStorySend ([4adfd4f](https://github.com/superflytv/mos-connection/commit/4adfd4f))
- Send heartbeats ([1889dd7](https://github.com/superflytv/mos-connection/commit/1889dd7))
- Started on support for multiple mosDevices ([46eefbf](https://github.com/superflytv/mos-connection/commit/46eefbf))
- store mosdevice + read chunks + parse xml ([1bee6c1](https://github.com/superflytv/mos-connection/commit/1bee6c1))
- **MosMessage:** Add Mos message structure and XML output ([3b213f5](https://github.com/superflytv/mos-connection/commit/3b213f5))
- stub for parser, WIP ([8b3497d](https://github.com/superflytv/mos-connection/commit/8b3497d))
- **Jest:** Adds spesific integratinTests that's excluded in normal unit testing ([824a02b](https://github.com/superflytv/mos-connection/commit/824a02b))
- **MosConnection:** Added buddy sockets ([6330775](https://github.com/superflytv/mos-connection/commit/6330775))
- **MosConnection:** Adds timeout logic for hearbeat triggering ([4d97f93](https://github.com/superflytv/mos-connection/commit/4d97f93))
- **MosConnection:** Implements actualt HeartBeat messages in heartbeat procedure ([2eae531](https://github.com/superflytv/mos-connection/commit/2eae531))
- **MosConnection:** Refactored connection organisation under Server/ServerPair (todo) structure. Lifetime management with registry handling and listeners. ([7e2c5df](https://github.com/superflytv/mos-connection/commit/7e2c5df))
- Update project structure ([1d88e62](https://github.com/superflytv/mos-connection/commit/1d88e62))
- **MosConnection:** Refactors MosConnection and re-implements profile support ([8d4c69a](https://github.com/superflytv/mos-connection/commit/8d4c69a))
- **mosSocketClient:**  rudimentary initial implementation of mosSocketClient ([21ca73c](https://github.com/superflytv/mos-connection/commit/21ca73c))
- **mosSocketServer:** rudimentary initial implementation of mosSocketServer ([af44c55](https://github.com/superflytv/mos-connection/commit/af44c55))
- **MosSocketServer:** Adds listener and dispose to socketserver ([7687eb6](https://github.com/superflytv/mos-connection/commit/7687eb6))
- **MosTime:** Adds support for Date-centric string formats and local time offsets. ([f771bbf](https://github.com/superflytv/mos-connection/commit/f771bbf))
- Very basic test-setup ([9bfa3b2](https://github.com/superflytv/mos-connection/commit/9bfa3b2))
