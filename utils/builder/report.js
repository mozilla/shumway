var path = require('path');
var fs   = require('fs');
var readFile = fs.readFileSync;

var arguments = process.argv.slice(2);

var file = readFile(arguments[0]), profile = JSON.parse(readFile(arguments[1]));

file = file.toString().split("\n");

trace(profile.functions, "Functions");
trace(profile.loops, "Loops");
trace(profile.allocations, "Allocations");

function trace(o, name) {
  console.log(padRight("=== " + name + " ", "=", 128));
  var total = 0;
  for (var i = 0; i < o.lines.length; i++) {
    total += o.counts[i];
  }
  var items = [];
  for (var i = 0; i < o.lines.length; i++) {
    var l = o.lines[i] - 1;
    var c = o.counts[i];
    items.push([l, c]);
  }
  items.sort(function (a, b) {
    return b[1] - a[1];
  });
  for (var i = 0; i < items.length; i++) {
    var l = items[i][0];
    var c = items[i][1];
    var p = c / total;
    if (p > 0.01) {
      print(l, c, p * 100, 3);
      console.log("");
    }
  }
}

function clamp(v, min, max) {
  if (v < min) {
    return min;
  } else if (v > max) {
    return max;
  }
  return v;
}

function padLeft(s, c, n) {
  s = String(s);
  if (!c || s.length >= n) {
    return s;
  }
  var max = (n - s.length) / c.length;
  for (var i = 0; i < max; i++) {
    s = c + s;
  }
  return s;
}

function padRight(s, c, n) {
  s = String(s);
  if (!c || s.length >= n) {
    return s;
  }
  var max = (n - s.length) / c.length;
  for (var i = 0; i < max; i++) {
    s += c;
  }
  return s;
}

function print(line, count, percentage, range) {
  var min = clamp(line - range, 0, file.length);
  var max = clamp(line + range + 1, 0, file.length);
  for (var i = min; i < max; i++) {
    if (i === line) {
      console.log(padLeft(i, " ", 8) + " " + padLeft(count, " ", 8) + " " + padLeft(percentage.toFixed(2) + "%", " ", 6) + " | " + file[i]);
    } else {
      console.log(padLeft("", " ", 8) + " " + padLeft("", " ", 8) + " " + padLeft("", " ", 6) + " | " + file[i]);
    }
  }
}