
package avmplus {
import avmplus.normalizeOutput;
import avmplus.normalizeOutput;
import avmplus.normalizeOutput;
import avmplus.normalizeOutput;

[metaData(name='class-metadata',secondField=true)]
  class A {
    public static var s0;
    public static var s1: int;

    public var i0;
    public var i1: Number;

    public function set setter(value: int) {
    }
    public static function set staticSetter(value: int) {
    }

    public static function staticMethod() {

    }
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

function normalizeOutput(description: String): String {
  var lines: Array = description.split(',\n').join('\n').split('\n');
  lines.sort();
  return lines.join('\n');
}

  (function () {
    trace('describing class:');
    trace(normalizeOutput(JSON.stringify(describeTypeJSON(B, FLASH10_FLAGS), null, 2)));
    trace('describing instance:');
    trace(normalizeOutput(JSON.stringify(describeTypeJSON(new A(), FLASH10_FLAGS), null, 2)));

    trace('describing `0`: ' + JSON.stringify(describeTypeJSON(0, USE_ITRAITS), null, 2));
    trace('describing `null`: ' + JSON.stringify(describeTypeJSON(null, USE_ITRAITS), null, 2));
    trace('describing anonymous function: ' + JSON.stringify(describeTypeJSON(function(){}, USE_ITRAITS), null, 2));
    trace('describing bound function itraits: ' + normalizeOutput(JSON.stringify(describeTypeJSON(A.staticMethod, USE_ITRAITS), null, 2)));
    trace('describing bound function ctraits: \n' + normalizeOutput(JSON.stringify(describeTypeJSON(new B().car, FLASH10_FLAGS), null, 2)));
  })();

}
