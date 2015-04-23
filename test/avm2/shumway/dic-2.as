import flash.utils.Dictionary;

trace("--- Function Keys ---");
var a = function () {};
var b = function () {};
var c = function () {};
var x = new Dictionary();
x[a] = 1;
x[b] = 2;
x[c] = 3;
trace (x[a]);
trace (x[b]);
trace (x[c]);
trace (delete x[a]);
trace (delete x[b]);
trace (x[a]);
trace (x[b]);
trace (x[c]);

trace("--- DONE ---");
