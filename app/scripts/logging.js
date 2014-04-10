'use strict';

/*
 * EcmaScript5 compatible logging based on ideas from Diary.js
 * see https://docs.google.com/document/d/1gGUEODxxDjY7azF8InqtN1pRcLo3WhGb8BcoIihyI80/edit#heading=h.w7kphvm7blel
 */
angular
    .module('ngLogCustom', [])
    .constant('ROOT_LOGGER_NAME', 'ROOT')
    .constant('DEFAULT_LEVEL', 'info')
    .provider('$customizableLogger', ['ROOT_LOGGER_NAME', 'DEFAULT_LEVEL',
        function CustomizableLoggerProvider(ROOT_LOGGER_NAME, DEFAULT_LEVEL) {
            // available levels: log, debug, info, warn, error
            var config = {};
            config[ROOT_LOGGER_NAME] = DEFAULT_LEVEL;

            this.configure = function (group, level) {
                if (group === ROOT_LOGGER_NAME && level === undefined) {
                    throw new Error('Cannot undefine the log level of the root logger.');
                }
                config[group] = level;
            };
            this.$get = function () {
                var rootLogger = {
                    parent: undefined,
                    group: ROOT_LOGGER_NAME,
                    resolveLevel: function () {
                        return config[ROOT_LOGGER_NAME];
                    }
                };
                var resolveLevel = function () {
                    if (angular.isDefined(config[this.group])) {
                        // log level is defined, use it
                        return config[this.group];
                    } else if (angular.isDefined(this.parent)) {
                        return this.parent.resolveLevel();
                    } else {
                        throw Error('Neither log level nor parent set for this logger: "' + this.group + '".');
                    }
                };
                var loggify = function (logger) {
                    var levelOrder = {'log': 0, 'debug': 1, 'info': 2, 'warn': 3, 'error': 4};
                    _.each(['log', 'debug', 'info', 'warn', 'error'], function (level) {
                        var methodLvlNumber = levelOrder[level];
                        logger[level] = function (message) {
                            if (levelOrder[logger.resolveLevel()] <= methodLvlNumber) {
                                console.log(level + '|' + message);
                            } else {
                                console.log('suppressing ' + level + '|' + message);
                            }
                        };
                    });
                }
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
                        var logger = {
                            parent: parent,
                            group: group,
                            resolveLevel: resolveLevel
                        };
                        loggify(logger);
                        return logger;
                    }
                };
            };
        }])
    .config(function ($provide) {
        $provide.decorator('$log', ['$delegate', '$customizableLogger', function ($delegate, $customizableLogger) {
            // instantiate  root logger
            var rootLogger = $customizableLogger.Logger();

            _.each(['log', 'debug', 'info', 'warn', 'error'], function (level) {
                var oldBehavior = $delegate[level];
                $delegate[level] = rootLogger[level];
            });

            return $delegate;
        }]);
    });
