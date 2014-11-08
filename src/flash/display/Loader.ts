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
module Shumway.AVM2.AS.flash.display {
  import assert = Shumway.Debug.assert;
  import warning = Shumway.Debug.warning;
  import assertUnreachable = Shumway.Debug.assertUnreachable;
  import notImplemented = Shumway.Debug.notImplemented;
  import throwError = Shumway.AVM2.Runtime.throwError;
  import Telemetry = Shumway.Telemetry;

  import AVM2 = Shumway.AVM2.Runtime.AVM2;
  import FileLoader = Shumway.FileLoader;
  import ILoadListener = Shumway.ILoadListener;
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

  function getPlayer(): any {
    return AVM2.instance.globals['Shumway.Player.Utils'];
  }

  export class Loader extends flash.display.DisplayObjectContainer
                      implements IAdvancable, ILoadListener {

    private static _rootLoader: Loader;
    private static _loadQueue: Loader [];
    private static _embeddedContentLoadCount: number = 0;

    private _writer: IndentingWriter;

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
    static instanceSymbols: string [] = null;

    static WORKERS_AVAILABLE = typeof Worker !== 'undefined';
    static LOADER_PATH = 'swf/worker.js';

    static runtimeStartTime: number = 0;

    private static _commitFrameQueue: {loader: Loader; data: any}[] = [];

    /**
     * Handles the load status and dispatches progress events. This gets manually triggered in the
     * event loop to ensure the correct order of operations.
     */
    static progress() {
      Loader.FlushCommittedFrames();
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

            // The first time any progress is made at all, a progress event with bytesLoaded = 0
            // is dispatched.
            loaderInfo.dispatchEvent(new events.ProgressEvent(events.ProgressEvent.PROGRESS,
                                                              false, false, 0, bytesTotal));
            instance._loadStatus = LoadStatus.Opened;
            // Fallthrough
          case LoadStatus.Opened:
            if (loaderInfo._bytesLoadedChanged) {
              loaderInfo._bytesLoadedChanged = false;
              loaderInfo.dispatchEvent(new events.ProgressEvent(events.ProgressEvent.PROGRESS,
                                                                false, false, bytesLoaded,
                                                                bytesTotal));
            }
            if (!(instance._content &&
                  instance._content._hasFlags(DisplayObjectFlags.Constructed))) {
              break;
            }
            instance._loadStatus = LoadStatus.Initialized;
            loaderInfo.dispatchEvent(events.Event.getInstance(events.Event.INIT));
            // Fallthrough
          case LoadStatus.Initialized:
            if (bytesLoaded === bytesTotal) {
              instance._loadStatus = LoadStatus.Complete;
              loaderInfo.dispatchEvent(events.Event.getInstance(events.Event.COMPLETE));
            }
            break;
          case LoadStatus.Complete:
            queue.splice(i--, 1);
            break;
          default:
            assertUnreachable("Mustn't encounter unhandled status in Loader queue.");
        }
      }
    }

    private static FlushCommittedFrames() {
      var frames = Loader._commitFrameQueue;
      for (var i = 0; i < frames.length; i++) {
        frames[i].loader._commitFrame(frames[i].data);
      }
      frames.length = 0;
    }

    constructor () {
      false && super();
      DisplayObjectContainer.instanceConstructorNoInitialize.call(this);

      this._writer = new IndentingWriter();
      this._content = null;
      this._contentLoaderInfo = new flash.display.LoaderInfo();

      this._fileLoader = null;
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

    addChild(child: DisplayObject): DisplayObject {
      throwError('IllegalOperationError', Errors.InvalidLoaderMethodError);
      return null;
    }

    addChildAt(child: DisplayObject, index: number): DisplayObject {
      throwError('IllegalOperationError', Errors.InvalidLoaderMethodError);
      return null;
    }

    removeChild(child: DisplayObject): DisplayObject {
      throwError('IllegalOperationError', Errors.InvalidLoaderMethodError);
      return null;
    }

    removeChildAt(index: number): DisplayObject {
      throwError('IllegalOperationError', Errors.InvalidLoaderMethodError);
      return null;
    }

    setChildIndex(child: DisplayObject, index: number): void {
      throwError('IllegalOperationError', Errors.InvalidLoaderMethodError);
    }

    // AS -> JS Bindings

    private _content: flash.display.DisplayObject;
    private _contentLoaderInfo: flash.display.LoaderInfo;
    _uncaughtErrorEvents: flash.events.UncaughtErrorEvents;

    private _fileLoader: FileLoader;
    private _loadStatus: LoadStatus;
    private _loadingType: LoadingType;

    private _initialDataLoaded: PromiseWrapper<any>;
    private _waitForInitialData: boolean;
    private _commitDataQueue: Promise<any>;
    private _frameAssetsQueue: Array<Promise<any>>;

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

    /**
     * No way of knowing what's in |data|, so do a best effort to print out some meaninfgul debug info.
     */
    private _describeData(data: any): string {
      var keyValueParis = [];
      for (var k in data) {
        keyValueParis.push(k + ":" + StringUtilities.toSafeString(data[k]));
      }
      return "{" + keyValueParis.join(", ") + "}";
    }

    /**
     * Chain a promise for |data| to the previous promise.
     */
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

      var nextPromise = this._commitDataQueue.then(this._commitQueuedData.bind(this, data));
      if (traceLoaderOption.value) {
        this._writer.writeTimeLn("Making for: " + this._describeData(data));
      }
      this._commitDataQueue = nextPromise;
    }

    /**
     * Returns a promise for the requested |data|. Some of these resolve right away, returning |null|
     * others return a promise that is suspended until some other thing is resolved, like font loading
     * or image decoding.
     */
    private _commitQueuedData(data: any): Promise<any> {
      var loaderInfo = this._contentLoaderInfo;
      var command = data.command;
      var suspendUntil: Promise<any> = null;

      if (traceLoaderOption.value) {
        this._writer.writeTimeLn("Executing Promise: " + this._describeData(data));
      }

      switch (command) {
        case 'init':
          var info = data.result;

          loaderInfo.bytesLoaded = info.bytesLoaded;
          loaderInfo._bytesTotal = info.bytesTotal;
          loaderInfo._swfVersion = info.swfVersion;
          loaderInfo._frameRate = info.frameRate;
          var bbox = info.bbox;
          loaderInfo._width = bbox.xMax - bbox.xMin;
          loaderInfo._height = bbox.yMax - bbox.yMin;

          var rootSymbol = new Timeline.SpriteSymbol(0, true);
          rootSymbol.numFrames = info.frameCount;
          loaderInfo.registerSymbol(rootSymbol);

          if (!info.fileAttributes || !info.fileAttributes.doAbc) {
            loaderInfo._actionScriptVersion = ActionScriptVersion.ACTIONSCRIPT2;
            suspendUntil = this._initAvm1();
            if (traceLoaderOption.value) {
              this._writer.writeTimeLn("Suspending until AVM1 is initialized.");
            }
          }
          break;
        case 'progress':
          var info = data.result;
          var bytesLoaded = info.bytesLoaded;
          var bytesTotal = info.bytesTotal;
          release || assert (bytesLoaded <= bytesTotal, "Loaded bytes must not exceed total bytes.");
          if (!loaderInfo._bytesTotal) {
            loaderInfo._bytesTotal = bytesTotal;
          } else {
            release || assert (loaderInfo._bytesTotal === bytesTotal, "Total bytes must not change.");
          }
          // Content code might rely on specific values for bytesLoaded to assume embedded assets
          // to be available. Hence, we delay updating the value until we can guarantee availability
          // of decoded data for all preceding bytes.
          if (this._frameAssetsQueue) {
            suspendUntil = Promise.all(this._frameAssetsQueue).then(function () {
              loaderInfo.bytesLoaded = bytesLoaded;
            });
          } else {
            loaderInfo.bytesLoaded = bytesLoaded;
          }
          this._progressPromise.resolve(undefined);
          if (traceLoaderOption.value) {
            this._writer.writeTimeLn("Resolving progress promise.");
          }
          break;
        case 'complete':
          if (data.stats) {
            Telemetry.instance.reportTelemetry(data.stats);
          }

          this._fileLoader = null;
          break;
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
            if (this._frameAssetsQueue) {
              if (traceLoaderOption.value) {
                this._writer.writeTimeLn("Suspending frame execution until all of its assets are resolved.");
              }
              var self = this;
              suspendUntil = Promise.all(this._frameAssetsQueue).then(function () {
                self._enqueueFrame(data);
                self._frameAssetsQueue = null;
              });
            } else {
              this._enqueueFrame(data);
            }
          } else if (data.type === 'image') {
            this._commitImage(data);
          } else if (data.type === 'abc') {
            if (loaderInfo._allowCodeExecution) {
              var appDomain = AVM2.instance.applicationDomain;
              var abc = new AbcFile(data.data, data.name);
              if (data.flags) {
                // kDoAbcLazyInitializeFlag = 1 Indicates that the ABC block should not be executed
                // immediately.
                appDomain.loadAbc(abc);
              } else {
                if (this._frameAssetsQueue) {
                  suspendUntil = Promise.all(this._frameAssetsQueue).then(function () {
                    appDomain.executeAbc(abc);
                  });
                } else {
                  appDomain.executeAbc(abc);
                }
              }
            }
          }
          break;
      }
      return suspendUntil;
    }

    private _initAvm1(): Promise<any> {
      var contentLoaderInfo: LoaderInfo = this._contentLoaderInfo;
      // Only the outermost AVM1 SWF gets an AVM1Context. SWFs loaded into it share that context.
      if (this.loaderInfo && this.loaderInfo._avm1Context) {
        contentLoaderInfo._avm1Context = this.loaderInfo._avm1Context;
        return null;
      }
      return AVM2.instance.loadAVM1().then(function() {
        var swfVersion = contentLoaderInfo.swfVersion;
        contentLoaderInfo._avm1Context = Shumway.AVM1.AVM1Context.create(swfVersion);
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
          var bitmapSymbol = symbol = Timeline.BitmapSymbol.FromData(data);
          if (bitmapSymbol.type === ImageType.PNG ||
              bitmapSymbol.type === ImageType.GIF ||
              bitmapSymbol.type === ImageType.JPEG) {
            if (!this._frameAssetsQueue) {
              this._frameAssetsQueue = [];
            }
            this._frameAssetsQueue.push(new Promise(function (resolve) {
              getPlayer().decodeImage(bitmapSymbol, resolve);
            }));
          }
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

          if (font.fontType === flash.text.FontType.DEVICE) {
            break;
          }

          getPlayer().registerFont(font);

          // For non-Firefox browsers, we have to wait until font is "loaded"
          if (typeof navigator !== 'undefined' &&
              navigator.userAgent.indexOf('Firefox') < 0) {
            if (!this._frameAssetsQueue) {
              this._frameAssetsQueue = [];
            }
            this._frameAssetsQueue.push(new Promise(function (resolve) {
              setTimeout(resolve, 400 /* ms */);
            }));
          }
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

    /**
     * Enqueues a frame for addition to the target Sprite/MovieClip.
     *
     * Frames aren't immediately committed because doing so also enqueues execution of
     * constructors of any contained timeline children. In order to preserve the correct
     * order of their execution relative to when Loader events are dispatched and the
     * frame event cycle is run, we just enqueue them here.
     *
     * The only exception is the first frame of the main root's timeline. That is committed
     * immediately as it triggers all code execution in the first place: the event loop
     * isn't run before.
     */
    private _enqueueFrame(data: any): void {
      if (this === Loader.getRootLoader()) {
        var isFirstFrame = !this._content;
        this._commitFrame(data);

        // TODO: the comment above says that only the root's first frame is committed eagerly.
        // That, however, breaks content that has something like `nextFrame()` in its first frame.
        // It's not entirely clear how to fix this issue, really.
        if (isFirstFrame) {
          Loader.runtimeStartTime = Date.now();
          this._codeExecutionPromise.resolve(undefined);
        }
      } else {
        Loader._commitFrameQueue.push({loader: this, data: data});
      }
    }

    private _commitFrame(data: any) {
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
            var symbol = loaderInfo.getSymbolById(asset.symbolId);
            if (!symbol) {
              warning ("Symbol " + asset.symbolId + " is not defined.");
              continue;
            }
            var symbolClass = appDomain.getClass(asset.className);
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
          if (!symbol) {
            warning ("Symbol " + asset.symbolId + " is not defined.");
            continue;
          }
          loaderInfo._avm1Context.addAsset(asset.className, asset.symbolId, symbol);
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

        root._loaderInfo = loaderInfo;
        if (loaderInfo._actionScriptVersion === ActionScriptVersion.ACTIONSCRIPT2) {
          root = this._content = this._initAvm1Root(root);
        } else {
          this._content = root;
        }
        this.addTimelineObjectAtDepth(this._content, 0);
      }

      // For AVM1 SWFs directly loaded into AVM2 ones (or as the top-level SWF), unwrap the
      // contained MovieClip here to correctly initialize frame data.
      if (AVM1Movie.isType(root)) {
        root = <AVM1Movie>root._children[0];
      }

      if (MovieClip.isType(root)) {
        var rootMovie: MovieClip = <MovieClip>root;

        if (data.labelName) {
          rootMovie.addFrameLabel(data.labelName, frameIndex + 1);
        }

        if (loaderInfo._actionScriptVersion === ActionScriptVersion.ACTIONSCRIPT2) {
          avm1lib.getAVM1Object(root).addFrameActionBlocks(frameIndex, data);
        }

        if (data.soundStream) {
          rootMovie._initSoundStream(data.soundStream);
        }
        if (data.soundStreamBlock) {
          rootMovie._addSoundStreamBlock(frameIndex + 1, data.soundStreamBlock);
        }
      }
    }

    /**
     * For AVM1 SWFs that aren't loaded into other AVM1 SWFs, create an AVM1Movie container
     * and wrap the root timeline into it. This associates the AVM1Context with this AVM1
     * MovieClip tree, including potential nested SWFs.
     */
    private _initAvm1Root(root: flash.display.DisplayObject) {
      var as2Object = avm1lib.getAVM1Object(root);

      // Only create an AVM1Movie container for the outermost AVM1 SWF. Nested AVM1 SWFs just get
      // their content added to the loading SWFs display list directly.
      if (this.loaderInfo && this.loaderInfo._avm1Context) {
        as2Object.context = this.loaderInfo._avm1Context;
        return root;
      }

      var avm1Context = this._contentLoaderInfo._avm1Context;
      avm1Context.root = as2Object;
      as2Object.context = avm1Context;
      root.addEventListener('frameConstructed',
                            avm1Context.flushPendingScripts.bind(avm1Context),
                            false,
                            Number.MAX_VALUE);

      var avm1Movie = new flash.display.AVM1Movie();
      avm1Movie.initializeContent(<MovieClip>root);
      this._content = avm1Movie;

      // transfer parameters
      var parameters = this._contentLoaderInfo._parameters;
      for (var paramName in parameters) {
        if (!(paramName in as2Object)) { // not present yet
          as2Object[paramName] = parameters[paramName];
        }
      }

      return avm1Movie;
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

      // Complete load process manually here to avoid any additional progress events to be fired.
      this._loadStatus = LoadStatus.Initialized;
      loaderInfo.dispatchEvent(events.Event.getInstance(events.Event.INIT));
      this._loadStatus = LoadStatus.Complete;
      loaderInfo.dispatchEvent(events.Event.getInstance(events.Event.COMPLETE));
      this._loadStatus = LoadStatus.Complete;
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

    close(): void {
      if (!this._fileLoader) {
        return;
      }
      this._fileLoader.abortLoad();
      this._fileLoader = null;
    }

    _unload(stopExecution: boolean, gc: boolean): void {
      if (this._loadStatus < LoadStatus.Initialized) {
        return;
      }
      this.close();
      this._content = null;
      this._contentLoaderInfo._loader = null;
      this._loadStatus = LoadStatus.Unloaded;
      this.dispatchEvent(events.Event.getInstance(events.Event.UNLOAD));
    }
    unload() {
      this._unload(false, false);
    }
    unloadAndStop(gc: boolean) {
      this._unload(true, !!gc);
    }

    _getJPEGLoaderContextdeblockingfilter(context: flash.system.LoaderContext): number {
      if (flash.system.JPEGLoaderContext.isType(context)) {
        return (<flash.system.JPEGLoaderContext>context).deblockingFilter;
      }
      return 0.0;
    }

    get uncaughtErrorEvents(): events.UncaughtErrorEvents {
      return this._uncaughtErrorEvents;
    }

    load(request: flash.net.URLRequest, context?: LoaderContext): void {
      this._contentLoaderInfo._url = request.url;
      this._applyLoaderContext(context, request);
      this._loadingType = LoadingType.External;
      this.close();
      this._fileLoader = new FileLoader(this);
      this._fileLoader.loadFile(request._toFileRequest());

      Loader._loadQueue.push(this);

      if (this === Loader.getRootLoader()) {
        if (!this._contentLoaderInfo._allowCodeExecution) {
          this._codeExecutionPromise.reject('Disabled by _allowCodeExecution');
        }
        if (!this._waitForInitialData) {
          this._initialDataLoaded.resolve(undefined);
        }
      }
    }

    onLoadOpen() {
      // Go away, TSLint.
    }
    onLoadProgress(data) {
      this._commitData(data);
    }
    onLoadComplete() {
      // Go away, TSLint.
    }
    onLoadError() {
      // Go away, TSLint.
    }

    loadBytes(data: flash.utils.ByteArray, context?: LoaderContext): void
    {
      // TODO: properly coerce object arguments to their types.
      // In case this is the initial root loader, we won't have a loaderInfo object. That should
      // only happen in the inspector when a file is loaded from a Blob, though.
      this._contentLoaderInfo._url = (this.loaderInfo ? this.loaderInfo._url : '') +
                                     '/[[DYNAMIC]]/' + (++Loader._embeddedContentLoadCount);
      this._applyLoaderContext(context, null);
      this._loadingType = LoadingType.Bytes;
      this.close();
      this._fileLoader = new FileLoader(this);
      this._fileLoader.loadBytes((<any>data).bytes);

      Loader._loadQueue.push(this);
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
      }
      if (context && context.applicationDomain) {
        this._contentLoaderInfo._applicationDomain =
            new ApplicationDomain(ApplicationDomain.currentDomain);
      }
      this._contentLoaderInfo._parameters = parameters;
    }
  }
}
