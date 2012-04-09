var Class = (function () {

  const CALL_IS_NEW = 1;

  function Class(name, setInstance, setCallAndApply) {
    this.debugName = "[class " + name + "]";

    if (setInstance) {
      setInstance(this);
    }

    /**
     * Classes can be called like functions. For user-defined classes this is
     * coercion, for some of the builtins they behave like their counterparts
     * in JS.
     */
    if (setCallAndApply) {
      setCallAndApply(this);
    } else {
      this.call = this.apply = function () {
        notImplemented("class callable call");
      };
    }
  }

  Class.instance = Class;

  Class.passthroughInstance = function passthroughInstance(instance) {
    return function (cls) {
      cls.instance = instance;
    };
  };

  Class.seminativeInstance = function seminativeInstance(cls) {
    cls.instance = function () {
      cls.instanceInit.apply(this, arguments);
    };
  };

  Class.passthroughCallable = function passthroughCallable(callable) {
    return function (cls) {
      cls.call = function ($this) {
        Array.prototype.pop.call(arguments);
        return callable.apply($this, arguments);
      };
      cls.apply = function ($this, args) {
        return callable.apply($this, args);
      }
    }
  };

  Class.constructingCallable = function constructingCallable(cls) {
    cls.call = function ($this) {
      return new Function.bind.apply(cls.instance, arguments);
    };
    cls.apply = function ($this, args) {
      return new Function.bind.apply(cls.instance, [$this].concat(args));
    };
  };

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

  const I = Class.passthroughInstance;
  const C = Class.passthroughCallable;
  const SI = Class.seminativeInstance;
  const CC = Class.constructingCallable;

  /**
   * Object.as
   */
  var ObjectClass = new Class("Object", I(Object), C(Object));

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
    // "NaN": NaN,
    // "Infinity": Infinity,
    // "undefined": void 0,

    /**
     * Math.as
     */
    Math: Math,

    /**
     * Classes.
     */
    ObjectClass: ObjectClass,
    Class: Class,
    FunctionClass: new Class("Function", I(Function), C(Function)),
    BooleanClass: new Class("Boolean", I(Boolean), C(Boolean)),
    StringClass: new Class("String", I(String), C(String)),
    NumberClass: new Class("Number", I(Number), C(Number)),
    intClass: new Class("int", I(int), C(int)),
    uintClass: new Class("uint", I(uint), C(uint)),
    ArrayClass: new Class("Array", I(Array), C(Array)),

    ErrorClass: new Class("Error", SI, CC),
    DefinitionErrorClass: new Class("DefinitionError", SI, CC),
    EvalErrorClass: new Class("EvalError", SI, CC),
    RangeErrorClass: new Class("RangeError", SI, CC),
    ReferenceErrorClass: new Class("ReferenceError", SI, CC),
    SecurityErrorClass: new Class("SecurityError", SI, CC),
    SyntaxErrorClass: new Class("SyntaxError", SI, CC),
    TypeErrorClass: new Class("TypeError", SI, CC),
    URIErrorClass: new Class("URIError", SI, CC),
    VerifyErrorClass: new Class("VerifyError", SI, CC),
    UninitializedErrorClass: new Class("UninitializedError", SI, CC),
    ArgumentErrorClass: new Class("ArgumentError", SI, CC),

    DateClass: new Class("Date", I(Date), C(Date)),
    MathClass: new Class("Math")
  };

  return new Natives(backing);

})();