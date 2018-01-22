import FeatureBase from './FeatureBase.js';

export default class CellEditing extends FeatureBase { /* jshint ignore:line */

	handleDoubleClick(grid, event) {
		const fixedColCount = grid.getFixedColumnCount();
		const fixedRowCount = grid.getFixedRowCount();
		const gridCell = event.gridCell;
		if (gridCell.x >= fixedColCount && gridCell.y >= fixedRowCount) {
			const x = grid.getHScrollValue() + gridCell.x - fixedColCount;
			const y = grid.getVScrollValue() + gridCell.y - fixedRowCount;
			event.gridCell = grid.rectangles.point.create(x, y);
			grid._activateEditor(event);
		} else if (this.next) {
			this.next.handleDoubleClick(grid, event);
		}
	}

	handleHoldPulse(grid, mouseEvent) {
		const primEvent = mouseEvent.primitiveEvent;
		if (primEvent.detail.count < 2) {
			return;
		}
		grid._activateEditor(mouseEvent);
	}
}