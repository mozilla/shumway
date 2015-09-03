var execSync = require('child_process').execSync;
var fs = require('fs');
var os = require("os");

var lastTimes = { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 };

var benchmarkIdlePercentage = 0;

function sampleCPU() {
  var cpus = os.cpus();
  var times = { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 };
  for (var i = 0; i < cpus.length; i++) {
    for (var k in cpus[i].times) {
      times[k] += cpus[i].times[k];
    }
  }
  var deltaTimes = { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 };
  for (var k in deltaTimes) {
    deltaTimes[k] = times[k] - lastTimes[k];
  }
  lastTimes = times;
  var totalTimes = 0;
  for (var k in deltaTimes) {
    totalTimes += deltaTimes[k];
  }
  var idlePercentage = deltaTimes.idle / totalTimes;
  if (idlePercentage < 0.95) {
    console.info("CPU is " + (idlePercentage * 100).toFixed(2) + "% idle, should be at least 95%. Close some applications to continue.");
    setTimeout(sampleCPU, 1000);
  } else {
    benchmarkIdlePercentage = idlePercentage;
    run();
  }
}

sampleCPU();

function run() {
  function timeNow() {
    var time = process.hrtime();
    return (time[0] * 1e9 + time[1]) / 1000000;
  }

  function extendBuiltin(prototype, property, value) {
    if (!prototype[property]) {
      Object.defineProperty(prototype, property,
        {
          value:        value,
          writable:     true,
          configurable: true,
          enumerable:   false
        });
    }
  }

  extendBuiltin(String.prototype, "padRight", function (c, n) {
    var str = this;
    var length = str.length;
    if (!c || length >= n) {
      return str;
    }
    var max = (n - length) / c.length;
    for (var i = 0; i < max; i++) {
      str += c;
    }
    return str;
  });

  extendBuiltin(String.prototype, "padLeft", function (c, n) {
    var str = this;
    var length = str.length;
    if (!c || length >= n) {
      return str;
    }
    var max = (n - length) / c.length;
    for (var i = 0; i < max; i++) {
      str = c + str;
    }
    return str;
  });

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function msFormatter(x) {
    return numberWithCommas(Math.round(x)) + "ms";
  }

  var LEFT = 0;
  var CENTER = 1;
  var RIGHT = 2;

  function prettyTable(rows, alignment) {
    function pad(str, repeat, n, align) {
      if (align === LEFT) {
        return str.padRight(repeat, n);
      } else if (align === CENTER) {
        var middle = ((n - str.length) / 2) | 0;
        return str.padRight(repeat, middle + str.length).padLeft(repeat, n);
      } else if (align === RIGHT) {
        return str.padLeft(repeat, n);
      }
      throw new Error("Bad align value." + align);
    }

    var maxColumnLengths = [];
    var numColumns = rows[0].length;
    for (var colIndex = 0; colIndex < numColumns; colIndex++) {
      var maxLength = 0;
      for (var rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        var strLen = rows[rowIndex][colIndex].toString().length;
        if (rows[rowIndex].untrusted) {
          strLen += 2;
        }
        maxLength = Math.max(strLen, maxLength);
      }
      maxColumnLengths[colIndex] = maxLength;
    }
    var out = "";
    for (var rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      out += "| ";
      for (var colIndex = 0; colIndex < numColumns; colIndex++) {
        var str = rows[rowIndex][colIndex].toString();
        if (rows[rowIndex].untrusted) {
          str = "*" + str + "*";
        }
        out += pad(str, " ", maxColumnLengths[colIndex], rowIndex === 0 ? CENTER : alignment[colIndex]) + " | ";
      }
      out += "\n";
      if (rowIndex === 0) {
        out += "|";
        for (var colIndex = 0; colIndex < numColumns; colIndex++) {
          var align = alignment[colIndex];
          if (align === 0) {
            out += ":".padRight("-", maxColumnLengths[colIndex] + 2);
          } else if (align === 1) {
            out += ":".padLeft("-", maxColumnLengths[colIndex] + 1) + ":";
          } else if (align === 2) {
            out += ":".padLeft("-", maxColumnLengths[colIndex] + 2);
          }
          out += "|";
        }
        out += "\n";
      }
    }
    return out;
  }

  function timeExec(command, count) {
    var s = 0;
    process.stdout.write("Running: " + command + ": ");
    for (var i = 0; i < count; i++) {
      var t = timeNow();
      var child = execSync(command);
      s += timeNow() - t;
      process.stdout.write(".")
    }
    process.stdout.write("\n");
    return s / count;
  }

  function runBenchmark(command, iterations) {
    return {value: timeExec(command, iterations), iterations: iterations, command: command};
  }

  function runBenchmarks() {
    var result = {};
    var iterations = 10;
    result["HelloWorld"] = runBenchmark("js build/ts/shell.js -r -x test/avm2/shumway/hello.abc", iterations);
    result["Many w/o Pump"] = runBenchmark("js build/ts/shell.js -x test/bench/many.swf -r -det -fc 30 -enablePump false", iterations);
    result["Many"] = runBenchmark("js build/ts/shell.js -x test/bench/many.swf -r -det -fc 30", iterations);
    return result;
  }

  var result = runBenchmarks();
  var baseline;
  if (!fs.existsSync('baseline.json')) {
    console.info("Saving baseline.json ... (delete this file if you want to rebuild the baseline.)");
    fs.writeFile('baseline.json', JSON.stringify(result));
    baseline = result;
  } else {
    baseline = JSON.parse(fs.readFileSync('baseline.json'));
  }

  var rows = [
    ["Metric", "Baseline", "New", "Difference", "%", "Command"]
  ];

  console.info(prettyTable([
    ["Key", "Value"],
    ["CPU Model", os.cpus()[0].model],
    ["CPU Speed", os.cpus()[0].speed],
    ["CPU Count", os.cpus().length],
    ["Idle Time", (benchmarkIdlePercentage * 100).toFixed(2) + "%"]
  ], [LEFT, LEFT]));

  for (var k in result) {
    var currentMean = result[k].value;
    var baselineMean = baseline[k].value;
    var percent = (100 * (currentMean - baselineMean) / baselineMean).toFixed(2) + "%";
    rows.push([k, msFormatter(baselineMean), msFormatter(currentMean), msFormatter(currentMean - baselineMean), percent, result[k].command]);
  }

  console.info("");
  console.info(prettyTable(rows, [LEFT, LEFT, LEFT, LEFT, RIGHT, LEFT]));
}