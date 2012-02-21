/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

function cast(tags, dictionary) {
  if (!isArray(tags))
    tags = [tags];
  var pframe = { type: 'pframe' };
  for (var i = 0, tag; tag = tags[i]; ++i) {
    if (tag.type === 'frame')
      break;
    if (tag.id) {
      switch (tag.type) {
      case 'font':
        var obj = defineFont(tag, dictionary);
        break;
      case 'shape':
        var obj = defineShape(tag, dictionary);
        break;
      case 'sprite':
        var pframes = [];
        var subtags = tag.tags;
        var j = 0;
        var subtag;
        var controlTags = [];
        while (subtag = subtags[j++]) {
          if (subtag.type === 'frame') {
            var k = j;
            do {
              controlTags.push(subtag);
              subtag = subtags[k++];
            } while (subtag && subtag.type === 'frame');
            j = k;
            pframes.push(cast(controlTags, dictionary));
            controlTags = [];
          } else {
            controlTags.push(subtag);
          }
        }
        var obj = {
          type: 'clip',
          id: tag.id,
          pframes: pframes
        };
        break;
      case 'text':
        var obj = defineText(tag, dictionary);
        break;
      default:
        var obj = tag;
      }
      dictionary[tag.id] = obj;
      continue;
    }
    switch (tag.type) {
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
  if (i === 1 && obj)
    return obj;
  for (var n = 0; (tag = tags[i]) && tag.type === 'frame'; ++n, ++i);
  if (n > 1)
    pframe.repeat = n;
  return pframe;
};
