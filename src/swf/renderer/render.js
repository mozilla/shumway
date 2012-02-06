/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

function renderDisplayList(displayList, ctx) {
  var maxDepth = displayList.maxDepth;
	var depth = 0;
	while (depth++ < maxDepth) {
    var character = displayList[depth];
    if (character)
		  character.render(ctx);
  }
};
