[![Build Status](https://travis-ci.org/Catalysts/cat-log4angular.svg)](https://travis-ci.org/Catalysts/cat-log4angular)

# cat-log4angular
A simple configurable logger enhancing angulars $log service.
It provides support for multiple log levels (```'debug', 'info', 'warn', 'error'```) as well as named (hierarchical) loggers (eg. ```cc.catalysts.LogService```).
The set log level will propagate to all child loggers if they don't explicitly define their own level.
In additional an 'appender' concept is implemented which allows for arbitrary implementations of how the log message is processed.
Two implementations of such appenders are included within cat-log4angular:

- a simple console appender
- a http appender (interval based log post requests to a configurable url)

__Note:__ By default no appender is registered, this means that calling any log method will result in a NOOP by default.

## Usage
First you need to get the necessary js file, the easiest way to do so is by using bower and just installing 'cat-log4angular'. ([bower-repo](https://github.com/Catalysts/cat-log4angular-bower/tree/v14.12.1))
Afterwards just add the the js file to your html page and make your angular app/module depend on ```cat.service.log```.
Next you have to setup all appenders you want to use.
After that you are good to go. Just call $log.Logger('someLoggerName') to retrieve a named logger instance, and log via the appropriate functions.

## Examples

Some code snippets as short reference of the main features.
For a more complete usage example please have a look at the examples directory.

### Setting the ROOT log level during the configuration phase
```javascript
angular.module('myApp', ['cat.service.log'])
    .config(function(catLogServiceProvider, ROOT_LOGGER_NAME) {
        // Changing the log level of the root logger from the default 'info' to 'warn'
        catLogServiceProvider.configure(ROOT_LOGGER_NAME, 'warn');
    });
```

### Setting the ROOT log level during the run phase
```javascript
angular.module('myApp', ['cat.service.log'])
    .run(function($log) {
        // Note that $log was decorated and now references to the root logger
        $log.setLevel('error');
    });
```

### Registering the console appender
```javascript
angular.module('myApp', ['cat.service.log'])
    .config(function(catLogServiceProvider, CONSOLE_APPENDER) {
        // Register the console appender
        catLogServiceProvider.appender(CONSOLE_APPENDER);
    });
```

### Using the catHttpLogAppender
```javascript
angular.module('myApp', ['cat.service.log'])
    .config(function (catHttpLogAppenderProvider) {
        catHttpLogAppenderProvider
            // set the post url
            .postUrl('/logs/upload')
            // set the appender to post all logs to the configured url every 3 seconds
            .interval(3);
    })
    .run(function (catLogService, catHttpLogAppender) {
        // register the catHttpLogAppender
        catLogService.appender(catHttpLogAppender);
    });
```

### Writing a custom appender
```javascript
angular.module('myApp', ['cat.service.log'])
    .run(function ($rootScope, catLogService) {
        catLogServiceProvider.appender({
            report : function(level, group, message) {
                // trigger a 'log' event for every logged message
                $rootScope.$broadcast('log', {level: level, group: group, message: message, timestamp: new Date()});
            }
        });
    });
```

## License
Published under 'The MIT License (MIT)'
For details see [LICENSE](LICENSE)