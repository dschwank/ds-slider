'use strict';
angular.module('ds.slider', []);
'use strict';
angular.module('ds.slider').directive('dsSlider', [
    '$document',
    '$log',
    'dsSliderService',
    function ($document, $log, dsSliderService) {
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
                var mElements = {}, mStart = {
                    left: 0,
                    width: 100
                }, mUpdateThrottle = attrs.updateThrottle || 20, mBroadcastEnabled = attrs.enableBroadcast, mApplyEnabled = attrs.enableApply, mUpdateThrottleTimeout;

                function findElement(parentElement, classTag) {
                    return angular.element(parentElement.querySelector(classTag));
                }

                function determineTotalWidth() {
                    return element[0].clientWidth - 36;
                }

                function updateSlider(type, moveDelta) {
                    // calculate the percentage value
                    scope.data[type + 'Per'] = dsSliderService.calculatePer(type, mStart.startVal, moveDelta, mStart.min, mStart.max);
                    // calculate the _real_ value
                    scope.data[type] = dsSliderService.calculateVal(parseFloat(scope.min), mStart.multiplier, scope.step, scope.data[type + 'Per']);
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
                        if (!mUpdateThrottleTimeout) {
                            mUpdateThrottleTimeout = setTimeout(function () {
                                updateSlider(type, (event.clientX - mStart.x) / mStart.totalWidth);
                                mUpdateThrottleTimeout = undefined;
                            }, mUpdateThrottle);
                        }
                        event.preventDefault();
                    };
                }

                function mouseUp(moveEvent) {
                    var handler = function (event) {
                        event.preventDefault();
                        $document.unbind('mousemove', moveEvent);
                        $document.unbind('mouseup', handler);  // $log.info('min: ' + scope.data.min + ', max: ' + scope.data.max);
                    };
                    return handler;
                }

                function startSlide(event, maxVal) {
                    mStart.x = event.clientX;
                    // startPosition of the move
                    mStart.width = parseFloat(mElements.positioner.css('width'));
                    mStart.width = !mStart.width && mStart.width !== 0 ? 100 : mStart.width;
                    mStart.left = parseFloat(mElements.positioner.css('left')) || 0;
                    mStart.totalWidth = determineTotalWidth();
                    mStart.startVal = maxVal ? mStart.width + mStart.left : mStart.left;
                    mStart.min = maxVal ? mStart.left : 0;
                    mStart.max = maxVal ? 100 : mStart.width + mStart.left;
                    mStart.multiplier = (scope.max - scope.min) / 100 / scope.step;
                    event.preventDefault();
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
                    scope.data.minPer = 100 / (scope.max - scope.min) * (scope.data.min - scope.min);
                    scope.data.maxPer = 100 / scope.max * scope.data.max;
                    scope.showShortInfo = attrs.enableShortInfo;
                }

                function reformat(type) {
                    if (type) {
                        if (type === 'min' && !mStart.left) {
                            mStart.left = scope.data[type + 'Per'];
                        }
                        dsSliderService.updateCSSPosition(mElements.positioner, type, mStart.left, mStart.width, scope.data[type + 'Per']);
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
    }
]);
'use strict';
angular.module('ds.slider').factory('dsSliderService', function () {
    function calculatePer(type, startVal, delta, minPer, maxPer) {
        var tPercentage = startVal + delta * 100;
        // correct the percentage value
        if (type === 'max') {
            tPercentage = tPercentage < minPer ? minPer : tPercentage > 100 ? 100 : tPercentage;
        } else {
            tPercentage = tPercentage < 0 ? 0 : tPercentage > maxPer ? maxPer : tPercentage;
        }
        return tPercentage;
    }

    function calculateVal(min, multiplier, step, percentage) {
        return parseInt(min) + Math.ceil(percentage * multiplier) * step;
    }

    function updateCSSPosition(positionerElement, type, startLeft, startWidth, newVal) {
        if (type === 'max') {
            positionerElement.css({ width: newVal - startLeft + '%' });
        } else {
            positionerElement.css({
                width: startWidth + startLeft - newVal + '%',
                left: newVal + '%'
            });
        }
    }

    function Slider() {
        var that = this instanceof Slider ? this : Object.create(Slider.prototype);
        that.startX = 0;
        that.width = 0;
        that.left = 0;
        that.totalWidth = 0;
        that.startVal = 0;
        that.min = 0;
        that.max = 0;
        that.multiplier = 0;
        return that;
    }

    Slider.prototype.getMultiplier = function (scope) {
        return (scope.max - scope.min) / 100 / scope.step;
    };
    return {
        calculatePer: function (type, startVal, delta, minPer, maxPer) {
            return calculatePer(type, startVal, delta, minPer, maxPer);
        },
        calculateVal: function (min, multiplier, step, percentage) {
            return calculateVal(min, multiplier, step, percentage);
        },
        updateCSSPosition: function (positionerElement, type, startLeft, startWidth, newVal) {
            updateCSSPosition(positionerElement, type, startLeft, startWidth, newVal);
        },
        initSliderObj: function () {
            return new Slider();
        }
    };
});