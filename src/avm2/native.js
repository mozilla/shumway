var Class = (function () {

  function Class(name, instance, coerce) {
    this.debugName = "[class " + name + "]";
    this.instance = instance;

    /**
     * Coercions are done by calling the class like a function.
     * If no coercion is specified, act as identity.
     */
    if (coerce) {
      this.call = function (_, value) {
        return coerce(value);
      };
    } else {
      this.call = function (_, value) {
        return value;
      };
    }
  }

  Class.instance = Class;

  return Class;
})();

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
  var ObjectClass = new Class("Object", Object, Object);

  ObjectClass._setPropertyIsEnumerable = function _setPropertyIsEnumerable(obj, name, isEnum) {
    Object.defineProperty(obj, name, { enumerable: isEnum });
  }

  /**
   * Class.as
   */
  function getInstancePrototype() {
    return this.instance.prototype;
  }

  /**
   * Function.as
   */
  function getPrototype() {
    return this.prototype;
  }

  function setPrototype(p) {
    this.prototype = p;
  }

  /**
   * Array.as
   */
  function getLength() {
    return this.length;
  }

  function setLength(l) {
    this.length = l;
  }

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
    getInstancePrototype: getInstancePrototype,
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
    ObjectClass: ObjectClass,
    Class: Class,
    FunctionClass: new Class("Function", Function, Function),
    BooleanClass: new Class("Boolean", Boolean, Boolean),
    StringClass: new Class("String", String, String),
    NumberClass: new Class("Number", Number, Number),
    intClass: new Class("int", int, int),
    uintClass: new Class("uint", uint, uint),
    ArrayClass: new Class("Array", Array)
  };

  return new Natives(backing);

})();