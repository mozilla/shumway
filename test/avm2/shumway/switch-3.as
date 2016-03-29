package {
  function f0(x) {
    switch (x) {
      case 0: trace("0"); return;
      case 1: trace("1"); return;
      case 2: trace("2"); return;
    }
    trace("R");
    return;
  }

  function f1(x) {
    switch (x) {
      case 0: trace("0"); return;
      case 1: trace("1"); return;
      case 2: trace("2"); break;
    }
    trace("R");
    return;
  }

  function f2(x) {
    switch (x) {
      case 0: trace("0"); return;
      case 1: trace("1"); break;
      case 2: trace("2"); return;
    }
    trace("R");
    return;
  }

  function f3(x) {
    switch (x) {
      case 0:
      case 1: trace("01"); break;
      case 2: trace("2");
      case 3: trace("3"); return;
      case 10: trace("10");
      case 11: trace("11"); break;v
    }
    trace("R");
    return;
  }

  function f4(x) {
    switch (x) {
      case 0:
      case 1: trace(x + " - 1"); break;
      case 3: trace(x + " - 3"); return;
    }
    trace(x + " - R");
    return;
  }

  (function () {
    trace("--- 0 ---");
    for (var i = 0; i < 5; i++) {
      f0(i);
    }
    trace("--- 1 ---");
    for (var i = 0; i < 5; i++) {
      f1(i);
    }
    trace("--- 2 ---");
    for (var i = 0; i < 5; i++) {
      f2(i);
    }
    trace("--- 3 ---");
    for (var i = 0; i < 20; i++) {
      f3(i);
    }
    trace("--- 4 ---");
    for (var i = 0; i < 20; i++) {
      f4(i);
    }
  })();
  trace("--- DONE ---");
}