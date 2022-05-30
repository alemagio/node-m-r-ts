import { simulateAsynchronousIO } from "./lib/example-utils/simulate-async-io";
import { InvalidDataAreaError } from './errors'

interface InventoryReport {
	id: string
	name: string
	currentNumber: number
}
interface InventoryDetailsReport {
	id: string
	name: string
	currentNumber: number
}

export enum DataArea {
	InventoryReports = 'InventoryReports',
	InventoryReportsDetails = 'InventoryReportsDetails'
}

export class ReportDatabase {
	private dataAreas: {
		[DataArea.InventoryReports]: InventoryReport[]
		[DataArea.InventoryReportsDetails]: InventoryDetailsReport[]
	} = {
		[DataArea.InventoryReports]: [],
		[DataArea.InventoryReportsDetails]: []
	}

	createDump() {
		return this.dataAreas;
	};

	async getReport (dataArea, id) {
		return simulateAsynchronousIO<InventoryReport | InventoryDetailsReport>(() => {
			const reportsCollection = this.getReportsCollectionFor(dataArea)
			return reportsCollection.find(report => report.id === id)
		})
	}

	async insertReport (dataArea, inventoryReport) {
		return simulateAsynchronousIO(() => {
			const reportsCollection = this.getReportsCollectionFor(dataArea)
			reportsCollection.push(inventoryReport)
		})
	}

	async removeReport (dataArea, id) {
		return simulateAsynchronousIO(() => {
				let reportsCollection = this.getReportsCollectionFor(dataArea)
				reportsCollection = [...reportsCollection.filter(report => report.id === id)]
			}
		)
	}

	getReportsCollectionFor(dataArea: DataArea) {
		const reportsCollection = this.dataAreas[dataArea];

		if(!reportsCollection) {
			throw new InvalidDataAreaError('The specified data area is unknown.')
		}
		return reportsCollection;
	}
}
