import flash.utils.Dictionary;

var d : Dictionary = new Dictionary();
var o1 = new Object();
o1.toString = function() { return "key"; };
var o2 = new Object();
o2.toString = function() { return "key"; };
o2.testtest = "";

d[o1] = "1";
d[o2] = "2";

trace(d[o1]);
trace(d[o2]);
trace(d["key"]);
