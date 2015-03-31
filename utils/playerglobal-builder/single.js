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

var debugInfo = true;
var strict = true;

var build_dir = '../build/playerglobal';

var manifestData = fs.readFileSync('manifest.json');
var manifest = JSON.parse(manifestData);
var manifestHash = crypto.createHash('sha1').update(manifestData).digest('hex');
var ascjar = '../utils/asc.jar';
var buildasc = '../build/libs/builtin.abc';

// switching working dir to ./src
process.chdir('../../src');

// prepare build folder
if (!fs.existsSync(build_dir)) {
  fs.mkdirSync(build_dir);
}

function runAsc(outputPath, files, callback) {
  console.info('Building ' + outputPath + ' ...');
  var outputDir = outputPath.substring(0, outputPath.lastIndexOf('/'));
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
  files.forEach(function (file) {
    args.push('-in', file);
  })
  args.push(outputAs);

  var proc = spawn('java', args, {stdio: 'inherit'} );
  proc.on('close', function (code) {
    if (!fs.existsSync(outputPath)) {
      code = -1;
    }

    callback(code, outputPath, 'java ' + args.join(' '));
  });
}

// setting up build order
var buildQueue = [], lookup = {}, defs = [];
manifest.forEach(function (item) {
  lookup[item.name] = item;
  buildQueue.push(item);

  Array.prototype.push.apply(defs, item.defs);
});

var files = [], processed = {}, lastQueueSize;
while (buildQueue.length > 0)  {
  lastQueueSize = buildQueue.length;
  var i = 0;
  while (i < buildQueue.length) {
    var inherits = buildQueue[i].inherits;
    if (!inherits || inherits.every(function (item) { return processed[item]; })) {
      var item = buildQueue.splice(i, 1)[0];
      Array.prototype.push.apply(files, item.files);
      item.defs.forEach(function (def) { processed[def] = true; });
    } else {
      i++;
    }
  }
  if (lastQueueSize == buildQueue.length) {
    throw new Error('Bad dependencies');
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

var hashesPath = build_dir + '/playerglobal-single.hashes';
var manifestHashEntryName = '$(BUILDHOME)/manifest.json';
var notChanged = false;
if (fs.existsSync(hashesPath)) {
  var existingHashes = JSON.parse(fs.readFileSync(hashesPath));
  notChanged = manifestHash === existingHashes[manifestHashEntryName] &&
               files.every(function (file) { return calcSha1(file) === existingHashes[file]; });
}

if (notChanged) {
  console.log('No need to update playerglobal-single.abc');
  process.exit(0);
}


runAsc(build_dir + '/playerglobal-single.abc', files, function (code, outputPath, cmd) {
  if (code) {
    throw new Error('Error during playerglobal compilation.');
  }
  updatePlayerglobal(outputPath);
});

function updatePlayerglobal(outputPath) {
  console.info('Updating playerglobal-single.json');

  var length = fs.statSync(outputPath).size;
  var index = [];
  index.push({
    name: 'playerglobal-single',
    defs: defs,
    offset: 0,
    length: length
  });
  fs.writeFileSync(build_dir + '/playerglobal-single.json', JSON.stringify(index, null, 2));
  fs.writeFileSync(build_dir + '/playerglobal-single.abcs', fs.readFileSync(outputPath));

  var hashes = {};
  hashes[manifestHashEntryName] = manifestHash;
  files.forEach(function (file) { hashes[file] = calcSha1(file); });
  fs.writeFileSync(hashesPath, JSON.stringify(hashes, null, 2));
}
