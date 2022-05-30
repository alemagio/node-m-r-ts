import { InventoryItemRepository, create as createInventoryItem } from './inventoryItem'

const DEFAULT_NUMBER_OF_ITEMS_IN_INVENTORY = 15;

export const createCommandHandlers = (repository: InventoryItemRepository) => ({
	async createInventoryItem (command) {
		const inventoryItem = createInventoryItem(command.inventoryItemId, command.name);
		inventoryItem.checkIn(DEFAULT_NUMBER_OF_ITEMS_IN_INVENTORY);

		return repository.save(inventoryItem);
	},

	async renameInventoryItem (command) {
		const inventoryItem = await repository.get(command.inventoryItemId)

		if (!inventoryItem) {
			return;
		}

		inventoryItem.rename(command.name)
		return repository.save(inventoryItem)
	},

	async checkInItemsInToInventory (command) {
		const inventoryItem = await repository.get(command.inventoryItemId)
		if (!inventoryItem) {
			return;
		}

		inventoryItem.checkIn(command.numberOfItems)
		return repository.save(inventoryItem)
	},

	async checkOutItemsFromInventory (command) {
		const inventoryItem = await repository.get(command.inventoryItemId)

		if (!inventoryItem) {
			return;
		}

		inventoryItem.checkOut(command.numberOfItems);

		return repository.save(inventoryItem);
	},

	async deactivateInventoryItem (command) {
		const inventoryItem = await repository.get(command.inventoryItemId)
		if (!inventoryItem) {
			return;
		}

		inventoryItem.deactivate();

		return repository.save(inventoryItem);
	}
})
