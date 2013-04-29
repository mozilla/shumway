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

function defineText(tag, dictionary) {
  var cmds = [];
  cmds.push('c.save()');
  cmds.push('c.beginPath()');
  cmds.push('c.rect(' + tag.bbox.left + ', ' + tag.bbox.top + ', ' +
                        (tag.bbox.right - tag.bbox.left) + ', ' +
                        (tag.bbox.bottom - tag.bbox.top) + ')');
  cmds.push('c.clip()');
  cmds.push('c.scale(0.05, 0.05)');
  var dependencies = [];
  var y;
  if (tag.hasText) {
	var initialText = tag.html ? tag.initialText.replace(/<[^>]*>/g, '') : tag.initialText;
  } else {
  	var initialText = '';
  }

  if (tag.hasFont) {
    y = tag.fontHeight - tag.leading;
    var font = dictionary[tag.fontId];
    assert(font, 'undefined font', 'label');
    cmds.push('c.font="' + tag.fontHeight + 'px \'' + font.name + '\'"');
    dependencies.push(font.id);
  } else {
    // height of 12pt in twips
    y = 12 * (92 / 72) * 20;
    cmds.push('c.font="' + y + 'px \'sans\'"');
  }
  if (tag.hasColor)
    cmds.push('c.fillStyle="' + toStringRgba(tag.color) + '"');
  cmds.push('c.fillText(this.text,0,' + (y - 20 * tag.bbox.top) + ')');

  cmds.push('c.restore();');
  var text = {
    type: 'text',
    id: tag.id,
    bbox: tag.bbox,
    variableName: tag.variableName,
    value: initialText,
    data: cmds.join('\n')
  };
  if (dependencies.length)
    text.require = dependencies;
  return text;
}
