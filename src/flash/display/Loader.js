function Loader() {
  this._dictionary = new ObjDictionary;
  this._symbols = { };
}

Loader.SCRIPT_PATH = './Loader.js';
Loader.WORKERS_ENABLED = true;
Loader.WORKER_SCRIPTS = [
  '../../../lib/DataView.js/DataView.js',

  '../util.js',

  '../../swf/util.js',
  '../../swf/swf.js',
  '../../swf/types.js',
  '../../swf/structs.js',
  '../../swf/tags.js',
  '../../swf/inflate.js',
  '../../swf/stream.js',
  '../../swf/templates.js',
  '../../swf/generator.js',
  '../../swf/parser.js',
  '../../swf/bitmap.js',
  '../../swf/button.js',
  '../../swf/font.js',
  '../../swf/image.js',
  '../../swf/label.js',
  '../../swf/shape.js',
  '../../swf/text.js'
];

var baseProto = null;

if (typeof window === 'undefined') {
  importScripts.apply(null, Loader.WORKER_SCRIPTS);

  onmessage = function (evt) {
    var loader = new Loader;
    loader.loadFrom(loader, evt.data);
  };
} else {
  var head = document.head;
  head.insertBefore(document.createElement('style'), head.firstChild);
  var style = document.styleSheets[0];

  baseProto = new DisplayObjectContainer;
}

Loader.prototype = Object.create(baseProto, {
  __class__: describeInternalProperty('flash.display.Loader'),

  content: describeAccessor(function () {
    return this._content;
  }),
  contentLoaderInfo: describeAccessor(function () {
    return this._contentLoaderInfo || (this._contentLoaderInfo = new LoaderInfo);
  }),
  uncaughtErrorEvents: describeAccessor(function () {
    notImplemented();
  }),

  addChild: describeMethod(function (child) {
    illegalOperation();
  }),
  addChildAt: describeMethod(function (child, index) {
    illegalOperation();
  }),
  close: describeMethod(function () {
    notImplemented();
  }),
  commitData: describeMethod(function (data) {
    if (typeof window === 'undefined') {
      postMessage(data);
    } else {
      var loaderInfo = this.contentLoaderInfo;

      loaderInfo.dispatchEvent(new Event(Event.PROGRESS));

      var pframes = this._pframes || (this._pframes = []);

      if (!this._content) {
        loaderInfo._swfVersion = data.version;

        var bounds = data.bounds;
        loaderInfo._width = (bounds.xMax - bounds.xMin) / 20;
        loaderInfo._height = (bounds.yMax - bounds.yMin) / 20;

        loaderInfo._frameRate = data.frameRate;

        // TODO disable AVM1 if AVM2 is enabled
        var as2Context = new AS2Context(data.version);

        var timelineLoader = new TimelineLoader(data.frameCount, pframes, this._dictionary);
        var root = new MovieClip;
        root._as2Context = as2Context;
        root._timelineLoader = timelineLoader;
        MovieClipClass.call(root);
        root.name = '_root';

        var globals = as2Context.globals;
        globals._root = globals._level0 = root.$as2Object;

        this._content = root;

        loaderInfo._as2Context = as2Context;
      } else if (data) {
        if (data.id) {
          this.commitSymbol(data);
        } else if (data.type === 'pframe') {
          if (data.abcBlocks) {
            var blocks = data.abcBlocks;
            var i = 0;
            var block;
            while (block = blocks[i++]) {
              this.avm2.applicationDomain.executeAbc(new AbcFile(block));
            }
          }

          if (data.symbols) {
            var references = data.symbols;
            //var symbolClasses = loaderInfo._symbolClasses;
            for (var i = 0, n = references.length; i < n; i++) {
              var reference = references[i++];
              var symbol = this.getSymbolById(reference.id);
              if (symbol)
                symbol.__class__ = reference.name;
              //symbolClasses[sym.name] = dictionary[sym.id];
              //if (!sym.id) {
              //  var documentClass = this.avm2.applicationDomain.getProperty(
              //    Multiname.fromSimpleName(sym.name),
              //    true, true
              //  );
              //  new (documentClass.instance)();
              //}
            }
          }

          pframes.push(data);

          if (pframes.length === 1) {
            loaderInfo.dispatchEvent(new Event(Event.INIT));
          }
        }
      } else {
        loaderInfo.dispatchEvent(new Event(Event.COMPLETE));
      }
    }
  }),
  commitSymbol: describeMethod(function (symbol) {
    var dictionary = this._dictionary;
    var id = symbol.id;
    var promise = dictionary.getPromise(id);
    var requirePromise = Promise.resolved;
    if (symbol.require && symbol.require.length > 0) {
      var requirePromises = [];
      for (var i = 0; i < symbol.require.length; i++)
        requirePromises.push(dictionary.getPromise(symbol.require[i]));
      requirePromise = Promise.all(requirePromises);
    }
    switch (symbol.type) {
    case 'font':
      var charset = fromCharCode.apply(null, symbol.codes);
      if (charset) {
        style.insertRule(
          '@font-face{' +
            'font-family:"' + symbol.name + '";' +
            'src:url(data:font/opentype;base64,' + btoa(symbol.data) + ')' +
          '}',
          style.cssRules.length
        );
        var ctx = (document.createElement('canvas')).getContext('2d');
        ctx.font = '1024px "' + symbol.name + '"';
        var defaultWidth = ctx.measureText(charset).width;

        requirePromise.then(function () {
          promise.resolve(symbol);
        });
      }
      break;
    case 'image':
      var img = new Image;
      img.src = 'data:' + symbol.mimeType + ';base64,' + btoa(symbol.data);
      img.onload = function () {
        var proto = Object.create(symbol);
        proto.img = img;
        requirePromise.then(function () {
          promise.resolve(proto);
        });
      };
      break;
    case 'sprite':
      var timelineLoader = new TimelineLoader(
        symbol.frameCount || 1,
        symbol.pframes || [],
        dictionary
      );
      var symbolClass = function (as2Context) {
        this._as2Context = as2Context;
        MovieClipClass.call(this);
      };
      symbolClass.prototype = Object.create(new MovieClip, {
        _timelineLoader: describeProperty(timelineLoader)
      });
      requirePromise.then(function () {
        promise.resolve(symbolClass);
      });
      break;
    case 'shape':
      var bounds = symbol.bounds;
      var createGraphicsData = new Function('d,r', 'return ' + symbol.data);
      var graphics = new Graphics;
      graphics.drawGraphicsData(createGraphicsData(dictionary, 0));
      var symbolClass = function () { };
      symbolClass.prototype = Object.create(new Shape, {
        _bounds: describeProperty(
          new Rectangle(bounds.x / 20, bounds.y / 20, bounds.width / 20, bounds.height / 20)
        ),
        _graphics: describeProperty(graphics)
      });
      requirePromise.then(function () {
        promise.resolve(symbolClass);
      });
      break;
    case 'label':
    case 'text':
      var proto = Object.create(symbol);
      var drawFn = new Function('d,c,r', symbol.data);
      proto.draw = (function(c, r) {
        return drawFn.call(this, dictionary, c, r);
      });
      requirePromise.then(function() {
        promise.resolve(proto);
      });
      break;
    case 'button':
      requirePromise.then(function () {
        var timelineLoader = new TimelineLoader(
          4,
          [symbol.states.up, symbol.states.over, symbol.states.down, symbol.states.hitTest],
          dictionary
        );
        promise.resolve(new ButtonPrototype(symbol, timelineLoader));
      });
      break;
    default:
      fail('unknown object type', 'define');
    }
  }),
  defineSymbol: describeMethod(function (swfTag) {
    var dictionary = this._symbols;
    var factory = null;
    var loader = this;
    var obj = null;

    switch (swfTag.type) {
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
      var pframes = [];
      var pframe = { };
      var tags = swfTag.tags;
      for (var i = 0, n = tags.length; i < n; i++) {
        var tag = tags[i];
        switch (tag.type) {
        case 'abc':
          if (!pframe.abcBlocks)
            pframe.abcBlocks = [];
          pframe.abcBlocks.push(tag.data);
          break;
        case 'actions':
          if (!pframe.actionsData) {
            pframe.initActionsData = { };
            pframe.actionsData = [];
          }
          if (tag.spriteId)
            pframe.initActionsData[tag.spriteId] = tag.actionsData;
          else
            pframe.actionsData.push(tag.actionsData);
          break;
        case 'frame':
          var repeat = 1;
          while (i < n) {
            var nextTag = tags[i + 1];
            if (nextTag.type !== 'frame')
              break;
            i++;
            repeat++;
          }
          if (repeat > 1)
            pframe.repeat = repeat;
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
            entry.id = obj.id;
            dependencies.push(obj.id);
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
        }
      }
      obj = {
        type: 'sprite',
        id: swfTag.id,
        frameCount: swfTag.frameCount,
        require: dependencies,
        pframes: pframes
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
        id: swfTag.id
      };
      break;
    default:
      fail('unknown object type', 'defineSymbol');
    }

    var id = swfTag.id - 0x4001;
    dictionary[id] = swfTag;
    Object.defineProperty(dictionary, swfTag.id, {
      get: (function(id, factory, obj) {
        var undeclared = true;
        return function () {
          if (undeclared) {
            if (!obj)
              obj = factory(dictionary[id], dictionary);
            if (obj.id)
              loader.commitData(obj);
            undeclared = false;
          }
          return obj;
        };
      })(id, factory, obj)
    });
  }),
  getSymbolByClassName: describeMethod(function (className) {
    var dictionary = this._dictionary;
    for (var id in dictionary) {
      var symbol = dictionary[id];
      if (symbol.__class__ === className)
        return symbol
    }
    return null;
  }),
  getSymbolById: describeMethod(function (id) {
    return this._dictionary[id] || null;
  }),
  load: describeMethod(function (request, context) {
    this.loadFrom(request.url);
  }),
  loadBytes: describeMethod(function (bytes, context) {
    if (!bytes.length)
      throw ArgumentError();

    this.loadFrom(bytes);
  }),
  loadFrom: describeMethod(function (input, context) {
    var loader = this;
    if (typeof window === 'undefined' && Loader.WORKERS_ENABLED) {
      var worker = new Worker(Loader.SCRIPT_PATH);
      worker.onmessage = function (evt) {
        loader.commitData(evt.data);
      };
      worker.postMessage(input);
    } else {
      if (typeof input === 'object') {
        if (input instanceof ArrayBuffer) {
          this.parseBytes(input);
        } else if (typeof FileReaderSync !== 'undefined') {
          var reader = new FileReaderSync;
          var buffer = reader.readAsArrayBuffer(input);
          loader.parseBytes(buffer);
        } else {
          var reader = new FileReader;
          reader.onload = function () {
            loader.parseBytes(this.result);
          };
          reader.readAsArrayBuffer(input);
        }
      } else {
        var xhr = new XMLHttpRequest;
        xhr.open('GET', input);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function () {
          loader.parseBytes(this.response);
        };
        xhr.send();
      }
    }
  }),
  parseBytes: describeMethod(function (bytes) {
    var dictionary = this._symbols;
    var loader = this;
    var numProcessedTags = 0;
    var pframe = { };

    SWF.parse(bytes, {
      onstart: function(result) {
        loader.commitData(result);
      },
      onprogress: function(result) {
        var tags = result.tags;

        for (var n = tags.length; numProcessedTags < n; numProcessedTags++) {
          var tag = tags[numProcessedTags];
          if ('id' in tag) {
            loader.defineSymbol(tag);
          } else if ('ref' in tag) {
            var id = tag.ref - 0x4001;
            var obj = Object.create(dictionary[id]);
            for (var prop in tag) {
              if (prop !== 'id' && prop !== 'ref')
                obj[prop] = tag[prop];
            }
            dictionary[id] = obj;
          } else {
            switch (tag.type) {
            case 'background':
              pframe.bgcolor = tag.color;
              break;
            case 'symbols':
              if (!pframe.symbols)
                pframe.symbols = [];
              pframe.symbols = pframe.symbols.concat(tag.references);
              break;
            case 'abc':
              if (!pframe.abcBlocks)
                pframe.abcBlocks = [];
              pframe.abcBlocks.push(tag.data);
              break;
            case 'actions':
              if (!pframe.actionsData) {
                pframe.initActionsData = { };
                pframe.actionsData = [];
              }
              if (tag.spriteId)
                pframe.initActionsData[tag.spriteId] = tag.actionsData;
              else
                pframe.actionsData.push(tag.actionsData);
              break;
            case 'frame':
              var repeat = 1;
              while (numProcessedTags < n) {
                var nextTag = tags[numProcessedTags + 1];
                if (!nextTag || nextTag.type !== 'frame')
                  break;
                numProcessedTags++;
                repeat++;
              }
              if (repeat > 1)
                pframe.repeat = repeat;
              pframe.type = 'pframe';
              loader.commitData(pframe);
              pframe = { };
              break;
            case 'frameLabel':
              pframe.name = tag.name;
              break;
            case 'place':
              var entry = { };
              if (tag.place) {
                var obj = dictionary[tag.objId];
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
            }
          }
        }
      },
      oncomplete: function(result) {
        loader.commitData(result);
        loader.commitData(null);
      }
    });
  }),
  removeChild: describeMethod(function (child) {
    illegalOperation();
  }),
  removeChildAt: describeMethod(function (child, index) {
    illegalOperation();
  }),
  setChildIndex: describeMethod(function (child, index) {
    illegalOperation();
  }),
  unload: describeMethod(function () {
    notImplemented();
  }),
  unloadAndStop: describeMethod(function (gc) {
    notImplemented();
  })
});
