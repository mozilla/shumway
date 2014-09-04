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

// based on src/avm2/bin/dumpabc.js

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

SWF.parse(snarf("bin/library.min.swf", "binary"), {
  oncomplete: function(result) {
    var tags = result.tags;
    var abcCount = 0;
    var offset = 0;
    var files = [];
    for (var i = 0, n = tags.length; i < n; i++) {
      var tag = tags[i];
      if (tag.code === 82) {
        print (base64ArrayBuffer(tag.data));
        break;
      }
    }
  }
});
