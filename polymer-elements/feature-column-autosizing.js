<polymer-element name="fin-hypergrid-feature-column-autosizing" extends="fin-hypergrid-feature-base" assetpath="/components/fin-hypergrid/polymer/html/features/">
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
 * @module features\column-autosizing
 *
 */
(function() {

    Polymer('fin-hypergrid-feature-column-autosizing', { /* jshint ignore:line  */

        /**
        * @function
        * @instance
        * @description
         handle this event down the feature chain of responsibility
         * @param {fin-hypergrid} grid - [fin-hypergrid](module-._fin-hypergrid.html)
         * @param {Object} event - the event details
        */
        handleDoubleClick: function(grid, event) {
            var fixedRowCount = grid.getFixedRowCount();
            var fixedColCount = grid.getFixedColumnCount();
            var gridCell = event.gridCell;
            if (gridCell.y <= fixedRowCount) {
                var col = grid.getHScrollValue() + gridCell.x - fixedColCount;
                grid.autosizeColumn(col);
            } else if (this.next) {
                this.next.handleDoubleClick(grid, event);
            }
        }
    });

})(); /* jshint ignore:line */
</script>
</polymer-element>