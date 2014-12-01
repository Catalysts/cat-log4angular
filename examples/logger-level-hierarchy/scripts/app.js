'use strict';

angular
    .module('ngLogApp', [
        'cat.service.log'
    ])
    .config(function (catLogServiceProvider, CONSOLE_APPENDER, ROOT_LOGGER_NAME) {
        catLogServiceProvider
            .configure(ROOT_LOGGER_NAME, 'warn')
            .configure('PAC', 'info')
            .configure('httpLogAppender', 'debug')
            .appender(CONSOLE_APPENDER);
    })
    .config(function (catHttpLogAppenderProvider) {
        catHttpLogAppenderProvider
            .postUrl('/logs/upload')
            .interval(3);
    })
    .run(function (catLogService, catHttpLogAppender) {
        catLogService.appender(catHttpLogAppender);
    });
