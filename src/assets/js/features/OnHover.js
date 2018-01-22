import FeatureBase from './FeatureBase.js';

export default class OnHover extends FeatureBase {

   handleMouseMove(grid, event) {
		var currentHoverCell = grid.getHoverCell();
		if (!event.gridCell.equals(currentHoverCell)) {
			if (currentHoverCell) {
				this.handleMouseExit(grid, currentHoverCell);
			}
			this.handleMouseEnter(grid, event);
			grid.setHoverCell(event.gridCell);
		} else {
			if (this.next) {
				this.next.handleMouseMove(grid, event);
			}
		}	
	}
	
}