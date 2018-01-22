import FeatureBase from './FeatureBase.js';

export default class CellClick extends FeatureBase {
	handleTap(grid, event) {
		const fixedRowsHeight = grid.getFixedRowsHeight();
		const fixedColsWidth = grid.getFixedColumnsWidth();
		if ((event.primitiveEvent.detail.mouse.y > fixedRowsHeight) &&
			(event.primitiveEvent.detail.mouse.x > fixedColsWidth)) {
			grid.cellClicked(event);
		} else if (this.next) {
			this.next.handleTap(grid, event);
		}
	}
}