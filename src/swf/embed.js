/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var head = document.head;
head.insertBefore(document.createElement('style'), head.firstChild);
var style = document.styleSheets[0];

function defer(func, startTime) {
  if (!startTime)
    startTime = +new Date;
  else if (+new Date - startTime > 1000)
    fail('timeout', 'defer');
  if (!func())
    setTimeout(defer, 0, func, startTime);
}

function definePrototype(dictionary, obj, ctx) {
  var id = obj.id;
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
      defer(function() {
        if (ctx.measureText(charset).width !== defaultWidth) {
          dictionary[id] = obj;
          return true;
        }
      });
    }
    break;
  case 'image':
    var img = new Image;
    img.src = 'data:' + obj.mimeType + ';base64,' + btoa(obj.data);
    img.onload = function() {
      proto = create(obj);
      proto.img = img;
      dictionary[id] = proto;
    };
    break;
  case 'movieclip':
    proto = new MovieClipPrototype(obj, dictionary);
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
          if (objId in dictionary) {
            if (dictionary[objId] == undefined)
              return false;
            dependencies.pop();
          } else {
            fail('unknown object id ' + objId, 'embed');
          }
        }
      }
      proto = create(obj);
      proto.draw = (new Function('d,c,r',
        'with(c){' + obj.data + '}'
      )).bind(null, dictionary);
      dictionary[id] = proto;
      return true;
    });
    break;
  }
  if (!(id in dictionary))
    dictionary[id] = proto;
}

SWF.embed = function (file, container, onstart, oncomplete) {
  var root = null;
  var frameRate;
  var pframes = [];
  var dictionary = { };
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
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
    } else if (oncomplete) {
      oncomplete(root, obj);
    } else {
      renderMovieClip(root, frameRate, ctx);
    }
  });
}
