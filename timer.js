(function () {
    'use strict';
var Timer = function (options) {

    var defaultOptoins = {
        tick    : 1,
        onstart : function () {},
        onstop  : function () {},
        onpause : function () {},
        onend   : function () {},
        ontick  : function () {}
    };

    //extend options with defaultOptoins
    options = extend(defaultOptoins, options);

    function extend(parent, child) {
        var prop;
        child = child || {};
        for (prop in parent) {
            if (!child.hasOwnProperty(prop)) {
                child[prop] = parent[prop];
            }
        }
        return child;
    }

    // private variables
    var that = {
            id : +new Date(),
            duration : 0,
            status : 'initialized',
            start : 0,
            measures : [],
        },
        timeout,
        interval;

    function start(duration) {
        var instance = this;

        if (!+duration && !that.duration) {
            return end.call(instance);
        } else {
            duration *= 1000;
        }

        if (timeout && that.status === 'started') {
            return this;
        }

        that.duration = duration = that.duration === 0 ? duration : that.duration;
        timeout = setTimeout(function () {
            end.call(instance);
        }, duration);
        that.start = +new Date();
        if (options.ontick !== defaultOptoins.ontick) {
            interval = setInterval(function() {
                options.ontick.call(instance, getDuration());
            }, +options.tick * 1000);
        }
        that.status = 'started';
        options.onstart.call(this);
        return this;
    }

    function stop() {
        clear(true);
        that.status = 'stopped';
        options.onstop.call(this);
        return this;
    }

    function pause() {
        that.duration = that.duration - (+new Date() - that.start);
        clear(false);
        that.status = 'paused';
        options.onpause.call(this);
        return this;
    }

    function end() {
        clear(true);
        that.status = 'finished';
        options.onend.call(this);
        return this;
    }

    function getStatus() {
        return that.status;
    }

    function getDuration() {
        return (that.status === 'started') ? Math.round((that.duration - (+new Date() - that.start)) / 1000) : 0;
    }

    function on(option, value) {
        if (typeof option !== 'string' || typeof value !== 'function') {
            return;
        }
        if (option.indexOf('on') !== 0) {
            option = 'on' + option;
        }
        if (options.hasOwnProperty(option)) {
            options[option] = value;
        }
        return this;
    }

    function off(option) {
        if (typeof option !== 'string') {
            return;
        } else {
            option = option.toLowerCase();
        }
        if (option === 'all') {
            options = defaultOptoins;
        } else {
            if (option.indexOf('on') !== 0) {
                option = 'on' + option;
            }
            if (options.hasOwnProperty(option)) {
                options[option] = defaultOptoins[option];
            }
        }
        return this;
    }

    function extendOptions(o) {
        options = extend(options, o);
        return this;
    }

    function measureStart(label) {
        if (!label) {
            return 'No label passed';
        }
        that.measures[label] = +new Date();
        return this;
    }

    function measureStop(label) {
        if (!label) {
            return 'No label passed';
        }
        return +new Date() - that.measures[label];
    }

    function clear (clearDuration) {
        clearTimeout(timeout);
        clearInterval(interval);
        if (clearDuration) {
            that.duration = 0;
        }
    }

    return {
        start        : start,
        stop         : stop,
        pause        : pause,
        on           : on,
        off          : off,
        options      : extendOptions,
        getStatus    : getStatus,
        getDuration  : getDuration,
        measureStart : measureStart,
        measureStop  : measureStop,
    };
};

    //export Timer for Node or as global variable in browser
    var root = this;

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = Timer;
        }
        exports.Timer = Timer;
    } else {
        root.Timer = Timer;
    }

}).call(this);