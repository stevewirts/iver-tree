import Rectangles from './Rectangles.js';

export default class CanvasComponent {

	constructor() {
		this.parent = null;
		this.bounds = Rectangles.rectangle.create(0, 0, 0, 0);
		this.color = this.color || 'black';
		this.backgroundColor = null;
		this.layoutProperties = this.layoutProperties || [0, 0, 1, 0, 1, 0, 0, 0];
		if (typeof this.layoutProperties === 'string') {
			this.layoutProperties = JSON.parse(this.layoutProperties);
		}
	}

	setBounds(rectangle) {
		this.bounds = rectangle;
	}

	getBounds() {
		return this.bounds;
	}

	_paint(gc) {
		try {
			gc.save();
			gc.translate(this.bounds.left(), this.bounds.top());
			// bug in mozilla canvas of mac workaround
			// don't use cliping
			// gc.rect(0, 0, bounds.width(), bounds.height());
			// gc.clip();
			var bgColor = this.getBackgroundColor();
			if (bgColor) {
				var rect = this.getBounds();
				gc.beginPath();
				gc.fillStyle = bgColor;
				gc.fillRect(0, 0, rect.width(), rect.height());
				gc.stroke();
			}
			this.paint(gc);
		} finally {
			gc.restore();
		}
	}

	paint( /* gc */ ) {}

	getBackgroundColor() {
		return this.backgroundColor;
	}

	setBackgroundColor(colorValue) {
		this.backgroundColor = colorValue;
	}

	repaint() {
		if (this.parent) {
			this.parent.repaint();
		}
	}

	setParent(newParent) {
		this.parent = newParent;
	}

	getLayoutProperties() {
		return this.layoutProperties;
	}

	setLayoutProperties(properties) {
		this.layoutProperties = properties;
	}

	getComponent() {
		var comp = this.children[0];
		return comp;
	}
}
