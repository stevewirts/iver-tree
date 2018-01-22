<polymer-element name="fin-hypergrid-feature-thumbwheel-scrolling" extends="fin-hypergrid-feature-base" assetpath="/components/fin-hypergrid/polymer/html/features/">
  <template>
    <style type="text/css">:host {
    display: block;
    position: relative;
}















































































































































































</style>
  </template>
  <script>'use strict';
/**
 *
 * @module features\thumbwheel-scrolling
 *
 */
(function() {

    Polymer('fin-hypergrid-feature-thumbwheel-scrolling',{ /* jshint ignore:line */

        /**
        * @function
        * @instance
        * @description
         handle this event down the feature chain of responsibility
         * @param {fin-hypergrid} grid - [fin-hypergrid](module-._fin-hypergrid.html)
         * @param {Object} event - the event details
        */
        handleWheelMoved: function(grid, e) {
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
    });

})(); /* jshint ignore:line */
</script>
</polymer-element>