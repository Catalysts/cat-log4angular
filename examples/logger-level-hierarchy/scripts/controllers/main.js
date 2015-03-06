'use strict';

angular.module('ngLogApp')
    .run(function (catLogService, $rootScope) {
        catLogService
            .appender({
                report : function(level, group, message) {
                    $rootScope.$broadcast('log', {level: level, group: group, message: message, timestamp: new Date()});
                }
            });
    })
    .controller('MainCtrl', function ($scope, $log) {
        var $rootLogger = $log;
        var $subLogger = $log.Logger('sub');
        $scope.levels = [undefined, 'debug', 'info', 'warn', 'error'];
        $scope.loggerLevels = {
            root: 'warn',
            sub: undefined
        };
        $scope.logs = [];

        $scope.$watch('loggerLevels.sub', function(newVal) {
            $subLogger.setLevel(newVal);
        });
        $scope.$watch('loggerLevels.root', function(newVal) {
            $rootLogger.setLevel(newVal);
        });
        $scope.$on('log', function(event, logObj) {
            $scope.logs.push(logObj);
        });
        $scope.debug = function(message) {
            $subLogger.debug(message);
        };
        $scope.info = function(message) {
            $subLogger.info(message);
        };
        $scope.warn = function(message) {
            $subLogger.warn(message);
        };
        $scope.error = function(message) {
            $subLogger.error(message);
        };
        $scope.clearLogs = function() {
            $scope.logs.length = 0;
        };
    });
