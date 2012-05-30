/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

function defineButton(tag, dictionary) {
  var characters = tag.characters;
  var dependencies = [];
  var states = {
    up: {type: 'pframe'},
    over: {type: 'pframe'},
    down: {type: 'pframe'},
    hitTest: {type: 'pframe'}
  };
  var i = 0;
  while (character = characters[i++]) {
    if (character.eob)
      break;
    var characterItem = dictionary[character.characterId];
    assert(characterItem, 'undefined character', 'button');
    var entry = {
      id: characterItem.id,
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
  if (dependencies.length)
    button.require = dependencies;
  return button;
}
