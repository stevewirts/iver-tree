<polymer-element name="fin-rectangle" assetpath="/components/fin-rectangle/">
  <script>

'use strict';

(function() {

    function pointEqualsPoint(a, b) {
        return a.x === b.x && a.y === b.y;
    }

    function rectangleContains(rect, x, y) {
        var minX = rect.origin.x;
        var minY = rect.origin.y;
        var maxX = minX + rect.extent.x;
        var maxY = minY + rect.extent.y;

        if (rect.extent.x < 0) {
            minX = maxX;
            maxX = rect.origin.x;
        }

        if (rect.extent.y < 0) {
            minY = maxY;
            maxY = rect.origin.y;
        }

        var result =
            x >= minX &&
            y >= minY &&
            x <= maxX &&
            y <= maxY;

        return result;
    }

    function createPoint(x, y) {

        var that = {};

        /**
         * The x of this point expressed as a number,
         *
         * @property point.x
         * @type number
         * @default '0'
         */
        Object.defineProperty(that, 'x', {
            value: x || 0,
            writable: false,
            enumerable: true,
            configurable: false
        });


        /**
         * The y of this point expressed as a number,
         *
         * @property point.y
         * @type number
         * @default '0'
         */
        Object.defineProperty(that, 'y', {
            value: y || 0,
            writable: false,
            enumerable: true,
            configurable: false
        });


        /**
         *                                                                      .
         *                                                                      .
         * returns an instance of point that is the sum of self and the argument.
         *
         * @method point.plus(point)
         * @param {point} a point to add to self
         * @returns {point} point object.
         */
        that.plus = function(point) {
            var result = createPoint(this.x + point.x, this.y + point.y);
            return result;
        };

        /**
         *                                                                      .
         *                                                                      .
         * returns an instance of point that is the sum of self and the argument.
         *
         * @method point.plus(point)
         * @param {point} a point to add to self
         * @returns {point} point object.
         */
        that.plusXY = function(newX, newY) {
            var result = createPoint(this.x + newX, this.y + newY);
            return result;
        };

        /**
         *                                                                      .
         *                                                                      .
         * returns an instance of point that is the difference of self and the argument.
         *
         * @method point.minus(point)
         * @param {point} a point to subtract from self
         * @returns {point} point object.
         */
        that.minus = function(point) {
            var result = createPoint(this.x - point.x, this.y - point.y);
            return result;
        };


        /**
         *                                                                      .
         *                                                                      .
         * returns an instance of point that is the min x and y of self and the argument.
         *
         * @method point.min(point)
         * @param {point} a point to source min x and min y against self
         * @returns {point} point object.
         */
        that.min = function(point) {
            var result = createPoint(Math.min(this.x, point.x), Math.min(this.y, point.y));
            return result;
        };


        /**
         *                                                                      .
         *                                                                      .
         * returns an instance of point that is the max x and y of self and the argument.
         *
         * @method point.max(point)
         * @param {point} a point to source max x and max y against self
         * @returns {point} point object.
         */
        that.max = function(point) {
            var result = createPoint(Math.max(this.x, point.x), Math.max(this.y, point.y));
            return result;
        };

        /**
         *                                                                      .
         *                                                                      .
         * returns distance between the argment and self using the distance formula.
         *
         * @method point.distance(point)
         * @param {point} a point to compute the distance from self
         * @returns {Number} number object.
         */
        that.distance = function(point) {
            var dx = point.x - this.x,
                dy = point.y - this.y,
                result = Math.sqrt((dx * dx) + (dy * dy));
            return result;
        };

        /**
         *                                                                      .
         *                                                                      .
         * returns if both x and y of self is greater than that of the argument.
         *
         * @method point.greaterThan(point)
         * @param {point} a point to compare against self
         * @returns {boolean} boolean value.
         */
        that.greaterThan = function(point) {
            var result = this.x > point.x && this.y > point.y;
            return result;
        };

        /**
         *                                                                      .
         *                                                                      .
         * returns if both x and y of self is less than that of the argument.
         *
         * @method point.lessThan(point)
         * @param {point} a point to compare against self
         * @returns {boolean} boolean value.
         */
        that.lessThan = function(point) {
            var result = this.x < point.x && this.y < point.y;
            return result;
        };

        /**
         *                                                                      .
         *                                                                      .
         * returns if both x and y of self is greater than or equal to that of the argument.
         *
         * @method point.greaterThanEqualTo(point)
         * @param {point} a point to compare against self
         * @returns {boolean} boolean value.
         */
        that.greaterThanEqualTo = function(point) {
            var result = this.x >= point.x && this.y >= point.y;
            return result;
        };

        /**
         *                                                                      .
         *                                                                      .
         * returns if both x and y of self is less than or equal to that of the argument.
         *
         * @method point.lessThanEqualTo(point)
         * @param {point} a point to compare against self
         * @returns {boolean} boolean value.
         */
        that.lessThanEqualTo = function(point) {
            var result = this.x <= point.x && this.y <= point.y;
            return result;
        };
        that.isContainedWithinRectangle = function(rect) {
            return rectangleContains(rect, this.x, this.y);
        };
        that.equals = function(point) {
            if (!point) {
                return false;
            }
            return pointEqualsPoint(this, point);
        };
        return that;
    }

    function createRectangle(x, y, width, height) {

        var that = {};

        /**
         * The origin of this rectangle expressed as a point object,
         *
         * @property rectangle.origin
         * @type point
         * @default 'point at 0,0'
         */
        var origin = createPoint(x, y);

        /**
         * The extent of this rectangle expressed as a point object,
         *
         * @property rectangle.extent
         * @type point
         * @default 'point at 0,0'
         */
        var extent = createPoint(width, height);

        /**
         * The corner of this rectangle expressed as a point object,
         *
         * @property rectangle.corner
         * @type point
         * @default 'point at 0,0'
         */
        var corner = createPoint(x + width, y + height);

        /**
         * The center of this rectangle expressed as a point object,
         *
         * @property rectangle.center
         * @type point
         * @default 'point at 0,0'
         */
        var center = createPoint(x + (width / 2), y + (height / 2));

        Object.defineProperty(that, 'origin', {
            value: origin,
            writable: false,
            enumerable: true,
            configurable: false
        });

        Object.defineProperty(that, 'extent', {
            value: extent,
            writable: false,
            enumerable: true,
            configurable: false
        });

        Object.defineProperty(that, 'corner', {
            value: corner,
            writable: false,
            enumerable: true,
            configurable: false
        });

        Object.defineProperty(that, 'center', {
            value: center,
            writable: false,
            enumerable: true,
            configurable: false
        });

        /**
         *                                                                      .
         *                                                                      .
         * returns this.origin.y, this may need to change
         *
         * @method rectangle.top()
         */
        that.top = function() {
            return this.origin.y;
        };

        /**
         *                                                                      .
         *                                                                      .
         * returns this.origin.x, this may need to change
         *
         * @method rectangle.left()
         */
        that.left = function() {
            return this.origin.x;
        };

        /**
         *                                                                      .
         *                                                                      .
         * returns this.top() + this.extent.y, this may need to change
         *
         * @method rectangle.bottom()
         */
        that.bottom = function() {
            return this.top() + this.extent.y;
        };

        /**
         *                                                                      .
         *                                                                      .
         * returns this.left() + this.extent.x, this may need to change
         *
         * @method rectangle.right()
         */
        that.right = function() {
            return this.left() + this.extent.x;
        };

        /**
         *                                                                      .
         *                                                                      .
         * returns this.extent.x
         *
         * @method rectangle.width()
         */
        that.width = function() {
            return this.extent.x;
        };

        /**
         *                                                                      .
         *                                                                      .
         * returns this.extent.y
         *
         * @method rectangle.height()
         */
        that.height = function() {
            return this.extent.y;
        };

        /**
         *                                                                      .
         *                                                                      .
         * returns this.extent.x * this.extent.y
         *
         * @method rectangle.area()
         */
        that.area = function() {
            return this.extent.x * this.extent.y;
        };

        /**
         *                                                                      .
         *                                                                      .
         * returns a rectangle width 0 and origin x set to argument
         *
         * @method rectangle.flattenXAt(x)
         */
        that.flattenXAt = function(x) {
            var o = this.origin;
            var e = this.extent;
            return createRectangle(x, o.y, 0, e.y);
        };

        /**
         *                                                                      .
         *                                                                      .
         * returns a rectangle height 0 and origin y set to argument
         *
         * @method rectangle.flattenYAt(y)
         */
        that.flattenYAt = function(y) {
            var o = this.origin;
            var e = this.extent;
            return createRectangle(o.x, y, e.x, 0);
        };

        /**
         *                                                                      .
         *                                                                      .
         * returns true if argument point or rectangle is entirely contained inside self
         *
         * @method rectangle.contains(pointOrRect)
         */
        that.contains = function(pointOrRect) {
            var result = pointOrRect.isContainedWithinRectangle(this);
            return result;
        };

        that.isContainedWithinRectangle = function(rect) {
            var result = rect.origin.lessThanEqualTo(this.origin) && rect.corner.greaterThanEqualTo(this.corner);
            return result;
        };

        /**
         *                                                                      .
         *                                                                      .
         * return a Rectangle that is enlarged/shrunk by argument size
         *
         * @method rectangle.insetBy(thickness)
         */
        that.insetBy = function(thickness) {
            var result = createRectangle(
                this.origin.x + thickness,
                this.origin.y + thickness,
                this.extent.x - 2 * thickness,
                this.extent.y - 2 * thickness);
            return result;
        };

        /**
         *                                                                      .
         *                                                                      .
         * return a Rectangle that contains the receiver and the argument
         *
         * @method rectangle.union(rectangle)
         */
        that.union = function(rectangle) {

            var anOrigin = this.origin.min(rectangle.origin),
                aCorner = this.corner.max(rectangle.corner),
                width = aCorner.x - anOrigin.x,
                height = aCorner.y - anOrigin.y,
                result = createRectangle(anOrigin.x, anOrigin.y, width, height);

            return result;
        };

        /**
         *                                                                      .
         *                                                                      .
         * iterate over all points inside me calling function(x,y) for each
         *
         * @method rectangle.forEach(function)
         */
        that.forEach = function(func) {
            var xstart = this.origin.x;
            var xstop = this.origin.x + this.extent.x;
            var ystart = this.origin.y;
            var ystop = this.origin.y + this.extent.y;
            for (var x = xstart; x < xstop; x++) {
                for (var y = ystart; y < ystop; y++) {
                    func(x, y);
                }
            }
        };

        /**
         *                                                                      .
         *                                                                      .
         * returns a Rectangle that is the area in which the receiver overlaps with the argument.  ifNoneAction is called if there is no intersection; it has arguments this and rectangle passed in
         *
         * @method rectangle.intersect(rectangle,ifNoneAction)
         */
        that.intersect = function(rectangle, ifNoneAction) {

            var point = rectangle.origin,
                myCorner = this.corner,
                left = null,
                right = null,
                top = null,
                bottom = null,
                result = null;

            if (ifNoneAction && !this.intersects(rectangle)) {
                return ifNoneAction.call(this, rectangle);
            }

            if (point.x > this.origin.x) {
                left = point.x;
            } else {
                left = this.origin.x;
            }

            if (point.y > this.origin.y) {
                top = point.y;
            } else {
                top = this.origin.y;
            }

            point = rectangle.corner;
            if (point.x < myCorner.x) {
                right = point.x;
            } else {
                right = myCorner.x;
            }

            if (point.y < myCorner.y) {
                bottom = point.y;
            } else {
                bottom = myCorner.y;
            }
            result = createRectangle(left, top, right - left, bottom - top);
            return result;
        };

        /**
         *                                                                      .
         *                                                                      .
         * returns true if we overlap with the argument, false otherwise
         *
         * @method rectangle.intersects(rectangle)
         */
        that.intersects = function(rectangle) {

            var rOrigin = rectangle.origin,
                rCorner = rectangle.corner;

            if (rCorner.x <= this.origin.x) {
                return false;
            }
            if (rCorner.y <= this.origin.y) {
                return false;
            }
            if (rOrigin.x >= this.corner.x) {
                return false;
            }
            if (rOrigin.y >= this.corner.y) {
                return false;
            }
            return true;
        };

        return that;
    }

    /**
     *                                                                        .
     *                                                                      .
     * returns an instance of point.
     *
     * @method static.point.create(x,y)
     * @param {Number} the x coordinate
     *    @param {Number} the y coordinate.
     * @returns {point} point object.
     */

    /**
     *                                                                      .
     *                                                                      .
     * returns an instance of rectangle.
     *
     * @method static.rectangle.create(ox,oy,ex,ey)
     * @param {Number} the x origin coordinate
     *    @param {Number} the y origin coordinate.
     *    @param {Number} the width extent.
     *    @param {Number} the height extent.
     * @returns {rectangle} rectangle object.
     */

    /**
     *                                                                      .
     *                                                                      .
     * returns if a rectangle contains x, y.
     *
     * @method static.rectangle.contains(rectangle,x,y)
     * @param {rectangle} an instance of rectangle
     *    @param {Number} the x coordinate.
     *    @param {Number} the y coordinate.
     * @returns {rectangle} rectangle object.
     */
    Polymer('fin-rectangle', { /* jshint ignore:line  */
        point: {
            create: createPoint
        },
        rectangle: {
            create: createRectangle,
            contains: rectangleContains
        }
    });

})();

  </script>
</polymer-element>