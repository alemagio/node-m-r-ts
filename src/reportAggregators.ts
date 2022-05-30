import { Writable } from 'stream'
import { format } from 'util'

import { DataArea, ReportDatabase } from './reportDatabase'
import { ReportNotFoundError } from './errors'

export class ReportAggregator extends Writable {
	constructor (protected reportDatabase: ReportDatabase) {
		super({ objectMode: true })
		this.reportDatabase = reportDatabase
	}

	async _write (domainEvent, encoding, next) {
		var eventHandlerName = 'handle' + domainEvent.eventName
		var eventHandler = this[eventHandlerName] || this.dummyEventHandler

		await eventHandler.call(this, domainEvent)
		next()
	}

	dummyEventHandler (domainEvent) {
		return;
	}
}


export class InventoryReportAggregator extends ReportAggregator {

	async handleInventoryItemCreated (message) {
		var inventoryReport = {
			id: message.aggregateRootId,
			name: message.name
		}

		return this.reportDatabase.insertReport(DataArea.InventoryReports, inventoryReport)
	}

	async handleInventoryItemRenamed (message) {
		const inventoryReport = await this.reportDatabase.getReport(DataArea.InventoryReports, message.aggregateRootId)
		if (!inventoryReport) {
			throw reportNotFound(message.aggregateRootId)
		}
		inventoryReport.name = message.name
	}

	async handleInventoryItemDeactivated (message) {
		return this.reportDatabase.removeReport(DataArea.InventoryReports, message.aggregateRootId)
	}
}


export class InventoryDetailsReportAggregator extends ReportAggregator {
	async handleInventoryItemCreated (message) {
		var inventoryDetailsReport = {
			currentNumber: 0,
			id: message.aggregateRootId,
			name: message.name
		}

		return this.reportDatabase.insertReport(DataArea.InventoryReportsDetails, inventoryDetailsReport)
	}

	async handleInventoryItemRenamed (message) {
		const inventoryReport = await this.reportDatabase.getReport(DataArea.InventoryReportsDetails, message.aggregateRootId)
			if(!inventoryReport) {
				throw reportNotFound(message.aggregateRootId)
			}
			inventoryReport.name = message.name
	}

	async handleItemsCheckedInToInventory (message) {
		const inventoryReport = await this.reportDatabase.getReport(DataArea.InventoryReportsDetails, message.aggregateRootId)
		if(!inventoryReport) {
			throw reportNotFound(message.aggregateRootId)
		}
		inventoryReport.currentNumber += message.numberOfItems
	}

	async handleItemsCheckedOutFromInventory (message) {
		const inventoryReport = await this.reportDatabase.getReport(DataArea.InventoryReportsDetails, message.aggregateRootId)

		if(!inventoryReport) {
			throw reportNotFound(message.aggregateRootId)
		}

		inventoryReport.currentNumber -= message.numberOfItems
	}

	async handleInventoryItemDeactivated (message) {
		return this.reportDatabase.removeReport(DataArea.InventoryReportsDetails, message.aggregateRootId)
	}
}



//
// Helper functions
//
function reportNotFound (aggregateRootId) {
	const errorMessage = format('The report with identifier "%d" could not be found in the data store.', aggregateRootId)
	throw new ReportNotFoundError(errorMessage)
}
