import FeatureBase from './FeatureBase.js';

export default class ColumnSorting extends FeatureBase {

	handleTap(grid, event) {
		const gridCell = event.gridCell;
		const inFixedRowArea = gridCell.y < grid.getFixedRowCount();
		const inFixedColumnArea = gridCell.x < grid.getFixedColumnCount();

		if (inFixedRowArea && inFixedColumnArea) {
			grid.topLeftClicked(event);
		} else if (inFixedRowArea) {
			grid.fixedRowClicked(event);
		} else if (inFixedColumnArea) {
			grid.fixedColumnClicked(event);
		}
	}

	handleMouseMove(grid, event) {
		const y = event.gridCell.y;
		if (this.isFixedRow(grid, event) && !this.isFixedColumn(grid, event) && y < 1) {
			this.cursor = 'pointer';
		} else {
			this.cursor = null;
		}
		if (this.next) {
			this.next.handleMouseMove(grid, event);
		}
	}

}