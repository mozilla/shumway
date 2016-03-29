var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

var totals = Object.create(null);

rl.on('line', function(line){
  line.replace(/(PASSED|FAILED|EXCEPTED|VM-internal|TIMEDOUT)/g, function(kind) {
    var count = totals[kind] || 0;
    totals[kind] = count + 1;
    return kind;
  });
});

rl.on('close', function () {
  var keys = Object.getOwnPropertyNames(totals);
  keys.sort();
  keys.forEach(function (key) {
    console.log(key + ' ' + totals[key]);
  });
});

