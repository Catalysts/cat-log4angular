'use strict';

/*
    Tests for the catHttpLogAppender
 */
describe('Provider: $httpLogAppender', function () {

    var catHttpLogAppenderProvider;
    var catHttpLogAppender;
    var $httpBackend;
    var $interval;
    var dummyPostUrl = 'http://localhost:8888/dummy/log/post/url';
    var flushIntervalInSeconds = 30;

    beforeEach(function () {
        // Initialize the $customizableLoggerProvider by injecting it to a dummy module's config
        angular.module('test.app.config', ['cat.service.log'])
            .config(['catHttpLogAppenderProvider',
                function (_catHttpLogAppenderProvider_) {
                    catHttpLogAppenderProvider = _catHttpLogAppenderProvider_;
                    catHttpLogAppenderProvider
                        .postUrl(dummyPostUrl)
                        .interval(flushIntervalInSeconds);
                }]);

        // Initialize injector
        module('test.app.config');

        // Kickstart the injectors previously registered with calls to angular.mock.module
        inject(['catHttpLogAppender', '$httpBackend', '$interval',
            function (_catHttpLogAppender_, _$httpBackend_, _$interval_) {
                // inject appender service
                catHttpLogAppender = _catHttpLogAppender_;
                $httpBackend = _$httpBackend_;
                $interval = _$interval_;
            }]);
    });

    it('has a provider', function () {
        expect(catHttpLogAppenderProvider).toBeDefined();
    });

    it('appender is instantiated as a service', function () {
        expect(catHttpLogAppender).toBeDefined();
    });

    it('appender flush triggers upload', function () {
        catHttpLogAppender.report('info', 'group', 'message');
        $httpBackend.expectPOST(dummyPostUrl).respond(201, '');
        catHttpLogAppender.flush();
        $httpBackend.flush();
    });

    it('appender is auto-flushed after configured time', function () {
        catHttpLogAppender.report('info', 'group', 'message');
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
        catHttpLogAppender.report('debug', 'group', 'message');
        $interval.flush(flushIntervalInSeconds * 1000);
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
