import ModelBase from './ModelBase.js';

export default class FakeTableModel extends ModelBase {

	constructor() {
		super();
	}

	setScrollPositionY(y) {
		this.scrollPositionY = y;
		if (this.listener) {
			this.listener.setScrollPositionY(y);
		}
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
		return '(' + x + ', ' + y + ')';
	}

	getRowCount() {
		return 100000;
	}

	getColumnCount() {
		return 100;
	}

	getFixedColumnCount() {
		return 1;
	}

	getFixedRowValue(x) {
		return x + '';
	}

	getHeader(x) {
		return x + '';
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

}