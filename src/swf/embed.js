/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var head = document.head;
head.insertBefore(document.createElement('style'), head.firstChild);
var style = document.styleSheets[0];

function definePrototype(dictionary, obj, ctx) {
  var proto;
  switch (obj.type) {
  case 'font':
    var charset = fromCharCode.apply(null, obj.codes);
    if (charset) {
      var ctx = (document.createElement('canvas')).getContext('2d');
      var defaultWidth = ctx.measureText(charset).width;
      style.insertRule(
        '@font-face{' +
          'font-family:"' + obj.name + '";' +
          'src:url(data:font/opentype;base64,' + btoa(obj.data) + ')' +
        '}',
        style.cssRules.length
      );
      ctx.font = obj.name;
      (function defer() {
        if (ctx.measureText(charset).width !== defaultWidth)
          dictionary[obj.id] = obj;
        else
          setTimeout(defer);
      })();
    }
    break;
  case 'image':
    var img = new Image;
    img.src = 'data:' + obj.mimeType + ';base64,' + btoa(obj.data);
    img.onload = function() {
      var proto = create(obj);
      proto.img = img;
      dictionary[obj.id] = proto;
    };
    break;
  case 'movieclip':
    var proto = new MovieClipPrototype(obj, dictionary);
    break;
  case 'shape':
    var proto = create(obj);
    proto.draw = (new Function('d,c,r',
      'with(c){' + obj.data + '}'
    )).bind(null, dictionary);
    break;
  }
  dictionary[obj.id] = proto;
}

SWF.embed = function (file, container, onstart) {
  var root = null;
  var frameRate;
  var pframes = [];
  var dictionary = { };
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  startWorking(file, function(obj) {
    if (obj) {
      if (!root) {
        root = create(new MovieClipPrototype({
          frameCount: obj.frameCount,
          pframes: pframes
        }, dictionary));
        frameRate = obj.frameRate;
        var bounds = obj.bounds;
        canvas.width = (bounds.xMax - bounds.xMin) / 20;
        canvas.height = (bounds.yMax - bounds.yMin) / 20;
        container.appendChild(canvas);
        if (onstart)
          onstart(root);
      }
      if (obj.id) {
        definePrototype(dictionary, obj, ctx);
      } else if (obj.type === 'pframe') {
        if (obj.bgcolor)
          canvas.style.background = obj.bgcolor;
        pframes.push(obj);
      }
    } else {
      renderMovieClip(root, frameRate, ctx);
    }
  });
}
