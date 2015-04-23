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
var path = require('path');
var spawn = require('child_process').spawn;

var SOURCES = 'filters.c';
var EMCC_OUTPUT = 'filters.raw.js';
var OUTPUT = '../filters.js';

function emscriptenSettings() {
  var userHome = process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'];
  try {
    var settingsContent = fs.readFileSync(path.join(userHome, '.emscripten')).toString();
    var settings = {};
    settingsContent.split(/\r?\n/g).forEach(function (line) {
      var m = /(\w+)\s*=\s*['"]?([^'"]+)/.exec(line);
      if (m) {
        settings[m[1]] = m[2];
      }
    });
    return settings;
  } catch (ex) {
    throw new Error('emsdk is not installed');
  }
}

var emccEnv = {};
var emSettings = emscriptenSettings();
for (var i in process.env) {
  emccEnv[i] = process.env[i];
}
emccEnv.PATH = path.normalize(emSettings.LLVM_ROOT) + path.delimiter +
  path.normalize(emSettings.EMSCRIPTEN_ROOT) + path.delimiter +
  path.normalize(path.dirname(emSettings.NODE_JS)) + path.delimiter +
  emccEnv.PATH;
var emccCmd = 'emcc';
var emccArgs = [
  '-O2', SOURCES,
  '-o', EMCC_OUTPUT,
  '-s', "EXPORTED_FUNCTIONS=['_allocMemory', '_freeMemory', '_preMultiplyAlpha','_unpreMultiplyAlpha','_blur','_dropshadow','_colormatrix']"
];
if (process.platform == 'win32') {
  emccCmd = emSettings.PYTHON;
  emccArgs.unshift(path.join(emSettings.EMSCRIPTEN_ROOT, 'emcc'));
}
console.log('Compiling using emcc ...');
var emcc = spawn(emccCmd, emccArgs, {stdio: 'inherit', env: emccEnv});
emcc.on('close', function (code) {
  if (code) {
    if (fs.existsSync(OUTPUT)) {
      fs.unlink(OUTPUT);
    }
    return; // error happend
  }

  console.log('Reducing to asm.js ...');
  var reduceFilterToAsmjs = require('./cut.js').reduceFilterToAsmjs;
  reduceFilterToAsmjs(EMCC_OUTPUT, OUTPUT);

  fs.unlink(EMCC_OUTPUT);
  console.log('Done.');
});
