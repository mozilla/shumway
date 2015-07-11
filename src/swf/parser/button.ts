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

  export function defineButton(tag: ButtonTag, dictionary: any): any {
    var characters = tag.characters;
    var states = {
      up: [],
      over: [],
      down: [],
      hitTest: []
    };
    var i = 0, character;
    while ((character = characters[i++])) {
      var characterItem = dictionary[character.symbolId];
      // The Flash Player ignores references to undefined symbols here. So should we.
      // TODO: What should happen if the symbol gets defined later in the file?
      if (characterItem) {
        var cmd = {
          symbolId: characterItem.id,
          code: SwfTag.CODE_PLACE_OBJECT,
          depth: character.depth,
          flags: character.matrix ? PlaceObjectFlags.HasMatrix : 0,
          matrix: character.matrix
        };
        if (character.stateUp)
          states.up.push(cmd);
        if (character.stateOver)
          states.over.push(cmd);
        if (character.stateDown)
          states.down.push(cmd);
        if (character.stateHitTest)
          states.hitTest.push(cmd);
      } else {
        release || Debug.warning('undefined character in button ' + tag.id);
      }
    }
    var button = {
      type: 'button',
      id: tag.id,
      buttonActions: tag.buttonActions,
      states: states
    };
    return button;
  }
}
