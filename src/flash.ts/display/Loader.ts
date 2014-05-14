/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// Class: Loader
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  import FileLoadingService = Shumway.FileLoadingService;
  import Telemetry = Shumway.Telemetry;

  import AVM2 = Shumway.AVM2.Runtime.AVM2;
  import AbcFile = Shumway.AVM2.ABC.AbcFile;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

  import Timeline = Shumway.Timeline;

  import Rectangle = flash.geom.Rectangle;
  import Matrix = flash.geom.Matrix;
  import ColorTransform = flash.geom.ColorTransform;

  import ActionScriptVersion = flash.display.ActionScriptVersion;
  import BlendMode = flash.display.BlendMode;

  var Event: typeof flash.events.Event;
  var ProgressEvent: typeof flash.events.ProgressEvent;
  var IOErrorEvent: typeof flash.events.IOErrorEvent;
  var LoaderInfo: typeof flash.display.LoaderInfo;
  var MovieClip: typeof flash.display.MovieClip;
  var Scene: typeof flash.display.Scene;
  var FrameLabel: typeof flash.display.FrameLabel;
  var Bitmap: typeof flash.display.Bitmap;
  var BitmapData: typeof flash.display.BitmapData;
  var Graphics: typeof flash.display.Graphics;

  enum LoadStatus {
    Unloaded    = 0,
    Opened      = 1,
    Initialized = 2,
    Complete    = 3
  }

  export class Loader extends flash.display.DisplayObjectContainer {

    private static _rootLoader: Loader;
    private static _loadQueue: Loader [];

    static getRootLoader(): Loader {
      if (Loader._rootLoader) {
        return Loader._rootLoader;
      }
      var loader = new Loader();
      loader._contentLoaderInfo._loader = null;
      loader._loadStatus = LoadStatus.Opened;
      Loader._rootLoader = loader;
      return loader;
    }

    // Called whenever the class is initialized.
    static classInitializer: any = function () {
      Event = flash.events.Event;
      ProgressEvent = flash.events.ProgressEvent;
      IOErrorEvent = flash.events.IOErrorEvent;
      LoaderInfo = flash.display.LoaderInfo;
      MovieClip = flash.display.MovieClip;
      Scene = flash.display.Scene;
      FrameLabel = flash.display.FrameLabel;
      Bitmap = flash.display.Bitmap;
      BitmapData = flash.display.BitmapData;
      Graphics = flash.display.Graphics;

      Loader._rootLoader = null;
      Loader._loadQueue = [];
    };

    // Called whenever an instance of the class is initialized.
    static initializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];

    // List of instance symbols to link.
    static instanceSymbols: string [] = ["load"]; // ["uncaughtErrorEvents", "addChild", "addChildAt", "removeChild", "removeChildAt", "setChildIndex", "load", "sanitizeContext", "loadBytes", "close", "unload", "unloadAndStop", "cloneObject"];

    static RELEASE = false;
    static WORKERS_ENABLED = true;
    static SHUMWAY_ROOT = '../../src/';
    static LOADER_PATH = Loader.RELEASE ? 'shumway-worker.js' : 'swf/resourceloader.js';

    static progress() {
      var queue = Loader._loadQueue;
      for (var i = 0; i < queue.length; i++) {
        var instance = queue[i];
        var loaderInfo = instance._contentLoaderInfo;
        var bytesLoaded = loaderInfo._bytesLoaded;
        var bytesTotal = loaderInfo._bytesTotal;
        switch (instance._loadStatus) {
          case LoadStatus.Unloaded:
            if (bytesTotal) {
              loaderInfo.dispatchEvent(Event.getInstance(Event.OPEN));
              loaderInfo.dispatchEvent(
                new ProgressEvent(ProgressEvent.PROGRESS, false, false, 0, bytesTotal)
              );
              if (instance._content) {
                instance.addChildAtDepth(instance._content, 0);
              }
              instance._loadStatus = LoadStatus.Opened;
            } else {
              break;
            }
          case LoadStatus.Opened:
            if (instance._content && instance._content._hasFlags(DisplayObjectFlags.Constructed)) {
              instance._loadStatus = LoadStatus.Initialized;
              loaderInfo.dispatchEvent(Event.getInstance(Event.INIT));
            } else {
              break;
            }
          case LoadStatus.Initialized:
            if (bytesLoaded === bytesTotal) {
              instance._loadStatus = LoadStatus.Complete;
              loaderInfo.dispatchEvent(
                new ProgressEvent(ProgressEvent.PROGRESS, false, false, bytesLoaded, bytesTotal)
              );
              loaderInfo.dispatchEvent(Event.getInstance(Event.COMPLETE));
              queue.shift();
              i--;
            }
            break;
        }
      }
    }

    constructor () {
      false && super();
      DisplayObjectContainer.instanceConstructorNoInitialize.call(this);
      this._content = null;
      this._contentLoaderInfo = new LoaderInfo();
      this._contentLoaderInfo._loader = this;

      this._dictionary = [];
      this._worker = null;
      this._startPromise = Promise.resolve();
      this._lastPromise = this._startPromise;
      this._loadStatus = LoadStatus.Unloaded;

      this._dictionary[0] = new Timeline.SpriteSymbol(0, true);
    }

    // JS -> AS Bindings

    //uncaughtErrorEvents: flash.events.UncaughtErrorEvents;
    //addChild: (child: flash.display.DisplayObject) => flash.display.DisplayObject;
    //addChildAt: (child: flash.display.DisplayObject, index: number /*int*/) => flash.display.DisplayObject;
    //removeChild: (child: flash.display.DisplayObject) => flash.display.DisplayObject;
    //removeChildAt: (index: number /*int*/) => flash.display.DisplayObject;
    //setChildIndex: (child: flash.display.DisplayObject, index: number /*int*/) => void;
    //load: (request: flash.net.URLRequest, context: flash.system.LoaderContext = null) => void;
    //sanitizeContext: (context: flash.system.LoaderContext) => flash.system.LoaderContext;
    //loadBytes: (bytes: flash.utils.ByteArray, context: flash.system.LoaderContext = null) => void;
    //close: () => void;
    //unload: () => void;
    //unloadAndStop: (gc: boolean = true) => void;
    //cloneObject: (obj: ASObject) => ASObject;

    // AS -> JS Bindings

    private _content: flash.display.DisplayObject;
    private _contentLoaderInfo: flash.display.LoaderInfo;
    // _uncaughtErrorEvents: flash.events.UncaughtErrorEvents;

    private _dictionary: Timeline.Symbol [];
    private _worker: Worker;
    private _startPromise: any;
    private _lastPromise: any;
    private _loadStatus: LoadStatus;

    private _commitData(data: any): void {
      var loaderInfo = this._contentLoaderInfo;
      var command = data.command;
      switch (command) {
        case 'init':
          var info = data.result;

          loaderInfo._bytesLoaded = info.bytesLoaded;
          loaderInfo._bytesTotal = info.bytesTotal;
          loaderInfo._swfVersion = info.swfVersion;
          if (!info.fileAttributes || !info.fileAttributes.doAbc) {
            loaderInfo._actionScriptVersion = ActionScriptVersion.ACTIONSCRIPT2;
          }
          loaderInfo._frameRate = info.frameRate;
          var bbox = info.bbox;
          loaderInfo._width = bbox.xMax - bbox.xMin;
          loaderInfo._height = bbox.yMax - bbox.yMin;

          var rootSymbol = <Timeline.SpriteSymbol>this._dictionary[0];
          rootSymbol.numFrames = info.frameCount;
          break;
        case 'progress':
          var info = data.result;
          var bytesLoaded = info.bytesLoaded;
          var bytesTotal = info.bytesTotal;
          assert (bytesLoaded <= bytesTotal, "Loaded bytes should not exceed total bytes.");
          loaderInfo._bytesLoaded = bytesLoaded;
          if (!loaderInfo._bytesTotal) {
            loaderInfo._bytesTotal = bytesTotal;
          } else {
            assert (loaderInfo._bytesTotal === bytesTotal, "Total bytes should not change.");
          }
          if (this._loadStatus !== LoadStatus.Unloaded) {
            loaderInfo.dispatchEvent(
              new ProgressEvent(ProgressEvent.PROGRESS, false, false, bytesLoaded, bytesTotal)
            );
          }
          break;
        case 'complete':
          if (data.stats) {
            Telemetry.instance.reportTelemetry(data.stats);
          }

          this._worker && this._worker.terminate();
          break;
        //case 'empty':
        //  this._lastPromise = Promise.resolve();
        //  break;
        case 'error':
          this._contentLoaderInfo.dispatchEvent(new IOErrorEvent(IOErrorEvent.IO_ERROR));
          break;
        default:
          //TODO: fix special-casing. Might have to move document class out of dictionary[0]
          if (data.id === 0) {
            break;
          }
          if (data.isSymbol) {
            this._commitAsset(data);
          } else if (data.type === 'frame') {
            this._commitFrame(data);
          } else if (data.type === 'image') {
            this._commitImage(data);
          } else if (data.type === 'abc') {
            var appDomain = AVM2.instance.applicationDomain;
            var abc = new AbcFile(data.data, data.name);
            if (data.flags) {
              // kDoAbcLazyInitializeFlag = 1 Indicates that the ABC block should not be executed
              // immediately.
              appDomain.loadAbc(abc);
            } else {
              appDomain.executeAbc(abc);
            }
          }
          break;
      }
    }

    private _commitAsset(data: any): void {
      var symbol;
      var symbolId = data.id;
      if (data.updates) {
        var updates = data.updates;
        symbol = this._dictionary[symbolId];
        if (updates.scale9Grid) {
          symbol.scale9Grid = new Rectangle();
          symbol.scale9Grid.copyFromBbox(updates.scale9Grid);
        }
        return;
      }
      switch (data.type) {
        case 'shape':
          symbol = Timeline.ShapeSymbol.createFromData(data);
          break;
        case 'image':
          symbol = Timeline.BitmapSymbol.createFromData(data);
          break;
        case 'label':
          symbol = Timeline.TextSymbol.createFromLabelData(data);
          break;
        case 'text':
          symbol = Timeline.TextSymbol.createFromTextData(data);
          break;
        case 'button':
          symbol = Timeline.ButtonSymbol.createFromData(data, this);
          break;
        case 'sprite':
          symbol = Timeline.SpriteSymbol.createFromData(data, this);
          break;
        case 'font':
          var font = flash.text.Font.createEmbeddedFont(
            data.name, data.bold, data.italic
          );
          //flash.text.Font.registerFont(font);
          return;
        case 'sound':
          symbol = Timeline.SoundSymbol.createFromData(data);
          break;
        case 'binary':
          // TODO
          return;
      }
      this._dictionary[symbolId] = symbol;
    }

    private _commitFrame(data: any): void {
      var loaderInfo = this._contentLoaderInfo;

      if (data.symbolClasses) {
        var symbolClasses = data.symbolClasses;
        var appDomain = AVM2.instance.applicationDomain;
        for (var i = 0; i < symbolClasses.length; i++) {
          var asset = symbolClasses[i];
          var tag = asset.symbolId;
          var symbolClass = appDomain.getClass(asset.className);
          var symbol = this._dictionary[asset.symbolId];
          assert (symbol);
          symbolClass.defaultInitializerArgument = symbol;
          symbol.symbolClass = symbolClass;
        }
      }

      //if (data.exports && !loaderInfo._actionScriptVersion === ActionScriptVersion.ACTIONSCRIPT3) {
      //  var exports = data.exports;
      //  for (var i = 0; i < exports.length; i++) {
      //    var asset = exports[i];
      //    var symbolInfo = dictionary[asset.symbolId];
      //    assert (symbolInfo);
      //    loader._avm1Context.addAsset(asset.className, symbolInfo.props);
      //  }
      //}

      var rootSymbol = <Timeline.SpriteSymbol>this._dictionary[0];
      var documentClass = rootSymbol.symbolClass;
      var frames = rootSymbol.frames;
      var frameIndex = frames.length;

      var frame = this._buildFrame(data.commands);
      var repeat = data.repeat;
      while (repeat--) {
        frames.push(frame);
      }

      var root = this._content;
      if (!root) {
        root = documentClass.initializeFrom(rootSymbol);

        if (MovieClip.isType(root)) {
          var mc = <MovieClip>root;
          if (data.sceneData) {
            var scenes = data.sceneData.scenes;
            var allLabels = data.sceneData.labels;
            for (var i = 0, n = scenes.length; i < n; i++) {
              var sceneInfo = scenes[i];
              var startFrame = sceneInfo.offset;
              var endFrame = i < n - 1 ? scenes[i + 1].offset : rootSymbol.numFrames;
              var labels = [];
              for (var j = 0; j < allLabels.length; j++) {
                var labelInfo = allLabels[j];
                var frameIndex = labelInfo.frame - startFrame;
                if (frameIndex >= 0 && frameIndex < endFrame) {
                  labels.push(new FrameLabel(labelInfo.name, frameIndex + 1));
                }
              }
              mc.addScene(sceneInfo.name, labels, endFrame - startFrame);
            }
          } else {
            mc.addScene('Scene 1', [], rootSymbol.numFrames);
          }
        }

        //if (!loader._isAvm2Enabled) {
        //  var avm1Context = loader._avm1Context;

        //  // Finding movie top root
        //  var _root = root;
        //  if (parent && parent !== loader._stage) {
        //    var parentLoader = parent.loaderInfo._loader;
        //    while (parentLoader._parent && parentLoader._parent !== loader._stage) {
        //      parentLoader = parentLoader._parent.loaderInfo._loader;
        //    }
        //    if (parentLoader._isAvm2Enabled) {
        //      somewhatImplemented('AVM1Movie');
        //      this._worker && this._worker.terminate();
        //      return;
        //    }
        //    _root = parentLoader._content;
        //  }

        //  var as2Object = _root._getAS2Object();
        //  avm1Context.globals.asSetPublicProperty('_root', as2Object);
        //  avm1Context.globals.asSetPublicProperty('_level0', as2Object);
        //  avm1Context.globals.asSetPublicProperty('_level1', as2Object);

        //  // transfer parameters
        //  var parameters = loader.loaderInfo._parameters;
        //  for (var paramName in parameters) {
        //    if (!(paramName in as2Object)) { // not present yet
        //      as2Object[paramName] = parameters[paramName];
        //    }
        //  }
        //}

        root._loaderInfo = this._contentLoaderInfo;
        this._content = root;
      }

      if (MovieClip.isType(root)) {
        if (data.labelName) {
          (<MovieClip>root).addFrameLabel(frameIndex, data.labelName);
        }

        //if (!loader._isAvm2Enabled) {
        //  var avm1Context = loader._avm1Context;

        //  if (initActionBlocks) {
        //    // HACK using symbol init actions as regular action blocks, the spec has a note
        //    // "DoAction tag is not the same as specifying them in a DoInitAction tag"
        //    for (var i = 0; i < initActionBlocks.length; i++) {
        //      var spriteId = initActionBlocks[i].spriteId;
        //      var actionsData = new AS2ActionsData(initActionBlocks[i].actionsData,
        //        'f' + frameNum + 's' + spriteId + 'i' + i);
        //      root.addFrameScript(frameNum - 1, function(actionsData, spriteId, state) {
        //        if (state.executed) return;
        //        state.executed = true;
        //        return executeActions(actionsData, avm1Context, this._getAS2Object());
        //      }.bind(root, actionsData, spriteId, {executed: false}));
        //    }
        //  }

        //  if (actionBlocks) {
        //    for (var i = 0; i < actionBlocks.length; i++) {
        //      var actionsData = new AS2ActionsData(actionBlocks[i],
        //        'f' + frameNum + 'i' + i);
        //      root.addFrameScript(frameNum - 1, (function(actionsData) {
        //        return function () {
        //          return executeActions(actionsData, avm1Context, this._getAS2Object());
        //        };
        //      })(actionsData));
        //    }
        //  }
        //}
      }

      //if (frame.startSounds) {
      //  root._registerStartSounds(frameNum, frame.startSounds);
      //}
      //if (frame.soundStream) {
      //  root._initSoundStream(frame.soundStream);
      //}
      //if (frame.soundStreamBlock) {
      //  root._addSoundStreamBlock(frameNum, frame.soundStreamBlock);
      //}
    }

    _buildFrame(commands: any []): Timeline.Frame {
      var frame = new Timeline.Frame();
      for (var i = 0; i < commands.length; i++) {
        var cmd = commands[i];
        var depth = cmd.depth;
        switch (cmd.code) {
          case 5: // SWF_TAG_CODE_REMOVE_OBJECT
          case 28: // SWF_TAG_CODE_REMOVE_OBJECT2
            frame.remove(depth);
            break;
          default:
            var symbol = null;
            var matrix = null;
            var colorTransform = null;
            var filters = null;
            var events = null;
            if (cmd.symbolId) {
              symbol = this._dictionary[cmd.symbolId];
              assert (symbol, "Symbol is not defined.");
            }
            if (cmd.hasMatrix) {
              matrix = Matrix.fromAny(cmd.matrix);
            }
            if (cmd.hasCxform) {
              colorTransform = ColorTransform.fromCXForm(cmd.cxform);
            }
            if (cmd.hasFilters) {
              filters = [];
              var swfFilters = cmd.filters;
              for (var j = 0; j < swfFilters.length; j++) {
                var obj = swfFilters[j];
                var filter: flash.filters.BitmapFilter;
                switch (obj.type) {
                  case 0: filter = flash.filters.DropShadowFilter.fromAny(obj); break;
                  case 1: filter = flash.filters.BlurFilter.fromAny(obj); break;
                  case 2: filter = flash.filters.GlowFilter.fromAny(obj); break;
                  case 3: filter = flash.filters.BevelFilter.fromAny(obj); break;
                  case 4: filter = flash.filters.GradientGlowFilter.fromAny(obj); break;
                  case 5: filter = flash.filters.ConvolutionFilter.fromAny(obj); break;
                  case 6: filter = flash.filters.ColorMatrixFilter.fromAny(obj); break;
                  case 7: filter = flash.filters.GradientBevelFilter.fromAny(obj); break;
                }
                assert (filter, "Unknown filter type.");
                filters.push(filter);
              }
            }
            if (cmd.hasEvents) {
              // TODO
            }
            var state = new Timeline.AnimationState(
              symbol,
              depth,
              matrix,
              colorTransform,
              cmd.ratio,
              cmd.name,
              cmd.clipDepth,
              filters,
              BlendMode.fromNumber(cmd.blendMode),
              cmd.cache,
              events
            );
            frame.place(depth, state);
            break;
        }
      }
      return frame;
    }

    private _commitImage(data: any): void {
      var b = new BitmapData(data.width, data.height);
      this._content = new Bitmap(b);

      var loaderInfo = this._contentLoaderInfo;
      loaderInfo._width = data.width;
      loaderInfo._height = data.height;
    }

    get content(): flash.display.DisplayObject {
      if (this._loadStatus === LoadStatus.Unloaded) {
        return null;
      }
      return this._content;
    }

    get contentLoaderInfo(): flash.display.LoaderInfo {
      return this._contentLoaderInfo;
    }

    load: (request: flash.net.URLRequest, context?: flash.system.LoaderContext) => void;

    _close(): void {
      if (this._worker && this._loadStatus === LoadStatus.Unloaded) {
        this._worker.terminate();
        this._worker = null;
      }
    }

    _unload(stopExecution: boolean, gc: boolean): void {
      stopExecution = !!stopExecution; gc = !!gc;
      if (this._loadStatus < LoadStatus.Initialized) {
        return;
      }
      this._content = null;
      this._contentLoaderInfo._loader = null;
      this._dictionary = [];
      this._worker = null;
      this._lastPromise = this._startPromise;
      this._loadStatus = LoadStatus.Unloaded;
      this.dispatchEvent(Event.getInstance(Event.UNLOAD));
    }

    _getJPEGLoaderContextdeblockingfilter(context: flash.system.LoaderContext): number {
      if (flash.system.JPEGLoaderContext.isType(context)) {
        return (<flash.system.JPEGLoaderContext>context).deblockingFilter;
      }
      return 0.0;
    }

    _getUncaughtErrorEvents(): flash.events.UncaughtErrorEvents {
      notImplemented("public flash.display.Loader::_getUncaughtErrorEvents"); return;
    }
    _setUncaughtErrorEvents(value: flash.events.UncaughtErrorEvents): void {
      value = value;
      notImplemented("public flash.display.Loader::_setUncaughtErrorEvents"); return;
    }

    _load(request: flash.net.URLRequest, checkPolicyFile: boolean, applicationDomain: flash.system.ApplicationDomain, securityDomain: flash.system.SecurityDomain, requestedContentParent: flash.display.DisplayObjectContainer, parameters: ASObject, deblockingFilter: number, allowCodeExecution: boolean, imageDecodingPolicy: string): void {
      var loaderInfo = this._contentLoaderInfo;
      //request = request; checkPolicyFile = !!checkPolicyFile; applicationDomain = applicationDomain; securityDomain = securityDomain; requestedContentParent = requestedContentParent; parameters = parameters; deblockingFilter = +deblockingFilter; allowCodeExecution = !!allowCodeExecution; imageDecodingPolicy = asCoerceString(imageDecodingPolicy);
      //if (flash.net.URLRequest.isType(request)) {
        this._contentLoaderInfo._url = request.url;
      //}
      var worker;
      if (Loader.WORKERS_ENABLED) {
        worker = new Worker(Loader.SHUMWAY_ROOT + Loader.LOADER_PATH);
      } else {
        worker = new ResourceLoader(window);
      }
      var loader = this;
      //loader._worker = worker;
      worker.onmessage = function (e) {
        if (e.data.type === 'exception') {
          AVM2.exceptions.push({
            source: 'parser',
            message: e.data.message,
            stack: e.data.stack
          });
        } else {
          loader._commitData(e.data);
        }
      };
      //if (flash.net.URLRequest.class.isInstanceOf(request)) {
        var session = FileLoadingService.instance.createSession();
        session.onprogress = function (data, progress) {
          worker.postMessage({ data: data, progress: progress });
        };
        session.onerror = function (error) {
          loader._commitData({ command: 'error', error: error });
        };
        session.onopen = function () {
          worker.postMessage('pipe:');
        };
        session.onclose = function () {
          worker.postMessage({ data: null });
        };
        session.open(request._toFileRequest());
      //} else {
      //  worker.postMessage(request);
      //}
      Loader._loadQueue.push(this);
    }

    _loadBytes(bytes: flash.utils.ByteArray, checkPolicyFile: boolean, applicationDomain: flash.system.ApplicationDomain, securityDomain: flash.system.SecurityDomain, requestedContentParent: flash.display.DisplayObjectContainer, parameters: ASObject, deblockingFilter: number, allowCodeExecution: boolean, imageDecodingPolicy: string): void {
      bytes = bytes; checkPolicyFile = !!checkPolicyFile; applicationDomain = applicationDomain; securityDomain = securityDomain; requestedContentParent = requestedContentParent; parameters = parameters; deblockingFilter = +deblockingFilter; allowCodeExecution = !!allowCodeExecution; imageDecodingPolicy = asCoerceString(imageDecodingPolicy);
      notImplemented("public flash.display.Loader::_loadBytes"); return;
    }
  }
}
