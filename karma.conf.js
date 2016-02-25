// Karma configuration

(function() {
  'use strict';

  var CONFIG,
      bowerFiles = require('main-bower-files');

  CONFIG = {
    DEV_MODE: true // include dev files
  };

  module.exports = function(config) {

    var tResultingFileArray = [],
        tMainFiles,
        tBowerFiles;

    tBowerFiles = bowerFiles({includeDev: CONFIG.DEV_MODE});

    tMainFiles = [
      // src
      'src/**/app.js',
      'src/**/*.js',
      /* Match all test files */
      'test/unit/**/*.js',
      // Match all templates for nghtml2js
      'src/**/*.html'
    ];

    // first add the bower files - afterwards add the own files
    tResultingFileArray = tResultingFileArray.concat(tBowerFiles);
    tResultingFileArray = tResultingFileArray.concat(tMainFiles);

    config.set({

      // base path that will be used to resolve all patterns (eg. files, exclude)
      basePath: '',

      // frameworks to use
      // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
      frameworks: ['jasmine', 'angular-filesort'],

      // list of files / patterns to load in the browser
      files: tResultingFileArray,

      // list of files to exclude
      exclude: [],

      // preprocess matching files before serving them to the browser
      // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
      preprocessors: {
        'src/**/*.js': 'coverage',
        'src/**/*.html': 'ng-html2js'
      },

      ngHtml2JsPreprocessor: {
        stripPrefix: 'src/',
        moduleName: 'templates'
      },

      // test results reporter to use
      // possible values: 'dots', 'progress'
      // available reporters: https://npmjs.org/browse/keyword/karma-reporter
      reporters: ['progress', 'coverage'],

      // web server port
      port: 9876,

      // enable / disable colors in the output (reporters and logs)
      colors: true,

      // level of logging
      // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
      logLevel: config.LOG_INFO,

      // enable / disable watching file and executing tests whenever any file changes
      autoWatch: true,

      // start these browsers
      // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
      browsers: ['PhantomJS'],

      // Continuous Integration mode
      // if true, Karma captures browsers, runs the tests and exits
      singleRun: false
    });
  };

}());
