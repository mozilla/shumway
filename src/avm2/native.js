/**
 * Object class static natives.
 */

const natives = (function () {

  function Natives(backing) {
    this.backing = backing;
  }

  Natives.prototype = {
    get: function (p) {
      var chain = p.split(".");
      var v = this.backing;
      for (var i = 0, j = chain.length; i < j; i++) {
        v = v && v[chain[i]];
      }
      return v;
    }
  }

  var P;

  /**
   * Object.as
   */
  Object._setPropertyIsEnumerable = function _setPropertyIsEnumerable(obj, name, isEnum) {
    Object.defineProperty(obj, name, { enumerable: isEnum });
  }

  /**
   * Function.as
   */
  function getPrototype() {
    return this.prototype;
  };

  function setPrototype(p) {
    this.prototype = p;
  };

  /**
   * Array.as
   */
  function getLength() {
    return this.length;
  };

  function setLength(l) {
    this.length = l;
  };

  /**
   * Number.as
   */
  function int(x) {
    return Number(x) | 0;
  }

  function uint(x) {
    return Number(x) >>> 0;
  }

  var backing = {
    /**
     * Getters/setters used by several classes.
     */
    getPrototype: getPrototype,
    setPrototype: setPrototype,
    getLength: getLength,
    setLength: setLength,

    /**
     * Shell toplevel.
     */
    print: print,

    /**
     * actionscript.lang.as
     */
    decodeURI: decodeURI,
    decodeURIComponent: decodeURIComponent,
    encodeURI: encodeURI,
    encodeURIComponent: encodeURIComponent,
    isNaN: isNaN,
    isFinite: isFinite,
    parseInt: parseInt,
    parseFloat: parseFloat,
    escape: escape,
    unescape: unescape,
    isXMLName: isXMLName,
    "NaN": NaN,
    "Infinity": Infinity,
    "undefined": void 0,

    /**
     * Classes.
     */
    Object: Object,
    Function: Function,
    Boolean: Boolean,
    String: String,
    Number: Number,
    int: int,
    uint: uint,
    Array: Array
  };

  return new Natives(backing);

})();