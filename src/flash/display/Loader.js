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
         Promise, AVM2, AbcFile, SHUMWAY_ROOT, TelemetryService,
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

  var def = {
    __class__: 'flash.display.Loader',

    initialize: function () {
      this._contentLoaderInfo = new flash.display.LoaderInfo();
      this._contentLoaderInfo._loader = this;
      this._dictionary = { };
      this._displayList = null;
      this._dependencies = [];
      this._timeline = [];
      this._vmPromise = null;
      this._lastPromise = null;
      this._uncaughtErrorEvents = null;
      this._worker = null;

      var abc = AVM2.currentAbc();
      if (abc) {
        this._contentLoaderInfo._loaderURL = abc.env.loader._contentLoaderInfo._url;
      }
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
        var frameConstructed = new Promise(function (resolve) {
          avm2.systemDomain.onMessage.register('frameConstructed', function waitForFrame(type) {
            if (type === 'frameConstructed') {
              resolve();
              avm2.systemDomain.onMessage.unregister('frameConstructed', waitForFrame);
            }
          });
        });
        Promise.all([frameConstructed, this._lastPromise]).then(function () {
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
        this._lastPromise = Promise.resolve();
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
    _buildFrame: function (currentDisplayList, timeline, frame, resolve) {
      var loader = this;
      var dictionary = loader._dictionary;

      var displayList = { };
      var depths = [];
      var dependencies = this._dependencies;

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
          cmd = cloneObject(cmd);
          cmd.symbolInfo = dictionary[cmd.symbolId];
          dependencies.push(cmd.symbolId);
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

      if (resolve) {
        loader._stage._requireRenderables(dependencies, resolve);
        this._dependencies = [];
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
      var framePromiseResolve;
      var framePromise = new Promise(function (resolve) {
        framePromiseResolve = resolve;
      });
      var dependenciesResolve;
      var dependenciesPromise = new Promise(function (resolve) {
        dependenciesResolve = resolve;
      });
      var labelName = frame.labelName;
      var prevPromise = this._lastPromise;
      this._lastPromise = framePromise;

      this._displayList = this._buildFrame(this._displayList,
                                           timeline,
                                           frame,
                                           dependenciesResolve);
      var framesLoaded = timeline.length;

      if (frame.bgcolor)
        loaderInfo._backgroundColor = frame.bgcolor;
      else if (isNullOrUndefined(loaderInfo._backgroundColor))
        loaderInfo._backgroundColor = { red: 255, green: 255, blue: 255, alpha: 255 };

      Promise.all([prevPromise, dependenciesPromise]).then(function () {
        if (abcBlocks && loader._isAvm2Enabled) {
          var appDomain = avm2.applicationDomain;
          for (var i = 0, n = abcBlocks.length; i < n; i++) {
            var abc = new AbcFile(abcBlocks[i].data, "abc_block_" + i);
            abc.env.loader = loader;
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
          for (var i = 0, n = symbolClasses.length; i < n; i++) {
            var asset = symbolClasses[i];
            var symbolInfo = dictionary[asset.symbolId];
            if (!symbolInfo)
              continue;
            symbolInfo.className = asset.className;
            avm2.applicationDomain.getClass(asset.className).setSymbol(symbolInfo.props);
          }
        }
        if (exports && !loader._isAvm2Enabled) {
          var exportPromises = [];
          for (var i = 0, n = exports.length; i < n; i++) {
            var asset = exports[i];
            var symbolInfo = dictionary[asset.symbolId];
            if (!symbolInfo)
              continue;
            loader._avm1Context.addAsset(asset.className, symbolInfo.props);
          }
        }

        var root = loader._content;
        var labelMap;

        if (!root) {
          var parent = loader._parent;

          release || assert(loader._dictionary[0]);
          var rootInfo = loader._dictionary[0];
          var rootClass = avm2.applicationDomain.getClass(rootInfo.className);
          root = rootClass.createAsSymbol({
            framesLoaded: framesLoaded,
            loader: loader,
            parent: parent || loader,
            index: parent ? 0 : -1,
            level: parent ? 0 : -1,
            timeline: timeline,
            totalFrames: rootInfo.props.totalFrames,
            stage: loader._stage,
            complete: frame.complete
          });

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

          if (loader._stage) {
            loader._stage._children[0] = root;
          }

          rootClass.instanceConstructor.call(root);

          loader._content = root;
        } else {
          root._framesLoaded = framesLoaded;

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

        framePromiseResolve();
      });
    },
    _commitImage : function (imageInfo) {
      var Bitmap = avm2.systemDomain.getClass("flash.display.Bitmap");
      var BitmapData = avm2.systemDomain.getClass("flash.display.BitmapData");

      var props = imageInfo.props;
      props.parent = this._parent;
      props.stage = this._stage;
      props.skipCopyToCanvas = true;

      var bitmapData = BitmapData.createAsSymbol(props);
      BitmapData.instanceConstructor.call(bitmapData, 0, 0, true, 0xffffffff);

      var image = Bitmap.createAsSymbol(bitmapData);
      Bitmap.instanceConstructor.call(image, bitmapData);
      image._parent = this;

      this._children.push(image);
      this._invalidateBounds();
      this._content = image;

      var loaderInfo = this._contentLoaderInfo;
      loaderInfo._width = image.width;
      loaderInfo._height = image.height;
      loaderInfo._dispatchEvent("init");

      this._stage._defineRenderable(imageInfo);
      this._stage._commit();
    },
    _commitSymbol: function (symbol) {
      var dictionary = this._dictionary;

      if ('updates' in symbol) {
        var s = dictionary[symbol.id];
        for (var i in symbol.updates) {
          s.props[i] = symbol.updates[i];
        }
        return;
      }

      var className = 'flash.display.DisplayObject';

      symbol.loader = this;

      switch (symbol.type) {
      case 'button':
        var states = { };
        for (var stateName in symbol.states) {
          var characters = [];
          var displayList = { };
          var dependencies = this._dependencies;

          var state = symbol.states[stateName];
          var depths = Object.keys(state);

          for (var i = 0; i < depths.length; i++) {
            var depth = depths[i];
            var cmd = cloneObject(state[depth]);
            cmd.symbolInfo = dictionary[cmd.symbolId];
            displayList[depth] = cmd;
            dependencies.push(cmd.symbolId);
          }

          depths.sort(sortNumeric);

          displayList.depths = depths;

          states[stateName] = {
            className: 'flash.display.Sprite',
            props: {
              loader: this,
              timeline: [displayList]
            }
          };
        }

        className = 'flash.display.SimpleButton';
        symbol.states = states;
        break;
      case 'font':
        className = 'flash.text.Font';
        this._registerFont(className, symbol);
        break;
      case 'image':
        className = 'flash.display.Bitmap';
        break;
      case 'label':
        className = 'flash.text.StaticText';
        break;
      case 'text':
        if (symbol.type === 'label') {
          className = 'flash.text.StaticText';
        } else {
          className = 'flash.text.TextField';
        }
        break;
      case 'shape':
        className = symbol.morph ?
                    'flash.display.MorphShape' : 'flash.display.Shape';
        break;
      case 'sound':
        if (!symbol.pcm && !PLAY_USING_AUDIO_TAG) {
          assert(symbol.packaged.mimeType === 'audio/mpeg');

          MP3DecoderSession.processAll(symbol.packaged.data,
            function (props, pcm, id3tags, error) {
              props.pcm = pcm || new Uint8Array(0);
              if (error) {
                console.error('ERROR: ' + error);
              }
            }.bind(null, props));
        }

        className = 'flash.media.Sound';
        break;
      case 'binary':
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
          }

          displayList = this._buildFrame(displayList, timeline, frame);
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
        symbol.timeline = timeline;
        symbol.framesLoaded = frameCount;
        symbol.labelMap = labelMap;
        symbol.frameScripts = frameScripts;
        symbol.totalFrames = frameCount;
        symbol.startSoundRegistrations = startSoundRegistrations;
        break;
      }

      dictionary[symbol.id] = {
        className: className,
        props: symbol
      };

      this._stage._defineRenderable(symbol);
      this._stage._commit();
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

      var vmPromiseResolve, vmPromiseReject;
      var vmPromise = new Promise(function (resolve, reject) {
        vmPromiseResolve = resolve;
        vmPromiseReject = reject;
      });
      // HACK making resolve and reject public
      vmPromise.resolve = vmPromiseResolve;
      vmPromise.reject = vmPromiseReject;
      this._lastPromise = vmPromise;

      var rootInfo = {
        className: 'flash.display.MovieClip',
        props: { totalFrames: info.frameCount }
      };
      loader._dictionary[0] = rootInfo;

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
          this._load(bytes.a, checkPolicyFile, applicationDomain, securityDomain);
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
