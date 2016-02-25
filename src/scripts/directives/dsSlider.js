"use strict";

angular.module('ds.slider')
    .directive('dsSlider', function($document, $log, dsSliderService) {
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
    });