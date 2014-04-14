'use strict';

describe('Provider: $customizableLogger', function () {

    var $customizableLoggerProvider;
    var ROOT_LOGGER_NAME;
    var DEFAULT_LEVEL;
    var dummyAppender = {
        logs: [],
        report: function (level, message) {
            this.logs.push(message);
        },
        reset: function () {
            this.logs.length = 0;
        }
    };
    var $log;

    beforeEach(function () {
        // Initialize the $customizableLoggerProvider by injecting it to a dummy module's config
        angular.module('test.app.config', ['ngLogCustom'])
            .config(['$customizableLoggerProvider', 'ROOT_LOGGER_NAME', 'DEFAULT_LEVEL', 'CONSOLE_APPENDER',
                function (_$customizableLoggerProvider_, _ROOT_LOGGER_NAME_, _DEFAULT_LEVEL_, _CONSOLE_APPENDER_) {
                    $customizableLoggerProvider = _$customizableLoggerProvider_;
                    ROOT_LOGGER_NAME = _ROOT_LOGGER_NAME_;
                    DEFAULT_LEVEL = _DEFAULT_LEVEL_;
                    $customizableLoggerProvider.appender(_CONSOLE_APPENDER_);
                    $customizableLoggerProvider.appender(dummyAppender);
                }]);

        // Initialize injector
        module('test.app.config');

        // Kickstart the injectors previously registered with calls to angular.mock.module
        inject(function (_$log_) {
            $log = _$log_;
        });

        dummyAppender.reset();
    });

    it('has a provider', function () {
        expect($customizableLoggerProvider).toBeDefined();
    });

    it('throws error when undefining log level of ROOT logger', function () {
        expect(function () {
            $customizableLoggerProvider.configure(ROOT_LOGGER_NAME, undefined);
        })
            .toThrow(new Error('Cannot undefine the log level of the root logger.'));
    });

    it('returns a configured service from the provider', function () {
        expect($log).toBeDefined();
    });

    it('returns the root logger if no logger group is defined', function () {
        var logger = $log.Logger();
        expect(logger).toBeDefined();
        expect(logger.parent).toBeUndefined();
        expect(logger.group).toBe(ROOT_LOGGER_NAME);
        expect(logger.resolveLevel()).toBe(DEFAULT_LEVEL);
    });

    it('returns a custom logger if a logger group is defined', function () {
        var logger = $log.Logger('PAC');
        expect(logger).toBeDefined();
        expect(logger.parent).toBeDefined();
        expect(logger.parent.group).toBe(ROOT_LOGGER_NAME);
        expect(logger.group).toBe('PAC');
        expect(logger.resolveLevel()).toBe(DEFAULT_LEVEL);

    });

    it('returns a custom logger with a specific log level different from overridden root logger level', function () {
        $customizableLoggerProvider.configure(ROOT_LOGGER_NAME, 'error');
        $customizableLoggerProvider.configure('PAC', 'debug');
        var $log = $customizableLoggerProvider.$get();
        var logger = $log.Logger('PAC');
        expect(logger.parent.resolveLevel()).toBe('error');
        expect(logger.resolveLevel()).toBe('debug');
    });

    it('updates the loggers log level at runtime', function () {
        $customizableLoggerProvider.configure('PAC', 'debug');
        var $log = $customizableLoggerProvider.$get();
        var logger = $log.Logger('PAC');
        expect(logger.resolveLevel()).toBe('debug');
        logger.setLevel('warn');
        expect(logger.resolveLevel()).toBe('warn');
    });

    it('resets the loggers log level at runtime to the inherited level', function () {
        $customizableLoggerProvider.configure('PAC', 'debug');
        var $log = $customizableLoggerProvider.$get();
        var logger = $log.Logger('PAC');
        expect(logger.resolveLevel()).toBe('debug');
        logger.setLevel(undefined);
        expect(logger.resolveLevel()).toBe(DEFAULT_LEVEL);
    });

    it('logs if the log level is more severe than the configured log level', function () {
        // level defaults to 'info'
        var rootLogger = $log.Logger();
        rootLogger.debug('msg-debug');
        rootLogger.info('msg-info');
        rootLogger.warn('msg-warn');
        rootLogger.error('msg-error');

        expect(dummyAppender.logs.length).toBe(3);
        expect(dummyAppender.logs).toContain('msg-info');
        expect(dummyAppender.logs).toContain('msg-warn');
        expect(dummyAppender.logs).toContain('msg-error');
    });

    it('logs if the log level is more severe than the configured log level if log level changed', function () {
        // level defaults to 'info'
        var rootLogger = $log.Logger();
        rootLogger.setLevel('error');
        rootLogger.debug('msg-debug');
        rootLogger.info('msg-info');
        rootLogger.warn('msg-warn');
        rootLogger.error('msg-error');

        expect(dummyAppender.logs.length).toBe(1);
        expect(dummyAppender.logs).toContain('msg-error');
    });

    it('uses the root logger if $log is used directly', function () {
        $log.debug('msg-debug');
        $log.info('msg-info');
        $log.warn('msg-warn');
        $log.error('msg-error');

        expect(dummyAppender.logs.length).toBe(3);
        expect(dummyAppender.logs).toContain('msg-info');
        expect(dummyAppender.logs).toContain('msg-warn');
        expect(dummyAppender.logs).toContain('msg-error');
    });

    it('executes the function for performance logging', function () {
        var taskPerformed = false;
        $log.info('msg-info', function () {
            taskPerformed = true;
        });

        expect(taskPerformed).toBe(true);
        expect(dummyAppender.logs.length).toBe(2);
        expect(dummyAppender.logs[0]).toMatch(/msg-info/i);
        expect(dummyAppender.logs[1]).toMatch(/msg-info/i);
    });

    it('takes the timing of the duration of the task performed', function () {
        var taskPerformed = false;
        $log.warn('msg-info', function () {
            taskPerformed = true;
        });

        expect(dummyAppender.logs.length).toBe(2);
        // expecting this function to be executed in no time
        expect(dummyAppender.logs[1]).toMatch(/0 ms/i);
    });
});
