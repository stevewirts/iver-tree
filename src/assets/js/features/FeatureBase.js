export default class FeatureBase {

	constructor() {
		this.next = null;
		this.detached = null;
		this.cursor = null;
		this.currentHoverCell = null;
	}

	setNext(nextFeature) {
		if (this.next) {
			this.next.setNext(nextFeature);
		} else {
			this.next = nextFeature;
			this.detached = nextFeature;
		}
	}

	detachChain() {
		this.next = null;
	}

	attachChain() {
		this.next = this.detached;
	}

	handleMouseMove(grid, event) {
		if (this.next) {
			this.next.handleMouseMove(grid, event);
		}
	}

	handleMouseExit(grid, event) {
		if (this.next) {
			this.next.handleMouseExit(grid, event);
		}
	}

	handleMouseEnter(grid, event) {
		if (this.next) {
			this.next.handleMouseEnter(grid, event);
		}
	}

	handleMouseDown(grid, event) {
		if (this.next) {
			this.next.handleMouseDown(grid, event);
		}
	}

	handleMouseUp(grid, event) {
		if (this.next) {
			this.next.handleMouseUp(grid, event);
		}
	}

	handleKeyDown(grid, event) {
		if (this.next) {
			this.next.handleKeyDown(grid, event);
		}
	}

	handleKeyUp(grid, event) {
		if (this.next) {
			this.next.handleKeyUp(grid, event);
		}
	}

	handleWheelMoved(grid, event) {
		if (this.next) {
			this.next.handleWheelMoved(grid, event);
		}
	}

	handleDoubleClick(grid, event) {
		if (this.next) {
			this.next.handleDoubleClick(grid, event);
		}
	}

	handleHoldPulse(grid, event) {
		if (this.next) {
			this.next.handleHoldPulse(grid, event);
		}
	}

	handleTap(grid, event) {
		if (this.next) {
			this.next.handleTap(grid, event);
		}
	}

	handleMouseDrag(grid, event) {
		if (this.next) {
			this.next.handleMouseDrag(grid, event);
		}
	}

	toggleColumnPicker(grid) {
		if (this.next) {
			this.next.toggleColumnPicker(grid);
		}
	}

	isFixedRow(grid, event) {
		const gridCell = event.gridCell;
		const isFixed = gridCell.y < grid.getFixedRowCount();
		return isFixed;
	}

	isFixedColumn(grid, event) {
		const gridCell = event.gridCell;
		const isFixed = gridCell.x < grid.getFixedColumnCount();
		return isFixed;
	}

	isTopLeft(grid, event) {
		const isTopLeft = this.isFixedRow(grid, event) && this.isFixedColumn(grid, event);
		return isTopLeft;
	}

	setCursor(grid) {
		if (this.next) {
			this.next.setCursor(grid);
		}
		if (this.cursor) {
			grid.beCursor(this.cursor);
		}
	}

	initializeOn(grid) {
		if (this.next) {
			this.next.initializeOn(grid);
		}
	}

}
