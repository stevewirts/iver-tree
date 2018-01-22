<polymer-element name="fin-hypergrid-cell-editor-choice" extends="fin-hypergrid-cell-editor-simple" assetpath="/components/fin-hypergrid/polymer/html/cell-editors/">
  <template>
    <style type="text/css">:host {
    display: block;
    position: relative;
}















































































































































































</style>
    <select id="editor">
      <option template="" repeat="{{item in items}}" value="{{item}}">{{item}}</option>
    </select>
  </template>
  <script>'use strict';
/**
 *
 * @module cell-editors\choice
 *
 */
(function() {

    Polymer('fin-hypergrid-cell-editor-choice',{ /* jshint ignore:line */

        /**
         * @property {string} alias - my lookup alias
         * @instance
         */
        alias: 'choice',

        /**
         * @property {Array} items - the list of items to pick from
         * @instance
         */
        items: [],

        /**
        * @function
        * @instance
        * @description
        how much should I offset my bounds from 0,0
        */
        originOffset: function() {
            return [-1, -1];
        },
    });

})(); /* jshint ignore:line */
</script>
</polymer-element>