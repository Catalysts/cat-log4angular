'use strict';

/*
 * EcmaScript5 compatible logging based on ideas from Diary.js
 * see https://docs.google.com/document/d/1gGUEODxxDjY7azF8InqtN1pRcLo3WhGb8BcoIihyI80/edit#heading=h.w7kphvm7blel
 *
 * More details:
 * https://github.com/angular/diary.js/blob/master/src/diary.js
 * http://log4javascript.org/
 *
 *
 * Appender interface:
 * {
 *  report(level, message [, memorySizes]) : function called by the logger, if the configured log level is met
 * }
 */
angular
    .module('ngLogCustom', [])
    .constant('ROOT_LOGGER_NAME', 'ROOT')
    .constant('DEFAULT_LEVEL', 'info')
    .constant('CONSOLE_APPENDER', {
        report: function (level, message) {
            if (typeof console === 'object') {
                console[level](message);
            }
        }
    })
    .provider('$customizableLogger', ['ROOT_LOGGER_NAME', 'DEFAULT_LEVEL',
        function (ROOT_LOGGER_NAME, DEFAULT_LEVEL) {
            // available levels: log, debug, info, warn, error
            var providerSelf = this;
            var config = {};
            config[ROOT_LOGGER_NAME] = DEFAULT_LEVEL;
            var dumpMemorySizes = false;

            var appenderList = [];

            var configureLogLevel = function (group, level) {
                if (group === ROOT_LOGGER_NAME && level === undefined) {
                    throw new Error('Cannot undefine the log level of the root logger.');
                }
                config[group] = level;
                return this;
            };

            this.configure = configureLogLevel;
            this.appender = function (appender) {
                appenderList.push(appender);
                return this;
            };
            this.enableMemorySizes = function () {
                dumpMemorySizes = true;
                return this;
            };
            this.disableMemorySizes = function () {
                dumpMemorySizes = false;
                return this;
            };

            this.$get = function () {
                var rootLogger = {
                    parent: undefined,
                    group: ROOT_LOGGER_NAME,
                    resolveLevel: function () {
                        return config[ROOT_LOGGER_NAME];
                    },
                    setLevel: function (newLevel) {
                        configureLogLevel(this.group, newLevel);
                    }
                };
                /*
                 Resolves the log level for the current logger, by travelling up the hierarchy
                 if no log level is defined for the current logger.
                 This method could be memoized.
                 */
                var resolveLevel = function () {
                    if (angular.isDefined(config[this.group])) {
                        // log level is defined, use it
                        return config[this.group];
                    } else if (angular.isDefined(this.parent)) {
                        return this.parent.resolveLevel();
                    } else {
                        throw new Error('Neither log level nor parent set for this logger: "' + this.group + '".');
                    }
                };
                var loggify = function (logger) {
                    var levelOrder = {'debug': 1, 'info': 2, 'warn': 3, 'error': 4};
                    _.each(['debug', 'info', 'warn', 'error'], function (level) {
                        var methodLvlNumber = levelOrder[level];
                        var log = function (message) {
                            if (levelOrder[logger.resolveLevel()] <= methodLvlNumber) {
                                _.each(appenderList, function (appender) {
                                    var memorySizes;
                                    if (dumpMemorySizes && window.performance && window.performance.memory) {
                                        memorySizes = window.performance.memory;
                                    }
                                    appender.report(level, message, memorySizes);
                                });
                            }
                        };
                        logger[level] = function (message, func) {
                            if (typeof func === 'undefined') {
                                log(message);
                            } else {
                                // performance measurement
                                var start = new Date().getTime();
                                log('BEFORE: ' + message);
                                func();
                                var elapsed = new Date().getTime() - start;
                                log('AFTER: ' + message + ' took ' + elapsed + ' ms');
                            }
                        };
                    });
                };
                loggify(rootLogger);
                return {
                    Logger: function (group, parent) {
                        if (angular.isUndefined(group)) {
                            return rootLogger;
                        }
                        if (angular.isUndefined(parent)) {
                            // use root logger as default parent
                            parent = rootLogger;
                        }
                        // possibility to memoize the logger object
                        var logger = {
                            parent: parent,
                            group: group,
                            resolveLevel: resolveLevel,
                            setLevel: function (newLevel) {
                                configureLogLevel(this.group, newLevel);
                            }
                        };
                        loggify(logger);
                        return logger;
                    },
                    appender: providerSelf.appender
                };
            };
        }])
    .config(function ($provide) {
        $provide.decorator('$log', ['$delegate', '$customizableLogger', 'ROOT_LOGGER_NAME', function ($delegate, $customizableLogger, ROOT_LOGGER_NAME) {
            // instantiate  root logger
            var rootLogger = $customizableLogger.Logger();

            _.each(['debug', 'info', 'warn', 'error'], function (level) {
                $delegate[level] = rootLogger[level];
            });
            $delegate.Logger = $customizableLogger.Logger;
            $delegate.setLevel = rootLogger.setLevel;
            $delegate.group = ROOT_LOGGER_NAME;

            return $delegate;
        }]);
    });
