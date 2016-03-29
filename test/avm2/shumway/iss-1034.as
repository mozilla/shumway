package {
  var test1 = function () {
    trace('Start 1');
    var x: XML = new XML("<t><s n='1'/><s n='2' /></t>");
    var obj: Object = x;
    for each (var i: Object in obj.s) {
      trace('Item ' + i.@n);
    }
    trace('End 1');
  };
  test1();
}