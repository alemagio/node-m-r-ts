import EventEmitter from "events"
import { Writable } from "stream"
import { v1 as uuid } from 'uuid'

export class AggregateRoot extends Writable {
	private id: string
	private version: number
	private eventVersion: number
	private transientEvents: unknown[]
	private eventEmitter: EventEmitter

	constructor (id) {
		super({ objectMode: true })
		this.id = id
		this.version = this.eventVersion = 0
		this.transientEvents = []
		this.eventEmitter = new EventEmitter()
	}

	apply (eventName, domainEvent) {
		this.eventVersion += 1
		this.enhanceDomainEvent(this, eventName, this.eventVersion, domainEvent)

		this.transientEvents.push(domainEvent)
		this.eventEmitter.emit(eventName, domainEvent)
	}

	getTransientEvents () {
		return this.transientEvents
	}

	getId () {
		return this.id
	}

	getVersion () {
		return this.version
	}

	onEvent (type, listener) {
		return this.eventEmitter.on(type, listener)
	}

	_write (domainEvent, encoding, next) {
		this.eventEmitter.emit(domainEvent.eventName, domainEvent)

		this.eventVersion += 1
		this.version += 1
		next()
	}

	enhanceDomainEvent(aggregateRoot, eventName, eventVersion, domainEvent) {
		domainEvent.aggregateRootId = aggregateRoot.id
		domainEvent.eventId = uuid()
		domainEvent.eventName = eventName
		domainEvent.eventVersion = eventVersion
	}
}
