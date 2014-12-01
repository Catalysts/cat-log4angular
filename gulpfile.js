'use strict';

var gulp = require('gulp');

gulp.bower = require('gulp-bower');
gulp.concat = require('gulp-concat');
gulp.jshint = require('gulp-jshint');
gulp.uglify = require('gulp-uglify');
gulp.rename = require('gulp-rename');
gulp.sourcemaps = require('gulp-sourcemaps');

var karma = require('karma');
var path = require('path');

var _ = require('lodash');

function _testTask(watch) {
    return function (cb) {
        karma.server.start(_.assign({}, {configFile: path.resolve('./karma.conf.js')}, {
            singleRun: !watch,
            autoWatch: watch
        }), cb);
    };
}

function _build(destination) {
    return function () {
        return gulp
            .src('src/main/javascript/**/*.js')
            .pipe(gulp.sourcemaps.init())
            .pipe(gulp.concat('cat-log4angular.js'))
            .pipe(gulp.dest(destination))
            .pipe(gulp.sourcemaps.write('.', {sourceRoot: 'src'}));
    };
}

gulp.task('bower_install', function () {
    return gulp.bower();
});

gulp.task('test', ['bower_install'], _testTask(false));

gulp.task('build', _build('build'));
gulp.task('default', ['build']);
