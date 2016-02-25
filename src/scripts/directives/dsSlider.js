"use strict";

angular.module('ds.slider')
    .directive('dsSlider', function ($document, $log, dsSliderService) {
        return {
            restrict: 'EA',
            replace: true,
            require: '^ngModel',
            scope: {
                min: '@',
                max: '@',
                step: '@?',
                data: '=?ngModel'
            },
            link: function (scope, element, attrs, ngModel) {

                var mElements = {},
                    mStart = {
                        left: 0,
                        width: 100
                    },
                    mUpdateThrottle = attrs.updateThrottle || 20,
                    mBroadcastEnabled = attrs.enableBroadcast,
                    mApplyEnabled = attrs.enableApply,
                    mUpdateThrottleTimeout;

                function findElement(parentElement, classTag) {
                    return angular.element(parentElement.querySelector(classTag));
                }

                function determineTotalWidth() {
                    return element[0].clientWidth - 36;
                }

                function updateSlider(type, moveDelta) {

                    var tVal;

                    // calculate the percentage value
                    tVal = Math.ceil((dsSliderService.calculatePer(type, mStart, moveDelta, parseFloat(scope.min), parseFloat(scope.max))));

                    scope.data[type] = tVal;

                    scope.data[type + 'Per'] = (tVal - parseFloat(scope.min)) / mStart.multiplier * 100;
                    if (mBroadcastEnabled) {
                        scope.$broadcast('dsSliderChange', scope.data);
                        scope.$digest();
                    } else {
                        scope.$apply();
                    }

                    // finally reformat the slider
                    reformat(type);
                }

                function mouseMove(type) {
                    return function (event) {
                        // throttle the update calls by the given value of mUpdateThrottle

                        var tEvent = event.originalEvent || event;

                        if (!mUpdateThrottleTimeout) {
                            mUpdateThrottleTimeout = setTimeout(function () {
                                updateSlider(type, (tEvent.clientX - mStart.x) * mStart.perPx);
                                mUpdateThrottleTimeout = undefined;
                            }, mUpdateThrottle);
                        }
                        tEvent.preventDefault();

                    };
                }

                function mouseUp(moveEvent) {
                    var handler = function (event) {
                        var tEvent = event.originalEvent || event;

                        tEvent.preventDefault();
                        $document.unbind('mousemove', moveEvent);
                        $document.unbind('mouseup', handler);
                        // $log.info('min: ' + scope.data.min + ', max: ' + scope.data.max);
                    };

                    return handler;
                }

                function startSlide(event, maxVal) {

                    var tEvent = event.originalEvent || event;

                    mStart.x = tEvent.clientX; // startPosition of the move
                    mStart.totalWidth = determineTotalWidth();
                    mStart.min = scope.data.min;
                    mStart.minPer = scope.data.minPer;
                    mStart.max = scope.data.max;
                    mStart.maxPer = scope.data.maxPer;
                    mStart.step = scope.step;
                    mStart.multiplier = scope.max - scope.min;
                    mStart.perPx = (scope.max - scope.min) / (mStart.totalWidth);

                    tEvent.preventDefault();
                }

                function mouseDown(scopeVar) {
                    return function (event) {
                        startSlide(event, scopeVar === 'max');
                        var tMoveFn = mouseMove(scopeVar);
                        $document.on('mousemove', tMoveFn);
                        $document.on('mouseup', mouseUp(tMoveFn));
                    };
                }

                function findSlideElements() {
                    mElements = {
                        min: findElement(element[0], '.minSlider'),
                        positioner: findElement(element[0], '.positioner'),
                        max: findElement(element[0], '.maxSlider')
                    };
                }

                function initScopeValues() {
                    // should already be set
                    // $scope.min = $scope.min || 0;
                    // $scope.max = $scope.max || 100;

                    // init default values
                    scope.step = scope.step || 1;
                    scope.data = scope.data || {
                            min: scope.min,
                            max: scope.max
                        };

                    // init percentage values
                    scope.data.minPer = ((scope.data.min - scope.min) / (scope.max - scope.min) * 100);
                    scope.data.maxPer = ((scope.data.max - scope.min) / (scope.max - scope.min) * 100);

                    scope.showShortInfo = attrs.enableShortInfo;
                }

                function reformat(type) {
                    if (type) {
                        dsSliderService.updateCSSPosition(mElements.positioner, type, scope.data);
                    } else {
                        reformat('min');
                        reformat('max');
                    }
                }

                function initElements() {
                    mElements.min.on('mousedown', mouseDown('min'));

                    mElements.max.on('mousedown', mouseDown('max'));

                    reformat();
                }

                (function init() {

                    initScopeValues();

                    findSlideElements();
                    initElements();

                }());

            },
            templateUrl: 'src/templates/dsSlider.tpl.html'
        };
    });