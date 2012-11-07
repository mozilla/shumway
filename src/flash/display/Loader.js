const LoaderDefinition = (function () {
  const WORKERS_ENABLED = true;
  const LOADER_PATH = 'flash/display/Loader.js';
  const WORKER_SCRIPTS = [
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

  // Note that loader is null when calling from inside the worker, as AVM2 is
  // only initialized on the main thread.
  function loadFromWorker(loader, input, context) {
    var symbols = { };

    var commitData;
    if (loader) {
      commitData = function (data) {
        return loader._commitData(data);
      };
    } else {
      commitData = function (data) {
        self.postMessage(data);
      };
    }

    function defineSymbol(swfTag) {
      var symbol;

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
        var depths = { };
        var frame = { type: 'frame' };
        var frames = [];
        var tags = swfTag.tags;
        var frameScripts = null;
        var frameIndex = 0;
        for (var i = 0, n = tags.length; i < n; i++) {
          var tag = tags[i];
          switch (tag.code) {
          case SWF_TAG_CODE_DO_ACTION:
            if (!frameScripts)
              frameScripts = [];
            frameScripts.push(frameIndex);
            frameScripts.push(tag.actionsData);
            break;
          // case SWF_TAG_CODE_DO_INIT_ACTION: ??
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
          case SWF_TAG_CODE_SHOW_FRAME:
            var repeat = 1;
            while (i < n) {
              var nextTag = tags[i + 1];
              if (nextTag.code !== SWF_TAG_CODE_SHOW_FRAME)
                break;
              i++;
              repeat++;
            }
            frameIndex += repeat;
            if (repeat > 1)
              frame.repeat = repeat;
            frame.depths = depths;
            frames.push(frame);
            depths = { };
            frame = { type: 'frame' };
            break;
          }
        }
        symbol = {
          type: 'sprite',
          id: swfTag.id,
          frameCount: swfTag.frameCount,
          frames: frames,
          frameScripts: frameScripts
        };
        break;
      case SWF_TAG_CODE_DEFINE_TEXT:
      case SWF_TAG_CODE_DEFINE_TEXT2:
        symbol = defineLabel(swfTag, symbols);
        break;
      }

      if (!symbol) {
        commitData({
          command: 'error',
          message: 'unknown symbol type: ' + swfTag.code
        });
        return;
      }

      symbols[swfTag.id] = symbol;
      commitData(symbol);
    }
    function parseBytes(bytes) {
      var depths = { };
      var frame = { type: 'frame' };
      var symbols = this._symbols;
      var tagsProcessed = 0;

      SWF.parse(bytes, {
        onstart: function(result) {
          commitData({command: 'init', result: result});
        },
        onprogress: function(result) {
          var tags = result.tags;
          for (var n = tags.length; tagsProcessed < n; tagsProcessed++) {
            var tag = tags[tagsProcessed];
            if ('id' in tag) {
              defineSymbol(tag);
              continue;
            }

            switch (tag.code) {
            case SWF_TAG_CODE_DO_ABC:
              var abcBlocks = frame.abcBlocks;
              if (abcBlocks)
                abcBlocks.push(tag.data);
              else
                frame.abcBlocks = [tag.data];
              break;
            case SWF_TAG_CODE_DO_ACTION:
              var actionBlocks = frame.actionBlocks;
              if (actionBlocks)
                actionBlocks.push(tag.actionsData);
              else
                frame.actionBlocks = [tag.actionsData];
              break;
            case SWF_TAG_CODE_DO_INIT_ACTION:
              var initActionBlocks = frame.initActionBlocks;
              if (!initActionBlocks) {
                frame.initActionBlocks = initActionBlocks = {};
              }
              initActionBlocks[tag.spriteId] = tag.actionsData;
              break;
            case SWF_TAG_CODE_EXPORT_ASSETS:
            case SWF_TAG_CODE_SYMBOL_CLASS:
              var exports = frame.exports;
              if (exports)
                frame.exports = exports.concat(tag.exports);
              else
                frame.exports = tag.exports.slice(0);
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
                if (!nextTag || nextTag.code !== SWF_TAG_CODE_SHOW_FRAME)
                  break;
                tagsProcessed++;
                repeat++;
              }
              if (repeat > 1)
                frame.repeat = repeat;
              frame.depths = depths;
              commitData(frame);
              depths = { };
              frame = { type: 'frame' };
              break;
            }
          }
        },
        oncomplete: function(result) {
          commitData(result);
          commitData({command: 'complete'});
        }
      });
    }

    if (typeof input === 'object') {
      if (input instanceof ArrayBuffer) {
        parseBytes(input);
      } else if (typeof FileReaderSync !== 'undefined') {
        var reader = new FileReaderSync;
        var buffer = reader.readAsArrayBuffer(input);
        parseBytes(buffer);
      } else {
        var reader = new FileReader;
        reader.onload = function () {
          parseBytes(this.result);
        };
        reader.readAsArrayBuffer(input);
      }
    } else {
      var xhr = new XMLHttpRequest;
      xhr.open('GET', input);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function () {
        parseBytes(this.response);
      };
      xhr.send();
    }
  }

  // If we're inside a worker, do the parsing work and return undefined, since
  // communication is done by posting messages to the main thread.
  if (typeof window === 'undefined') {
    importScripts.apply(null, WORKER_SCRIPTS);

    self.onmessage = function (evt) {
      loadFromWorker(null, evt.data);
    };

    return;
  }

  var head = document.head;
  head.insertBefore(document.createElement('style'), head.firstChild);
  var style = document.styleSheets[0];

  var def = {
    initialize: function () {
      this._contentLoaderInfo = null;
      this._dictionary = { };
      this._symbols = { };
      this._timeline = [];
    },

    _commitData: function (data) {
      var loaderInfo = this.contentLoaderInfo;

      loaderInfo.dispatchEvent(new flash.events.Event("progress"));

      switch (data.command) {
      case 'init':
        this._init(data.result);
        break;
      case 'complete':
        loaderInfo.dispatchEvent(new flash.events.Event("complete"));
        break;
      case 'error':
        console.log('ERROR: ' + data.message);
        break;
      default:
        if (data.id)
          this._commitSymbol(data);
        else if (data.type === 'frame')
          this._commitFrame(data);
        break;
      }
    },
    _commitFrame: function (frame) {
      var abcBlocks = frame.abcBlocks;
      var actionBlocks = frame.actionBlocks;
      var depths = frame.depths;
      var exports = frame.exports;
      var loader = this;
      var dictionary = loader._dictionary;
      var displayList = Object.create(null);
      var loaderInfo = loader.contentLoaderInfo;
      var timeline = loader._timeline;
      var frameNum = timeline.length + 1;
      var framePromise = new Promise;
      var labelName = frame.labelName;
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

      if (frame.bgcolor)
        loaderInfo._backgroundColor = frame.bgcolor;

      var i = frame.repeat || 1;
      while (i--)
        timeline.push(framePromise);

      Promise.when.apply(Promise, promiseQueue).then(function (val) {
        if (abcBlocks && loader._isAvm2Enabled) {
          var appDomain = avm2.applicationDomain;
          for (var i = 0, n = abcBlocks.length; i < n; i++) {
            var abc = new AbcFile(abcBlocks[i]);
            appDomain.executeAbc(abc);
          }
        }

        if (exports && loader._isAvm2Enabled) {
          for (var i = 0, n = exports.length; i < n; i++) {
            var asset = exports[i];
            var symbolPromise = dictionary[asset.symbolId];
            if (!symbolPromise)
              continue;
            symbolPromise.then(
              (function(symbolPromise, className) {
                return function symbolPromiseResolved() {
                  var symbolInfo = symbolPromise.value;
                  symbolInfo.className = className;
                  // Custom classes need to know they are symbols.
                  avm2.applicationDomain.getClass(className).setSymbol(symbolInfo.props);
                };
              })(symbolPromise, asset.className)
            );
          }
        }

        var root = loader._content;
        var needRootObject = !root;
        if (needRootObject) {
          var stage = loader._stage;
          var rootClass = avm2.applicationDomain.getClass(val.className);

          // FIXME constructor order
          root = rootClass.createInstance();
          root._framesLoaded = 0;
          root._parent = stage;
          root._root = root;
          root._stage = stage;
          root._timeline = timeline;
          root._totalFrames = val.props.totalFrames;

          loader._content = root;
        }

        if (!loader._isAvm2Enabled) {
          loader._initAvm1Bindings(root, needRootObject, frameNum,
                                   actionBlocks, exports);
        }

        framePromise.resolve(displayList);
        root._framesLoaded++;

        if (labelName) {
          root._frameLabels[labelName] = {
            __class__: 'flash.display.FrameLabel',
            frame: frameNum,
            name: labelName
          };
        }

        if (frameNum === 1)
          loaderInfo.dispatchEvent(new flash.events.Event('init'));
      });
    },
    _initAvm1Bindings: function(root, initializeRoot, frameNum,
                                actionBlocks, exports) {
      var avm1Context = this._avm1Context;
      if (initializeRoot) {
        var as2Object = root._getAS2Object();
        avm1Context.globals._root = as2Object;
        avm1Context.globals._level0 = as2Object;
      }
      if (exports) {
        // HACK mocking the sound clips presence
        var SoundMock = function(assets) {
          var clip = {
            start: function() {},
            setVolume: function() {}
          };
          for (var i = 0; i < assets.length; i++) {
            if (assets[i].className) {
              this[assets[i].className] = clip;
            }
          }
        };

        var as2Object = root._getAS2Object();
        as2Object.soundmc = new SoundMock(exports);
      }
      if (actionBlocks) {
        for (var i = 0; i < actionBlocks.length; i++) {
          root.addFrameScript(frameNum - 1, function(actionBlock) {
            return executeActions(actionBlock, avm1Context, avm1Context.globals._root);
          }.bind(root, actionBlocks[i]));
        }
      }
    },
    _commitSymbol: function (symbol) {
      var dependencies = symbol.require;
      var dictionary = this._dictionary;
      var promiseQueue = [];
      var symbolInfo = { };
      var symbolPromise = new Promise;

      if (dependencies && dependencies.length) {
        for (var i = 0, n = dependencies.length; i < n; i++) {
          var dependencyId = dependencies[i];
          var dependencyPromise = dictionary[dependencyId];
          if (dependencyPromise && !dependencyPromise.resolved)
            promiseQueue.push(dependencyPromise);
        }
      }

      switch (symbol.type) {
      case 'button':
        var states = { };
        for (var stateName in symbol.states) {
          var depths = symbol.states[stateName];
          var displayList = Object.create(null);
          for (var depth in depths) {
            var cmd = depths[depth];
            if (cmd && cmd.symbolId) {
              var itemPromise = dictionary[cmd.symbolId];
              if (itemPromise && !itemPromise.resolved)
                promiseQueue.push(itemPromise);
            }
            displayList[depth] = cmd;
          }

          var spritePromise = new Promise();
          spritePromise.resolve(displayList);

          var spriteInfo = {};
          // TODO must be Sprite or first item (if there is only one)
          spriteInfo.className = 'flash.display.MovieClip';
          spriteInfo.props = {
            timeline: [spritePromise],
            framesLoaded: 1,
            frameLabels: {},
            totalFrames: 1
          };
          states[stateName] = spriteInfo;
        }

        symbolInfo.className = 'flash.display.SimpleButton';
        symbolInfo.props = {
          states: states
        };
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
          symbolInfo.className = 'flash.text.Font';
        }
        break;
      case 'image':
        var img = new Image;
        var imgPromise = new Promise;
        img.onload = function () {
          imgPromise.resolve();
        };
        img.src = 'data:' + symbol.mimeType + ';base64,' + btoa(symbol.data);
        promiseQueue.push(imgPromise);
        symbolInfo.className = 'flash.display.BitmapData';
        symbolInfo.props = { img: describeProperty(img) };
        break;
      case 'label':
        var drawFn = new Function('d,c,r', symbol.data);
        symbolInfo.className = 'flash.text.StaticText';
        symbolInfo.props = {
          draw: function (c, r) {
            return drawFn.call(this, dictionary, c, r);
          }
        };
        break;
      case 'text':
        var drawFn = new Function('d,c,r', symbol.data);
        symbolInfo.className = 'flash.text.TextField';
        symbolInfo.props = {
          draw: function (c, r) {
            return drawFn.call(this, dictionary, c, r);
          },
          variableName: symbol.variableName,
          text: symbol.value
        };
        break;
      case 'shape':
        var bbox = symbol.bbox;
        var createGraphicsData = new Function('d,r', 'return ' + symbol.data);
        var graphics = new flash.display.Graphics;
        graphics._scale = 0.05;
        graphics.drawGraphicsData(createGraphicsData(dictionary, 0));

        symbolInfo.className = 'flash.display.Shape';
        symbolInfo.props = {
          bbox: {
            left: bbox.left / 20,
            top: bbox.top / 20,
            right: bbox.right / 20,
            bottom: bbox.bottom / 20
          },
          graphics: graphics
        };
        break;
      case 'sprite':
        var frameCount = symbol.frameCount;
        var frameLabels = { };
        var frames = symbol.frames;
        var timeline = [];

        for (var i = 0, n = frames.length; i < n; i++) {
          var frame = frames[i];
          var frameNum = i + 1;
          var framePromise = new Promise;
          var depths = frame.depths;

          var displayList = Object.create(null);

          if (depths) {
            for (var depth in depths) {
              var cmd = depths[depth];
              if (cmd && cmd.symbolId) {
                var itemPromise = dictionary[cmd.symbolId];
                if (itemPromise && !itemPromise.resolved)
                  promiseQueue.push(itemPromise);
              }
              displayList[depth] = cmd;
            }
          }

          if (frame.labelName) {
            frameLabels[frame.labelName] = {
              __class__: 'flash.display.FrameLabel',
              frame: frameNum,
              name: frame.labelName
            };
          }

          var j = frame.repeat || 1;
          while (j--)
            timeline.push(framePromise);

          framePromise.resolve(displayList);
        }

        symbolInfo.className = 'flash.display.MovieClip';
        symbolInfo.props = {
          timeline: timeline,
          framesLoaded: frameCount,
          frameLabels: frameLabels,
          frameScripts: symbol.frameScripts,
          totalFrames: frameCount
        };
        break;
      }

      dictionary[symbol.id] = symbolPromise;
      Promise.when.apply(Promise, promiseQueue).then(function () {
        symbolPromise.resolve(symbolInfo);
      });
    },
    _init: function (info) {
      var loader = this;

      var loaderInfo = loader.contentLoaderInfo;

      loaderInfo._swfVersion = info.swfVersion;

      var bounds = info.bounds;
      loaderInfo._width = (bounds.xMax - bounds.xMin) / 20;
      loaderInfo._height = (bounds.yMax - bounds.yMin) / 20;

      loaderInfo._frameRate = info.frameRate;

      var documentPromise = new Promise;

      var vmPromise = new Promise;
      vmPromise.then(function() {
        documentPromise.resolve({
          className: 'flash.display.MovieClip',
          props: { totalFrames: info.frameCount }
        });
      });

      loader._dictionary[0] = documentPromise;
      loader._vmPromise = vmPromise;

      loader._isAvm2Enabled = info.fileAttributes.doAbc;
      this._setup();
    },
    _loadFrom: function (input, context) {
      if (typeof window !== 'undefined' && WORKERS_ENABLED) {
        var loader = this;
        var worker = new Worker(SHUMWAY_ROOT + LOADER_PATH);
        worker.onmessage = function (evt) {
          loader._commitData(evt.data);
        };
        worker.postMessage(input);
      } else {
        loadFromWorker(this, input, context);
      }
    },
    _setup: function () {
      var loader = this;
      var stage = loader._stage;

      if (loader._isAvm2Enabled) {
        loader._vmPromise.resolve();
      } else {
        // avm1 initialization
        var loaderInfo = loader.contentLoaderInfo;
        var avm1Context = new AS2Context(loaderInfo._swfVersion);
        avm1Context.stage = stage;
        loader._avm1Context = avm1Context;

        AS2Key.$bind(stage);
        AS2Mouse.$bind(stage);

        loader._vmPromise.resolve();
      }
    },

    get contentLoaderInfo() {
      // XXX: Why is this lazily initialized?
      var loaderInfo = this._contentLoaderInfo;
      if (!loaderInfo) {
        loaderInfo = new flash.display.LoaderInfo;
        loaderInfo._loader = this;
        this._contentLoaderInfo = loaderInfo;
      }
      return loaderInfo;
    },

    close: function () {
      notImplemented();
    },
    load: function (request, context) {
      this._loadFrom(request.url);
    },
    loadBytes: function (bytes, context) {
      if (!bytes.length)
        throw ArgumentError();

      this._loadFrom(bytes);
    },
    unload: function () {
      notImplemented();
    },
    unloadAndStop: function (gc) {
      notImplemented();
    }
  };

  return def;
}).call(this);
