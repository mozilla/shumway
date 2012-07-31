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

  self.onmessage = function (evt) {
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
      self.postMessage(data);
      return;
    }

    var dictionary = this._dictionary;
    var loaderInfo = this.contentLoaderInfo;

    loaderInfo.dispatchEvent(new Event(Event.PROGRESS));

    var frameLabels = this._frameLabels || (this._frameLabels = { });
    var timeline = this._timeline || (this._timeline = []);

    if (!dictionary[0]) {
      loaderInfo._swfVersion = data.swfVersion;

      var bounds = data.bounds;
      loaderInfo._width = (bounds.xMax - bounds.xMin) / 20;
      loaderInfo._height = (bounds.yMax - bounds.yMin) / 20;

      loaderInfo._frameRate = data.frameRate;

      // TODO disable AVM1 if AVM2 is enabled
      var as2Context = new AS2Context(data.swfVersion);
      loaderInfo._as2Context = as2Context;

      var symbolClass = function (as2Context) {
        this._as2Context = as2Context;
        MovieClipClass.call(this);
      };
      symbolClass.prototype = Object.create(new MovieClip, {
        _frameLabels: describeProperty(frameLabels),
        _timeline: describeProperty(timeline),
        _totalFrames: describeProperty(data.frameCount)
      });

      dictionary[0] = symbolClass;
    } else if (data) {
      if (data.id) {
        this.commitSymbol(data);
      } else if (data.type === 'frame') {
        if (data.abcBlocks) {
          var blocks = data.abcBlocks;
          for (var i = 0, n = blocks.length; i < n; i++) {
            var block = blocks[i];
            this.avm2.applicationDomain.executeAbc(new AbcFile(block));
          }
        }

        if (data.bgcolor)
          loaderInfo._backgroundColor = data.bgcolor;

        if (data.exports) {
          var exports = data.exports;
          for (var i = 0, n = exports.length; i < n; i++) {
            var asset = exports[i];
            var symbolClass = dictionary[asset.symbolId];
            if (symbolClass)
              symbolClass.__class__ = asset.className;
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

        if (!this._content) {
          var documentClass = dictionary[0];
          var root = new documentClass(loaderInfo._as2Context);
          root.name = '_root';

          var globals = root._as2Context.globals;
          globals._root = globals._level0 = root.$as2Object;

          this._content = root;
        }

        var frameNum = timeline.length + 1;

        if (data.labelName)
          frameLabels[data.labelName] = { frame: frameNum, name: data.labelName };

        var depths = data.depths;
        var displayList = Object.create(frameNum > 1 ? timeline[frameNum - 2] : null);

        if (depths) {
          for (var depth in depths)
            displayList[depth] = depths[depth];
        }

        var i = data.repeat || 1;
        while (i--)
          timeline.push(displayList);

        if (frameNum === 1)
          loaderInfo.dispatchEvent(new Event(Event.INIT));
      }
    } else {
      loaderInfo.dispatchEvent(new Event(Event.COMPLETE));
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
    case 'button':
      var timelineLoader = new TimelineLoader(
        4,
        [symbol.states.up, symbol.states.over, symbol.states.down, symbol.states.hitTest],
        dictionary
      );
      symbolClass = function (as2Context) {
        this._as2Context = as2Context;
        ButtonPrototype.call(this, symbol, timelineLoader);
      };
      symbolClass.prototype = Object.create(new SimpleButton);
      requirePromise.then(function () {
        promise.resolve(symbolClass);
      });
      break;
    case 'font':
      symbolClass = function () { };
      symbolClass.prototype = Object.create(new Font, { });
      var charset = fromCharCode.apply(null, symbol.codes);
      if (charset) {
        style.insertRule(
          '@font-face{' +
            'font-family:"' + symbol.name + '";' +
            'src:url(data:font/opentype;base64,' + btoa(symbol.data) + ')' +
          '}',
          style.cssRules.length
        );
        //var ctx = (document.createElement('canvas')).getContext('2d');
        //ctx.font = '1024px "' + symbol.name + '"';
        //var defaultWidth = ctx.measureText(charset).width;
        requirePromise.then(function () {
          promise.resolve(symbolClass);
        });
      }
      break;
    case 'image':
      var img = new Image;
      symbolClass = function () { };
      symbolClass.prototype = Object.create(new BitmapData, { img: describeProperty(img) });
      img.src = 'data:' + symbol.mimeType + ';base64,' + btoa(symbol.data);
      img.onload = function () {
        requirePromise.then(function () {
          promise.resolve(symbolClass);
        });
      };
      break;
    case 'label':
    case 'text':
      var drawFn = new Function('d,c,r', symbol.data);
      symbolClass = function () { };
      symbolClass.prototype = Object.create(new TextField, {
        draw: describeMethod(function (c, r) {
          return drawFn.call(this, dictionary, c, r);
        })
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
    case 'sprite':
      var symbolClass = function (as2Context) {
        this._as2Context = as2Context;
        MovieClipClass.call(this);
      };
      symbolClass.prototype = Object.create(new MovieClip, {
        _timeline: symbol.timeline,
        _totalFrames: describeProperty(symbol.frameCount)
      });
      requirePromise.then(function () {
        promise.resolve(symbolClass);
      });
      break;
    }
  }),
  defineSymbol: describeMethod(function (swfTag) {
    var loader = this;
    var symbol;
    var symbols = this._symbols;

    switch (swfTag.code) {
    case SWF_TAG_CODE_DEFINE_BITS:
    case SWF_TAG_CODE_DEFINE_BITS_JPEG2:
    case SWF_TAG_CODE_DEFINE_BITS_JPEG3:
    case SWF_TAG_CODE_DEFINE_BITS_JPEG4:
    case SWF_TAG_CODE_JPEG_TABLES:
      symbol = defineImage(swfTag, symbols);
      break;
    case SWF_TAG_CODE_DEFINE_BITS_LOSSLESS:
    case SWF_TAG_CODE_DEFINE_BITS_LOSSLESS2:
      symbol = defineBitmap(swfTag, symbols);
      break;
    case SWF_TAG_CODE_DEFINE_BUTTON:
    case SWF_TAG_CODE_DEFINE_BUTTON2:
      symbol = defineButton(swfTag, symbols);
      break;
    case SWF_TAG_CODE_DEFINE_EDIT_TEXT:
      symbol = defineText(swfTag, symbols);
      break;
    case SWF_TAG_CODE_DEFINE_FONT:
    case SWF_TAG_CODE_DEFINE_FONT2:
    case SWF_TAG_CODE_DEFINE_FONT3:
    case SWF_TAG_CODE_DEFINE_FONT4:
      symbol = defineFont(swfTag, symbols);
      break;
    case SWF_TAG_CODE_DEFINE_MORPH_SHAPE:
    case SWF_TAG_CODE_DEFINE_MORPH_SHAPE2:
    case SWF_TAG_CODE_DEFINE_SHAPE:
    case SWF_TAG_CODE_DEFINE_SHAPE2:
    case SWF_TAG_CODE_DEFINE_SHAPE3:
    case SWF_TAG_CODE_DEFINE_SHAPE4:
      symbol = defineShape(swfTag, symbols);
      break;
    case SWF_TAG_CODE_DEFINE_SPRITE:
      var dependencies = [];
      var displayList = { };
      var frame = { type: 'frame' };
      var tags = swfTag.tags;
      var timeline = [];
      for (var i = 0, n = tags.length; i < n; i++) {
        var tag = tags[i];
        switch (tag.code) {
        case SWF_TAG_CODE_DO_ABC:
          if (!frame.abcBlocks)
            frame.abcBlocks = [];
          frame.abcBlocks.push(tag.data);
          break;
        case SWF_TAG_CODE_DO_ACTION:
        case SWF_TAG_CODE_DO_INIT_ACTION:
          if (!frame.actionsData) {
            frame.initActionsData = { };
            frame.actionsData = [];
          }
          if (tag.spriteId)
            frame.initActionsData[tag.spriteId] = tag.actionsData;
          else
            frame.actionsData.push(tag.actionsData);
          break;
        case SWF_TAG_CODE_FRAME_LABEL:
          frame.labelName = tag.name;
          break;
        case SWF_TAG_CODE_PLACE_OBJECT:
        case SWF_TAG_CODE_PLACE_OBJECT2:
        case SWF_TAG_CODE_PLACE_OBJECT3:
          dependencies.push(tag.symbolId);
          displayList[tag.depth] = tag;
          break;
        case SWF_TAG_CODE_REMOVE_OBJECT:
        case SWF_TAG_CODE_REMOVE_OBJECT2:
          displayList[tag.depth] = null;
          break;
        case SWF_TAG_CODE_SHOW_FRAME:
          var repeat = 1;
          while (i < n) {
            var nextTag = tags[i + 1];
            if (nextTag.type !== 'frame')
              break;
            i++;
            repeat++;
          }
          if (repeat > 1)
            frame.repeat = repeat;
          frame.displayList = displayList;
          timeline.push(frame);
          displayList = Object.create(displayList);
          frame = { type: 'frame' };
          break;
        }
      }
      symbol = {
        type: 'sprite',
        id: swfTag.id,
        frameCount: swfTag.frameCount,
        require: dependencies,
        timeline: timeline
      };
      break;
    case SWF_TAG_CODE_DEFINE_TEXT:
    case SWF_TAG_CODE_DEFINE_TEXT2:
      symbol = defineLabel(swfTag, symbols);
      break;
    }

    symbols[swfTag.id] = symbol;
    loader.commitData(symbol);
  }),
  getSymbolClassByName: describeMethod(function (className) {
    var dictionary = this._dictionary;
    for (var id in dictionary) {
      var symbol = dictionary[id];
      if (symbol.__class__ === className)
        return symbol
    }
    return null;
  }),
  getSymbolClassById: describeMethod(function (id) {
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
      return;
    }

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
  }),
  parseBytes: describeMethod(function (bytes) {
    var depths = { };
    var loader = this;
    var frame = { type: 'frame' };
    var symbols = this._symbols;
    var tagsProcessed = 0;

    SWF.parse(bytes, {
      onstart: function(result) {
        loader.commitData(result);
      },
      onprogress: function(result) {
        var tags = result.tags;
        for (var n = tags.length; tagsProcessed < n; tagsProcessed++) {
          var tag = tags[tagsProcessed];
          if ('id' in tag) {
            loader.defineSymbol(tag);
            continue;
          }

          switch (tag.code) {
          case SWF_TAG_CODE_DO_ABC:
            if (!frame.abcBlocks)
              frame.abcBlocks = [];
            frame.abcBlocks.push(tag.data);
            break;
          case SWF_TAG_CODE_DO_ACTION:
          case SWF_TAG_CODE_DO_INIT_ACTION:
            if (!frame.actionsData) {
              frame.initActionsData = { };
              frame.actionsData = [];
            }
            if (tag.spriteId)
              frame.initActionsData[tag.spriteId] = tag.actionsData;
            else
              frame.actionsData.push(tag.actionsData);
            break;
          case SWF_TAG_CODE_EXPORT_ASSETS:
          case SWF_TAG_CODE_SYMBOL_CLASS:
            if (!frame.exports)
              frame.exports = [];
            frame.exports = frame.exports.concat(tag.exports);
            break;
          case SWF_TAG_CODE_FRAME_LABEL:
            frame.labelName = tag.name;
            break;
          case SWF_TAG_CODE_PLACE_OBJECT:
          case SWF_TAG_CODE_PLACE_OBJECT2:
          case SWF_TAG_CODE_PLACE_OBJECT3:
            depths[tag.depth] = tag;
            break;
          case SWF_TAG_CODE_REMOVE_OBJECT:
          case SWF_TAG_CODE_REMOVE_OBJECT2:
            depths[tag.depth] = null;
            break;
          case SWF_TAG_CODE_SET_BACKGROUND_COLOR:
            frame.bgcolor = tag.color;
            break;
          case SWF_TAG_CODE_SHOW_FRAME:
            var repeat = 1;
            while (tagsProcessed < n) {
              var nextTag = tags[tagsProcessed + 1];
              if (!nextTag || nextTag.type !== 'frame')
                break;
              tagsProcessed++;
              repeat++;
            }
            if (repeat > 1)
              frame.repeat = repeat;
            frame.depths = depths;
            loader.commitData(frame);
            depths = { };
            frame = { type: 'frame' };
            break;
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
