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
  var dependencies = [];
  if (tag.hasFont) {
    var font = dictionary[tag.fontId];
    assert(font, 'undefined font', 'label');
    tag.font = font.name;
    dependencies.push(font.id);
  }

  var props = {
    type: 'text',
    id: tag.id,
    variableName: tag.variableName, // for AVM1
    tag: tag
  };
  if (dependencies.length)
    props.require = dependencies;
  return props;
}
