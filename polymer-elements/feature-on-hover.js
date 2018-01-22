<polymer-element name="fin-hypergrid-feature-on-hover" extends="fin-hypergrid-feature-base" assetpath="/components/fin-hypergrid/polymer/html/features/">
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
 * @module features\on-hover
 *
 */
(function() {

    //var noop = function() {};

    //var ANIMATION_TIME = 200;

    Polymer('fin-hypergrid-feature-on-hover',{ /* jshint ignore:line */

        /**
        * @function
        * @instance
        * @description
         handle this event down the feature chain of responsibility
         * @param {fin-hypergrid} grid - [fin-hypergrid](module-._fin-hypergrid.html)
         * @param {Object} event - the event details
        */
        handleMouseMove: function(grid, event) {
            var currentHoverCell = grid.getHoverCell();
            if (!event.gridCell.equals(currentHoverCell)) {
                if (currentHoverCell) {
                    this.handleMouseExit(grid, currentHoverCell);
                }
                this.handleMouseEnter(grid, event);
                grid.setHoverCell(event.gridCell);
            } else {
                if (this.next) {
                    this.next.handleMouseMove(grid, event);
                }
            }
        }
    });

})(); /* jshint ignore:line */
</script>
</polymer-element>