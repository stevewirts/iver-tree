import ModelBase from './ModelBase.js';
import CellProvider from '../CellProvider.js';
import SimpleLRU from '../SimpleLRU.js';
import numeral from 'numeral';

const noop = function() {};
const logMessages = false;
const hierarchyColumn = 'g_';

//keys mapping Q datatypes to aligment and renderers are setup here.
//<br>see [q datatypes](http://code.kx.com/wiki/Reference/Datatypes) for more.

const typeAlignmentMap = {
	j: 'right',
	s: 'left',
	t: 'center',
	f: 'right',
	i: 'right',
	e: 'right',
	d: 'center'
};

//there are 4 default cell renderer types to choose from at the moment
//<br>simpleCellRenderer, sliderCellRenderer, sparkbarCellRenderer, sparklineCellRenderer
// const typeRendererMap = {
//     J: 'sparklineCellRenderer',
//     j: 'simpleCellRenderer',
//     s: 'simpleCellRenderer',
//     t: 'simpleCellRenderer',
//     f: 'simpleCellRenderer',
//     d: 'simpleCellRenderer'
// };
const iCache = new SimpleLRU(10000);
iCache.set(0, '0');
const fCache = new SimpleLRU(10000);
fCache.set(0, '0.00');

const icommify = function(v) {
	var result;
	if (v) {
		result = iCache.get(v);
		if (result) {
			return result;
		} else {
			result = numeral(v).format('0,0');
			iCache.set(v, result);
			return result;
		}
	} else {
		return '';
	}
};

const fcommify = function(v) {
	var result;
	if (v) {
		result = iCache.get(v);
		if (result) {
			return result;
		} else {
			result = numeral(v).format('0,0.00');
			iCache.set(v, result);
			return result;
		}
	} else {
		return '';
	}
};

const typeFormatMap = {
	J: function(v) {
		return v;
	},
	j: icommify,
	s: function(v) {
		return v;
	},
	t: function(v) {
		return v;
	},
	e: fcommify,
	i: icommify,
	f: fcommify,
	d: function(v) {
		return v;
	}
};

//this will map will ultimately be user editable and persisted
//it maps an alias from the Q data world to behavior, formatting and look and feel
const propertiesMap = {
	columns: {
		TEST: {
			formatter: fcommify,
			alignment: 'right',
			modifyConfig: function(cell) {
				noop(cell);
			}
		},
		USD: {
			formatter: fcommify,
			alignment: 'right',
			modifyConfig: function(cell) {
				cell.config.fgColor = 'green'; //#1C4A16'; //'#53FF07'; //green
				if (cell.config.value < 0) {
					cell.config.fgColor = 'red'; //#C13527'; //'#FF1515'; //red
				}
			}
		},
		QTY: {
			formatter: icommify,
			alignment: 'right',
			modifyConfig: function(cell) {
				cell.config.fgColor = 'green'; //#1C4A16'; //'#53FF07'; //green
				if (cell.config.value < 0) {
					cell.config.fgColor = 'red'; //#C13527'; //'#FF1515'; //red
				}
			}
		},
	}
};


//sort states are also the visual queues in the column headers
//* '' no sort
//* ↑ sort ascending
//* ↓ sort descending
//* ⤒ sort absolute value ascending
//* ⤓ sort absolute value descending;
// \u25be

const sortMap = {
	a: '-up',
	d: '-down',
	A: '-abs-up',
	D: '-abs-down',
};

// const sortStates = {
//     n: 'a',
//     a: 'd',
//     d: 'A',
//     A: 'D',
// };

const imageMap = {
	u: 'up-rectangle',
	d: 'down-rectangle',
	'': 'rectangle-spacer'
};

export default class QTreeModel extends ModelBase {

	constructor(url, table, buttonBarHolder, descriptionDiv) {
		super();
		this.url = url;
		this.table = table;
		this.buttonBarHolder = buttonBarHolder;
		this.descriptionDiv = descriptionDiv;
		this.block = {
			properties: {
				columns: {}
			},
			count: 0,
			visible: [],
			groups: [],
			sorts: {
				cols: [],
				rows: []
			},
			hypertree: [{
				g_: ['']
			}]
		};
		this.sorted = {};
		this.ws = null;
		this.reconnect();
		this.scrollPositionY = 0;
		this.scrollPositionX = 0;
		this.msgCounter = Date.now();
		this.msgResponsesActions = {};

		var cursorChanger = function(grid, event) {
			if (this.isTopLeft(grid, event)) {
				this.cursor = 'pointer';
			} else {
				this.cursor = null;
			}
			if (this.next) {
				this.next.handleMouseMove(grid, event);
			}
		};
		var self = this;
		setTimeout(function() {
			self.featureChain.handleMouseMove = cursorChanger;
			cursorChanger.bind(self.featureChain);
		}, 500);

	}

	getFixedRowCount() {
		return 2;
	}

	createCellProvider() {
		var self = this;
		var provider = new CellProvider();
		var columns = propertiesMap.columns;
		provider.getCell = function(config) {
			var cell = provider.cellCache.simpleCellRenderer;
			cell.config = config;
			var colId = self.block.visible[config.x];
			var type = self.block.qtypes[colId];
			var colProps;
			var colPropertyAlias = self.block.properties.columns[colId];
			if (colPropertyAlias) {
				colProps = columns[colPropertyAlias];
				colProps.modifyConfig(cell);
			}
			var formatter = colProps ? colProps.formatter : typeFormatMap[type] || function(v) {
				return v;
			};
			config.value = formatter(config.value);
			return cell;
		};
		provider.getFixedColumnCell = function(config) {
			var cell = provider.cellCache.treeCellRenderer;
			cell.config = config;
			return cell;
		};
		provider.getFixedRowCell = function(config) {
			var label = provider.cellCache.simpleCellRenderer;
			label.config = config;
			if (config.y === 1) {
				config.value = config.value[0];
				return provider.getCell(config);
			}
			config.value = config.value || '';
			return label;
		};

		provider.getTopLeftCell = function(config) {
			//var empty = provider.cellCache.emptyCellRenderer;
			var label = provider.cellCache.simpleCellRenderer;
			label.config = config;
			if (config.y === 0) {
				return label;
			} else {
				return label;
			}
		};

		return provider;
	}

	reconnect() {
		if (!this.url) {
			return;
		}
		this.connect();
		this.setScrollPositionY(0);
		this.scrolled = false;
	}

	getTopLeftValue(x, y) {
		if (y === 0) {
			var image = this.getClickIndicator(hierarchyColumn);
			var clone = [image, 'Hierarchy', this.getSortIndicator(hierarchyColumn)];
			//clone[0] = clone[0] + ' ' + sortIndicator;
			return clone;
		} else {
			return '';
		}
	}

	getValue(x, y) {
		var col = this.getColumnId(x);
		var normalized = Math.floor(y - this.getScrollPositionY());
		if (this.block && (typeof col === 'string')) {
			var val = this.block.hypertree[1][col][normalized];
			if (val || val === 0) {
				return val;
			}
		}
		return '';
	}

	clearData() {
		this.block.rows = [];
		this.changed();
	}

	getRowCount() {
		return Math.max(0, this.block.count - 1);
	}

	getColumnCount() {
		return this.block.visible.length;
	}

	getScrollPositionX() {
		return this.scrollPositionX;
	}

	setScrollPositionX(x) {
		this.scrollPositionX = x;
	}

	getScrollPositionY() {
		return this.scrollPositionY;
	}

	setScrollPositionY(y) {
		if (this.getScrollPositionY() === y) {
			return;
		}
		this.scrollPositionY = y;
		if (!this.isConnected()) {
			return;
		}
		var startY = this.getScrollPositionY() || 0;
		var stopY = startY + 60;
		this.sendMessage({
			id: this.getNextMessageId(),
			fn: 'get',
			start: startY,
			end: stopY
		});
	}

	isConnected() {
		if (!this.ws) {
			return false;
		}
		return this.ws.readyState === this.ws.OPEN;
	}

	getFixedRowValue(x, y) {
		var colId = this.getColumnId(x);
		if (y < 1) {
			var sortIndicator = this.getSortIndicator(colId);
			var clickIndicator = this.getClickIndicator(colId);
			return [clickIndicator, colId, sortIndicator];
		}
		var total = this.block.hypertree[0][colId];
		return total;
	}

	getClickIndicator(colId) {
		if (!this.block.icons) {
			return this.getImage('rectangle-spacer');
		}
		var direction = this.block.icons[colId];
		var image = this.getImage(imageMap[direction]);
		return image;
	}

	getSortIndicator(colId) {
		var sortIndex = this.block.sorts.cols.indexOf(colId);
		if (sortIndex < 0) {
			return this.getImage('sortable');
		}
		var sortState = this.block.sorts.sorts[sortIndex];
		var symbol = (sortIndex + 1) + sortMap[sortState];
		var state = this.getImage(symbol);
		return state;
	}

	getFixedColumnValue(x, y) {
		var indentPixels = 10;
		var blob = this.block.hypertree[1];
		var transY = Math.max(0, y - this.getScrollPositionY());
		var data = blob.g_[transY];
		var level = blob.l_[transY];
		var indent = 5 + indentPixels + (level - 1) * indentPixels;
		var icon = '';
		if (!blob.e_[transY]) {
			icon = blob.o_[transY] ? '\u25be ' : '\u25b8 ';
		}
		return {
			data: data,
			indent: indent,
			icon: icon
		};
	}

	getCanSort() {
		return true;
	}

	toggleSort(columnIndex) {
		var colId = this.getColumnId(columnIndex);
		this._toggleSort(colId);
	}

	_toggleSort(colId) {
		if (!this.getCanSort()) {
			return;
		}

		var msg = {
			id: this.getNextMessageId(),
			fn: 'sorts',
			col: colId,
		};

		this.sendMessage(msg);

	}

	getFixedRowAlignment(x, y) {
		if (y > 0) {
			return this.getColumnAlignment(x);
		}
		return this.resolveProperty('fixedRowAlign');
	}

	getColumnAlignment(x) {
		var colId = this.getColumnId(x);
		var type = this.block.qtypes[colId];
		var colProps;
		var colPropertyAlias = this.block.properties.columns[colId];
		if (colPropertyAlias) {
			colProps = propertiesMap.columns[colPropertyAlias];
		}
		var alignment = colProps ? colProps.alignment : typeAlignmentMap[type];
		return alignment;
	}

	getColumnId(x) {
		var headers = this.block.visible;
		var col = headers[x];
		return col;
	}

	getFixedColumnAlignment( /* x */ ) {
		return 'left';
	}

	topLeftClicked(grid, mouse) {
		var gridY = mouse.gridCell.y;
		if (gridY < 1) {
			this.hierarchyCellClicked(grid, mouse);
		} else {
			this.controlCellClick(grid, mouse);
		}
	}

	hierarchyCellClicked(grid, mouse) {
		var colId = hierarchyColumn;
		var colWidth = this.getFixedColumnWidth(0);
		var mouseX = mouse.mousePoint.x;
		var direction = this.block.icons[hierarchyColumn];
		if (mouseX < (colWidth / 2)) {
			if (direction) {
				var colClick = {
					id: this.getNextMessageId(),
					fn: 'col',
					col: colId
				};
				this.sendMessage(colClick);
			} else {
				return;
			}
		} else {
			this._toggleSort(colId);
		}
	}

	controlCellClick(grid, mouse) {
		var colWidth = this.getFixedColumnWidth(0);
		var mouseX = mouse.mousePoint.x;
		var fn = 'expand';
		if (mouseX < (colWidth / 3)) {
			fn = 'collapse';
		} else if (mouseX < (2 * colWidth / 3)) {
			fn = 'reset';
		}

		if (!this.isColumnReorderable()) {
			fn = 'reset';
		}

		var msg = {
			id: this.getNextMessageId(),
			fn: fn
		};
		this.sendMessage(msg);
	}

	fixedColumnClicked(grid, mouse) {
		var rowNum = mouse.gridCell.y - this.getScrollPositionY();
		var rows = this.block.hypertree[1].n_[rowNum];
		if (rows.length === this.block.groups.length + 1) {
			//this is a leaf, don't send anything
			return;
		}
		var rowClick = {
			id: this.getNextMessageId(),
			fn: 'row',
			row: rows
		};
		this.sendMessage(rowClick);
	}

	fixedRowClicked(grid, mouse) {
		var x = mouse.gridCell.x;
		var y = mouse.gridCell.y;
		if (y > 0) {
			return;
		}
		var colId = this.getColumnId(x);
		var direction = this.block.icons[colId];
		var colWidth = this.getColumnWidth(x);
		var mousePoint = mouse.mousePoint.x;
		if (mousePoint < (colWidth / 2)) {
			if (direction) {
				var colClick = {
					id: this.getNextMessageId(),
					fn: 'col',
					col: colId
				};
				this.sendMessage(colClick);
			}
		} else {
			this.toggleSort(x);
		}
	}

	cellDoubleClicked(cell /*, event */ ) {
		if (!this.isCellClickEnabled()) {
			return;
		}
		if (cell.x < this.getFixedColumnCount() || cell.y < this.getFixedRowCount()) {
			return; //no grey area double clicking alowed
		}
		var rowNum = cell.y - this.getScrollPositionY();
		var rows = this.block.hypertree[1].n_[rowNum];
		var colId = this.getColumnId(cell.x);
		var colClick = {
			id: this.getNextMessageId(),
			fn: 'cell',
			col: colId,
			row: rows
		};
		this.sendMessage(colClick);
	}

	sendMessage(message) {
		if (logMessages) {
			console.log('out-' + Date.now(), message);
		}
		this.ws.send(JSON.stringify(message));
	}

	isCellClickEnabled() {
		return this.block.cell;
	}

	isColumnReorderable() {
		return this.block.reorderable;
	}

	openEditor(div) {
		if (!this.isColumnReorderable()) {
			return false;
		}
		var self = this;
		var container = document.createElement('div');

		var group = document.createElement('fin-hypergrid-dnd-list');
		var hidden = document.createElement('fin-hypergrid-dnd-list');
		var visible = document.createElement('fin-hypergrid-dnd-list');

		container.appendChild(group);
		container.appendChild(hidden);
		container.appendChild(visible);

		this.beColumnStyle(group.style);
		group.style.left = '0%';
		group.title = 'groups';
		group.list = this.block.groups.slice(0);
		//can't remove the last item
		group.canDragItem = function(list, item, index, e) {
			noop(item, index, e);
			if (self.block.ungrouped) {
				return true;
			} else {
				return list.length > 1;
			}
		};
		//only allow dropping of H fields
		group.canDropItem = function(sourceList, myList, sourceIndex, item, e) {
			noop(sourceList, myList, sourceIndex, e);
			return self.block.groupable.indexOf(item) > -1;
		};

		this.beColumnStyle(hidden.style);
		hidden.style.left = '33.3333%';
		hidden.title = 'hidden columns';
		hidden.list = this.block.invisible.slice(0);

		this.beColumnStyle(visible.style);
		visible.style.left = '66.6666%';
		visible.title = 'visible columns';
		visible.list = this.block.visible.slice(0);
		//can't remove the last item
		visible.canDragItem = function(list, item, index, e) {
			noop(item, index, e);
			return list.length > 1;
		};

		//attach for later retrieval
		div.lists = {
			group: group.list,
			hidden: hidden.list,
			visible: visible.list
		};

		div.appendChild(container);
		return true;
	}

	closeEditor(div) {
		var lists = div.lists;
		var changeCols = {
			id: this.getNextMessageId(),
			fn: 'groups',
			groups: lists.group,
			visible: lists.visible
		};

		this.sendMessage(changeCols);
		return true;
	}

	getNextMessageId(onResponseDo) {
		var id = 'js_' + this.msgCounter++;
		if (onResponseDo) {
			this.msgResponsesActions[id] = onResponseDo;
		}
		return id;
	}

	endDragColumnNotification() {
		var self = this;

		var visible = this.block.visible.slice(0);
		for (var i = 0; i < visible.length; i++) {
			var transX = this.translateColumnIndex(i);
			visible[i] = this.getColumnId(transX);
		}
		var msgId = this.getNextMessageId(function(message) {
			//ignore any predecessor column swap results if a new one has been posted
			var colCount = self.getColumnCount();
			var widths = [];
			for (var i = 0; i < colCount; i++) {
				widths[i] = self._getColumnWidth(i);
			}
			self.initColumnIndexes(self.getState());
			for (i = 0; i < colCount; i++) {
				widths[i] = self._setColumnWidth(i, widths[i]);
			}
			self.handleMessage(message);
		});
		var changeCols = {
			id: msgId,
			fn: 'groups',
			groups: this.block.groups,
			visible: visible
		};

		this.sendMessage(changeCols);
		return true;
	}

	handleMessage(d) {
		//insure certain things exist
		var tableState = this.getState();
		if (d.properties && !d.properties.columns) {
			d.properties.columns = {};
		}

		this.block = d;
		if (!tableState.columnIndexes || tableState.columnIndexes.length === 0 || d.visible.length !== tableState.columnIndexes.length) {
			this.initColumnIndexes(tableState);
		}
		//let's autosize the hierarchy column
		this.changed();
	}

	connect() {
		var d = {};
		var self = this;
		if ('WebSocket' in window) {
			try {
				this.ws = new WebSocket(this.url);
			} catch (e) {
				console.log('could not connect to ' + this.url + ', trying to reconnect in a moment...');
				return;
			}
			console.log('connecting...');
			this.ws.onopen = function() {
				self.setFixedColumnWidth(0, 160);
				var startY = self.getScrollPositionY() || 0;
				var stopY = startY + 60;

				self.sendMessage({
					id: self.getNextMessageId(),
					fn: 'get',
					start: startY,
					end: stopY
				});
			};
			this.ws.onclose = function() {

				console.log('disconnected from ' + this.url + ', trying to reconnect in a moment...');

			};
			this.ws.onmessage = function(e) {
				d = JSON.parse(e.data);
				if (logMessages) {
					console.log('in-' + Date.now(), d);
				}
				var msgId = d.id;
				var action = self.msgResponsesActions[msgId];
				if (action) {
					action(d);
					self.msgResponsesActions[msgId] = undefined;
				} else {
					self.handleMessage(d);
				}
				self.updateButtonBar();
				self.updateTreeStateDescription();
				self.autosizeColumns();
			};
			this.ws.onerror = function(e) {
				self.clearData();
				console.error('problem with connection to q at ' + this.url + ', trying again in a moment...', e.data);
				setTimeout(function() {
					//     self.connect();
				}, 2000);
			};
		} else {
			console.error('WebSockets not supported on your browser.');
		}
	}

	beColumnStyle(style) {
		style.top = '5%';
		style.position = 'absolute';
		style.width = '33.3333%';
		style.height = '99%';
		style.whiteSpace = 'nowrap';
	}

	highlightCellOnHover(isColumnHovered, isRowHovered) {
		return isRowHovered;
	}

	getCellEditorAt(x, y) {
		noop(x, y);
		return null;
	}

	getFixedColumnCount() {
		return 1;
	}
	getTreeStateDescription() {
		var object = this.block.message;
		var result = '<table class="qtreedescription">\n';
		var data = '<tr>';
		for (var property in object) {
			if (object.hasOwnProperty(property)) {
				result = result + '<col><col>';
				data = data + '<td>' + property + ':</td><td>' + object[property] + '</td>\n';
			}
		}
		result = result + '\n' + data + '</tr></table>';
		return result;
	}

	updateTreeStateDescription() {
		const div = this.descriptionDiv;
		if (div) {
			div.innerHTML = this.getTreeStateDescription();
		}
	}

	updateButtonBar() {
		var self = this;
		var image;
		var bbh = this.buttonBarHolder;
		if (!bbh) {
			return;
		}
		bbh.innerHTML = '';

		var action = function(name) {
			return function() {
				self.buttonBarIconClick(name);
			};
		};
		var imageNames = [];
		if (this.block.buttons) {
			imageNames = Object.keys(this.block.buttons);
		}
		for (var i = 0; i < imageNames.length; i++) {
			var name = imageNames[i];
			image = this.getImage(name.toLowerCase()).cloneNode();
			bbh.appendChild(image);
			if (!this.block.buttons[name]) {
				image.style.opacity = 0.4;
				image.style.cursor = 'default';
			} else {
				image.onclick = action(name);
			}
			image.setAttribute('title', name);
		}
		image = this.getImage('add-column').cloneNode();
		bbh.appendChild(image);
		image.setAttribute('title', 'open/close column editor');

		if (this.isColumnReorderable()) {
			image.onclick = function() {
				self.toggleColumnPicker();
			};
		} else {
			image.style.opacity = 0.4;
			image.style.cursor = 'default';
		}
	}

	buttonBarIconClick(buttonLabel) {
		var bbClick = {
			id: this.getNextMessageId(),
			fn: buttonLabel
		};
		this.sendMessage(bbClick);
		//this.autosizeColumns();
	}

}