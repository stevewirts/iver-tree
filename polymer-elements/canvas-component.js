<polymer-element name="fin-canvas-component" class="fin-canvas-component" attributes="layoutProperties" assetpath="/components/fin-canvas/">
  <template></template>
  <script>

'use strict';

(function() {

    Polymer('fin-canvas-component', { /* jshint ignore:line */
        ready: function() {
            this.readyInit();
        },
        readyInit: function() {
            this.g = document.createElement('fin-rectangle');
            this.parent = null;
            this.bounds = this.g.rectangle.create(0, 0, 0, 0);
            this.color = this.color || 'black';
            this.backgroundColor = null;
            this.layoutProperties = this.layoutProperties || [0, 0, 1, 0, 1, 0, 0, 0];
            if (typeof this.layoutProperties === 'string') {
                this.layoutProperties = JSON.parse(this.layoutProperties);
            }
        },
        setBounds: function(rectangle) {
            this.bounds = rectangle;
        },
        getBounds: function() {
            return this.bounds;
        },
        _paint: function(gc) {
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
        },
        paint: function( /* gc */ ) {},
        getBackgroundColor: function() {
            return this.backgroundColor;
        },
        setBackgroundColor: function(colorValue) {
            this.backgroundColor = colorValue;
        },
        repaint: function() {
            if (this.parent) {
                this.parent.repaint();
            }
        },
        setParent: function(newParent) {
            this.parent = newParent;
        },
        getLayoutProperties: function() {
            return this.layoutProperties;
        },
        setLayoutProperties: function(properties) {
            this.layoutProperties = properties;
        },
        getComponent: function() {
            var comp = this.children[0];
            return comp;
        }
    });

})();

  </script>
</polymer-element>