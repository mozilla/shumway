var fs = require('fs');
var spawn = require('child_process').spawn;

var build_dir = '../build/playerglobal';

var manifest = JSON.parse(fs.readFileSync('manifest.json'));
var manifestUpdated = fs.statSync('manifest.json').mtime.valueOf();
var jstemplate = '' + fs.readFileSync('playerglobal.js.template');
var ascjar = '../utils/asc.jar';
var buildasc = './avm2/generated/builtin/builtin.abc';

// switching working dir to ./src
process.chdir('../../src');

// prepare build folder
if (!fs.existsSync(build_dir)) {
  fs.mkdirSync(build_dir);
}
var dependencies = {files: {}, abcs: {}}, dependenciesUpdated = 0;
var dependenciesPath = build_dir + '/dependencies.json';
if (fs.existsSync(dependenciesPath)) {
  dependenciesUpdated = fs.statSync(dependenciesPath).mtime.valueOf();
  // discarding previous build if manifest was updated
  if (manifestUpdated <= dependenciesUpdated) {
    dependencies = JSON.parse(fs.readFileSync(dependenciesPath));
  } else {
    console.info('New manifest was found: refreshing builds');
  }
}

// reset file dependencies
Object.keys(dependencies.files).forEach(function (file) {
  var isNew = true;
  try {
    fileUpdated = fs.statSync(file).mtime.valueOf();
    isNew = fileUpdated > dependenciesUpdated;
  } catch(e) {}
  if (isNew) {
    dependencies.files[file].forEach(function (abc) {
      delete dependencies.abcs[abc];
    });
    delete dependencies.files[file];
  }
});

var buildQueue = [];
manifest.forEach(function (item) {
  var outputPath = build_dir + '/' + item.name + '.abc';
  item.outputPath = outputPath;
  // rebuilding if abc does not exist or removed from dependencies
  if (!fs.existsSync(outputPath) || !(item.name in dependencies.abcs)) {
    buildQueue.push(item);
  } else {
    item.dependencies = dependencies.abcs[item.name];
  }
});

function ensureDir(dir) {
  if (fs.existsSync(dir)) return;
  var parts = dir.split('/'), i = parts.length;
  while (!fs.existsSync(parts.slice(0, i - 1).join('/'))) {
    i--;
    if (i <= 0) throw new Error();
  }

  while (i <= parts.length) {
    fs.mkdirSync(parts.slice(0, i).join('/'));
    i++;
  }
}

function runAsc(threadId, outputPath, files, callback) {
  console.info('Building ' + outputPath + ' [' + threadId + '] ...');
  var outputDir = outputPath.substring(0, outputPath.lastIndexOf('/'));
  ensureDir(outputDir);
  var outputName = outputPath.substring(outputDir.length + 1);
  outputName = outputName.substring(0, outputName.lastIndexOf('.'));
  if (fs.existsSync(outputPath)) {
    fs.unlink(outputPath);
  }

  var args = ['-ea', '-DAS3', '-DAVMPLUS', '-classpath', ascjar,
              'macromedia.asc.embedding.ScriptCompiler', '-builtin',
              '-import', buildasc, '-outdir', outputDir,
              '-out', outputName].concat(files);
  var proc = spawn('java', args, {stdio: 'inherit'} );
  proc.on('close', function (code) {
    if (!fs.existsSync(outputPath)) {
      code = -1;
    }

    callback(code, outputPath);
  });
}

function getDependencies(files) {
  var tmp = {}, tmpErr = {}, queue = [];
  files.forEach(function (file) {
    tmp[file] = true;
    queue.push(file);
  });
  while (queue.length > 0) {
    var file = queue.pop();
    try {
      var content = '' + fs.readFileSync(file);
      var m, re = /\bimport\s+(flash[\w\.]+)\s*;/g;
      while ((m = re.exec(content))) {
        var path = m[1].replace(/\./g, '/') + '.as';
        if (fs.existsSync(path)) {
          if (!tmp[path]) {
            tmp[path] = true;
            // uncomment to do recursive search of dependencies
            // queue.push(path);
          }
        } else if (!tmpErr[m[0]]) {
          console.log('Dependency file for \"' + m[0] + '\" was not found');
          tmpErr[m[0]] = true;
        }
      }
    } catch (e) {
      console.log('Unable to get dependencies from ' + file + ': ' + e);
    }
  }
  return Object.keys(tmp);
}

var buildError = false, pending = 0;
function buildNext(threadId) {
  pending++;
  var item = buildQueue.shift();
  runAsc(threadId, item.outputPath, item.files, function (code, output) {
    if (buildError) {
      return; // ignoring parallel builds if error happend
    }
    if (code) {
      buildError = true;
      throw new Error('Build returned error code: ' + code);
    }

    item.dependencies = getDependencies(item.files);

    pending--;
    if (buildQueue.length === 0) {
      if (pending === 0) {
        completeBuild();
      }
      return;
    }

    buildNext(threadId);
  });
}

var updateDependencies = false;
var buildThreadsCount = 1;
if (buildQueue.length > 0) {
  updateDependencies = true;
  for (var i = 0; i < buildThreadsCount && buildQueue.length > 0; i++) {
    buildNext(i + 1);
  }
} else {
  completeBuild();
}

function updatePlayerglobal() {
  console.info('Updating playerglobal.js');

  var hex = '', lastPos = 0;
  manifest.forEach(function (item) {
    var file = item.outputPath;
    var ascData = fs.readFileSync(item.outputPath);
    delete item.outputPath;
    var ascHex = ascData.toString('hex');
    item.offset = lastPos;
    item.length = ascHex.length >> 1;
    lastPos += item.length;
    hex += ascHex;
  });
  fs.writeFileSync('flash/playerglobal-new.js',
    jstemplate.replace('[/*index*/]', JSON.stringify(manifest, null, 2)));
  fs.writeFileSync('flash/playerglobal-new.abc', new Buffer(hex, 'hex'));
}

function completeBuild() {
  var needsNewPlayerglobal = true;
  if (updateDependencies) {
    console.info('Updating dependencies');
    dependencies.files = {};
    dependencies.abcs = {};
    manifest.forEach(function (item) {
      var files = item.dependencies, name = item.name;
      files.forEach(function (file) {
        var abcs = dependencies.files[file];
        if (!abcs) {
          dependencies.files[file] = [name];
        } else {
          abcs.push(name);
        }
      });
      dependencies.abcs[name] = files;
      delete item.dependencies;
      delete item.files;
    });

    fs.writeFileSync(dependenciesPath, JSON.stringify(dependencies, null, 2));
  } else {
    console.info('Checking playerglobal.js');
    try {
      var playerglobalUpdated = fs.statSync('flash/playerglobal-new.js').mtime.valueOf();
      needsNewPlayerglobal = dependenciesUpdated > playerglobalUpdated;
    } catch (e) {}
  }

  if (needsNewPlayerglobal) {
    updatePlayerglobal();
  }
  console.log('Done.');
}
