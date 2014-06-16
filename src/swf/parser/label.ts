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
    var x = 0;
    var y = 0;
    var i = 0;
    var record;
    var codes;
    while ((record = records[i++])) {
      if (record.eot)
        break;

      htmlText += '<font';

      if (record.hasFont) {
        var font = dictionary[record.fontId];
        release || assert(font, 'undefined font', 'label');
        codes = font.codes;
        dependencies.push(font.id);
        htmlText += ' face="' + font.name + '"';
      }

      if (record.hasColor) {
        var color = ColorUtilities.componentsToRGB(record.color);
        htmlText += ' color="' + ('000000' + color.toString(16)).slice(-6) + '"';
      }

      if (record.hasMoveX)
        x = record.moveX;
      if (record.hasMoveY)
        y = record.moveY;

      htmlText += '>';

      var entries = record.entries;
      var j = 0;
      var entry;
      while ((entry = entries[j++])) {
        var code = codes[entry.glyphIndex];
        release || assert(code, 'undefined glyph', 'label');
        var text = code >= 32 && code != 34 && code != 92 ? String.fromCharCode(code) :
                   '\\u' + (code + 0x10000).toString(16).substring(1);
        htmlText += text;
        coords.push(x, y);
        x += entry.advance;
      }

      htmlText += '</font>';
    }
    var label = {
      type: 'text',
      id: tag.id,
      bbox: bbox,
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
    if (dependencies.length)
      label.require = dependencies;
    return label;
  }
}
