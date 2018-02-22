import Rectangles from './Rectangles.js';

const paintables = [];
const resizables = [];
let paintLoopRunning = true;
let resizeLoopRunning = true;
 
const paintLoopFunction = function(now) {
	if (!paintLoopRunning) {
		return;
	}
	for (var i = 0; i < paintables.length; i++) {
		try {
			paintables[i](now);
		} catch (e) {}
	}
	requestAnimationFrame(paintLoopFunction);
};
requestAnimationFrame(paintLoopFunction);


const resizablesLoopFunction = function(now) {
	if (!resizeLoopRunning) {
		return;
	}
	for (var i = 0; i < resizables.length; i++) {
		try {
			resizables[i](now);
		} catch (e) {}
	}
};
setInterval(resizablesLoopFunction, 200);

/**
 * charMap is a private property that maps keys strokes to key chars,
 *
 * @property charMap
 * @type Array
 */
const charMap = [];
const empty = ['', ''];
for (let i = 0; i < 256; i++) {
	charMap[i] = empty;
}

charMap[27] = ['ESC', 'ESCSHIFT'];
charMap[192] = ['`', '~'];
charMap[49] = ['1', '!'];
charMap[50] = ['2', '@'];
charMap[51] = ['3', '#'];
charMap[52] = ['4', '$'];
charMap[53] = ['5', '%'];
charMap[54] = ['6', '^'];
charMap[55] = ['7', '&'];
charMap[56] = ['8', '*'];
charMap[57] = ['9', '('];
charMap[48] = ['0', ')'];
charMap[189] = ['-', '_'];
charMap[187] = ['=', '+'];
charMap[8] = ['DELETE', 'DELETESHIFT'];
charMap[9] = ['TAB', 'TABSHIFT'];
charMap[81] = ['q', 'Q'];
charMap[87] = ['w', 'W'];
charMap[69] = ['e', 'E'];
charMap[82] = ['r', 'R'];
charMap[84] = ['t', 'T'];
charMap[89] = ['y', 'Y'];
charMap[85] = ['u', 'U'];
charMap[73] = ['i', 'I'];
charMap[79] = ['o', 'O'];
charMap[80] = ['p', 'P'];
charMap[219] = ['[', '{'];
charMap[221] = [']', '}'];
charMap[220] = ['\\', '|'];
charMap[220] = ['CAPSLOCK', 'CAPSLOCKSHIFT'];
charMap[65] = ['a', 'A'];
charMap[83] = ['s', 'S'];
charMap[68] = ['d', 'D'];
charMap[70] = ['f', 'F'];
charMap[71] = ['g', 'G'];
charMap[72] = ['h', 'H'];
charMap[74] = ['j', 'J'];
charMap[75] = ['k', 'K'];
charMap[76] = ['l', 'L'];
charMap[186] = [';', ':'];
charMap[222] = ['\'', '|'];
charMap[13] = ['RETURN', 'RETURNSHIFT'];
charMap[16] = ['SHIFT', 'SHIFT'];
charMap[90] = ['z', 'Z'];
charMap[88] = ['x', 'X'];
charMap[67] = ['c', 'C'];
charMap[86] = ['v', 'V'];
charMap[66] = ['b', 'B'];
charMap[78] = ['n', 'N'];
charMap[77] = ['m', 'M'];
charMap[188] = [',', '<'];
charMap[190] = ['.', '>'];
charMap[191] = ['/', '?'];
charMap[16] = ['SHIFT', 'SHIFT'];
charMap[17] = ['CTRL', 'CTRLSHIFT'];
charMap[18] = ['ALT', 'ALTSHIFT'];
charMap[91] = ['COMMANDLEFT', 'COMMANDLEFTSHIFT'];
charMap[32] = ['SPACE', 'SPACESHIFT'];
charMap[93] = ['COMMANDRIGHT', 'COMMANDRIGHTSHIFT'];
charMap[18] = ['ALT', 'ALTSHIFT'];
charMap[38] = ['UP', 'UPSHIFT'];
charMap[37] = ['LEFT', 'LEFTSHIFT'];
charMap[40] = ['DOWN', 'DOWNSHIFT'];
charMap[39] = ['RIGHT', 'RIGHTSHIFT'];

charMap[33] = ['PAGEUP', 'PAGEUPSHIFT'];
charMap[34] = ['PAGEDOWN', 'PAGEDOWNSHIFT'];
charMap[35] = ['PAGERIGHT', 'PAGERIGHTSHIFT'];
charMap[36] = ['PAGELEFT', 'PAGELEFTSHIFT'];

const CONTENT = `<button></button>
       <canvas class="canvas"></canvas>`;

export default class Canvas {

	constructor(div, renderer, fps, useBitBlit) {
		this.renderer = renderer;
		this.containerDiv = div;
		this.listeners = [];
		this.initContainerDiv();
		this.containerDiv.innerHTML = CONTENT;
		this.buttonDiv = this.containerDiv.querySelector('button');
		this.initButtonDiv();
		this.fpsValue = fps;
		this.useBitBlitValue = useBitBlit;
		this.g = null;
		this.canvas = null;
		this.canvasCTX = null;
		this.focuser = null;
		this.buffer = null;
		this.ctx = null;
		this.mouseLocation = null;
		this.holdPulseCount = -1;
		this.dragstart = null;
		this.origin = null;
		this.bounds = null;
		this.repaintNow = false;
		this.size = null;
		this.mouseButtonDown = false;
		this.dragging = false;
		this.focused = false;
		this.repeatKeyCount = 0;
		this.repeatKey = null;
		this.repeatKeyStartTime = 0;
		this.currentKeys = [];
		this.hasMouse = false;
		this.lastDoubleClickTime = 0;
		this.dragEndTime = 0;
		this.lastRepaintTime = 0;

		var self = this;
		this.dragEndtime = Date.now();
		this.canvas = this.containerDiv.querySelector('canvas');
		this.focuser = this.containerDiv.querySelector('button');
		this.canvasCTX = this.canvas.getContext('2d');

		this.buffer = document.createElement('canvas');
		this.bufferCTX = this.buffer.getContext('2d');

		this.mouseLocation = Rectangles.point.create(-1, -1);
		this.dragstart = Rectangles.point.create(-1, -1);
		//this.origin = Rectangles.point.create(0, 0);
		this.bounds = Rectangles.rectangle.create(0, 0, 0, 0);
		this.hasMouse = false;

		this.containerDiv.onmouseover = function() {
			self.hasMouse = true;
		};

		this.addGenericListener(document, 'mousemove', function(e) {
			if (!self.hasMouse && !self.isDragging()) {
				return;
			}
			self.mousemove(e);
		});
		this.addGenericListener(document, 'mouseup', function(e) {
			self.mouseup(e);
		});
		this.addGenericListener(document, 'wheel', function(e) {
			self.wheelmoved(e);
		});
		this.addGenericListener(document, 'keydown', function(e) {
			self.keydown(e);
		});
		this.addGenericListener(document, 'keyup', function(e) {
			self.keyup(e);
		});

		this.addGenericListener(this.focuser, 'focus', function(e) {
			self.focusgained(e);
		});
		this.addGenericListener(this.focuser, 'blur', function(e) {
			self.focuslost(e);
		});
		this.addGenericListener(this, 'mousedown', function(e) {
			self.mousedown(e);
		});
		this.addGenericListener(this, 'mouseout', function(e) {
			self.hasMouse = false;
			self.mouseout(e);
		});
		this.addGenericListener(this, 'click', function(e) {
			self.click(e);
		});
		this.addGenericListener(this, 'contextmenu', function(e) {
			self.contextmenu(e);
		});
		// this.addEventListener('dblclick', function(e) {
		//     self.dblclick(e);
		// });

		this.resize();
		this.beginResizing();
		this.beginPainting();

	}
	
	addGenericListener(target, type, listener) {
		this.listeners.push({
			target,
			type,
			listener
		});
		target.addEventListener(type, listener);
	}

	destroy() {
		this.listeners.forEach(e=>{
			e.target.removeEventListener(e.type, e.listener);
		});
	}

	initButtonDiv() {
		const s = this.buttonDiv.style;
		s.position = 'fixed';
		s.top = '0';
		s.right = '0';
		s.bottom = '0';
		s.left = '0';
		s.border = 'none';
		s.color = 'transparent';
		s.backgroundColor = 'transparent';
		s.outline = 'none';
	}

	initContainerDiv() {
		const s = this.containerDiv.style;
		s.overflow = 'hidden';
		s.position = 'absolute';
	}

	dispatchEvent(event) {
		this.containerDiv.dispatchEvent(event);
	}

	addEventListener(eventName, callback) {
		this.containerDiv.addEventListener(eventName, callback);
	}

	removeEventListener(eventName, callback) {
		this.containerDiv.removeEventListener(eventName, callback);
	}

	appendChild(node) {
		this.containerDiv.appendChild(node);
	}
	
	getBoundingClientRect() {
		return this.containerDiv.getBoundingClientRect();
	}

	stopPaintThread() {
		paintLoopRunning = false;
	}

	restartPaintThread() {
		if (paintLoopRunning) {
			return; // already running
		}
		paintLoopRunning = true;
		requestAnimationFrame(paintLoopFunction);
	}

	stopResizeThread() {
		resizeLoopRunning = false;
	}

	restartResizeThread() {
		if (resizeLoopRunning) {
			return; // already running
		}
		resizeLoopRunning = true;
		setInterval(resizablesLoopFunction, 200);
	}

	detached() {
		this.stopPainting();
		this.stopResizing();
	}

	isHiDPI() {
		return true;
		// return this.getAttribute('hidpi') !== null;
	}

	useBitBlit() {
		return this.useBitBlitValue;
		// return this.getAttribute('bitblit') !== 'false';
	}

	getFPS() {
		var fps = this.fpsValue;
		if (fps === 0 || !fps) {
			fps = 0;
		}
		fps = parseInt(fps);
		return fps;

	}

	getRenderer() {
		var comp = this.renderer;
		return comp;
	}

	tickPaint(now) {
		var fps = this.getFPS();
		if (fps === 0) {
			return;
		}
		var interval = 1000 / fps;

		var elapsed = now - this.lastRepaintTime;
		if (elapsed > interval && this.repaintNow) {
			this.lastRepaintTime = now - (elapsed % interval);
			this.paintNow();
		}
	}

	beginPainting() {
		var self = this;
		this.repaintNow = true;
		this.tickPainter = function(now) {
			self.tickPaint(now);
		};
		paintables.push(this.tickPainter);
	}

	stopPainting() {
		paintables.splice(paintables.indexOf(this.tickPainter), 1);
	}

	beginResizing() {
		var self = this;
		this.tickResizer = function() {
			self.checksize();
		};
		resizables.push(this.tickResizer);
	}

	stopResizing() {
		resizables.splice(resizables.indexOf(this.tickResizer), 1);
	}

	checksize() {

		//this is expensize lets do it at some modulo
		var sizeNow = this.getBoundingClientRect();
		if (sizeNow.width !== this.size.width || sizeNow.height !== this.size.height) {
			this.sizeChangedNotification();
		}
	}

	sizeChangedNotification() {
		this.resize();
	}

	resize() {
		this.size = this.getBoundingClientRect();

		this.canvas.width = this.containerDiv.clientWidth;
		this.canvas.height = this.containerDiv.clientHeight;

		this.buffer.width = this.containerDiv.clientWidth;
		this.buffer.height = this.containerDiv.clientHeight;

		//fix ala sir spinka, see
		//http://www.html5rocks.com/en/tutorials/canvas/hidpi/
		//just add 'hdpi' as an attribute to the canvas tag
		var ratio = 1;
		var useBitBlit = this.useBitBlit();
		var isHIDPI = window.devicePixelRatio && this.isHiDPI();
		if (isHIDPI) {
			var devicePixelRatio = window.devicePixelRatio || 1;
			var backingStoreRatio = this.canvasCTX.webkitBackingStorePixelRatio ||
				this.canvasCTX.mozBackingStorePixelRatio ||
				this.canvasCTX.msBackingStorePixelRatio ||
				this.canvasCTX.oBackingStorePixelRatio ||
				this.canvasCTX.backingStorePixelRatio || 1;

			ratio = devicePixelRatio / backingStoreRatio;



			//this.canvasCTX.scale(ratio, ratio);
		}
		var width = this.canvas.getAttribute('width');
		var height = this.canvas.getAttribute('height');
		this.canvas.width = width * ratio;
		this.canvas.height = height * ratio;
		this.buffer.width = width * ratio;
		this.buffer.height = height * ratio;

		this.canvas.style.width = width + 'px';
		this.canvas.style.height = height + 'px';
		this.buffer.style.width = width + 'px';
		this.buffer.style.height = height + 'px';

		this.bufferCTX.scale(ratio, ratio);
		if (isHIDPI && !useBitBlit) {
			this.canvasCTX.scale(ratio, ratio);
		}

		//this.origin = Rectangles.point.create(Math.round(this.size.left), Math.round(this.size.top));
		this.bounds = Rectangles.rectangle.create(0, 0, this.size.width, this.size.height);
		//setTimeout(function() {
		var comp = this.getRenderer();
		if (comp) {
			comp.setBounds(this.bounds);
		}
		this.resizeNotification();
		this.paintNow();
		//});
	}

	resizeNotification() {
		//to be overridden
	}

	getBounds() {
		return this.bounds;
	}

	paintNow() {
		var self = this;
		this.safePaintImmediately(function(gc) {
			gc.clearRect(0, 0, self.canvas.width, self.canvas.height);
			self.paint(gc);
			self.repaintNow = false;
		});
	}

	safePaintImmediately(paintFunction) {
		var useBitBlit = this.useBitBlit();
		var gc = useBitBlit ? this.bufferCTX : this.canvasCTX;
		try {
			gc.save();
			paintFunction(gc);
		} finally {
			gc.restore();
		}
		if (useBitBlit) {
			this.flushBuffer();
		}
	}

	flushBuffer() {
		if (this.buffer.width > 0 && this.buffer.height > 0) {
			this.canvasCTX.drawImage(this.buffer, 0, 0);
		}
	}

	paint(gc) {
		var comp = this.getRenderer();
		if (comp) {
			comp._paint(gc);
		}
	}

	mousemove(e) {
		if (!this.isDragging() && this.mouseButtonDown) {
			this.beDragging();
			this.dispatchEvent(new CustomEvent('canvas-dragstart', {
				detail: {
					primitiveEvent: e,
					mouse: this.mouseLocation,
					keys: this.currentKeys,
					isRightClick: this.isRightClick(e)
				}
			}));
			this.dragstart = Rectangles.point.create(this.mouseLocation.x, this.mouseLocation.y);
		}
		this.mouseLocation = this.getLocal(e);
		if (this.isDragging()) {
			this.dispatchEvent(new CustomEvent('canvas-drag', {
				detail: {
					primitiveEvent: e,
					mouse: this.mouseLocation,
					dragstart: this.dragstart,
					keys: this.currentKeys,
					isRightClick: this.isRightClick(e)
				}
			}));
		}
		if (this.bounds.contains(this.mouseLocation)) {
			this.dispatchEvent(new CustomEvent('canvas-mousemove', {
				detail: {
					primitiveEvent: e,
					mouse: this.mouseLocation,
					keys: this.currentKeys
				}
			}));
		}
	}

	mousedown(e) {

		this.mouseLocation = this.getLocal(e);
		this.mouseButtonDown = true;

		this.dispatchEvent(new CustomEvent('canvas-mousedown', {
			detail: {
				primitiveEvent: e,
				mouse: this.mouseLocation,
				keys: this.currentKeys,
				isRightClick: this.isRightClick(e)
			}
		}));
		this.takeFocus();

	}

	mouseup(e) {
		if (this.isDragging()) {
			this.dispatchEvent(new CustomEvent('canvas-dragend', {
				detail: {
					primitiveEvent: e,
					mouse: this.mouseLocation,
					dragstart: this.dragstart,
					keys: this.currentKeys,
					isRightClick: this.isRightClick(e)
				}
			}));
			this.beNotDragging();
			this.dragEndtime = Date.now();
		}
		this.mouseButtonDown = false;
		this.dispatchEvent(new CustomEvent('canvas-mouseup', {
			detail: {
				primitiveEvent: e,
				mouse: this.mouseLocation,
				keys: this.currentKeys,
				isRightClick: this.isRightClick(e)
			}
		}));
		//this.mouseLocation = Rectangles.point.create(-1, -1);
	}

	mouseout(e) {
		if (!this.mouseButtonDown) {
			this.mouseLocation = Rectangles.point.create(-1, -1);
		}
		this.dispatchEvent(new CustomEvent('canvas-mouseout', {
			detail: {
				primitiveEvent: e,
				mouse: this.mouseLocation,
				keys: this.currentKeys
			}
		}));
	}

	wheelmoved(e) {
		if (this.isDragging() || !this.hasFocus()) {
			return;
		}
		e.preventDefault();
		this.dispatchEvent(new CustomEvent('canvas-wheelmoved', {
			detail: {
				mouse: this.mouseLocation,
				keys: this.currentKeys,
				primitiveEvent: e,
				isRightClick: this.isRightClick(e)
			}
		}));
	}

	click(e) {
		if (Date.now() - this.lastClickTime < 250) {
			//this is a double click...
			this.dblclick(e);
			return;
		}
		this.mouseLocation = this.getLocal(e);
		this.dispatchEvent(new CustomEvent('canvas-click', {
			detail: {
				primitiveEvent: e,
				mouse: this.mouseLocation,
				keys: this.currentKeys,
				isRightClick: this.isRightClick(e)
			}
		}));
		this.lastClickTime = Date.now();
	}

	release(e) {
		this.holdPulseCount = 0;
		this.mouseLocation = this.getLocal(e);
		this.dispatchEvent(new CustomEvent('canvas-release', {
			detail: {
				primitiveEvent: e,
				mouse: this.mouseLocation,
				keys: this.currentKeys
			}
		}));
	}

	flick(e) {
		if (!this.hasFocus()) {
			return;
		}
		this.mouseLocation = this.getLocal(e);
		this.dispatchEvent(new CustomEvent('canvas-flick', {
			detail: {
				primitiveEvent: e,
				mouse: this.mouseLocation,
				keys: this.currentKeys,
				isRightClick: this.isRightClick(e)
			}
		}));
	}

	trackstart(e) {
		if (!this.hasFocus()) {
			return;
		}
		this.mouseLocation = this.getLocal(e);
		this.dispatchEvent(new CustomEvent('canvas-trackstart', {
			detail: {
				mouse: this.mouseLocation,
				keys: this.currentKeys,
				primitiveEvent: e
			}
		}));
	}

	track(e) {
		if (!this.hasFocus()) {
			return;
		}
		this.mouseLocation = this.getLocal(e);
		this.dispatchEvent(new CustomEvent('canvas-track', {
			detail: {
				mouse: this.mouseLocation,
				keys: this.currentKeys,
				primitiveEvent: e
			}
		}));
	}

	trackend(e) {
		this.mouseLocation = this.getLocal(e);
		this.dispatchEvent(new CustomEvent('canvas-trackend', {
			detail: {
				mouse: this.mouseLocation,
				keys: this.currentKeys,
				primitiveEvent: e
			}
		}));
	}

	hold(e) {
		this.mouseLocation = this.getLocal(e);
		this.dispatchEvent(new CustomEvent('canvas-hold', {
			detail: {
				primitiveEvent: e,
				mouse: this.mouseLocation,
				keys: this.currentKeys,
				isRightClick: this.isRightClick(e)
			}
		}));
	}

	holdpulse(e) {
		this.mouseLocation = this.getLocal(e);
		this.dispatchEvent(new CustomEvent('canvas-holdpulse', {
			detail: {
				primitiveEvent: e,
				mouse: this.mouseLocation,
				keys: this.currentKeys,
				count: this.holdPulseCount++
			}
		}));
	}

	tap(e) {
		//this nonsense is to hold a tap if it's really a double click
		var self = this;
		var now = Date.now();
		var dif = now - this.lastDoubleClickTime;
		if (dif < 300) {
			return;
		}
		//dragend is also causing a tap
		//lets fix this here
		if (now - this.dragEndtime < 100) {
			return;
		}
		setTimeout(function() {
			self._tap(e);
		}, 180);
	}

	_tap(e) {
		//this nonsense is to hold a tap if it's really a double click
		var now = Date.now();
		var dif = now - this.lastDoubleClickTime;
		if (dif < 300) {
			return;
		}
		this.mouseLocation = this.getLocal(e);
		this.dispatchEvent(new CustomEvent('canvas-tap', {
			detail: {
				primitiveEvent: e,
				mouse: this.mouseLocation,
				keys: this.currentKeys,
				isRightClick: this.isRightClick(e)
			}
		}));
	}

	dblclick(e) {
		this.mouseLocation = this.getLocal(e);
		this.lastDoubleClickTime = Date.now();
		this.dispatchEvent(new CustomEvent('canvas-dblclick', {
			detail: {
				primitiveEvent: e,
				mouse: this.mouseLocation,
				keys: this.currentKeys,
				isRightClick: this.isRightClick(e)
			}
		}));
		//console.log('dblclick', this.currentKeys);
	}

	getCharMap() {
		return charMap;
	}

	keydown(e) {
		if (!this.hasFocus()) {
			return;
		}
		var charMap = this.getCharMap();

		//e.preventDefault();
		var keyChar = e.shiftKey ? charMap[e.keyCode][1] : charMap[e.keyCode][0];
		if (e.repeat) {
			if (this.repeatKey === keyChar) {
				this.repeatKeyCount++;
			} else {
				this.repeatKey = keyChar;
				this.repeatKeyStartTime = Date.now();
			}
		} else {
			this.repeatKey = null;
			this.repeatKeyCount = 0;
			this.repeatKeyStartTime = 0;
		}
		if (this.currentKeys.indexOf(keyChar) === -1) {
			this.currentKeys.push(keyChar);
		}
		//console.log(keyChar, e.keyCode);
		this.dispatchEvent(new CustomEvent('canvas-keydown', {
			detail: {
				primitiveEvent: e,
				alt: e.altKey,
				ctrl: e.ctrlKey,
				char: keyChar,
				code: e.charCode,
				key: e.keyCode,
				meta: e.metaKey,
				repeatCount: this.repeatKeyCount,
				repeatStartTime: this.repeatKeyStartTime,
				shift: e.shiftKey,
				identifier: e.keyIdentifier,
				currentKeys: this.currentKeys.slice(0)
			}
		}));
	}

	keyup(e) {
		var keyChar = e.shiftKey ? charMap[e.keyCode][1] : charMap[e.keyCode][0];
		this.currentKeys.splice(this.currentKeys.indexOf(keyChar), 1);
		if (!this.hasFocus()) {
			return;
		}
		this.repeatKeyCount = 0;
		this.repeatKey = null;
		this.repeatKeyStartTime = 0;
		this.dispatchEvent(new CustomEvent('canvas-keyup', {
			detail: {
				primitiveEvent: e,
				alt: e.altKey,
				ctrl: e.ctrlKey,
				char: keyChar,
				code: e.charCode,
				key: e.keyCode,
				meta: e.metaKey,
				repeat: e.repeat,
				shift: e.shiftKey,
				identifier: e.keyIdentifier,
				currentKeys: this.currentKeys.slice(0)
			}
		}));
	}



	focusgained(e) {
		this.focused = true;
		this.dispatchEvent(new CustomEvent('canvas-focus-gained', {
			detail: {
				primitiveEvent: e,
			}
		}));
	}

	focuslost(e) {
		this.focused = false;
		this.dispatchEvent(new CustomEvent('canvas-focus-lost', {
			detail: {
				primitiveEvent: e,
			}
		}));
	}

	contextmenu(e) {
		if (e.ctrlKey && this.currentKeys.indexOf('CTRL') === -1) {
			this.currentKeys.push('CTRL');
		}
		if (Date.now() - this.lastClickTime < 250) {
			//this is a double click...
			this.dblclick(e);
			return;
		}
		this.dispatchEvent(new CustomEvent('canvas-context-menu', {
			detail: {
				primitiveEvent: e,
				mouse: this.mouseLocation,
				keys: this.currentKeys,
				isRightClick: this.isRightClick(e)
			}
		}));
		this.lastClickTime = Date.now();
	}

	repaint() {
		var fps = this.getFPS();
		this.repaintNow = true;
		if (!paintLoopRunning || fps === 0) {
			this.paintNow();
		}
	}

	getMouseLocation() {
		return this.mouseLocation;
	}

	getOrigin() {
		var rect = this.getBoundingClientRect();
		var p = Rectangles.point.create(rect.left, rect.top);
		return p;
	}

	getLocal(e) {
		var rect = this.getBoundingClientRect();
		var p = Rectangles.point.create((e.x || e.clientX) - rect.left, (e.y || e.clientY) - rect.top);
		return p;
	}

	hasFocus() {
		return this.focused;
	}

	takeFocus() {
		var self = this;
		if (document.activeElement !== this.focuser) {
			setTimeout(function() {
				self.focuser.focus();
			}, 10);
		}
	}

	beDragging() {
		this.dragging = true;
		this.disableDocumentElementSelection();
	}

	beNotDragging() {
		this.dragging = false;
		this.enableDocumentElementSelection();
	}

	isDragging() {
		return this.dragging;
	}

	disableDocumentElementSelection() {
		var style = document.body.style;
		style.cssText = style.cssText + '-webkit-user-select: none';
	}

	enableDocumentElementSelection() {
		var style = document.body.style;
		style.cssText = style.cssText.replace('-webkit-user-select: none', '');
	}

	setFocusable(boolean) {
		if (boolean === true) {
			this.focuser.style.display = '';
		} else {
			this.focuser.style.display = 'none';
		}

	}

	isRightClick(e) {
		var isRightMB;
		e = e || window.event;

		if ('which' in e) { // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
			isRightMB = e.which === 3;
		} else if ('button' in e) { // IE, Opera
			isRightMB = e.button === 2;
		}
		return isRightMB;
	}

}

