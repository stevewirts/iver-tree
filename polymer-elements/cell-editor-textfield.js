<polymer-element name="fin-hypergrid-cell-editor-textfield" extends="fin-hypergrid-cell-editor-simple" assetpath="/components/fin-hypergrid/polymer/html/cell-editors/">
  <template>
    <style type="text/css">:host {
    display: block;
    position: relative;
}















































































































































































</style>
    <input id="editor">
  </template>
  <script>'use strict';
/**
 *
 * @module cell-editors\textfield
 *
 */
(function() {

    Polymer('fin-hypergrid-cell-editor-textfield',{ /* jshint ignore:line */

        /**
         * @property {string} alias - my lookup alias
         * @instance
         */
        alias: 'textfield',

        /**
        * @function
        * @instance
        * @description
        select everything
        */
        selectAll: function() {
            this.input.setSelectionRange(0, this.input.value.length);
        }
    });

})(); /* jshint ignore:line */
</script>
</polymer-element>