import { Writable } from "stream";

export class MessageBus {
	private eventHandlers: Writable[] = []

	registerEventHandler (eventHandler) {
		this.eventHandlers.push(eventHandler);
	}

	publish (domainEvent) {
		for (const eventHandler of this.eventHandlers) {
			process.nextTick(() => {
				eventHandler.write(domainEvent);
			})
		}
	}
}
