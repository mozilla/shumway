/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

function defineButton(tag, dictionary) {
  var characters = tag.characters;
  var dependencies = [];
  var i = 0;
  var character;
  while (character = characters[i++]) {
    if (character.eob)
      break;
    // TODO characters and dependencies
  }
  var shape = {
    type: 'shape',
    id: tag.id,
    bounds: { xMin:0, yMin:0, xMax:0, yMax:0 } // ???
  };
  if (dependencies.length)
    shape.require = dependencies;
  return shape;
}
