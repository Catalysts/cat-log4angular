'use strict';

angular.module('ngLogApp')
    .run(function ($customizableLogger, $rootScope) {
        $customizableLogger
            .appender({
                report : function(level, message) {
                    $rootScope.$broadcast('log', {level: level, message: message});
                }
            });
    })
    .controller('MainCtrl', function ($scope, $log) {
        var $rootLogger = $log;
        var $subLogger = $log.Logger('sub');
        $scope.levels = [undefined, 'debug', 'info', 'warn', 'error'];
        $scope.rootLoggerLevel = 'warn';
        $scope.subLoggerLevel = undefined;
        $scope.logs = [];

        $scope.$watch('subLoggerLevel', function(newVal) {
            $subLogger.setLevel(newVal);
        });
        $scope.$watch('rootLoggerLevel', function(newVal) {
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
    });
