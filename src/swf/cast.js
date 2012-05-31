/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

function cast(tags, dictionary, declare) {
  var pframes = [];
  var pframe = { };
  var i = 0;
  var tag;
  while (tag = tags[i++]) {
    if ('id' in tag) {
      var factory = null;
      var obj = null;
      switch (tag.type) {
      case 'bitmap':
        var factory = defineBitmap;
        break;
      case 'font':
        var factory = defineFont;
        break;
      case 'image':
        var factory = defineImage;
        break;
      case 'label':
        var factory = defineLabel;
        break;
      case 'shape':
        var factory = defineShape;
        break;
      case 'sprite':
        var dependencies = [];
        obj = {
          type: 'sprite',
          id: tag.id,
          frameCount: tag.frameCount,
          require: dependencies,
          pframes: cast(tag.tags, dictionary, (function(dependencies, obj) {
            dependencies.push(obj.id);
            declare(obj);
          }).bind(null, dependencies))
        };
        break;
      case 'text':
        var factory = defineText;
        break;
      case 'button':
        var factory = defineButton;
        break;
      case 'sound':
        var obj = {
          type: 'sound',
          id: tag.id
        };
        break;
      default:
        fail('unknown object type', 'cast');
      }

      var id = tag.id - 0x4001;
      dictionary[id] = tag;
      defineProperty(dictionary, tag.id, {
        get: (function(id, factory, obj) {
          var undeclared = true;
          return function() {
            if (undeclared) {
              if (!obj)
                obj = factory(dictionary[id], dictionary);
              if (obj.id)
                declare(obj);
              undeclared = false;
            }
            return obj;
          };
        })(id, factory, obj)
      });
      continue;
    }
    switch (tag.type) {
    case 'abc':
      if (!pframe.abcBlocks)
        pframe.abcBlocks = [];
      pframe.abcBlocks.push(tag.data);
      break;
    case 'actions':
      if (!pframe.actionsData) {
        pframe.initActionsData = {};
        pframe.actionsData = [];
      }
      if (tag.spriteId)
        pframe.initActionsData[tag.spriteId] = tag.actionsData;
      else
        pframe.actionsData.push(tag.actionsData);
      break;
    case 'background':
      pframe.bgcolor = toStringRgba(tag.color);
      break;
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
    case 'frameLabel':
      pframe.name = tag.name;
      break;
    case 'place':
      var entry = { };
      if (tag.place) {
        var obj = dictionary[tag.objId];
        assert(obj, 'undefined object', 'place');
        entry.id = obj.id;
      }
      if (tag.events) {
        var events = tag.events;
        if (events[events.length - 1].eoe)
          events = events.slice(0, events.length - 1);
        entry.events = events;
      }
      if (tag.move)
        entry.move = true;
      if (tag.name)
        entry.name = tag.name;
      if (tag.hasMatrix)
        entry.matrix = tag.matrix;
      if (tag.hasCxform)
        entry.cxform = tag.cxform;
      if (tag.hasRatio)
        entry.ratio = tag.ratio / 0xffff;
      pframe[tag.depth] = entry;

      break;
    case 'remove':
      pframe[tag.depth] = null;
      break;
    case 'symbols':
      pframe.symbols = tag.references;
      break;
    case 'assets':
      if (!pframe.assets)
        pframe.assets = [];
      pframe.assets = pframe.assets.concat(tag.references);
      break;
    }
  }
  return pframes;
}
