var gulp = require('gulp'),
  rimraf = require('gulp-rimraf'),
  connect = require('gulp-connect'),
  gulpDocs = require('gulp-ngdocs'),
  sass = require('gulp-sass'),
  uglify = require('gulp-uglify'),
  cssnano = require('gulp-cssnano'),
  ngAnnotate = require('gulp-ng-annotate'),
  concat = require('gulp-concat'),
  ngHtml2Js = require('gulp-ng-html2js'),
  htmlmin = require('gulp-htmlmin'),
  removeUseStrict = require('gulp-remove-use-strict');


var component = require('./bower.json');

var CONFIG = {
  SERVER_PORT: 8083,
  DIST_PATH: 'dist/',
  DOCS_PATH: 'build/',
  SRC_PATH: 'src/',
  SCRIPT_PATH: 'src/scripts/',
  STYLES_PATH: 'src/styles/',
  TEMPLATES_PATH: 'src/templates/',
  IMAGES_PATH: 'src/images/'
};

/* #############
 * ### CLEAN ###
 * ############# */
gulp.task('clean', function () {
  return gulp.src(CONFIG.DIST_PATH, {read: false})
    .pipe(rimraf());
});

/* ############
 * ### DOCS ###
 * ############ */

gulp.task('build-docs', ['clean'], function () {
  var tOptions = {
    html5Mode: true,
    highlightCodeFences: true,
    startPage: '/api',
    title: 'dsDatepicker',
    titleLink: '/api'
  };

  return gulp.src([CONFIG.SCRIPT_PATH + '**/*.js', CONFIG.SCRIPT_PATH + '**/*.ngdoc'])
    .pipe(gulpDocs.process(tOptions))
    .pipe(gulp.dest(CONFIG.DOCS_PATH));

});

/* ############
 * ### SASS ###
 * ############ */

gulp.task('compile-sass', function () {
  return gulp.src(CONFIG.STYLES_PATH + 'sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(CONFIG.STYLES_PATH));
});

gulp.task('watch-sass', function () {
  gulp.watch(CONFIG.STYLES_PATH + 'sass/**/*.scss', ['compile-sass']);
});

/* #############
 * ### BUILD ###
 * ############# */

gulp.task('build', ['build-assets', 'build-styles', 'build-scripts',
  'build-templates']);

gulp.task('build-assets', ['clean'], function () {
  return gulp.src(CONFIG.IMAGES_PATH + '**/*')
    .pipe(gulp.dest(CONFIG.DIST_PATH + 'images/'));
});

gulp.task('build-scripts', ['clean'], function () {

  return gulp.src([CONFIG.SCRIPT_PATH + 'app.js',
      CONFIG.SCRIPT_PATH + '**/*.js'])
    .pipe(ngAnnotate())
    .pipe(concat(component.name + '.js'))
    .pipe(gulp.dest(CONFIG.DIST_PATH))
    .pipe(uglify())
    .pipe(removeUseStrict())
    .pipe(concat(component.name + '.min.js'))
    .pipe(gulp.dest(CONFIG.DIST_PATH));

});

gulp.task('build-styles', ['clean', 'compile-sass'], function () {

  return gulp.src(CONFIG.STYLES_PATH + '**/*.css')
    .pipe(concat('css/styles.css'))
    .pipe(gulp.dest(CONFIG.DIST_PATH))
    .pipe(cssnano())
    .pipe(concat('css/styles.min.css'))
    .pipe(gulp.dest(CONFIG.DIST_PATH));

});

gulp.task('build-templates', ['clean'], function () {

  return gulp.src(CONFIG.TEMPLATES_PATH + '**/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(ngHtml2Js({
      moduleName: 'ds.templates',
      prefix: CONFIG.TEMPLATES_PATH
    }))
    .pipe(concat(component.name + '.templates.js'))
    .pipe(gulp.dest(CONFIG.DIST_PATH))
    .pipe(uglify())
    .pipe(concat(component.name + '.templates.min.js'))
    .pipe(gulp.dest(CONFIG.DIST_PATH));
});

/* ##################
 * ### WEB-SERVER ###
 * ##################
 */
gulp.task('start', function (cb) {
  connect.server({
    port: CONFIG.SERVER_PORT || 8080,
    livereload: false
  });
});

gulp.task('server-reload', function (cb) {
  gulp.src('./**/*')
    .pipe(connect.reload());
});

/* ###############
 * ### DEFAULT ###
 * ############### */
gulp.task('default', ['clean', 'build', 'build-docs']);
