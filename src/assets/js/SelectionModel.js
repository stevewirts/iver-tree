import Rectangles from './Rectangles.js';

export default class SelectionModel {

	constructor(grid) {
		this.selections = [];
		this.flattenedX = [];
		this.flattenedY = [];
		this.grid = grid;
	}

	getGrid() {
		return this.grid;
	}

	select(ox, oy, ex, ey) {
		var newSelection = Rectangles.rectangle.create(ox, oy, ex, ey);
		this.selections.push(newSelection);
		this.flattenedX.push(newSelection.flattenXAt(0));
		this.flattenedY.push(newSelection.flattenYAt(0));
		this.getGrid().selectionChanged();
	}

	clearMostRecentSelection() {
		this.selections.length = Math.max(0, this.selections.length - 1);
		this.flattenedX.length = Math.max(0, this.flattenedX.length - 1);
		this.flattenedY.length = Math.max(0, this.flattenedY.length - 1);
	}

	getSelections() {
		return this.selections;
	}

	hasSelections() {
		return this.selections.length !== 0;
	}

	isSelected(x, y) {
		return this._isSelected(this.selections, x, y);
	}

	isFixedRowCellSelected(col) {
		return this._isSelected(this.flattenedY, col, 0);
	}

	isFixedColumnCellSelected(row) {
		return this._isSelected(this.flattenedX, 0, row);
	}

	_isSelected(selections, x, y) {
		for (var i = 0; i < selections.length; i++) {
			var each = selections[i];
			if (Rectangles.rectangle.contains(each, x, y)) {
				return true;
			}
		}
		return false;
	}

	clear() {
		this.selections.length = 0;
		this.flattenedX.length = 0;
		this.flattenedY.length = 0;
	}

}