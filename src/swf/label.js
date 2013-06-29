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
/*global toStringRgba, fromCharCode */

function defineLabel(tag, dictionary) {
  var records = tag.records;
  var m = tag.matrix;
  var transform = 'matrix(' + [m.a, m.b, m.c, m.d, m.tx, m.ty].join(',') + ')';
  var content = [];
  var dependencies = [];
  var fontHeight = 0;
  var x = 0;
  var i = 0;
  var record;
  while ((record = records[i++])) {
    if (record.eot) {
      break;
    }
    var run = {chars : [], positions : [], y : 0};
    var chars = run.chars;
    var positions = run.positions;
    content.push(run);
    if (record.hasFont) {
      var font = dictionary[record.fontId];
      assert(font, 'undefined font', 'label');
      fontHeight = record.fontHeight/20;
      run.fontName = font.name;
      run.fontSize = fontHeight;
      var codes = font.codes;
      dependencies.push(font.id);
    }
    if (record.hasColor) {
      run.color = toStringRgba(record.color);
    }
    if (record.hasMoveX){
      x = record.moveX;
    }
    if (record.hasMoveY) {
      run.y = record.moveY / 20 - fontHeight;
    }
    var entries = record.entries;
    var j = 0;
    var entry;
    while (entry = entries[j++]) {
      var code = codes[entry.glyphIndex];
      assert(code, 'undefined glyph', 'label');
      var text = code >= 32 && code != 34 && code != 92
                 ? fromCharCode(code)
                 : '\\u' + (code + 0x10000).toString(16).substring(1);
      chars.push(text);
      positions.push(x/20);
      x += entry.advance;
    }
  }
  var label = {
    type: 'label',
    id: tag.id,
    bbox: tag.bbox,
    transform : transform,
    html : content
  };
  if (dependencies.length) {
    label.require = dependencies;
  }
  return label;
}
