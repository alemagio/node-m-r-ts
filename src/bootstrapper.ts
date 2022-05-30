import { InventoryReportAggregator, InventoryDetailsReportAggregator } from './reportAggregators'
import	{ MessageBus } from './messageBus'
import { ReportDatabase } from './reportDatabase';
import { EventStore } from './eventStore';
import { createCommandHandlers } from './commandHandlers';
import { InventoryItemRepository } from './inventoryItem';

export const bootstrap = function() {
	const messageBus = new MessageBus()
	const reportDatabase = new ReportDatabase()
	const eventStore = new EventStore()
	const repository = new InventoryItemRepository(eventStore, messageBus)

	const inventoryReportAggregator = new InventoryReportAggregator(reportDatabase)
	messageBus.registerEventHandler(inventoryReportAggregator)

	const inventoryDetailsReportAggregator = new InventoryDetailsReportAggregator(reportDatabase)
	messageBus.registerEventHandler(inventoryDetailsReportAggregator)

	return {
		reportDatabase,
		eventStore,
		commandHandlers: createCommandHandlers(repository)
	}
};