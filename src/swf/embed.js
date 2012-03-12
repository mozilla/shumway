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
        if (ctx.measureText(charset).width === defaultWidth)
          return true;
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
    defer(function () {
      for (var i = 1; i < id; ++i) {
        if (i in dictionary && dictionary[i] === null)
          return true;
      }
      dictionary[id] = new MovieClipPrototype(obj, dictionary);
    });
    break;
  case 'shape':
    var dependencies;
    if (obj.require)
      dependencies = obj.require.slice();

    defer(function () {
      if (dependencies) {
        var i = 0;
        var objId;
        while (objId = dependencies[i++]) {
          assert(objId in dictionary, 'unknown object', 'require');
          if (dictionary[objId] === null)
            return true;
          dependencies.pop();
        }
      }
      var proto = create(obj);
      proto.draw = (new Function('d,c,r',
        'with(c){\n' +
          obj.data + '\n' +
        '}'
      )).bind(null, dictionary);
      dictionary[id] = proto;
    });
    break;
  default:
    fail('unknown object type', 'define');
  }
  if (!(id in dictionary))
    dictionary[id] = null;
}

SWF.embed = function (file, container, options) {
  if (!options)
    options = { };

  var result;
  var root;
  var dictionary = { };
  var pframes = [];
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var frameRate;
  var plays;

  startWorking(file, function(obj) {
    if (obj) {
      if (!root) {
        var proto = create(new MovieClipPrototype({
          frameCount: obj.frameCount,
          pframes: pframes
        }, dictionary));
        root = proto.constructor();
        var bounds = obj.bounds;
        canvas.width = (bounds.xMax - bounds.xMin) / 20;
        canvas.height = (bounds.yMax - bounds.yMin) / 20;
        container.appendChild(canvas);
        frameRate = obj.frameRate;
        if (options.onstart)
          options.onstart(root);
      } else if (obj.id) {
        definePrototype(dictionary, obj);
      } else if (obj.type === 'pframe') {
        if (obj.bgcolor)
          canvas.style.background = obj.bgcolor;
        pframes.push(obj);
        if (!plays) {
          renderMovieClip(root, frameRate, ctx);
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
