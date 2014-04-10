'use strict';

angular
    .module('ngLogApp', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngRoute',
        'ngLogCustom'
    ])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            }).when('/info', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl',
                resolve: {
                    info: ['$log', function ($log) {
                        $log.info('info')
                    }]
                }
            }).when('/warn', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl',
                resolve: {
                    warn: ['$log', function ($log) {
                        $log.warn('warn')
                    }]
                }
            }).when('/error', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl',
                resolve: {
                    error: ['$log', function ($log) {
                        $log.error('error')
                    }]
                }
            }).when('/log', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl',
                resolve: {
                    error: ['$log', function ($log) {
                        $log.log('log')
                    }]
                }
            })
            .otherwise({
                redirectTo: '/'
            });
    });
