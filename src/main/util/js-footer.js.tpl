        return 'cat.service.log';
    }

    if (!!window.require && !!window.define) {
        window.define(['angular'], catLog4Angular);
    } else {
        catLog4Angular(window.angular);
    }
})(window);