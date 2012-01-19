if (typeof console == "undefined") {
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
