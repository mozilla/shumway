/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

function renderDisplayList(displayList, ctx) {
  console.time('render');
  var maxDepth = displayList.maxDepth;
  var depth = 0;
  while (depth++ < maxDepth) {
    var character = displayList[depth];
    if (character && character.render)
        character.render(ctx, character.matrix, (character.ratio / 0xffff) || 0);
  }
  console.timeEnd('render');
}

SWF.render = function(graph, dictionary, ctx, frameNum) {
  var timeline = graph.timeline;
  if (!timeline) {
    timeline = [];
    defineProperty(graph, 'timeline', {
      value: timeline,
      enumerable: false
    })
  }
  var frame = timeline[frameNum - 1];
  if (frame) {
    renderDisplayList(frame.displayList, ctx);
    return;
  }
  var tags = graph.tags;
  if (timeline.length) {
    var prevFrame = timeline[timeline.length - 1];
    var displayList = create(prevFrame.displayList);
    var currentFrame = prevFrame.frameNum + 1;
    var i = prevFrame.ei + 1;
  } else {
    var displayList = { maxDepth: 0 };
    var currentFrame = 1;
    var i = 0;
  }
  var si = i;
  var tag;
  while (tag = tags[i++]) {
    switch (tag.type) {
    case 'font':
      var style = document.head.appendChild(document.createElement('style'));
      style.innerText =
        '@font-face{' +
          'font-family:"' + tag.name + '";' +
          'src:url(' + 'data:font/opentype;base64,' + btoa(defineFont(tag)) + ')' +
        '}'
      ;
      break;
    case 'frame':
      timeline.push({
        frameNum: currentFrame,
        si: si,
        ei: i - 1,
        displayList: displayList
      });
      if (currentFrame === frameNum) {
        renderDisplayList(displayList, ctx);
        return;
      }
      displayList = create(displayList);
      ++currentFrame;
      break;
    case 'place':
      var depth = tag.depth;
      if (tag.move) {
        var character = create(displayList[depth]);
        for (var prop in tag)
          character[prop] = tag[prop];
      } else {
        var character = create(tag);
        var obj = dictionary[tag.objId];
        switch (obj.type) {
        case 'shape':
          character.render = new ShapeRenderer(obj, dictionary);
          break;
        case 'text':
          character.render = new TextRenderer(obj, dictionary);
          break;
        }
      }
      displayList[depth] = character;
      if (depth > displayList.maxDepth)
        displayList.maxDepth = depth;
      break;
    case 'remove':
      displayList[tag.depth] = undefined;
      break;
    }
  }
};
