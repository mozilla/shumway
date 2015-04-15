(function () {
  trace("--- Test 0 ---");
  var rx = new RegExp("^\\s*(?P<sign>-)?((?P<h>\\d+:)?(?P<m>\\d+:))?(?P<s>\\d+(\\.(?P<ss>\\d*))?)", "i");
  trace(rx instanceof RegExp);
  trace(rx is RegExp);
  var result = rx.exec("-4::22");
  trace(result);
  trace(result.length);
  trace(result.sign);
  trace(result.h);
  trace(result.m);
  trace(result.s);

  var keys = [];
  for (var k in result) {
    keys.push(k);
  }
  keys.sort();
  keys.forEach(function (k) {
    trace(k + " " + result[k]);
  });
  trace("AS3 Namespace");
  result = rx.AS3::exec("-5:3:12");
  trace(result);
  trace(result.m);
})();

(function () {
  trace("--- Test 1 ---");
  var pattern:RegExp = /p\w*/gi;
  var str:String = "Pedro Piper picked a peck of pickled peppers.";
  trace("A: " + pattern.lastIndex);
  var result:Object = pattern.exec(str);
  while (result != null) {
    trace(pattern.lastIndex);
    result = pattern.exec(str);
  }
})();

(function () {
  trace("--- Test 2 ---");
  var pattern:RegExp = /foo/gi;
  trace(pattern.source); // foo
})();

(function () {
  trace("--- Test 3 ---");
  var str:String = "She sells seashells by the seashore.";
  trace(str.search(/sh/)); // output: 13 -- Not the first character

  var str:String = "She sells seashells by the seashore.";
  trace(str.search(/sh/i)); // output: 0
})();

(function () {
  trace("--- Test 4 ---");
  var str:String = "Test\n";
  str += "Multiline";
  trace(str.match(/^\w*/g)); // Match a word at the beginning of the string.

  var str:String = "Test\n";
  str += "Multiline";
  trace(str.match(/^\w*/gm)); // Match a word at the beginning of lines.
})();

(function () {
  trace("--- Test 5 ---");
  var str:String = "<p>Test\n";
  str += "Multiline</p>";
  var re:RegExp = /<p>.*?<\/p>/;
  trace(str.match(re));

  var str:String = "<p>Test\n";
  str += "Multiline</p>";
  var re:RegExp = /<p>.*?<\/p>/s;
  trace(str.match(re));
})();

(function () {
  trace("--- Test 6 ---");
  var name:RegExp = /^[A-Za-z0-9 ]{3,20}$/;
  var email:RegExp = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i
  trace(name.test("Alfred"));
  trace(name.test("Not-a-Name"));
  trace(name.test("abc123"));
  trace(name.test("123abc"));
  trace(email.test("gordon.shumway@alf.com"));
  trace(email.test("gor - don.shumway@alf.com"));
})();

(function () {
  trace("--- Test 7 ---");
  var str = 'uid=31';
  var re = /(uid=)(\d+)/;
  var act  = str.replace (re, "$1" + 15);
  var exp = 'uid=15';
  trace(act + " " + exp);
})();

(function () {
  trace("--- Test 8 ---");
  var str1:String = "abc12 def34";
  var pattern:RegExp = /([a-z]+)([0-9]+)/;
  var str2:String = str1.replace(pattern, replFN);

  function replFN():String {
    return arguments[2] + arguments[1];
  }
  var actual  = str2;
  var expect = '12abc def34';
  trace(actual + " " + expect);
})();

(function () {
  trace("--- Test 9 ---");
  var str1:String = "test";
  var pattern:RegExp = /(es)/;
  var str2:String = str1.replace(pattern, "$M$1$$");

  var actual  = str2;
  var expect = 't$Mes$t';
  trace(actual + " " + expect);
})();

trace("--- DONE ---");
