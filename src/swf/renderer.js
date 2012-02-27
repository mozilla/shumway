/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame;  

SWF.display = function(displayList, ctx) {
  displayList.ctx = ctx;
  function draw() {
    if (displayList.ctx) {
      if (displayList.dirty) {
        var depths = keys(displayList);
        var i = 0;
        var depth;
        while (depth = depths[i++]) {
          var character = displayList[depth];
          if (character && character.render)
            character.render(ctx, character.matrix, character.ratio);
        }
      }
      displayList.dirty = false;
      requestAnimationFrame(draw);
    }
  }
  requestAnimationFrame(draw);
};
SWF.free = function(displayList) {
  delete displayList.ctx;
};
SWF.render = function(displayList, dictionary, frame) {
  var depths = keys(frame);
  var i = 0;
  var depth;
  while (depth = depths[i++]) {
    var tag = frame[depth];
    if (tag) {
      if (tag.move) {
        var character = create(displayList[depth]);
        for (var prop in tag)
          character[prop] = tag[prop];
        } else {
          var character = create(tag);
        }
        var obj = dictionary[character.objId];
        character.render = obj.render;
        displayList[depth] = character;
    } else {
      delete displayList[depth];
    }
  }
  if (depths.length)
    displayList.dirty = true;
};
