/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*global self, ResourceLoader, Image, Worker, btoa, URL, FileLoadingService,
         Promise, AbcFile, SHUMWAY_ROOT, TelemetryService,
         avm1lib, AS2Context, executeActions,
         MP3DecoderSession, PLAY_USING_AUDIO_TAG,
         cloneObject, createEmptyObject, fromCharCode,
         isNullOrUndefined, sortNumeric */
// Ignoring "The Function constructor is a form of eval."
/*jshint -W054 */
// TODO: Investigate "Don't make functions within a loop."
/*jshint -W083 */

var $RELEASE = false;

var LoaderDefinition = (function () {
  var WORKERS_ENABLED = true;
  var LOADER_PATH = $RELEASE ? 'shumway-worker.js' : 'swf/resourceloader.js';

  var head = document.head;
  head.insertBefore(document.createElement('style'), head.firstChild);
  var style = document.styleSheets[0];

  var def = {
    __class__: 'flash.display.Loader',

    initialize: function () {
      this._contentLoaderInfo = new flash.display.LoaderInfo();
      this._contentLoaderInfo._loader = this;
      this._dictionary = { };
      this._displayList = null;
      this._timeline = [];
      this._lastPromise = null;
      this._uncaughtErrorEvents = null;
      this._worker = null;
    },
    _commitData: function (data) {
      switch (data.command) {
      case 'init':
        this._init(data.result);
        break;
      case 'progress':
        this._updateProgress(data.result);
        break;
      case 'complete':
        var frameConstructed = new Promise();
        avm2.systemDomain.onMessage.register('frameConstructed', function waitForFrame(type) {
          if (type === 'frameConstructed') {
            frameConstructed.resolve();
            avm2.systemDomain.onMessage.unregister('frameConstructed', waitForFrame);
          }
        });
        Promise.when(frameConstructed, this._lastPromise).then(function () {
          this._content._complete = true;
          this._contentLoaderInfo._dispatchEvent("complete");
        }.bind(this));

        var stats = data.stats;
        if (stats) {
          TelemetryService.reportTelemetry(stats);
        }

        this._worker && this._worker.terminate();
        break;
      case 'empty':
        this._lastPromise = new Promise();
        this._lastPromise.resolve();
        break;
      case 'error':
        this._contentLoaderInfo._dispatchEvent("ioError", flash.events.IOErrorEvent);
        break;
      default:
        //TODO: fix special-casing. Might have to move document class out of dictionary[0]
        if (data.id === 0)
          break;
        if (data.isSymbol)
          this._commitSymbol(data);
        else if (data.type === 'frame')
          this._commitFrame(data);
        else if (data.type === 'image')
          this._commitImage(data);
        break;
      }
    },
    _updateProgress: function (state) {
      var loaderInfo = this._contentLoaderInfo;
      loaderInfo._bytesLoaded = state.bytesLoaded || 0;
      loaderInfo._bytesTotal = state.bytesTotal || 0;
      var event = new flash.events.ProgressEvent("progress", false, false,
                                                 loaderInfo._bytesLoaded,
                                                 loaderInfo._bytesTotal);
      loaderInfo._dispatchEvent(event);
    },
    _buildFrame: function (currentDisplayList, timeline, promiseQueue, frame, frameNum) {
      var loader = this;
      var dictionary = loader._dictionary;

      var displayList = { };
      var depths = [];

      var cmds = frame.depths;

      if (currentDisplayList) {
        var currentDepths = currentDisplayList.depths;
        for (var i = 0; i < currentDepths.length; i++) {
          var depth = currentDepths[i];

          if (cmds[depth] === null) {
            continue;
          }

          displayList[depth] = currentDisplayList[depth];
          depths.push(depth);
        }
      }

      for (var depth in cmds) {
        var cmd = cmds[depth];

        if (!cmd) {
          continue;
        }

        if (cmd.move) {
          var oldCmd = cmd;
          cmd = cloneObject(currentDisplayList[depth]);
          for (var prop in oldCmd) {
            var val = oldCmd[prop];
            if (val) {
              cmd[prop] = val;
            }
          }
        }

        if (cmd.symbolId) {
          var itemPromise = dictionary[cmd.symbolId];
          if (itemPromise && !itemPromise.resolved) {
            promiseQueue.push(itemPromise);
          }

          cmd = cloneObject(cmd);
          cmd.promise = itemPromise;
        }

        if (!displayList[depth]) {
          depths.push(depth);
        }

        displayList[depth] = cmd;
      }

      depths.sort(sortNumeric);

      displayList.depths = depths;

      var i = frame.repeat;
      while (i--) {
        timeline.push(displayList);
      }

      return displayList;
    },
    _commitFrame: function (frame) {
      var abcBlocks = frame.abcBlocks;
      var actionBlocks = frame.actionBlocks;
      var initActionBlocks = frame.initActionBlocks;
      var exports = frame.exports;
      var symbolClasses = frame.symbolClasses;
      var sceneData = frame.sceneData;
      var loader = this;
      var dictionary = loader._dictionary;
      var loaderInfo = loader._contentLoaderInfo;
      var timeline = loader._timeline;
      var frameNum = timeline.length + 1;
      var framePromise = new Promise();
      var labelName = frame.labelName;
      var prevPromise = this._lastPromise;
      this._lastPromise = framePromise;
      var promiseQueue = [prevPromise];

      this._displayList = this._buildFrame(this._displayList, timeline, promiseQueue, frame, frameNum);

      if (frame.bgcolor)
        loaderInfo._backgroundColor = frame.bgcolor;
      else if (isNullOrUndefined(loaderInfo._backgroundColor))
        loaderInfo._backgroundColor = { red: 255, green: 255, blue: 255, alpha: 255 };

      Promise.when.apply(Promise, promiseQueue).then(function () {
        if (abcBlocks && loader._isAvm2Enabled) {
          var appDomain = avm2.applicationDomain;
          for (var i = 0, n = abcBlocks.length; i < n; i++) {
            var abc = new AbcFile(abcBlocks[i].data, "abc_block_" + i);
            if (abcBlocks[i].flags) {
              // kDoAbcLazyInitializeFlag = 1 Indicates that the ABC block should not be executed
              // immediately.
              appDomain.loadAbc(abc);
            } else {
              appDomain.executeAbc(abc);
            }
          }
        }

        if (symbolClasses && loader._isAvm2Enabled) {
          var symbolClassesPromises = [];
          for (var i = 0, n = symbolClasses.length; i < n; i++) {
            var asset = symbolClasses[i];
            var symbolPromise = dictionary[asset.symbolId];
            if (!symbolPromise)
              continue;
            symbolPromise.then(
              (function(symbolPromise, className) {
                return function symbolPromiseResolved() {
                  var symbolInfo = symbolPromise.value;
                  symbolInfo.className = className;
                  avm2.applicationDomain.getClass(className).setSymbol(symbolInfo.props);
                };
              })(symbolPromise, asset.className)
            );
            symbolClassesPromises.push(symbolPromise);
          }
          return Promise.when.apply(Promise, symbolClassesPromises);
        }
        if (exports && !loader._isAvm2Enabled) {
          var exportPromises = [];
          for (var i = 0, n = exports.length; i < n; i++) {
            var asset = exports[i];
            var symbolPromise = dictionary[asset.symbolId];
            if (!symbolPromise)
              continue;
            symbolPromise.then(
              (function(symbolPromise, className) {
                return function symbolPromiseResolved() {
                  var symbolInfo = symbolPromise.value;
                  loader._avm1Context.addAsset(className, symbolInfo.props);
                };
              })(symbolPromise, asset.className)
            );
            exportPromises.push(symbolPromise);
          }
          return Promise.when.apply(Promise, exportPromises);
        }
     }).then(function () {
        var root = loader._content;
        var labelMap;

        if (!root) {
          var parent = loader._parent;

          release || assert(dictionary[0].resolved);
          var rootInfo = dictionary[0].value;
          var rootClass = avm2.applicationDomain.getClass(rootInfo.className);
          root = rootClass.createAsSymbol({
            framesLoaded: timeline.length,
            loader: loader,
            parent: parent || loader,
            index: parent ? 0 : -1,
            level: parent ? 0 : -1,
            timeline: timeline,
            totalFrames: rootInfo.props.totalFrames,
            stage: loader._stage,
            complete: frame.complete
          });

          var isRootMovie = parent && parent == loader._stage && loader._stage._children.length === 0;
          if (isRootMovie) {
            parent._frameRate = loaderInfo._frameRate;
            parent._stageHeight = loaderInfo._height;
            parent._stageWidth = loaderInfo._width;
            parent._root = root;
            parent._setup();
          } else {
            loader._children.push(root);
          }

          var labels;
          labelMap = root.symbol.labelMap = createEmptyObject();
          if (sceneData) {
            var scenes = [];
            var startFrame;
            var endFrame = root.symbol.totalFrames - 1;
            var sd = sceneData.scenes;
            var ld = sceneData.labels;
            var i = sd.length;
            while (i--) {
              var s = sd[i];
              startFrame = s.offset;
              labels = [];
              var j = ld.length;
              while (j--) {
                var lbl = ld[j];
                if (lbl.frame >= startFrame && lbl.frame <= endFrame) {
                  labelMap[lbl.name] = lbl.frame + 1;
                  labels.unshift(new flash.display.FrameLabel(lbl.name, lbl.frame - startFrame + 1));
                }
              }
              var scene = new flash.display.Scene(s.name, labels, endFrame - startFrame + 1);
              scene._startFrame = startFrame + 1;
              scene._endFrame = endFrame + 1;
              scenes.unshift(scene);
              endFrame = startFrame - 1;
            }
            root.symbol.scenes = scenes;
          } else {
            labels = [];
            if (labelName) {
              labelMap[labelName] = frameNum;
              labels.push(new flash.display.FrameLabel(labelName, frameNum));
            }
            var scene = new flash.display.Scene("Scene 1", labels, root.symbol.totalFrames);
            scene._startFrame = 1;
            scene._endFrame = root.symbol.totalFrames;
            root.symbol.scenes = [scene];
          }

          if (!loader._isAvm2Enabled) {
            var avm1Context = loader._avm1Context;

            // Finding movie top root
            var _root = root;
            if (parent && parent !== loader._stage) {
              var parentLoader = parent.loaderInfo._loader;
              while (parentLoader._parent && parentLoader._parent !== loader._stage) {
                parentLoader = parentLoader._parent.loaderInfo._loader;
              }
              if (parentLoader._isAvm2Enabled) {
                somewhatImplemented('AVM1Movie');
                this._worker && this._worker.terminate();
                return;
              }
              _root = parentLoader._content;
            }

            var as2Object = _root._getAS2Object();
            avm1Context.globals.asSetPublicProperty('_root', as2Object);
            avm1Context.globals.asSetPublicProperty('_level0', as2Object);
            avm1Context.globals.asSetPublicProperty('_level1', as2Object);

            // transfer parameters
            var parameters = loader.loaderInfo._parameters;
            for (var paramName in parameters) {
              if (!(paramName in as2Object)) { // not present yet
                as2Object[paramName] = parameters[paramName];
              }
            }
          }

          if (loader._stage) {
            loader._stage._children[0] = root;
          }

          rootClass.instanceConstructor.call(root);

          loader._content = root;
        } else {
          root._framesLoaded = timeline.length;

          if (labelName && root._labelMap) {
            if (root._labelMap[labelName] === undefined) {
              root._labelMap[labelName] = frameNum;
              for (var i = 0, n = root.symbol.scenes.length; i < n; i++) {
                var scene = root.symbol.scenes[i];
                if (frameNum >= scene._startFrame && frameNum <= scene._endFrame) {
                  scene.labels.push(new flash.display.FrameLabel(labelName, frameNum - scene._startFrame));
                  break;
                }
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

        if (!loader._isAvm2Enabled) {
          var avm1Context = loader._avm1Context;

          if (initActionBlocks) {
            // HACK using symbol init actions as regular action blocks, the spec has a note
            // "DoAction tag is not the same as specifying them in a DoInitAction tag"
            for (var i = 0; i < initActionBlocks.length; i++) {
              var spriteId = initActionBlocks[i].spriteId;
              var actionsData = initActionBlocks[i].actionsData;
              root.addFrameScript(frameNum - 1, function(actionsData, spriteId, state) {
                if (state.executed) return;
                state.executed = true;
                return executeActions(actionsData, avm1Context, this._getAS2Object());
              }.bind(root, actionsData, spriteId, {executed: false}));
            }
          }

          if (actionBlocks) {
            for (var i = 0; i < actionBlocks.length; i++) {
              var block = actionBlocks[i];
              root.addFrameScript(frameNum - 1, (function(block) {
                return function () {
                  return executeActions(block, avm1Context, this._getAS2Object());
                };
              })(block));
            }
          }
        }

        if (frameNum === 1)
          loaderInfo._dispatchEvent(new flash.events.Event('init', false, false));

        framePromise.resolve(frame);
      });
    },
    _commitImage : function (imageInfo) {
      var loader = this;
      var imgPromise = this._lastPromise = new Promise();
      var img = new Image();
      imageInfo.props.img = img;
      img.onload = function() {
        var props = imageInfo.props;
        props.parent = loader._parent;
        props.stage = loader._stage;
        props.skipCopyToCanvas = true;

        var Bitmap = avm2.systemDomain.getClass("flash.display.Bitmap");
        var BitmapData = avm2.systemDomain.getClass("flash.display.BitmapData");
        var bitmapData = BitmapData.createAsSymbol(props);
        BitmapData.instanceConstructor.call(bitmapData, 0, 0, true, 0xffffffff);
        var image = Bitmap.createAsSymbol(bitmapData);
        loader._children.push(image);
        Bitmap.instanceConstructor.call(image, bitmapData);
        image._parent = loader;
        loader._content = image;
        imgPromise.resolve(imageInfo);
        loader._contentLoaderInfo._dispatchEvent("init");
      };
      img.src = URL.createObjectURL(imageInfo.data);
      delete imageInfo.data;
    },
    _commitSymbol: function (symbol) {
      var dictionary = this._dictionary;
      if ('updates' in symbol) {
        dictionary[symbol.id].then(function (s) {
          for (var i in symbol.updates) {
            s.props[i] = symbol.updates[i];
          }
        });
        return;
      }

      var className = 'flash.display.DisplayObject';
      var dependencies = symbol.require;
      var promiseQueue = [];
      var props = { symbolId: symbol.id, loader: this };
      var symbolPromise = new Promise();

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

          var state = symbol.states[stateName];
          var depths = Object.keys(state);

          for (var i = 0; i < depths.length; i++) {
            var depth = depths[i];
            var cmd = state[depth];
            var characterPromise = dictionary[cmd.symbolId];
            if (characterPromise && !characterPromise.resolved)
              promiseQueue.push(characterPromise);

            characters.push(characterPromise);
            displayList[depth] = Object.create(cmd, {
              promise: { value: characterPromise }
            });
          }

          depths.sort(sortNumeric);

          displayList.depths = depths;

          var statePromise = new Promise();
          statePromise.resolve({
            className: 'flash.display.Sprite',
            props: {
              loader: this,
              timeline: [displayList]
            }
          });

          states[stateName] = statePromise;
        }

        className = 'flash.display.SimpleButton';
        props.states = states;
        props.buttonActions = symbol.buttonActions;
        break;
      case 'font':
        var charset = fromCharCode.apply(null, symbol.codes);
        if (charset) {
          style.insertRule(
            '@font-face{' +
              'font-family:"' + symbol.uniqueName + '";' +
              'src:url(data:font/opentype;base64,' + btoa(symbol.data) + ')' +
              '}',
            style.cssRules.length
          );

          // HACK non-Gecko browsers need time to load fonts
          if (!/Mozilla\/5.0.*?rv:(\d+).*? Gecko/.test(window.navigator.userAgent)) {
            var testDiv = document.createElement('div');
            testDiv.setAttribute('style', 'position: absolute; top: 0; right: 0;' +
                                          'visibility: hidden; z-index: -500;' +
                                          'font-family:"' + symbol.uniqueName + '";');
            testDiv.textContent = 'font test';
            document.body.appendChild(testDiv);

            var fontPromise = new Promise();
            setTimeout(function () {
              fontPromise.resolve();
              document.body.removeChild(testDiv);
            }, 200);
            promiseQueue.push(fontPromise);
          }
        }
        className = 'flash.text.Font';
        props.name = symbol.name;
        props.uniqueName = symbol.uniqueName;
        props.charset = symbol.charset;
        props.bold = symbol.bold;
        props.italic = symbol.italic;
        props.metrics = symbol.metrics;
        this._registerFont(className, props);
        break;
      case 'image':
        var img = new Image();
        var imgPromise = new Promise();
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
        img.src = URL.createObjectURL(symbol.data);
        promiseQueue.push(imgPromise);
        className = 'flash.display.Bitmap';
        props.img = img;
        props.width = symbol.width;
        props.height = symbol.height;
        break;
      case 'label':
        var drawFn = new Function('c,r,ct', symbol.data);
        className = 'flash.text.StaticText';
        props.bbox = symbol.bbox;
        props.draw = drawFn;
        break;
      case 'text':
        props.bbox = symbol.bbox;
        props.html = symbol.html;
        if (symbol.type === 'label') {
          className = 'flash.text.StaticText';
        } else {
          className = 'flash.text.TextField';
          props.tag = symbol.tag;
          props.variableName = symbol.variableName;
        }
        break;
      case 'shape':
        className = symbol.morph ?
                    'flash.display.MorphShape' : 'flash.display.Shape';
        props.bbox = symbol.bbox;
        props.strokeBbox = symbol.strokeBbox;
        props.paths = symbol.paths;
        props.dictionary = dictionary;
        break;
      case 'sound':
        if (!symbol.pcm && !PLAY_USING_AUDIO_TAG) {
          assert(symbol.packaged.mimeType === 'audio/mpeg');

          var decodePromise = new Promise();
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
      case 'binary':
        props.data = symbol.data;
        break;
      case 'sprite':
        var displayList = null;
        var frameCount = symbol.frameCount;
        var labelMap = { };
        var frameNum = 1;
        var frames = symbol.frames;
        var timeline = [];
        var startSoundRegistrations = [];
        for (var i = 0, n = frames.length; i < n; i++) {
          var frame = frames[i];
          var frameNum = timeline.length + 1;
          if (frame.labelName) {
            labelMap[frame.labelName] = frameNum;
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
            var data = symbol.frameScripts;
            for (var i = 0; i < data.length; i += 2) {
                var frameNum = data[i] + 1;
                var block = data[i + 1];
                var script = (function(block, loader) {
                  return function () {
                    var avm1Context = loader._avm1Context;
                    return executeActions(block, avm1Context, this._getAS2Object());
                  };
                })(block, this);
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
        props.labelMap = labelMap;
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
    _registerFont: function (className, props) {
      this._vmPromise.then(function () {
        var fontClass = avm2.applicationDomain.getClass(className);
        var font = fontClass.createAsSymbol(props);
        fontClass.instanceConstructor.call(font);
      });
    },
    _init: function (info) {
      var loader = this;
      var loaderInfo = loader._contentLoaderInfo;

      loaderInfo._swfVersion = info.swfVersion;

      var bbox = info.bbox;
      loaderInfo._width = bbox.xMax - bbox.xMin;
      loaderInfo._height = bbox.yMax - bbox.yMin;
      loaderInfo._frameRate = info.frameRate;

      var documentPromise = new Promise();

      var vmPromise = new Promise();
      vmPromise.then(function() {
        documentPromise.resolve({
          className: 'flash.display.MovieClip',
          props: { totalFrames: info.frameCount }
        });
      });

      loader._dictionary[0] = documentPromise;
      loader._lastPromise = documentPromise;
      loader._vmPromise = vmPromise;

      loader._isAvm2Enabled = info.fileAttributes.doAbc;
      this._setup();
    },
    _load: function (request, checkPolicyFile, applicationDomain,
                     securityDomain, deblockingFilter)
    {
      if (flash.net.URLRequest.class.isInstanceOf(request)) {
        this._contentLoaderInfo._url = request._url;
      }
      var worker;
      if (WORKERS_ENABLED) {
        worker = new Worker(SHUMWAY_ROOT + LOADER_PATH);
      } else {
        worker = new ResourceLoader(window);
      }
      var loader = this;
      loader._worker = worker;
      worker.onmessage = function (evt) {
        loader._commitData(evt.data);
      };
      if (flash.net.URLRequest.class.isInstanceOf(request)) {
        var session = FileLoadingService.createSession();
        session.onprogress = function (data, progress) {
          worker.postMessage({data: data, progress: progress});
        };
        session.onerror = function (error) {
          loader._commitData({command: 'error', error: error});
        };
        session.onopen = function () {
          worker.postMessage('pipe:');
        };
        session.onclose = function () {
          worker.postMessage({data: null});
        };
        session.open(request._toFileRequest());
      } else {
        worker.postMessage(request);
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
        return;
      }

      if (!avm2.loadAVM1) {
        loader._vmPromise.reject('AVM1 loader is not found');
        return;
      }
      var loaded = function () {
        // avm1 initialization
        var loaderInfo = loader._contentLoaderInfo;
        var avm1Context = new AS2Context(loaderInfo._swfVersion);
        avm1Context.stage = stage;
        loader._avm1Context = avm1Context;

        avm1lib.AS2Key.class.$bind(stage);
        avm1lib.AS2Mouse.class.$bind(stage);

        stage._addEventListener('frameConstructed',
                                avm1Context.flushPendingScripts.bind(avm1Context),
                                false,
                                Number.MAX_VALUE);
        loader._vmPromise.resolve();
      };
      if (avm2.isAVM1Loaded) {
        loaded();
      } else {
        avm2.isAVM1Loaded = true;
        avm2.loadAVM1(loaded);
      }
    },
    get contentLoaderInfo() {
        return this._contentLoaderInfo;
    },
    get content() {
      somewhatImplemented("Loader.content");
      return this._content;
    }
  };

  def.__glue__ = {
    native: {
      instance: {
        content: Object.getOwnPropertyDescriptor(def, 'content'),
        contentLoaderInfo: Object.getOwnPropertyDescriptor(def, 'contentLoaderInfo'),
        _getJPEGLoaderContextdeblockingfilter: function(context) {
          return 0; //TODO: implement
        },
        _load: def._load,
        _loadBytes: function _loadBytes(bytes, checkPolicyFile, applicationDomain, securityDomain, requestedContentParent, parameters, deblockingFilter, allowLoadBytesCodeExecution, imageDecodingPolicy) { // (bytes:ByteArray, checkPolicyFile:Boolean, applicationDomain:ApplicationDomain, securityDomain:SecurityDomain, requestedContentParent:DisplayObjectContainer, parameters:Object, deblockingFilter:Number, allowLoadBytesCodeExecution:Boolean, imageDecodingPolicy:String) -> void
          def._load.call(this, bytes.a, checkPolicyFile, applicationDomain, securityDomain);
        },
        _unload: function _unload(halt, gc) { // (halt:Boolean, gc:Boolean) -> void
          somewhatImplemented("Loader._unload, do we even need to do anything here?");
        },
        _close: function _close() { // (void) -> void
          somewhatImplemented("Loader._close");
        },
        _getUncaughtErrorEvents: function _getUncaughtErrorEvents() { // (void) -> UncaughtErrorEvents
          somewhatImplemented("Loader._getUncaughtErrorEvents");
          return this._uncaughtErrorEvents;
        },
        _setUncaughtErrorEvents: function _setUncaughtErrorEvents(value) { // (value:UncaughtErrorEvents) -> void
          somewhatImplemented("Loader._setUncaughtErrorEvents");
          this._uncaughtErrorEvents = value;
        }
      }
    }
  };

  return def;
}).call(this);
