var CACHE_DIR = './swfs/';
var DOWNLOAD_BASE = 'http://areweflashyet.com/swfs/';

function parseOptions() {
  function describeCheck(fn, text) {
    fn.toString = function () {
      return text;
    };
    return fn;
  }

  var yargs = require('yargs')
    .usage('Usage: $0')
    .boolean([])
    .string(['task', 'db', 'force'])
    .alias('task', 't').alias('db', 'd').alias('force', 'f')
    .describe('task', 'Name of the task to run')
    .describe('db', 'MongoDB connection URL')
    .describe('force', 'Ignore version lock')
    .default('task', 'list')
    .default('db', 'ats');

  var result = yargs.argv;
  if (result.help) {
    yargs.showHelp();
    process.exit(0);
  }
  return result;
}

var options = parseOptions();
var taskName = options.task;

var fs = require('fs');
var http = require('http');
var mongojs = require("mongojs");
var task = require("./tasks/" + taskName);
var version = require('../../build/version/version.json').version;

console.log('Current Shumway version is ' + version);

var db = mongojs(options.db || "ats", ["swfs"]);
db.on('error', function(err) {
  handle_error(err);
});

function get_file(fileName, cb) {
  var path = CACHE_DIR + fileName;
  fs.exists(path, function(exist) {
    if (exist) {
      cb(null, path);
      return;
    }
    console.log('Download ' + fileName);
    var file = fs.createWriteStream(path);
    http.get(DOWNLOAD_BASE + fileName, function(response) {
      response.pipe(file);
      file.on('finish', function() {
        file.close();
        cb(null, path);
      });
    }).on('error', function (err) {
      cb(err, null);
    });
  });
}

var startTime = +new Date;
var numTasks = 0;
var numErrors = 0;
var numRegressions = 0;

function handle_error(err) {
  console.error(err.toString());
  db.close();
  process.exit(1);
}
function handleResult(doc, err, result, time, cb) {
  var updates = Object.create(null);
  $set = updates.$set = Object.create(null);
  $set[lastKey] = { time: startTime, version: version };
  if (err) {
    numErrors++;
    if (resultKey in doc) {
      numRegressions++;
      $set[regressedKey] = true;
      $unset = updates.$unset = Object.create(null);
      $unset[resultKey] = true;
    }
    $set[errorKey] = err.message;
  } else {
    $set[resultKey] = result;
    $set[timeKey] = +new Date - time;
    if (errorKey in doc) {
      $unset = updates.$unset = Object.create(null);
      $unset[errorKey] = true;
      $unset[regressedKey] = true;
    }
  }
  db.swfs.update({ _id: doc._id }, updates, function (err) {
    if (err) {
      handle_error(err);
    }
    cb();
  });
}
function wrap_up() {
  db.close();
  console.log("Finished " + numTasks + " tasks in " + ((+new Date - startTime) / 1000).toFixed(2) + "s. " +
              numErrors + " Errors. " + numRegressions + ' Regressions.');
}

var lastKey = taskName + '_last';
var resultKey = taskName + '_result';
var errorKey = taskName + '_error';
var timeKey = taskName + '_time';
var regressedKey = taskName + '_regressed';

var conditions = {};
conditions[lastKey + '.version'] = { $ne: version };

function next() {
  db.swfs.findOne(conditions, function (err, doc) {
    if (err) {
      handle_error(err);
    }
    if (doc === null) {
      wrap_up();
      return;
    }
    numTasks++;
    get_file(doc.file, function (err, path) {
      if (err) {
        handle_error(err);
      }
      doc.path = path;
      var time = +new Date;
      console.log("Run task " + doc._id);
      task.run(doc, function (err, result) {
        handleResult(doc, err, result, time, next);
      });
    });
  });
}

next();
