var fileCount = 0;
var passCount = 0;
var finishedCount = 0;
var zeroHashCount = 0;

var histogramNames = ["Not Implemented", "somewhatImplemented", "Uncaught VM-internal", "AVM1 error", "AVM1 warning", "Tag not handled by the parser", "Unable to resolve"]
var histograms = {};

while (true) {
  var line = readline();
  if (line === null) {
    break;
  }
  if (line.indexOf("RUNNING:") === 0) {
    fileCount++;
  } else if (line.indexOf("HASHCODE:") === 0) {
    if (line.indexOf(': 0x00000000') > 0) {
      zeroHashCount++
    } else {
      passCount++
    }
    finishedCount++;
  }
  for (var i = 0; i < histogramNames.length; i++) {
    var n = histogramNames[i];
    if (line.indexOf(n) >= 0) {
      if (!histograms[n]) histograms[n] = [];
      histograms[n].push(line);
    }
  }
}

function histogram(array, min) {
  min = min || 0;
  var o = Object.create(null);
  array.forEach(function (k) {
    o[k] || (o[k] = 0);
    o[k]++;
  });
  var a = [];
  for (var k in o) {
    a.push([k, o[k]]);
  }
  a = a.filter(function (x) {
    return x[1] > min;
  });
  return a.sort(function (a, b) {
    return b[1] - a[1];
  });
}

var failCount = fileCount - passCount;

print("File Count: " + fileCount);
print("Pass Count: " + passCount);
print("Fail Count: " + failCount);
print("Zero Hash Count: " + zeroHashCount);
print("Finished Count: " + finishedCount);


histogramNames.forEach(function (n) {
  var h = histograms[n];
  if (!h) return;
  print();
  print(n + " Count: " + h.length);
  print();
  histogram(h, n === "Not Implemented" ? 1 : 10).forEach(function (v) {
    print(v[1] + ": " + v[0]);
  });
});
