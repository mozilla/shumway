
package avmplus {
  import flash.utils.ByteArray;
  class A {
    public static var s0;
    public static var s1: int;

    public var i0;
    public var i1: Number;
  }

  interface I {
    function car(): int;
  }

  class B extends A implements I {
    public static var s0;
    public static var s1: int;

    public var i2: String;
    public var i3: Number;

    public function get getter(): int {
      return 0;
    }

    public function car(): int {
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
    trace(JSON.stringify(describeTypeJSON(A, INCLUDE_VARIABLES | INCLUDE_TRAITS | USE_ITRAITS), null, 2));

    // trace(JSON.stringify(describeTypeJSON(0, USE_ITRAITS), null, 2));
    // trace(JSON.stringify(describeTypeJSON(A, INCLUDE_VARIABLES | INCLUDE_TRAITS), null, 2));

    // trace(JSON.stringify(describeTypeJSON(null, USE_ITRAITS), null, 2));
    // trace(JSON.stringify(describeTypeJSON(B, 0), null, 2));
  })();

}