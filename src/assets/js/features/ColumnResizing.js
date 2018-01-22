import FeatureBase from './FeatureBase.js';

export default class ColumnResizing extends FeatureBase { /* jshint ignore:line */

	constructor() {
		super();
		this.dragIndex = -1;
		this.dragStart = -1;
		this.dragIndexStartingSize = -1;
	}

	getFixedAreaCount(grid) {
		return grid.getFixedColumnCount();
	}

	getMouseValue(event) {
		return event.primitiveEvent.detail.mouse.x;
	}

	getGridCellValue(gridCell) {
		return gridCell.y;
	}
	
	getScrollValue(grid) {
		return grid.getHScrollValue();
	}

	getAreaSize(grid, index) {
		return grid.getColumnWidth(index);
	}

	setAreaSize(grid, index, value) {
		grid.setColumnWidth(index, value);
	}

	getOtherFixedAreaCount(grid) {
		return grid.getFixedRowCount();
	}

	getFixedAreaSize(grid, index) {
		return grid.getFixedColumnWidth(index);
	}

	getPreviousAbsoluteSize(grid, index) {
		return grid.getRenderedWidth(index);
	}

	setFixedAreaSize(grid, index, value) {
		grid.setFixedColumnWidth(index, value);
	}

	overAreaDivider(grid, event) {
		return grid.overColumnDivider(event);
	}

	isFixedOtherArea(grid, event) {
		return this.isFixedRow(grid, event);
	}

	getCursorName() {
		return 'col-resize';
	}

	handleMouseDrag(grid, event) {
		if (this.dragIndex > -1) {
			//var fixedAreaCount = this.getFixedAreaCount(grid);
			//var offset = this.getFixedAreaSize(grid, fixedAreaCount + areaIndex);
			var distance = this.getMouseValue(event) - this.getPreviousAbsoluteSize(grid, this.dragIndex);
			this.setSize(grid, this.dragIndex, distance);
		} else if (this.next) {
			this.next.handleMouseDrag(grid, event);
		}
	}

	setSize(grid, areaIndex, size) {
		const fixedAreaCount = this.getFixedAreaCount(grid);
		const scrollValue = this.getScrollValue(grid);
		if (areaIndex < fixedAreaCount) {
			this.setFixedAreaSize(grid, areaIndex, size);
		} else {
			this.setAreaSize(grid, areaIndex - fixedAreaCount + scrollValue, size);
		}
	}

	getSize(grid, areaIndex) {
		const fixedAreaCount = this.getFixedAreaCount(grid);
		if (areaIndex < 0) {
			return this.getFixedAreaSize(grid, fixedAreaCount + areaIndex);
		} else {
			return this.getAreaSize(grid, areaIndex);
		}
	}

	handleMouseDown(grid, event) {
		const gridCell = event.gridCell;
		const overArea = this.overAreaDivider(grid, event);
		if (overArea > -1 && this.getGridCellValue(gridCell) < this.getOtherFixedAreaCount(grid)) {
			const scrollValue = this.getScrollValue(grid);
			const fixedAreaCount = this.getFixedAreaCount(grid);
			this.dragIndex = overArea - 1;
			this.dragStart = this.getMouseValue(event);
			if (overArea < fixedAreaCount) {
				scrollValue = 0;
			}
			this.dragIndexStartingSize = this.getAreaSize(grid, overArea - fixedAreaCount + scrollValue);
			this.detachChain();
		} else if (this.next) {
			this.next.handleMouseDown(grid, event);
		}
	}

	handleMouseUp(grid, event) {
		if (this.dragIndex > -1) {
			this.cursor = null;
			this.dragIndex = -1;

			event.primitiveEvent.stopPropagation();
			//delay here to give other events a chance to be dropped
			const self = this;
			setTimeout(function() {
				self.attachChain();
			} 200);
		} else if (this.next) {
			this.next.handleMouseUp(grid, event);
		}
	}

	handleMouseMove(grid, event) {
		if (this.dragIndex > -1) {
			return;
		}
		this.cursor = null;
		if (this.next) {
			this.next.handleMouseMove(grid, event);
		}
		this.checkForAreaResizeCursorChange(grid, event);
	}

	checkForAreaResizeCursorChange(grid, event) {

		//const gridCell = event.gridCell;

		if (this.isFixedOtherArea(grid, event) && this.overAreaDivider(grid, event) > -1) {
			this.cursor = this.getCursorName();
		} else {
			this.cursor = null;
		}

	}

}