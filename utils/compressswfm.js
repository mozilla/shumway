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
var temp = require('temp');
var spawn = require('child_process').spawn;

// simple args parsing
var compressMethod = null;
var outputPath = null;
var inputPath = null;
for (var i = 2; i < process.argv.length;) {
  var cmd = process.argv[i++];
  switch (cmd) {
    case '--lzma':
    case '-z':
      compressMethod = 'lzma';
      break;
    case '--zlib':
    case '-c':
      compressMethod = 'zlib';
      break;
    case '--out':
    case '-o':
      outputPath = process.argv[i++];
      break;
    default:
      inputPath = cmd; // .swfm is expected
      break;
  }
}

function createRawSWFM(callback) {
  // Create a temp file without 'MSWF' header.
  fs.readFile(inputPath, function (err, data) {
    if (err) return callback(err);
    var header = data.slice(0, 4).toString();
    if (header !== 'MSWF') {
      return callback(new Error('swfm file header is not found: found \"' + header + '\"'));
    }
    temp.open('swfm', function (err, info) {
      if (err) return callback(err);
      fs.write(info.fd, data, 4, data.length - 4, function (err) {
        if (err) return callback(err);
        fs.close(info.fd, function (err) {
          if (err) return callback(err);
          callback(null, info.path);
        });
      });
    });
  });
}

function compressViaGZip(rawDataPath, compressedDataPath, callback) {
  // Running gzip.
  var proc = spawn('gzip', ['-k9n', rawDataPath]);
  var resultPath = rawDataPath + '.gz';
  proc.on('close', function (code) {
    if (code !== 0 || !fs.existsSync(resultPath)) {
      callback(new Error('Unable to run gzip'));
      return;
    }
    // Prepending MSWC and zlib header before compressed data.
    fs.writeFile(compressedDataPath, new Buffer("MSWC\u0078\u00DA", 'ascii'), function (err) {
      if (err) return callback(err);
      fs.readFile(resultPath, function (err, data) {
        if (data[0] !== 0x1F || data[1] !== 0x8B || data[2] !== 0x08 || data[3] !== 0) {
          return callback(new Error('Invalid gzip result'));
        }
        var dataStart = 10;
        var dataEnd = data.length - 8;

        // Appending adler32 at the end of data.
        var a = 1, b = 0;
        for (var i = dataStart; i < dataEnd; ++i) {
          a = (a + (data[i] & 0xff)) % 65521;
          b = (b + a) % 65521;
        }
        var adler32 = (b << 16) | a;
        data[dataEnd] = (adler32 >> 24) & 255;
        data[dataEnd + 1] = (adler32 >> 16) & 255;
        data[dataEnd + 2] = (adler32 >> 8) & 255;
        data[dataEnd + 3] = adler32 & 255;


        if (err) return callback(err);
        fs.appendFile(compressedDataPath, data.slice(dataStart, dataEnd + 4), function (err) {
          fs.unlink(resultPath, callback);
        });
      });
    });
  });
}

function compressViaLzma(rawDataPath, compressedDataPath, callback) {
  // Running lzma.
  var proc = spawn('lzma', ['-zk9e', rawDataPath]);
  var resultPath = rawDataPath + '.lzma';
  proc.on('close', function (code) {
    if (code !== 0 || !fs.existsSync(resultPath)) {
      callback(new Error('Unable to run lzma'));
      return;
    }
    // Prepending MSWZ before lzma compressed data.
    fs.writeFile(compressedDataPath, "MSWZ", function (err) {
      if (err) return callback(err);
      fs.readFile(resultPath, function (err, data) {
        if (err) return callback(err);
        fs.appendFile(compressedDataPath, data, function (err) {
          fs.unlink(resultPath, callback);
        });
      });
    });
  });
}

function printUsage() {
  console.info('Usage: node compressswfm.js [-c|-z] inputFile [-o outputFile]');
}

if (!inputPath || !compressMethod) {
  printUsage();
  process.exit(1);
}

if (!outputPath) {
  var ext = path.extname(inputPath);
  outputPath = inputPath.slice(0, -ext.length) + '.' + compressMethod + ext;
  console.log('Compressed results at ' + outputPath);
}

createRawSWFM(function (err, path) {
  if (err) throw err;
  switch (compressMethod) {
    case 'zlib':
      compressViaGZip(path, outputPath, function (err) {
        if (err) throw err;
        console.log('Done. Compressed using ZLib.');
      });
      break;
    case 'lzma':
      compressViaLzma(path, outputPath, function (err) {
        if (err) throw err;
        console.log('Done. Compressed using LZMA.');
      });
      break;
  }
});
