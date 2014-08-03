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
                min: '@?',
                max: '@?',
                step: '@?',
                data: '=?ngModel'
            },
            link: function ($scope, $element) {
                var mElements = {}, mStart = {
                    left: 0,
                    width: 100
                };
                var WIDTH_DELTA = -44;
                // .tsiSlider.container { padding-left: 10px; padding-right: 34px; } => -44px
                function findElement(parentElement, classTag) {
                    return angular.element(parentElement.querySelector(classTag));
                }

                function determineTotalWidth() {
                    return $element[0].clientWidth + WIDTH_DELTA;
                }

                function updateSliderPosition(type, percentage) {
                    dsSliderService.updateCSSPosition(mElements.positioner, type, mStart.left, mStart.width, percentage);
                }

                function updateScopeValue(type, percentage) {
                    $scope.data[type] = dsSliderService.calculateVal(parseInt($scope.min), mStart.multiplier, $scope.step, percentage);
                    $scope.$apply();
                }

                function updateSlider(type, moveDelta) {
                    var tPercentage = dsSliderService.calculatePer(type, mStart.startVal, moveDelta, mStart.min, mStart.max);
                    updateSliderPosition(type, tPercentage);
                    updateScopeValue(type, tPercentage);
                }

                function mouseMove(type) {
                    return function (event) {
                        updateSlider(type, (event.clientX - mStart.x) / mStart.totalWidth);
                        event.preventDefault();
                    };
                }

                function mouseUp(moveEvent) {
                    var handler = function (event) {
                        event.preventDefault();
                        $document.unbind('mousemove', moveEvent);
                        $document.unbind('mouseup', handler);
                        $log.info('min: ' + $scope.data.min + ', max: ' + $scope.data.max);
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
                    mStart.multiplier = ($scope.max - $scope.min) / 100 / $scope.step;
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
                        min: findElement($element[0], '.minSlider'),
                        positioner: findElement($element[0], '.positioner'),
                        max: findElement($element[0], '.maxSlider')
                    };
                }

                function initScopeValues() {
                    // init default values
                    $scope.min = $scope.min || 0;
                    $scope.max = $scope.max || 100;
                    $scope.step = $scope.step || 1;
                    $scope.data = $scope.data || {
                        min: 0,
                        max: $scope.max
                    };
                }

                function initElementEvents() {
                    mElements.min.on('mousedown', mouseDown('min'));
                    mElements.max.on('mousedown', mouseDown('max'));
                }

                (function init() {
                    initScopeValues();
                    findSlideElements();
                    initElementEvents();
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

    return {
        calculatePer: function (type, startVal, delta, minPer, maxPer) {
            return calculatePer(type, startVal, delta, minPer, maxPer);
        },
        calculateVal: function (min, multiplier, step, percentage) {
            return calculateVal(min, multiplier, step, percentage);
        },
        updateCSSPosition: function (positionerElement, type, startLeft, startWidth, newVal) {
            updateCSSPosition(positionerElement, type, startLeft, startWidth, newVal);
        }
    };
});