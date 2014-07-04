/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/// <reference path='references.ts'/>
module Shumway.SWF.Parser {
  import assert = Shumway.Debug.assert;
  import ColorUtilities = Shumway.ColorUtilities;

  export function defineLabel(tag: any, dictionary: any) {
    var records = tag.records;
    var bbox = tag.bbox;
    var htmlText = '';
    var coords = [];
    var dependencies = [];
    var size = 12;
    var face = 'Times Roman';
    var color = 0;
    var x = bbox.xMin;
    var y = bbox.yMin;
    var i = 0;
    var record;
    var codes;
    while ((record = records[i++])) {
      if (record.eot) {
        break;
      }
      if (record.hasFont) {
        var font = dictionary[record.fontId];
        release || assert(font, 'undefined font', 'label');
        codes = font.codes;
        dependencies.push(font.id);
        size = record.fontHeight / 20;
        face = 'swffont' + font.id;
      }
      if (record.hasColor) {
        color = record.color >>> 8;
      }
      if (record.hasMoveX) {
        x = record.moveX;
        if (x < bbox.xMin) {
          bbox.xMin = x;
        }
      }
      if (record.hasMoveY) {
        y = record.moveY;
        if (y < bbox.yMin) {
          bbox.yMin = y;
        }
      }
      var text = '';
      var entries = record.entries;
      var j = 0;
      var entry;
      while ((entry = entries[j++])) {
        var code = codes[entry.glyphIndex];
        release || assert(code, 'undefined glyph', 'label');
        text += code >= 32 && code != 34 && code != 92 ? String.fromCharCode(code) :
                '\\u' + (code + 0x10000).toString(16).substring(1);
        coords.push(x, y);
        x += entry.advance;
      }
      htmlText += '<font size="' + size + '" face="' + face + '"' +
                  ' color="#' + ('000000' + color.toString(16)).slice(-6) + '">' +
                    text.replace(/[<>]/g, function(s: string) {
                      return s === '<' ? '&lt' : '&gt';
                    }) +
                  '</font>';
    }
    var label = {
      type: 'text',
      id: tag.id,
      fillBounds: bbox,
      matrix: tag.matrix,
      tag: {
        hasText: true,
        initialText: htmlText,
        html: true,
        readonly: true
      },
      coords: coords,
      static: true,
      require: null
    };
    if (dependencies.length) {
      label.require = dependencies;
    }
    return label;
  }
}
