/*
 * Copyright 2013 Mozilla Foundation
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

function loadSWC(path, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', path, true);
  xhr.responseType = 'arraybuffer';
  xhr.onload = function (e) {
    var zip = new Uint8Array(xhr.response);
    var entries = extractZipData(zip);
    var scriptsMap = parseCatalog(entries['catalog.xml']);
    var library = parseLibrary(entries['library.swf'], scriptsMap);
    callback(library);
  };
  xhr.onerror = function (e) {
    console.error('Unable to load SWC: ' + path);
  }
  xhr.send(null);
}

function parseLibrary(data, scriptsMap) {
  var magic1 = data[0];
  var magic2 = data[1];
  var magic3 = data[2];
  if ((magic1 !== 70 && magic1 !== 67) || magic2 !== 87 || magic3 !== 83)
    throw new Error('unsupported file format');

  var length = data[4] | (data[5] << 8) | (data[6] << 16) | (data[7] << 24);

  if (magic1 === 67) {
    var uncompressed = new Uint8Array(length);
    uncompressed.set(data.subarray(1, 8), 1); uncompressed[0] = 70;
    uncompressData(data.subarray(8), uncompressed.subarray(8), false);
    data = uncompressed;
  }

  var stream = new Stream(data, 8, data.length - 8);
  var bytes = stream.bytes;

  var SWF_TAG_CODE_DO_ABC = 82;
  var PREFETCH_SIZE = 17 /* RECT */ +
    4  /* Frames rate and count */;
  stream.ensure(PREFETCH_SIZE);
  var rectFieldSize = bytes[stream.pos] >> 3;
  stream.pos += ((5 + 4 * rectFieldSize + 7) >> 3) + 4; // skipping other header fields

  var map = Object.create(null);
  // sniffing for ABC tags
  while (stream.pos < stream.end) {
    stream.ensure(2);
    var tagCodeAndLength = stream.getUint16(stream.pos, true);
    stream.pos += 2;
    var tagCode = tagCodeAndLength >> 6;
    var length = tagCodeAndLength & 0x3F;
    if (length == 0x3F) {
      stream.ensure(4);
      length = stream.getInt32(stream.pos, true);
      stream.pos += 4;
      if (length < 0) throw new Error('invalid length');
    }
    stream.ensure(length);
    var end = stream.pos + length;
    switch (tagCode) {
      case SWF_TAG_CODE_DO_ABC:
        stream.pos += 4; // skip flags
        var name = '', ch;
        while ((ch = bytes[stream.pos++])) {
          name += String.fromCharCode(ch);
        }
        map[name] = bytes.subarray(stream.pos, end);
        break;
    }
    stream.pos = end;
  }
  var library = Object.create(null);
  for (var className in scriptsMap) {
    library[className] = {
      name: scriptsMap[className],
      abc: map[scriptsMap[className]]
    };
  }
  return library;
}

function parseCatalog(catalogBytes) {
  var map = Object.create(null);
  var i = 0, content = '';
  while (i < catalogBytes.length) {
    content += String.fromCharCode.apply(null, catalogBytes.subarray(i, i + 10000));
    i += 10000;
  }
  var re = /<script name="([^"]+)[^>]+>([\s\S]*?)<\/script>/g, m;
  while ((m = re.exec(content))) {
    var re2 = /<def id="([^"]+)/g, m2;
    while ((m2 = re2.exec(m[2]))) {
      map[m2[1]] = m[1];
    }
  }
  return map;
}

function uncompressData(compressed, uncompressed, skipHeader) {
  skipHeader || verifyDeflateHeader(compressed);
  var stream = new Stream(compressed, skipHeader ? 0 : 2);
  var output = {
    data: uncompressed,
    available: 0,
    completed: false
  };
  var state = {};
  // inflate while we can
  try {
    do {
      inflateBlock(stream, output, state);
    } while (!output.completed && stream.pos < stream.end
      && output.available < uncompressed.length);
  } catch (e) {
    console.error('inflate aborted: ' + e);
  }
}

function extractZipData(zip) {
  function readU16() {
    var number = zip[position] | (zip[position + 1] << 8);
    position += 2;
    return number;
  }
  function readU32() {
    var number = (zip[position] | (zip[position + 1] << 8) | (zip[position + 2] << 16) ) +
      2 * (zip[position + 3] << 23);
    position += 4;
    return number;
  }
  var entries = {};
  var position = zip.length - 22;
  if (readU32() !== 0x06054b50) {
    throw new Error("Invalid ZIP file");
  }
  position += 12;
  position = readU32(); // set to directory
  var offsets = [];
  while (readU32() === 0x02014b50) {
    position += 16;
    var compressedSize = readU32();
    var size = readU32();
    var extraLength = readU16() + readU16() + readU16();
    position += 8;
    var offset = readU32();
    position += extraLength;
    if (size > 0) {
      // interested only in non-empty files
      offsets.push({offset:offset, size: size, compressedSize: compressedSize});
    }
  }
  // processing the local zip files
  while (offsets.length > 0) {
    position = offsets[0].offset;
    if (readU32() !== 0x04034b50) {
      throw Error("Invalid ZIP file entry");
    }
    position += 22;
    var compressedSize = offsets[0].compressedSize;
    var size = offsets[0].size;
    var filenameLength = readU16();
    var extraLength = readU16();
    var filename = String.fromCharCode.apply(null, zip.subarray(position, position + filenameLength));
    position += filenameLength + extraLength;

    var uncompressed = new Uint8Array(size);
    uncompressData(zip.subarray(position, position + compressedSize), uncompressed, true);
    entries[filename] = uncompressed;

    offsets.shift();
  }
  return entries;
}
