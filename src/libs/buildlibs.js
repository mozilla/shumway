/*
 * Copyright 2015 Mozilla Foundation
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

var ascJar = process.env.asc || path.resolve(__dirname, '../../utils/asc.jar');
var generatedDir = __dirname;

function scanForIncludes(basePath, files) {
  var queue = files.slice(0);
  var processed = {};
  var result = files.slice(0);
  queue.forEach(function (file) { processed[file] = true; });
  while (queue.length > 0) {
    var file = queue.shift();
    var content = fs.readFileSync(path.join(basePath, file)).toString();
    var re = /^\s*include\s+["']([^"']+)/gm, m;
    while ((m = re.exec(content))) {
      var included = m[1];
      if (!processed[included]) {
        processed[included] = true;
        result.push(included);
        queue.push(included);
      }
    }
  }
  return result;
}

function calcSha1(file) {
  var fileData = fs.readFileSync(file);
  return crypto.createHash('sha1').update(fileData).digest('hex');
}

function compileAbc(outputDir, libName, files, isBuiltin, configs, rebuild, callback) {
  var libPath = path.join(outputDir, libName + '.abc');
  var sourcesPath = path.resolve(generatedDir, libName);
  var hashesFilePath = path.join(outputDir, libName + '.hashes');

  var allFiles = scanForIncludes(sourcesPath, files);
  var newHashes = {};
  allFiles.forEach(function (file) {
    newHashes[file] = calcSha1(path.join(sourcesPath, file));
  });

  if (!rebuild && fs.existsSync(hashesFilePath)) {
    try {
      var hashes = JSON.parse(fs.readFileSync(hashesFilePath));
      var hashesMatch = Object.keys(hashes).concat(Object.keys(newHashes)).
        every(function (i) { return hashes[i] === newHashes[i]; });
      rebuild = !hashesMatch;
    } catch (e) {
      rebuild = true;
    }
  } else {
    rebuild = true;
  }
  if (!rebuild) {
    callback(false);
    return;
  }

  var args = ['-ea', '-DAS3', '-DAVMPLUS', '-classpath', ascJar, 'macromedia.asc.embedding.ScriptCompiler', '-builtin'];
  if (!isBuiltin) {
    args.push(path.relative(sourcesPath, path.join(outputDir, 'builtin.abc')));
  }
  args.push('-out', path.relative(sourcesPath, libPath).replace(/\.abc$/, ''));
  args = args.concat(files, configs);

  var proc = spawn('java', args, {stdio: 'inherit', cwd: sourcesPath } );
  proc.on('close', function (code) {
    if (code !== 0 || !fs.existsSync(libPath)) {
      console.log('Unable to build ' + libPath + '\nargs: ' + args.join(' '));
      process.exit(1);
    }
    fs.writeFileSync(hashesFilePath, JSON.stringify(newHashes, null, 2));
    callback(true);
  });
}

function buildLibs(outputDir, rebuild, configs, callback) {
  if (!configs) {
    // Build without float support by default
    configs = ['-config', 'CONFIG::VMCFG_FLOAT=false']
  }

  compileAbc(outputDir, "builtin",
    ["builtin.as", "Vector.as", "DescribeType.as", "JSON.as", "Math.as", "Error.as", "Date.as", "RegExp.as", "IDataInput.as", "IDataOutput.as", "ByteArray.as", "Proxy.as", "XML.as", "Dictionary.as", "xml-document.as"],
    true, configs, rebuild, function (builtinWasBuilt) {

    var left = 2;
    function done() {
      if (--left === 0) {
        callback && callback();
      }
    }

    compileAbc(outputDir, "shell", ["Capabilities.as", "Domain.as"], false, configs, rebuild || builtinWasBuilt, done);
    compileAbc(outputDir, "avmplus", ["avmplus.as"], false, configs, rebuild || builtinWasBuilt, done);
  });
}

exports.buildLibs = buildLibs;
