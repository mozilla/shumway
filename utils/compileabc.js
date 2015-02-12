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
var path = require('path');
var spawn = require('child_process').spawn;

var shumwayRoot = path.resolve(__dirname, '..');

// simple args parsing
var manifestPath = null;
var files = [];
var swfParams = null;
var needsPlayerglobal = null;
var outputPath = null;
var debugInfo = false;
var strict = true;
for (var i = 2; i < process.argv.length;) {
  var cmd = process.argv[i++];
  switch (cmd) {
    case '--swf':
      swfParams = process.argv[i++];
      break;
    case '--playerglobal':
    case '-p':
      needsPlayerglobal = true;
      break;
    case '--manifest':
    case '-m':
      manifestPath = process.argv[i++];
      break;
    case '--out':
    case '-o':
      outputPath = process.argv[i++];
    default:
      files.push(cmd); // .as is expected
      break;
  }
}

var manifestHash;
var manifest;
var saveHashes = false;
if (manifestPath) {
  if (files.length !== 0 || outputPath !== null ||
      swfParams !== null || needsPlayerglobal !== null) {
    console.log('Dependencies hashes will not be saved when additional parameters provided for manifest');
  } else {
    saveHashes = true;
  }
  var manifestDir = path.dirname(manifestPath);
  var manifestData = fs.readFileSync(manifestPath);
  manifest = JSON.parse(manifestData);
  manifestHash = crypto.createHash('sha1').update(manifestData).digest('hex');
  if (manifest.files) {
    manifest.files.forEach(function (file) { files.push(path.join(manifestDir, file)); });
  }
  if (outputPath === null && manifest.output) {
    outputPath = path.join(manifestDir, manifest.output);
  }
  if (swfParams === null && manifest.swf) {
    swfParams = manifest.swf;
  }
  if (needsPlayerglobal === null && typeof manifest.playerglobal === 'boolean') {
    needsPlayerglobal = manifest.playerglobal;
  }
}

if (files.length === 0) {
  console.error('No files provided.');
  process.exit(1);
}

function ensureDir(dir) {
  if (fs.existsSync(dir)) return;
  var parts = dir.split(/[\/\\]/g), i = parts.length;
  while (!fs.existsSync(parts.slice(0, i - 1).join('/'))) {
    i--;
    if (i <= 0) throw new Error();
  }

  while (i <= parts.length) {
    fs.mkdirSync(parts.slice(0, i).join('/'));
    i++;
  }
}

function relative(p) {
  return path.resolve(p).substring(shumwayRoot.length + 1);
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

var build_dir = path.join(shumwayRoot, 'build/compileabc');
ensureDir(build_dir);

var playerglobalPath = path.join(shumwayRoot, 'build/playerglobal/playerglobal-single.abc');
var builtinPath = path.join(shumwayRoot, 'build/libs/builtin.abc');
var ascjar = path.join(shumwayRoot, 'utils/asc.jar');

if (!outputPath) {
  outputPath = files[files.length - 1];
  outputPath = outputPath.slice(0, -path.extname(outputPath).length) + (swfParams ? '.swf' : '.abc');
}

function createResult(resultPath) {
  fs.writeFileSync(outputPath, fs.readFileSync(resultPath));
  if (saveHashes) {
    var hashes = {};
    hashes[relative(manifestPath)] = calcSha1(manifestPath);
    hashes[relative(builtinPath)] = calcSha1(builtinPath);
    if (needsPlayerglobal) {
      hashes[relative(playerglobalPath)] = calcSha1(playerglobalPath);
    }
    files.forEach(function (file) { return hashes[relative(file)] = calcSha1(file); });
    var hashesPath = outputPath.slice(0, -path.extname(outputPath).length) + '.hashes';
    fs.writeFileSync(hashesPath, JSON.stringify(hashes, null, 2));
  }
}

function compile() {
  console.log('Compiling ' + outputPath + ' ...');
  var outputAs = path.join(build_dir, 'output.as');
  fs.writeFileSync(outputAs, '');
  var resultPath = path.join(build_dir, swfParams ? 'output.swf' : 'output.abc');
  if (fs.existsSync(resultPath)) {
    fs.unlink(resultPath);
  }
  var args = ['-jar', ascjar, '-AS3', '-md'];
  if (debugInfo) {
    args.push('-d');
  }
  if (strict) {
    args.push('-strict');
  }
  args.push('-import', builtinPath);
  if (needsPlayerglobal) {
    args.push('-import', playerglobalPath);
  }
  if (swfParams) {
    args.push('-swf', swfParams);
  }
  files.forEach(function (file) {
    args.push('-in', file);
  })
  args.push(outputAs);

  var proc = spawn('java', args, {stdio: 'inherit'} );
  proc.on('close', function (code) {
    if (code !== 0 || !fs.existsSync(resultPath)) {
      console.log('Unable to build ' + outputPath + '\nargs: ' + args.join(' '));
      process.exit(1);
    }
    createResult(resultPath);
  });
}

function checkHashes() {
  var hashesPath = outputPath.slice(0, -path.extname(outputPath).length) + '.hashes';
  if (!saveHashes) {
    if (fs.existsSync(hashesPath)) {
      fs.unlink(hashesPath);
    }
    compile();
    return;
  }
  if (!fs.existsSync(hashesPath)) {
    compile();
    return;
  }
  console.log('Checking hashes ...');
  var existingHashes = JSON.parse(fs.readFileSync(hashesPath));
  var notChanged = existingHashes[relative(manifestPath)] === calcSha1(manifestPath) &&
    existingHashes[relative(builtinPath)] === calcSha1(builtinPath) &&
    (!needsPlayerglobal || existingHashes[relative(playerglobalPath)] === calcSha1(playerglobalPath)) &&
    files.every(function (file) { return existingHashes[relative(file)] === calcSha1(file); });
  if (notChanged) {
    console.log('Nothing changed, done.');
    return;
  }
  compile();
}

if (needsPlayerglobal) {
  console.log('Verifing playerglobal-single.abc ...');
  var proc = spawn(process.argv[0], ['single'], {cwd: path.join(shumwayRoot, 'utils/playerglobal-builder'), stdio: 'inherit'} );
  proc.on('close', function (code) {
    if (code !== 0 || !fs.existsSync(playerglobalPath)) {
      console.log('Error during playerglobal-single.abc build');
      process.exit(1);
    }

    checkHashes();
  });
} else {
  checkHashes();
}
