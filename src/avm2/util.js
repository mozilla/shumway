var inBrowser = typeof console != "undefined";

if (!inBrowser) {
    console = {
        info: print,
        warn: print
    };
}

function backtrace() {
    try {
        throw new Error();
    } catch (e) {
        return e.stack ? e.stack.split('\n').slice(2).join('\n') : '';
    }
}

function error(message) {
    if (!inBrowser) {
        console.info(backtrace());
    }
    throw new Error(message);
}

function assert(condition, message) {
    if (!condition) {
        error(message);
    }
}

function assertFalse(condition, message) {
    if (condition) {
        error(message);
    }
}

function warning(message) {
    console.warn(message);
}

function notImplemented(message) {
    assert(false, "Not Implemented" + message);
}

function unexpected() {
    assert(false);
}

String.prototype.padRight = function(c, n) {
    var str = this;
    if (!c || str.length >= n) {
        return str;
    }
    var max = (n - str.length) / c.length;
    for (var i = 0; i < max; i++) {
        str += c;
    }
    return str;
}

Array.prototype.popMany = function(count) {
    assert (this.length >= count);
    var start = this.length - count;
    var res = this.slice(start, this.length);
    this.splice(start, count);
    return res;
};

Array.prototype.first = function() {
    assert (this.length > 0);
    return this[0];
};

Array.prototype.peek = function() {
    assert (this.length > 0);
    return this[this.length - 1];
};

/**
 * Creates a new prototype object derived from another objects prototype along with a list of additional properties.
 */
function inherit(base, properties) {
  var prot = Object.create(base.prototype);
  for (var p in properties) {
    prot[p] = properties[p];
  }
  return prot;
}

function getFlags(value, flags) {
    var str = "";
    for (var i = 0; i < flags.length; i++) {
        if (value & (1 << i)) {
            str += flags[i] + " ";
        }
    }
    if (str.length == 0) {
        return "";
    }
    return str.trim();
}
