/*
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var fs = require('fs');
var crypto = require('crypto');
var spawn = require('child_process').spawn;

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

// simple args parsing
var rebuild = false;
var useSha1 = false;
var buildThreadsCount = 1;
var dependenciesRecursionLevel = 1;
var debugInfo = false;
var strict = true;
for (var i = 2; i < process.argv.length;) {
  var cmd = process.argv[i++];
  switch (cmd) {
    case '--threads':
    case '-t':
      buildThreadsCount = Math.max(1, process.argv[i++] | 0);
      break;
    case '--rebuild':
    case '-r':
      rebuild = true;
      break;
    case '--sha1':
    case '-s':
      useSha1 = true;
      break;
    default:
      throw new Error('Bad argument: ' + cmd);
  }
}


var build_dir = '../build/playerglobal';

var manifestData = fs.readFileSync('manifest.json');
var manifest = JSON.parse(manifestData);
var manifestHash = crypto.createHash('sha1').update(manifestData).digest('hex');
var manifestHashEntryName = '$(BUILDHOME)/manifest.json';
var manifestUpdated = fs.statSync('manifest.json').mtime.valueOf();
var ascjar = '../utils/asc.jar';
var buildasc = '../build/libs/builtin.abc';

// switching working dir to ./src
process.chdir('../../src');

// prepare build folder
ensureDir(build_dir);

var dependencies = {files: {}, abcs: {}, hashes: {}}, dependenciesUpdated = 0;
var dependenciesPath = build_dir + '/dependencies.json';
if (fs.existsSync(dependenciesPath) && !rebuild) {
  dependenciesUpdated = fs.statSync(dependenciesPath).mtime.valueOf();
  var tmpDependencies = JSON.parse(fs.readFileSync(dependenciesPath));
  if (!tmpDependencies.hashes) tmpDependencies.hashes = {}; // compat with older build
  // discarding previous build if manifest was updated
  if (!useSha1 && manifestUpdated <= dependenciesUpdated) {
    dependencies = tmpDependencies;
  } else if (useSha1 && manifestHash === tmpDependencies.hashes[manifestHashEntryName]) {
    dependencies = tmpDependencies;
  } else {
    console.info('New manifest was found: refreshing builds');
  }
}

var fileHashesCache = {};
function calcSha1(file) {
  if (fileHashesCache[file]) {
    return fileHashesCache[file];
  }
  var fileData = fs.readFileSync(file);
  var fileHash = crypto.createHash('sha1').update(fileData).digest('hex');
  return (fileHashesCache[file] = fileHash);
}


// reset file dependencies
Object.keys(dependencies.files).forEach(function (file) {
  var isNew = true;
  try {
    if (useSha1) {
      isNew = calcSha1(file) !== dependencies.hashes[file];
    } else {
      var fileUpdated = fs.statSync(file).mtime.valueOf();
      isNew = fileUpdated > dependenciesUpdated;
    }
  } catch(e) {}
  if (isNew) {
    dependencies.files[file].forEach(function (abc) {
      delete dependencies.abcs[abc];
    });
    delete dependencies.files[file];
  }
});

// analyze dependencies
var classToAbcMap = {}, buildTreeLookup = {};
manifest.forEach(function (item) {
  var outputPath = build_dir + '/' + item.name + '.abc';
  buildTreeLookup[item.name] = {
    manifest: item,
    outputPath: outputPath,
    dependents: [],
    requires: [],
    refFiles: null,
    built: false,
    scheduled: false
  };
  item.defs.forEach(function (def) {
    if (def in classToAbcMap) {
      throw new Error('Dependency \"' + def + '\" is defined in \"' + item.name + '\" and \"' + classToAbcMap[def] + '\"');
    }
    classToAbcMap[def] = item.name;
  });
});

function resolveRefToBuildItem(ref) {
  var refItem = buildTreeLookup[ref];
  if (!refItem) { // trying a class name as well
    var refAbc = classToAbcMap[ref];
    refItem = refAbc && buildTreeLookup[refAbc];
  }
  return refItem;
}

manifest.forEach(function (item) {
  if (!item.inherits) {
    return;
  }
  item.inherits.forEach(function (ref) {
    var pReq = resolveRefToBuildItem(ref);
    if (!pReq) {
      throw new Error('Import \"' + ref + '\" in \"' + item.name + '\" is not defined');
    }
    // checking circular references
    var pDep = buildTreeLookup[item.name];
    var queue = [pDep];
    while (queue.length > 0) {
      var p = queue.shift();
      if (p === pReq) {
        throw new Error('Circular dependency between \"' + p.manifest.name +
                        '\" and \"' + pReq.manifest.name + '\" at \"' + item.name + '\"');
      }
      if (p.dependents.length > 0) {
        queue.push.apply(queue, p.dependents);
      }
    }
    pReq.dependents.push(pDep);
  });
});
manifest.forEach(function (item) {
  if (!item.refs && !item.inherits) {
    return;
  }
  var buildItem = buildTreeLookup[item.name];
  var used = {}, queue = [];
  var refs = [];
  if (item.inherits) Array.prototype.push.apply(refs, item.inherits);
  if (item.refs) Array.prototype.push.apply(refs, item.refs);
  refs.forEach(function (ref) {
    if (used[ref]) return;

    var refItem = resolveRefToBuildItem(ref);
    if (!refItem) {
      throw new Error('Reference \"' + ref + '\" in \"' + item.name + '\" is not defined');
    }
    used[ref] = refItem;
    queue.push(refItem.manifest);
  });
  var files = {};
  while (queue.length > 0) {
    var refItem = queue.shift();
    refItem.files.forEach(function (file) { files[file] = true; });
    if (refItem.refs || refItem.inherits) {
      refs = [];
      if (refItem.inherits) Array.prototype.push.apply(refs, refItem.inherits);
      if (refItem.refs) Array.prototype.push.apply(refs, refItem.refs);
      refs.forEach(function (ref2) {
        if (used[ref2]) return;

        var refItem2 = resolveRefToBuildItem(ref2);
        if (!refItem2) {
          throw new Error('Reference \"' + ref2 + '\" in \"' + refItem.name + '\" is not defined (2)');
        }
        used[ref2] = refItem2;
        queue.push(refItem2.manifest);
      })
    }
  }
  item.files.forEach(function (file) {
    delete files[file];
  });
  var imports = {};
  queue = buildItem.dependents.slice();
  while (queue.length > 0) {
    var depItem = queue.shift();
    depItem.manifest.files.forEach(function (file) {
      if (file in files) {
        imports[depItem.manifest.name] = depItem;
        delete files[file];
      }
    });
    if (depItem.dependents.length > 0) {
      Array.prototype.push.apply(queue, depItem.dependents);
    }
  }
  Object.keys(imports).forEach(function (key) {
    buildItem.requires.push(imports[key]);
  });
  buildItem.refFiles = Object.keys(files);
	buildItem.refFiles.reverse();
});

// build queue
var buildQueue = [];
manifest.forEach(function (item) {
  var buildItem = buildTreeLookup[item.name];
  if (buildItem.scheduled) {
    return;
  }
  // rebuilding if abc does not exist or removed from dependencies
  if (!fs.existsSync(buildItem.outputPath) ||
      !(item.name in dependencies.abcs)) {
    buildQueue.push(buildItem);
    var queue = [buildItem];
    buildItem.scheduled = true;
    while (queue.length > 0) {
      var buildItem = queue.shift();
      buildItem.dependents.forEach(function (dep) {
        if (!dep.scheduled) {
          buildQueue.push(dep);
          queue.push(dep);
          dep.scheduled = true;
        }
      });
    }
  }
});
manifest.forEach(function (item) {
  var buildItem = buildTreeLookup[item.name];
  if (!buildItem.scheduled) {
    buildItem.built = true;
    buildItem.dependencies = dependencies.abcs[item.name];
  }
});

function runAsc(threadId, name, outputPath, files, dependencies, refs, callback) {
  console.info('Building ' + outputPath + ' [' + threadId + '] ...');
  var outputDir = outputPath.substring(0, outputPath.lastIndexOf('/'));
  ensureDir(outputDir);
  var outputName = outputPath.substring(outputDir.length + 1);
  outputName = outputName.substring(0, outputName.lastIndexOf('.'));
  if (fs.existsSync(outputPath)) {
    fs.unlink(outputPath);
  }
  var outputAs = outputDir + '/' + outputName + '.as';
  fs.writeFileSync(outputAs, '');

  var args = ['-jar', ascjar, '-AS3', '-md'];
  if (debugInfo) {
    args.push('-d');
  }
  if (strict) {
    args.push('-strict');
  }
  args.push('-import', buildasc);
  if (dependencies) {
    dependencies.forEach(function (dep) {
      args.push('-import', dep);
    })
  }
  if (refs) {
    refs.forEach(function (ref) {
      args.push('-import', ref);
    })
  }
  files.forEach(function (file) {
    args.push('-in', file);
  })
  args.push(outputAs);

  var proc = spawn('java', args, {stdio: 'inherit'} );
  proc.on('close', function (code) {
    if (!fs.existsSync(outputPath)) {
      code = -1;
    }

    callback(code, name, outputPath, 'java ' + args.join(' '));
  });
}

function getDependencies(item) {
  var files = item.manifest.files;
  if (dependenciesRecursionLevel < 1) {
    return files;
  }

  var used = {}, useFile = function (file) { used[file] = true; };
  files.forEach(useFile);
  if (dependenciesRecursionLevel < 2) {
    item.dependents.forEach(function (dep) {
      dep.manifest.files.forEach(useFile);
    });
  } else {
    item.refFiles && item.refFiles.forEach(useFile);
    item.requires.forEach(function (req) {
      req.manifest.files.forEach(useFile);
    });
  }
  return Object.keys(used);
}

var buildError = false, pending = 0, availableThreadIds = [];
function getNextBuildItem() {
  for (var i = 0; i < buildQueue.length; i++) {
    var buildItem = buildQueue[i];
    if (buildItem.requires.every(function (item) { return item.built; })) {
      return buildQueue.splice(i, 1)[0];
    }
  }
}
function buildNext(item) {
  var threadId = availableThreadIds.shift();
  pending++;
  var files = item.manifest.files;
  var requires = item.requires && item.requires.map(function (req) {
    return req.outputPath;
  });
	var refFiles = item.refFiles;
  runAsc(threadId, item.manifest.name, item.outputPath, files, requires, refFiles, function (code, name, output, cmd) {
    if (buildError) {
      return; // ignoring parallel builds if error happend
    }
    if (code) {
      buildError = true;
      throw new Error('Error while building "' + name + '". Error code: ' + code + ', command:\n' + cmd);
    }

    item.built = true;
    item.dependencies = getDependencies(item);

    pending--;
    availableThreadIds.push(threadId);

    var buildItem = getNextBuildItem();
    if (buildItem) {
      buildNext(buildItem);
      // can we run more threads
      while (availableThreadIds.length > 0 &&
             (buildItem = getNextBuildItem())) {
        buildNext(buildItem);
      }
    } else if (pending === 0) {
      completeBuild();
    }
  });
}

var updateDependencies = false;
if (buildQueue.length > 0) {
  for (var i = 0; i < buildThreadsCount; i++) {
    availableThreadIds.push(String(i + 1));
  }
  updateDependencies = true;
  for (var i = 0; i < buildThreadsCount && buildQueue.length > 0; i++) {
    var buildItem = getNextBuildItem();
    if (!buildItem) {
      break;
    }
    buildNext(buildItem);
  }
} else {
  completeBuild();
}

function updatePlayerglobal() {
  console.info('Updating playerglobal.json');

  var hex = '', lastPos = 0;
  var index = [];
  manifest.forEach(function (item) {
    var outputPath = buildTreeLookup[item.name].outputPath;
    var ascData = fs.readFileSync(outputPath);
    var ascHex = ascData.toString('hex');
    var ascLength = ascHex.length >> 1;
    index.push({
      name: item.name,
      defs: item.defs,
      offset: lastPos,
      length: ascLength
    });
    lastPos += ascLength;
    hex += ascHex;
  });
  fs.writeFileSync(build_dir + '/playerglobal.json', JSON.stringify(index, null, 2));
  fs.writeFileSync(build_dir + '/playerglobal.abcs', new Buffer(hex, 'hex'));
}

function completeBuild() {
  var needsNewPlayerglobal = true;
  if (updateDependencies) {
    console.info('Updating dependencies');
    dependencies.files = {};
    dependencies.abcs = {};
    dependencies.hashes = {};
    dependencies.hashes[manifestHashEntryName] = manifestHash;
    manifest.forEach(function (item) {
      var name = item.name, files = buildTreeLookup[name].dependencies;
      files.forEach(function (file) {
        var abcs = dependencies.files[file];
        if (!abcs) {
          dependencies.files[file] = [name];
        } else {
          abcs.push(name);
        }
        dependencies.hashes[file] = calcSha1(file);
      });
      dependencies.abcs[name] = files;
    });

    fs.writeFileSync(dependenciesPath, JSON.stringify(dependencies, null, 2));
  } else {
    console.info('Checking playerglobal.json');
    try {
      var playerglobalUpdated = fs.statSync(build_dir + '/playerglobal.json').mtime.valueOf();
      needsNewPlayerglobal = dependenciesUpdated > playerglobalUpdated;
    } catch (e) {}
  }

  if (needsNewPlayerglobal) {
    updatePlayerglobal();
  }
  console.log('Done.');
}
