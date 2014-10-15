(function (module) {
    try {
        module = angular.module('ds.templates');
    } catch (e) {
        module = angular.module('ds.templates', []);
    }
    module.run(['$templateCache', function ($templateCache) {
        $templateCache.put('src/templates/dsSlider.tpl.html',
            '<div class="dsSlider"><div class="positioner"><span class="sliderText" ng-if="showShortInfo && (data.maxPer - data.minPer <= 5)">{{data.min}} - {{data.max}}</span><div class="minSlider"><span class="sliderText" ng-if="showShortInfo && (data.maxPer - data.minPer > 5)">{{data.min}}</span></div><div class="slideBar"></div><div class="maxSlider"><span class="sliderText" ng-if="showShortInfo && (data.maxPer - data.minPer > 5)">{{data.max}}</span></div></div></div>');
    }]);
})();
