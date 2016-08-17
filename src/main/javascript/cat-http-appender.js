'use strict';

/*
 * HTTP Upload Appender for ngLogCustom module
 *
 * Uploads the logs that have a log level >= minLevel to postUrl in the specified interval.
 * No uploads happen if no suitable logs have been produced.
 */
function CatHttpLogAppender($http,
                            $interval,
                            $log,
                            config,
                            HTTP_LOGGER_NAME,
                            LOG_LEVEL_ORDER) {
    var logger = $log.Logger(HTTP_LOGGER_NAME);
    if (typeof config.postUrl === 'undefined') {
        throw new Error('catHttpLogAppenderProvider requires definition of postUrl');
    }
    var logs = [];

    this.report = function (level, group, message, memorySizes) {
        logs.push({
            level: level,
            group: group,
            message: typeof message === 'string' ? message : message.toString(),
            memorySizes: memorySizes,
            timestamp: new Date().getTime()
        });
    };
    this.flush = function () {
        var minLevelOrder = LOG_LEVEL_ORDER[config.minLevel];
        var logsToSend = [];
        angular.forEach(logs, function (logEntry) {
            if (LOG_LEVEL_ORDER[logEntry.level] >= minLevelOrder) {
                logsToSend.push(logEntry);
            }
        });
        logs.length = 0;
        if (logsToSend.length > 0) {
            return $http.post(config.postUrl, logsToSend, config)
                .success(function () {
                    logger.debug('Successfully uploaded logs.');
                })
                .error(function (data, status, headers, config, statusText) {
                    logger.debug('Error uploading logs: ' + status + ' ' + statusText);
                });
        } else {
            logger.debug('No logs to upload - skipping upload request.');
        }
    };
    $interval(this.flush, config.intervalInSeconds * 1000, 0, false);
}


function CatHttpLogAppenderProvider() {
    var intervalInSeconds = 10;
    var postUrl;
    var minLevel = 'info';
    var config = {};
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
    this.setConfig = function(key, value) {
        config[key] = value;
        return this;
    };

    this.$get = ['$http', '$interval', '$log', 'HTTP_LOGGER_NAME', 'LOG_LEVEL_ORDER',
        function ($http, $interval, $log, HTTP_LOGGER_NAME, LOG_LEVEL_ORDER) {
            config.intervalInSeconds = intervalInSeconds;
            config.postUrl = postUrl;
            config.minLevel = minLevel;
            return new CatHttpLogAppender($http, $interval, $log, config, HTTP_LOGGER_NAME, LOG_LEVEL_ORDER);
        }];
}

angular
    .module('cat.service.log')
    .constant('HTTP_LOGGER_NAME', 'catHttpLogAppender')
    .provider('catHttpLogAppender', [CatHttpLogAppenderProvider]);
