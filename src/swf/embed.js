/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var head = document.head;
head.insertBefore(document.createElement('style'), head.firstChild);
var style = document.styleSheets[0];

function definePrototype(dictionary, obj) {
  var id = obj.id;
  switch (obj.type) {
  case 'font':
    var charset = fromCharCode.apply(null, obj.codes);
    if (charset) {
      style.insertRule(
        '@font-face{' +
          'font-family:"' + obj.name + '";' +
          'src:url(data:font/opentype;base64,' + btoa(obj.data) + ')' +
        '}',
        style.cssRules.length
      );
      var ctx = (document.createElement('canvas')).getContext('2d');
      ctx.font = '1024px "' + obj.name + '"';
      var defaultWidth = ctx.measureText(charset).width;

      defer(function() {
        //if (ctx.measureText(charset).width === defaultWidth)
        //  return true;
        dictionary[id] = obj;
      });
    }
    break;
  case 'image':
    var img = new Image;
    img.src = 'data:' + obj.mimeType + ';base64,' + btoa(obj.data);
    img.onload = function() {
      var proto = create(obj);
      proto.img = img;
      dictionary[id] = proto;
    };
    break;
  case 'sprite':
    defer(function() {
      //for (var i = 1; i < id; ++i) {
      //  if (i in dictionary && dictionary[i] === null)
      //    return true;
      //}
      dictionary[id] = new MovieClipPrototype(obj, dictionary);
    });
    break;
  case 'shape':
  case 'text':
    //var dependencies;
    //if (obj.require)
    //  dependencies = obj.require.slice();

    defer(function() {
      //if (dependencies) {
      //  var i = 0;
      //  var objId;
      //  while (objId = dependencies[i++]) {
      //    assert(objId in dictionary, 'unknown object', 'require');
      //    if (dictionary[objId] === null)
      //      return true;
      //    dependencies.pop();
      //  }
      //}
      var proto = create(obj);
      var drawFn = new Function('d,c,r',
        'with(c){\n' +
          obj.data + '\n' +
        '}'
      );
      proto.draw = (function(c, r) {
        return drawFn.call(this, dictionary, c, r);
      });
      dictionary[id] = proto;
    });
    break;
  case 'button':
    defer(function() {
      dictionary[id] = new ButtonPrototype(obj, dictionary);
    });
    break;
  default:
    fail('unknown object type', 'define');
  }
  if (!(id in dictionary))
    dictionary[id] = null;
}

SWF.embed = function(file, container, options) {
  if (!options)
    options = { };

  var result;
  var root;
  var dictionary = { };
  var pframes = [];
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var frameRate, bounds;
  var plays;
  var as2Context = null;

  function resizeCanvas(container, canvas) {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }

  startWorking(file, function(obj) {
    if (!root) {
      bounds = obj.bounds;
      if (container.clientHeight) {
        resizeCanvas(container, canvas);
        window.addEventListener('resize',
          resizeCanvas.bind(null, container, canvas), false);
      } else {
        canvas.width = (bounds.xMax - bounds.xMin) / 20;
        canvas.height = (bounds.yMax - bounds.yMin) / 20;
      }
      container.appendChild(canvas);

      frameRate = obj.frameRate;

      // TODO disable AVM1 if AVM2 is enabled
      as2Context = new AS2Context(obj.version,
        {width: canvas.width, height: canvas.height});
      AS2Context.instance = as2Context;
      var globals = as2Context.globals;

      AS2Mouse.$bind(canvas);
      AS2Key.$bind(canvas);

      var proto = create(new MovieClipPrototype({
        frameCount: obj.frameCount,
        pframes: pframes
      }, dictionary));
      root = proto.constructor();
      root.name = '_root';

      globals._root = globals._level0 = root.$as2Object;

      if (options.onstart)
        options.onstart(root);
      return;
    }

    AS2Context.instance = as2Context;
    if (obj) {
      if (obj.id) {
        definePrototype(dictionary, obj);
      } else if (obj.type === 'pframe') {
        if (obj.bgcolor)
          canvas.style.background = obj.bgcolor;

        if (obj.abcBlocks) {
          var blocks = obj.abcBlocks;
          var i = 0;
          var block;
          while (block = blocks[i++]) {
            var abc = new AbcFile(block);
            executeAbc(abc, ALWAYS_INTERPRET);
          }
        }

        if (obj.symbols) {
          var symbols = obj.symbols;
          var i = 0;
          var sym;
          while (sym = symbols[i++]) {
            if (!sym.id) {
              var mainTimeline = new (toplevel.getTypeByName(
                Multiname.fromSimpleName(sym.name),
                true
              )).instance;
            }
          }
        }

        pframes.push(obj);
        if (!plays) {
          renderMovieClip(root, frameRate, bounds, ctx);
          plays = true;
        }
      } else {
        result = obj;
      }
    } else if (options.oncomplete) {
      options.oncomplete(root, result);
    }
  });
};
