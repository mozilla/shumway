function eqFloat(a, b, test) {
  test = test ? ": " + test : " #" + testNumber;
  if (Math.abs(a -b) >= 0.1) {
    throw new Error("FAIL " + test);
  }
  console.info("PASS" + test);
  testNumber ++;
}

function neq(a, b, test) {
  test = test ? ": " + test : " #" + testNumber;
  if (a === b) {
    throw new Error("FAIL " + test);
  }
  console.info("PASS" + test);
  testNumber ++;
}

function eq(a, b, test) {
  test = test ? ": " + test : " #" + testNumber;
  if (a !== b) {
    throw new Error("FAIL " + test);
  }
  console.info("PASS" + test);
  testNumber ++;
}

function eqArray(a, b, test) {
  test = test ? ": " + test : " #" + testNumber;
  if (a == undefined && b) {
    throw new Error("FAIL" + test + " Null Array: a");
  }
  if (a && b == undefined) {
    throw new Error("FAIL" + test + " Null Array: b");
  }
  if (a && b) {
    if (a.length !== b.length) {
      throw new Error("FAIL" + test + " Array Length Mismatch, got " + a.length + ", expected " + b.length);
    }
    for (var i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        if (!(typeof a[i] == "number" && typeof b[i] == "number" && isNaN(a[i]) && isNaN(b[i]))) {
          throw new Error("FAIL" + test + " Array Element " + i + ": got " + a[i] + ", expected " + b[i]);
        }
      }
    }
  }
  console.info("PASS" + test);
  testNumber ++;
}

function check(condition, test) {
  test = test ? ": " + test : " #" + testNumber;
  if (!condition) {
    throw new Error("FAIL " + test);
  }
  console.info("PASS" + test);
  testNumber ++;
}

/**
 * Global unitTests array, unit tests add themselves to this. The list may have
 * numbers, these indicate the number of times to run the test following it. This
 * makes it easy to disable test by pushing a zero in front.
 */
var unitTests = [];

var testNumber = 0;

function readDirectoryListing(path, next) {
  assert (path.endsWith("/"));
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
        files.pushMany(x);
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
    initUI();
    console.info("Executing Unit Tests");
    var lastTestPromise = Promise.resolve();

    for (var i = 0; i < unitTests.length; i++) {
      test = unitTests[i];
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

