'use strict';

/*
 * HTTP Upload Appender for ngLogCustom module
 *
 * Uploads the logs that have a log level >= minLevel to postUrl in the specified interval.
 * No uploads happen if no suitable logs have been produced.
 */
angular
    .module('cat.service.log')
    .constant('HTTP_LOGGER_NAME', 'catHttpLogAppender')
    .provider('catHttpLogAppender', function () {
        var intervalInSeconds = 10;
        var postUrl;
        var minLevel = 'info';
        this.interval = function (_intervalInSeconds) {
            intervalInSeconds = _intervalInSeconds;
            return this;
        };
        this.postUrl = function (_postUrl) {
            postUrl = _postUrl;
            return this;
        };
        this.minUploadLevel = function (_minLevel) {
            minLevel = _minLevel;
            return this;
        };
        this.$get = ['$http', '$interval', '$log', 'HTTP_LOGGER_NAME', 'LOG_LEVEL_ORDER', function ($http, $interval, $log, HTTP_LOGGER_NAME, LOG_LEVEL_ORDER) {
            var logger = $log.Logger(HTTP_LOGGER_NAME);
            if (typeof postUrl === 'undefined') {
                throw new Error('catHttpLogAppenderProvider requires definition of postUrl');
            }
            var logs = [];

            var appender = {
                report: function (level, group, message, memorySizes) {
                    logs.push({
                        level: level,
                        group: group,
                        message: typeof message === 'string' ? message : message.toString(),
                        memorySizes: memorySizes,
                        timestamp: new Date().getTime()
                    });
                },
                flush: function () {
                    var minLevelOrder = LOG_LEVEL_ORDER[minLevel];
                    var logsToSend = [];
                    angular.forEach(logs, function (logEntry) {
                        if (LOG_LEVEL_ORDER[logEntry.level] >= minLevelOrder) {
                            logsToSend.push(logEntry);
                        }
                    });
                    logs.length = 0;
                    if (logsToSend.length > 0) {
                        return $http.post(postUrl, logsToSend)
                            .success(function () {
                                logger.debug('Successfully uploaded logs.');
                            })
                            .error(function (data, status, headers, config, statusText) {
                                logger.debug('Error uploading logs: ' + status + ' ' + statusText);
                            });
                    } else {
                        logger.debug('No logs to upload - skipping upload request.');
                    }
                }
            };
            $interval(appender.flush, intervalInSeconds * 1000, 0, false);
            return appender;
        }];
    });