var LoaderDefinition = (function () {
  var WORKERS_ENABLED = true;
  var LOADER_PATH = 'flash/display/Loader.js';
  var WORKER_SCRIPTS = [
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
    '../../swf/handlers.js',
    '../../swf/parser.js',
    '../../swf/bitmap.js',
    '../../swf/button.js',
    '../../swf/font.js',
    '../../swf/image.js',
    '../../swf/label.js',
    '../../swf/shape.js',
    '../../swf/sound.js',
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
      case SWF_TAG_CODE_DEFINE_SOUND:
        symbol = defineSound(swfTag, symbols);
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
          case SWF_TAG_CODE_START_SOUND:
            var startSounds = frame.startSounds || (frame.startSounds = []);
            startSounds.push(tag);
            break;
          case SWF_TAG_CODE_SOUND_STREAM_HEAD:
            try {
              soundStream = createSoundStream(tag);
              frame.soundStream = soundStream.info;
            } catch (e) {
              // ignoring if sound stream codec is not supported
              // console.error('ERROR: ' + e.message);
            }
            break;
          case SWF_TAG_CODE_SOUND_STREAM_BLOCK:
            if (soundStream) {
              frame.soundStreamBlock = soundStream.decode(tag.data);
            }
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
    function createParsingContext() {
      var depths = { };
      var frame = { type: 'frame' };
      var symbols = this._symbols;
      var tagsProcessed = 0;
      var soundStream = null;

      return {
        onstart: function(result) {
          commitData({command: 'init', result: result});
        },
        onprogress: function(result) {
          commitData({command: 'progress', result: {
            bytesLoaded: result.bytesLoaded,
            bytesTotal: result.bytesTotal
          }});

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
            case SWF_TAG_CODE_START_SOUND:
              var startSounds = frame.startSounds;
              if (!startSounds)
                frame.startSounds = startSounds = [];
              startSounds.push(tag);
              break;
            case SWF_TAG_CODE_SOUND_STREAM_HEAD:
              try {
                soundStream = createSoundStream(tag);
                frame.soundStream = soundStream.info;
              } catch (e) {
                // ignoring if sound stream codec is not supported
                // console.error('ERROR: ' + e.message);
              }
              break;
            case SWF_TAG_CODE_SOUND_STREAM_BLOCK:
              if (soundStream) {
                frame.soundStreamBlock = soundStream.decode(tag.data);
              }
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
      }
    }
    function parseBytes(bytes) {
      SWF.parse(bytes, createParsingContext());
    }

    if (typeof input === 'object') {
      if (input instanceof ArrayBuffer) {
        parseBytes(input);
      } else if ('subscribe' in input) {
        var pipe = SWF.parseAsync(createParsingContext());
        input.subscribe(pipe.push.bind(pipe));
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
      if (evt.data !== 'pipe:') {
        loadFromWorker(null, evt.data);
      }
      // progressive data loading is requested, replacing onmessage handler
      // for the following messages
      var subscription = {
        subscribe: function (callback) {
          this.callback = callback;
        }
      };
      loadFromWorker(null, subscription);
      self.onmessage = function (evt) {
        subscription.callback(evt.data.data, evt.data.progress);
      };
    };

    return;
  }

  var head = document.head;
  head.insertBefore(document.createElement('style'), head.firstChild);
  var style = document.styleSheets[0];

  var def = {
    initialize: function () {
      this._contentLoaderInfo = new flash.display.LoaderInfo;
      this._contentLoaderInfo._loader = this;
      this._dictionary = { };
      this._displayList = null;
      this._symbols = { };
      this._timeline = [];
      this._previousPromise = null;
    },

    _commitData: function (data) {
      var loaderInfo = this.contentLoaderInfo;

      switch (data.command) {
      case 'init':
        this._init(data.result);
        break;
      case 'progress':
        this._updateProgress(data.result);
        break;
      case 'complete':
        loaderInfo.dispatchEvent(new flash.events.Event("complete", false, false));
        break;
      case 'error':
        console.error('ERROR: ' + data.message);
        break;
      default:
        if (data.id)
          this._commitSymbol(data);
        else if (data.type === 'frame')
          this._commitFrame(data);
        break;
      }
    },
    _updateProgress: function (state) {
      var loaderInfo = this.contentLoaderInfo;
      loaderInfo._bytesLoaded = state.bytesLoaded || 0;
      loaderInfo._bytesTotal = state.bytesTotal || 0;
      var ProgressEventClass = avm2.systemDomain.getClass("flash.events.ProgressEvent");
      loaderInfo.dispatchEvent(ProgressEventClass.createInstance(["progress",
        false, false, loaderInfo._bytesLoaded, loaderInfo._bytesTotal]));
    },
    _buildFrame: function (displayList, timeline, promiseQueue, frame, frameNum) {
      var loader = this;
      var dictionary = loader._dictionary;
      var labelName = frame.labelName;

      displayList = Object.create(displayList);

      var depths = frame.depths;
      if (depths) {
        for (var depth in depths) {
          var cmd = depths[depth];
          if (cmd) {
            if (displayList[depth] && cmd.move) {
              var oldCmd = cmd;
              cmd = Object.create(displayList[depth]);
              for (var prop in oldCmd) {
                var val = oldCmd[prop];
                if (val)
                  cmd[prop] = val;
              }
            }

            if (cmd.symbolId) {
              var itemPromise = dictionary[cmd.symbolId];
              if (itemPromise && !itemPromise.resolved)
                promiseQueue.push(itemPromise);

              cmd = Object.create(cmd, {
                promise: { value: itemPromise }
              });
            }
          }
          displayList[depth] = cmd;
        }
      }

      var i = frame.repeat;
      while (i--)
        timeline.push(displayList);

      return displayList;
    },
    _commitFrame: function (frame) {
      var abcBlocks = frame.abcBlocks;
      var actionBlocks = frame.actionBlocks;
      var initActionBlocks = frame.initActionBlocks;
      var exports = frame.exports;
      var loader = this;
      var dictionary = loader._dictionary;
      var loaderInfo = loader.contentLoaderInfo;
      var timeline = loader._timeline;
      var frameNum = timeline.length + 1;
      var framePromise = new Promise;
      var labelName = frame.labelName;
      var prevPromise = this._previousPromise;
      this._previousPromise = framePromise;
      var promiseQueue = [prevPromise];

      this._displayList = this._buildFrame(this._displayList, timeline, promiseQueue, frame, frameNum);

      if (frame.bgcolor)
        loaderInfo._backgroundColor = frame.bgcolor;
      else
        loaderInfo._backgroundColor = { color: 0xFFFFFF, alpha: 0xFF };

      Promise.when.apply(Promise, promiseQueue).then(function () {
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

          stage._frameRate = loaderInfo._frameRate;
          stage._stageHeight = loaderInfo._height;
          stage._stageWidth = loaderInfo._width;

          assert(dictionary[0].resolved);
          var rootInfo = dictionary[0].value;
          var rootClass = avm2.applicationDomain.getClass(rootInfo.className);
          var root = rootClass.createAsSymbol({
            framesLoaded: timeline.length,
            loader: loader,
            parent: stage,
            timeline: timeline,
            totalFrames: rootInfo.props.totalFrames,
            stage: stage
          });

          stage._root = root;

          if (labelName) {
            var frameLabels = { };
            frameLabels[labelName] = {
              __class__: 'flash.display.FrameLabel',
              frame: frameNum,
              name: labelName
            };
            root.symbol.frameLabels = frameLabels;
          }

          if (!loader._isAvm2Enabled) {
            var avm1Context = loader._avm1Context;

            var as2Object = root._getAS2Object();
            avm1Context.globals._root = as2Object;
            avm1Context.globals._level0 = as2Object;

            var frameScripts = { 1: [] };

            //if (initActionBlocks) {
            //  // HACK using symbol init actions as regular action blocks, the spec has a note
            //  // "DoAction tag is not the same as specifying them in a DoInitAction tag"
            //  for (var symbolId in initActionBlocks) {
            //    root.addFrameScript(frameNum - 1, function(actionBlock) {
            //      return executeActions(actionBlock, avm1Context, avm1Context.globals._root, exports);
            //    }.bind(root, initActionBlocks[symbolId]));
            //  }
            //}

            if (actionBlocks) {
              for (var i = 0; i < actionBlocks.length; i++) {
                var block = actionBlocks[i];
                frameScripts[1].push((function(block) {
                  return function () {
                    return executeActions(block, avm1Context, this._getAS2Object(), exports);
                  };
                })(block));
              }
            }

            root.symbol.frameScripts = frameScripts;
          }

          rootClass.instance.call(root);

          loader._content = root;
        } else {
          root._framesLoaded += frame.repeat;

          if (labelName && root._frameLabels) {
            root._frameLabels[labelName] = {
              __class__: 'flash.display.FrameLabel',
              frame: frameNum,
              name: labelName
            };
          }

          if (!loader._isAvm2Enabled) {
            var avm1Context = loader._avm1Context;

            if (actionBlocks) {
              for (var i = 0; i < actionBlocks.length; i++) {
                var block = actionBlocks[i];
                root.addFrameScript(frameNum - 1, (function(block) {
                  return function () {
                    return executeActions(block, avm1Context, this._getAS2Object(), exports);
                  };
                })(block));
              }
            }
          }

        }

        if (frame.startSounds) {
          root._registerStartSounds(frameNum, frame.startSounds);
        }
        if (frame.soundStream) {
          root._initSoundStream(frame.soundStream);
        }
        if (frame.soundStreamBlock) {
          root._addSoundStreamBlock(frameNum, frame.soundStreamBlock);
        }

        if (frameNum === 1)
          loaderInfo.dispatchEvent(new flash.events.Event('init', false, false));

        framePromise.resolve(frame);
      });
    },
    _commitSymbol: function (symbol) {
      var className = 'flash.display.DisplayObject';
      var dependencies = symbol.require;
      var dictionary = this._dictionary;
      var promiseQueue = [];
      var props = { loader: this };
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
          var characters = [];
          var displayList = { };

          var depths = symbol.states[stateName];
          for (var depth in depths) {
            var cmd = depths[depth];
            var characterPromise = dictionary[cmd.symbolId];
            if (characterPromise && !characterPromise.resolved)
              promiseQueue.push(characterPromise);

            characters.push(characterPromise);
            displayList[depth] = Object.create(cmd, {
              promise: { value: characterPromise }
            });
          }

          if (characters.length === 1) {
            states[stateName] = characters[0];
          } else {
            var statePromise = new Promise;
            statePromise.resolve({
              className: 'flash.display.Sprite',
              props: {
                loader: this,
                timeline: [displayList]
              }
            });

            states[stateName] = statePromise;
          }
        }

        className = 'flash.display.SimpleButton';
        props.states = states;
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
          className = 'flash.text.Font';
        }
        break;
      case 'image':
        var img = new Image;
        var imgPromise = new Promise;
        img.onload = function () {
          if (symbol.mask) {
            // Write the symbol image into new canvas and apply
            // the symbol mask.
            var maskCanvas = document.createElement('canvas');
            maskCanvas.width = symbol.width;
            maskCanvas.height = symbol.height;
            var maskContext = maskCanvas.getContext('2d');
            maskContext.drawImage(img, 0, 0);
            var maskImageData = maskContext.getImageData(0, 0, symbol.width, symbol.height);
            var maskImageDataBytes = maskImageData.data;
            var symbolMaskBytes = symbol.mask;
            var length = maskImageData.width * maskImageData.height;
            for (var i = 0, j = 3; i < length; i++, j += 4) {
              maskImageDataBytes[j] = symbolMaskBytes[i];
            }
            maskContext.putImageData(maskImageData, 0, 0);
            // Use the result canvas as symbol image
            props.img = maskCanvas;
          }
          imgPromise.resolve();
        };
        img.src = 'data:' + symbol.mimeType + ';base64,' + btoa(symbol.data);
        promiseQueue.push(imgPromise);
        className = 'flash.display.BitmapData';
        props.img = img;
        props.width = symbol.width;
        props.height = symbol.height;
        break;
      case 'label':
        var drawFn = new Function('d,c,r', symbol.data);
        className = 'flash.text.StaticText';
        props.bbox = symbol.bbox;
        props.draw = function (c, r) {
          return drawFn.call(this, dictionary, c, r);
        };
        break;
      case 'text':
        var drawFn = new Function('d,c,r', symbol.data);
        className = 'flash.text.TextField';
        props.bbox = symbol.bbox;
        props.draw = function (c, r) {
          return drawFn.call(this, dictionary, c, r);
        };
        props.text = symbol.value;
        props.variableName = symbol.variableName;
        break;
      case 'shape':
        var createGraphicsData = new Function('d,r', 'return ' + symbol.data);
        className = symbol.morph ? 'flash.display.MorphShape' : 'flash.display.Shape';
        props.bbox = symbol.bbox;
        props.graphicsFactory = function graphicsFactory(ratio) {
          if (graphicsFactory[ratio])
            return graphicsFactory[ratio];

          var graphics = new flash.display.Graphics;
          graphics._scale = 0.05;
          graphics.drawGraphicsData(createGraphicsData(dictionary, ratio));

          graphicsFactory[ratio] = graphics;

          return graphics;
        };
        break;
      case 'sound':
        if (!symbol.pcm && !PLAY_USING_AUDIO_TAG) {
          assert(symbol.packaged.mimeType === 'audio/mpeg');

          var decodePromise = new Promise;
          MP3DecoderSession.processAll(symbol.packaged.data,
            function (props, pcm, id3tags, error) {
              props.pcm = pcm || new Uint8Array(0);
              decodePromise.resolve();
              if (error) {
                console.error('ERROR: ' + error);
              }
            }.bind(null, props));
          promiseQueue.push(decodePromise);
        }

        className = 'flash.media.Sound';
        props.sampleRate = symbol.sampleRate;
        props.channels = symbol.channels;
        props.pcm = symbol.pcm;
        props.packaged = symbol.packaged;
        break;
      case 'sprite':
        var displayList = null;
        var frameCount = symbol.frameCount;
        var frameLabels = { };
        var frameNum = 1;
        var frames = symbol.frames;
        var timeline = [];
        var startSoundRegistrations = [];
        for (var i = 0, n = frames.length; i < n; i++) {
          var frame = frames[i];
          var frameNum = timeline.length + 1;
          if (frame.labelName) {
            frameLabels[frame.labelName] = {
              __class__: 'flash.display.FrameLabel',
              frame: frameNum,
              name: frame.labelName
            };
          }

          if (frame.startSounds) {
            startSoundRegistrations[frameNum] = frame.startSounds;
            for (var j = 0; j < frame.startSounds.length; j++) {
              var itemPromise = dictionary[frame.startSounds[j].soundId];
              if (itemPromise && !itemPromise.resolved)
                promiseQueue.push(itemPromise);
            }
          }

          displayList = this._buildFrame(displayList, timeline, promiseQueue, frame, frameNum);
        }

        var frameScripts = { };
        if (!this._isAvm2Enabled) {
          if (symbol.frameScripts) {
            var avm1Context = this._avm1Context;
            var data = symbol.frameScripts;
            for (var i = 0; i < data.length; i += 2) {
                var frameNum = data[i] + 1;
                var block = data[i + 1];
                var script = (function(block) {
                  return function () {
                    return executeActions(block, avm1Context, this._getAS2Object());
                  };
                })(block);
                if (!frameScripts[frameNum])
                  frameScripts[frameNum] = [script];
                else
                  frameScripts[frameNum].push(script);
            }
          }
        }

        className = 'flash.display.MovieClip';
        props.timeline = timeline;
        props.framesLoaded = frameCount;
        props.frameLabels = frameLabels;
        props.frameScripts = frameScripts;
        props.totalFrames = frameCount;
        props.startSoundRegistrations = startSoundRegistrations;
        break;
      }

      dictionary[symbol.id] = symbolPromise;
      Promise.when.apply(Promise, promiseQueue).then(function () {
        symbolPromise.resolve({
          className: className,
          props: props
        });
      });
    },
    _init: function (info) {
      var loader = this;
      var loaderInfo = loader.contentLoaderInfo;

      loaderInfo._swfVersion = info.swfVersion;

      var bbox = info.bbox;
      loaderInfo._width = bbox.right - bbox.left;
      loaderInfo._height = bbox.bottom - bbox.top;
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
      loader._previousPromise = documentPromise;
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
        if (typeof input === 'object' && 'subscribe' in input) {
          worker.postMessage('pipe:');
          input.subscribe(function (data, progressInfo) {
            worker.postMessage({data: data, progress: progressInfo});
          });
        } else {
          worker.postMessage(input);
        }
      } else {
        loadFromWorker(this, input, context);
      }
    },
    _setup: function () {
      var loader = this;
      var stage = loader._stage;

      if (loader._isAvm2Enabled) {
        // HACK: bind the mouse through awful shenanigans.
        var mouseClass = avm2.systemDomain.getClass("flash.ui.Mouse");
        mouseClass._stage = stage;

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
      return this._contentLoaderInfo;
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
