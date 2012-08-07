function Loader() {
  if (Loader.BASE_CLASS)
    Loader.BASE_CLASS.call(this);

  this._contentLoaderInfo = null;
  this._dictionary = { };
  this._symbols = { };
}

Loader.BASE_CLASS = null;
Loader.LOADER_PATH = './Loader.js';
Loader.PLAYER_GLOBAL_PATH = '../../src/avm2/generated/playerGlobal/playerGlobal.abc';
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

  Loader.BASE_CLASS = DisplayObjectContainer;
}

Loader.prototype = Object.create(Loader.BASE_CLASS ? Loader.BASE_CLASS.prototype : null, {
  __class__: describeInternalProperty('flash.display.Loader'),

  content: describeAccessor(function () {
    return this._content;
  }),
  contentLoaderInfo: describeAccessor(function () {
    var loaderInfo = this._contentLoaderInfo;
    if (!loaderInfo) {
      loaderInfo = new LoaderInfo;
      loaderInfo._loader = this;
      this._contentLoaderInfo = loaderInfo;
    }
    return loaderInfo;
  }),
  createSymbolClass: describeMethod(function () {
    return function () {
      if (this._init)
        this._init();

      //symbolClasses[sym.name] = dictionary[sym.id];
      //if (!sym.id) {
      //  var documentClass = this._avm2.applicationDomain.getProperty(
      //    Multiname.fromSimpleName(sym.name),
      //    true, true
      //  );
      //  new (documentClass.instance)();
      //}
    };
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

    var loaderInfo = this.contentLoaderInfo;

    loaderInfo.dispatchEvent(new Event(Event.PROGRESS));

    if (!this._dictionary[0]) {
      this.setup(data);
    } else if (data) {
      if (data.id)
        this.commitSymbol(data);
      else if (data.type === 'frame')
        this.commitFrame(data);
    } else {
      loaderInfo.dispatchEvent(new Event(Event.COMPLETE));
    }
  }),
  commitFrame: describeMethod(function (frame) {
    var loader = this;
    var depths = frame.depths;
    var dictionary = loader._dictionary;
    var displayList = Object.create(null);
    var frameLabels = loader._frameLabels;
    var loaderInfo = loader.contentLoaderInfo;
    var timeline = loader._timeline;
    var frameNum = timeline.length + 1;
    var framePromise = new Promise;
    var prevPromise = frameNum > 1 ? timeline[frameNum - 2] : dictionary[0];
    var promiseQueue = [prevPromise];

    if (depths) {
      for (var depth in depths) {
        var cmd = depths[depth];
        if (cmd && cmd.symbolId) {
          var symbolPromise = dictionary[cmd.symbolId];
          if (symbolPromise && !symbolPromise.resolved)
            promiseQueue.push(symbolPromise);
        }
        displayList[depth] = cmd;
      }
    }

    Promise.when.apply(Promise, promiseQueue).then(function (val) {
      if (frame.abcBlocks) {
        var appDomain = loader._avm2.applicationDomain;
        var blocks = frame.abcBlocks;
        for (var i = 0, n = blocks.length; i < n; i++) {
          var abc = new AbcFile(blocks[i]);
          appDomain.executeAbc(abc);
        }
      }

      if (frame.exports) {
        var exports = frame.exports;
        for (var i = 0, n = exports.length; i < n; i++) {
          var asset = exports[i];
          var symbolClass = loader.getSymbolClassById(asset.symbolId);
          if (symbolClass)
            symbolClass.__class__ = asset.className;
        }
      }

      var mc = loader._content;

      if (!loader._content) {
        mc = new val(loader._avm1);

        //mc.name = '_root';
        //var globals = root._as2Context.globals;
        //globals._root = globals._level0 = root.$as2Object;

        loader._content = mc;
      } else {
        displayList.__proto__ = val;
      }

      framePromise.resolve(displayList);
      mc._framesLoaded++;

      if (frameNum === 1)
        loaderInfo.dispatchEvent(new Event(Event.INIT));
    });

    var i = frame.repeat || 1;
    while (i--)
      timeline.push(framePromise);

    if (frame.bgcolor)
      loaderInfo._backgroundColor = frame.bgcolor;

    if (frame.labelName)
      frameLabels[frame.labelName] = { frame: frameNum, name: frame.labelName };
  }),
  commitSymbol: describeMethod(function (symbol) {
    var dictionary = this._dictionary;
    var symbolPromise = new Promise;
    var promiseQueue = [];
    if (symbol.require && symbol.require.length) {
      var promiseQueue = [];
      var require = symbol.require;
      for (var i = 0, n = require.length; i < n; i++) {
        var symbolId = require[i];
        var symbolPromise = dictionary[symbolId];
        if (symbolPromise && !symbolPromise.resolved)
          promiseQueue.push(symbolPromise);
      }
    }
    var requirePromise = Promise.when.apply(Promise, promiseQueue);
    var symbolClass = this.createSymbolClass();

    switch (symbol.type) {
    case 'button':
      symbolClass.prototype = Object.create(new SimpleButton);
      break;
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
        //var ctx = (document.createElement('canvas')).getContext('2d');
        //ctx.font = '1024px "' + symbol.name + '"';
        //var defaultWidth = ctx.measureText(charset).width;
        symbolClass.prototype = Object.create(new Font);
      }
      break;
    case 'image':
      var img = new Image;
      img.src = 'data:' + symbol.mimeType + ';base64,' + btoa(symbol.data);
      symbolClass.prototype = Object.create(new BitmapData, { img: describeProperty(img) });
      requirePromise = Promise.when(requirePromise);
      img.onload = function () {
        requirePromise.resolve();
      };
      break;
    case 'label':
    case 'text':
      var drawFn = new Function('d,c,r', symbol.data);
      symbolClass.prototype = Object.create(new TextField, {
        draw: describeMethod(function (c, r) {
          return drawFn.call(this, dictionary, c, r);
        })
      });
      break;
    case 'shape':
      var baseProto = new Shape;
      var bounds = symbol.bounds;
      var createGraphicsData = new Function('d,r', 'return ' + symbol.data);
      var graphics = baseProto.graphics;
      graphics.drawGraphicsData(createGraphicsData(dictionary, 0));
      symbolClass.prototype = Object.create(baseProto, {
        graphics: describeAccessor(function () {
          throw Error();
        }),
        _bounds: describeProperty(new Rectangle(
          bounds.x / 20,
          bounds.y / 20,
          bounds.width / 20,
          bounds.height / 20
        ))
      });
      break;
    case 'sprite':
      var frameCount = symbol.frameCount;
      symbolClass.prototype = Object.create(new MovieClip, {
        graphics: describeAccessor(function () {
          throw Error();
        }),
        _children: describeLazyProperty([]),
        _timeline: describeProperty(symbol.timeline),
        _framesLoaded: describeProperty(frameCount),
        _totalFrames: describeProperty(frameCount)
      });
      break;
    }

    dictionary[symbol.id] = symbolPromise;
    requirePromise.then(function () {
      symbolPromise.resolve(symbolClass);
    });
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
      var promise = dictionary[id];
      var symbolClass = promise.value;
      if (symbolClass && symbolClass.__class__ === className)
        return symbolClass;
    }
    return null;
  }),
  getSymbolClassById: describeMethod(function (id) {
    var promise = this._dictionary[id];
    return promise.value || null;
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
      var worker = new Worker(Loader.LOADER_PATH);
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
  setup: describeMethod(function (info) {
    var loader = this;
    var loaderInfo = loader.contentLoaderInfo;

    loaderInfo._swfVersion = info.swfVersion;

    var bounds = info.bounds;
    loaderInfo._width = (bounds.xMax - bounds.xMin) / 20;
    loaderInfo._height = (bounds.yMax - bounds.yMin) / 20;

    loaderInfo._frameRate = info.frameRate;

    // TODO disable AVM1 if AVM2 is enabled
    //var avm1 = new AS2Context(info.swfVersion);
    //loader._avm1 = avm1;

    var frameLabels = loader._frameLabels || (loader._frameLabels = { });
    var timeline = loader._timeline || (loader._timeline = []);

    var documentClass = loader.createSymbolClass();
    documentClass.prototype = Object.create(new MovieClip, {
      _frameLabels: describeProperty(frameLabels),
      _timeline: describeProperty(timeline),
      _totalFrames: describeProperty(info.frameCount)
    });

    var documentPromise = new Promise;
    loader._dictionary[0] = documentPromise;

    var xhr = new XMLHttpRequest;
    xhr.open('GET', Loader.PLAYER_GLOBAL_PATH);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
      var abc = new AbcFile(new Uint8Array(this.response));
      loader._avm2.systemDomain.loadAbc(abc);

      documentPromise.resolve(documentClass);
    };
    xhr.send();
  }),
  unload: describeMethod(function () {
    notImplemented();
  }),
  unloadAndStop: describeMethod(function (gc) {
    notImplemented();
  })
});
