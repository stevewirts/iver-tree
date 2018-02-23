import ModelBase from './ModelBase.js';

const typeAlignmentMap = {
	j: 'right',
	s: 'left',
	t: 'center',
	f: 'right',
	d: 'center'
};

export default class SimpleVirtualModel extends ModelBase {

	constructor(url, table) {
		super();
		this.url = url;
		this.table = table;
		this.block = {
			data: [],
			headers: [],
			rows: 0
		};
		this.sorted = {};
		this.ws = null;
		this.reconnect();
		this.scrollPositionY = 0;
		this.scrollPositionX = 0;
	}

	reconnect() {
		if (!this.url) {
			return;
		}
		this.connect();
		this.setScrollPositionY(0);
		this.scrolled = false;
	}

	getValue(x, y) {
		var override = this.dataUpdates['p_' + x + '_' + y];
		if (override) {
			return override;
		}

		var normalized = Math.floor(y - this.getScrollPositionY());
		if (this.block && normalized < this.block.data.length) {
			return this.block.data[normalized][x + 1];
		} else {
			return '';
		}
	}

	clearData() {
		this.block.rows = [];
		this.changed();
	}

	getRowCount() {
		return this.block.rows;
	}

	getColumnCount() {
		return Math.max(0, this.block.headers.length - 1);
	}

	getFixedColumnCount() {
		return 1;
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
		var tableName = this.table;
		if (!tableName) {
			console.log('you must provide a table attribute for the q behavior');
			return;
		}
		this.ws.send(JSON.stringify({
			cmd: 'fetchTableData',
			data: {
				table: tableName,
				start: this.getScrollPositionY(),
				num: 60
			}
		}));
	}

	isConnected() {
		if (!this.ws) {
			return false;
		}
		return this.ws.readyState === this.ws.OPEN;
	}

	getFixedRowValue(x) {
		if (!this.sorted[x + 1]) {
			this.sorted[x + 1] = 0;
		}
		var sortIndicator = this.sortStates[this.sorted[x + 1]];
		return this.block.headers[x + 1][0] + sortIndicator;
	}

	getHeader(x) {
		return this.block.headers[x + 1][0];
	}

	getFixedColumnValue(x, y) {
		return y;
	}

	getCanSort() {
		var canSort = this.block.features.sorting === true;
		return canSort;
	}

	toggleSort(columnIndex) {
		if (!this.getCanSort()) {
			return;
		}
		columnIndex++;
		var current = this.sorted[columnIndex];
		var stateCount = this.sortStates.length;
		this.sorted = {}; //clear out other sorted for now, well add multicolumn sort later
		this.sorted[columnIndex] = (current + 1) % stateCount;
		var state = this.sortStates[this.sorted[columnIndex]];
		var message = {
			cmd: 'sortTable',
			data: {
				table: this.table || 'trade',
				sort: current === (stateCount - 1) ? '' : this.block.headers[columnIndex][0],
				asc: state.indexOf('^') > 0,
				abs: state.indexOf('|') > 0,
				start: this.getScrollPositionY(),
				num: 60
			}
		};
		this.ws.send(JSON.stringify(message));
	}

	getColumnAlignment(x) {
		var alignment = typeAlignmentMap[this.block.headers[x + 1][1]];
		return alignment;
	}

	connect() {
		var self = this;
		var tableName = this.table;
		if (!tableName) {
			console.log('you must provide a table attribute for the q behavior');
			return;
		}
		if ('WebSocket' in window) {
			try {
				this.ws = new WebSocket(this.url);
			} catch (e) {
				console.log('could not connect to ' + this.url + ', trying to reconnect in a moment...');
				return;
			}
			console.log('connecting...');
			this.ws.onopen = function() {
				console.log('connected');
				self.ws.send(JSON.stringify({
					cmd: 'fetchTableData',
					data: {
						table: tableName,
						start: self.getScrollPositionY() || 0,
						num: 60
					}
				}));
			};
			this.ws.onclose = function() {
				self.clearData();
				console.log('disconnected from ' + this.url + ', trying to reconnect in a moment...');
			};
			this.ws.onmessage = function(e) {
				self.block = JSON.parse(e.data);
				self.changed();
			};
			this.ws.onerror = function(e) {
				self.clearData();
				console.error('problem with connection to q at ' + this.url + ', trying again in a moment...', e.data);
			};
		} else {
			console.error('WebSockets not supported on your browser.');
		}
	}
}

