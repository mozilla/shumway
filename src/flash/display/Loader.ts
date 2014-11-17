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
  import assertUnreachable = Shumway.Debug.assertUnreachable;
  import throwError = Shumway.AVM2.Runtime.throwError;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

  import ActionScriptVersion = flash.display.ActionScriptVersion;
  import AVM2 = Shumway.AVM2.Runtime.AVM2;

  import ApplicationDomain = flash.system.ApplicationDomain;
  import LoaderContext = flash.system.LoaderContext;
  import events = flash.events;

  import FileLoader = Shumway.FileLoader;
  import ILoadListener = Shumway.ILoadListener;
  import AbcFile = Shumway.AVM2.ABC.AbcFile;
  import SWFFile = Shumway.SWF.SWFFile;

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

  export class Loader extends flash.display.DisplayObjectContainer
                      implements IAdvancable, ILoadListener {

    static runtimeStartTime: number;
    private static _rootLoader: Loader;
    private static _loadQueue: Loader [];
    private static _embeddedContentLoadCount: number;

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
      Loader._loadQueue.forEach(loader => loader.unload());
      Loader.classInitializer();
    }

    static classInitializer: any = function () {
      Loader._rootLoader = null;
      Loader._loadQueue = [];
      Loader.runtimeStartTime = 0;
      Loader._embeddedContentLoadCount = 0;
    };
    static initializer: any = function() {
      var self: Loader = this;
      DisplayObject._advancableInstances.push(self);
    };

    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;


    /**
     * Handles the load status and dispatches progress events. This gets manually triggered in the
     * event loop to ensure the correct order of operations.
     */
    static progress() {
      var queue = Loader._loadQueue;
      for (var i = 0; i < queue.length; i++) {
        var instance = queue[i];
        var queuedUpdates = instance._queuedLoadUpdates;
        for (var j = 0; j < queuedUpdates.length; j++) {
          instance._applyLoadUpdate(queuedUpdates[j]);
        }
        instance._queuedLoadUpdates.length = 0;

        var loaderInfo = instance._contentLoaderInfo;
        var bytesLoaded = loaderInfo._newBytesLoaded;
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

            // Except when loading the root SWF, the first time any progress is made at all,
            // a progress event with bytesLoaded = 0 is dispatched.
            if (instance !== Loader.getRootLoader()) {
              loaderInfo.dispatchEvent(new events.ProgressEvent(events.ProgressEvent.PROGRESS,
                                                                false, false, 0, bytesTotal));
            }
            instance._loadStatus = LoadStatus.Opened;
            // Fallthrough
          case LoadStatus.Opened:
            if (!(instance._content &&
                  instance._content._hasFlags(DisplayObjectFlags.Constructed))) {
              if (loaderInfo._newBytesLoaded > loaderInfo._bytesLoaded) {
                loaderInfo._bytesLoaded = loaderInfo._newBytesLoaded;
                loaderInfo.dispatchEvent(new events.ProgressEvent(events.ProgressEvent.PROGRESS,
                                                                  false, false, bytesLoaded,
                                                                  bytesTotal));
              }
              break;
            }
            instance._loadStatus = LoadStatus.Initialized;
            loaderInfo.dispatchEvent(events.Event.getInstance(events.Event.INIT));
            // Fallthrough
          case LoadStatus.Initialized:
            if (loaderInfo._newBytesLoaded > loaderInfo._bytesLoaded) {
              loaderInfo._bytesLoaded = loaderInfo._newBytesLoaded;
              loaderInfo.dispatchEvent(new events.ProgressEvent(events.ProgressEvent.PROGRESS,
                                                                false, false, bytesLoaded,
                                                                bytesTotal));
            }
            if (bytesLoaded === bytesTotal) {
              instance._loadStatus = LoadStatus.Complete;
              instance._queuedLoadUpdates = null;
              queue.splice(i--, 1);
              loaderInfo.dispatchEvent(events.Event.getInstance(events.Event.COMPLETE));
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
      this._contentLoaderInfo._loader = this;

      this._fileLoader = null;
      this._loadStatus = LoadStatus.Unloaded;
      this._startPromise = new PromiseWrapper();
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
    private _queuedLoadUpdates: LoadProgressUpdate[];

    /**
     * Resolved when the root Loader has loaded the first frame(s) of the main SWF.
     */
    _startPromise: PromiseWrapper<any>;

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

    get content(): flash.display.DisplayObject {
      if (this._loadStatus === LoadStatus.Unloaded) {
        return null;
      }
      return this._content;
    }

    get contentLoaderInfo(): flash.display.LoaderInfo {
      return this._contentLoaderInfo;
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
      this.close();
      // TODO: clean up contentloaderInfo.
      this._contentLoaderInfo._url = request.url;
      this._applyLoaderContext(context);
      this._loadingType = LoadingType.External;
      this._fileLoader = new FileLoader(this);
      if (!release && traceLoaderOption.value) {
        console.log("Load start: " + request.url);
      }
      this._fileLoader.loadFile(request._toFileRequest());

      // TODO: Only do this if a load wasn't in progress.
      this._queuedLoadUpdates = [];
      Loader._loadQueue.push(this);
    }

    loadBytes(data: flash.utils.ByteArray, context?: LoaderContext) {
      this.close();
      // TODO: properly coerce object arguments to their types.
      // In case this is the initial root loader, we won't have a loaderInfo object. That should
      // only happen in the inspector when a file is loaded from a Blob, though.
      this._contentLoaderInfo._url = (this.loaderInfo ? this.loaderInfo._url : '') +
                                     '/[[DYNAMIC]]/' + (++Loader._embeddedContentLoadCount);
      this._applyLoaderContext(context);
      this._loadingType = LoadingType.Bytes;
      this._fileLoader = new FileLoader(this);
      this._queuedLoadUpdates = [];
      // Just passing in the bytes won't do, because the buffer can contain slop at the end.
      this._fileLoader.loadBytes(new Uint8Array((<any>data).bytes, 0, data.length));

      Loader._loadQueue.push(this);
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
        this._loadStatus = LoadStatus.Unloaded;
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
      // TODO: remove all DisplayObjects originating from the unloaded SWF from all lists and stop
      // them.
      this._unload(true, !!gc);
    }

    private _applyLoaderContext(context: LoaderContext) {
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
        var domain = new ApplicationDomain(ApplicationDomain.currentDomain);
        this._contentLoaderInfo._applicationDomain = domain;
      }
      this._contentLoaderInfo._parameters = parameters;
    }

    onLoadOpen(file: any) {
      if (file instanceof SWFFile) {
        this._contentLoaderInfo.setFile(file);
      } else {
        release || assert(file instanceof ImageFile);
        this._contentLoaderInfo._bytesTotal = file.bytesTotal;
      }
    }

    onLoadProgress(update: LoadProgressUpdate) {
      var file = this._contentLoaderInfo._file;
      if (file instanceof SWFFile) {
        this._queuedLoadUpdates.push(update);
        if (this._content || this !== Loader.getRootLoader()) {
          return;
        }
        if (file.useAVM1 && !AVM2.instance.avm1Loaded) {
          var self = this;
          this._initAvm1().then(function () {
            self.onFileStartupReady();
          });
        } else {
          this.onFileStartupReady();
        }
      } else {
        this._contentLoaderInfo.bytesLoaded = update.bytesLoaded;
      }
    }

    private _applyLoadUpdate(update: LoadProgressUpdate) {
      var loaderInfo = this._contentLoaderInfo;
      var file = loaderInfo._file;

      if (loaderInfo._allowCodeExecution) {
        var appDomain = AVM2.instance.applicationDomain;

        var abcBlocksLoaded = file.abcBlocks.length;
        var abcBlocksLoadedDelta = abcBlocksLoaded - loaderInfo._abcBlocksLoaded;
        if (abcBlocksLoadedDelta > 0) {
          for (var i = loaderInfo._abcBlocksLoaded; i < abcBlocksLoaded; i++) {
            var abcBlock = file.abcBlocks[i];
            var abc = new AbcFile(abcBlock.data, abcBlock.name);
            if (abcBlock.flags) {
              // kDoAbcLazyInitializeFlag = 1 Indicates that the ABC block should not be executed
              // immediately.
              appDomain.loadAbc(abc);
            } else {
              // TODO: probably delay execution until playhead reaches the frame.
              appDomain.executeAbc(abc);
            }
          }
          loaderInfo._abcBlocksLoaded = abcBlocksLoaded;
        }

        var mappedSymbolsLoaded = file.symbolClassesList.length;
        var mappedSymbolsLoadedDelta = mappedSymbolsLoaded - loaderInfo._mappedSymbolsLoaded;
        if (mappedSymbolsLoadedDelta > 0) {
          for (var i = loaderInfo._mappedSymbolsLoaded; i < mappedSymbolsLoaded; i++) {
            var symbolMapping = file.symbolClassesList[i];
            var symbolClass = appDomain.getClass(symbolMapping.className);
            Object.defineProperty(symbolClass, "defaultInitializerArgument",
                                  {get: loaderInfo.getSymbolResolver(symbolClass, symbolMapping.id),
                                   configurable: true});
          }
          loaderInfo._mappedSymbolsLoaded = mappedSymbolsLoaded;
        }
      }

      var fontsLoaded = file.fonts.length;
      var fontsLoadedDelta = fontsLoaded - loaderInfo._fontsLoaded;
      if (fontsLoadedDelta > 0) {
        for (var i = loaderInfo._fontsLoaded; i < fontsLoaded; i++) {
          flash.text.Font.registerLazyFont(file.fonts[i], loaderInfo);
        }
        loaderInfo._fontsLoaded = fontsLoaded;
      }

      var rootSymbol = loaderInfo.getRootSymbol();
      loaderInfo.bytesLoaded = update.bytesLoaded;
      var framesLoadedDelta = file.framesLoaded - rootSymbol.frames.length;
      if (framesLoadedDelta === 0) {
        return;
      }
      var root = this._content;
      if (!root) {
        if (Loader.getRootLoader() === this) {
          // For the root loader, make sure that the real bytesLoaded value is set before any
          // script runs.
          loaderInfo._bytesLoaded = update.bytesLoaded;
        }
        root = this.createContentRoot(loaderInfo.getRootSymbol(),
                                      file.sceneAndFrameLabelData);
      }
      // For AVM1 SWFs directly loaded into AVM2 ones (or as the top-level SWF), unwrap the
      // contained MovieClip here to correctly initialize frame data.
      if (AVM1Movie.isType(root)) {
        root = <AVM1Movie>root._children[0];
      }
      var rootSprite = <Sprite><any>root;
      for (var i = 0; i < framesLoadedDelta; i++) {
        var frameInfo = loaderInfo.getFrame(null, rootSymbol.frames.length);
        rootSprite._addFrame(frameInfo);
      }
    }
    onLoadComplete() {
      var file = this._fileLoader._file;
      if (file instanceof ImageFile) {
        var bitmapData = flash.display.BitmapData.initializeFrom(file);
        flash.display.BitmapData.instanceConstructorNoInitialize.call(bitmapData);
        this._content = new flash.display.Bitmap(bitmapData);
        this._contentLoaderInfo._width = this._content.width;
        this._contentLoaderInfo._height = this._content.height;
        this.addTimelineObjectAtDepth(this._content, 0);
      }
    }
    onLoadError() {
      // Go away, TSLint.
    }

    private onFileStartupReady() {
      // The first frames have been loaded, kick off event loop.
      this._startPromise.resolve(null);
      if (this === Loader.getRootLoader()) {
        if (!release && traceLoaderOption.value) {
          console.log("Initial frames loaded, starting main runtime event loop.");
        }
        Loader.runtimeStartTime = Date.now();
      }
      // The very first update is applied immediately, as that creates the root content,
      // which the player expects to exist at this point.
      this._applyLoadUpdate(this._queuedLoadUpdates.shift());
    }

    private createContentRoot(symbol: Timeline.SpriteSymbol, sceneData) {
      var root = symbol.symbolClass.initializeFrom(symbol);
      // The root object gets a default of 'rootN', which doesn't use up a DisplayObject instance
      // ID.
      flash.display.DisplayObject._instanceID--;
      root._name = 'root1'; // TODO: make this increment for subsequent roots.

      if (MovieClip.isType(root)) {
        var mc = <MovieClip>root;
        if (sceneData) {
          var scenes = sceneData.scenes;
          for (var i = 0, n = scenes.length; i < n; i++) {
            var sceneInfo = scenes[i];
            var offset = sceneInfo.offset;
            var endFrame = i < n - 1 ? scenes[i + 1].offset : symbol.numFrames;
            mc.addScene(sceneInfo.name, [], offset, endFrame - offset);
          }
          var labels = sceneData.labels;
          for (var i = 0; i < labels.length; i++) {
            var labelInfo = labels[i];
            mc.addFrameLabel(labelInfo.name, labelInfo.frame + 1);
          }
        } else {
          mc.addScene('Scene 1', [], 0, symbol.numFrames);
        }
      }

      var loaderInfo = this._contentLoaderInfo;
      root._loaderInfo = loaderInfo;
      if (loaderInfo._actionScriptVersion === ActionScriptVersion.ACTIONSCRIPT2) {
        root = this._content = this._initAvm1Root(root);
      } else {
        this._content = root;
      }
      this.addTimelineObjectAtDepth(this._content, 0);
      return root;
    }

    private _initAvm1(): Promise<any> {
      var contentLoaderInfo: LoaderInfo = this._contentLoaderInfo;
      // Only the outermost AVM1 SWF gets an AVM1Context. SWFs loaded into it share that context.
      if (this.loaderInfo && this.loaderInfo._avm1Context) {
        contentLoaderInfo._avm1Context = this.loaderInfo._avm1Context;
        return null;
      }
      return AVM2.instance.loadAVM1().then(function() {
        contentLoaderInfo._avm1Context = Shumway.AVM1.AVM1Context.create(contentLoaderInfo);
      });
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
  }
}
