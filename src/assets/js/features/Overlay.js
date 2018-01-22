import FeatureBase from './FeatureBase.js';

const noop = function() {};
const ANIMATION_TIME = 200;

export default class Overlay extends FeatureBase {

	constructor() {
		super();
		this.openEditor - false;
	}

	handleKeyUp(grid, event) {
		const key = event.detail.char.toLowerCase();
		const keys = grid.resolveProperty('editorActivationKeys');
		if (keys.indexOf(key) > -1) {
			this.toggleColumnPicker(grid);
		}
	}

	toggleColumnPicker(grid) {
		if (this.isColumnPickerOpen(grid)) {
			this.closeColumnPicker(grid);
		} else {
			this.openColumnPicker(grid);
		}
	}

	isColumnPickerOpen(grid) {
		noop(grid);
		return this.overlay.style.display !== 'none';
	}

	openColumnPicker(grid) {
		if (this.isColumnPickerOpen()) {
			return;
		}
		this.openEditor = true;
		if (grid.getBehavior().openEditor(this.overlay) === false) {
			return;
		}

		const self = this;
		this.overlay.style.backgroundColor = grid.resolveProperty('backgroundColor');

		this.overlay.style.top = '0%';
		this.overlay.style.right = '0%';
		this.overlay.style.bottom = '0%';
		this.overlay.style.left = '0%';

		this.overlay.style.marginTop = '15px';
		this.overlay.style.marginRight = '35px';
		this.overlay.style.marginBottom = '35px';
		this.overlay.style.marginLeft = '15px';

		self.overlay.style.display = '';


		if (!this._closer) {
			this._closer = function(e) {
				const key = self.getCharFor(grid, e.keyCode).toLowerCase();
				const keys = grid.resolveProperty('editorActivationKeys');
				if (keys.indexOf(key) > -1 || e.keyCode === 27) {
					e.preventDefault();
					self.closeColumnPicker(grid);
				}
			};
		}

		grid.setFocusable(false);
		requestAnimationFrame(function() {
			self.overlay.style.opacity = 0.95;
			document.addEventListener('keydown', self._closer, false);
			self.overlay.focus();
		});
	}

	closeColumnPicker(grid) {
		grid.setFocusable(true);

		if (!this.isColumnPickerOpen()) {
			return;
		}
		if (this.openEditor) {
			this.openEditor = false;
		} else {
			return;
		}
		if (grid.getBehavior().closeEditor(this.overlay) === false) {
			return;
		}

		document.removeEventListener('keydown', this._closer, false);

		const self = this;

		requestAnimationFrame(function() {
			self.overlay.style.opacity = 0;
		});

		setTimeout(function() {
			self.overlay.innerHTML = '';
			self.overlay.style.display = 'none';
			grid.takeFocus();
		}, ANIMATION_TIME);
	}

	initializeOn(grid) {
		this.initializeOverlaySurface(grid);
		if (this.next) {
			this.next.initializeOn(grid);
		}
	}

	initializeOverlaySurface(grid) {
		this.overlay = document.createElement('div');
		this.overlay.setAttribute('tabindex', 0);
		this.overlay.style.outline = 'none';
		this.overlay.style.boxShadow = '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)';
		this.overlay.style.position = 'absolute';
		this.overlay.style.display = 'none';
		this.overlay.style.transition = 'opacity ' + ANIMATION_TIME + 'ms ease-in';
		this.overlay.style.opacity = 0;
		grid.appendChild(this.overlay);
		//document.body.appendChild(this.overlay);
	}

	getCharFor(grid, integer) {
		const charMap = grid.getCanvas().getCharMap();
		return charMap[integer][0];
	}

}