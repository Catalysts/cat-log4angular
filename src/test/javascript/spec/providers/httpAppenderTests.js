'use strict';

/*
    Tests for the $httpLogAppender
 */
describe('Provider: $httpLogAppender', function () {

    var $httpLogAppenderProvider;
    var $httpLogAppender;
    var $httpBackend;
    var $interval;
    var dummyPostUrl = 'http://localhost:8888/dummy/log/post/url';
    var flushIntervalInSeconds = 30;

    beforeEach(function () {
        // Initialize the $customizableLoggerProvider by injecting it to a dummy module's config
        angular.module('test.app.config', ['ngLogCustom'])
            .config(['$httpLogAppenderProvider',
                function (_$httpLogAppenderProvider_) {
                    $httpLogAppenderProvider = _$httpLogAppenderProvider_;
                    $httpLogAppenderProvider
                        .postUrl(dummyPostUrl)
                        .interval(flushIntervalInSeconds);
                }]);

        // Initialize injector
        module('test.app.config');

        // Kickstart the injectors previously registered with calls to angular.mock.module
        inject(['$httpLogAppender', '$httpBackend', '$interval',
            function (_$httpLogAppender_, _$httpBackend_, _$interval_) {
                // inject appender service
                $httpLogAppender = _$httpLogAppender_;
                $httpBackend = _$httpBackend_;
                $interval = _$interval_;
            }]);
    });

    it('has a provider', function () {
        expect($httpLogAppenderProvider).toBeDefined();
    });

    it('appender is instantiated as a service', function () {
        expect($httpLogAppender).toBeDefined();
    });

    it('appender flush triggers upload', function () {
        $httpLogAppender.report('info', 'group', 'message');
        $httpBackend.expectPOST(dummyPostUrl).respond(201, '');
        $httpLogAppender.flush();
        $httpBackend.flush();
    });

    it('appender is auto-flushed after configured time', function () {
        $httpLogAppender.report('info', 'group', 'message');
        $httpBackend.expectPOST(dummyPostUrl).respond(201, '');
        $interval.flush(flushIntervalInSeconds * 1000);
        $httpBackend.flush();
    });

    it('appender is auto-flushed after configured timeout but no request sent if no logs are available', function () {
        $interval.flush(flushIntervalInSeconds * 1000);
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('appender does not send request if only messages below minLevel are in the log queue', function () {
        // default minLevel is 'info', therefore 'debug' messages must not be sent to the server
        $httpLogAppender.report('debug', 'group', 'message');
        $interval.flush(flushIntervalInSeconds * 1000);
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
