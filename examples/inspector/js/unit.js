function fail(message) {
  everFailed = true;
  console.error(message);
}

function eqFloat(a, b, test, tolerance) {
  tolerance = typeof tolerance === "undefined" ? 0.1 : tolerance;
  test = description(test);
  var d = Math.abs(a - b);
  if (isNaN(d) || d >= tolerance) {
    return fail("FAIL " + test + ". Got " + a + ", expected " + b + failedLocation());
  }
  console.info("PASS" + test);
}

function neq(a, b, test) {
  test = description(test);
  if (a === b) {
    return fail("FAIL " + test + ". Got " + a + ", expected different (!==) value" +
                failedLocation());
  }
  console.info("PASS" + test);
}

function eq(a, b, test) {
  test = description(test);
  if (a !== b) {
    return fail("FAIL " + test + ". Got " + a + ", expected " + b + failedLocation());
  }
  console.info("PASS" + test);
}

function eqArray(a, b, test) {
  test = description(test);
  if (a == undefined && b) {
    return fail("FAIL" + test + " Null Array: a" + failedLocation());
  }
  if (a && b == undefined) {
    return fail("FAIL" + test + " Null Array: b" + failedLocation());
  }
  if (a.length !== b.length) {
    return fail("FAIL" + test + " Array Length Mismatch, got " + a.length + ", expected " +
                b.length + failedLocation());
  }
  for (var i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      if (!(typeof a[i] == "number" && typeof b[i] == "number" && isNaN(a[i]) && isNaN(b[i]))) {
        return fail("FAIL" + test + " Array Element " + i + ": got " + a[i] + ", expected " +
                    b[i] + failedLocation());
      }
    }
  }
  console.info("PASS" + test);
}

function matrixEq(a, b, test) {
  test = description(test);
  if (a == undefined && b) {
    return fail("FAIL" + test + " Expected neither or both objects to be null/undefined, " +
      "but only `a` was" + failedLocation());
  }
  if (a && b == undefined) {
    return fail("FAIL" + test + " Expected neither or both objects to be null/undefined, " +
      "but only `b` was" + failedLocation());
  }
  if (a.a !== b.a || a.b !== b.b ||
      a.c !== b.c || a.d !== b.d ||
      a.tx !== b.tx || a.ty !== b.ty) {
    return fail("FAIL" + test + " matices differ." + failedLocation());
  }
  console.info("PASS" + test);
}

function structEq(a, b, test) {
  test = description(test);
  if (a == undefined && b) {
    return fail("FAIL" + test + " Expected neither or both objects to be null/undefined, " +
                "but only `a` was" + failedLocation());
  }
  if (a && b == undefined) {
    return fail("FAIL" + test + " Expected neither or both objects to be null/undefined, " +
                "but only `b` was" + failedLocation());
  }
  var aKeys = Object.keys(a);
  var bKeys = Object.keys(b);
  for (var i = 0; i < aKeys.length; i++) {
    var key = aKeys[i];
    if (a[key] !== b[key]) {
      return fail("FAIL" + test + " properties differ. a." + key + " = " + a[key] +
                  ", b." + key + " = " + b[key] + failedLocation());
    }
  }
  for (i = 0; i < bKeys.length; i++) {
    key = bKeys[i];
    if (a[key] !== b[key]) {
      return fail("FAIL" + test + " properties differ. a." + key + " = " + a[key] +
                  ", b." + key + " = " + b[key] + failedLocation());
    }
  }
  console.info("PASS" + test);
}

function check(condition, test) {
  test = description(test);
  if (!condition) {
    return fail("FAIL " + test + ". Got " + condition + ", expected truthy value" +
                failedLocation());
  }
  console.info("PASS" + test);
}

function assertThrowsInstanceOf(f, ctor, test) {
  test = description(test);
  var msg;
  try {
    f();
  } catch (exc) {
    if (exc instanceof ctor) {
      return;
    }
    msg = "Expected exception " + ctor.name + ", got " + exc;
  }
  if (msg === undefined) {
    msg = "Expected exception " + ctor.name + ", no exception thrown";
  }
  return fail("FAIL " + test + ". " + msg + failedLocation());
}

function description(test) {
  testNumber++;
  return test ? ": " + test : " #" + testNumber;
}

function failedLocation() {
  return " (" + new Error().stack.split('\n')[2] + ")";
}

/**
 * Global unitTests array, unit tests add themselves to this. The list may have
 * numbers, these indicate the number of times to run the test following it. This
 * makes it easy to disable test by pushing a zero in front.
 */
var unitTests = [];
var everFailed = false;

var testNumber = 0;

function readDirectoryListing(path, next) {
  var files = [];
  var directories = [];
  var xhr = new XMLHttpRequest({mozSystem:true});
  xhr.open("GET", path + '?all', true);
  xhr.onload = function() {
    var re = /<a href=["']([^"']+)/g, m;
    while ((m = re.exec(xhr.response))) {
      var file = m[1];
      if (file.endsWith("/")) {
        if (!(file === "." || file === "..")) {
          directories.push(file);
        }
      } else {
        files.push(file[0] === '/' ? file : path + file);
      }
    }

    function readNextDirectory(done) {
      if (!directories.length) {
        done();
        return;
      }
      readDirectoryListing(path + directories.pop(), function (x) {
        Shumway.ArrayUtilities.pushMany(files, x);
        readNextDirectory(done);
      });
    }
    readNextDirectory(function () {
      next(files);
    });
  };
  xhr.send();
}

function executeUnitTests(file, avm2) {
  function runTests() {
    console.info("Executing Unit Tests");
    var lastTestPromise = Promise.resolve();

    for (var i = 0; i < unitTests.length; i++) {
      var test = unitTests[i];
      var repeat = 1;
      if (typeof unitTests[i] === "number") {
        repeat = unitTests[i];
        test = unitTests[++i];
      }
      for (var r = 0; r < repeat; r++) {
        (function (test) {
          lastTestPromise = lastTestPromise.then(function () {
            return test(avm2);
          });
        })(test);
      }
    }

    lastTestPromise.then(function () {
      console.info("Unit Tests is Completed");
    }, function (e) {
      console.info("Unit Tests Failed: " + e);
    });
  }
  if (file.endsWith("/")) {
    readDirectoryListing(file, function (files) {
      function loadNextScript(done) {
        if (!files.length) {
          done();
          return;
        }
        var unitTest = files.pop();
        console.info("Loading Unit Test: " + unitTest);
        loadScript(unitTest, function () {
          loadNextScript(done);
        });
      }

      loadNextScript(runTests);
    });
  } else {
    loadScript(file, runTests);
  }
}

