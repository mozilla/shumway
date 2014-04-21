function eqFloat(a, b, test) {
  test = test ? ": " + test : " #" + testNumber;
  if (Math.abs(a -b) < 0.1) {
    console.info("PASS" + test)
  } else {
    console.error("FAIL" + test)
  }
  testNumber ++;
}

function check(condition, test) {
  test = test ? ": " + test : " #" + testNumber;
  if (condition) {
    console.info("PASS" + test)
  } else {
    console.error("FAIL" + test)
  }
  testNumber ++;
}

/** Global unitTests array, unit tests add themselves to this */
var unitTests = [];


// : lastPromise = lastPromise.then(function () { return sanityTest(); });

