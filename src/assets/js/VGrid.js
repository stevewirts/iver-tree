import Canvas from './Canvas.js';
import VGridRenderer from './VGridRenderer.js';
import ScrollBar from './ScrollBar.js';
import Rectangles from './Rectangles.js';
import SelectionModel from './SelectionModel.js';

const RIGHT_BOUNDS_OFFSET = 0;

const CONTENT = `
	<div class="scroll-bar horizontalScroller"></div>
	<div class="scroll-bar verticalScroller"></div>
	<div class="vgrid-canvas"></div>
	
	<input class="editor">`;

const globalCellEditors = {};
const noop = function() {};
let propertiesInitialized = false;

const initializeBasicCellEditors = function() {
	// initializeCellEditor('fin-hypergrid-cell-editor-textfield');
	// initializeCellEditor('fin-hypergrid-cell-editor-choice');
	// initializeCellEditor('fin-hypergrid-cell-editor-color');
	// initializeCellEditor('fin-hypergrid-cell-editor-date');
	// initializeCellEditor('fin-hypergrid-cell-editor-slider');
	// initializeCellEditor('fin-hypergrid-cell-editor-spinner');
};

const initializeCellEditor = function(name) {
	const cellEditor = document.createElement(name);
	globalCellEditors[cellEditor.alias] = cellEditor;
};

const DEFAULT_PROPERTIES = {
	//these are for the theme
	font: '13px Tahoma, Geneva, sans-serif',
	color: 'rgb(25, 25, 25)',
	backgroundColor: 'rgb(241, 241, 241)',
	foregroundSelColor: 'rgb(25, 25, 25)',
	backgroundSelColor: 'rgb(183, 219, 255)',

	topLeftFont: '12px Tahoma, Geneva, sans-serif',
	topLeftColor: 'rgb(25, 25, 25)',
	topLeftBackgroundColor: 'rgb(223, 227, 232)',
	topLeftFGSelColor: 'rgb(25, 25, 25)',
	topLeftBGSelColor: 'rgb(255, 220, 97)',

	fixedColumnFont: '12px Tahoma, Geneva, sans-serif',
	fixedColumnColor: 'rgb(25, 25, 25)',
	fixedColumnBackgroundColor: 'rgb(223, 227, 232)',
	fixedColumnFGSelColor: 'rgb(25, 25, 25)',
	fixedColumnBGSelColor: 'rgb(255, 220, 97)',

	fixedRowFont: '12px Tahoma, Geneva, sans-serif',
	fixedRowColor: 'rgb(25, 25, 25)',
	fixedRowBackgroundColor: 'rgb(223, 227, 232)',
	fixedRowFGSelColor: 'rgb(25, 25, 25)',
	fixedRowBGSelColor: 'rgb(255, 220, 97)',

	backgroundColor2: 'rgb(201, 201, 201)',
	voffset: 0,
	scrollbarHoverOver: 'visible',
	scrollbarHoverOff: 'hidden',
	scrollingEnabled: true,

	//these used to be in the constants element
	fixedRowAlign: 'center',
	fixedColAlign: 'center',
	cellPadding: 5,
	gridLinesH: true,
	gridLinesV: true,
	lineColor: 'rgb(199, 199, 199)',
	lineWidth: 0.4,

	defaultRowHeight: 20,
	defaultFixedRowHeight: 20,
	defaultColumnWidth: 100,
	defaultFixedColumnWidth: 100,

	//for immediate painting, set these values to 0, true respectively
	repaintIntervalRate: 60,
	repaintImmediately: false,

	//enable or disable double buffering
	useBitBlit: false,

	useHiDPI: true,
	editorActivationKeys: ['alt', 'esc'],
	columnAutosizing: true,
	readOnly: false,
	autoScrollAcceleration: true
};


const GLOBAL_PROPERTIES = Object.create(DEFAULT_PROPERTIES);

const clearObjectProperties = function(obj) {
	for (let prop in obj) {
		if (obj.hasOwnProperty(prop)) {
			delete obj[prop];
		}
	}
};


export default class VGrid {

	constructor(div, behavior) {
		this.viewportDiv = div;
		this.containerDiv = document.createElement('div');
		this.viewportDiv.appendChild(this.containerDiv);
		this.initContainerDiv();
		this.isWebkit = true;
		this.mouseDown = [];
		this.dragExtent = null;
		this.vScrollValue = 0;
		this.hScrollValue = 0;
		this.selectionModel = null;
		this.cellEditor = null;
		this.sbMouseIsDown = false;
		this.sbHScroller = null;
		this.sbVScroller = null;
		this.sbHScrollConfig = {};
		this.sbVScrollConfig = {};
		this.sbPrevVScrollValue = null;
		this.sbPrevHScrollValue = null;
		this.sbHValueHolder = {};
		this.sbVValueHolder = {};
		this.cellEditors = null;
		this.renderOverridesCache = {};
		this.hoverCell = null;
		this.isScrollButtonClick = false;

		behavior.installOn(this);

		if (!propertiesInitialized) {
			propertiesInitialized = true;
			initializeBasicCellEditors();
		}

		var self = this;

		this.lnfProperties = Object.create(GLOBAL_PROPERTIES);

		this.isWebkit = navigator.userAgent.toLowerCase().indexOf('webkit') > -1;
		this.selectionModel = new SelectionModel(this);
		this.cellEditors = Object.create(globalCellEditors);
		this.renderOverridesCache = {};

		//prevent the default context menu for appearing
		this.oncontextmenu = function(event) {
		};


		this.clearMouseDown();
		this.dragExtent = Rectangles.point.create(0, 0);

		//install any plugins
		// this.pluginsDo(function(each) {
		// 	if (each.installOn) {
		// 		each.installOn(self);
		// 	}
		// });

		this.numRows = 0;
		this.numColumns = 0;

		//initialize our various pieces
		this.containerDiv.innerHTML = CONTENT;
		this.createCanvas();
		this.initScrollbars();

		this.checkScrollbarVisibility();

		//Register a listener for the copy event so we can copy our selected region to the pastebuffer if conditions are right.
		document.body.addEventListener('copy', function(evt) {
			self.checkClipboardCopy(evt);
		});
		this.resized();
		// this.fire('load');
		this.isScrollButtonClick = false;


	}

	initContainerDiv() {
		const s = this.containerDiv.style;
		s.position = 'absolute';
		s.top = '0';
		s.right = '0';
		s.bottom = '0';
		s.left = '0';
		s.overflow = 'hidden';
		// s.display = 'inline-block';
		s.webkitUserSelect = 'none';
		s.mozUserSelect = 'none';
		s.msUserSelect = 'none';
		s.oUserSelect = 'none';
		s.userSelect = 'none';
		s.overflow = 'hidden'

		this.containerDiv.oncontextmenu = (e) => {
			event.preventDefault();
			this.oncontextmenu(e);
			return false;
		}
	}

	addEventListener(eventName, callback) {
		this.canvas.addEventListener(eventName, callback);
	}

	appendChild(node) {
		this.containerDiv.appendChild(node);
	}

	getBoundingClientRect() {
		return this.containerDiv.getBoundingClientRect();
	}

	checkScrollbarVisibility() {
		var hoverClassOver = this.resolveProperty('scrollbarHoverOver');
		var hoverClassOff = this.resolveProperty('scrollbarHoverOff');

		if (hoverClassOff === 'visible') {
			// this.sbHScroller.containerDiv.classList.remove(hoverClassOver);
			// this.sbVScroller.containerDiv.classList.remove(hoverClassOver);
			// this.sbHScroller.containerDiv.classList.remove(hoverClassOff);
			// this.sbVScroller.containerDiv.classList.remove(hoverClassOff);
			this.sbHScroller.containerDiv.classList.remove('visible');
			this.sbVScroller.containerDiv.classList.remove('visible');
			this.sbHScroller.containerDiv.classList.remove('hidden');
			this.sbVScroller.containerDiv.classList.remove('hidden');
			this.sbHScroller.containerDiv.classList.add('visible');
			this.sbVScroller.containerDiv.classList.add('visible');
		} else {
			this.sbHScroller.containerDiv.classList.remove('hidden');
			this.sbVScroller.containerDiv.classList.remove('hidden');
			this.sbHScroller.containerDiv.classList.remove('visible');
			this.sbVScroller.containerDiv.classList.remove('visible');
			this.sbHScroller.containerDiv.classList.add('hidden');
			this.sbVScroller.containerDiv.classList.add('hidden');			
		}
	}

	initializeCellEditor(cellEditorName) {
		initializeCellEditor(cellEditorName);
	}

	isHovered(x, y) {
		var p = this.getHoverCell();
		if (!p) {
			return false;
		}
		return p.x === x && p.y === y;
	}

	isColumnHovered(x) {
		var p = this.getHoverCell();
		if (!p) {
			return false;
		}
		return p.x === x;
	}

	isRowHovered(y) {
		var p = this.getHoverCell();
		if (!p) {
			return false;
		}
		return p.y === y;
	}

	getHoverCell() {
		return this.hoverCell;
	}

	setHoverCell(point) {
		var me = this.hoverCell;
		var fixedX = this.getFixedColumnCount();
		var fixedY = this.getFixedRowCount();
		var newPoint = Rectangles.point.create(point.x - fixedX, point.y - fixedY);
		if (me && me.equals(newPoint)) {
			return;
		}
		this.hoverCell = newPoint;
		this.fireSyntheticOnCellEnterEvent(newPoint);
		this.repaint();
	}

	addGlobalProperties(properties) {
		for (var key in properties) {
			if (properties.hasOwnProperty(key)) {
				GLOBAL_PROPERTIES[key] = properties[key];
			}
		}
		this.refreshProperties();
	}

	addProperties(properties) {
		for (var key in properties) {
			if (properties.hasOwnProperty(key)) {
				this.lnfProperties[key] = properties[key];
			}
		}
		this.refreshProperties();
	}

	refreshProperties() {
		this.refreshCanvas();
		this.checkScrollbarVisibility();
	}

	refreshCanvas() {
		const self = this;
		const fps = this.resolveProperty('repaintIntervalRate');
		const interval = fps === undefined ? 15 : fps;
		const useBitBlit = this.resolveProperty('useBitBlit') === true;
		const canvasDiv = this.containerDiv.querySelector('.vgrid-canvas');
		canvasDiv.style.position = 'absolute';
		canvasDiv.style.top = 0;
		canvasDiv.style.right = (-RIGHT_BOUNDS_OFFSET) + 'px';
		//leave room for the vertical scrollbar
		//style.marginRight = '15px';
		canvasDiv.style.bottom = 0; //'7px';
		//leave room for the horizontal scrollbar
		//style.marginBottom = '15px';
		canvasDiv.style.left = 0;

		this.renderer = new VGridRenderer(this);
		if (this.canvas) {
			this.canvas.destroy(); // free up the old one
		}
		this.canvas = new Canvas(canvasDiv, this.renderer, interval, useBitBlit);
		this.canvas.isHiDPI = function() {
			return self.isHiDPI();
		};

		this.canvas.resizeNotification = function() {
			self.resized();
		};

		this.canvas.getBoundingClientRect = function() {
			return self.viewportDiv.getBoundingClientRect();
		};
	}

	getState() {
		var state = this.getBehavior().getState();
		return state;
	}

	setState(state) {
		this.getBehavior().setState(state);
	}

	getMouseDown() {
		var last = this.mouseDown.length - 1;
		if (last < 0) {
			return null;
		}
		return this.mouseDown[last];
	}

	popMouseDown() {
		if (this.mouseDown.length === 0) {
			return;
		}
		this.mouseDown.length = this.mouseDown.length - 1;
	}

	clearMouseDown() {
		this.mouseDown = [Rectangles.point.create(-1, -1)];
		this.dragExtent = null;
	}

	setMouseDown(point) {
		this.mouseDown.push(point);
	}

	getDragExtent() {
		return this.dragExtent;
	}

	setDragExtent(point) {
		this.dragExtent = point;
	}

	pluginsDo(func) {
		var userPlugins = this.children.array();
		var pluginsTag = this.containerDiv.querySelector('plugins');

		var plugins = userPlugins;
		if (pluginsTag) {
			var systemPlugins = pluginsTag.children.array();
			plugins = systemPlugins.concat(plugins);
		}

		for (var i = 0; i < plugins.length; i++) {
			var plugin = plugins[i];
			func(plugin);
		}
	}

	getCellProvider() {
		var provider = this.getBehavior().getCellProvider();
		return provider;
	}

	gridRenderedNotification() {
		this.updateRenderedSizes();
		if (this.cellEditor) {
			this.cellEditor.gridRenderedNotification();
		}
		this.checkColumnAutosizing();
		this.fireSyntheticGridRenderedEvent();

		this.repaintFlag = false;
	}

	checkColumnAutosizing() {
		if (this.resolveProperty('columnAutosizing') === false) {
			return;
		}
		var renderer = this.getRenderer();
		var fixedColSizes = renderer.renderedFixedColumnMinWidths;
		var colSizes = renderer.renderedColumnMinWidths;
		this.getBehavior().checkColumnAutosizing(fixedColSizes, colSizes);
	}

	updateRenderedSizes() {
		var behavior = this.getBehavior();
		//add one to each of these values as we want also to include
		//the columns and rows that are partially visible
		behavior.setRenderedColumnCount(this.getViewableColumns() + 1);
		behavior.setRenderedRowCount(this.getViewableRows() + 1);
	}

	resetTextWidthCache() {
		this.getRenderer().resetTextWidthCache();
	}

	checkClipboardCopy(event) {
		if (!this.hasFocus()) {
			return;
		}
		event.preventDefault();
		var csvData = this.getSelectionAsTSV();
		event.clipboardData.setData('text/plain', csvData);
	}

	hasSelections() {
		if (!this.getSelectionModel) {
			return; // were not fully initialized yet
		}
		return this.getSelectionModel().hasSelections();
	}

	getSelectionAsTSV() {
		//only use the data from the last selection
		var selectionModel = this.getSelectionModel();
		var selections = selectionModel.getSelections();
		if (selections.length === 0) {
			return;
		}
		var last = selections[selections.length - 1];
		var area = last.area();
		//disallow if selection is too big
		if (area > 10000) {
			alert('selection size is too big to copy to the paste buffer');
			return '';
		}
		var behavior = this.getBehavior();
		var collector = [];
		var xstart = last.origin.x;
		var xstop = last.origin.x + last.extent.x + 1;
		var ystart = last.origin.y;
		var ystop = last.origin.y + last.extent.y + 1;
		for (var y = ystart; y < ystop; y++) {
			for (var x = xstart; x < xstop; x++) {
				var data = behavior._getValue(x, y);
				collector.push(data);
				if (x !== xstop - 1) {
					collector.push('\t');
				}
			}
			if (y !== ystop - 1) {
				collector.push('\n');
			}
		}
		var text = collector.join('');
		return text;
	}

	hasFocus() {
		return this.getCanvas().hasFocus();
	}

	clearSelections() {
		this.getSelectionModel().clear();
		this.clearMouseDown();
	}

	clearMostRecentSelection() {
		this.getSelectionModel().clearMostRecentSelection();
	}

	select(ox, oy, ex, ey) {
		if (ox < 0 || oy < 0) {
			//we don't select negative area
			//also this means there is no origin mouse down for a selection rect
			return;
		}
		this.getSelectionModel().select(ox, oy, ex, ey);
	}

	isSelected(x, y) {
		return this.getSelectionModel().isSelected(x, y);
	}

	isFixedRowCellSelected(col) {
		var selectionModel = this.getSelectionModel();
		var isSelected = selectionModel.isFixedRowCellSelected(col);
		return isSelected;
	}

	isFixedColumnCellSelected(row) {
		var selectionModel = this.getSelectionModel();
		var isSelected = selectionModel.isFixedColumnCellSelected(row);
		return isSelected;
	}

	getSelectionModel() {
		return this.selectionModel;
	}

	getBehavior() {
		return this.behavior;
	}

	setBehavior(newBehavior) {
		this.behavior = newBehavior;
		this.initializeBehavior();
	}

	initializeBehavior() {
		this.behavior.setGrid(this);
		this.behavior.changed = this.behaviorChanged.bind(this);
		this.behavior.shapeChanged = this.behaviorShapeChanged.bind(this);
	}

	behaviorChanged() {
		if (this.numColumns !== this.behavior._getColumnCount() || this.numRows !== this.behavior.getRowCount()) {
			this.numColumns = this.behavior._getColumnCount();
			this.numRows = this.behavior.getRowCount();
			this.behaviorShapeChanged();
		}
		this.repaint();
	}

	getBounds() {
		var canvas = this.getCanvas();
		if (canvas) {
			return canvas.getBounds();
		} else {
			return null;
		}
	}

	resolveProperty(key) {
		return this.lnfProperties[key];
	}

	behaviorShapeChanged() {
		this.synchronizeScrollingBoundries();
	}

	checkRepaint() {
		if (this.repaintFlag) {
			var now = this.resolveProperty('repaintImmediately');
			var canvas = this.getCanvas();
			if (canvas) {
				if (now === true) {
					canvas.paintNow();
				} else {
					canvas.repaint();
				}
			}
		}
	}

	repaint() {
		this.repaintFlag = true;
		this.checkRepaint();
	}

	paintNow() {
		var canvas = this.getCanvas();
		canvas.paintNow();
	}

	isHiDPI() {
		return this.resolveProperty('useHiDPI') !== false;
	}

	isAutoScrollAcceleration() {
		return this.resolveProperty('autoScrollAcceleration') !== false;
	}

	createCanvas() {

		var self = this;
		this.refreshCanvas();
		
		this.addFinEventListener('canvas-mousemove', function(e) {
			if (self.resolveProperty('readOnly')) {
				return;
			}
			var mouse = e.detail.mouse;
			var mouseEvent = self.getGridCellFromMousePoint(mouse);
			mouseEvent.primitiveEvent = e;
			self.delegateMouseMove(mouseEvent);
		});

		this.addFinEventListener('canvas-mousedown', function(e) {
			if (self.resolveProperty('readOnly')) {
				return;
			}
			self.stopEditing();
			var mouse = e.detail.mouse;
			var mouseEvent = self.getGridCellFromMousePoint(mouse);
			mouseEvent.primitiveEvent = e;
			self.delegateMouseDown(mouseEvent);
		});

		this.addFinEventListener('canvas-mouseup', function(e) {
			if (self.resolveProperty('readOnly')) {
				return;
			}
			self.dragging = false;
			if (self.isScrollingNow()) {
				self.setScrollingNow(false);
			}
			if (self.columnDragAutoScrolling) {
				self.columnDragAutoScrolling = false;
			}
			var mouse = e.detail.mouse;
			var mouseEvent = self.getGridCellFromMousePoint(mouse);
			mouseEvent.primitiveEvent = e;
			self.delegateMouseUp(mouseEvent);
		});

		this.addFinEventListener('canvas-tap', function(e) {
			if (self.resolveProperty('readOnly')) {
				return;
			}
			self.stopEditing();
			var mouse = e.detail.mouse;
			var tapEvent = self.getGridCellFromMousePoint(mouse);
			tapEvent.primitiveEvent = e;
			self.fireSyntheticClickEvent(tapEvent);
			self.delegateTap(tapEvent);
		});

		this.addFinEventListener('canvas-click', function(e) {
		    if (self.resolveProperty('readOnly')) {
		        return;
		    }
		    self.stopEditing();
		    var mouse = e.detail.mouse;
		    var mouseEvent = self.getGridCellFromMousePoint(mouse);
		    if (mouseEvent.isSynthetic) {
		    	return; // it was us whom fired it
		    }
		    mouseEvent.primitiveEvent = e;
		    // self.fireSyntheticClickEvent(mouseEvent);
			self.delegateTap(mouseEvent);
		});

		this.addFinEventListener('canvas-drag', function(e) {
			if (self.resolveProperty('readOnly')) {
				return;
			}
			self.dragging = true;
			var mouse = e.detail.mouse;
			var mouseEvent = self.getGridCellFromMousePoint(mouse);
			mouseEvent.primitiveEvent = e;
			self.delegateMouseDrag(mouseEvent);
		});

		this.addFinEventListener('canvas-keydown', function(e) {
			if (self.resolveProperty('readOnly')) {
				return;
			}
			self.fireSyntheticKeydownEvent(e);
			self.delegateKeyDown(e);
		});

		this.addFinEventListener('canvas-keyup', function(e) {
			if (self.resolveProperty('readOnly')) {
				return;
			}
			self.fireSyntheticKeyupEvent(e);
			self.delegateKeyUp(e);
		});

		this.addFinEventListener('canvas-track', function(e) {
			if (self.resolveProperty('readOnly')) {
				return;
			}
			if (self.dragging) {
				return;
			}
			var primEvent = e.detail.primitiveEvent;
			if (Math.abs(primEvent.dy) > Math.abs(primEvent.dx)) {
				if (primEvent.yDirection > 0) {
					self.scrollVBy(-2);
				} else if (primEvent.yDirection < -0) {
					self.scrollVBy(2);
				}
			} else {
				if (primEvent.xDirection > 0) {
					self.scrollHBy(-1);
				} else if (primEvent.xDirection < -0) {
					self.scrollHBy(1);
				}
			}
		});

		this.addFinEventListener('canvas-holdpulse', function(e) {
			if (self.resolveProperty('readOnly')) {
				return;
			}
			var mouse = e.detail.mouse;
			var mouseEvent = self.getGridCellFromMousePoint(mouse);
			mouseEvent.primitiveEvent = e;
			self.delegateHoldPulse(mouseEvent);
		});

		this.addFinEventListener('canvas-dblclick', function(e) {
			if (self.resolveProperty('readOnly')) {
				return;
			}
			var mouse = e.detail.mouse;
			var mouseEvent = self.getGridCellFromMousePoint(mouse);
			mouseEvent.primitiveEvent = e;
			self.fireSyntheticDoubleClickEvent(mouseEvent, e);
			self.delegateDoubleClick(mouseEvent);
		});

		this.addFinEventListener('canvas-wheelmoved', function(e) {
			var mouse = e.detail.mouse;
			var mouseEvent = self.getGridCellFromMousePoint(mouse);
			mouseEvent.primitiveEvent = e.detail.primitiveEvent;
			self.delegateWheelMoved(mouseEvent);
		});

		this.addFinEventListener('canvas-mouseout', function(e) {
			if (self.resolveProperty('readOnly')) {
				return;
			}
			var mouse = e.detail.mouse;
			var mouseEvent = self.getGridCellFromMousePoint(mouse);
			mouseEvent.primitiveEvent = e.detail.primitiveEvent;
			self.delegateMouseExit(mouseEvent);
		});

		// this.canvas.removeAttribute('tabindex');

	}

	addFinEventListener(eventName, callback) {
		this.canvas.addEventListener(eventName, callback);
	}

	setScrollingNow(isItNow) {
		this.scrollingNow = isItNow;
	}

	isScrollingNow() {
		return this.scrollingNow;
	}

	overColumnDivider(mouseEvent) {
		var x = mouseEvent.primitiveEvent.detail.mouse.x;
		var whichCol = this.getRenderer().overColumnDivider(x);
		return whichCol;
	}

	overRowDivider(mouseEvent) {
		var y = mouseEvent.primitiveEvent.detail.mouse.y;
		var which = this.getRenderer().overRowDivider(y);
		return which;
	}

	beCursor(cursorName) {
		this.containerDiv.style.cursor = cursorName;
	}

	delegateWheelMoved(event) {
		var behavior = this.getBehavior();
		behavior.onWheelMoved(this, event);
	}

	delegateMouseExit(event) {
		var behavior = this.getBehavior();
		behavior.handleMouseExit(this, event);
	}

	delegateMouseMove(mouseDetails) {
		var behavior = this.getBehavior();
		behavior.onMouseMove(this, mouseDetails);
	}

	delegateMouseDown(mouseDetails) {
		var behavior = this.getBehavior();
		behavior.handleMouseDown(this, mouseDetails);
	}

	delegateMouseUp(mouseDetails) {
		var behavior = this.getBehavior();
		behavior.onMouseUp(this, mouseDetails);
	}

	delegateTap(mouseDetails) {
		var behavior = this.getBehavior();
		behavior.onTap(this, mouseDetails);
	}

	delegateMouseDrag(mouseDetails) {
		var behavior = this.getBehavior();
		behavior.onMouseDrag(this, mouseDetails);
	}

	delegateDoubleClick(mouseDetails) {
		var behavior = this.getBehavior();
		behavior.onDoubleClick(this, mouseDetails);
	}

	delegateHoldPulse(mouseDetails) {
		var behavior = this.getBehavior();
		behavior.onHoldPulse(this, mouseDetails);
	}

	delegateKeyDown(event) {
		var behavior = this.getBehavior();
		behavior.onKeyDown(this, event);
	}

	delegateKeyUp(event) {
		var behavior = this.getBehavior();
		behavior.onKeyUp(this, event);
	}

	stopEditing() {
		if (this.cellEditor) {
			if (this.cellEditor.stopEditing) {
				this.cellEditor.stopEditing();
			}
			this.cellEditor = null;
		}
	}

	registerCellEditor(alias, cellEditor) {
		this.cellEditors[alias] = cellEditor;
	}

	getDataBounds() {
		var colDNDHackWidth = RIGHT_BOUNDS_OFFSET; //this was a hack to help with column dnd, need to factor this into a shared variable
		var behavior = this.getBehavior();
		var b = this.canvas.bounds;

		var x = behavior.getFixedColumnsWidth() + 2;
		var y = behavior.getFixedRowsHeight() + 2;

		var result = Rectangles.rectangle.create(x, y, b.origin.x + b.extent.x - x - colDNDHackWidth, b.origin.y + b.extent.y - y);
		return result;
	}

	getCanvas() {
		return this.canvas;
	}

	editAt(cellEditor, coordinates) {

		this.cellEditor = cellEditor;

		var cell = coordinates.gridCell;

		var x = cell.x;
		var y = cell.y;

		if (x < 0 || y < 0) {
			return;
		}

		var editPoint = Rectangles.point.create(x, y);
		this.setMouseDown(editPoint);
		this.setDragExtent(Rectangles.point.create(0, 0));

		if (!cellEditor.isAdded) {
			cellEditor.isAdded = true;
			this.containerDiv.appendChild(cellEditor);
		}
		cellEditor.grid = this;
		cellEditor.beginEditAt(editPoint);
	}

	isColumnVisible(columnIndex) {
		var isVisible = this.getRenderer().isColumnVisible(columnIndex);
		return isVisible;
	}

	isDataRowVisible(rowIndex) {
		var isVisible = this.getRenderer().isRowVisible(rowIndex);
		return isVisible;
	}

	isDataVisible(columnIndex, rowIndex) {
		var isVisible = this.isDataRowVisible(rowIndex) && this.isColumnVisible(columnIndex);
		return isVisible;
	}

	insureModelColIsViewable(colIndex, offsetX) {
		//-1 because we want only fully visible columns, don't include partially
		//viewable columns
		var viewableColumns = this.getViewableColumns() - 1;
		if (!this.isColumnVisible(colIndex)) {
			//the scroll position is the leftmost column
			var newSX = offsetX < 0 ? colIndex : colIndex - viewableColumns;
			this.setHScrollValue(newSX);
			return true;
		}
		return false;
	}

	insureModelRowIsViewable(rowIndex, offsetY) {
		//-1 because we want only fully visible rows, don't include partially
		//viewable rows
		var viewableRows = this.getViewableRows() - 1;
		if (!this.isDataRowVisible(rowIndex)) {
			//the scroll position is the topmost row
			var newSY = offsetY < 0 ? rowIndex : rowIndex - viewableRows;
			this.setVScrollValue(newSY);
			return true;
		}
		return false;
	}

	scrollBy(offsetX, offsetY) {
		this.scrollHBy(offsetX);
		this.scrollVBy(offsetY);
	}

	scrollVBy(offsetY) {
		var max = this.sbVScrollConfig.rangeStop;
		var oldValue = this.getVScrollValue();
		var newValue = Math.min(max, Math.max(0, oldValue + offsetY));
		if (newValue === oldValue) {
			return;
		}
		this.setVScrollValue(newValue);
	}

	scrollHBy(offsetX) {
		var max = this.sbHScrollConfig.rangeStop;
		var oldValue = this.getHScrollValue();
		var newValue = Math.min(max, Math.max(0, oldValue + offsetX));
		if (newValue === oldValue) {
			return;
		}
		this.setHScrollValue(newValue);
	}

	getGridCellFromMousePoint(mouse) {
		var cell = this.getRenderer().getGridCellFromMousePoint(mouse);
		return cell;
	}

	getBoundsOfCell(cell) {
		var bounds = this.getRenderer().getBoundsOfCell(cell);
		return bounds;
	}

	resized() {
		this.synchronizeScrollingBoundries();
	}

	cellClicked(event) {
		var cell = event.gridCell;
		var colCount = this.getColumnCount();
		var rowCount = this.getRowCount();

		//click occured in background area
		if (cell.x > colCount || cell.y > rowCount) {
			return;
		}

		var behavior = this.getBehavior();
		var hovered = this.getHoverCell();
		var sy = this.getVScrollValue();
		var x = hovered.x;
		if (hovered.x > -1) {
			x = behavior.translateColumnIndex(hovered.x + this.getHScrollValue());
		}
		if (hovered.y < 0) {
			sy = 0;
		}
		hovered = Rectangles.point.create(x, hovered.y + sy);
		this.getBehavior().cellClicked(hovered, event);
	}

	fireSyntheticKeydownEvent(keyEvent) {
		var clickEvent = new CustomEvent('keydown', {
			detail: keyEvent.detail
		});
		this.canvas.dispatchEvent(clickEvent);
	}

	fireSyntheticKeyupEvent(keyEvent) {
		var clickEvent = new CustomEvent('keyup', {
			detail: keyEvent.detail
		});
		this.canvas.dispatchEvent(clickEvent);
	}

	fireSyntheticOnCellEnterEvent(mouseEvent) {
		var detail = {
			gridCell: Rectangles.point.create(mouseEvent.x + this.getHScrollValue(), mouseEvent.y + this.getVScrollValue()),
			time: Date.now(),
			grid: this
		};
		var clickEvent = new CustomEvent('cell-enter', {
			detail: detail
		});
		this.canvas.dispatchEvent(clickEvent);
	}

	fireSyntheticOnCellExitEvent(mouseEvent) {
		var detail = {
			gridCell: Rectangles.point.create(mouseEvent.x + this.getHScrollValue(), mouseEvent.y + this.getVScrollValue()),
			time: Date.now(),
			grid: this
		};
		var clickEvent = new CustomEvent('cell-exit', {
			detail: detail
		});
		this.canvas.dispatchEvent(clickEvent);
	}

	fireSyntheticClickEvent(mouseEvent) {
		var cell = mouseEvent.gridCell;
		var fixedColCount = this.getFixedColumnCount();
		var fixedRowCount = this.getFixedRowCount();
		var x = cell.x < fixedColCount ? cell.x - fixedColCount : cell.x + this.getHScrollValue() - fixedColCount;
		var y = cell.y < fixedRowCount ? cell.y - fixedRowCount : cell.y + this.getVScrollValue() - fixedRowCount;
		var detail = {
			gridCell: Rectangles.point.create(x, y),
			mousePoint: mouseEvent.mousePoint,
			primitiveEvent: mouseEvent,
			time: Date.now(),
			grid: this
		};
		this.getBehavior().enhanceDoubleClickEvent(detail);
		var clickEvent = new CustomEvent('click', {
			detail: detail
		});
		this.canvas.dispatchEvent(clickEvent);
	}

	fireSyntheticDoubleClickEvent(mouseEvent) {
		var cell = mouseEvent.gridCell;
		var behavior = this.getBehavior();
		var fixedColCount = this.getFixedColumnCount();
		var fixedRowCount = this.getFixedRowCount();
		var x = cell.x < fixedColCount ? cell.x - fixedColCount : cell.x + this.getHScrollValue() - fixedColCount;
		var y = cell.y < fixedRowCount ? cell.y - fixedRowCount : cell.y + this.getVScrollValue() - fixedRowCount;
		var detail = {
			gridCell: Rectangles.point.create(x, y),
			mousePoint: mouseEvent.mousePoint,
			time: Date.now(),
			grid: this
		};
		behavior.enhanceDoubleClickEvent(mouseEvent);
		var clickEvent = new CustomEvent('double-click', {
			detail: detail
		});
		behavior.cellDoubleClicked(cell, mouseEvent);
		this.canvas.dispatchEvent(clickEvent);
	}

	fireSyntheticGridRenderedEvent() {
		var event = new CustomEvent('grid-rendered', {
			detail: {
				source: this,
				time: Date.now()
			}
		});
		if (this.canvas) {
			this.canvas.dispatchEvent(event);
		}
	}

	fireScrollEvent(type, oldValue, newValue) {
		var event = new CustomEvent(type, {
			detail: {
				oldValue: oldValue,
				value: newValue,
				time: Date.now()
			}
		});
		this.canvas.dispatchEvent(event);

		//make the scrollbars show up
		var self = this;
		self.lastScrollTime = Date.now();
		var hoverClassOver = self.resolveProperty('scrollbarHoverOver');
		var hoverClassOff = self.resolveProperty('scrollbarHoverOff');
		if (!self.resolveProperty('scrollingEnabled')) {
			hoverClassOver = 'hidden';
			hoverClassOff = 'hidden';
		}
		if (type === 'scroll-x') {
			self.sbHScroller.containerDiv.classList.remove(hoverClassOff);
			self.sbHScroller.containerDiv.classList.add(hoverClassOver);
			setTimeout(function() {
				if (!self.sbMouseIsDown && !self.scrollBarHasMouse && Date.now() - self.lastScrollTime > 100) {
					self.sbHScroller.containerDiv.classList.remove(hoverClassOver);
					self.sbHScroller.containerDiv.classList.add(hoverClassOff);
				}
			}, 700);
		} else {
			self.sbVScroller.containerDiv.classList.remove(hoverClassOff);
			self.sbVScroller.containerDiv.classList.add(hoverClassOver);
			setTimeout(function() {
				if (!self.sbMouseIsDown && !self.scrollBarHasMouse && Date.now() - self.lastScrollTime > 100) {
					self.sbVScroller.containerDiv.classList.remove(hoverClassOver);
					self.sbVScroller.containerDiv.classList.add(hoverClassOff);
				}
			}, 700);
		}
	}

	setVScrollValue(y) {
		var max = this.sbVScrollConfig.rangeStop;
		y = Math.min(max, Math.max(0, y));
		var self = this;
		if (y === this.vScrollValue) {
			return;
		}
		this.getBehavior()._setScrollPositionY(y);
		var oldY = this.vScrollValue;
		this.vScrollValue = y;
		this.scrollValueChangedNotification();
		setTimeout(function() {
			self.sbVRangeAdapter.subjectChanged();
			self.fireScrollEvent('scroll-y', oldY, y);
		});
	}

	getVScrollValue() {
		return this.vScrollValue;
	}

	setHScrollValue(x) {
		var max = this.sbHScrollConfig.rangeStop;
		x = Math.min(max, Math.max(0, x));
		var self = this;
		if (x === this.hScrollValue) {
			return;
		}
		this.getBehavior()._setScrollPositionX(x);
		var oldX = this.hScrollValue;
		this.hScrollValue = x;
		this.scrollValueChangedNotification();
		setTimeout(function() {
			self.sbHRangeAdapter.subjectChanged();
			self.fireScrollEvent('scroll-x', oldX, x);
		});
	}

	getHScrollValue() {
		return this.hScrollValue;
	}

	takeFocus() {
		if (this.isEditing()) {
			this.editorTakeFocus();
		} else {
			this.getCanvas().takeFocus();
		}
	}

	editorTakeFocus() {
		if (this.cellEditor) {
			return this.cellEditor.takeFocus();
		}
	}

	isEditing() {
		if (this.cellEditor) {
			return this.cellEditor.isEditing;
		}
		return false;
	}

	initScrollbars() {

		var self = this;

		const hsbDiv = this.containerDiv.querySelector('.horizontalScroller');
		const vsbDiv = this.containerDiv.querySelector('.verticalScroller');
		this.sbHScroller = new ScrollBar(hsbDiv, true);
		this.sbVScroller = new ScrollBar(vsbDiv, false);

		this.sbHScroller.onUpClick = function() {
			self.scrollHBy(1);
			self.isScrollButtonClick = true;
		};

		this.sbHScroller.onDownClick = function() {
			self.scrollHBy(-1);
			self.isScrollButtonClick = true;
		};

		this.sbHScroller.onUpHold = function(event) {
			event.preventTap();
			self.scrollHBy(1);
			self.isScrollButtonClick = true;
		};

		this.sbHScroller.onDownHold = function(event) {
			event.preventTap();
			self.scrollHBy(-1);
			self.isScrollButtonClick = true;
		};


		this.sbVScroller.onUpClick = function() {
			self.scrollVBy(-1);
			self.isScrollButtonClick = true;
		};

		this.sbVScroller.onDownClick = function() {
			self.scrollVBy(1);
			self.isScrollButtonClick = true;
		};

		this.sbVScroller.onUpHold = function(event) {
			event.preventTap();
			self.scrollVBy(-1);
			self.isScrollButtonClick = true;
		};

		this.sbVScroller.onDownHold = function(event) {
			event.preventTap();
			self.scrollVBy(1);
			self.isScrollButtonClick = true;
		};

		this.addEventListener('mousedown', function() {
			self.sbMouseIsDown = true;
		});

		// document.addEventListener('mouseup', function(e) {
		// 	noop(e);
		// 	if (!self.sbMouseIsDown) {
		// 		return;
		// 	}
		// 	self.sbMouseIsDown = false;
		// 	self.takeFocus();
		// 	var x = e.x || e.clientX;
		// 	var y = e.y || e.clientY;
		// 	// var elementAt = self.containerDiv.elementFromPoint(x, y);
		// 	var elementAt = document.elementFromPoint(x, y);
		// 	self.scrollBarHasMouse = (elementAt === self.sbVScroller || elementAt === self.sbHScroller);
		// 	if (!self.scrollBarHasMouse) {
		// 		var hoverClassOver = self.resolveProperty('scrollbarHoverOver');
		// 		var hoverClassOff = self.resolveProperty('scrollbarHoverOff');
		// 		if (!self.resolveProperty('scrollingEnabled')) {
		// 			hoverClassOver = 'hidden';
		// 			hoverClassOff = 'hidden';
		// 		}
		// 		self.sbVScroller.containerDiv.classList.remove(hoverClassOver);
		// 		self.sbHScroller.containerDiv.classList.remove(hoverClassOver);
		// 		self.sbVScroller.containerDiv.classList.add(hoverClassOff);
		// 		self.sbHScroller.containerDiv.classList.add(hoverClassOff);
		// 	}
		// });

		this.sbHValueHolder = {
			changed: false,
			getValue() {
				return self.getHScrollValue();
			},
			setValue(v) {
				self.setHScrollValue(v);
			}
		};

		this.sbVValueHolder = {
			changed: false,
			getValue() {
				return self.getVScrollValue();
			},
			setValue(v) {
				self.setVScrollValue(v);
			}
		};

		this.sbHScrollConfig = {
			step: 1,
			page: 40,
			rangeStart: 0,
			rangeStop: 0

		};

		this.sbVScrollConfig = {
			step: 1,
			page: 40,
			rangeStart: 0,
			rangeStop: 0
		};

		this.sbHRangeAdapter = this.sbHScroller.createRangeAdapter(this.sbHValueHolder, this.sbHScrollConfig);
		this.sbVRangeAdapter = this.sbHScroller.createRangeAdapter(this.sbVValueHolder, this.sbVScrollConfig);

		this.sbHScroller.setRangeAdapter(this.sbHRangeAdapter);
		this.sbVScroller.setRangeAdapter(this.sbVRangeAdapter);

	}

	scrollValueChangedNotification() {

		if (this.hScrollValue === this.sbPrevHScrollValue && this.vScrollValue === this.sbPrevVScrollValue) {
			return;
		}

		this.sbHValueHolder.changed = !this.sbHValueHolder.changed;
		this.sbVValueHolder.changed = !this.sbVValueHolder.changed;

		this.sbPrevHScrollValue = this.hScrollValue;
		this.sbPrevVScrollValue = this.vScrollValue;

		if (this.cellEditor) {
			this.cellEditor.scrollValueChangedNotification();
		}
	}

	getValue(x, y) {
		return this.getBehavior()._getValue(x, y);
	}

	setValue(x, y, value) {
		this.getBehavior()._setValue(x, y, value);
	}

	synchronizeScrollingBoundries() {

		var behavior = this.getBehavior();
		if (!behavior) {
			return;
		}
		var numColumns = behavior._getColumnCount();
		var numRows = behavior.getRowCount();
		var bounds = this.getBounds();
		if (!bounds) {
			return;
		}
		var scrollableHeight = bounds.height() - behavior.getFixedRowsHeight();
		var scrollableWidth = bounds.width() - behavior.getFixedColumnsMaxWidth() - RIGHT_BOUNDS_OFFSET;

		var lastPageColumnCount = 0;
		var columnsWidth = 0;
		for (; lastPageColumnCount < numColumns; lastPageColumnCount++) {
			var eachWidth = behavior._getColumnWidth(numColumns - lastPageColumnCount - 1);
			columnsWidth = columnsWidth + eachWidth;
			if (columnsWidth > scrollableWidth) {
				break;
			}
		}

		var lastPageRowCount = 0;
		var rowsHeight = 0;
		for (; lastPageRowCount < numRows; lastPageRowCount++) {
			var eachHeight = behavior.getRowHeight(numRows - lastPageRowCount - 1);
			rowsHeight = rowsHeight + eachHeight;
			if (rowsHeight > scrollableHeight) {
				break;
			}
		}

		this.sbVScrollConfig.rangeStop = behavior.getRowCount() - lastPageRowCount;

		this.sbHScrollConfig.rangeStop = behavior._getColumnCount() - lastPageColumnCount;

		this.setVScrollValue(Math.min(this.getVScrollValue(), this.sbVScrollConfig.rangeStop));
		this.setHScrollValue(Math.min(this.getHScrollValue(), this.sbHScrollConfig.rangeStop));

		this.repaint();
		//this.sbVScroller.tickle();
		//this.sbHScroller.tickle();
	}

	getViewableRows() {
		return this.getRenderer().getViewableRows();
	}

	getViewableColumns() {
		return this.getRenderer().getViewableColumns();
	}

	getRenderer() {
		return this.renderer;
	}

	getColumnWidth(columnIndex) {
		return this.getBehavior()._getColumnWidth(columnIndex);
	}

	setColumnWidth(columnIndex, columnWidth) {
		this.getBehavior()._setColumnWidth(columnIndex, columnWidth);
	}

	getFixedColumnWidth(columnIndex) {
		return this.getBehavior().getFixedColumnWidth(columnIndex);
	}

	getFixedColumnsWidth() {
		return this.getBehavior().getFixedColumnsWidth();
	}

	setFixedColumnWidth(columnIndex, columnWidth) {
		this.getBehavior().setFixedColumnWidth(columnIndex, columnWidth);
	}

	getRowHeight(rowIndex) {
		return this.getBehavior().getRowHeight(rowIndex);
	}

	setRowHeight(rowIndex, rowHeight) {
		this.getBehavior().setRowHeight(rowIndex, rowHeight);
	}

	getFixedRowHeight(rowIndex) {
		return this.getBehavior().getFixedRowHeight(rowIndex);
	}

	setFixedRowHeight(rowIndex, rowHeight) {
		this.getBehavior().setFixedRowHeight(rowIndex, rowHeight);
	}

	getFixedRowsHeight() {
		return this.getBehavior().getFixedRowsHeight();
	}

	getColumnCount() {
		return this.getBehavior()._getColumnCount();
	}

	getRowCount() {
		return this.getBehavior().getRowCount();
	}

	getFixedColumnCount() {
		return this.getBehavior().getFixedColumnCount();
	}

	getFixedRowCount() {
		return this.getBehavior().getFixedRowCount();
	}

	topLeftClicked(mouse) {
		this.getBehavior().topLeftClicked(this, mouse);
	}

	fixedRowClicked(mouse) {
		this.getBehavior()._fixedRowClicked(this, mouse);
	}

	fixedColumnClicked(mouse) {
		this.getBehavior()._fixedColumnClicked(this, mouse);
	}

	_activateEditor(event) {
		var gridCell = event.gridCell;
		this.activateEditor(gridCell.x, gridCell.y);
	}

	activateEditor(x, y) {
		var editor = this.getCellEditorAt(x, y);
		if (editor) {
			event.gridCell = {
				x: x,
				y: y
			};
			this.editAt(editor, event);
		}
	}

	getCellEditorAt(x, y) {
		return this.getBehavior()._getCellEditorAt(x, y);
	}

	toggleHiDPI() {
		if (this.canvas.isHiDPI()) {
			this.removeAttribute('hidpi');
		} else {
			this.setAttribute('hidpi', null);
		}
		this.canvas.resize();
	}

	getHiDPI(ctx) {
		if (window.devicePixelRatio && this.canvas.isHiDPI()) {
			var devicePixelRatio = window.devicePixelRatio || 1;
			var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
				ctx.mozBackingStorePixelRatio ||
				ctx.msBackingStorePixelRatio ||
				ctx.oBackingStorePixelRatio ||
				ctx.backingStorePixelRatio || 1;

			var ratio = devicePixelRatio / backingStoreRatio;
			return ratio;
		} else {
			return 1;
		}
	}

	getRenderedWidth(colIndex) {
		return this.renderer.getRenderedWidth(colIndex);
	}

	getRenderedHeight(rowIndex) {
		return this.renderer.getRenderedHeight(rowIndex);
	}

	resolveCellEditor(name) {
		return this.cellEditors[name];
	}

	updateCursor() {
		var behavior = this.getBehavior();
		var cursor = behavior.getCursorAt(-1, -1);
		var hoverCell = this.getHoverCell();
		if (hoverCell && hoverCell.x > -1 && hoverCell.y > -1) {
			var x = hoverCell.x + this.getHScrollValue();
			x = behavior.translateColumnIndex(x);
			cursor = behavior.getCursorAt(x, hoverCell.y + this.getVScrollValue());
		}
		this.beCursor(cursor);
	}

	repaintCell(x, y) {
		this.getRenderer().repaintCell(x, y);
	}

	isDraggingColumn() {
		if (this.renderOverridesCache.dragger) {
			return true;
		} else {
			return false;
		}
	}

	pageUp() {
		var rowNum = this.getRenderer().getPageUpRow();
		this.setVScrollValue(rowNum);
	}

	pageDown() {
		var rowNum = this.getRenderer().getPageDownRow();
		this.setVScrollValue(rowNum);
	}

	pageLeft() {
		console.log('page left');
	}

	pageRight() {
		console.log('page right');
	}

	getRenderedData() {
		// assumes one row of headers
		var behavior = this.getBehavior();
		var renderer = this.getRenderer();
		var colCount = this.getColumnCount();
		var rowCount = renderer.getViewableRows();
		var headers = [];
		var result = [];
		var r, c;
		for (c = 0; c < colCount; c++) {
			headers[c] = behavior.getColumnId(c, 0);
		}
		for (r = 0; r < rowCount; r++) {
			var row = {};
			row.hierarchy = behavior.getFixedColumnValue(0, r);
			for (c = 0; c < colCount; c++) {
				var field = headers[c];
				row[field] = behavior.getValue(c, r);
			}
			result[r] = row;
		}
		return result;
	}

	selectionChanged() {
		var event = new CustomEvent('selection-changed', {
			detail: {
				time: Date.now()
			}
		});
		this.canvas.dispatchEvent(event);
	}

	getSelectedRow() {
		var sels = this.getSelectionModel().getSelections();
		if (sels.length < 1) {
			return;
		}
		var behavior = this.getBehavior();
		var colCount = this.getColumnCount();
		var headers = [];
		var topRow = sels[0].origin.y;
		var c;
		for (c = 0; c < colCount; c++) {
			headers[c] = behavior.getColumnId(c, 0);
		}
		var row = {};
		row.hierarchy = behavior.getFixedColumnValue(0, topRow);
		for (c = 0; c < colCount; c++) {
			var field = headers[c];
			row[field] = behavior.getValue(c, topRow);
		}
		return row;
	}

	fireBeforeCellEdit(cell, value) {
		var clickEvent = new CustomEvent('before-cell-edit', {
			detail: {
				value: value,
				gridCell: cell,
				time: Date.now()
			}
		});
		var proceed = this.canvas.dispatchEvent(clickEvent);
		return proceed; //I wasn't cancelled
	}

	fireAfterCellEdit(cell, oldValue, newValue) {
		var clickEvent = new CustomEvent('after-cell-edit', {
			detail: {
				newValue: newValue,
				oldValue: oldValue,
				gridCell: cell,
				time: Date.now()
			}
		});
		this.canvas.dispatchEvent(clickEvent);
	}

	autosizeColumn(colIndex) {
		var width, currentWidth;
		if (colIndex < 0) {
			var numFixedCols = this.getFixedColumnCount();
			colIndex = colIndex + numFixedCols;
			currentWidth = this.getFixedColumnWidth(colIndex);
			width = this.getRenderer().renderedFixedColumnMinWidths[colIndex];
			this.setFixedColumnWidth(colIndex, Math.max(width, currentWidth));
		} else {
			width = this.getRenderer().renderedColumnMinWidths[colIndex];
			this.setColumnWidth(colIndex, width);
		}
	}

	setFocusable(boolean) {
		this.getCanvas().setFocusable(boolean);
	}

	getVisibleColumns() {
		return this.getRenderer().getVisibleColumns();
	}

	updateSize() {
		this.canvas.checksize();
	}

	getVisibleRows() {
		return this.getRenderer().getVisibleRows();
	}

	stopPaintThread() {
		this.canvas.stopPaintThread();
	}

	stopResizeThread() {
		this.canvas.stopResizeThread();
	}

	restartResizeThread() {
		this.canvas.restartResizeThread();
	}

	restartPaintThread() {
		this.canvas.restartPaintThread();
	}

	getFieldName(index) {
		return this.getBehavior().getFieldName(index);
	}

	getColumnIndex(fieldName) {
		return this.getBehavior().getColumnIndex(fieldName);
	}

	startAnimator() {
		var animate;
		var self = this;
		animate = function() {
			self.animate();
			requestAnimationFrame(animate);
		};
		requestAnimationFrame(animate);
	}

	animate() {
		var ctx = this.getCanvas().canvasCTX;
		ctx.beginPath();
		ctx.save();
		this.renderFocusCell(ctx);
		ctx.restore();
		ctx.closePath();
	}

}



// this.behavior = {
// 	setScrollPositionY: noop,
// 	setScrollPositionX: noop,
// 	getColumnCount() {
// 		return 0;
// 	},
// 	getFixedColumnCount() {
// 		return 0;
// 	},
// 	getFixedColumnsWidth() {
// 		return 0;
// 	},
// 	getFixedColumnsMaxWidth() {
// 		return 0;
// 	},
// 	setRenderedWidth() {
// 		return 0;
// 	},
// 	getRowCount() {
// 		return 0;
// 	},
// 	getFixedRowCount() {
// 		return 0;
// 	},
// 	getFixedRowsHeight() {
// 		return 0;
// 	},
// 	getFixedRowsMaxHeight() {
// 		return 0;
// 	},
// 	setRenderedHeight() {
// 		return 0;
// 	},
// 	getCellProvider: noop,
// 	click: noop,
// 	doubleClick: noop
// };