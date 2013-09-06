package avmplus {
  import flash.utils.Dictionary;
  import flash.utils.getQualifiedClassName;

  trace(getQualifiedClassName("Hello"));
  trace(getQualifiedClassName(123));
  trace(getQualifiedClassName(String));

  trace(getQualifiedClassName([]));
  trace(getQualifiedClassName(Array));

  trace(getQualifiedClassName(true));
  trace(getQualifiedClassName(0));

  class A {}
  trace(getQualifiedClassName(A));
  trace(getQualifiedClassName(new A()));

  var values = [1, -1, "1", "-1", true, false, NaN, Infinity, +Infinity, null, undefined, {}, [], Array, Object, Boolean, A];

  values.forEach(function (v) {
    trace(getQualifiedClassName(v));
  });

  trace("--- DONE ---");
}