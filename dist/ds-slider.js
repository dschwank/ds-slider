(function() {
  'use strict';

  angular.module('ds.slider', []);
}());

"use strict";

angular.module('ds.slider')
    .directive('dsSlider', ["$document", "$log", "dsSliderService", function($document, $log, dsSliderService) {
      return {
        restrict: 'EA',
        replace: true,
        require: '^ngModel',
        scope: {
          minBorder: '@min',
          maxBorder: '@max',
          step: '@?'
        },
        link: function(scope, element, attrs, ngModel) {

          var mConfig = {
                elements: {},
                start: {},
                data: {},
                throttle: attrs.updateThrottle || 50
              },
              mUpdateThrottleTimeout;

          function mouseMove(type) {
            return function(event) {
              var tEvent;

              tEvent = event.originalEvent || event;

              if (!mUpdateThrottleTimeout) {
                mUpdateThrottleTimeout = setTimeout(function() {
                  var tModelValue;

                  dsSliderService.sliderMovedTo(mConfig, type, tEvent.clientX);

                  tModelValue = dsSliderService.prepareModelValue(mConfig);

                  ngModel.$setViewValue(tModelValue);
                  mUpdateThrottleTimeout = undefined;
                }, mConfig.throttle);
              }

              tEvent.preventDefault();
            };
          }

          function mouseUp(moveEvent) {
            var handler = function(event) {
              var tEvent = event.originalEvent || event;

              tEvent.preventDefault();
              $document.off('mousemove', moveEvent);
              $document.off('mouseup', handler);
            };

            return handler;
          }

          function mouseDown(type) {
            return function(event) {
              var tMoveFn;

              dsSliderService.startSlide(mConfig, event);

              tMoveFn = mouseMove(type);

              $document.on('mousemove', tMoveFn);
              $document.on('mouseup', mouseUp(tMoveFn));
            };
          }

          ngModel.$render = function() {
            $log.debug('RENDER');
            mConfig.data.min = parseFloat(ngModel.$viewValue.min);
            mConfig.data.max = parseFloat(ngModel.$viewValue.max);

            dsSliderService.startSlide(mConfig);

            dsSliderService.sliderMovedBy(mConfig, 'min');
            dsSliderService.sliderMovedBy(mConfig, 'max');
          };

          scope.$watchGroup(['minBorder', 'maxBorder', 'step'], function(values) {
            mConfig.data.minBorder = parseFloat(values[0]);
            mConfig.data.maxBorder = parseFloat(values[1]);
            mConfig.data.step = angular.isDefined(values[2]) ? parseFloat(values[2]) : 0;

            dsSliderService.startSlide(mConfig);
            dsSliderService.sliderMovedBy(mConfig, 'min');
            dsSliderService.sliderMovedBy(mConfig, 'max');
          });

          (function initElements() {
            mConfig.elements = dsSliderService.findElements(element);

            mConfig.elements.min.on('mousedown', mouseDown('min'));

            mConfig.elements.max.on('mousedown', mouseDown('max'));

            dsSliderService.startSlide(mConfig);
          }());

        },
        templateUrl: 'src/templates/dsSlider.tpl.html'
      };
    }]);
(function() {
  'use strict';

  angular.module('ds.slider')
      .factory('dsSliderService', function() {

        var mPublicApi;

        mPublicApi = {
          changeValue: changeValue,
          determineTotalWidth: determineTotalWidth,
          findElements: findElements,
          prepareModelValue: prepareModelValue,
          sliderMovedBy: sliderMovedBy,
          sliderMovedTo: sliderMovedTo,
          startSlide: startSlide,
          updateCSS: updateCSS
        };

        return mPublicApi;

        /* ##################
         * ### PUBLIC API ###
         * ##################
         */

        function prepareModelValue(config) {

          var tValue;

          tValue = {
            min: _fixValue(config.data.min, config.data.step),
            max: _fixValue(config.data.max, config.data.step)
          };

          return tValue;
        }

        function _fixValue(value, step) {
          var tValue = value;

          if (angular.isNumber(step)) {
            tValue = value - (value % step);
          }

          return tValue;
        }

        function sliderMovedTo(config, type, xPosition) {
          sliderMovedBy(config, type, (xPosition - config.start.x) * config.start.perPx);
        }

        function sliderMovedBy(config, type, by) {
          var tChangedValue;

          tChangedValue = changeValue(config, type, by);
          config.data[type] = tChangedValue;

          config.data[type + 'Per'] =
              (tChangedValue - config.data.minBorder) / config.start.range * 100;

          updateCSS(config.elements.positioner, config.data);
        }

        function startSlide(config, event) {
          var tEvent;

          tEvent = angular.isObject(event) ? (event.originalEvent || event) : {};

          config.start.x = tEvent.clientX;
          config.start.totalWidth = determineTotalWidth(config.elements.parent);
          config.start.min = config.data.min;
          config.start.max = config.data.max;
          config.start.range = config.data.maxBorder - config.data.minBorder;
          config.start.perPx = (config.start.range) / (config.start.totalWidth);
        }

        function determineTotalWidth(parent) {
          return parent[0].clientWidth - 36;
        }

        function findElements(parent) {
          var tElements;

          tElements = {
            parent: parent,
            min: _findElement(parent[0], '.minSlider'),
            positioner: _findElement(parent[0], '.positioner'),
            max: _findElement(parent[0], '.maxSlider')
          };

          return tElements;
        }

        function changeValue(config, type, by) {
          var tValue,
              tLowerBorder,
              tUpperBorder;

          if (type === 'max') {
            tLowerBorder = config.start.min;
            tUpperBorder = config.data.maxBorder;
          } else {
            tLowerBorder = config.data.minBorder;
            tUpperBorder = config.start.max;
          }

          tValue = config.start[type] + (by || 0);

          tValue = tValue < tLowerBorder ? tLowerBorder :
                   tValue > tUpperBorder ? tUpperBorder : tValue;

          return tValue;
        }

        function updateCSS(positioner, data) {
          console.log('UPDATE CSS', data);
          positioner.css({
            width: (data.maxPer - data.minPer) + '%',
            left: data.minPer + '%'
          });
        }

        /* ######################
         * ### HELPER METHODS ###
         * ###################### */

        function _findElement(parent, selector) {
          return angular.element(parent.querySelector(selector));
        }
      });

}());