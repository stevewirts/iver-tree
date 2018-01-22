import FeatureBase from './FeatureBase.js';

export default class ColumnAutosizing extends FeatureBase {

	handleDoubleClick(grid, event) {
		const fixedRowCount = grid.getFixedRowCount();
		const fixedColCount = grid.getFixedColumnCount();
		const gridCell = event.gridCell;
		if (gridCell.y <= fixedRowCount) {
			const col = grid.getHScrollValue() + gridCell.x - fixedColCount;
			grid.autosizeColumn(col);
		} else if (this.next) {
			this.next.handleDoubleClick(grid, event);
		}
	}

}