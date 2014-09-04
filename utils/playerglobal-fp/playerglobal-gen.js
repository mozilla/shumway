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

// This script is used to generate 'playerglobal.js'.
// (based on src/avm2/bin/dumpabc.js)

this.self = this;
load("../../src/swf/swf.js");
load("../../src/flash/util.js");
load("../../src/swf/types.js");
load("../../src/swf/structs.js");
load("../../src/swf/tags.js");
load("../../src/swf/inflate.js");
load("../../src/swf/stream.js");
load("../../src/swf/templates.js");
load("../../src/swf/generator.js");
load("../../src/swf/handlers.js");
load("../../src/swf/parser.js");
load("../../src/swf/bitmap.js");
load("../../src/swf/button.js");
load("../../src/swf/font.js");
load("../../src/swf/image.js");
load("../../src/swf/label.js");
load("../../src/swf/shape.js");
load("../../src/swf/text.js");

var console = {
  time: function (name) {
    
  },
  timeEnd: function (name) {
    
  },
  warn: function (s) {
      print(s);
  },
  info: function (s) {
    print(s);
  }
};

var str = snarf("catalog.json");
var obj = JSON.parse(str);
var abcs = obj.swc.libraries.library.script;
var catalog = {};
for (var i = 0; i < abcs.length; i++) {
  var abc = abcs[i];
  var abcname = abc["@name"];
  var defs = abc.def;
  var names = [];
  if (defs instanceof Array) {
    for (var j = 0; j < defs.length; j++) {
      names.push(defs[j]["@id"]);
    }
  } else {
    names.push(defs["@id"]);
  }
  catalog[abcname] = {defs: names};
}


SWF.parse(snarf("bin/library.swf", "binary"), {
  oncomplete: function(result) {
    var tags = result.tags;
    var abcCount = 0;
    var offset = 0;
    var files = [];
    for (var i = 0, n = tags.length; i < n; i++) {
      var tag = tags[i];
      if (tag.code === 82) {
        files.push({name: tag.name, offset: offset, length: + tag.data.length, data: tag.data});
        offset += tag.data.length;
      }
    }
    var bits = new Uint8Array(offset);
    var index = [];
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var name = file.name;
      bits.set(file.data, file.offset);
      index.push({name: file.name, offset: file.offset, length: file.length, defs: catalog[name].defs});
      delete file.data;
    }

    print(JSON.stringify(index, null, 2));
  }
});
