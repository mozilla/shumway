/**
 * Shumway AVM Testing Framework
 *
 * This script runs test cases under several VM configurations and produces a large .json
 * file with the output of each test case.
 *
 * The list of executed tests is computed using a sequence of include (-i path) and exclude (-e path)
 * command line arguments, e.g.:
 *   node numbers.js -i file.list -e file.list -i directory
 */

var path = require('path');
var fs   = require('fs');
var readFile = fs.readFileSync;
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var temp = require('temp');

global.assert = function () { };
global.release = false;
var options = require("../options.js");
var ArgumentParser = options.ArgumentParser;
var Option = options.Option;
var OptionSet = options.OptionSet;

// Parse arguments
var arguments = process.argv.slice(2);
var argumentParser = new ArgumentParser();
var numbersOptions = new OptionSet("Numbers Options");
var jobs = numbersOptions.register(new Option("j", "jobs", "number", 1, "runs the tests in parallel"));
var release = numbersOptions.register(new Option("r", "release", "boolean", false, "build and test release version"));
var jsOptimazations = numbersOptions.register(new Option("jo", "jsOptimazations", "boolean", false, "run with -m -n"));
var noMetrics = numbersOptions.register(new Option("nm", "noMetrics", "boolean", false, "runs without -tm -tj"));
var timeout = numbersOptions.register(new Option("t", "timeout", "number", 30000, "timeout in ms"));
var configurationSet = numbersOptions.register(new Option("c", "configurations", "string", "iclov", "(i)nterpreter, (c)ompiler, (o)ptimized, in(l)ineCaching, (v)erifier"));
var output = numbersOptions.register(new Option("o", "output", "string", "", "output json file"));

var summary = numbersOptions.register(new Option("s", "summary", "boolean", false, "trace summary"));

/**
 * Output Patching:
 *
 * There are cases where the Shumway output is "correct" but does not match AVM output. For instance: rounding errors,
 * the way errors are displayed, various semantics that we chose not to implement for the sake of performance, etc.
 *
 * If a file foo.abc.diff exists in the same directory as foo.abc, then the diff file is applied to the output of foo.abc
 * using the "patch" command, e.g. patch foo.abc.output < foo.abc.diff. The result is then compared against the AVM output.
 *
 * .diff files can be generated manually, or by specifying the |generatePatches| command line argument. This automatically
 * generates .diff files for any test case that fails and does not already have one.
 */

var generatePatches = numbersOptions.register(new Option("gp", "patches", "boolean", false, "creates patch files"));

argumentParser.addBoundOptionSet(numbersOptions);
argumentParser.addArgument("h", "help", "boolean", {parse: function (x) {
  console.log("numbers.js " + argumentParser.getUsage());
  process.exit();
}});

function endsWith(str, end) {
  return str.substring(str.length - end.length) === end;
}

function listFiles(path) {
  if (path[path.length - 1] === "/") {
    path = path.substring(0, path.length - 1);
  }
  var files = [];
  fs.readdirSync(path).forEach(function (x) {
    var file = path + "/" + x;
    var stat = fs.lstatSync(file);
    if (stat.isDirectory() || stat.isSymbolicLink()) {
      files = files.concat(listFiles(file));
    } else if (endsWith(file, ".abc")) {
      files.push(file);
    }
  });
  return files;
}

function getTests(path) {
  var files = [];
  var stats = fs.lstatSync(path);
  if (stats.isDirectory()) {
    files = listFiles(path);
  } else if (stats.isFile()) {
    if (endsWith(path, ".abc")) {
      files.push(path);
    } else {
      files = readFile(path).toString().split("\n").filter(function (x) {
        return x.trim() && x.trim()[0] != "#"
      }).map(function (x) {
         return x.trim();
      });
    }
  }
  return files;
}

/**
 * Patch the given |text| with |file|.diff if one exists.
 */
function patchTest(file, text, next) {
  if (fs.existsSync(file + ".diff")) {
    temp.open("out", function (err, info) {
      fs.writeSync(info.fd, text);
      var command = "patch " + info.path + " " + file + ".diff";
      exec(command, {}, function (error, stdout, stderr) {
        next(readFile(info.path).toString());
      });
    });
  } else {
    next(text);
  }
}

var isWin = !!process.platform.match(/^win/);

function pathToOSCommand(path) {
  if (!path || !isWin) return path;
  return path.replace(/^\/(\w)\//, "$1:\\").replace(/\//g, "\\");
}

var tests = [];

// Collect test cases
argumentParser.addArgument("i", "include", "string", {parse: function (x) {
  var include = getTests(x);
  tests = tests.concat(include.filter(function (y) { return tests.indexOf(y) < 0; }));
}});

argumentParser.addArgument("e", "exclude", "string", {parse: function (x) {
  var exclude = getTests(x);
  tests = tests.filter(function (y) { return exclude.indexOf(y) < 0; });
}});

try {
  argumentParser.parse(arguments);
} catch (x) {
  console.log(x.message);
  process.exit();
}

if (!process.env.AVM) {
  console.log("Set the AVM environment variable to the avmshell path.");
  process.exit();
}

var avmShell = {path: pathToOSCommand(process.env.AVM), options: []};

// Use -tm -tj to emit VM metrics in JSON format.
var configurations = [
  {name: "avm", timeout: timeout.value, command: avmShell.path}
];

var commandPrefix = pathToOSCommand(process.env.JSSHELL) || "js --no-ion";
if (jsOptimazations.value) {
  commandPrefix += " -m -n";
}
commandPrefix += " " + (release.value ? "avm-release.js" : "avm.js");

var commandSuffix = noMetrics.value ? "" : " -tm -tj";
if (configurationSet.value.indexOf("i") >= 0) {
  configurations.push({name: "shu-i", timeout: timeout.value, command: commandPrefix + " -x -i" + commandSuffix});
}
if (configurationSet.value.indexOf("c") >= 0) {
  configurations.push({name: "shu-c", timeout: timeout.value, command: commandPrefix + " -x" + commandSuffix});
}
if (configurationSet.value.indexOf("o") >= 0) {
  configurations.push({name: "shu-o", timeout: timeout.value, command: commandPrefix + " -x -opt" + commandSuffix});
}
if (configurationSet.value.indexOf("l") >= 0) {
  configurations.push({name: "shu-l", timeout: timeout.value, command: commandPrefix + " -x -opt -ic" + commandSuffix});
}
if (configurationSet.value.indexOf("v") >= 0) {
  configurations.push({name: "shu-v", timeout: timeout.value, command: commandPrefix + " -x -opt -verify" + commandSuffix});
}

if (configurationSet.value.indexOf("u") >= 0) {
  configurations.push({name: "shu-u", timeout: timeout.value, command: commandPrefix + " -x -opt -verify -unsafelookup" + commandSuffix});
}

console.log(padRight("=== Configurations ", "=", 120));
configurations.forEach(function (x) {
  console.log(padLeft(x.name, ' ', 10) + ", timeout: " + (x.timeout / 1000).toFixed(2) + ", command: " + x.command);
});
console.log(padRight("", "=", 120));

var INFO = '\033[94m';
var WARN = '\033[93m';
var PASS = '\033[92m';
var FAIL = '\033[91m';
var ENDC = '\033[0m';

var results = {};

function padRight(s, c, n) {
  if (!c || s.length >= n) {
    return s;
  }
  var max = (n - s.length) / c.length;
  for (var i = 0; i < max; i++) {
    s += c;
  }
  return s;
}

function padLeft(s, c, n) {
  if (!c || s.length >= n) {
    return s;
  }
  var max = (n - s.length) / c.length;
  for (var i = 0; i < max; i++) {
    s = c + s;
  }
  return s;
}

var remainingJobs = jobs.value;
var inParallel = jobs.value > 1;

var sha;
var totalStart = new Date();
exec("git log --pretty=format:'%H' -n 1", function (error, stdout, stderr) {
  sha = stdout;
  if (release.value) {
    process.stdout.write("Building Release Version (avm-release.js) ... ");
    exec("node build.js avm.js > avm-release.js", function () {
      process.stdout.write("DONE\n");
      runTests();
    });
  } else {
    runTests();
  }
  function runTests() {
    console.log(padRight("=== Running " + tests.length + " Tests, Using " + jobs.value + " Job(s) " + (jobs.value > 1 ? "(invalid timing results) " : ""), "=", 120));
    for (var i = 0; i < jobs.value; i++) {
      runNextTest();
    }
  }
});

function shortPath(str, length) {
  if (str.length > length) {
    str = str.substring(str.length - length);
  }
  return str;
}

function extractData(str) {
  var lines = str.replace(/\r/g, "").split("\n");
  var data = {};
  const jsonPrefix = "SHUMWAY$JSON";
  var textLines = lines.filter(function (x) {
    if (x.indexOf(jsonPrefix) === 0) {
      var lineData = {};
      try {
        lineData = JSON.parse(x.substring(jsonPrefix.length + 1));
      } catch (e) {
        // Nop
      }
      for (var k in lineData) {
        data[k] = lineData[k];
      }
      return false;
    }
    return true;
  });
  return {text: textLines.join("\n"), data: data};
}

var counts = {};

function count(name) {
  if (!(name in counts)) {
    counts[name] = 0;
  }
  counts[name] ++;
}

var pathLength = 140;
var testNumber = 0;

var failedTests = [];
function runNextTest () {
  var test = tests.pop();
  var configs = configurations.slice(0);
  if (test) {
    if (!inParallel) {
      process.stdout.write(padLeft((testNumber ++).toString(), ' ', 4));
      process.stdout.write(" " + padRight(shortPath(test, pathLength), ' ', pathLength) + " ");
    }
    function runNextConfiguration() {
      var config = configs.shift();
      if (config) {
        var command = config.command + " " + test;
        var start = new Date();
        var p = exec(command, {timeout: config.timeout}, function (error, stdout, stderr) {
          if (!(test in results)) {
            results[test] = {};
          }
          patchTest(test, stdout, function (output) {
            var output = extractData(output);
            results[test][config.name] = {output: output, elapsed: new Date() - start};
            if (!inParallel) {
              process.stdout.write(".");
            }
            runNextConfiguration();
          });
        });
      } else {
        var baseline = results[test][configurations[0].name];
        var someFailed = false;
        if (inParallel) {
          process.stdout.write(padLeft((testNumber ++).toString(), ' ', 4));
          process.stdout.write(" " + padRight(shortPath(test, pathLength), ' ', pathLength) + " ");
        }
        for (var i = 0; i < configurations.length; i++) {
          var configuration = configurations[i];
          var result = results[test][configuration.name];
          if (Math.max(baseline.elapsed, result.elapsed) > timeout.value) {
            someFailed = true;
            process.stdout.write(WARN + " TIME" + ENDC);
            count(configuration.name + ":time");
          } else if (baseline.output.text == result.output.text) {
            if (i > 0) {
              delete result.output.text;
              process.stdout.write(PASS + " PASS 100 %" + ENDC);
              count(configuration.name + ":pass");
            }
          } else {
            someFailed = true;
            var nPassed = 0, nFailed = 0, nPassedPercentage = 1;
            if (result.output.text && baseline.output.text) {
              var match = result.output.text.match(/PASSED/g);
              nPassed = match ? match.length : 0;
              match = baseline.output.text.match(/PASSED/g);
              var nTotal = match ? match.length : 0;
              nPassedPercentage = (nPassed / nTotal) * 100 | 0;
            }
            if (nPassedPercentage >= 50) {
              process.stdout.write(WARN + " PASS " + padLeft(nPassedPercentage.toString(), ' ', 3) + " %" + ENDC);
            } else {
              process.stdout.write(FAIL + " FAIL " + padLeft(nPassedPercentage.toString(), ' ', 3) + " %" + ENDC);
              failedTests.push(test);
            }
            count(configuration.name + ":fail");
          }
          process.stdout.write(" " + (result.elapsed / 1000).toFixed(2));
          process.stdout.write(" " + (baseline.elapsed / result.elapsed).toFixed(2) + "x");
          var timer = result.output.data.timer;
          if (false && timer) {
            // TODO: Enable this if we actually need it.
            var vmLoadTime = timer.timers["Loading VM"].total;
            process.stdout.write(" " + ((result.elapsed - vmLoadTime) / 1000).toFixed(2));
            if (timer.timers["Compiler"]) {
              var vmCompilerTime = timer.timers["Compiler"].total;
              process.stdout.write(" " + ((result.elapsed - vmLoadTime - vmCompilerTime) / 1000).toFixed(2));
            }
          }
        }
        if (!someFailed) {
          delete baseline.output.text;
          count("all-passed");
        }
        process.stdout.write("\n");
        runNextTest();
      }
    }
    runNextConfiguration();
  } else {
    if (--remainingJobs === 0) {
      var totalTime = (new Date() - totalStart);
      var final = {sha: sha, totalTime: totalTime, jobs: jobs.value, date: new Date(), configurations: configurations, results: results};
      fs.mkdir("runs", function() {
        var fileName = "runs/" + sha;
        fileName += "." + configurationSet.value;
        fileName += (jobs.value > 1 ? ".parallel" : "");
        fileName += (!noMetrics.value ? ".metrics" : "");
        fileName += ".json";
        if (output.value) {
          fileName = output.value;
        }
        fs.writeFile(fileName, JSON.stringify(final));
        console.log(padRight("", "=", 120));
        console.log("Executed in: " + totalTime + ", wrote: " + fileName);
        console.log(counts);
        console.log(padRight("=== DONE ", "=", 120));
        if (failedTests.length) {
          console.log(padRight("=== FAILED TESTS ", "=", 120));
          for (var i = 0; i < failedTests.length; i++) {
            console.log(failedTests[i]);
          }
          console.log(padRight("", "=", 120));
        }
        if (summary.value) {
          printSummary();
        }
        /**
         * This generates .diff files for each test case that failed in its first configuration. The .diff file is
         * generated against the avm output and stored in the same directory as the test .abc file itself. If a
         * diff file is found when running the test case it is applied to the output before comparing against the
         * avm output.
         */
        if (generatePatches.value) {
          for (var test in results) {
            if (fs.existsSync(test + ".diff")) {
              continue;
            }
            (function (test) {
              var result = results[test];
              var baselineName = configurations[0].name;
              var baselineText = result[baselineName].output.text;
              var runName = configurations[1].name;
              var runText = result[runName].output.text;
              if (baselineText !== runText) {
                temp.open("out", function (err, baselineFile) {
                  fs.writeSync(baselineFile.fd, baselineText);
                  temp.open("out", function (err, runFile) {
                    fs.writeSync(runFile.fd, runText);
                    var command = "diff -u " + baselineFile.path + " " + runFile.path + " > " + test + ".diff";
                    exec(command, {}, function (error, stdout, stderr) {
                      console.log("Created Patch for " + test + " -> " + test + ".diff (diff -u {" + baselineName + "} {" + runName + "})");
                    });
                  });
                });
              }
            })(test);
          }
        }
      });
    }
  }
}

function printSummary() {
  console.log(padRight("SUMMARY", "=", 120));
  for (var k in results) {
    for (var c in results[k]) {
      if (c === "avm") {
        continue;
      }
      try {
        var counts = results[k][c].output.data.counter.counts;
        var line = "Execution: " + shortPath(k, 30) + ":" + c + ": ";

        for (var x in counts) {
          line += x + ": " + (counts[x] > 10000 ? FAIL : PASS) + counts[x] + ENDC + " ";
        }
        console.log(line);
      } catch (x) {

      }
    }
  }
  console.log(padRight("=== DONE ", "=", 120));
}

if (!isWin) {
  process.on('SIGINT', function () {
    if (summary.value) {
      printSummary();
    }
    process.exit();
  });
}
