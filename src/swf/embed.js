/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var head = document.head;
head.insertBefore(document.createElement('style'), head.firstChild);
var style = document.styleSheets[0];

function definePrototype(dictionary, obj) {
  var id = obj.id;
  var requirePromise = Promise.resolved;
  if (obj.require && obj.require.length > 0) {
    var requirePromises = [];
    for (var i = 0; i < obj.require.length; i++)
      requirePromises.push(dictionary.getPromise(obj.require[i]));
    requirePromise = Promise.all(requirePromises);
  }
  var promise = dictionary.getPromise(id);
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

      requirePromise.then(function() {
        promise.resolve(obj);
      });
    }
    break;
  case 'image':
    var img = new Image;
    img.src = 'data:' + obj.mimeType + ';base64,' + btoa(obj.data);
    img.onload = function() {
      var proto = create(obj);
      proto.img = img;
      requirePromise.then(function() {
        promise.resolve(proto);
      });
    };
    break;
  case 'sprite':
    requirePromise.then(function() {
      promise.resolve(new MovieClipPrototype(obj, dictionary));
    });
    break;
  case 'shape':
  case 'text':
    var proto = create(obj);
    var drawFn = new Function('d,c,r',
      'with(c){\n' +
        obj.data + '\n' +
      '}'
    );
    proto.draw = (function(c, r) {
      return drawFn.call(this, dictionary, c, r);
    });
    requirePromise.then(function() {
      promise.resolve(proto);
    });
    break;
  case 'button':
    requirePromise.then(function() {
      promise.resolve(new ButtonPrototype(obj, dictionary));
    });
    break;
  default:
    fail('unknown object type', 'define');
  }
}

function ObjDictionary() {
  this.promises = this;
}
ObjDictionary.prototype = {
  getPromise: function(objId) {
    if (!(objId in this.promises)) {
      var promise = new Promise();
      this.promises[objId] = promise;
    }
    return this.promises[objId];
  },
  isPromiseExists: function(objId) {
    return objId in this.promises;
  }
};

SWF.embed = function(file, container, options) {
  if (!options)
    options = { };

  var result;
  var root;
  var dictionary = new ObjDictionary();
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
      as2Context = new AS2Context(obj.version, {
        width: (bounds.xMax - bounds.xMin) / 20,
        height: (bounds.yMax - bounds.yMin) / 20
      });
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
