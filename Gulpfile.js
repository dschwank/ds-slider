var gulp = require('gulp'),
    clean = require('gulp-clean'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css'),
    ngmin = require('gulp-ngmin'),
    concat = require('gulp-concat'),
    ngHtml2Js = require('gulp-ng-html2js'),
    minifyHtml = require('gulp-minify-html'),
    removeUseStrict = require("gulp-remove-use-strict");


var component = require("./bower.json");
var paths = {
    dist: 'dist/'
};

// Clean public
gulp.task('clean', function () {
    return gulp.src('dist/', {read: false})
        .pipe(clean());
});

// Build
gulp.task('default', ['clean', 'build']);

gulp.task('build', ['assets', 'styles', 'scripts', 'templates']);

gulp.task('scripts', [], function () {

    return gulp.src(['src/scripts/module.js', 'src/scripts/**/*.js'])
        .pipe(ngmin())
        .pipe(concat(component.name + '.js'))
        .pipe(gulp.dest(paths.dist))
        .pipe(uglify())
        .pipe(removeUseStrict())
        .pipe(concat(component.name + '.min.js'))
        .pipe(gulp.dest(paths.dist));

});

gulp.task('styles', [], function () {

    return gulp.src('src/styles/**/*.css')
        .pipe(concat('css/styles.css'))
        .pipe(gulp.dest(paths.dist))
        .pipe(minifyCss())
        .pipe(concat('css/styles.min.css'))
        .pipe(gulp.dest(paths.dist));

});

gulp.task('templates', [], function () {

    return gulp.src('src/templates/**/*.html')
        .pipe(minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe(ngHtml2Js({
            moduleName: 'ds.templates',
            prefix: 'src/templates/'
        }))
        .pipe(concat(component.name + '.templates.js'))
        .pipe(gulp.dest(paths.dist))
        .pipe(uglify())
        .pipe(concat(component.name + '.templates.min.js'))
        .pipe(gulp.dest(paths.dist));

});


gulp.task('assets', function () {
    return gulp.src('src/images/**/*')
        .pipe(gulp.dest(paths.dist + 'images'));
});
