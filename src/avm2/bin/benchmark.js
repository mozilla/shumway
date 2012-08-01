var path = require('path');
var fs   = require('fs');
var readFile = fs.readFileSync;
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

var tests = readFile("tamarin.passed").toString().split("\n");

var avmShell = {path: process.env.AVM, options: []};
var shuShell = {path: "js", options: "-m -n avm.js".split(" ")};

var configurations = [
  {name: "avm", timeout: 500, command: avmShell.path},
  {name: "shu-i", timeout: 2000, command: "js avm.js -x -i"},
  {name: "shu-c", timeout: 2000, command: "js avm.js -x"},
  {name: "shu-o", timeout: 2000, command: "js avm.js -x -opt"},
  {name: "shu-v", timeout: 2000, command: "js avm.js -x -opt -verify"},

  {name: "avm-release-i", timeout: 2000, command: "js avm-release.js -x -i"},
  {name: "avm-release-c", timeout: 2000, command: "js avm-release.js -x"},
  {name: "avm-release-o", timeout: 2000, command: "js avm-release.js -x -opt"},
  {name: "avm-release-v", timeout: 2000, command: "js avm-release.js -x -opt -verify"}
];

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

var sha;
exec("git log --pretty=format:'%H' -n 1", function (error, stdout, stderr) {
  sha = stdout;
  process.stdout.write("Building Release Version (avm-release.js) ... ");
  exec("node build.js avm.js > avm-release.js", function () {
    process.stdout.write("DONE\n");
    runNextTest();
  });
});

tests = tests.slice(0, 5);
function runNextTest () {
  var test = tests.pop();
  var configs = configurations.slice(0);
  if (test) {
    var testName = test;
    var maxTextName = 39;
    if (testName.length > maxTextName) {
      testName = testName.substring(testName.length - maxTextName);
    }
    process.stdout.write(padRight(testName, ' ', maxTextName) + " ");
    function runNext() {
      var config = configs.shift();
      if (config) {
        var command = config.command + " " + test;
        var start = new Date();
        var p = exec(command, {timeout: config.timeout}, function (error, stdout, stderr) {
          if (!(test in results)) {
            results[test] = {};
          }
          results[test][config.name] = {stdout: stdout, elapsed: new Date() - start};
          process.stdout.write(".");
          runNext();
        });
      } else {
        var baseline = results[test][configurations[0].name];
        for (var i = 0; i < configurations.length; i++) {
          var result = results[test][configurations[i].name]
          if (baseline.stdout == result.stdout) {
            process.stdout.write(PASS + " PASS" + ENDC);
          } else {
            process.stdout.write(FAIL + " FAIL" + ENDC);
          }
          process.stdout.write(" " + (result.elapsed / 1000).toFixed(2));
          process.stdout.write(" " + (baseline.elapsed / result.elapsed).toFixed(2) + "X");
        }
        process.stdout.write("\n");
        runNextTest();
      }
    }
    runNext();
  } else {
    var final = {sha: sha, date: new Date(), configurations: configurations, results: results};

    fs.writeFile("runs/" + sha + ".json", JSON.stringify(final));
  }
}