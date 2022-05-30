export class InvalidOperationError extends Error {
	constructor(message, error?: Error) {
		super()
		this.cause = error
		this.name = 'InvalidOperationError'
		Error.call(this, message)
		Error.captureStackTrace(this)
	}
}

export class ConcurrencyViolationError extends Error {
	constructor(message, error?: Error) {
		super()
		this.cause = error
		this.name = 'ConcurrencyViolationError'
		Error.call(this, message)
		Error.captureStackTrace(this)
	}
}

export class InvalidDataAreaError extends Error {
	constructor(message, error?: Error) {
		super()
		this.cause = error
		this.name = 'InvalidDataAreaError'
		Error.call(this, message)
		Error.captureStackTrace(this)
	}
}

export class ReportNotFoundError extends Error {
	constructor(message, error?: Error) {
		super()
		this.cause = error
		this.name = 'ReportNotFoundError'
		Error.call(this, message)
		Error.captureStackTrace(this)
	}
}
