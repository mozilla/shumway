/* -*- mode: javascript; tab-width: 4; indent-tabs-mode: nil -*- */

function defineButton(tag, dictionary) {
  var characters = tag.characters;
  var states = {
    up: {},
    over: {},
    down: {},
    hitTest: {}
  };
  var i = 0;
  while ((character = characters[i++])) {
    if (character.eob)
      break;
    var characterItem = dictionary[character.symbolId];
    assert(characterItem, 'undefined character', 'button');
    var entry = {
      symbolId: characterItem.id,
      matrix: character.matrix
    };
    if (character.stateUp)
      states.up[character.depth] = entry;
    if (character.stateOver)
      states.over[character.depth] = entry;
    if (character.stateDown)
      states.down[character.depth] = entry;
    if (character.stateHitTest)
      states.hitTest[character.depth] = entry;
  }
  var button = {
    type: 'button',
    id: tag.id,
    buttonActions: tag.buttonActions,
    states: states
  };
  return button;
}
