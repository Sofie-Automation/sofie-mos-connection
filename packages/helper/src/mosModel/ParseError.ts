/*
  Typical use case:
  function (xml) {
    try {
      // do something with xml.storyBody
    } catch (e) {
      throw ParseError.handleCaughtError('storyBody', e)
    }
  }

*/

export class ParseError extends Error {
	static handleCaughtError(basePath: string, e: unknown): ParseError {
		if (ParseError.isParseError(e)) {
			e.addBreadcrumb(basePath)
			return e
		} else if (e instanceof Error) {
			return ParseError.fromError(e, basePath)
		} else if (typeof e === 'string') {
			return new ParseError(basePath, e)
		} else {
			return new ParseError(basePath, `${e}`, (e as any).stack)
		}
	}
	static isParseError(e: unknown): e is ParseError {
		return e instanceof ParseError
	}
	static fromError(e: Error, path: string): ParseError {
		const pe = new ParseError(path, e.message, e.stack)
		pe.stack = e.stack
		return pe
	}

	static handleError<T>(func: () => T, path: string): T {
		try {
			return func()
		} catch (org) {
			throw this.handleCaughtError(path, org)
		}
	}

	public name = 'ParseError'

	public orgMessage: string
	public orgStack: string | undefined = undefined
	public breadcrumbs: string[] = []

	private constructor(path: string, message: string, stack?: string) {
		super('')

		this.orgMessage = message.replace(/^Error: /, '')
		this.message = '' // Updated in updateVars()
		this.orgStack = `${stack ?? new Error(message).stack}`.replace(/^Error: /, '')

		this.breadcrumbs.push(path)
		this.updateVars()
	}

	public addBreadcrumb(path: string): void {
		if (path && path !== this.breadcrumbs[0]) {
			this.breadcrumbs.unshift(path)
			this.updateVars()
		}
	}
	private updateVars() {
		this.message = `ParseError: ${this.breadcrumbs.join('.')}: ${this.orgMessage}`
		this.stack = `ParseError: ${this.breadcrumbs.join('.')}: ${this.orgStack}`
	}

	toString(): string {
		return this.message
	}
}
