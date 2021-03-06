import FeatureBase from './FeatureBase.js';

export default class ThumbwheelScrolling extends FeatureBase {

	handleWheelMoved(grid, e) {
		if (!grid.resolveProperty('scrollingEnabled')) {
			return;
		}
		var primEvent = e.primitiveEvent;
		var deltaY = primEvent.wheelDeltaY || -primEvent.deltaY;
		var deltaX = primEvent.wheelDeltaX || -primEvent.deltaX;
		if (deltaY > 0) {
			grid.scrollBy(0, -1);
		} else if (deltaY < -0) {
			grid.scrollBy(0, 1);
		} else if (deltaX > 0) {
			grid.scrollBy(-1, 0);
		} else if (deltaX < -0) {
			grid.scrollBy(1, 0);
		}
	}
	
}