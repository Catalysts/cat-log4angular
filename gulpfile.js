'use strict';

var gulp = require('gulp');

gulp.bower = require('gulp-bower');
gulp.concat = require('gulp-concat');
gulp.file = require('gulp-file');
gulp.filter = require('gulp-filter');
gulp.jshint = require('gulp-jshint');
gulp.uglify = require('gulp-uglify');
gulp.rename = require('gulp-rename');
gulp.sourcemaps = require('gulp-sourcemaps');

var karma = require('karma');
var path = require('path');
var bowerConfig = require('./bower.json');

var _ = require('lodash');

var bowerJsonTemplate = [
    '{',
    '  "name": "cat-log4angular",',
    '  "version": "<%= version %>",',
    '  "homepage": "https://github.com/Catalysts/cat-log4angular",',
    '  "description": "Configurable logger with log levels enhancing angulars $log service",',
    '  "authors": [',
    '    "Dominik Hurnaus <dominik.hurnaus@catalysts.cc>",',
    '    "Thomas Scheinecker <thomas.scheinecker@catalysts.cc>"',
    '  ],',
    '  "license": "The MIT License (MIT)",',
    '  "dependencies": {',
    '    "angular": "^<%= dependencies.angular %>"',
    '  },',
    '  "main": [',
    '    "cat-log4angular.min.js"',
    '  ],',
    '  "keywords": [',
    '    "angular",',
    '    "js",',
    '    "javascript",',
    '    "logging",',
    '    "log4js",',
    '    "log4angular"',
    '  ]',
    '}'
].join('\n');

function _bowerJson() {
    return gulp.file('bower.json', _.template(bowerJsonTemplate, bowerConfig), {src: true}).pipe(gulp.dest('dist'));
}

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
            .src([
                'src/main/javascript/cat-log-service.js',
                'src/main/javascript/cat-http-appender.js'])
            .pipe(gulp.jshint())
            .pipe(gulp.jshint.reporter('jshint-stylish'))
            .pipe(gulp.sourcemaps.init())
            .pipe(gulp.concat('cat-log4angular.js'))
            .pipe(gulp.sourcemaps.write('.', {sourceRoot: 'src'}))
            .pipe(gulp.dest(destination))
            .pipe(gulp.filter(['**/*.js']))
            .pipe(gulp.uglify({mangle: false}))
            .pipe(gulp.rename('cat-log4angular.min.js'))
            .pipe(gulp.sourcemaps.write('.', {sourceRoot: '../src'}))
            .pipe(gulp.dest(destination));
    };
}

function _jshintTest() {
    return gulp.src('src/test/javascript/**/*.js')
        .pipe(gulp.jshint())
        .pipe(gulp.jshint.reporter('jshint-stylish'));
}

gulp.task('bower_json', _bowerJson);
gulp.task('bower_install', gulp.bower);
gulp.task('jshint_test', _jshintTest);
gulp.task('test', ['jshint_test', 'bower_install'], _testTask(false));
gulp.task('build', ['test'], _build('build'));
gulp.task('dist', ['test'], _build('dist'));
gulp.task('default', ['build']);
gulp.task('release', ['dist', 'bower_json']);
