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
      var timelineLoader = new TimelineLoader(obj.frameCount || 1, obj.pframes || [], dictionary);
      promise.resolve(new MovieClipPrototype(obj, timelineLoader));
    });
    break;
  case 'shape':
  case 'text':
    var proto = create(obj);
    var drawFn = new Function('d,c,r', obj.data);
    proto.draw = (function(c, r) {
      return drawFn.call(this, dictionary, c, r);
    });
    requirePromise.then(function() {
      promise.resolve(proto);
    });
    break;
  case 'button':
    requirePromise.then(function() {
      var timelineLoader = new TimelineLoader(4,
        [obj.states.up,obj.states.over,obj.states.down,obj.states.hitTest],
        dictionary);
      promise.resolve(new ButtonPrototype(obj, timelineLoader));
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

  var canvas = document.createElement('canvas');

  function resizeCanvas(container, canvas) {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }

  var stage = new Stage();
  stage._attachToCanvas({
    file: file,
    canvas: canvas,
    onstart: function(root, stage) {
      if (container.clientHeight) {
        resizeCanvas(container, canvas);
        window.addEventListener('resize',
          resizeCanvas.bind(null, container, canvas), false);
      } else {
        canvas.width = stage.stageWidth;
        canvas.height = stage.stageHeight;
      }
      container.appendChild(canvas);

      AS2Mouse.$bind(canvas);
      AS2Key.$bind(canvas);

      if (options.onstart)
        options.onstart(root);
    },
    oncomplete: function(root, result) {
      if (options.oncomplete)
        options.oncomplete(root, result);
    }
  });
};
