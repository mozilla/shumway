var inBrowser = typeof console != "undefined";

if (!inBrowser) {
    console = {
        info: print,
        warn: print
    };
}

function error(message) {
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
 *
 * @param base object whose prototype to use as the created prototype object's prototype
 * @param properties additional properties to add to the created prototype object
 */
function inherit(base, properties) {
  var prot = Object.create(base.prototype);
  for (var p in properties) {
    prot[p] = properties[p];
  }
  return prot;
}
