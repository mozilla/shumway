package {
  function foo() {
    var a = 1;
    var b = 2;
    var c = 3;
    var d = 0;
    var e = 0;
    var x = 0;
    
    a = a + b;
    c = a + b + a + b;
    c = c + c + c + c;
    if (c) {
      c += 1;
    } else if (c > 1) {
      c -= 2;
    }
    
    while (c !== 2) {
      if (c < 1) {
        c += a;
        break;
      }
    }
    
    if (a > 2 && b == 3 && b == 4 && b == 5) {
      a += 1;
    }

    x = x + 1;
    if (x == 0) {
      x -= 1;
      if (x == (x + 1 * x * 2)) {
        x -= 2;
      } else {
        x *= 2;
      }
    }
    
    while (x < 10) {
      x ++;
      if (x == 2 && x > 2) {
        break;
      } else if (x > 3) {
        continue;
      }
      x ++;
    }
    
    switch (x) {
    case 0: x += 1; break;
    case 1: x += 2; break;
    }
  
    if (a == 0) {
      b += 1;
    } else if (a == 1) {
      b += 2;
    } else if (a == 2) {
      b += 3;
    } else if (a == 3) {
      b += 4;
    } else if (a == 4) {
      b += 5;
    } else if (a == 5) {
      b += 6;
    }
  
    if (a && b && c && d && e) {
      a += 1;
    } else {
      a += 2;
    }
    a = a + 3;
  }
}