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
/*global rgbaObjToStr, fromCharCode */

function defineLabel(tag, dictionary, flip) {
  var records = tag.records;
  var m = tag.matrix;
  var bbox = tag.bbox;
  var cmds = [
    'c.save()',
    'c.transform(' + [m.a, m.b, -m.c, m.d*flip, m.tx/20, m.ty/20].join(',') + ')'
  ];
  var dependencies = [];
  var x = 0;
  var y = 0;
  var i = 0;
  var record;
  var codes;
  var indexCorrection;
  var fullText='';
  while ((record = records[i++])) {
    if (record.eot)
      break;

    var bbox = tag.bbox;

    if (record.hasFont) {
      var font = dictionary[record.fontId];
      assert(font, 'undefined font', 'label');
      codes = font.codes;
      indexCorrection = font.indexCorrection;
      cmds.push('c.font="' + (record.fontHeight > 160 ? record.fontHeight/20 : record.fontHeight) + 'px \'' + font.uniqueName + '\'"');
      dependencies.push(font.id);
    }

    if (record.hasColor) {
      cmds.push('ct.setFillStyle(c,"' + rgbaObjToStr(record.color) + '")');
      cmds.push('ct.setAlpha(c)');
    } else {
      // FIXME what sets color of the text?
      cmds.push('ct.setAlpha(c,true)');
    }

    if (record.hasMoveX)
      x = -flip*record.moveX /20;
    if (record.hasMoveY)
      y = flip*record.moveY /20;


    var entries = record.entries;
    var j = 0;
    var entry;
    var text='';
    while ((entry = entries[j++])) {
      var code = codes[entry.glyphIndex];
      try {
        assert(code, 'undefined glyph', 'label');
        text = code >= 32 && code != 34 && code != 92 ? fromCharCode(code) :
          '\\u' + (code + 0x10000).toString(16).substring(1);
        cmds.push('c.fillText("' + text + '",'+ x +','+ y +'); // '+code );
        x+= entry.advance / 20;
        fullText+=text;
      } catch(e) {
        console.log(e);
        console.log(code,entry.glyphIndex);
      }
    }
  }
  cmds.push('c.restore()');
  var label = {
    type: 'label',
    id: tag.id,
    bbox: tag.bbox,
    data: cmds.join('\n'),
    matrix: tag.matrix,
    text:fullText
  };
  if (dependencies.length)
    label.require = dependencies;
  return label;
}
