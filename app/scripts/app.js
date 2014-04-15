'use strict';

angular
    .module('ngLogApp', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngRoute',
        'ngLogCustom'
    ])
    .config(function ($customizableLoggerProvider, CONSOLE_APPENDER, ROOT_LOGGER_NAME) {
        $customizableLoggerProvider
            .configure(ROOT_LOGGER_NAME, 'warn')
            .configure('PAC', 'info')
            .configure('httpLogAppender', 'debug')
            .appender(CONSOLE_APPENDER);
    })
    .config(function ($httpLogAppenderProvider) {
        $httpLogAppenderProvider
            .postUrl('/logs/upload')
            .interval(3);
    })
    .run(function ($customizableLogger, $httpLogAppender) {
        $customizableLogger.appender($httpLogAppender);
    })
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    });
