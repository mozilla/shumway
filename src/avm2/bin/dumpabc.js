/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
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

load("../../../lib/DataView.js/DataView.js");

var SWF = {}, self = this, release = true;
load("../avm2Util.js");
load("../../swf/swf.js");
load("../../swf/types.js");
load("../../swf/structs.js");
load("../../swf/tags.js");
load("../../swf/inflate.js");
load("../../swf/stream.js");
load("../../swf/templates.js");
load("../../swf/generator.js");
load("../../swf/handlers.js");
load("../../swf/parser.js");
load("../../swf/bitmap.js");
load("../../swf/button.js");
load("../../swf/font.js");
load("../../swf/image.js");
load("../../swf/label.js");
load("../../swf/shape.js");
load("../../swf/text.js");

load("../../options.js");

load("../metrics.js");

var stdout = new IndentingWriter();
var ArgumentParser = options.ArgumentParser;

var argumentParser = new ArgumentParser();

function printUsage() {
  stdout.writeLn("dumpabc.js " + argumentParser.getUsage());
}

argumentParser.addArgument("h", "help", "boolean", {parse: function (x) { printUsage(); }});
var swfFile = argumentParser.addArgument("swf", "swf", "string", { positional: true });
var prefix = argumentParser.addArgument("prefix", "prefix", "string", { defaultValue: "abc" });

try {
  argumentParser.parse(arguments);
} catch (x) {
  stdout.writeLn(x.message);
  quit();
}


SWF.parse(snarf(swfFile.value, "binary"), {
  oncomplete: function(result) {
    var tags = result.tags;
    var abcCount = 0;
    for (var i = 0, n = tags.length; i < n; i++) {
      var tag = tags[i];
      if (tag.code === 82) {
        stdout.writeLn("<<< BASE64 " + prefix.value + "-" + abcCount++ + ".abc");
        print (Shumway.StringUtilities.base64ArrayBuffer(tag.data));
        stdout.writeLn(">>>");
      }
    }
  }
});

/*
SWF.parse(snarf(swfFile.value, "binary"), {
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
    var data = new Uint8Array(offset);
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      data.set(file.data, file.offset);
      print ("Name: " + file.name + ", Offset: " + file.offset + ", Length: " + file.length);
    }
    print (base64ArrayBuffer(data));
  }
});
*/
