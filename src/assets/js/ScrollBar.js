const CONTENT = `
		<div class="scroll-bar-up"></div>
		<div class="scroll-bar-gutter">
			<div class="scroll-bar-thumb" draggable="false"></div>
		</div>
		<div class="scroll-bar-down"></div>`;

const noop = function() {};

const STEPPING_INTERVAL = 200;

export default class ScrollBar {

	constructor(div, isHorizontal) {

		this.isHorizontal = isHorizontal === true;
		this.containerDiv = div;
		this.containerDiv.innerHTML = CONTENT;
		this.offset = 0;

		this.lastPercent = 0.0;
		// get the actionable child elements
		this.bar = this.containerDiv;
		this.thumb = this.containerDiv.querySelector('.scroll-bar-thumb');
		this.gutter = this.containerDiv.querySelector('.scroll-bar-gutter');

		this.stepUp = this.containerDiv.querySelector('.scroll-bar-up');
		this.stepUpPressedNow = false;

		this.stepDown = this.containerDiv.querySelector('.scroll-bar-down');
		this.stepDownPressedNow = false;

		this.configureOrientation();

		//var bounds = this.bounds = this.getBoundingClientRect();
		this.isScrolling = false;

		this.attachStepUp();
		this.attachStepDown();
		this.attachThumbMouseDown();
		this.attachThumbMouseMove();
		this.attachThumbMouseUp();
	}

	attachStepUp() {
		const self = this;
		this.stepUp.addEventListener('mousedown', (event)=> {
			self.stepUpPressed(true);
		});
		this.stepUp.addEventListener('mouseup', (event)=> {
			self.stepUpPressed(false);
		});
		this.stepUp.addEventListener('mouseout', (event)=> {
			self.stepUpPressed(false);
		});
	}

	attachStepDown() {
		const self = this;
		this.stepDown.addEventListener('mousedown', (event)=> {
			self.stepDownPressed(true);
		});
		this.stepDown.addEventListener('mouseup', (event)=> {
			self.stepDownPressed(false);
		});
		this.stepDown.addEventListener('mouseout', (event)=> {
			self.stepDownPressed(false);
		});
	}

	stepUpPressed(bool) {
		this.stepUpPressedNow = bool;
		this.checkStepping();
	}

	stepDownPressed(bool) {
		this.stepDownPressedNow = bool;
		this.checkStepping();
	}

	checkStepping() {
		const self = this;
		if (this.stepUpPressedNow || this.stepDownPressedNow && !this.isStepping) {
			this.step();
		}
	}

	step() {
		const self = this;
		if (this.stepUpPressedNow) {
			this.onUpClick();
		}
		if (this.stepDownPressedNow) {
			this.onDownClick();
		}
		if (this.stepUpPressedNow || this.stepDownPressedNow) {
			setTimeout(()=>self.step(), STEPPING_INTERVAL);		
		}
	}

	setRangeAdapter(rangeAdapter) {

		var that = this;

		that.rangeAdapter = rangeAdapter;
		if (that.thumb) {
			that.thumb.rangeAdapter = rangeAdapter;
		}

		rangeAdapter.valueChanged = function() {
			var value = rangeAdapter.getValue();
			if (value || value === 0) {
				try {
					that.supressUpdates = true;
					that.moveToPercent(value);
				} finally {
					that.supressUpdates = false;
				}
			}
		};
	}

	attachWheelEvent() {
		var that = this;

		document.addEventListener('wheel', function(event) {
			// dont pull on the page at all
			event.preventDefault();
			that.throttledWheelEvent(event);
		});

		return that;
	}

	attachThumbMouseDown() {
		var that = this;

		that.thumb.addEventListener('mousedown', function(event) {
			noop(event);
			that.isScrolling = true;
			var direction = that.orientation === 'y' ? 'top' : 'left';
			var distanceFromEdge = that.gutter.getBoundingClientRect()[direction];
			if (that.orientation === 'y') {
				that.offset = distanceFromEdge + 11; //event.y || event.clientY + distanceFromEdge;
			} else {
				that.offset = distanceFromEdge + 11; //event.x || event.clientX + distanceFromEdge;
			}
		});

		return that;
	}

	attachThumbMouseMove() {
		var that = this;

		document.addEventListener('mousemove', function(event) {
			if (that.isScrolling) {
				var offset = 0;
				if (that.orientation === 'y') {
					offset = event.y || event.clientY;
				} else {
					offset = event.x || event.clientX;
				}
				that.moveThumb(offset);
			}
		});

		return that;
	}

	attachThumbMouseUp() {
		var that = this;
		document.addEventListener('mouseup', function() {
			if (that.isScrolling) {
				that.offset = 0;
				that.isScrolling = false;
			}
		});

		return that;
	}

	onUpClick() {
		console.log('up click');
	}

	onUpHold(event) {
		event.preventTap();
		console.log('hold me up..', Date.now());
	}

	onDownClick() {
		console.log('down click');
	}

	onDownHold(event) {
		event.preventTap();
		console.log('hold me down ..', Date.now());
	}

	onGutterClick() {
		console.log('click');
	}

	onGutterHold(event) {
		event.preventTap();
		console.log('hold me in the gutter..', Date.now());
	}

	moveThumb(pageLocation) {
		var that = this,
			direction = this.orientation === 'y' ? 'top' : 'left',
			//percent,
			maxScroll = that.getMaxScroll(),
			offBy = pageLocation - that.offset;

		offBy = offBy < 0 ? 0 : offBy;
		offBy = offBy / maxScroll;
		offBy = offBy > 1 ? 1 : offBy;
		offBy = offBy * 100;

		that.thumb.style[direction] = offBy + '%';

		if (that.rangeAdapter) {
			if (that.supressUpdates) {
				return;
			}
			that.rangeAdapter.setValue(offBy / 100);
		}
	} //end movethumb value

	moveToPercent(percent) {
		var that = this;

		if (!that.isScrolling) {
			that.moveThumb(percent * this.getMaxScroll());
		}
	}

	setValueUpdatedCallback(callback) {
		this.valueUpdatedCallback = callback;

	}

	setOrientation(orientation) {
		this.orientation = orientation;

	}

	getMaxScroll() {
		var direction = this.orientation === 'y' ? 'clientHeight' : 'clientWidth';
		return this.gutter[direction];

	}

	configureOrientation() {
		var orientation = 'y';

		if (this.isHorizontal) {
			orientation = 'x';
			this.bar.classList.add('horizontal');
		}

		this.setOrientation(orientation);
	}

	tickle() {
		this.rangeAdapter.setValue(this.lastPercent);
	}

	createRangeAdapter(subject, userConfig) {
		var config = userConfig || {
			step: 1,
			page: 40,
			rangeStart: 0,
			rangeStop: 100
		}

		const that = {};

		// this is the 'cached' value that is listenable
		that.valueObj = {
			value: null
		};

		// apparent Polymer object.observe polyfill breaking change...
		// Object.observe(subject, function() {
		//     that.subjectChanged();
		// });

		that.subjectChanged = function() {
			that.valueObj.value = that.computeNormalizedValue();
			that.valueChanged();
		};

		// that.grid = function(value) {
		//     if (value === undefined) {
		//         return grid;
		//     }
		//     grid = value;
		// };

		that.rangeStart = function(value) {
			if (value === undefined) {
				return config.rangeStart;
			}
		};

		that.rangeStop = function(value) {
			if (value === undefined) {
				return config.rangeStop;
			}
		};

		that.page = function(value) {
			if (value === undefined) {
				return config.page;
			}
		};

		// @param value is a number
		that.setValue = function(newValue) {
			if (typeof newValue !== 'number') {
				return;
			}
			var deNormalized = Math.floor((newValue * (config.rangeStop - config.rangeStart)) + config.rangeStart);
			subject.setValue(deNormalized);
			that.valueObj.value = newValue;
			that.valueChanged();
		};
		that.computeNormalizedValue = function() {
			var value = (subject.getValue() - config.rangeStart) / (config.rangeStop - config.rangeStart);
			return value;
		};

		that.getValue = function() {
			return that.valueObj.value;
		};

		that.valueChanged = function() {};


		return that;
	}
}

// ScrollBar.prototype.throttledWheelEvent = throttle(function(event) {

// 	var that = this;

// 	var directionXY = that.orientation.toUpperCase(),
// 		styleProperty = directionXY === 'Y' ? 'top' : 'left',
// 		rangeStop = that.rangeAdapter.rangeStop(),
// 		currentPercent = ((that.thumb.style && that.thumb.style[styleProperty]) && parseFloat(that.thumb.style[styleProperty])) || 0,
// 		direction = event['delta' + directionXY] > 0 ? 1 : -1,
// 		currentPercentAsRows = Math.round(that.rangeAdapter.rangeStop() * currentPercent),
// 		oneMoreRow = Math.round(currentPercentAsRows + (1 * direction)),
// 		ranged = oneMoreRow / rangeStop / 100;

// 	ranged = ranged > 1 ? 1 : ranged;
// 	ranged = ranged < 0 ? 0 : ranged;

// 	that.rangeAdapter.setValue(ranged);

// }, 30);
