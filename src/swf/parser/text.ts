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
  export function defineText(tag, dictionary) {
    var dependencies = [];
    var bold = false;
    var italic = false;
    if (tag.hasFont) {
      var font = dictionary[tag.fontId];
      Shumway.Debug.assert(font, 'undefined font', 'label');
      dependencies.push(font.id);
      bold = font.bold;
      italic = font.italic;
    }

    var props = {
      type: 'text',
      id: tag.id,
      variableName: tag.variableName, // for AVM1
      tag: tag,
      bold: bold,
      italic: italic,
      require: undefined
    };
    if (dependencies.length) {
      props.require = dependencies;
    }
    return props;
  }
}
