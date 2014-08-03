(function (module) {
    try {
        module = angular.module('ds.templates');
    } catch (e) {
        module = angular.module('ds.templates', []);
    }
    module.run(['$templateCache', function ($templateCache) {
        $templateCache.put('src/templates/dsSlider.tpl.html',
            '<div class="dsSlider container"><div class="background"><div class="dsSlider slideBar background"></div></div><div class="dsSlider positioner"><div class="dsSlider minSlider"></div><div class="dsSlider slideBar"></div><div class="dsSlider maxSlider"></div></div></div>');
    }]);
})();
