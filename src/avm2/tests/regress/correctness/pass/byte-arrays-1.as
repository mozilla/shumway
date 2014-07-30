package {
  import flash.utils.ByteArray;
  (function () {
    trace("--- toString ---");
    var ba = new ByteArray();
    var s = "Hello World";
    for (var i = 0; i < 100; i++) {
      ba.writeByte("A".charCodeAt(0));
    }
    ba.position = 0;
    trace("Byte Array: " + ba.length);
    trace("Byte Array: " + ba);
    trace("Byte Array: " + ba.toString());
  })();
}
