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
gulp.bump = require('gulp-bump');
gulp.git = require('gulp-git');
gulp.util = require('gulp-util');

var q = require('q');
var prettyTime = require('pretty-hrtime');
var karma = require('karma');
var path = require('path');
var request = require('request');
var webjarDeploy = require('./bower-webjar-deploy.js');

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
    '  "license": "MIT",',
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


function getVersion() {
    return require('./dist/bower.json').version;
}

function getVersionTag() {
    return 'v' + getVersion();
}

function wrapInPromise(_function) {
    var deferred = q.defer();

    _function(function (err) {
        if (!err) {
            deferred.resolve();
        } else {
            deferred.reject(err);
        }
    });

    return deferred.primise;
}

function _bowerJson() {
    return gulp.file('bower.json', _.template(bowerJsonTemplate, require('./bower.json')), {src: true}).pipe(gulp.dest('dist'));
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
        var jsFilter = gulp.filter('**/*.js');
        return gulp
            .src([
                'src/main/util/js-header.js.tpl',
                'src/main/javascript/cat-log-service.js',
                'src/main/javascript/cat-http-appender.js',
                'src/main/util/js-footer.js.tpl'])
            .pipe(jsFilter) // filter out *.js.tpl files
            .pipe(gulp.jshint())
            .pipe(gulp.jshint.reporter('jshint-stylish'))
            .pipe(jsFilter.restore()) // restore all files
            .pipe(gulp.sourcemaps.init())
            .pipe(gulp.concat('cat-log4angular.js'))
            .pipe(gulp.sourcemaps.write('.', {sourceRoot: 'src'}))
            .pipe(gulp.dest(destination))
            .pipe(gulp.filter(['**/*.js']))
            .pipe(gulp.uglify({preserveComments: 'some', mangle: false}))
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



function bumpVersion(type) {
    return gulp.src(['package.json', 'bower.json'])
        .pipe(gulp.bump({type: type}))
        .pipe(gulp.dest('./'));
}

gulp.task('bump-patch', function () {
    return bumpVersion('patch');
});

gulp.task('bump-minor', function () {
    return bumpVersion('minor');
});

gulp.task('bump-major', function () {
    return bumpVersion('major');
});

function preRelease() {
    return wrapInPromise(function (cb) {
        gulp.git.tag('pre-release', 'pre-release', {args: '-f'}, cb);
    });
}

function releaseTag() {
    return wrapInPromise(function (cb) {
        var version = getVersionTag();
        gulp.git.tag(version, version, function (err) {
            if (!!err) {
                cb(err);
            } else {
                gulp.git.tag(version, version, {cwd: 'dist'}, cb);
            }
        });
    });
}

gulp.task('release-commit-dist', function () {
    return gulp.src('./*', {cwd: 'dist'})
        .pipe(gulp.git.commit(getVersionTag(), {cwd: 'dist'}));
});

gulp.task('release-commit', ['release-commit-dist'], function () {
    return gulp.src(['./*.json', 'dist'])
        .pipe(gulp.git.commit(getVersionTag()));
});

gulp.task('release-push-dist', function () {
    return wrapInPromise(function (cb) {
        gulp.git.push('origin', 'master', {cwd: 'dist'}, function (err) {
            if (!!err) {
                cb(err);
            } else {
                gulp.git.push('origin', getVersionTag(), {cwd: 'dist'}, cb);
            }
        });
    });
});

gulp.task('release-push', ['release-push-dist'], function () {
    return wrapInPromise(function (cb) {
        gulp.git.push('origin', 'master', function (err) {
            if (!!err) {
                cb(err);
            } else {
                gulp.git.push('origin', getVersionTag(), cb);
            }
        });
    });
});

function runTaskFunction(task) {
    return function () {
        var deferred = q.defer();


        var start = process.hrtime();


        var onTaskErr = function (err) {
            deferred.reject(err);
        };
        var onTaskStop = function (e) {
            if (e.task === task) {
                gulp.removeListener('task_stop', onTaskStop);
                gulp.removeListener('task_err', onTaskErr);

                var time = prettyTime(process.hrtime(start));
                gulp.util.log(
                    'Finished', '\'' + gulp.util.colors.cyan(task) + '\' with dependencies',
                    'after', gulp.util.colors.magenta(time)
                );

                deferred.resolve(e);
            }
        };

        gulp.on('task_stop', onTaskStop);
        gulp.on('task_err', onTaskErr);
        gulp.util.log('Starting \'' + gulp.util.colors.cyan(task) + '\' with dependencies');
        gulp.start(task);

        return deferred.promise;
    };
}

webjarDeploy('cat-log4angular', getVersion, {taskName: 'release-webjar'});

function release(type) {
    return runTaskFunction('pre-release')()
        .then(runTaskFunction('bump-' + type))
        .then(runTaskFunction('bower_json'))
        .then(runTaskFunction('dist'))
        .then(runTaskFunction('release-commit'))
        .then(runTaskFunction('release-tag'))
        .then(runTaskFunction('release-push'))
        .then(runTaskFunction('release-webjar'));
}

function releasePatch() {
    return release('patch');
}

function releaseMinor() {
    return release('minor');
}

function releaseMajor() {
    return release('major');
}

gulp.task('release-patch', [], releasePatch);
gulp.task('release-minor', [], releaseMinor);
gulp.task('release-major', [], releaseMajor);
gulp.task('pre-release', [], preRelease);
gulp.task('release-tag', [], releaseTag);
gulp.task('bower_json', _bowerJson);
gulp.task('bower_install', gulp.bower);
gulp.task('jshint_test', _jshintTest);
gulp.task('test', ['jshint_test', 'bower_install'], _testTask(false));
gulp.task('build', ['test'], _build('build'));
gulp.task('dist', ['test'], _build('dist'));
gulp.task('default', ['build']);