package {

  (function () {
    var v1=new Vector.<int>();
    v1[0]=10;
    trace("LEN: " + v1.length);
    v1.unshift(11);
    trace("LEN: " + v1.length);
    trace(v1);
  }) // ();


  class Box {
    public var v:Object;
    public function Box(o:Object):void {
      v = o;
    }
    public function toString():String {
      return v.toString();
    }
  }

  (function () {
    trace(Vector.<Box>([new Box(-Infinity), new Box(55), new Box(789)]).shift());
    trace(Vector.<Box>([new Box(-Infinity), new Box(55), new Box(789)]).shift().toString());
  }); // ();

  (function () {
    var v1 = new Vector.<int>();
    var errormsg = "";
    try {
      v1[1] = 10;
    } catch (e) {
      errormsg = e.toString();
    }
    trace(errormsg);
  }); // ();

  function sorter(x:Box, y:Box) {
    if (x.v < y.v) {
      return 1;
    }
    if (x.v == y.v) {
      return 0;
    }
    return -1;
  }

  (function () {
    var boxes = new Vector.<Box>();
    for (var i = 0; i < 20; i++) {
      boxes.push(new Box(i));
    }
    boxes.sort(sorter);
    trace(boxes.toString());
  })();

  (function () {
    var values = new Vector.<int>();
    for (var i = 0; i < 20; i++) {
      values.push(i);
    }
    values.sort(function (a, b) {
      return a - b;
    });
    trace(values.toString());
    values.sort(Array.NUMERIC);
    trace(values.toString());
    values.sort(Array.NUMERIC | Array.DESCENDING);
    trace(values.toString());
  })();

//function testClassReverseSort(x:TestClass, y:TestClass) {
//  if (x.val < y.val)
//    return 1
//  if (x.val == y.val)
//    return 0
//  return -1
//}

//
//var testClassVector = new Vector.<TestClass>();
//for (var i=0; i<20; i++) {
//  testClassVector.push(new TestClass(i));
//}
//// push one duplicate value
//testClassVector.push(new TestClass(12));
//
//AddTestCase("Sort a custom vector",
//    "19,18,17,16,15,14,13,12,12,11,10,9,8,7,6,5,4,3,2,1,0",
//    testClassVector.sort(testClassReverseSort).toString()
//);

  trace("DONE");
}