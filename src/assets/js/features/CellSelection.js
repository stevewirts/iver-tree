import FeatureBase from './FeatureBase.js';
import Rectangles from '../Rectangles.js';

export default class CellSelection extends FeatureBase {

	constructor() {
		super();
		this.currentDrag =  null;
		this.lastDragCell =  null;
		this.sbLastAuto =  0;
		this.sbAutoStart =  0;
	}

	handleMouseUp(grid, event) {
		this.dragging = false;
		if (this.next) {
			this.next.handleMouseUp(grid, event);
		}
	}

	handleMouseDown(grid, event) {
		var gridCell = event.gridCell;
		if (gridCell.y < grid.getFixedRowCount()) {
			grid.clearSelections();
			this.dragging = false;
			if (this.next) {
				this.next.handleMouseDown(grid, event);
			}
			return;
		} else if (gridCell.x < grid.getFixedColumnCount()) {
			grid.clearSelections();
			this.dragging = false;
			return;
		} else {
			var primEvent = event.primitiveEvent;
			var keys = primEvent.detail.keys;
			this.dragging = true;
			this.extendSelection(grid, gridCell, keys);
		}
	}

	handleMouseDrag(grid, event) {
		var mouseDown = grid.getMouseDown();
		if (!this.dragging) {
			if (this.next) {
				this.next.handleMouseDrag(grid, event);
			}
		}
		if (mouseDown.x < 0 || mouseDown.y < 0) {
			//we are in the fixed area don't initiate a drag
			return;
		}
		var gridCell = event.gridCell;
		var primEvent = event.primitiveEvent;
		this.currentDrag = primEvent.detail.mouse;
		this.lastDragCell = gridCell;
		this.checkDragScroll(grid, this.currentDrag);
		this.handleMouseDragCellSelection(grid, gridCell, primEvent.detail.keys);
	}

	handleKeyDown(grid, event) {
		var command = 'handle' + event.detail.char;
		if (this[command]) {
			this[command].call(this, grid, event.detail);
		}
	}

	handleMouseDragCellSelection(grid, mouse /* ,keys */ ) {

		var scrollTop = grid.getVScrollValue();
		var scrollLeft = grid.getHScrollValue();

		var numFixedColumns = grid.getFixedColumnCount();
		var numFixedRows = grid.getFixedRowCount();

		var x = mouse.x - numFixedColumns;
		var y = mouse.y - numFixedRows;

		x = Math.max(0, x);
		y = Math.max(0, y);

		var previousDragExtent = grid.getDragExtent();
		var mouseDown = grid.getMouseDown();

		var newX = x + scrollLeft - mouseDown.x;
		var newY = y + scrollTop - mouseDown.y;

		if (previousDragExtent.x === newX && previousDragExtent.y === newY) {
			return;
		}

		grid.clearMostRecentSelection();

		grid.select(mouseDown.x, mouseDown.y, newX, newY);

		var newDragExtent = Rectangles.point.create(newX, newY);
		grid.setDragExtent(newDragExtent);

		grid.repaint();
	}

	checkDragScroll(grid, mouse) {
		if (!grid.resolveProperty('scrollingEnabled')) {
			return;
		}
		var b = grid.getDataBounds();
		var inside = b.contains(mouse);
		if (inside) {
			if (grid.isScrollingNow()) {
				grid.setScrollingNow(false);
			}
		} else if (!grid.isScrollingNow()) {
			grid.setScrollingNow(true);
			this.scrollDrag(grid);
		}
	}

	scrollDrag(grid) {
		if (!grid.isScrollingNow()) {
			return;
		}
		var b = grid.getDataBounds();
		var xOffset = 0;
		var yOffset = 0;
		if (this.currentDrag.x < b.origin.x) {
			xOffset = -1;
		}
		if (this.currentDrag.x > b.origin.x + b.extent.x) {
			xOffset = 1;
		}
		if (this.currentDrag.y < b.origin.y) {
			yOffset = -1;
		}
		if (this.currentDrag.y > b.origin.y + b.extent.y) {
			yOffset = 1;
		}

		grid.scrollBy(xOffset, yOffset);
		this.handleMouseDragCellSelection(grid, this.lastDragCell, []); // update the selection
		grid.repaint();
		setTimeout(this.scrollDrag.bind(this, grid), 25);
	}

	extendSelection(grid, gridCell, keys) {
		var hasCTRL = keys.indexOf('CTRL') !== -1;
		var hasSHIFT = keys.indexOf('SHIFT') !== -1;
		var scrollTop = grid.getVScrollValue();
		var scrollLeft = grid.getHScrollValue();

		var numFixedColumns = grid.getFixedColumnCount();
		var numFixedRows = grid.getFixedRowCount();

		var mousePoint = grid.getMouseDown();
		var x = gridCell.x - numFixedColumns + scrollLeft;
		var y = gridCell.y - numFixedRows + scrollTop;

		//were outside of the grid do nothing
		if (x < 0 || y < 0) {
			return;
		}

		//we have repeated a click in the same spot deslect the value from last time
		if (x === mousePoint.x && y === mousePoint.y) {
			grid.clearMostRecentSelection();
			grid.popMouseDown();
			grid.repaint();
			return;
		}

		if (!hasCTRL && !hasSHIFT) {
			grid.clearSelections();
		}

		if (hasSHIFT) {
			grid.clearMostRecentSelection();
			grid.select(mousePoint.x, mousePoint.y, x - mousePoint.x, y - mousePoint.y);
			grid.setDragExtent(Rectangles.point.create(x - mousePoint.x, y - mousePoint.y));
		} else {
			grid.select(x, y, 0, 0);
			grid.setMouseDown(Rectangles.point.create(x, y));
			grid.setDragExtent(Rectangles.point.create(0, 0));
		}
		grid.repaint();
	}

	handleDOWNSHIFT(grid) {
		var count = this.getAutoScrollAcceleration(grid);
		this.moveShiftSelect(grid, 0, count);
	}

	handleUPSHIFT(grid) {
		var count = this.getAutoScrollAcceleration(grid);
		this.moveShiftSelect(grid, 0, -count);
	}

	handleLEFTSHIFT(grid) {
		this.moveShiftSelect(grid, -1, 0);
	}

	handleRIGHTSHIFT(grid) {
		this.moveShiftSelect(grid, 1, 0);
	}

	handleDOWN(grid) {
		var count = this.getAutoScrollAcceleration(grid);
		this.moveSingleSelect(grid, 0, count);
	}

	handleUP(grid) {
		var count = this.getAutoScrollAcceleration(grid);
		this.moveSingleSelect(grid, 0, -count);
	}

	handleLEFT(grid) {
		this.moveSingleSelect(grid, -1, 0);
	}

	handleRIGHT(grid) {
		this.moveSingleSelect(grid, 1, 0);
	}

	getAutoScrollAcceleration(grid) {
		if (!grid.isAutoScrollAcceleration()) {
			return 1;
		}
		var count = 1;
		var elapsed = this.getAutoScrollDuration() / 2000;
		count = Math.max(1, Math.floor(elapsed * elapsed * elapsed * elapsed));
		return count;
	}

	setAutoScrollStartTime() {
		this.sbAutoStart = Date.now();
	}

	pingAutoScroll() {
		var now = Date.now();
		if (now - this.sbLastAuto > 500) {
			this.setAutoScrollStartTime();
		}
		this.sbLastAuto = Date.now();
	}

	getAutoScrollDuration() {
		if (Date.now() - this.sbLastAuto > 500) {
			return 0;
		}
		return Date.now() - this.sbAutoStart;
	}

	moveShiftSelect(grid, offsetX, offsetY) {

		var maxColumns = grid.getColumnCount() - 1;
		var maxRows = grid.getRowCount() - 1;

		var maxViewableColumns = grid.getViewableColumns() - 1;
		var maxViewableRows = grid.getViewableRows() - 1;

		if (!grid.resolveProperty('scrollingEnabled')) {
			maxColumns = Math.min(maxColumns, maxViewableColumns);
			maxRows = Math.min(maxRows, maxViewableRows);
		}

		var origin = grid.getMouseDown();
		var extent = grid.getDragExtent();

		var newX = extent.x + offsetX;
		var newY = extent.y + offsetY;

		newX = Math.min(maxColumns - origin.x, Math.max(-origin.x, newX));
		newY = Math.min(maxRows - origin.y, Math.max(-origin.y, newY));

		grid.clearMostRecentSelection();
		grid.select(origin.x, origin.y, newX, newY);

		grid.setDragExtent(Rectangles.point.create(newX, newY));

		if (grid.insureModelColIsViewable(newX + origin.x, offsetX)) {
			this.pingAutoScroll();
		}
		if (grid.insureModelRowIsViewable(newY + origin.y, offsetY)) {
			this.pingAutoScroll();
		}

		grid.repaint();

	}

	moveSingleSelect(grid, offsetX, offsetY) {

		var maxColumns = grid.getColumnCount() - 1;
		var maxRows = grid.getRowCount() - 1;

		var maxViewableColumns = grid.getViewableColumns() - 1;
		var maxViewableRows = grid.getViewableRows() - 1;

		if (!grid.resolveProperty('scrollingEnabled')) {
			maxColumns = Math.min(maxColumns, maxViewableColumns);
			maxRows = Math.min(maxRows, maxViewableRows);
		}

		var mouseCorner = grid.getMouseDown().plus(grid.getDragExtent());

		var newX = mouseCorner.x + offsetX;
		var newY = mouseCorner.y + offsetY;

		newX = Math.min(maxColumns, Math.max(0, newX));
		newY = Math.min(maxRows, Math.max(0, newY));

		grid.clearSelections();
		grid.select(newX, newY, 0, 0);
		grid.setMouseDown(Rectangles.point.create(newX, newY));
		grid.setDragExtent(Rectangles.point.create(0, 0));

		if (grid.insureModelColIsViewable(newX, offsetX)) {
			this.pingAutoScroll();
		}
		if (grid.insureModelRowIsViewable(newY, offsetY)) {
			this.pingAutoScroll();
		}

		grid.repaint();

	}


}