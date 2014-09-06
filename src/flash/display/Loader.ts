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
  import assert = Shumway.Debug.assert;
  import assertUnreachable = Shumway.Debug.assertUnreachable;
  import notImplemented = Shumway.Debug.notImplemented;
  import throwError = Shumway.AVM2.Runtime.throwError;
  import FileLoadingService = Shumway.FileLoadingService;
  import Telemetry = Shumway.Telemetry;

  import AVM2 = Shumway.AVM2.Runtime.AVM2;
  import AbcFile = Shumway.AVM2.ABC.AbcFile;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

  import events = flash.events;
  import ActionScriptVersion = flash.display.ActionScriptVersion;

  import ApplicationDomain = flash.system.ApplicationDomain;
  import LoaderContext = flash.system.LoaderContext;

  import Bounds = Shumway.Bounds;

  declare var SHUMWAY_ROOT: string;
  declare var LOADER_WORKER_PATH: string;

  enum LoadStatus {
    Unloaded    = 0,
    Opened      = 1,
    Initialized = 2,
    Complete    = 3
  }

  enum LoadingType {
    External    = 0,
    Bytes       = 1
  }

  export class Loader extends flash.display.DisplayObjectContainer implements IAdvancable {

    private static _rootLoader: Loader;
    private static _loadQueue: Loader [];
    private static _embeddedContentLoadCount: number = 0;

    /**
     * Creates or returns the root Loader instance. The loader property of that instance's
     * LoaderInfo object is always null. Also, no OPEN event ever gets dispatched.
     */
    static getRootLoader(): Loader {
      if (Loader._rootLoader) {
        return Loader._rootLoader;
      }
      var loader = new flash.display.Loader();
      // The root loader gets a default name, but it's not visible and hence the instance id must
      // not be used up.
      flash.display.DisplayObject._instanceID--;
      // The root loaderInfo's `loader` property is always null.
      loader._contentLoaderInfo._loader = null;
      loader._loadStatus = LoadStatus.Opened;
      Loader._rootLoader = loader;
      return loader;
    }

    static reset() {
      Loader._rootLoader = null;
    }

    // Called whenever the class is initialized.
    static classInitializer: any = function () {
      Loader._rootLoader = null;
      Loader._loadQueue = [];
    };

    // Called whenever an instance of the class is initialized.
    static initializer: any = function() {
      var self: Loader = this;
      DisplayObject._advancableInstances.push(self);
    };

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];

    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["uncaughtErrorEvents", "addChild", "addChildAt", "removeChild", "removeChildAt", "setChildIndex", "load", "sanitizeContext", "loadBytes", "close", "unload", "unloadAndStop", "cloneObject"];

    static WORKERS_AVAILABLE = typeof Worker !== 'undefined';
    static LOADER_PATH = 'swf/worker.js';

    /**
     * Handles the load status and dispatches progress events. This gets manually triggered in the
     * event loop to ensure the correct order of operations.
     */
    static progress() {
      var queue = Loader._loadQueue;
      for (var i = 0; i < queue.length; i++) {
        var instance = queue[i];
        var loaderInfo = instance._contentLoaderInfo;
        var bytesLoaded = loaderInfo._bytesLoaded;
        var bytesTotal = loaderInfo._bytesTotal;
        switch (instance._loadStatus) {
          case LoadStatus.Unloaded:
            if (!bytesTotal) {
              break;
            }
            // OPEN is only dispatched when loading external resources, not for loadBytes.
            if (instance._loadingType === LoadingType.External) {
              loaderInfo.dispatchEvent(events.Event.getInstance(events.Event.OPEN));
            }
            loaderInfo.dispatchEvent(new events.ProgressEvent(events.ProgressEvent.PROGRESS,
                                                              false, false, 0, bytesTotal));
            instance._loadStatus = LoadStatus.Opened;
          case LoadStatus.Opened:
            if (!(instance._content &&
                  instance._content._hasFlags(DisplayObjectFlags.Constructed))) {
              break;
            }
            instance._loadStatus = LoadStatus.Initialized;
            loaderInfo.dispatchEvent(events.Event.getInstance(events.Event.INIT));
          case LoadStatus.Initialized:
            if (bytesLoaded === bytesTotal) {
              instance._loadStatus = LoadStatus.Complete;
              loaderInfo.dispatchEvent(new events.ProgressEvent(events.ProgressEvent.PROGRESS,
                                                                false, false, bytesLoaded,
                                                                bytesTotal));
              loaderInfo.dispatchEvent(events.Event.getInstance(events.Event.COMPLETE));
              queue.splice(i--, 1);
            }
            break;
          default:
            assertUnreachable("Mustn't encounter unhandled status in Loader queue.");
        }
      }
    }

    constructor () {
      false && super();
      DisplayObjectContainer.instanceConstructorNoInitialize.call(this);

      this._content = null;
      this._contentLoaderInfo = new flash.display.LoaderInfo();

      this._worker = null;
      this._loadStatus = LoadStatus.Unloaded;

      this._contentLoaderInfo._loader = this;

      this._initialDataLoaded = new PromiseWrapper<any>();
      this._waitForInitialData = true;
      this._commitDataQueue = this._initialDataLoaded.promise;

      this._codeExecutionPromise = new PromiseWrapper<any>();
      this._progressPromise = new PromiseWrapper<any>();
      this._startPromise = Promise.all([
        this._codeExecutionPromise.promise,
        this._progressPromise.promise
      ]);
    }

    _initFrame(advance: boolean) {
      // ...
    }

    _constructFrame() {
      this._constructChildren();
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

    private _worker: Worker;
    private _loadStatus: LoadStatus;
    private _loadingType: LoadingType;

    private _initialDataLoaded: PromiseWrapper<any>;
    private _waitForInitialData: boolean;
    private _commitDataQueue: Promise<any>;

    /**
     * Resolved when both |_progressPromise| and |_codeExecutionPromise| are resolved.
     */
    _startPromise: Promise<any>;

    /**
     * Resolved after the first progress event. This ensures that at least 64K of data have been
     * parsed before playback begins.
     */
    private _progressPromise: PromiseWrapper<any>;

    /**
     * Resolved after AVM2 and AVM1 (if used) have been initialized.
     */
    private _codeExecutionPromise: PromiseWrapper<any>;

    private _commitData(data: any): void {
      if (this._waitForInitialData) {
        // 'progress' event usually fires after 64K, using this as a start to
        // commit frame/symbols
        var enoughData = data.command === 'progress' ||
                         data.command === 'image' ||
                         data.command === 'error';
        if (enoughData) {
          this._waitForInitialData = false;
          this._initialDataLoaded.resolve(undefined);
        }
      }

      this._commitDataQueue = this._commitDataQueue.then(
        this._commitQueuedData.bind(this, data));
    }

    private _commitQueuedData(data: any): Promise<any> {
      var loaderInfo = this._contentLoaderInfo;
      var command = data.command;
      var suspendUntil: Promise<any> = null;
      switch (command) {
        case 'init':
          var info = data.result;

          loaderInfo._bytesLoaded = info.bytesLoaded;
          loaderInfo._bytesTotal = info.bytesTotal;
          loaderInfo._swfVersion = info.swfVersion;
          if (!info.fileAttributes || !info.fileAttributes.doAbc) {
            loaderInfo._actionScriptVersion = ActionScriptVersion.ACTIONSCRIPT2;
            suspendUntil = this._initAvm1(loaderInfo);
          }
          loaderInfo._frameRate = info.frameRate;
          var bbox = info.bbox;
          loaderInfo._width = bbox.xMax - bbox.xMin;
          loaderInfo._height = bbox.yMax - bbox.yMin;

          var rootSymbol = new Timeline.SpriteSymbol(0, true);
          rootSymbol.numFrames = info.frameCount;
          loaderInfo.registerSymbol(rootSymbol);
          break;
        case 'progress':
          var info = data.result;
          var bytesLoaded = info.bytesLoaded;
          var bytesTotal = info.bytesTotal;
          release || assert (bytesLoaded <= bytesTotal, "Loaded bytes should not exceed total bytes.");
          loaderInfo._bytesLoaded = bytesLoaded;
          if (!loaderInfo._bytesTotal) {
            loaderInfo._bytesTotal = bytesTotal;
          } else {
            release || assert (loaderInfo._bytesTotal === bytesTotal, "Total bytes should not change.");
          }
          if (this._loadStatus !== LoadStatus.Unloaded) {
            loaderInfo.dispatchEvent(new events.ProgressEvent(events.ProgressEvent.PROGRESS, false,
                                                              false, bytesLoaded, bytesTotal));
            this._progressPromise.resolve(undefined);
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
          this._contentLoaderInfo.dispatchEvent(new events.IOErrorEvent(
                                                    events.IOErrorEvent.IO_ERROR));
          break;
        default:
          //TODO: fix special-casing. Might have to move document class out of dictionary[0].
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
              if (loaderInfo._allowCodeExecution) {
                appDomain.executeAbc(abc);
              }
            }
          }
          break;
      }
      return suspendUntil;
    }

    private _initAvm1(loaderInfo: LoaderInfo): Promise<any> {
      return AVM2.instance.loadAVM1().then(function() {
        loaderInfo._avm1Context = Shumway.AVM1.AVM1Context.create(loaderInfo.swfVersion);
      });
    }

    private _commitAsset(data: any): void {
      var loaderInfo = this._contentLoaderInfo;
      var symbolId = data.id;
      var symbol;
      if (data.updates) {
        var updates = data.updates;
        symbol = loaderInfo.getSymbolById(symbolId);
        if (updates.scale9Grid) {
          symbol.scale9Grid = Bounds.FromUntyped(updates.scale9Grid);
        }
        return;
      }
      switch (data.type) {
        case 'shape':
          symbol = Timeline.ShapeSymbol.FromData(data, loaderInfo);
          break;
        case 'morphshape':
          symbol = Timeline.MorphShapeSymbol.FromData(data, loaderInfo);
          break;
        case 'image':
          symbol = Timeline.BitmapSymbol.FromData(data);
          break;
        case 'label':
        case 'text':
          symbol = Timeline.TextSymbol.FromTextData(data);
          break;
        case 'button':
          symbol = Timeline.ButtonSymbol.FromData(data, loaderInfo);
          break;
        case 'sprite':
          symbol = Timeline.SpriteSymbol.FromData(data, loaderInfo);
          break;
        case 'font':
          symbol = Timeline.FontSymbol.FromData(data);
          var font = flash.text.Font.initializeFrom(symbol);
          flash.text.Font.instanceConstructorNoInitialize.call(font);
          AVM2.instance.globals['Shumway.Player.Utils'].registerFont(font);
          break;
        case 'sound':
          symbol = Timeline.SoundSymbol.FromData(data);
          break;
        case 'binary':
          symbol = Timeline.BinarySymbol.FromData(data);
          break;
      }
      release || assert (symbol, "Unknown symbol type.");
      loaderInfo.registerSymbol(symbol);
    }

    private _commitFrame(data: any): void {
      var loaderInfo = this._contentLoaderInfo;

      // HACK: Someone should figure out how to set the color on the stage better.
      if (data.bgcolor !== undefined) {
        loaderInfo._colorRGBA = data.bgcolor;
      }

      if (data.symbolClasses) {
        var symbolClasses = data.symbolClasses;
        var appDomain = AVM2.instance.applicationDomain;
        for (var i = 0; i < symbolClasses.length; i++) {
          var asset = symbolClasses[i];
          if (loaderInfo._allowCodeExecution) {
            var symbolClass = appDomain.getClass(asset.className);
            var symbol = loaderInfo.getSymbolById(asset.symbolId);
            release || assert (symbol, "Symbol is not defined.");
            symbolClass.defaultInitializerArgument = symbol;
            symbol.symbolClass = symbolClass;
          }
        }
      }

      if (data.exports && loaderInfo._actionScriptVersion === ActionScriptVersion.ACTIONSCRIPT2) {
        var exports = data.exports;
        for (var i = 0; i < exports.length; i++) {
          var asset = exports[i];
          var symbol = loaderInfo.getSymbolById(asset.symbolId);
          release || assert (symbol);
          loaderInfo._avm1Context.addAsset(asset.className, symbol);
        }
      }

      var rootSymbol = <Shumway.Timeline.SpriteSymbol>loaderInfo.getSymbolById(0);
      var documentClass = rootSymbol.symbolClass;
      var frames = rootSymbol.frames;
      var frameIndex = frames.length;

      var frame = new Timeline.FrameDelta(loaderInfo, data.commands);
      var repeat = data.repeat;
      while (repeat--) {
        frames.push(frame);
      }

      var root = this._content;
      if (!root) {
        root = documentClass.initializeFrom(rootSymbol);
        // The root object gets a default of 'rootN', which doesn't use up a DisplayObject instance
        // ID.
        flash.display.DisplayObject._instanceID--;
        root._name = 'root1'; // TODO: make this increment for subsequent roots.

        if (MovieClip.isType(root)) {
          var mc = <MovieClip>root;
          if (data.sceneData) {
            var scenes = data.sceneData.scenes;
            for (var i = 0, n = scenes.length; i < n; i++) {
              var sceneInfo = scenes[i];
              var offset = sceneInfo.offset;
              var endFrame = i < n - 1 ? scenes[i + 1].offset : rootSymbol.numFrames;
              mc.addScene(sceneInfo.name, [], offset, endFrame - offset);
            }
            var labels = data.sceneData.labels;
            for (var i = 0; i < labels.length; i++) {
              var labelInfo = labels[i];
              mc.addFrameLabel(labelInfo.name, labelInfo.frame + 1);
            }
          } else {
            mc.addScene('Scene 1', [], 0, rootSymbol.numFrames);
          }
        }

        if (loaderInfo._actionScriptVersion === ActionScriptVersion.ACTIONSCRIPT2) {
          this._initAvm1Root(root);
        }

        this._codeExecutionPromise.resolve(undefined);

        root._loaderInfo = loaderInfo;
        this._content = root;
        this.addTimelineObjectAtDepth(this._content, 0);
      }

      if (MovieClip.isType(root)) {
        var rootMovie: MovieClip = <MovieClip>root;

        if (data.labelName) {
          rootMovie.addFrameLabel(data.labelName, frameIndex + 1);
        }

        if (loaderInfo._actionScriptVersion === ActionScriptVersion.ACTIONSCRIPT2) {
          this._executeAvm1Actions(rootMovie, frameIndex, data);
        }

        if (data.startSounds) {
          rootMovie._registerStartSounds(frameIndex + 1, data.startSounds);
        }
        if (data.soundStream) {
          rootMovie._initSoundStream(data.soundStream);
        }
        if (data.soundStreamBlock) {
          rootMovie._addSoundStreamBlock(frameIndex, data.soundStreamBlock);
        }
      }
    }

    private _initAvm1Root(root: flash.display.DisplayObject) {
      // Finding movie top root
      var topRoot = root;
      var parent = this._parent;
      if (parent && parent !== this._stage) {
        var parentLoader = parent.loaderInfo._loader;
        while (parentLoader._parent && parentLoader._parent !== this._stage) {
          parentLoader = parentLoader._parent.loaderInfo._loader;
        }
        if (parentLoader.loaderInfo._actionScriptVersion === ActionScriptVersion.ACTIONSCRIPT2) {
          notImplemented('AVM1Movie');
          this._worker && this._worker.terminate();
          return;
        }
        topRoot = parentLoader._content;
      }

      var avm1Context = this._contentLoaderInfo._avm1Context;
      var as2Object = avm1lib.getAVM1Object(topRoot);
      avm1Context.globals.asSetPublicProperty('_root', as2Object);
      avm1Context.globals.asSetPublicProperty('_level0', as2Object);

      // transfer parameters
      var parameters = this._contentLoaderInfo._parameters;
      for (var paramName in parameters) {
        if (!(paramName in as2Object)) { // not present yet
          as2Object[paramName] = parameters[paramName];
        }
      }
    }

    private _executeAvm1Actions(root: flash.display.MovieClip, frameIndex: number, frameData: any) {
      var initActionBlocks: any[] = frameData.initActionBlocks;
      var actionBlocks: any[] = frameData.actionBlocks;

      if (initActionBlocks) {
        root.addAVM1InitActionBlocks(frameIndex, initActionBlocks);
      }

      if (actionBlocks) {
        for (var i = 0; i < actionBlocks.length; i++) {
          root.addAVM1FrameScript(frameIndex, actionBlocks[i]);
        }
      }
    }

    private _commitImage(data: any): void {
      var symbol = Timeline.BitmapSymbol.FromData(data.props);
      var b = flash.display.BitmapData.initializeFrom(symbol);
      flash.display.BitmapData.instanceConstructorNoInitialize.call(b);

      this._content = new flash.display.Bitmap(b);
      this.addTimelineObjectAtDepth(this._content, 0);

      var loaderInfo = this._contentLoaderInfo;
      loaderInfo._width = symbol.width;
      loaderInfo._height = symbol.height;

      this._loadStatus = LoadStatus.Opened;
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
      this._worker = null;
      this._loadStatus = LoadStatus.Unloaded;
      this.dispatchEvent(events.Event.getInstance(events.Event.UNLOAD));
    }

    _getJPEGLoaderContextdeblockingfilter(context: flash.system.LoaderContext): number {
      if (flash.system.JPEGLoaderContext.isType(context)) {
        return (<flash.system.JPEGLoaderContext>context).deblockingFilter;
      }
      return 0.0;
    }

    _getUncaughtErrorEvents(): events.UncaughtErrorEvents {
      notImplemented("public flash.display.Loader::_getUncaughtErrorEvents"); return;
    }
    _setUncaughtErrorEvents(value: events.UncaughtErrorEvents): void {
      value = value;
      notImplemented("public flash.display.Loader::_setUncaughtErrorEvents"); return;
    }

    load(request: flash.net.URLRequest, context?: LoaderContext): void
    {
      this._contentLoaderInfo._url = request.url;
      this._applyLoaderContext(context, request);
      this._loadingType = LoadingType.External;
      var worker = this._createParsingWorker();

      var loader = this;
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

      Loader._loadQueue.push(this);
    }

    loadBytes(data: flash.utils.ByteArray, context: LoaderContext): void
    {
      // TODO: properly coerce object arguments to their types.
      this._contentLoaderInfo._url = this.loaderInfo._url + '/[[DYNAMIC]]/' +
                                     (++Loader._embeddedContentLoadCount);
      this._applyLoaderContext(context, null);
      this._loadingType = LoadingType.Bytes;
      var worker = this._createParsingWorker();

      Loader._loadQueue.push(this);
      worker.postMessage('pipe:');
      var bytes = (<any>data).bytes;
      var progress = {bytesLoaded: bytes.byteLength, bytesTotal: bytes.byteLength};
      worker.postMessage({ data: bytes, progress:  progress});
      worker.postMessage({ data: null });
    }

    private _applyLoaderContext(context: LoaderContext, request: flash.net.URLRequest) {
      var parameters = {};
      if (context && context.parameters) {
        var contextParameters = context.parameters;
        for (var key in contextParameters) {
          var value = contextParameters[key];
          if (!isString(value)) {
            throwError('IllegalOperationError', Errors.ObjectWithStringsParamError,
                       'LoaderContext.parameters');
          }
          parameters[key] = value;
        }
      } else {
        // TODO: parse request URL parameters.
      }
      if (context && context.applicationDomain) {
        this._contentLoaderInfo._applicationDomain =
            new ApplicationDomain(ApplicationDomain.currentDomain);
      }
      this._contentLoaderInfo._parameters = parameters;
    }

    private _createParsingWorker() {
      var loaderInfo = this._contentLoaderInfo;
      var worker;
      if (Loader.WORKERS_AVAILABLE &&
          (!(<any>Shumway).useParsingWorkerOption || (<any>Shumway).useParsingWorkerOption.value)) {
        var loaderPath = typeof LOADER_WORKER_PATH !== 'undefined' ?
                         LOADER_WORKER_PATH : SHUMWAY_ROOT + Loader.LOADER_PATH;
        worker = new Worker(loaderPath);
      } else {
        var ResourceLoader = (<any>Shumway).SWF.ResourceLoader;
        worker = new ResourceLoader(window, false);
      }
      if (!loaderInfo._allowCodeExecution) {
        this._codeExecutionPromise.reject('Disabled by _allowCodeExecution');
      }
      if (!this._waitForInitialData) {
        this._initialDataLoaded.resolve(undefined);
      }
      var loader = this;
      //loader._worker = worker;
      worker.onmessage = function (e) {
        if (e.data.type === 'exception') {
          console.log('error in parser: \n' + e.data.stack);
          AVM2.instance.exceptions.push({
                                          source: 'parser',
                                          message: e.data.message,
                                          stack: e.data.stack
                                        });
        } else {
          loader._commitData(e.data);
        }
      };
      return worker;
    }
  }
}
