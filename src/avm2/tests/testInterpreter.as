/*
package {
  // var b64pad  = "";
  
  function binl2b64(binarray) {
    var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var str = "";
    for(var i = 0; i < 4; i += 1)
    {
      for(var j = 0; j < 4; j += 1)
      {
        if(i) str += b64pad;
        else str += b64pad;
      }
    }
    return str;
  }
  
  // binl2b64("AA");
}
*/

var sum = 0;
for(var i = 0; i < 4; i += 1) {
  for(var j = 0; j < 4; j += 1) {
    sum += i + j;
  }
}

for(var i = 0; i < 100000000; i += 1) {
  sum ++;
}


function foo(bar, boo) {
  sum += bar + boo;
}

foo(1, 2);

trace("Result " + sum);
