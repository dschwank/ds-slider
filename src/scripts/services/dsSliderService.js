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