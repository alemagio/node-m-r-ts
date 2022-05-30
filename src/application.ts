
import { promisify } from 'util'
import { v1 as uuid } from 'uuid'

import { bootstrap } from './bootstrapper'

const { reportDatabase, eventStore, commandHandlers } = bootstrap()

const sleep = promisify(setTimeout)
const inventoryItemId = uuid()

;(async function step01() {
	console.log('======================================================')
	console.log('Run the CreateInventoryItem command handler')
	console.log('======================================================')

	const command = {
		inventoryItemId: inventoryItemId,
		name: 'Something'
	}

	try {
		await commandHandlers.createInventoryItem(command)
		printCurrentStateOfTheApplication()
		await sleep(5000)
		await step02()
	} catch (error) {
		console.error(error)
	}
})()

async function step02() {
	console.log('======================================================')
	console.log('Run the RenameInventoryItem command handler')
	console.log('======================================================')

	const command = {
		inventoryItemId: inventoryItemId,
		name: 'Something entirely different'
	}

	try {
		await commandHandlers.renameInventoryItem(command)
		printCurrentStateOfTheApplication()
		await sleep(5000)
		await step03()
	} catch (error) {
		console.error(error)
	}
}

async function step03() {
	console.log('======================================================')
	console.log('Run the CheckoutItemsFromInventory command handler')
	console.log('======================================================')

	const command = {
		inventoryItemId: inventoryItemId,
		numberOfItems: 7
	}

	try {
		await commandHandlers.checkOutItemsFromInventory(command)
		printCurrentStateOfTheApplication()
		await sleep(5000)
		await step04()
	} catch (error) {
		console.error(error)
	}
}

async function step04() {
	console.log('======================================================')
	console.log('Run the DeactivateInventoryItem command handler')
	console.log('======================================================')

	const command = {
		inventoryItemId: inventoryItemId
	}

	try {
		await commandHandlers.deactivateInventoryItem(command)
		printCurrentStateOfTheApplication()
	} catch (error) {
		console.error(error)
	}
}

function printCurrentStateOfTheApplication() {
	printEventStoreContent()

	// Give the report database some time to catch up
	setTimeout(function() {
		printReportDatabaseContent()
	}, 2000)
}

function printEventStoreContent() {
	console.log('******************************************************')
	console.log('Event store')
	console.log('******************************************************')
	eventStore.createDump().forEach(function(document) { console.log(document.events) })
}

function printReportDatabaseContent() {
	console.log('******************************************************')
	console.log('Report database')
	console.log('******************************************************')
	console.log(reportDatabase.createDump())
}