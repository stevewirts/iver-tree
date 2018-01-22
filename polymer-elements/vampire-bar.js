<polymer-element name="fin-vampire-bar" attributes="" assetpath="/components/fin-vampire-bar/">
  <template>
    <style>
    .scroll-bar {
      width: 13px;
      position: absolute;
      top:0;
      bottom:0;
      background-color: #E7E7E7;
      border: 1px solid #DDDDDD;
    }
    .scroll-bar-gutter {
      position: absolute;
      top: 0%;
      bottom: 0%;
      right: 0%;
      left: 0%;
      margin-top: 15px;
      margin-bottom: 35px;
      border-radius:4px;
    }
    .scroll-bar.horizontal {
      height: 13px;
      width: 100%;
      position: absolute;
      left:0;
      right: 100%;
      top:100%;
    }

    .horizontal .scroll-bar-gutter {
      position: absolute;
      top: 0%;
      bottom: 0%;
      right: 0%;
      left: 0%;
      margin-top: 0px;
      margin-bottom: 0px;
      margin-left: 15px;
      margin-right: 34px;
    }

    .scroll-bar-up {
      position: absolute;
      top: 1px;
      left: 1px;
      width: 12px;
      height: 12px;
      background-color: #B6B6B6;
      border-radius:4px;

      -o-transition:background-color .1s ease-in;
      -ms-transition:background-color .1s ease-in;
      -moz-transition:background-color .1s ease-in;
      -webkit-transition:background-color .1s ease-in;
      /* ...and now for the proper property */
      transition:background-color .1s ease-in;

    }

    .scroll-bar.horizontal .scroll-bar-up {
      position: absolute;
      top: 1px;
      right: 1px;
      left: auto;
      width: 12px;
      height: 12px;
    }

    .scroll-bar-thumb {
      background-color: #B6B6B6;
      width: 8px;
      height: 20px;
      top: 0;
      left: 3px;
      position: absolute;
      border-radius:6px;

      -o-transition:background-color .1s ease-in;
      -ms-transition:background-color .1s ease-in;
      -moz-transition:background-color .1s ease-in;
      -webkit-transition:background-color .1s ease-in;
      /* ...and now for the proper property */
      transition:background-color .1s ease-in;
    }
    .scroll-bar-thumb:hover, .scroll-bar-up:hover, .scroll-bar-down:hover {
      background-color: #4E4E4E;
    }
/*    .scroll-bar-thumb:mousedown {

    }*/

    .scroll-bar.horizontal .scroll-bar-thumb {
      height: 8px;
      width: 20px;
      left: 0px;
      top: 3px;
      position: absolute;
    }

    .scroll-bar-down {
      position: absolute;
      bottom: 1px;
      left: 1px;
      width: 12px;
      height: 12px;
      background-color: #B6B6B6;
      border-radius:4px;

      -o-transition:background-color .1s ease-in;
      -ms-transition:background-color .1s ease-in;
      -moz-transition:background-color .1s ease-in;
      -webkit-transition:background-color .1s ease-in;
      /* ...and now for the proper property */
      transition:background-color .1s ease-in;
    }
    .scroll-bar.horizontal .scroll-bar-down {
      position: absolute;
      top: 1px;
      left: 1px;
      width: 12px;
      height: 12px;
    }

    </style>
    <div class="scroll-bar">
      <div on-holdpulse="{{onUpHold}}" on-tap="{{onUpClick}}" class="scroll-bar-up"></div>
      <div on-holdpulse="{{onGutterHold}}" on-tap="{{onGutterClick}}" class="scroll-bar-gutter">
        <div class="scroll-bar-thumb" draggable="false"></div>
      </div>
      <div on-holdpulse="{{onDownHold}}" on-tap="{{onDownClick}}" class="scroll-bar-down"></div>
    </div>
  </template>

  <script>

'use strict';

(function() {

    // # scroll-bar.js
    //
    // This module defines a custom `<scroll-bar>` element and attaches it to the
    // document.
    //

    var noop = function() {};
    var //templateHolder = document.createElement('div'),
    //SCROLL_BAR_BUTTON_SIZE = 15,
        throttle = function(func, wait, options) {
        var context, args, result;
        var timeout = null;
        var previous = 0;
        if (!options) {
            options = {};
        }

        var later = function() {
            previous = options.leading === false ? 0 : Date.now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) {
                context = args = null;
            }
        };
        return function() {
            var now = Date.now();
            if (!previous && options.leading === false) {
                previous = now;
            }
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                clearTimeout(timeout);
                timeout = null;
                previous = now;
                result = func.apply(context, args);
                if (!timeout) {
                    context = args = null;
                }
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    };

    //templateHolder.innerHTML = require('./templates.js').scrollbar();



    //ScrollBar.prototype = Object.create(window.HTMLElement.prototype);

    Polymer('fin-vampire-bar', { /* jshint ignore:line  */

        setRangeAdapter: function(rangeAdapter) {

            var that = this;

            that.rangeAdapter = rangeAdapter;
            if (that.thumb) {
                that.thumb.rangeAdapter = rangeAdapter;
            }

            rangeAdapter.valueChanged = function() {
                var value = rangeAdapter.getValue();
                if (value || value === 0) {
                    try {
                        that.supressUpdates = true;
                        that.moveToPercent(value);
                    } finally {
                        that.supressUpdates = false;
                    }
                }
            };

        },

        offset: 0,

        // the createdCallback method will be called by the native code
        attached: function() {

            var that = this;

            // get the actionable child elements
            this.bar = this.shadowRoot.querySelector('.scroll-bar');
            this.thumb = this.shadowRoot.querySelector('.scroll-bar-thumb');
            this.gutter = this.shadowRoot.querySelector('.scroll-bar-gutter');

            this.stepUp = this.shadowRoot.querySelector('.scroll-bar-up');
            this.stepDown = this.shadowRoot.querySelector('.scroll-bar-down');

            this.configureOrientation();

            //var bounds = that.bounds = that.getBoundingClientRect();
            that.isScrolling = false;

            that.attachThumbMouseDown()
                .attachThumbMouseMove()
                .attachThumbMouseUp();
        }, // end attaached


        throttledWheelEvent: throttle(function(event) {

            var that = this;

            var directionXY = that.orientation.toUpperCase(),
                styleProperty = directionXY === 'Y' ? 'top' : 'left',
                rangeStop = that.rangeAdapter.rangeStop(),
                currentPercent = ((that.thumb.style && that.thumb.style[styleProperty]) && parseFloat(that.thumb.style[styleProperty])) || 0,
                direction = event['delta' + directionXY] > 0 ? 1 : -1,
                currentPercentAsRows = Math.round(that.rangeAdapter.rangeStop() * currentPercent),
                oneMoreRow = Math.round(currentPercentAsRows + (1 * direction)),
                ranged = oneMoreRow / rangeStop / 100;

            ranged = ranged > 1 ? 1 : ranged;
            ranged = ranged < 0 ? 0 : ranged;

            that.rangeAdapter.setValue(ranged);

        }, 30),

        attachWheelEvent: function() {
            var that = this;

            document.addEventListener('wheel', function(event) {
                // dont pull on the page at all
                event.preventDefault();
                that.throttledWheelEvent(event);
            });

            return that;
        },

        attachThumbMouseDown: function() {
            var that = this;

            that.thumb.addEventListener('mousedown', function(event) {
                noop(event);
                that.isScrolling = true;
                var direction = that.orientation === 'y' ? 'top' : 'left';
                var distanceFromEdge = that.gutter.getBoundingClientRect()[direction];
                if (that.orientation === 'y') {
                    that.offset = distanceFromEdge + 11; //event.y || event.clientY + distanceFromEdge;
                } else {
                    that.offset = distanceFromEdge + 11; //event.x || event.clientX + distanceFromEdge;
                }

            });

            return that;
        },

        attachThumbMouseMove: function() {
            var that = this;

            document.addEventListener('mousemove', function(event) {
                if (that.isScrolling) {
                    var offset = 0;
                    if (that.orientation === 'y') {
                        offset = event.y || event.clientY;
                    } else {
                        offset = event.x || event.clientX;
                    }
                    that.moveThumb(offset);
                }
            });

            return that;
        },

        attachThumbMouseUp: function() {
            var that = this;
            document.addEventListener('mouseup', function() {
                if (that.isScrolling) {
                    that.offset = 0;
                    that.isScrolling = false;
                }
            });

            return that;
        },



        onUpClick: function() {
            console.log('up click');
        },
        onUpHold: function(event) {
            event.preventTap();
            console.log('hold me up..', Date.now());
        },
        onDownClick: function() {
            console.log('down click');
        },
        onDownHold: function(event) {
            event.preventTap();
            console.log('hold me down ..', Date.now());
        },
        onGutterClick: function() {
            console.log('click');
        },
        onGutterHold: function(event) {
            event.preventTap();
            console.log('hold me in the gutter..', Date.now());
        },

        moveThumb: function(pageLocation) {
            var that = this,
                direction = this.orientation === 'y' ? 'top' : 'left',
                //percent,
                maxScroll = that.getMaxScroll(),
                offBy = pageLocation - that.offset;

            offBy = offBy < 0 ? 0 : offBy;
            offBy = offBy / maxScroll;
            offBy = offBy > 1 ? 1 : offBy;
            offBy = offBy * 100;

            that.thumb.style[direction] = offBy + '%';

            if (that.rangeAdapter) {
                if (that.supressUpdates) {
                    return;
                }
                that.rangeAdapter.setValue(offBy / 100);
            }
        }, //end movethumb value

        moveToPercent: function(percent) {
            var that = this;

            if (!that.isScrolling) {
                that.moveThumb(percent * this.getMaxScroll());
            }
        },


        setValueUpdatedCallback: function(callback) {
            this.valueUpdatedCallback = callback;

        },


        setOrientation: function(orientation) {
            this.orientation = orientation;

        },

        getMaxScroll: function() {
            var direction = this.orientation === 'y' ? 'clientHeight' : 'clientWidth';
            return this.gutter[direction];

        },


        configureOrientation: function() {
            var orientation = 'y';

            if ('horizontal' in this.attributes) {
                orientation = 'x';
                this.bar.classList.add('horizontal');
            }

            this.setOrientation(orientation);
        },

        tickle: function() {
            this.rangeAdapter.setValue(this.lastPercent);
        },

        lastPercent: 0.0,

        createRangeAdapter: function(subject, userConfig) {
            var config = userConfig || {
                    step: 1,
                    page: 40,
                    rangeStart: 0,
                    rangeStop: 100
                },
                that = {};

            // this is the 'cached' value that is listenable
            that.valueObj = {
                value: null
            };

            // apparent Polymer object.observe polyfill breaking change...
            // Object.observe(subject, function() {
            //     that.subjectChanged();
            // });

            that.subjectChanged = function() {
                that.valueObj.value = that.computeNormalizedValue();
                that.valueChanged();
            };

            // that.grid = function(value) {
            //     if (value === undefined) {
            //         return grid;
            //     }
            //     grid = value;
            // };

            that.rangeStart = function(value) {
                if (value === undefined) {
                    return config.rangeStart;
                }
            };

            that.rangeStop = function(value) {
                if (value === undefined) {
                    return config.rangeStop;
                }
            };

            that.page = function(value) {
                if (value === undefined) {
                    return config.page;
                }
            };

            // @param value is a number
            that.setValue = function(newValue) {
                if (typeof newValue !== 'number') {
                    return;
                }
                var deNormalized = Math.floor((newValue * (config.rangeStop - config.rangeStart)) + config.rangeStart);
                subject.setValue(deNormalized);
                that.valueObj.value = newValue;
                that.valueChanged();
            };
            that.computeNormalizedValue = function() {
                var value = (subject.getValue() - config.rangeStart) / (config.rangeStop - config.rangeStart);
                return value;
            };

            that.getValue = function() {
                return that.valueObj.value;
            };

            that.valueChanged = function() {};


            return that;
        }

    });

})();

  </script>
</polymer-element>