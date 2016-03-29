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
var path = require('path');
var exec = require('child_process').exec;

function normalizeId(id) {
  var i = id.lastIndexOf('/');
  if (i >= 0) {
    id = id.substring(i + 1);
  }
  i = id.indexOf('.');
  if (i >= 0) {
    id = id.substring(0, i);
  }
  return id;
}

function readFoldersList(dir) {
  throw 'readFoldersList - not implemented';
}

function readListFile(file) {
  var content = fs.readFileSync(file).toString();
  var files = content.split(/\n/g).filter(function (line) {
    return line && line[0] !== '#';
  });
  return files.map(normalizeId);
}

function parseOptions() {
  var yargs = require('yargs')
    .usage('Usage: $0 <capture-dir> <snapshots-dir> [<swfid> ...]')
    .demand(2)
    .boolean(['help'])
    .string(['list'])
    .alias('list', 'l').alias('help', 'h')
    .describe('help', 'Show this help message')
    .describe('pdiff', 'pdiff location')
    .describe('list', 'File with list of swf ids');

  var result = yargs.argv;
  if (result.help) {
    yargs.showHelp();
    process.exit(0);
  }
  return result;
}

var options = parseOptions();

var captureDir = options._[0];
var snapshotsDir = options._[1];

var swfIds = [];
if (options._.length === 2 && !options.list) {
  swfIds = readFoldersList(captureDir);
} else if (options.list) {
  swfIds = readListFile(options.list);
}
for (var i = 2; i < options._.length; i++) {
  swfIds.push(normalizeId(options._[i]));
}

function readManifest(swfId) {
  var manifest = { id: swfId, framesCaptured: [] };
  var dir = path.join(captureDir, swfId);
  var tracePath = path.join(dir, 'trace.log');
  try {
    var content = fs.readFileSync(tracePath).toString();
    manifest.isPresent = true;
    var m;
    m = /Size: (\d+)x(\d+)/.exec(content);
    if (m) {
      manifest.width = +m[1];
      manifest.height = +m[2];
    }
    m = /Frame rate: (\d+)/.exec(content);
    if (m) {
      manifest.rate = +m[1];
    }
    m = /Frame count: (\d+)/.exec(content);
    if (m) {
      manifest.frameCount = +m[1];
    }
    m = /AVM2: (\w+)/.exec(content);
    if (m) {
      manifest.isAvm2 = m[1] === 'True';
    }
    var re = /\bWritting .+?\\(\d+)\.png\b/g;
    while ((m = re.exec(content))) {
      manifest.framesCaptured.push(+m[1]);
    }
  } catch (e) {
    console.error('Unable to read ' + tracePath);
  }
  return manifest;
}

var defaultPdiffPath = './utils/pdiff/perceptualdiff';
var pdiffOptions = ''; // '-verbose';

function analyzeFrame(swfId, frame, callback) {
  var fpImagePath = path.join(captureDir, swfId, frame + '.png');
  var shumwayImagePath = path.join(snapshotsDir, swfId, frame + '.png');
  if (!fs.existsSync(fpImagePath)) {
    callback({ result: -1, message: 'FP image absent at'});
    return;
  }
  if (!fs.existsSync(shumwayImagePath)) {
    callback({ result: -1, message: 'Shumway image absent'});
    return;
  }
  var pdiffPath = options.pdiff || defaultPdiffPath;
  var pdiff = exec(pdiffPath + ' ' + fpImagePath + ' ' + shumwayImagePath + ' ' + pdiffOptions,
      function (error, stdout, stderr) {
    if (!error) {
      callback({result: -2, message: 'No result'});
      return;
    }
    callback({result: error.code, message: stdout.toString() || stderr.toString()});
  });
}

function analizeResults(manifest) {
  var totalPixels = manifest.width * manifest.height;
  manifest.totalPixels = totalPixels;
  var sumSuccessRate = 0, countSuccessRate = 0;
  for (var frameId in manifest.frames) {
    var frame = manifest.frames[frameId];
    var message = frame.message;
    var differentPixels;
    if (message.indexOf('PASS:') >= 0) {
      differentPixels = 0;
    } else {
      var m = /(\d+) pixels are different/.exec(message);
      if (m) {
        differentPixels = +m[1];
      } else {
        differentPixels = totalPixels;
      }
    }
    frame.differentPixels = differentPixels;
    var successRate = 1.0 - (differentPixels / totalPixels);
    successRate = Math.round(successRate * 1000) / 1000;
    frame.successRate = successRate;
    sumSuccessRate += successRate;
    countSuccessRate++;
  }
  manifest.avgSuccessRate = countSuccessRate ? sumSuccessRate / countSuccessRate : 0;
}

function processSwf(swfId, callback) {
  function processNextFrame() {
    if (currentFrameIndex >= manifest.framesCaptured.length) {
      analizeResults(manifest);
      callback(manifest);
      return;
    }
    var frame = manifest.framesCaptured[currentFrameIndex++];
    analyzeFrame(swfId, frame, function (result) {
      manifest.frames[frame] = result;
      processNextFrame();
    });
  }

  var manifest = readManifest(swfId);
  var currentFrameIndex = 0;
  if (manifest.isPresent) {
    manifest.frames = {};
    processNextFrame();
  } else {
    callback(manifest);
  }
}

function processSwfs(callback) {
  function nextSwf() {
    if (i >= swfIds.length) {
      callback(result);
      return;
    }
    var swfId = swfIds[i++];
    processSwf(swfId, function (manifest) {
      result.push(manifest);
      nextSwf();
    });
  }
  var result = [];
  var i = 0;
  nextSwf();
}

processSwfs(function(result) {
  console.log(JSON.stringify(result, null, 2));
});
