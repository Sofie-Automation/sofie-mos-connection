# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.2.3](https://github.com/nrkno/sofie-mos-connection/compare/v4.2.2...v4.2.3) (2025-08-06)


### Bug Fixes

* handle empty mosID in acks ([#113](https://github.com/nrkno/sofie-mos-connection/issues/113)) ([8c5c199](https://github.com/nrkno/sofie-mos-connection/commit/8c5c1998bca37d006862af86d719fa6a4c39019f))





## [4.2.2](https://github.com/nrkno/sofie-mos-connection/compare/v4.2.2-alpha.0...v4.2.2) (2025-01-22)


### Bug Fixes

* ExternalMetadata.MosPayload wasn't passed through when containing string. Changed MosPayload to be AnyXMLValue instead of AnyXMLObject. ([d5cfec5](https://github.com/nrkno/sofie-mos-connection/commit/d5cfec50b3a1ccfeb60c4992f0e8ce50c4043bf1))





## [4.2.1-alpha.0](https://github.com/nrkno/sofie-mos-connection/compare/v4.2.0...v4.2.1-alpha.0) (2025-01-10)

**Note:** Version bump only for package @mos-connection/connector





# [4.2.0](https://github.com/nrkno/sofie-mos-connection/compare/v4.1.0...v4.2.0) (2024-12-05)


### Bug Fixes

* Disable heartbeat on primary if secondary is active in openMediaHotStandby mode. ([f550bd5](https://github.com/nrkno/sofie-mos-connection/commit/f550bd54cbd48cda0ab1becab011d4af5ff72658))
* failover to buddy when main not up to date ([8554f60](https://github.com/nrkno/sofie-mos-connection/commit/8554f6051c277be7d254bdcd9e3aa1b3ab801a10))
* hotStandby - set heartbeats state no matter secondary's state ([c2b35be](https://github.com/nrkno/sofie-mos-connection/commit/c2b35bec5db5c85ab91e97f09db2d33bb104589e))
* parse incoming data as strings (Big Refactor) ([0f0f8d3](https://github.com/nrkno/sofie-mos-connection/commit/0f0f8d3986b3fe80153971d271742cc46c0301d1))
* rename new test ([248a4f8](https://github.com/nrkno/sofie-mos-connection/commit/248a4f8e8e8bf550dde35e06ce86689298d57256))
* revert renaming to isHotStandby to avoid conflict with MOS-Gateway ([562d74b](https://github.com/nrkno/sofie-mos-connection/commit/562d74badae2a17feceddbe43b590390c7ac8015))


### Features

* Add tests for openMediaHotStandby ([5985b19](https://github.com/nrkno/sofie-mos-connection/commit/5985b191fcaea9d54d2bec73d4abf87b02f8bd26))
* Support for openMediaHotStandby disable heartbeat on secondary when not used ([ab04e49](https://github.com/nrkno/sofie-mos-connection/commit/ab04e4900f1a73324a0ff7de6363421ad579bf26))





# [4.2.0-alpha.1](https://github.com/nrkno/sofie-mos-connection/compare/v4.1.1...v4.2.0-alpha.1) (2024-08-27)



# [4.2.0-alpha.0](https://github.com/nrkno/sofie-mos-connection/compare/v4.1.0...v4.2.0-alpha.0) (2024-07-05)


### Bug Fixes

* parse incoming data as strings (Big Refactor) ([0f0f8d3](https://github.com/nrkno/sofie-mos-connection/commit/0f0f8d3986b3fe80153971d271742cc46c0301d1))





## [4.1.1](https://github.com/nrkno/sofie-mos-connection/compare/v4.1.0...v4.1.1) (2024-08-20)


### Bug Fixes

* failover to buddy when main not up to date ([8554f60](https://github.com/nrkno/sofie-mos-connection/commit/8554f6051c277be7d254bdcd9e3aa1b3ab801a10))





# [4.1.0](https://github.com/nrkno/sofie-mos-connection/compare/v4.0.0...v4.1.0) (2024-04-02)


### Bug Fixes

* add .snap file for open media test ([9bb6825](https://github.com/nrkno/sofie-mos-connection/commit/9bb6825cb2986d3ce3ac90a8c7ef2c7f3a6f5adc))
* lint fix and Porfile0-non-strict snapsot ([dfbc4c1](https://github.com/nrkno/sofie-mos-connection/commit/dfbc4c1fccf66b717aec16ea033b81e28a68455e))


### Features

* add access to stric t value un mosSocketClient ([c85b837](https://github.com/nrkno/sofie-mos-connection/commit/c85b837cbfb0b7b7367f9ca0bf402e70d181930e))
* add test for opem media ([18362f7](https://github.com/nrkno/sofie-mos-connection/commit/18362f74f2362eac650bddd257e3d2ef391f6c5d))
* new function _getMessageId to manage when no messageId ([19f8231](https://github.com/nrkno/sofie-mos-connection/commit/19f82311252c9b5e8c1a0ba8b901438c42e3c9d3))





# [4.0.0](https://github.com/nrkno/sofie-mos-connection/compare/v3.0.7...v4.0.0) (2024-02-02)

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

- better handling of non-spec errors. ([4b1f97c](https://github.com/nrkno/sofie-mos-connection/commit/4b1f97cf4112f465c353b482b35201fcaef9864e))
- change how data fields is parsed, better handling of missing data. ([bf4a084](https://github.com/nrkno/sofie-mos-connection/commit/bf4a0845a7f836015aa452db45c023debef94480))
- connectionStatus now returns textual status, not just empty strings, addressing [#93](https://github.com/nrkno/sofie-mos-connection/issues/93) ([23d9b16](https://github.com/nrkno/sofie-mos-connection/commit/23d9b161d597223ed750a61dc7d87bacec4def51))
- revert mosTime support of empty string. ([cfc036f](https://github.com/nrkno/sofie-mos-connection/commit/cfc036f5c2604ae193bc2d683e02ad2a9d6bb477))
- roStoryMove: off-spec support of single storyID tag ([58ff304](https://github.com/nrkno/sofie-mos-connection/commit/58ff30429976655b30596181041449b3e8060ff9))
- roStoryMoveMultiple: handle edge case of single storyID ([4684116](https://github.com/nrkno/sofie-mos-connection/commit/46841160704e11e6ac00bcdee0e3bbf828c54393))

### Features

- support for receiving Profile 1 <mosObj> and <mosListAll> messages. ([786710a](https://github.com/nrkno/sofie-mos-connection/commit/786710ad1d71015b76dc7e01cdc7a286a02c96a4))

## [3.0.7](https://github.com/nrkno/sofie-mos-connection/compare/v3.0.6...v3.0.7) (2023-12-27)

### Bug Fixes

- Add support for receiving roStoryX, roStoryY messages. ([a4c110e](https://github.com/nrkno/sofie-mos-connection/commit/a4c110e229134d11f1d7a755086d68b002281264))

## [3.0.5](https://github.com/nrkno/sofie-mos-connection/compare/v3.0.4...3.0.5) (2023-12-18)

### Bug Fixes

- better handling of incoming data chunks. Deals with multiple <mos> and </mos> tags. ([59cacb2](https://github.com/nrkno/sofie-mos-connection/commit/59cacb21c178ea14c7ad4c8771198e6ec656459c))
- better handling of single xml elements ([f96ea1a](https://github.com/nrkno/sofie-mos-connection/commit/f96ea1a61cef385435d1088acc46cd1e25c5c4bf))
- handle replies to roReq ([c100b4d](https://github.com/nrkno/sofie-mos-connection/commit/c100b4d017f21d45529c0c912754808f8a0431bc))

## [3.0.4](https://github.com/nrkno/sofie-mos-connection/compare/v3.0.1...v3.0.4) (2023-06-09)

### Bug Fixes

- handover logic should leave heartbearts ([d8ccca0](https://github.com/nrkno/sofie-mos-connection/commit/d8ccca0af14e5d3d3574fec4284b4df91336803d))

## [3.0.3](https://github.com/nrkno/sofie-mos-connection/compare/v3.0.2...v3.0.3) (2023-06-09)

### Bug Fixes

- handover logic should leave heartbearts ([d8ccca0](https://github.com/nrkno/sofie-mos-connection/commit/d8ccca0af14e5d3d3574fec4284b4df91336803d))

## [3.0.2](https://github.com/nrkno/sofie-mos-connection/compare/v3.0.1...v3.0.2) (2023-03-27)

**Note:** Version bump only for package @mos-connection/connector

# [3.0.0](https://github.com/nrkno/sofie-mos-connection/compare/v3.0.0-alpha.3...v3.0.0) (2023-02-03)

**Note:** Version bump only for package @mos-connection/connector

# [3.0.0-alpha.3](https://github.com/nrkno/sofie-mos-connection/compare/v3.0.0-alpha.2...v3.0.0-alpha.3) (2023-01-27)

**Note:** Version bump only for package @mos-connection/connector

# [3.0.0-alpha.2](https://github.com/nrkno/sofie-mos-connection/compare/v3.0.0-alpha.0...v3.0.0-alpha.2) (2023-01-27)

**Note:** Version bump only for package @mos-connection/connector

# [3.0.0-alpha.1](https://github.com/nrkno/sofie-mos-connection/compare/v3.0.0-alpha.0...3.0.0-alpha.1) (2023-01-27)

**Note:** Version bump only for package @mos-connection/connector

# [v3.0.0-alpha.0](https://github.com/nrkno/sofie-mos-connection/compare/2.0.1...v3.0.0-alpha.0) (2022-12-09)

### Bug Fixes

- better cleanup on dispose ([a241d78](https://github.com/nrkno/sofie-mos-connection/commit/a241d78e0dd0b4f8a24fb17964ea45b791afca6f))

### Features

- move helper functions into a separate package: $mos-connection/helper ([ecb51ec](https://github.com/nrkno/sofie-mos-connection/commit/ecb51ec3ca26c15a61fd629e59265345c247f82e))
- move types and enums to @mos-connection/model ([2266488](https://github.com/nrkno/sofie-mos-connection/commit/2266488f4062da6a1f2949a3374c58c26a20d79e))
