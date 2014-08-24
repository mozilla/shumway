var fs = require('fs');
var spawn = require('child_process').spawn;

var jsPath = './utils/jsshell/js';
var shellPath = './build/ts/shell.js';
var defaultManifestFile = './test/test_manifest_trace.json';
var traceFile = './test/trace.log';
var diffRefDataFile = './test/refdata~';
var diffTestDataFile = './test/testdata~';
var runDuration = 1000;

var GREEN = '\033[92m';
var RED = '\033[91m';
var ENDC = '\033[0m';

var PASS_PREFIX = GREEN + "PASS: " + ENDC;
var FAIL_PREFIX = RED + "FAIL: " + ENDC;
var manifestFile = null;

function runSwf(path, callback) {
  var child = spawn(jsPath,
    [shellPath, '-x', path, '--avm1lib', '--duration', runDuration, '--porcelain'],
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
    if (code) {
      error = 'Exited with code: ' + code + '\n' + error;
    }
    callback(error || null, output);
  });
}

function saveDiff(path, expected, output, callback) {
  fs.writeFileSync(diffRefDataFile, expected);
  fs.writeFileSync(diffTestDataFile, output);
  var child = spawn('diff', ['-U', '2', diffRefDataFile, diffTestDataFile], {
    stdio: ['ignore', 'pipe', 'ignore']
  });
  var result = '';
  child.stdout.on('data', function (data) {
    result += data;
  });
  child.on('close', function (code) {
    fs.unlinkSync(diffRefDataFile);
    fs.unlinkSync(diffTestDataFile);

    fs.appendFile(traceFile,
        'REFTEST TEST-UNEXPECTED-FAIL | ' + path + '\n' + result, callback);
  });
  child.on('error', function () {
    result = '<<<< reference\n' + expected + '====\n' + output + '>>>> test\n';
  });
}

function runTest(test, callback) {
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
      var pass = expected === output;
      if (pass) {
        console.log(PASS_PREFIX + id);
        callback(true);
      } else {
        console.log(FAIL_PREFIX + id + ', see trace.log');
        saveDiff(test.path, expected, output, function () {
          callback(false);
        });
      }
    });
  })
}

function main() {
  var commandLineArguments = Array.prototype.slice.call(process.argv, 2);

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
    console.log('No tests found.')
    process.exit(1);
  }

  var testIndex = 0, success = true;
  (function next() {
    if (testIndex >= tests.length) {
      if (success) {
        console.log('SUCCESS: All trace tests pass.');
        process.exit(0);
      } else {
        process.exit(1);
      }
      return;
    }
    var swf = tests[testIndex++];
    runTest(swf, function (pass) {
      if (!pass) {
        success = false;
      }
      next();
    });
  })();
}

main();
