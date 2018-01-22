import ModelBase from './ModelBase.js';

export default class PassiveVirtualModel extends ModelBase {

	constructor() {
		super();
		this.scrollPositionY = 0;
		this.block = {
			data: [[]],
			meta: [],
			rows: [0, 0],
			rowCount: 0
		};
	}

	setScrollPositionY(y) {
		this.scrollPositionY = y;
		if (this.listener) {
			this.listener.setScrollPositionY(y);
		}
	}

	setBlock(block) {
		this.block = block;
		this.changed();
	}

	changed() {
		var grid = this.parentElement;
		var canvas = grid.getCanvas();
		grid.repaintFlag = true;
		if (canvas) {
			canvas.repaint();
		}
	}

	getValue(x, y) {
		var override = this.dataUpdates['p_' + x + '_' + y];
		if (override) {
			return override;
		}

		var normalized = Math.floor(y - this.scrollPositionY);
		if (this.block && normalized < this.block.data[0].length) {
			return this.block.data[x][normalized];
		} else {
			return '';
		}
	}

	clearData() {
		this.block.data = [[]];
		this.block.metea = [];
		this.block.rows = [0, 0];
		this.block.rowCount = 0;
		this.sorted = {};
		this.sortStates = ['', ' ^', ' v', ' |^|', ' |v|'];
		this.changed();
	}

	getRowCount() {
		return this.block.rowCount;
	}

	getColumnCount() {
		return Math.max(0, this.block.meta.length);
	}

	getFixedColumnCount() {
		return 1;
	}

	getFixedRowValue(x) {
		return this.block.meta[x].c;
	}

	getHeader(x) {
		return this.block.meta[x].c;
	}

	getFixedColumnValue(x, y) {
		return y;
	}

	getCanSort() {
		return false;
	}

	getColumnAlignment(x) {
		return 'right';
	}

	onMouseUp() {

	}

}