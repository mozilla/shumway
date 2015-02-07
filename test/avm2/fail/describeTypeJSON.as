package avmplus {
  class A {
    public static var s0;
    public static var s1: int;

    public var i0;
    public var i1: Number;
  }

  class B extends A {
    public static var s0;
    public static var s1: int;

    public var i2: String;
    public var i3: Number;

    public function get getter(): int {
      return 0;
    }
  }

  function dump(o) {
    trace(o.name);
    trace("isDynamic: " + o.isDynamic);
    trace("isStatic: " + o.isStatic);
    trace("isFinal: " + o.isFinal);
    if (o.traits) {
      if (o.traits.variables) {
        o.traits.variables.forEach(function (v) {
          trace("variable: " + v.name + " " + v.uri + " " + v.type + " " + v.access);
        });
      }

      if (o.traits.accessors) {
        o.traits.accessors.forEach(function (v) {
          trace("accessor: " + v.name + " " + v.uri + " " + v.returnType);
          if (v.parameters) {
            v.parameters.forEach(function (p) {
              trace("P: " + p.type + " " + p.optional);
            });
          }
        });
      }

      if (o.traits.methods) {
        o.traits.methods.forEach(function (v) {
          trace("methods: " + v.name + " " + v.uri + " " + v.returnType);
          if (v.parameters) {
            v.parameters.forEach(function (p) {
              trace("P: " + p.type + " " + p.optional);
            });
          }
        });
      }
    }
  }

  (function () {
    ([A, B]).forEach(function (c) {
      var j = describeTypeJSON(c, USE_ITRAITS | INCLUDE_VARIABLES | INCLUDE_METHODS | INCLUDE_ACCESSORS | INCLUDE_TRAITS | USE_ITRAITS);
      // trace(JSON.stringify(j, null, 2));
      dump(j);
    });

  })();

}