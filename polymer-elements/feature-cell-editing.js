<polymer-element name="fin-hypergrid-feature-cell-editing" extends="fin-hypergrid-feature-base" assetpath="/components/fin-hypergrid/polymer/html/features/">
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
 * @module features\cell-editing
 *
 */
(function() {

    Polymer('fin-hypergrid-feature-cell-editing',{ /* jshint ignore:line */

        /**
        * @function
        * @instance
        * @description
         handle this event down the feature chain of responsibility
         * @param {fin-hypergrid} grid - [fin-hypergrid](module-._fin-hypergrid.html)
         * @param {Object} event - the event details
        */
        handleDoubleClick: function(grid, event) {
            var fixedColCount = grid.getFixedColumnCount();
            var fixedRowCount = grid.getFixedRowCount();
            var gridCell = event.gridCell;
            if (gridCell.x >= fixedColCount && gridCell.y >= fixedRowCount) {
                var x = grid.getHScrollValue() + gridCell.x - fixedColCount;
                var y = grid.getVScrollValue() + gridCell.y - fixedRowCount;
                event.gridCell = grid.rectangles.point.create(x, y);
                grid._activateEditor(event);
            } else if (this.next) {
                this.next.handleDoubleClick(grid, event);
            }
        },

        /**
        * @function
        * @instance
        * @description
         handle this event down the feature chain of responsibility
         * @param {fin-hypergrid} grid - [fin-hypergrid](module-._fin-hypergrid.html)
         * @param {Object} event - the event details
        */
        handleHoldPulse: function(grid, mouseEvent) {
            var primEvent = mouseEvent.primitiveEvent;
            if (primEvent.detail.count < 2) {
                return;
            }
            grid._activateEditor(mouseEvent);
        },
    });

})(); /* jshint ignore:line */
</script>
</polymer-element>