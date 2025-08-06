# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.2.3](https://github.com/nrkno/sofie-mos-connection/compare/v4.2.2...v4.2.3) (2025-08-06)

**Note:** Version bump only for package @mos-connection/model





## [4.2.2](https://github.com/nrkno/sofie-mos-connection/compare/v4.2.2-alpha.0...v4.2.2) (2025-01-22)


### Bug Fixes

* ExternalMetadata.MosPayload wasn't passed through when containing string. Changed MosPayload to be AnyXMLValue instead of AnyXMLObject. ([d5cfec5](https://github.com/nrkno/sofie-mos-connection/commit/d5cfec50b3a1ccfeb60c4992f0e8ce50c4043bf1))





## [4.2.1-alpha.0](https://github.com/nrkno/sofie-mos-connection/compare/v4.2.0...v4.2.1-alpha.0) (2025-01-10)


### Bug Fixes

* add helper functions for dealing with AnyXmlValue and export them ([e4a5f48](https://github.com/nrkno/sofie-mos-connection/commit/e4a5f482efb1bd07ce0a9f07d1bdfd9a1ed8063d))





# [4.2.0](https://github.com/nrkno/sofie-mos-connection/compare/v4.1.0...v4.2.0) (2024-12-05)


### Bug Fixes

* parse incoming data as strings (Big Refactor) ([0f0f8d3](https://github.com/nrkno/sofie-mos-connection/commit/0f0f8d3986b3fe80153971d271742cc46c0301d1))
* update typings for mosTime, undefined was allowed in types, but not in code. ([fb2369a](https://github.com/nrkno/sofie-mos-connection/commit/fb2369abb3a876675c7e941092f96460e2da45f8))





# [4.2.0-alpha.1](https://github.com/nrkno/sofie-mos-connection/compare/v4.1.1...v4.2.0-alpha.1) (2024-08-27)



# [4.2.0-alpha.0](https://github.com/nrkno/sofie-mos-connection/compare/v4.1.0...v4.2.0-alpha.0) (2024-07-05)


### Bug Fixes

* parse incoming data as strings (Big Refactor) ([0f0f8d3](https://github.com/nrkno/sofie-mos-connection/commit/0f0f8d3986b3fe80153971d271742cc46c0301d1))





## [4.1.1](https://github.com/nrkno/sofie-mos-connection/compare/v4.1.0...v4.1.1) (2024-08-20)


### Bug Fixes

* update typings for mosTime, undefined was allowed in types, but not in code. ([fb2369a](https://github.com/nrkno/sofie-mos-connection/commit/fb2369abb3a876675c7e941092f96460e2da45f8))





# [4.1.0](https://github.com/nrkno/sofie-mos-connection/compare/v4.0.0...v4.1.0) (2024-04-02)


### Bug Fixes

* add 'N/A' to supported profiles ([c56007a](https://github.com/nrkno/sofie-mos-connection/commit/c56007a161b034ebe411b9848fa079f684bc9d51))
* OpenMedia returns an empty object {} as time, will be set as current time instead. ([7a2531a](https://github.com/nrkno/sofie-mos-connection/commit/7a2531afd711f1d62d3bb121592b6f6194c42a91))





# [4.0.0](https://github.com/nrkno/sofie-mos-connection/compare/v3.0.7...v4.0.0) (2024-02-02)

### Bug Fixes

- change how data fields is parsed, better handling of missing data. ([bf4a084](https://github.com/nrkno/sofie-mos-connection/commit/bf4a0845a7f836015aa452db45c023debef94480))
- revert mosTime support of empty string. ([cfc036f](https://github.com/nrkno/sofie-mos-connection/commit/cfc036f5c2604ae193bc2d683e02ad2a9d6bb477))

## [3.0.7](https://github.com/nrkno/sofie-mos-connection/compare/v3.0.6...v3.0.7) (2023-12-27)

**Note:** Version bump only for package @mos-connection/model

## [3.0.5](https://github.com/nrkno/sofie-mos-connection/compare/v3.0.4...3.0.5) (2023-12-18)

### Bug Fixes

- Handle empty MOS time string ([85fbc88](https://github.com/nrkno/sofie-mos-connection/commit/85fbc886d7b577db07bece23efc53f6058a92a43))

## [3.0.4](https://github.com/nrkno/sofie-mos-connection/compare/v3.0.1...v3.0.4) (2023-06-09)

**Note:** Version bump only for package @mos-connection/model

## [3.0.2](https://github.com/nrkno/sofie-mos-connection/compare/v3.0.1...v3.0.2) (2023-03-27)

**Note:** Version bump only for package @mos-connection/model

# [3.0.0](https://github.com/nrkno/sofie-mos-connection/compare/v3.0.0-alpha.3...v3.0.0) (2023-02-03)

**Note:** Version bump only for package @mos-connection/model

# [3.0.0-alpha.3](https://github.com/nrkno/sofie-mos-connection/compare/v3.0.0-alpha.2...v3.0.0-alpha.3) (2023-01-27)

**Note:** Version bump only for package @mos-connection/model

# [3.0.0-alpha.2](https://github.com/nrkno/sofie-mos-connection/compare/v3.0.0-alpha.0...v3.0.0-alpha.2) (2023-01-27)

### Bug Fixes

- add stringifyMosObject, an utility-function used to convert objects containing IMOSString128 etc to strings ([f3806ab](https://github.com/nrkno/sofie-mos-connection/commit/f3806ab4e72a02b450e91ab19fbbfca34c605caa))

# [3.0.0-alpha.1](https://github.com/nrkno/sofie-mos-connection/compare/v3.0.0-alpha.0...3.0.0-alpha.1) (2023-01-27)

### Bug Fixes

- add stringifyMosObject, an utility-function used to convert objects containing IMOSString128 etc to strings ([f3806ab](https://github.com/nrkno/sofie-mos-connection/commit/f3806ab4e72a02b450e91ab19fbbfca34c605caa))

# [v3.0.0-alpha.0](https://github.com/nrkno/sofie-mos-connection/compare/2.0.1...v3.0.0-alpha.0) (2022-12-09)

### Features

- move helper functions into a separate package: $mos-connection/helper ([ecb51ec](https://github.com/nrkno/sofie-mos-connection/commit/ecb51ec3ca26c15a61fd629e59265345c247f82e))
- move types and enums to @mos-connection/model ([2266488](https://github.com/nrkno/sofie-mos-connection/commit/2266488f4062da6a1f2949a3374c58c26a20d79e))
