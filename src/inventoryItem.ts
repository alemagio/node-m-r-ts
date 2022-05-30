import { format } from 'util'
import { once } from 'events'

import { EventStore } from "./eventStore";
import { MessageBus } from "./messageBus";
import { AggregateRoot } from './aggregateRoot'
import { InvalidOperationError } from './errors';

export const create = function create(id, name) {
	return new InventoryItem(id, name);
};

//
// InventoryItem
//
export class InventoryItem extends AggregateRoot {
	private activated: boolean
	private name: string
	private number: number

	constructor(id: string, name?: string) {
		super(id)
		this.activated = true;
		this.name = '';
		this.number = 0;

		this.subscribeToDomainEvents()

		if(name) {
			this.apply('InventoryItemCreated', {
				name: name
			})
		}
	}

	checkIn (numberOfItems) {
		this.apply('ItemsCheckedInToInventory', {
			numberOfItems: numberOfItems
		})
	}

	checkOut (numberOfItems) {
		if((this.number - numberOfItems) < 0) {
			const errorMessage = format('The inventory needs to replenished in order to checkout %d items.', numberOfItems);
			throw new InvalidOperationError(errorMessage);
		}

		this.apply('ItemsCheckedOutFromInventory', {
			numberOfItems: numberOfItems
		})
	};

	deactivate() {
		if(!this.activated)
			throw new InvalidOperationError('This inventory item has already been deactivated.');

		this.apply('InventoryItemDeactivated', {});
	};

	rename (name) {
		this.apply('InventoryItemRenamed', {
			name: name
		});
	};

	subscribeToDomainEvents () {
		this.onEvent('InventoryItemCreated', (inventoryItemCreated) => {
			this.activated = true;
			this.name = inventoryItemCreated.name;
		});

		this.onEvent('InventoryItemRenamed', (inventoryItemRenamed) => {
			this.name = inventoryItemRenamed.name;
		});

		this.onEvent('ItemsCheckedInToInventory', (itemsCheckedInToInventory) => {
			this.number += itemsCheckedInToInventory.numberOfItems;
		});

		this.onEvent('ItemsCheckedOutFromInventory', (itemsCheckedOutFromInventory) => {
			this.number -= itemsCheckedOutFromInventory.numberOfItems;
		});

		this.onEvent('InventoryItemDeactivated', () => {
			this.activated = false;
		});
	}
}


export class InventoryItemRepository {
	constructor (private eventStore: EventStore, private messageBus: MessageBus) {
		this.eventStore = eventStore
		this.messageBus = messageBus
	}

	async save (inventoryItem: InventoryItem) {
		const transientEvents = inventoryItem.getTransientEvents();

		await this.eventStore.save(transientEvents, inventoryItem.getId(), inventoryItem.getVersion())
		for (const event of transientEvents) {
			this.messageBus.publish(event)
		}
	}

	async get (inventoryItemId: string) {
		const eventStream = await this.eventStore.getAllEventsFor(inventoryItemId)
		if(!eventStream) {
			return null
		}

		const inventoryItem = new InventoryItem(inventoryItemId);

		await once(eventStream.pipe(inventoryItem), 'finish')
		eventStream.unpipe();

		return inventoryItem
	}
}
