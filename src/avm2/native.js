var Class = (function () {

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
      };
    };
  };

  Class.constructingCallable = function constructingCallable(cls) {
    cls.call = function ($this) {
      return new Function.bind.apply(cls.instance, arguments);
    };
    cls.apply = function ($this, args) {
      return new Function.bind.apply(cls.instance, [$this].concat(args));
    };
  };

  Class.getters = {
    prototype: function () { return this.instance.prototype; }
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
  };

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
  };

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

  /**
   * RegExp.as
   *
   * AS RegExp adds two new flags:
   *  /s (dotall)   - makes . also match \n
   *  /x (extended) - allows different formatting of regexp
   *
   * TODO: Should we support extended at all? Or even dotall?
   */
  function ASRegExp(pattern, flags) {
    function stripFlag(flags, c) {
      flags[flags.indexOf(c)] = flags[flags.length - 1];
      return flags.substr(0, flags.length - 1);
    }

    if (flags) {
      var re;
      var extraProps = {};

      if (flags.indexOf("s") >= 0) {
        pattern = pattern.replace(/\./, "(.|\n)");
        flags = stripFlags(flags, "s");
        extraProps.push({ key: "dotall", value: true });
      }

      re = new RegExp(pattern, flags);

      for (var i = 0, j = extraProps.length; i < j; i++) {
        var prop = extraProps[i];
        re[prop.key] = prop.value;
      }

      return re;
    }

    return new RegExp(pattern, flags);
  }
  ASRegExp.prototype = RegExp.prototype;

  ASRegExp.getters = {
    source: function () { return this.source; },
    global: function () { return this.global; },
    ignoreCase: function () { return this.ignoreCase; },
    multiline: function () { return this.multiline; },
    lastIndex: function () { return this.lastIndex; },
    dotall: function () { return this.dotall; },
    extended: function () { return this.extended; }
  };

  ASRegExp.setters = {
    lastIndex: function (i) { this.lastIndex = i; }
  };

  /**
   * Namespace.as
   */

  function ASNamespace (prefix, uri) {
    this.prefix = prefix;
    this.uri = uri;
  }

  /**
   * Capabilities.as
   */

  function Capabilities () {}

  var CapabilitiesClass = new Class("Capabilities", I(Capabilities), C(Capabilities));

  CapabilitiesClass.getters = {
    playerType: function () { return "AVMPlus"; }
  };

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
    isXMLName: typeof (isXMLName) !== "undefined" ? isXMLName : function () {
      notImplemented("Chrome doesn't support isXMLName.");
    },

    /**
     * Vias.
     */
    Function: Function,
    String: String,
    Array: Array,
    Number: Number,
    Math: Math,
    Date: Date,
    RegExp: RegExp,

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
    MathClass: new Class("Math"),
    RegExpClass: new Class("RegExp", I(ASRegExp), C(ASRegExp)),

    CapabilitiesClass: CapabilitiesClass,
    NamespaceClass: new Class("Namespace", I(Namespace), C(Namespace))
  };

  return new Natives(backing);

})();

var proxies = {};

function createProxy(cls) {
  var className = cls.classInfo.instance.name.getQualifiedName();
  var proxy = null;
  if (!(proxy = proxies[className])) {
    return;
  }
  proxy = proxy(cls);
  for (var key in proxy) {
    assert (proxy.hasOwnProperty(key));
    if (!proxy.hasOwnProperty(key)) {
      continue;
    }
    var index = key.indexOf("$");
    var prefix = key.slice(0, index);
    var name = key.slice(index + 1);
    if (prefix === "static") {
      // assert (!cls.hasOwnProperty(name));
      Object.defineProperty(cls, name, {value: proxy[key], enumerable: false});
    } else if (prefix === "instance") {
      Object.defineProperty(cls.prototype, name, {value: proxy[key], enumerable: false});
    } else {
      unexpected(prefix);
    }
  }
}
