package {
  import flash.utils.ByteArray;
  import flash.net.*;

  (function () {
    trace("-- Enumerating non-numeric properties on arrays.");
    var a : Array = []; a[1] = 3.1; a.data = "test0";
    for (var k in a) {
      trace(k);
    }
  })();

  // This is mostly copied from encoding1.fla
  function testEncoding(encoding: int) {
    var ba = new ByteArray();
    var b : int = 2;
    var d : Number = 3.4;
    var a : Array = []; a[1] = 3.1; a.data = "test0";
    ba.objectEncoding = encoding;
    trace("Set objectEncoding to: " + ba.objectEncoding);
    ba.writeObject(true);
    ba.writeObject(b);
    ba.writeObject(d);
    ba.writeObject("test");
    ba.writeObject(["a", {}]);
    ba.writeObject(a);
    ba.writeObject({"test2": null});

    var result = "";
    for (var i: int = 0; i < ba.length; i++)
      result += (256 | ba[i]).toString(16).substr(1);
    ba.position = 0;

    trace(result + '\n');
    trace(ba.readObject()); // true
    trace(ba.readObject()); // 2
    trace(ba.readObject()); // 3.4
    trace(ba.readObject()); // "test"
    var obj1 = ba.readObject();
    trace(typeof obj1); trace('. ' + obj1[0]); trace('. ' + typeof obj1[1]);
    var obj2 = ba.readObject();
    trace(typeof obj2); trace('. ' + obj2[1]); trace('. ' + obj2.data);
    var obj3 = ba.readObject();
    trace(typeof obj3); trace('. ' + obj3.test2);
  }

  // AMF0 is not supported in the Tamarin shell, so we don't test it here although it should work
  // in Shumway.

  // trace("## AMF0 " + ObjectEncoding.AMF0);
  // testEncoding(ObjectEncoding.AMF0);

  trace("## AMF3 " + ObjectEncoding.AMF3);
  testEncoding(ObjectEncoding.AMF3);
}
