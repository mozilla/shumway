var fs = require('fs');
var spawn = require('child_process').spawn;

var jsPath = './utils/jsshell/js';
var shellPath = './build/ts/shell.js';
var defaultManifestFile = './test/test_manifest_trace.json';
var traceFile = './test/trace.log';
var diffRefDataFile = './test/refdata~';
var diffTestDataFile = './test/testdata~';
var runTicksCount = 30; // max microtask queue iterations per test

var GREEN = '\033[92m';
var RED = '\033[91m';
var ENDC = '\033[0m';

var PASS_PREFIX = GREEN + "PASS: " + ENDC;
var FAIL_PREFIX = RED + "FAIL: " + ENDC;
var SKIP_PREFIX = "SKIP: ";
var manifestFile = null;

var ignoredOutput = [
  "successfully compiled asm.js",
  "pre-main prep time"
];

// We want to ignore some messages in our output. The child process's output isn't always received
// in full lines, so it's important to filter those messages out after all output was received.
function filterOutput(output) {
  // Additionally, normalize line endings.
  return output.split('\r\n').join('\n').split('\n').filter(function(line) {
    for (var i = ignoredOutput.length; i--;) {
      if (line.indexOf(ignoredOutput[i]) > -1) {
        return false;
      }
    }
    return true;
  }).join('\n');
}

function runSwf(path, callback) {
  var child = spawn(jsPath,
    [shellPath, '-x', path, '--count', runTicksCount, '--nohangAvm1', '--porcelain'],
    {
      stdio: ['ignore', 'pipe', 'pipe']
    });
  var output = '';
  var error = '';
  child.stdout.on('data', function (data) {
    output += data;
  });
  child.stderr.on('data', function (data) {
    error += data;
  });
  child.on('close', function (code) {
    error = filterOutput(error);
    if (code) {
      error = 'Exited with code: ' + code + '\n' + error;
    }
    output = filterOutput(output);
    callback(error || null, output);
  });
}

function saveDiff(path, id, expected, output, callback) {
  var refFile = diffRefDataFile.replace(/~$/, '.' + id + '.~');
  var testFile = diffTestDataFile.replace(/~$/, '.' + id + '.~');
  fs.writeFileSync(refFile, expected);
  fs.writeFileSync(testFile, output);
  var child = spawn('diff', ['-U', '2', refFile, testFile], {
    stdio: ['ignore', 'pipe', 'ignore']
  });
  var result = '';
  child.stdout.on('data', function (data) {
    result += data;
  });
  child.on('close', function (code) {
    fs.unlinkSync(refFile);
    fs.unlinkSync(testFile);

    fs.appendFile(traceFile,
        'REFTEST TEST-UNEXPECTED-FAIL | ' + path + '\n' + result, callback);
  });
  child.on('error', function () {
    result = '<<<< reference\n' + expected + '====\n' + output + '>>>> test\n';
  });
}

function runTest(test, thread, callback) {
  runSwf(test.path, function (err, output) {
    var id = test.id + ' | ' + test.path;
    if (err) {
      console.log(FAIL_PREFIX  + id + ', error: ' + err);
      callback(false);
      return;
    }
    var expected = fs.readFile(test.path + '.trace', function (err, content) {
      if (err) {
        console.log(FAIL_PREFIX + id + ', expected output is not available: ' + err);
        callback(false);
        return;
      }
      var expected = content.toString();
      var threadId = threads < 2 ? '' : ' (' + thread + ')';
      var pass = expected === output;
      if (pass) {
        console.log(PASS_PREFIX + id + threadId);
        callback(true);
      } else {
        console.log(FAIL_PREFIX + id + threadId + ', see trace.log');
        saveDiff(test.path, thread, expected, output, function () {
          callback(false);
        });
      }
    });
  })
}

var threads = 1;
var availableThreads = [];

function main() {
  var commandLineArguments = Array.prototype.slice.call(process.argv, 2);

  if (commandLineArguments[0] === '-j' ||
    commandLineArguments[0] === '--threads') {
    commandLineArguments.shift();
    threads = parseInt(commandLineArguments.shift(), 10) || 1;
  }
  for (var i = 0; i < threads; i++) {
    availableThreads.push(i + 1);
  }

  if (commandLineArguments[0] === '-m' ||
      commandLineArguments[0] === '--manifestFile') {
    manifestFile = commandLineArguments[1];
    commandLineArguments.splice(0, 2);
  } else if (commandLineArguments.length === 0) {
    manifestFile = defaultManifestFile;
  }

  var tests = [];
  if (manifestFile) {
    console.log('Using manifest at ' + manifestFile + '...');
    var basePath = manifestFile.substring(0, manifestFile.lastIndexOf('/') + 1);
    JSON.parse(fs.readFileSync(manifestFile).toString()).forEach(function (group) {
      if (group.type && group.type !== 'stas') {
        console.log(SKIP_PREFIX + group.id + ' | non-stas test');
        return;
      }
      Array.prototype.push.apply(tests, group.filenames.map(function (filename) {
        return {
          id: group.id,
          path: filename[0] === '/' ? '.' + filename : basePath + filename
        };
      }));
    });
  }
  if (commandLineArguments.length > 0) {
    commandLineArguments.forEach(function (filename) {
      tests.push({
        id: '-',
        path: filename
      })
    });
  }

  if (fs.existsSync(traceFile)) {
    fs.unlinkSync(traceFile);
  }

  if (tests.length === 0) {
    console.log('No tests found.');
    process.exit(1);
  }

  var testIndex = 0, success = true;
  (function next() {
    if (testIndex >= tests.length && availableThreads.length === threads) {
      if (success) {
        console.log('SUCCESS: All trace tests pass.');
        process.exit(0);
      } else {
        process.exit(1);
      }
      return;
    }
    if (testIndex >= tests.length || availableThreads.length === 0) {
      return;
    }
    var swf = tests[testIndex++];
    var thread = availableThreads.shift();
    runTest(swf, thread, function (pass) {
      if (!pass) {
        success = false;
      }
      availableThreads.push(thread);
      next();
    });
    next();
  })();
}

main();
