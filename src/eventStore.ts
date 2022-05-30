import { PassThrough } from 'stream'

import { simulateAsynchronousIO } from './lib/example-utils/simulate-async-io';

import { ConcurrencyViolationError } from './errors'

interface Document {
	id: string
	events: { eventVersion: number }[]
}

export class EventStore {
	private store: Document[] = [];

	createDump() {
		return this.store;
	};

	async getAllEventsFor(aggregateRootId: string) {
		const storedDocument = await this.findStoredDomainEvents(aggregateRootId)

		const eventStream = new PassThrough({ objectMode: true });

		for (const domainEvent of storedDocument.events) {
			console.log({domainEvent})
			eventStream.write(domainEvent);
		}

		eventStream.end();

		return eventStream
	}

	async save (domainEvents, aggregateRootId, expectedAggregateRootVersion) {
		let storedDocument = await this.findStoredDomainEvents(aggregateRootId)

		if(!storedDocument) {
			storedDocument = {
				id: aggregateRootId,
				events: domainEvents
			};

			this.store.push(storedDocument);
			return
		}

		if(storedDocument.events[storedDocument.events.length - 1].eventVersion !== expectedAggregateRootVersion) {
			throw new ConcurrencyViolationError('An operation has been performed on an aggregate root that is out of date.')
		}

		for (const domainEvent of domainEvents) {
			storedDocument.events.push(domainEvent);
		}
	}

	async findStoredDomainEvents(aggregateRootId: string) {
		return simulateAsynchronousIO<Document>(() => {
			return this.store.find((document) => document.id === aggregateRootId)
		});
	}
}
