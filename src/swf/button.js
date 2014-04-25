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


function defineButton(tag, dictionary) {
  var characters = tag.characters;
  var states = {
    up: [],
    over: [],
    down: [],
    hitTest: []
  };
  var i = 0, character;
  while ((character = characters[i++])) {
    if (character.eob)
      break;
    var characterItem = dictionary[character.symbolId];
    assert(characterItem, 'undefined character', 'button');
    var cmd = {
      symbolId: characterItem.id,
      depth: character.depth,
      hasMatrix: !!character.matrix,
      matrix: character.matrix
    };
    if (character.stateUp)
      states.up.push(entry);
    if (character.stateOver)
      states.over.push(entry);
    if (character.stateDown)
      states.down.push(entry);
    if (character.stateHitTest)
      states.hitTest.push(entry);
  }
  var button = {
    type: 'button',
    id: tag.id,
    buttonActions: tag.buttonActions,
    states: states
  };
  return button;
}
