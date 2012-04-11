var Class = (function () {

  function Class(name, instance, callable) {
    this.debugName = "[class " + name + "]";

    this.instance = instance;

    /**
     * Classes can be called like functions. For user-defined classes this is
     * coercion, for some of the builtins they behave like their counterparts
     * in JS.
     */
    if (callable) {
      this.call = callable.call;
      this.apply = callable.apply;
    } else {
      this.call = this.apply = function () {
        notImplemented("class callable call");
      };
    }
  }

  Class.instance = Class;

  Class.passthroughCallable = function passthroughCallable(f) {
    return {
      call: function ($this) {
        Array.prototype.pop.call(arguments);
        return f.apply($this, arguments);
      },
      apply: function ($this, args) {
        return f.apply($this, args);
      }
    };
  };

  Class.constructingCallable = function constructingCallable(instance) {
    return {
      call: function ($this) {
        return new Function.bind.apply(instance, arguments);
      },
      apply: function ($this, args) {
      return new Function.bind.apply(instance, [$this].concat(args));
      }
    };
  };

  Class.getters = { prototype: function () { return this.instance.prototype; } };

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

  const C = Class.passthroughCallable;
  const CC = Class.constructingCallable;

  /**
   * Object.as
   */
  function ObjectClass(scope, instance) {
    var c = new Class("Object", Object, C(Object));

    c._setPropertyIsEnumerable = function _setPropertyIsEnumerable(obj, name, isEnum) {
      Object.defineProperty(obj, name, { enumerable: isEnum });
    }

    return c;
  }

  /**
   * Boolean.as
   */
  function BooleanClass(scope, instance) {
    return new Class("Boolean", Boolean, C(Boolean));
  }

  /**
   * Function.as
   */
  function FunctionClass(scope, instance) {
    var c = new Class("Function", Function, C(Function));

    c.getters = { prototype: function () { return this.prototype; },
                  length: function () { return this.length; } };
    c.setters = { prototype: function (p) { this.prototype = p; } };

    return c;
  }

  /**
   * String.as
   */
  function StringClass(scope, instance) {
    var c = new Class("String", String, C(String));

    c.getters = { length: function () { return this.length; } };

    return c;
  }

  /**
   * Array.as
   */
  function ArrayClass(scope, instance) {
    var c = new Class("Array", Array, C(Array));

    c.getters = { length: function() { return this.length; } };
    c.setters = { length: function(l) { this.length = l; } };

    return c;
  }

  /**
   * Number.as
   */
  function NumberClass(scope, instance) {
    return new Class("Number", Number, C(Number));
  }

  function intClass(scope, instance) {
    function int(x) {
      return Number(x) | 0;
    }

    return new Class("int", int, C(int));
  }

  function uintClass(scope, instance) {
    function uint(x) {
      return Number(x) >>> 0;
    }

    return new Class("uint", uint, C(uint));
  }

  /**
   * Math.as
   */
  function MathClass(scope, instance) {
    var c = new Class("Math");

    c.abs = Math.abs;
    c.acos = Math.acos;
    c.asin = Math.asin;
    c.atan = Math.atan;
    c.ceil = Math.ceil;
    c.cos = Math.cos;
    c.exp = Math.exp;
    c.floor = Math.floor;
    c.log = Math.log;
    c.round = Math.round;
    c.sin = Math.sin;
    c.sqrt = Math.sqrt;
    c.tan = Math.tan;
    c.atan2 = Math.atan2;
    c.pow = Math.pow;
    c.max = Math.max;
    c.min = Math.min;
    c.random = Math.random;

    return c;
  }

  /**
   * Date.as
   */
  function DateClass(scope, instance) {
    var c = new Class("Date", Date, C(Date));

    c.parse = Date.parse;
    c.UTC = Date.UTC;

    return c;
  }

  /**
   * Error.as
   */
  function makeErrorClass(name) {
    return function (scope, instance) {
      return new Class(name, instance, CC(instance));
    }
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
  function RegExpClass(scope, instance) {
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

    var c = new Class("RegExp", ASRegExp, C(ASRegExp));

    c.getters = {
      source: function () { return this.source; },
      global: function () { return this.global; },
      ignoreCase: function () { return this.ignoreCase; },
      multiline: function () { return this.multiline; },
      lastIndex: function () { return this.lastIndex; },
      dotall: function () { return this.dotall; },
      extended: function () { return this.extended; }
    };

    c.setters = {
      lastIndex: function (i) { this.lastIndex = i; }
    };

    return c;
  }

  function constant(x) {
    return function () {
      return x;
    };
  }

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
     * Shell toplevel.
     */
    print: constant(print),

    /**
     * actionscript.lang.as
     */
    decodeURI: constant(decodeURI),
    decodeURIComponent: constant(decodeURIComponent),
    encodeURI: constant(encodeURI),
    encodeURIComponent: constant(encodeURIComponent),
    isNaN: constant(isNaN),
    isFinite: constant(isFinite),
    parseInt: constant(parseInt),
    parseFloat: constant(parseFloat),
    escape: constant(escape),
    unescape: constant(unescape),
    isXMLName: constant(typeof (isXMLName) !== "undefined" ? isXMLName : function () {
      notImplemented("Chrome doesn't support isXMLName.");
    }),

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

    Class: constant(Class),
    FunctionClass: FunctionClass,
    BooleanClass: BooleanClass,
    StringClass: StringClass,
    NumberClass: NumberClass,
    intClass: intClass,
    uintClass: uintClass,
    ArrayClass: ArrayClass,

    ErrorClass: makeErrorClass("Error"),
    DefinitionErrorClass: makeErrorClass("DefinitionError"),
    EvalErrorClass: makeErrorClass("EvalError"),
    RangeErrorClass: makeErrorClass("RangeError"),
    ReferenceErrorClass: makeErrorClass("ReferenceError"),
    SecurityErrorClass: makeErrorClass("SecurityError"),
    SyntaxErrorClass: makeErrorClass("SyntaxError"),
    TypeErrorClass: makeErrorClass("TypeError"),
    URIErrorClass: makeErrorClass("URIError"),
    VerifyErrorClass: makeErrorClass("VerifyError"),
    UninitializedErrorClass: makeErrorClass("UninitializedError"),
    ArgumentErrorClass: makeErrorClass("ArgumentError"),

    DateClass: DateClass,
    MathClass: MathClass,
    RegExpClass: RegExpClass

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
