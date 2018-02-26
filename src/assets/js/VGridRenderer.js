import CanvasComponent from './CanvasComponent.js';
import SimpleLRU from './SimpleLRU.js';
import Rectangles from './Rectangles.js';
// <polymer-element name="fin-hypergrid-renderer" extends="fin-canvas-component" assetpath="/components/fin-hypergrid/polymer/html/">
//   <template>
//     <style type="text/css">:host {
//     display: block;
//     position: relative;
// }
// </style>
//   </template>
//   <script>

const noop = function() {};
const fontData = {};
const RIGHT_BOUNDS_OFFSET = 0;
let textWidthCache = new SimpleLRU(4000);

const FOCUSLINESTEP = [
	[5, 5],
	[0, 1, 5, 4],
	[0, 2, 5, 3],
	[0, 3, 5, 2],
	[0, 4, 5, 1],
	[0, 5, 5, 0],
	[1, 5, 4, 0],
	[2, 5, 3, 0],
	[3, 5, 2, 0],
	[4, 5, 1, 0]
];

const config = {
	getTextWidth: function(gc, string) {
		if (string === null || string === undefined) {
			return 0;
		}
		string = string + '';
		if (string.length === 0) {
			return 0;
		}
		var key = gc.font + string;
		var width = textWidthCache.get(key);
		if (!width) {
			width = gc.measureText(string).width;
			textWidthCache.set(key, width);
		}
		return width;
	},

	getTextHeight: function(font) {

		var result = fontData[font];
		if (result) {
			return result;
		}
		result = {};
		var text = document.createElement('span');
		text.textContent = 'Hg';
		text.style.font = font;

		var block = document.createElement('div');
		block.style.display = 'inline-block';
		block.style.width = '1px';
		block.style.height = '0px';

		var div = document.createElement('div');
		div.appendChild(text);
		div.appendChild(block);

		div.style.position = 'absolute';
		document.body.appendChild(div);

		try {

			block.style.verticalAlign = 'baseline';

			var blockRect = block.getBoundingClientRect();
			var textRect = text.getBoundingClientRect();

			result.ascent = blockRect.top - textRect.top;

			block.style.verticalAlign = 'bottom';
			result.height = blockRect.top - textRect.top;

			result.descent = result.height - result.ascent;

		} finally {
			document.body.removeChild(div);
		}
		if (result.height !== 0) {
			fontData[font] = result;
		}
		return result;
	}
};

var cellConfig = function(x, y, value, fgColor, bgColor, fgSelColor, bgSelColor, font, isSelected, isColumnHovered, isRowHovered, halign, hoffset, voffset, properties) {
	config.x = x;
	config.y = y;
	config.value = value;
	config.fgColor = fgColor;
	config.bgColor = undefined;
	config.fgSelColor = fgSelColor;
	config.bgSelColor = bgSelColor;
	config.font = font;
	config.isSelected = isSelected;
	config.isColumnHovered = isColumnHovered || false;
	config.isRowHovered = isRowHovered || false;
	config.halign = halign || 'center';
	config.hoffset = hoffset;
	config.voffset = voffset;
	config.properties = properties;
	return config;
};

export default class VGridRenderer extends CanvasComponent { 

	constructor(grid) {
		super();
		this.grid = grid;
		this.extraRenderers = [];
		this.renderedColumnWidths = [0];
		this.renderedColumnMinWidths = [];
		this.renderedFixedColumnMinWidths = [];
		this.renderedHeight = 0;
		this.renderedRowHeights = [0];
		this.renderedColumns = [];
		this.renderedRows = [];
		this.insertionBounds = []; // this is the midpoint of each column, used
	}

	resolveProperty(key) {
		return this.grid.resolveProperty(key);
	}

	cellConfig(x, y, value, fgColor, bgColor, fgSelColor, bgSelColor, font, isSelected, isColumnHovered, isRowHovered, halign, hoffset, voffset) {
		var config = cellConfig(x, y, value, fgColor, bgColor, fgSelColor, bgSelColor, font, isSelected, isColumnHovered, isRowHovered, halign, hoffset, voffset, this.grid.lnfProperties);
		return config;
	}

	getGrid() {
		return this.grid;
	}

	setGrid(grid) {
		this.grid = grid;
	}

	paint(gc) {
		if (!this.grid) {
			return;
		}
		this.renderGrid(gc);
		this.getGrid().gridRenderedNotification();
	}

	getViewableRows() {
		return this.renderedRows.length;
	}

	getVisibleRows() {
		return this.renderedRows;
	}

	getViewableColumns() {
		return this.renderedColumns.length;
	}

	getVisibleColumns() {
		return this.renderedColumns;
	}

	overColumnDivider(x) {
		x = Math.round(x);
		var whichCol = this.renderedColumnWidths.indexOf(x - 1);
		if (whichCol < 0) {
			whichCol = this.renderedColumnWidths.indexOf(x);
		}
		if (whichCol < 0) {
			whichCol = this.renderedColumnWidths.indexOf(x - 2);
		}
		if (whichCol < 0) {
			whichCol = this.renderedColumnWidths.indexOf(x + 1);
		}
		if (whichCol < 0) {
			whichCol = this.renderedColumnWidths.indexOf(x - 3);
		}

		return whichCol;
	}

	overRowDivider(y) {
		y = Math.round(y);
		var which = this.renderedRowHeights.indexOf(y + 1);
		if (which < 0) {
			which = this.renderedRowHeights.indexOf(y);
		}
		if (which < 0) {
			which = this.renderedRowHeights.indexOf(y - 1);
		}
		return which;
	}

	getBoundsOfCell(cell) {
		return this._getBoundsOfCell(cell.x, cell.y);
	}

	_getBoundsOfCell(x, y) {
		var ox = this.renderedColumnWidths[x],
			oy = this.renderedRowHeights[y],
			cx = this.renderedColumnWidths[x + 1],
			cy = this.renderedRowHeights[y + 1],
			ex = cx - ox,
			ey = cy - oy;

		var bounds = Rectangles.rectangle.create(ox, oy, ex, ey);

		return bounds;
	}

	getColumnFromPixelX(pixelX) {
		pixelX = pixelX - this.getBehavior().getFixedColumnsWidth();
		var width = 0;
		var c;
		for (c = 0; c < this.insertionBounds.length; c++) {
			width = this.insertionBounds[c];
			if (pixelX < width) {
				return c;
			}
		}
		return c;
	}

	getGridCellFromMousePoint(point) {

		var width = 0;
		var height = 0;
		var x, y;
		var c, r;
		var previous = 0;
		for (c = 1; c < this.renderedColumnWidths.length; c++) {
			width = this.renderedColumnWidths[c];
			if (point.x < width) {
				x = Math.max(0, point.x - previous - 2);
				break;
			}
			previous = width;
		}
		c--;
		previous = 0;
		for (r = 1; r < this.renderedRowHeights.length; r++) {
			height = this.renderedRowHeights[r];
			if (point.y < height) {
				y = Math.max(0, point.y - previous - 2);
				break;
			}
			previous = height;
		}
		r--;
		if (point.x < 0) {
			c = -1;
		}
		if (point.y < 0) {
			r = -1;
		}
		return {
			gridCell: Rectangles.point.create(c, r),
			mousePoint: Rectangles.point.create(x, y)
		};
	}

	isColumnVisible(colIndex) {
		var isVisible = this.renderedColumns.indexOf(colIndex) !== -1;
		return isVisible;
	}

	getFinalVisableColumnBoundry() {
		var isMaxX = this.isLastColumnVisible();
		var chop = isMaxX ? 2 : 1;
		var colWall = this.renderedColumnWidths[this.renderedColumnWidths.length - chop];
		var result = Math.min(colWall, this.getBounds().width() - RIGHT_BOUNDS_OFFSET);
		return result;
	}

	isRowVisible(rowIndex) {
		var isVisible = this.renderedRows.indexOf(rowIndex) !== -1;
		return isVisible;
	}

	isSelected(x, y) {
		return this.getGrid().isSelected(x, y);
	}

	renderGrid(gc) {
		var offsetX = this.getBehavior().getFixedColumnsWidth();
		var offsetY = this.getBehavior().getFixedRowsHeight();

		gc.beginPath();
		this.paintTopLeft(gc, offsetX, offsetY);
		this.paintHeaders(gc, 0, 0);
		this.paintCells(gc, offsetX, offsetY);
		this.paintGridlines(gc, offsetX, offsetY);
		this.blankOutOverflow(gc);
		this.extraRenderering(gc);
		this.renderOverrides(gc);
		gc.closePath();
	}
	
	renderFocusCell(gc) {
		gc.beginPath();
		this._renderFocusCell(gc);
		gc.closePath();
	}

	_renderFocusCell(gc) {
		var grid = this.getGrid();
		var selections = grid.getSelectionModel().getSelections();
		if (!selections || selections.length === 0) {
			return;
		}
		var selection = selections[selections.length - 1];
		var mouseDown = selection.origin;
		if (mouseDown.x === -1) {
			//no selected area, lets exit
			return;
		}

		var visibleColumns = this.getVisibleColumns();
		var visibleRows = this.getVisibleRows();
		var fixedColCount = grid.getFixedColumnCount();
		var fixedRowCount = grid.getFixedRowCount();
		var lastVisibleColumn = visibleColumns[visibleColumns.length - 1];
		var lastVisibleRow = visibleRows[visibleRows.length - 1];
		var scrollX = grid.getHScrollValue();
		var scrollY = grid.getVScrollValue();

		var extent = selection.extent;

		var dpOX = Math.min(mouseDown.x, mouseDown.x + extent.x) + fixedColCount;
		var dpOY = Math.min(mouseDown.y, mouseDown.y + extent.y) + fixedRowCount;

		//lets check if our selection rectangle is scrolled outside of the visible area
		if (dpOX > lastVisibleColumn) {
			return; //the top of our rectangle is below visible
		}
		if (dpOY > lastVisibleRow) {
			return; //the left of our rectangle is to the right of being visible
		}

		var dpEX = Math.max(mouseDown.x, mouseDown.x + extent.x);
		dpEX = Math.min(dpEX, 1 + lastVisibleColumn) + 2;

		var dpEY = Math.max(mouseDown.y, mouseDown.y + extent.y);
		dpEY = Math.min(dpEY, 1 + lastVisibleRow) + 2;

		var o = this._getBoundsOfCell(dpOX - scrollX, dpOY - scrollY).origin;
		var ox = Math.round((o.x === undefined) ? grid.getFixedColumnsWidth() : o.x);
		var oy = Math.round((o.y === undefined) ? grid.getFixedRowsHeight() : o.y);
		// var ow = o.width;
		// var oh = o.height;
		var e = this._getBoundsOfCell(dpEX - scrollX, dpEY - scrollY).origin;
		var ex = Math.round((e.x === undefined) ? grid.getFixedColumnsWidth() : e.x);
		var ey = Math.round((e.y === undefined) ? grid.getFixedRowsHeight() : e.y);
		// var ew = e.width;
		// var eh = e.height;
		var x = Math.min(ox, ex);
		var y = Math.min(oy, ey);
		var width = 1 + ex - ox;
		var height = 1 + ey - oy;
		if (x === ex) {
			width = ox - ex;
		}
		if (y === ey) {
			height = oy - ey;
		}
		if (width * height < 1) {
			//if we are only a skinny line, don't render anything
			return;
		}

		gc.rect(x, y, width, height);
		// gc.fillStyle = 'rgba(0, 0, 0, 0.2)';
		// gc.fill();
		gc.lineWidth = 1;
		gc.strokeStyle = 'black';

		// animate the dashed line a bit here for fun

		gc.stroke();

		gc.rect(x, y, width, height);

		gc.strokeStyle = 'white';

		// animate the dashed line a bit here for fun
		gc.setLineDash(FOCUSLINESTEP[Math.floor(10 * (Date.now() / 300 % 1)) % FOCUSLINESTEP.length]);

		gc.stroke();
	}

	startAnimator() {
		var animate;
		var self = this;
		animate = function() {
			var ctx = self.getCanvas().canvasCTX;
			self.extraRenderering(ctx);
			requestAnimationFrame(animate);
		};
		requestAnimationFrame(animate);
	}

	extraRenderering(ctx) {
		var er = this.extraRenderers;

		for (var i = 0; i < er.length; i++) {
			var r = er[i];
			ctx.beginPath();
			ctx.save();
			r.apply(this, [ctx]);
			ctx.restore();
			ctx.closePath();
		}
	}

	resetTextWidthCache() {
		textWidthCache = new SimpleLRU(10000);
	}

	blankOutOverflow(gc) {
		var isMaxX = this.isLastColumnVisible();
		var chop = isMaxX ? 2 : 1;
		var x = this.renderedColumnWidths[this.renderedColumnWidths.length - chop];
		var bounds = this.getGrid().getBoundingClientRect();
		var width = bounds.width - x;
		var height = bounds.height;
		gc.fillStyle = this.resolveProperty('backgroundColor2');
		gc.fillRect(x, 0, width, height);
	}

	renderOverrides(gc) {
		var grid = this.getGrid();
		var cache = grid.renderOverridesCache;
		for (var key in cache) {
			if (cache.hasOwnProperty(key)) {
				var override = cache[key];
				if (override) {
					this.renderOverride(gc, override);
				}
			}
		}
	}

	renderOverride(gc, override) {
		//lets blank out the drag row
		var behavior = this.getBehavior();
		var columnStarts = this.renderedColumnWidths;
		var fixedColCount = behavior.getFixedColumnCount();
		var hdpiRatio = override.hdpiratio;
		var startX = hdpiRatio * columnStarts[override.columnIndex + fixedColCount];
		var width = override.width;
		var height = override.height;
		var targetCTX = override.ctx;
		var imgData = gc.getImageData(startX, 0, width * hdpiRatio, height * hdpiRatio);
		targetCTX.putImageData(imgData, 0, 0);
		gc.fillStyle = this.resolveProperty('backgroundColor2');
		gc.fillRect(Math.round(startX / hdpiRatio), 0, width, height);

	}

	paintGridlines(gc, offsetX, offsetY) {

		var drawThemH = this.resolveProperty('gridLinesH');
		var drawThemV = this.resolveProperty('gridLinesV');

		var behavior = this.getBehavior();
		var lineColor = this.resolveProperty('lineColor');

		var numColumns = this.getColumnCount();
		var numRows = behavior.getRowCount();
		var numFixedColumns = behavior.getFixedColumnCount();
		var numFixedRows = behavior.getFixedRowCount();

		var fixedColumnsWidth = behavior.getFixedColumnsWidth();
		var fixedRowsHeight = behavior.getFixedRowsHeight();

		this.renderedColumnWidths = [0];
		this.renderedHeight = 0;
		this.renderedRowHeights = [0];
		this.renderedColumns = [];
		this.renderedRows = [];
		this.insertionBounds = [];
		var insertionBoundsCursor = 0;

		var scrollTop = this.getScrollTop();
		var scrollLeft = this.getScrollLeft();
		var viewWidth = this.getBounds().width() - RIGHT_BOUNDS_OFFSET; // look in fin-hypergrid and initializtion of fin-canvas
		var viewHeight = this.getBounds().height();

		gc.beginPath();
		gc.strokeStyle = lineColor;
		gc.lineWidth = this.resolveProperty('lineWidth');
		var c, r, x, y, width, height;

		//fixedrow horizontal grid lines
		//gc.beginPath();
		gc.moveTo(0, 0);
		y = 0;
		for (r = 0; r < numFixedRows; r++) {
			height = this.getFixedRowHeight(r);
			y = y + height;
			this.renderedRowHeights.push(Math.round(y));
			if (drawThemH) {
				gc.moveTo(fixedColumnsWidth, y + 0.5);
				gc.lineTo(viewWidth, y + 0.5);
				//gc.stroke();
			}
		}

		//fixedcol vertical grid lines
		//gc.beginPath();
		gc.moveTo(0, 0);
		x = 0;
		for (c = 0; c < numFixedColumns; c++) {
			width = this.getFixedColumnWidth(c);
			x = x + width;
			this.renderedColumnWidths.push(Math.round(x));
			if (drawThemV) {
				gc.moveTo(x + 0.5, fixedRowsHeight);
				gc.lineTo(x + 0.5, viewHeight);
				//gc.stroke();
			}
		}

		//main area horizontal grid lines
		//gc.beginPath();
		gc.moveTo(0, 0);
		y = offsetY;
		for (r = 0; r < numRows; r++) {
			height = this.getRowHeight(r + scrollTop);

			this.renderedRows.push(r + scrollTop);

			if (y > viewHeight || numRows < scrollTop + r) {
				this.renderedRows.length = Math.max(0, this.renderedRows.length - 2);
				break;
			}

			if (drawThemH) {
				gc.moveTo(0, y + 0.5);
				gc.lineTo(viewWidth, y + 0.5);
				//gc.stroke();
			}
			y = y + height;
			this.renderedHeight = this.renderedHeight + height;
			this.renderedRowHeights.push(Math.round(y));
		}



		//main area vertical grid lines
		//gc.beginPath();
		gc.moveTo(0, 0);
		x = offsetX;
		var previousInsertionBoundsCursorValue = 0;
		const finalRowNum = this.getBehavior().getRowCount() - 1;
		const finalRowHideHeight = this.renderedRows[this.renderedRows.length - 1] === finalRowNum ? (height - 4) : 0;
		for (c = 0; c < numColumns + 1; c++) {
			width = this.getColumnWidth(c + scrollLeft);

			this.renderedColumns.push(c + scrollLeft);

			if (x > viewWidth || numColumns < scrollLeft + c) {
				this.renderedColumns.length = Math.max(0, this.renderedColumns.length - 2);
				break;
			}
			if (drawThemV) {
				gc.moveTo(x + 0.5, 0);
				gc.lineTo(x + 0.5, viewHeight - finalRowHideHeight);
				//gc.stroke();
			}
			x = x + width;

			this.renderedColumnWidths.push(Math.round(x));

			insertionBoundsCursor = insertionBoundsCursor + Math.round(width / 2) + previousInsertionBoundsCursorValue;
			this.insertionBounds.push(insertionBoundsCursor);
			previousInsertionBoundsCursorValue = Math.round(width / 2);
		}



		gc.stroke();
		gc.closePath();
	}

	paintHeaders(ctx, offsetX, offsetY) {

		this.paintFixedRows(
			ctx,
			offsetX + this.getBehavior().getFixedColumnsWidth(),
			offsetY,
			this.getColumnCount(),
			this.getBehavior().getFixedRowCount());

		this.paintFixedColumns(
			ctx,
			offsetX,
			offsetY + this.getBehavior().getFixedRowsHeight(),
			this.getBehavior().getFixedColumnCount(),
			this.getBehavior().getRowCount());

	}

	isHovered(x, y) {
		return this.grid.isHovered(x, y);
	}

	isRowHovered(y) {
		return this.grid.isRowHovered(y);
	}

	isColumnHovered(x) {
		return this.grid.isColumnHovered(x);
	}

	paintFixedRows(gc, offsetX, offsetY, numColumns, numRows) {
		var behavior = this.getBehavior();
		var x = offsetX;
		var scrollLeft = this.getScrollLeft();
		var font = this.resolveProperty('fixedRowFont');

		var voffset = this.resolveProperty('voffset');
		var hoffset = this.resolveProperty('hoffset');

		var fgColor = this.resolveProperty('fixedRowColor');
		var bgColor = this.resolveProperty('fixedRowBackgroundColor');

		var fgSelColor = this.resolveProperty('fixedRowFGSelColor');
		var bgSelColor = this.resolveProperty('fixedRowBGSelColor');

		var cellProvider = this.getGrid().getCellProvider();
		var viewWidth = this.getBounds().width(); // - RIGHT_BOUNDS_OFFSET; // look in fin-hypergrid and initializtion of fin-canvas
		var viewHeight = behavior.getFixedRowsHeight();

		for (var c = 0; c < numColumns; c++) {
			var width = this.getColumnWidth(c + scrollLeft);
			if (x > viewWidth || numColumns <= scrollLeft + c) {
				return;
			}
			var isSelected = this.isFixedRowCellSelected(c + scrollLeft);
			var y = offsetY;

			gc.fillStyle = bgColor;
			gc.fillRect(x, y, x + width, viewHeight - y);

			//reset this for this pass..
			this.renderedColumnMinWidths[c + scrollLeft] = 0;

			for (var r = 0; r < numRows; r++) {

				var height = this.getFixedRowHeight(r);
				var align = behavior._getFixedRowAlignment(c + scrollLeft, r);
				var value = behavior._getFixedRowValue(c + scrollLeft, r);
				var isColumnHovered = this.isColumnHovered(c);
				var isRowHovered = false; //this.isHovered(c, r);
				//translatedX allows us to reorder columns
				var translatedX = behavior.translateColumnIndex(c + scrollLeft);
				var config = this.cellConfig(translatedX, r, value, fgColor, bgColor, fgSelColor, bgSelColor, font, isSelected, isColumnHovered, isRowHovered, align, hoffset, voffset);
				var cell = cellProvider.getFixedRowCell(config);
				config.minWidth = 0;

				behavior.cellFixedRowPrePaintNotification(cell);
				cell.paint(gc, x, y, width, height);

				//lets capture the col preferred widths for col autosizing
				this.renderedColumnMinWidths[c + scrollLeft] = Math.max(config.minWidth || 0, this.renderedColumnMinWidths[c + scrollLeft]);

				if (behavior.highlightCellOnHover(isColumnHovered, isRowHovered)) {
					gc.beginPath();
					var pre = gc.globalAlpha;
					gc.globalAlpha = 0.2;
					gc.fillRect(x + 2, y + 2, width - 3, height - 3);
					gc.globalAlpha = pre;
					gc.stroke();
					gc.closePath();
				}
				y = y + height;
			}
			x = x + width;
		}
	}

	paintFixedColumns(gc, offsetX, offsetY, numColumns, numRows) {
		var behavior = this.getBehavior();
		var x = offsetX;

		var font = this.resolveProperty('fixedColumnFont');

		var voffset = this.resolveProperty('voffset');
		var hoffset = this.resolveProperty('hoffset');

		var fgColor = this.resolveProperty('fixedColumnColor');
		var bgColor = this.resolveProperty('fixedColumnBackgroundColor');

		var fgSelColor = this.resolveProperty('fixedColumnFGSelColor');
		var bgSelColor = this.resolveProperty('fixedColumnBGSelColor');


		var scrollTop = this.getScrollTop();
		var cellProvider = this.getGrid().getCellProvider();
		var viewHeight = this.getBounds().height();

		for (var c = 0; c < numColumns; c++) {
			var width = this.getFixedColumnWidth(c);
			var align = behavior.getFixedColumnAlignment(c);
			var y = offsetY;

			gc.fillStyle = bgColor;
			gc.fillRect(x, y, width, viewHeight - y);

			for (var r = 0; r < numRows; r++) {
				var height = this.getRowHeight(r + scrollTop);
				var isSelected = this.isFixedColumnCellSelected(r + scrollTop);
				if (y > viewHeight || numRows <= scrollTop + r) {
					break;
				}
				var value = behavior.getFixedColumnValue(c, r + scrollTop);
				var isColumnHovered = false; //this.isHovered(c, r);
				var isRowHovered = this.isRowHovered(r);
				var config = this.cellConfig(c, r + scrollTop, value, fgColor, bgColor, fgSelColor, bgSelColor, font, isSelected, isColumnHovered, isRowHovered, align, hoffset, voffset);
				var cell = cellProvider.getFixedColumnCell(config);
				config.minWidth = 0;

				behavior.cellFixedColumnPrePaintNotification(cell);
				cell.paint(gc, x, y, width, height);

				this.renderedFixedColumnMinWidths[c] = Math.max(config.minWidth || 0, this.renderedFixedColumnMinWidths[c]);

				if (behavior.highlightCellOnHover(isColumnHovered, isRowHovered)) {
					gc.beginPath();
					var pre = gc.globalAlpha;
					gc.globalAlpha = 0.2;
					gc.fillRect(x + 2, y + 2, width - 3, height - 3);
					gc.globalAlpha = pre;
					gc.stroke();
					gc.closePath();
				}

				y = y + height;

			}
			x = x + width;
		}
	}

	paintCells(gc, offsetX, offsetY) {
		try {
			gc.save();
			this._paintCells(gc, offsetX, offsetY);
		} catch (e) {
			console.error(e);
		} finally {
			gc.restore();
		}
	}

	_paintCells(gc, offsetX, offsetY) {
		var behavior = this.getBehavior();
		var numColumns = this.getColumnCount();
		var numRows = behavior.getRowCount();
		var x = offsetX;
		var startY = offsetY;
		var scrollTop = this.getScrollTop();
		var scrollLeft = this.getScrollLeft();
		var cellProvider = this.getGrid().getCellProvider();
		var font = this.resolveProperty('font');

		var voffset = this.resolveProperty('voffset');
		var hoffset = this.resolveProperty('hoffset');

		var fgColor = this.resolveProperty('color');
		var bgColor = this.resolveProperty('backgroundColor');

		var fgSelColor = this.resolveProperty('foregroundSelColor');
		var bgSelColor = this.resolveProperty('backgroundSelColor');

		var viewWidth = this.getBounds().width() - RIGHT_BOUNDS_OFFSET; // look in fin-hypergrid and initializtion of fin-canvas
		var viewHeight = this.getBounds().height();

		for (var c = 0; c < numColumns; c++) {
			var width = this.getColumnWidth(c + scrollLeft);
			if (x > viewWidth || numColumns <= scrollLeft + c) {
				return;
			}

			var y = startY;
			var translatedX = behavior.translateColumnIndex(c + scrollLeft);

			var columnAlign = behavior._getColumnAlignment(c + scrollLeft);
			var columnProperties = behavior.getColumnProperties(translatedX);
			var overrideFGColor = columnProperties.fgColor || fgColor;
			var overrideFont = columnProperties.font || font;
			//fill background
			gc.fillStyle = columnProperties.bgColor || bgColor;
			gc.fillRect(x, y, x + width, viewHeight - y);

			for (var r = 0; r < numRows; r++) {
				var isSelected = this.isSelected(c + scrollLeft, r + scrollTop);
				var height = this.getRowHeight(r + scrollTop);
				if (y > viewHeight || numRows <= scrollTop + r) {
					break;
				}

				var value = behavior._getValue(c + scrollLeft, r + scrollTop);
				// if (!value && value !== 0) { // edge condition if were scrolled all the way to the end
				//     break;
				// }

				//translatedX allows us to reorder columns

				var isColumnHovered = this.isColumnHovered(c);
				var isRowHovered = this.isRowHovered(r);

				var config = this.cellConfig(translatedX, r + scrollTop, value, overrideFGColor, bgColor, fgSelColor, bgSelColor, overrideFont, isSelected, isColumnHovered, isRowHovered, columnAlign, hoffset, voffset);
				behavior.cellPrePaintNotification(config);
				var cell = cellProvider.getCell(config);

				config.minWidth = 0;

				cell.paint(gc, x, y, width, height);

				//lets capture the col preferred widths for col autosizing
				this.renderedColumnMinWidths[c + scrollLeft] = Math.max(config.minWidth || 0, this.renderedColumnMinWidths[c + scrollLeft]);

				if (behavior.highlightCellOnHover(isColumnHovered, isRowHovered)) {
					gc.beginPath();
					var pre = gc.globalAlpha;
					gc.globalAlpha = 0.2;
					gc.fillRect(x + 2, y + 2, width - 3, height - 3);
					gc.globalAlpha = pre;
					gc.stroke();
					gc.closePath();
				}

				y = y + height;
			}

			x = x + width;
		}
	}

	paintTopLeft(gc, offsetX, offsetY) {
		noop(offsetX, offsetY);
		// gc.beginPath();
		// var fixedRowHeight = this.getBehavior().getFixedRowsHeight();
		// var fixedColumnWidth = this.getBehavior().getFixedColumnsWidth();
		// gc.fillStyle = this.resolveProperty('topLeftBackgroundColor');
		// gc.fillRect(offsetX, offsetY, fixedColumnWidth, fixedRowHeight);
		// gc.stroke();

		try {
			gc.save();
			this._paintTopLeft(gc);
		} finally {
			gc.restore();
		}


	}

	_paintTopLeft(gc) {
		var behavior = this.getBehavior();
		var numColumns = behavior.getFixedColumnCount();
		var numRows = behavior.getFixedRowCount();
		var x = 0;
		var startY = 0;
		var cellProvider = this.getGrid().getCellProvider();

		var font = this.resolveProperty('topLeftFont');

		var voffset = this.resolveProperty('voffset');
		var hoffset = this.resolveProperty('hoffset');

		var fgColor = this.resolveProperty('topLeftColor');
		var bgColor = this.resolveProperty('topLeftBackgroundColor');

		var fgSelColor = this.resolveProperty('topLeftFGSelColor');
		var bgSelColor = this.resolveProperty('topLeftBGSelColor');

		var viewWidth = behavior.getFixedColumnsWidth(); // look in fin-hypergrid and initializtion of fin-canvas
		var viewHeight = behavior.getFixedRowsHeight();

		for (var c = 0; c < numColumns; c++) {
			var width = this.getFixedColumnWidth(c);
			if (x > viewWidth || numColumns <= c) {
				return;
			}

			var y = startY;
			var r = 0;
			var columnAlign = behavior.getTopLeftAlignment(c, r);
			//fill background
			gc.fillStyle = bgColor;
			gc.fillRect(x, y, x + width, viewHeight - y);

			this.renderedFixedColumnMinWidths[c] = 0;

			for (; r < numRows; r++) {
				var height = this.getFixedRowHeight(r);
				if (y > viewHeight || numRows <= r) {
					break;
				}

				var value = behavior.getTopLeftValue(c, r);
				// if (!value && value !== 0) { // edge condition if were scrolled all the way to the end
				//     break;
				// }

				var isColumnHovered = this.isHovered(c);
				var isRowHovered = this.isHovered(r);

				var config = this.cellConfig(x, r, value, fgColor, bgColor, fgSelColor, bgSelColor, font, false, isColumnHovered, isRowHovered, columnAlign, hoffset, voffset);
				var cell = cellProvider.getTopLeftCell(config);

				config.minWidth = 0;

				//minWidth should be set inside this function call
				behavior.cellTopLeftPrePaintNotification(cell);
				cell.paint(gc, x, y, width, height);

				var minWidth = config.minWidth;
				this.renderedFixedColumnMinWidths[c] = Math.max(minWidth || 0, this.renderedFixedColumnMinWidths[c]);

				y = y + height;
			}


			x = x + width;
		}
	}

	isFixedRowCellSelected(colIndex) {
		return this.getGrid().isFixedRowCellSelected(colIndex);
	}

	isFixedColumnCellSelected(rowIndex) {
		return this.getGrid().isFixedColumnCellSelected(rowIndex);
	}

	getScrollTop() {
		var st = this.getGrid().getVScrollValue();
		return st;
	}

	getScrollLeft() {
		var st = this.getGrid().getHScrollValue();
		return st;
	}

	getBehavior() {
		return this.getGrid().getBehavior();
	}

	getFixedRowHeight(rowIndex) {
		var height = this.getBehavior().getFixedRowHeight(rowIndex);
		return height;
	}

	getRowHeight(rowIndex) {
		var height = this.getBehavior().getRowHeight(rowIndex);
		return height;
	}

	getColumnWidth(columnIndex) {
		var width = this.getBehavior()._getColumnWidth(columnIndex);
		return width;
	}

	getFixedColumnWidth(columnIndex) {
		var height = this.getBehavior().getFixedColumnWidth(columnIndex);
		return height;
	}

	isLastColumnVisible() {
		var lastColumnIndex = this.getColumnCount() - 1;
		var isMax = this.renderedColumns.indexOf(lastColumnIndex) !== -1;
		return isMax;
	}

	getColumnCount() {
		var count = this.getGrid().getColumnCount();
		return count;
	}

	getRenderedWidth(index) {
		return this.renderedColumnWidths[index];
	}

	getRenderedHeight(index) {
		return this.renderedRowHeights[index];
	}

	getCanvas() {
		return this.getGrid().getCanvas();
	}

	repaintCell(x, y) {
		if (this.isDraggingColumn()) {
			return;
		}
		var self = this;
		var behavior = this.getBehavior();

		var numFixedCols = behavior.getFixedColumnCount();
		var numFixedRows = behavior.getFixedRowCount();

		var scrollLeft = this.getScrollLeft();
		var unTranslatedX = behavior.unTranslateColumnIndex(x + scrollLeft);

		//it's not being viewed exit...
		if (!this.isRowVisible(y) || !this.isColumnVisible(unTranslatedX)) {
			return;
		}
		//var offsetX = behavior.getFixedColumnsWidth();
		//var offsetY = behavior.getFixedRowsHeight();

		var ox = this.renderedColumnWidths[numFixedCols + unTranslatedX],
			oy = this.renderedRowHeights[numFixedRows + y],
			cx = this.renderedColumnWidths[numFixedCols + unTranslatedX + 1],
			cy = this.renderedRowHeights[numFixedRows + y + 1],
			ex = cx - ox,
			ey = cy - oy;

		var func = function(gc) {
			self._repaintCell(gc, x, unTranslatedX, y, ox, oy, ex, ey);
		};

		this.getCanvas().safePaintImmediately(func);

	}
	_repaintCell(ctx, translatedX, x, y, startX, startY, width, height) {
		ctx.rect(startX + 1, startY + 1, width, height);
		ctx.clip();
		var behavior = this.getBehavior();
		var scrollTop = this.getScrollTop();
		var scrollLeft = this.getScrollLeft();
		var cellProvider = this.getGrid().getCellProvider();
		var font = this.resolveProperty('font');

		var voffset = this.resolveProperty('voffset');
		var hoffset = this.resolveProperty('hoffset');

		var fgColor = this.resolveProperty('color');
		var bgColor = this.resolveProperty('backgroundColor');

		var fgSelColor = this.resolveProperty('foregroundSelColor');
		var bgSelColor = this.resolveProperty('backgroundSelColor');

		//        var viewWidth = this.getBounds().width() - RIGHT_BOUNDS_OFFSET; // look in fin-hypergrid and initializtion of fin-canvas
		//        var viewHeight = this.getBounds().height();

		var columnAlign = behavior._getColumnAlignment(translatedX);
		var columnProperties = behavior.getColumnProperties(translatedX);
		var overrideFGColor = columnProperties.fgColor || fgColor;
		var overrideFont = columnProperties.font || font;
		//fill background
		ctx.fillStyle = columnProperties.bgColor || bgColor;
		ctx.fillRect(startX, startY, width, height);

		var isSelected = this.isSelected(x + scrollLeft, y + scrollTop);

		var value = behavior._getValue(x + scrollLeft, y + scrollTop);

		var isColumnHovered = this.isHovered(x, y);
		var isRowHovered = this.isHovered(x, y);

		var config = this.cellConfig(translatedX, y + scrollTop, value, overrideFGColor, bgColor, fgSelColor, bgSelColor, overrideFont, isSelected, isColumnHovered, isRowHovered, columnAlign, hoffset, voffset);
		behavior.cellPrePaintNotification(config);
		var cell = cellProvider.getCell(config);

		cell.paint(ctx, startX, startY, width, height);

	}

	isDraggingColumn() {
		return this.getGrid().isDraggingColumn();
	}

	getPageUpRow() {
		if (this.renderedRowHeights.length === 0) {
			return;
		}
		var behavior = this.getBehavior();
		var h = this.renderedHeight;
		var topRow = this.renderedRows[0];
		while (h > 0 && topRow >= 1) {
			topRow--;
			var eachHeight = behavior.getRowHeight(topRow);
			h = h - eachHeight;
		}
		if (topRow === 0) {
			return 0;
		}
		return topRow + 1;

	}

	getPageDownRow() {
		if (this.renderedRowHeights.length === 0) {
			return;
		}
		var row = this.renderedRows[this.renderedRows.length - 1] + 1;
		return row;
	}

	addExtraRenderer(er) {
		this.extraRenderers.push(er);
	}
}

