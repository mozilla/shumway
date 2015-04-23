package {
  (function () {
    var str = "";
    str = "4"; str += String.fromCharCode(52); trace(new Number(str)); // 44
    str = "4"; str += String.fromCharCode(0); trace(str+'more'); // 4more
    trace(new Number(str)); // NaN
    trace(parseInt(str)); // 4
  })();
}

