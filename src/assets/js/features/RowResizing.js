import FeatureBase from './FeatureBase.js';

export default class RowResizing extends FeatureBase {

	constructor() {
		super();
		this.dragArea = -1;
		this.dragStart = -1;
		this.dragAreaStartingSize = -1;
	}

	getFixedAreaCount(grid) {
		return grid.getFixedRowCount();
	}

	getMouseValue(event) {
		return event.primitiveEvent.detail.mouse.y;
	}

	getGridCellValue(gridCell) {
		return gridCell.x;
	}


	getScrollValue(grid) {
		return grid.getVScrollValue();
	}

	getAreaSize(grid, index) {
		return grid.getRowHeight(index);
	}

	setAreaSize(grid, index, value) {
		grid.setRowHeight(index, value);
	}

	getOtherFixedAreaCount(grid) {
		return grid.getFixedColumnCount();
	}

	getFixedAreaSize(grid, index) {
		return grid.getFixedRowHeight(index);
	}

	setFixedAreaSize(grid, index, value) {
		grid.setFixedRowHeight(index, value);
	}

	overAreaDivider(grid, event) {
		return grid.overRowDivider(event);
	}

	isFixedOtherArea(grid, event) {
		return this.isFixedColumn(grid, event);
	}

	getCursorName() {
		return 'row-resize';
	}

	getPreviousAbsoluteSize(grid, index) {
		return grid.getRenderedHeight(index);
	}

}