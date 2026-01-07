'use strict';

var slice         = require('sliced'),
    extend        = require('extend'),
    isPlainObject = require('isobject'),
    isArray       = require('isarray'),
    isFunction    = require('isfunction'),
    nextTick      = require('setasap'),
    isUndefined   = function (input) {
      return typeof input == 'undefined';
    };

if (!Array.prototype.some) {
  Array.prototype.some = function(fun/*, thisArg*/) {
    'use strict';

    if (this == null) {
      throw new TypeError('Array.prototype.some called on null or undefined');
    }

    if (typeof fun !== 'function') {
      throw new TypeError();
    }

    var t = Object(this);
    var len = t.length >>> 0;

    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++) {
      if (i in t && fun.call(thisArg, t[i], i, t)) {
        return true;
      }
    }

    return false;
  };
}

/**
 * @typedef {{}} Event
 * @property {string} name
 * @property {string} [ns=]
 */

/**
 * @typedef {{}} Listener
 * @property {string} name
 * @property {string} ns
 * @property {function|null} fn
 */

/**
 * @param {Event|string|*} event
 * @param {*} [callback]
 */
var checkArgs = function (event, callback) {
  if (typeof event !== 'string' || !event) {
    throw Error('event should be string!');
  }

  if (arguments.length === 2 && typeof callback !== 'function') {
    throw Error('callback should be function!');
  }
};

var EVENT_ALL = '*';

/**
 * @params {{}} [target]
 * @constructor
 */
var Emmiter = function Emmiter (target) {
  if (!(this instanceof Emmiter)) {
    if (isPlainObject(target)) {
      return Emmiter.patch(target);
    }

    return new Emmiter();
  }

  return this;
};

Emmiter.prototype.NS_SEPARATOR = (function (separator) {
  return function (_) {
    if (typeof _ != 'undefined') {
      separator = _;
    }

    return separator;
  }
})('.');

/**
 * @param {Listener} listener
 * @returns {boolean}
 * @private
 */
Emmiter.prototype._isListener = function Emmiter$_isListener (listener) {
  return !isUndefined(listener['event']) && !isUndefined(listener['ns']) && !isUndefined(listener['fn']);
};

/**
 * @param {string|Event} event
 * @returns {Event}
 */
Emmiter.prototype._parseEventName = function Emmiter$_parseEventName (event) {
  var result = null, tmp;

  if (
    isPlainObject(event) &&
    typeof event.name != 'undefined' &&
    typeof event.ns   != 'undefined'
  ) {
    result = event;
  } else {
    tmp    = event.split(this.NS_SEPARATOR());
    result = {
      name: tmp[0] || '',
      ns:   tmp[1] || ''
    };
  }

  return result;
};

/**
 * @param {string|Event} event
 * @returns {string}
 */
Emmiter.prototype._buildEventName = function Emmiter$_buildEventName (event) {
  event = this._parseEventName(event);

  return (event.ns) ? [event.name, event.ns].join(this.NS_SEPARATOR()) : event.name;
};


/**
 * @param {Event|string|string[]} [events]
 * @param {Function} [callback]
 * @param {boolean} [exclude=false]
 * @returns {Array}
 */
Emmiter.prototype.getListeners = function Emmiter$getListeners (events, callback, exclude) {
  var args; for (var i = arguments.length, a = args = new Array(i); i--; a[i] = arguments[i]) {}

  this.listeners = this.listeners || [];

  if (args.length < 2) {
    callback = null;
    exclude  = false;
  } else
  if (args.length == 2) {
    if (isFunction(args[1])) {
      callback = args[1];
      exclude  = false;
    } else {
      callback = null;
      exclude  = !!exclude;
    }
  } else
  if (args.length == 3) {
    callback = (isFunction(callback)) ? callback : null;
    exclude  = !!exclude;
  }

  var listenersCriteria = [],
      _listeners        = [],
      listeners         = this.listeners;

  if (!!events || callback) {
    listenersCriteria = this._parseListeners(events, callback);
    _listeners = listeners.filter(function (listener) {
      var found = listenersCriteria.some(function (listenerCriteria) {
        return (
          (!listenerCriteria.event  || listenerCriteria.event == listener.event) &&
          (!listenerCriteria.ns     || listenerCriteria.ns    == listener.ns) &&
          (!isFunction(callback)    || callback            == listener.fn)
        );
      });

      if (exclude) {
        return !found;
      }

      return found;
    });

    listeners = _listeners;
  }

  return listeners;
};

/**
 * @param {Event|string|string[]} events
 * @param {Function} [callback]
 * @returns {Array}
 */
Emmiter.prototype._parseListeners = function Emmiter$_parseListeners (events, callback) {
  callback  = (isFunction(callback)) ? callback : null;

  var listeners = [],
      self      = this;

  if (isPlainObject(events)) {
    if (this._isListener(events)) {
      listeners.push(events);
    } else {
      for (var event in events) if (events.hasOwnProperty(event)) {
        callback = events[event];
        listeners = listeners.concat(this._parseListeners(event, callback));
      }
    }
  } else
  if (isArray(events)) {
    events.forEach(function (event) {
      listeners = listeners.concat(self._parseListeners(event, callback));
    });
  } else
  if (typeof events == 'string') {
    events = events.split(' ');
    if (events.length > 1) {
      listeners = listeners.concat(this._parseListeners(events, callback));
    } else {
      event = this._parseEventName(events[0]);
      //checkArgs(event.name, callback);
      listeners.push({
        event: event.name,
        ns:    event.ns,
        fn:    callback
      });
    }
  } else
  if (callback) {
    listeners.push({
      event: '',
      ns:    '',
      fn:    callback
    });
  }

  return listeners;
};

/**
 * @param {Event|string|string[]} events
 * @param {function} [callback]
 * @returns {Emmiter}
 */
Emmiter.prototype.addListener =
Emmiter.prototype.bind =
Emmiter.prototype.on = function Emmiter$on (events, callback) {
  callback = (isFunction(callback)) ? callback : null;

  this.listeners = this.getListeners().concat(this._parseListeners(events, callback));

  return this;
};

/**
 * @param {Event|string} event
 * @param {function} callback
 * @returns {Emmiter}
 */
Emmiter.prototype.once =
Emmiter.prototype.one = function Emmiter$one (event, callback) {
  checkArgs(event, callback);

  var self = this;

  self.on(event, function fn () {
    callback();
    self.off(event, fn);
  });

  return this;
};

/**
 * @param {Event|string} events
 * @param [callback]
 * @returns {Emmiter}
 */
Emmiter.prototype.removeListener =
Emmiter.prototype.unbind =
Emmiter.prototype.off = function Emmiter$off (events, callback) {
  callback = (isFunction(callback)) ? callback : null;

  this.listeners = this.getListeners(events, callback, true);

  return this;
};

/**
 * @param {Event|string|string[]} events
 * @param {...*} [args]
 * @returns {Emmiter|[]|*}
 */
Emmiter.prototype.triggerAsync =
Emmiter.prototype.emitAsync = function Emmiter$emitAsync (events) {
  var self = this;
  var args; for (var i = arguments.length, a = args = new Array(i); i--; a[i] = arguments[i]) {}

  nextTick(function () {
    self.emit.apply(self, args);
  });

  return this;
};

/**
 * @param {Event|string|string[]} events
 * @param {...*} [args]
 * @returns {Emmiter|[]|*}
 */
Emmiter.prototype.trigger =
Emmiter.prototype.emit = function Emmiter$emit (events) {
  var self      = this,
      results   = [];

  var _args; for (var i = arguments.length, a = _args = new Array(i); i--; a[i] = arguments[i]) {}
  _args = slice(_args, 1);

  this.getListeners(events).forEach(function (listener) {
    //var eventName = self._buildEventName({name: listener.event, ns: listener.ns});
    //results.push(listener.fn.apply(self, args.concat([eventName])));

    results.push(listener.fn.apply(self, _args));
  });

  if (!!this._returnListenersResults) {
    return results;
    //return (results.length == 1) ? results[0] : results;
  }

  return this;
};

/**
 * @param {boolean} bool
 */
Emmiter.prototype.returnListenersResults = function Emmiter$returnListenersResults (bool) {
  this._returnListenersResults = !!bool;
};

/**
 * @static
 * @param {*} target
 * @returns {*}
 */
Emmiter.extend =
Emmiter.patch = function Emmiter$patch (target) {
  return extend(target, Emmiter.prototype);
};

/**
 * @static
 * @returns {Emmiter}
 */
Emmiter.create = function Emmiter$create () {
  //return Object.create(Emmiter.prototype);
  return new Emmiter;
};

/**
 * @param ctx
 * @static
 */
Emmiter.destroy = function Emmiter$destroy (ctx) {
  Object.keys(Emmiter.prototype).forEach(function (key) {
    delete ctx[key];
  });
  //delete ctx.NS_SEPARATOR;
  //delete ctx._isListener;
  //delete ctx._parseEventName;
  //delete ctx._buildEventName;
  //delete ctx.getListeners;
  //delete ctx._parseListeners;
  //delete ctx.on;
  //delete ctx.bind;
  //delete ctx.addListener;
  //delete ctx.one;
  //delete ctx.once;
  //delete ctx.off;
  //delete ctx.unbind;
  //delete ctx.removeListener;
  //delete ctx.emit;
  //delete ctx.trigger;
  //delete ctx.returnListenersResults;
};

module.exports = Emmiter;
