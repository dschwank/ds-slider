"use strict";

angular.module('ds.slider')
    .factory('dsSliderService', function () {

        function calculatePer(type, startVal, delta, minPer, maxPer) {
            var tPercentage = startVal + (delta * 100);

            // correct the percentage value
            if (type === 'max') {
                tPercentage = tPercentage < minPer ? minPer : tPercentage > 100 ? 100 : tPercentage;
            } else {
                tPercentage = tPercentage < 0 ? 0 : tPercentage > maxPer ? maxPer : tPercentage;
            }

            return tPercentage;
        }

        function calculateVal(min, multiplier, step, percentage) {
            return parseInt(min) + (Math.ceil(percentage * multiplier) * step);
        }

        function updateCSSPosition(positionerElement, type, startLeft, startWidth, newVal) {
            if (type === 'max') {
                positionerElement.css({
                    width: (newVal - startLeft) + '%'
                });
            } else {
                positionerElement.css({
                    width: (startWidth + startLeft - newVal) + '%',
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
            return ((scope.max - scope.min) / 100) / scope.step;
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