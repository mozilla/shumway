var CACHE_DIR = "./swfs/";
var DOWNLOAD_BASE = "http://areweflashyet.com/swfs/";

var taskName = "list";
var conditions = { };

// TODO: Accept proper command line options.
if (process.argv.length > 2) {
  taskName = process.argv[2];
  if (process.argv.length > 3) {
    conditions.file = { $regex: process.argv[3] };
    token = process.argv[4] || null;
  }
}

var fs = require('fs');
var http = require('http');
var mongojs = require("mongojs");
var task = require("./tasks/" + taskName);

var db = mongojs(process.env.ATS_DB_URL || "ats", ["swfs"]);

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

function handle_error(err) {
  console.error(err.toString());
  db.close();
  process.exit(1);
}

var startTime = +new Date;
function wrap_up() {
  db.close();
  console.log("Finished " + n + " tasks in " + ((+new Date - startTime) / 1000).toFixed(2) + "s.");
}

var swfs = db.swfs.find(conditions, { timeout: false });
var i = 0;
var n = 0;
swfs.count(function (err, val) {
  if (err) {
    handle_error(err);
  }
  n = val;
  swfs.next(next);
});

function next(err, swf) {
  i++;
  if (err) {
    handle_error(err);
  }
  get_file(swf.file, function (err, path) {
    if (err) {
      handle_error(err);
    } else {
      swf.path = path;
      var time = +new Date;
      console.log("Run task " + i + " of " + n);
      task.run(swf, function (err, result) {
        var updates = Object.create(null);
        $set = updates.$set = Object.create(null);
        $set[taskName + '_last'] = time;
        if (err) {
          if (taskName + '_result' in swf) {
            $set[taskName + '_regressed'] = true;
            $unset = updates.$unset = Object.create(null);
            $unset[taskName + '_result'] = true;
          }
          $set[taskName + '_error'] = err.message;
        } else {
          $set[taskName + '_result'] = result;
          $set[taskName + '_time'] = +new Date - time;
          if (taskName + '_error' in swf) {
            $unset = updates.$unset = Object.create(null);
            $unset[taskName + '_error'] = true;
            $unset[taskName + '_regressed'] = true;
          }
        }
        db.swfs.update({ _id: swf._id }, updates, function (err) {
          if (err) {
            handle_error(err);
          }
          if (i < n) {
            swfs.next(next);
          } else {
            wrap_up();
          }
        });
      });
    }
  });
}
