"use strict";

angular.module('ds.slider')
    .factory('dsSliderService', function () {

        function calculatePer(type, start, delta, min, max) {
            var tPercentage = start[type] + delta;

            tPercentage = tPercentage - (tPercentage % start.step);

            // correct the percentage value‚
            if (type === 'max') {
                tPercentage = tPercentage < start.min ? start.min : tPercentage > max ? max : tPercentage;
            } else {
                tPercentage = tPercentage < min ? min : tPercentage > start.max ? start.max : tPercentage;
            }

            return tPercentage;
        }

        function updateCSSPosition(positionerElement, type, start) {
            positionerElement.css({
                width: (start['maxPer'] - start['minPer']) + '%',
                left: start['minPer'] + '%'
            });
        }

        return {
            calculatePer: function (type, startVal, delta, minPer, maxPer) {
                return calculatePer(type, startVal, delta, minPer, maxPer);
            },

            updateCSSPosition: function (positionerElement, type, start) {
                updateCSSPosition(positionerElement, type, start);
            }
        };
    });