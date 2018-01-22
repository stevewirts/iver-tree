import FeatureBase from './FeatureBase.js';

const commands = {
	PAGEDOWN: function(grid) {
		grid.pageDown();
	},
	PAGEUP: function(grid) {
		grid.pageUp();
	},
	PAGELEFT: function(grid) {
		grid.pageLeft();
	},
	PAGERIGHT: function(grid) {
		grid.pageRight();
	}
};

export default class KeyPaging extends FeatureBase {

	handleKeyDown(grid, event) {
		var detail = event.detail.char;
		var func = commands[detail];
		if (func) {
			func(grid);
		} else if (this.next) {
			this.next.handleKeyDown(grid, event);
		}
	}

}