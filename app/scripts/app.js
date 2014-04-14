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
            .appender(CONSOLE_APPENDER);
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
