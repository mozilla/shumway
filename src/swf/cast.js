/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

function cast(tags, dictionary) {
  var pframes = [];
  var pframe = { };
  var i = 0;
  var tag;
  while (tag = tags[i++]) {
    if (tag.id) {
      switch (tag.type) {
      case 'font':
        var obj = defineFont(tag, dictionary);
        break;
      case 'shape':
        var obj = defineShape(tag, dictionary);
        break;
      case 'sprite':
        var obj = {
          type: 'movieclip',
          id: tag.id,
          pframes: cast(tag.tags, dictionary)
        };
        break;
      case 'text':
        var obj = defineText(tag, dictionary);
        break;
      default:
        dictionary[tag.id] = tag;
        continue;
      }
      dictionary[tag.id] = obj;
      continue;
    }
    switch (tag.type) {
    case 'frame':
      var n = 1;
      for (; tag = tags[i]; ++n, ++i) {
        if (tag.type !== 'frame')
          break;
      }
      if (n > 1)
        pframe.repeat = n;
      pframe.type = 'pframe';
      pframes.push(pframe);
      pframe = { };
      break;
    case 'place':
      var entry = { move: tag.move };
      if (tag.place)
        entry.id = tag.objId;
      if (tag.hasMatrix)
        entry.matrix = tag.matrix;
      if (tag.hasRatio)
        entry.ratio = tag.ratio / 0xffff;
      pframe[tag.depth] = entry;
      break;
    case 'remove':
      pframe[tag.depth] = null;
      break;
    }
  }
  return pframes;
};
