// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function (config) {
    config.set({
        basePath: '',

        frameworks: ['jasmine'],

        files: [
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'src/main/javascript/cat-log-service.js',
            'src/main/javascript/cat-http-appender.js',
            'src/test/javascript/spec/**/*.js'
        ],

        exclude: [],

        port: 9090,

        logLevel: config.LOG_INFO,

        autoWatch: true,

        plugins: [
            'karma-jasmine',
            'karma-coverage',
            'karma-phantomjs-launcher'
        ],
        reporters: [
            'progress',
            'coverage'
        ],
        preprocessors: {
            'src/main/javascript/**/*.js': 'coverage'
        },
        coverageReporter: {
            reporters: [
                {
                    type: 'lcov',
                    dir: 'build/coverage/'
                },
                {
                    type: 'text-summary',
                    dir: 'build/coverage/'
                }
            ]
        },

        browsers: ['PhantomJS'],

        singleRun: false
    });
};
