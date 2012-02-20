/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

SWF.cast = function cast(tags, dictionary, serialized) {
  if (isArray(tags)) {
    var frame = { type: 'pframe' };
    var i = 0;
    var tag;
    while (tag = tags[i++]) {
      switch (tag.type) {
      case 'frame':
        return frame;
      case 'place':
        var depth = tag.depth;
        frame[depth] = tag;
        break;
      case 'remove':
        frame[tag.depth] = null;
        break;
      }
    }
  }
  var tag = tags;
  var id = tag.id;
  switch (tag.type) {
  case 'font':
    var obj = defineFont(tag, dictionary);
    break;
  case 'shape':
    var obj = defineShape(tag, dictionary);
    break;
  case 'sprite':
    var frames = [];
    var tags = tag.tags;
    var i = 0;
    var n = 0;
    var controlTags = [];
    while (tag = tags[i++]) {
      if (tag.type === 'frame') {
        frames[n] = cast(controlTags, dictionary);
        ++n;
        controlTags = [];
        while (tag = tags[i]) {
          if (tag.type === 'frame') {
            ++n;
            ++i;
          } else {
            break;
          }
        }
      } else {
        controlTags.push(tag);
      }
    }
    var obj = {
      type: 'movieclip',
      id: id,
      frames: frames
    };
    break;
  case 'text':
    var obj = defineText(tag, dictionary);
    break;
  default:
    var obj = tag;
  }
  dictionary[id] = serialized ? obj : SWF.deserialize(obj);
  return dictionary[id];
};
