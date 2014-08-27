package {
  (function () {
    trace("-- Nested Enumeration --");
    var o = [5, 6, 7];
    for (var i in o) {
      for (var j in o) {
        for (var k in o) {
          trace(i + " " + j + " " + k);
        }
      }
    }
  }); // ();

  public function removeFromArray(object:Object, array:Array):void {
    array.splice(array.indexOf(object), 1);
    return;
  }

  (function () {
    trace("-- Horse Bug --");

    var array = [];
    for (var i = 0; i < 10; i++) {
      array.push({value: i});
    }

    for each (var x in array) {
      trace(x.value);
      removeFromArray(array[5], array);
    }
  })();
  trace("-- DONE --");
}