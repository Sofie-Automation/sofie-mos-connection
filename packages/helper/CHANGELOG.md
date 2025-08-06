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


### Bug Fixes

* add helper functions for dealing with AnyXmlValue and export them ([e4a5f48](https://github.com/nrkno/sofie-mos-connection/commit/e4a5f482efb1bd07ce0a9f07d1bdfd9a1ed8063d))





# [4.2.0](https://github.com/nrkno/sofie-mos-connection/compare/v4.1.0...v4.2.0) (2024-12-05)


### Bug Fixes

* parse incoming data as strings (Big Refactor) ([0f0f8d3](https://github.com/nrkno/sofie-mos-connection/commit/0f0f8d3986b3fe80153971d271742cc46c0301d1))





# [4.2.0-alpha.1](https://github.com/nrkno/sofie-mos-connection/compare/v4.1.1...v4.2.0-alpha.1) (2024-08-27)



# [4.2.0-alpha.0](https://github.com/nrkno/sofie-mos-connection/compare/v4.1.0...v4.2.0-alpha.0) (2024-07-05)


### Bug Fixes

* parse incoming data as strings (Big Refactor) ([0f0f8d3](https://github.com/nrkno/sofie-mos-connection/commit/0f0f8d3986b3fe80153971d271742cc46c0301d1))





## [4.1.1](https://github.com/nrkno/sofie-mos-connection/compare/v4.1.0...v4.1.1) (2024-08-20)

**Note:** Version bump only for package @mos-connection/helper





# [4.1.0](https://github.com/nrkno/sofie-mos-connection/compare/v4.0.0...v4.1.0) (2024-04-02)


### Bug Fixes

* optional on xmlSupportedProfiles as OpemMedia has this undefined ([b0ed480](https://github.com/nrkno/sofie-mos-connection/commit/b0ed48051134c39f105ed15e5c660d2c9819d4ef))





# [4.0.0](https://github.com/nrkno/sofie-mos-connection/compare/v3.0.7...v4.0.0) (2024-02-02)

### Bug Fixes

- better handling of non-spec errors. ([4b1f97c](https://github.com/nrkno/sofie-mos-connection/commit/4b1f97cf4112f465c353b482b35201fcaef9864e))
- change how data fields is parsed, better handling of missing data. ([bf4a084](https://github.com/nrkno/sofie-mos-connection/commit/bf4a0845a7f836015aa452db45c023debef94480))
- revert mosTime support of empty string. ([cfc036f](https://github.com/nrkno/sofie-mos-connection/commit/cfc036f5c2604ae193bc2d683e02ad2a9d6bb477))

## [3.0.7](https://github.com/nrkno/sofie-mos-connection/compare/v3.0.6...v3.0.7) (2023-12-27)

**Note:** Version bump only for package @mos-connection/helper

## [3.0.5](https://github.com/nrkno/sofie-mos-connection/compare/v3.0.4...3.0.5) (2023-12-18)

### Bug Fixes

- better handling of single xml elements ([f96ea1a](https://github.com/nrkno/sofie-mos-connection/commit/f96ea1a61cef385435d1088acc46cd1e25c5c4bf))
- case roStorySend one storyItem ([77dfff5](https://github.com/nrkno/sofie-mos-connection/commit/77dfff5c36c2dd7d42efa0932a561b800af636a4))

## [3.0.4](https://github.com/nrkno/sofie-mos-connection/compare/v3.0.1...v3.0.4) (2023-06-09)

### Bug Fixes

- minor improvement to RoAck ([7cb0bb6](https://github.com/nrkno/sofie-mos-connection/commit/7cb0bb68be07507a86a20615b3d0b751430e79f9))

## [3.0.2](https://github.com/nrkno/sofie-mos-connection/compare/v3.0.1...v3.0.2) (2023-03-27)

### Bug Fixes

- minor improvement to RoAck ([7cb0bb6](https://github.com/nrkno/sofie-mos-connection/commit/7cb0bb68be07507a86a20615b3d0b751430e79f9))

# [3.0.0](https://github.com/nrkno/sofie-mos-connection/compare/v3.0.0-alpha.3...v3.0.0) (2023-02-03)

**Note:** Version bump only for package @mos-connection/helper

# [3.0.0-alpha.3](https://github.com/nrkno/sofie-mos-connection/compare/v3.0.0-alpha.2...v3.0.0-alpha.3) (2023-01-27)

**Note:** Version bump only for package @mos-connection/helper

# [3.0.0-alpha.2](https://github.com/nrkno/sofie-mos-connection/compare/v3.0.0-alpha.0...v3.0.0-alpha.2) (2023-01-27)

### Bug Fixes

- add stringifyMosObject, an utility-function used to convert objects containing IMOSString128 etc to strings ([f3806ab](https://github.com/nrkno/sofie-mos-connection/commit/f3806ab4e72a02b450e91ab19fbbfca34c605caa))

# [3.0.0-alpha.1](https://github.com/nrkno/sofie-mos-connection/compare/v3.0.0-alpha.0...3.0.0-alpha.1) (2023-01-27)

### Bug Fixes

- add stringifyMosObject, an utility-function used to convert objects containing IMOSString128 etc to strings ([f3806ab](https://github.com/nrkno/sofie-mos-connection/commit/f3806ab4e72a02b450e91ab19fbbfca34c605caa))

# [v3.0.0-alpha.0](https://github.com/nrkno/sofie-mos-connection/compare/2.0.1...v3.0.0-alpha.0) (2022-12-09)

### Features

- move helper functions into a separate package: $mos-connection/helper ([ecb51ec](https://github.com/nrkno/sofie-mos-connection/commit/ecb51ec3ca26c15a61fd629e59265345c247f82e))
