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
module Shumway.AVMX.AS.flash.display {
  import assert = Shumway.Debug.assert;
  import assertUnreachable = Shumway.Debug.assertUnreachable;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;

  import ActionScriptVersion = flash.display.ActionScriptVersion;

  import LoaderContext = flash.system.LoaderContext;
  import events = flash.events;
  import ICrossDomainSWFLoadingWhitelist = flash.system.ICrossDomainSWFLoadingWhitelist;
  import CrossDomainSWFLoadingWhitelistResult = flash.system.CrossDomainSWFLoadingWhitelistResult;

  import FileLoader = Shumway.FileLoader;
  import ILoadListener = Shumway.ILoadListener;
  import SWFFile = Shumway.SWF.SWFFile;

  import enterTimeline = Shumway.AVM2.enterTimeline;
  import leaveTimeline = Shumway.AVM2.leaveTimeline;

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

    static axClass: typeof Loader;

    static runtimeStartTime: number;
    private static _rootLoader: Loader;
    private static _loadQueue: Loader [];
    private static _embeddedContentLoadCount: number;

    /**
     * Creates or returns the root Loader instance. The loader property of that instance's
     * LoaderInfo object is always null. Also, no OPEN event ever gets dispatched.
     */
    static getRootLoader(): Loader {
      if (this._rootLoader) {
        return this._rootLoader;
      }
      var loader = new this.sec.flash.display.Loader();
      // The root loaderInfo's `loader` property is always null.
      loader._contentLoaderInfo._loader = null;
      this._rootLoader = loader;
      return loader;
    }

    static reset() {
      this.sec.flash.display.Loader.axClass._loadQueue.forEach(loader => loader.unload());
      Loader.classInitializer();
    }

    static classInitializer() {
      this._rootLoader = null;
      this._loadQueue = [];
      this.runtimeStartTime = 0;
      this._embeddedContentLoadCount = 0;
    }

    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    /**
     * In each turn of the event loop, Loader events are processed in two batches:
     * first INIT and COMPLETE events are dispatched for all active Loaders, then
     * OPEN and PROGRESS.
     *
     * A slightly weird result of this is that INIT and COMPLETE are dispatched at
     * least one turn later than the other events: INIT is dispatched after the
     * content has been created. That, in turn, happens under
     * `DisplayObject.performFrameNavigation` in reaction to enough data being
     * marked as available - which happens in the second batch of Loader event
     * processing.
     */
    static processEvents() {
      var loaderClass = this.sec.flash.display.Loader.axClass;
      loaderClass.processEarlyEvents();
      loaderClass.processLateEvents();
    }
    private static processEarlyEvents() {
      var loaderClass = this.sec.flash.display.Loader.axClass;
      var queue = loaderClass._loadQueue;
      for (var i = 0; i < queue.length; i++) {
        var instance = queue[i];
        release || assert(instance._loadStatus !== LoadStatus.Complete);
        var loaderInfo = instance._contentLoaderInfo;
        var imageSymbol = instance._imageSymbol;

        // For images, only dispatch INIT and COMPLETE once the image has been decoded.
        if (loaderInfo._file instanceof ImageFile) {
          if (!imageSymbol || !imageSymbol.ready || instance._queuedLoadUpdate) {
            continue;
          }
          release || assert(loaderInfo.bytesLoaded === loaderInfo.bytesTotal);
          instance._applyDecodedImage(imageSymbol);
          release || assert(instance._content);
        }

        if (instance._loadStatus === LoadStatus.Opened && instance._content) {
          enterTimeline("Loader.INIT");
          try {
            loaderInfo.dispatchEvent(this.sec.flash.events.Event.axClass.getInstance(events.Event.INIT));
          } catch (e) {
            Debug.warning('caught error under loaderInfo INIT event:', e);
          }
          leaveTimeline();
          instance._loadStatus = LoadStatus.Initialized;
          // Only for the root loader, progress events for the data loaded up until now are
          // dispatched here.
          if (instance === this.sec.flash.display.Loader.axClass._rootLoader) {
            enterTimeline("Loader.Progress", 'rootLoader');
            try {
              loaderInfo.dispatchEvent(new this.sec.flash.events.ProgressEvent(
                                                                events.ProgressEvent.PROGRESS,
                                                                false, false,
                                                                loaderInfo.bytesLoaded,
                                                                loaderInfo.bytesTotal));
            } catch (e) {
              Debug.warning('caught error under loaderInfo PROGRESS event:', e);
            }
            leaveTimeline();
          }
        }

        if (instance._loadStatus === LoadStatus.Initialized &&
            loaderInfo.bytesLoaded === loaderInfo.bytesTotal) {
          queue.splice(i--, 1);
          release || assert(queue.indexOf(instance) === -1);
          instance._loadStatus = LoadStatus.Complete;
          enterTimeline("Loader.Complete");
          try {
            loaderInfo.dispatchEvent(this.sec.flash.events.Event.axClass.getInstance(events.Event.COMPLETE));
          } catch (e) {
            Debug.warning('caught error under loaderInfo COMPLETE event: ', e);
          }
          leaveTimeline();
        }
      }
    }

    private static processLateEvents() {
      var queue = this.sec.flash.display.Loader.axClass._loadQueue;
      for (var i = 0; i < queue.length; i++) {
        var instance = queue[i];
        release || assert(instance._loadStatus !== LoadStatus.Complete);

        var loaderInfo = instance._contentLoaderInfo;
        var update = instance._queuedLoadUpdate;
        var bytesTotal = loaderInfo._bytesTotal;
        if ((!update || !bytesTotal) && instance._loadStatus !== LoadStatus.Opened) {
          continue;
        }
        instance._queuedLoadUpdate = null;

        var progressEventCtor = this.sec.flash.events.ProgressEvent;
        if (instance._loadStatus === LoadStatus.Unloaded) {
          // OPEN is only dispatched when loading external resources, not for loadBytes.
          if (instance._loadingType === LoadingType.External) {
            enterTimeline("Loader.Open");
            try {
              loaderInfo.dispatchEvent(this.sec.flash.events.Event.axClass.getInstance(events.Event.OPEN));
            } catch (e) {
              Debug.warning('caught error under loaderInfo OPEN event: ', e);
            }
            leaveTimeline();
          }
          // The first time any progress is made at all, a progress event with bytesLoaded = 0
          // is dispatched.
          enterTimeline("Loader.Progress");
          try {
            loaderInfo.dispatchEvent(new progressEventCtor(events.ProgressEvent.PROGRESS,
                                                           false, false, 0, bytesTotal));
          } catch (e) {
            Debug.warning('caught error under loaderInfo PROGRESS event: ', e);
          }
          leaveTimeline();
          instance._loadStatus = LoadStatus.Opened;
        }

        // TODO: The Flash player reports progress in 16kb chunks, in a tight loop right here.
        if (update) {
          instance._applyLoadUpdate(update);
          enterTimeline("Loader.Progress");
          try {
            loaderInfo.dispatchEvent(new progressEventCtor(events.ProgressEvent.PROGRESS,
                                                           false, false, update.bytesLoaded,
                                                           bytesTotal));
          } catch (e) {
            Debug.warning('caught error under loaderInfo PROGRESS event: ', e);
          }
          leaveTimeline();
        }
      }
    }

    constructor () {
      super();

      var displayObjectClass = this.sec.flash.display.DisplayObject.axClass;
      displayObjectClass._advancableInstances.push(this);
      this._content = null;
      if (this.axClass._rootLoader) {
        // Loader reserves the next instance ID to use for the loaded content.
        // This isn't needed for the first, root, loader, because that uses "root1" as the name.
        this._contentID = displayObjectClass._instanceID++;
      } else {
        // The root loader gets a default name, but it's not visible and hence
        // the instance id must not be used up.
        displayObjectClass._instanceID--;
      }
      var loaderInfoCtor = this.sec.flash.display.LoaderInfo;
      this._contentLoaderInfo = new loaderInfoCtor(loaderInfoCtor.axClass.CtorToken);
      this._contentLoaderInfo._loader = this;

      var currentAbc = AVMX.getCurrentABC();
      if (currentAbc) {
        this._contentLoaderInfo._loaderUrl = currentAbc.env.url;
      }

      this._fileLoader = null;
      this._loadStatus = LoadStatus.Unloaded;
    }

    _setStage(stage: Stage) {
      release || assert(this === this.sec.flash.display.Loader.axClass.getRootLoader());
      this._stage = stage;
    }

    _initFrame(advance: boolean) {
      // ...
    }

    _constructFrame() {
      if (this === this.sec.flash.display.Loader.axClass.getRootLoader() && this._content) {
        this.sec.flash.display.DisplayObject.axClass._advancableInstances.remove(this);
        this._children[0] = this._content;
        this._constructChildren();
        this._children.length = 0;
        return;
      }
      this._constructChildren();
    }

    addChild(child: DisplayObject): DisplayObject {
      this.sec.throwError('IllegalOperationError', Errors.InvalidLoaderMethodError);
      return null;
    }

    addChildAt(child: DisplayObject, index: number): DisplayObject {
      this.sec.throwError('IllegalOperationError', Errors.InvalidLoaderMethodError);
      return null;
    }

    removeChild(child: DisplayObject): DisplayObject {
      this.sec.throwError('IllegalOperationError', Errors.InvalidLoaderMethodError);
      return null;
    }

    removeChildAt(index: number): DisplayObject {
      this.sec.throwError('IllegalOperationError', Errors.InvalidLoaderMethodError);
      return null;
    }

    setChildIndex(child: DisplayObject, index: number): void {
      this.sec.throwError('IllegalOperationError', Errors.InvalidLoaderMethodError);
    }

    // AS -> JS Bindings

    private _content: flash.display.DisplayObject;
    private _contentID: number;
    private _contentLoaderInfo: flash.display.LoaderInfo;
    private _uncaughtErrorEvents: flash.events.UncaughtErrorEvents;

    private _fileLoader: FileLoader;
    private _imageSymbol: BitmapSymbol;
    private _loadStatus: LoadStatus;
    private _loadingType: LoadingType;
    private _queuedLoadUpdate: LoadProgressUpdate;

    /**
     * No way of knowing what's in |data|, so do a best effort to print out some meaninfgul debug
     * info.
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
      if (this.sec.flash.system.JPEGLoaderContext.axClass.axIsType(context)) {
        return (<flash.system.JPEGLoaderContext>context).deblockingFilter;
      }
      return 0.0;
    }

    get uncaughtErrorEvents(): events.UncaughtErrorEvents {
      release || somewhatImplemented("public flash.display.Loader::uncaughtErrorEvents");
      if (!this._uncaughtErrorEvents) {
        this._uncaughtErrorEvents = new events.UncaughtErrorEvents();
      }
      return this._uncaughtErrorEvents;
    }

    private _canLoadSWFFromDomain(url: string): CrossDomainSWFLoadingWhitelistResult {
      url = FileLoadingService.instance.resolveUrl(url);
      var whitelist: ICrossDomainSWFLoadingWhitelist = this.sec.player;
      return whitelist.checkDomainForSWFLoading(url);
    }

    load(request: flash.net.URLRequest, context?: LoaderContext): void {
      this.close();
      // TODO: clean up contentloaderInfo.
      var resolvedURL = FileLoadingService.instance.resolveUrl(request.url);
      this._contentLoaderInfo._url = resolvedURL;
      this._applyLoaderContext(context);
      this._loadingType = LoadingType.External;
      var fileLoader = this._fileLoader = new FileLoader(this, this._contentLoaderInfo);
      if (!release && traceLoaderOption.value) {
        console.log("Loading url " + request.url);
      }
      fileLoader.loadFile(request._toFileRequest());

      this._queuedLoadUpdate = null;
      var loaderClass = this.sec.flash.display.Loader.axClass;
      release || assert(loaderClass._loadQueue.indexOf(this) === -1);
      loaderClass._loadQueue.push(this);
    }

    loadBytes(data: flash.utils.ByteArray, context?: LoaderContext) {
      this.close();
      // TODO: properly coerce object arguments to their types.
      var loaderClass = this.sec.flash.display.Loader.axClass;
      // In case this is the initial root loader, we won't have a loaderInfo object. That should
      // only happen in the inspector when a file is loaded from a Blob, though.
      this._contentLoaderInfo._url = (this.loaderInfo ? this.loaderInfo._url : '') +
                                     '/[[DYNAMIC]]/' + (++loaderClass._embeddedContentLoadCount);
      this._applyLoaderContext(context);
      this._loadingType = LoadingType.Bytes;
      this._fileLoader = new FileLoader(this, this._contentLoaderInfo);
      this._queuedLoadUpdate = null;
      if (!release && traceLoaderOption.value) {
        console.log("Loading embedded symbol " + this._contentLoaderInfo._url);
      }
      // Just passing in the bytes won't do, because the buffer can contain slop at the end.
      this._fileLoader.loadBytes(new Uint8Array((<any>data).bytes, 0, data.length));

      release || assert(loaderClass._loadQueue.indexOf(this) === -1);
      loaderClass._loadQueue.push(this);
    }

    close(): void {
      var queueIndex = this.sec.flash.display.Loader.axClass._loadQueue.indexOf(this);
      if (queueIndex > -1) {
        this.sec.flash.display.Loader.axClass._loadQueue.splice(queueIndex, 1);
      }
      this._contentLoaderInfo.reset();
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
      this.dispatchEvent(this.sec.flash.events.Event.axClass.getInstance(events.Event.UNLOAD));
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
      var parameters = context && context.parameters ?
                       transformASValueToJS(this.sec, context.parameters, false) :
                       {};
      if (context && context.applicationDomain) {
        this._contentLoaderInfo._applicationDomain = context.applicationDomain;
      } else if (this._loaderInfo && this._loaderInfo._applicationDomain) {
        this._contentLoaderInfo._applicationDomain = this._loaderInfo._applicationDomain;
      } else {
        this._contentLoaderInfo._applicationDomain = new this.sec.flash.system.ApplicationDomain();
      }
      this._contentLoaderInfo._parameters = parameters;
      this._contentLoaderInfo._allowCodeImport = context ? context.allowCodeImport : true;
      this._contentLoaderInfo._checkPolicyFile = context ? context.checkPolicyFile : false;
    }

    onLoadOpen(file: any) {
      if (!file) {
        this._contentLoaderInfo.dispatchEvent(
          new this.sec.flash.events.IOErrorEvent(events.IOErrorEvent.IO_ERROR, false, false,
                                                 Errors.UnknownFileTypeError.message,
                                                 Errors.UnknownFileTypeError.code
        ));
        return;
      }
      // For child SWF files, only continue loading and interpreting the loaded data if the
      // either
      // - it is loaded from the same origin as the parent, or
      // - the parent has called `system.Security.allowDomain` with the loadees origin whitelisted
      // This is a mitigation against the loadee breaking our SecurityDomain sandbox and
      // reaching into the parent's SecurityDomain, reading data it's not supposed to have
      // access to.
      //
      // We perform this check only once loading has started for two reasons: one is that only
      // at that point do we know that we're loading a SWF instead of an image (or some invalid
      // file, in which case none of this matters). The other is that the parent might call
      // `allowDomain` only after the load has started, in which case we still want to allow the
      // operation to continue.
      //
      // Additionally, all the normal cross-domain checks apply as per usual.
      if (file._file instanceof SWFFile) {
        var whitelistResult = this._canLoadSWFFromDomain(this._fileLoader._url);
        var resultType: Telemetry.LoadResource;

        switch (whitelistResult) {
          case CrossDomainSWFLoadingWhitelistResult.OwnDomain:
            resultType = Telemetry.LoadResource.LoadSource;
            break;
          case CrossDomainSWFLoadingWhitelistResult.Remote:
            resultType = Telemetry.LoadResource.LoadWhitelistAllowed;
            break;
          case CrossDomainSWFLoadingWhitelistResult.Failed:
            resultType = Telemetry.LoadResource.LoadWhitelistDenied;
            break;
          default:
            assertUnreachable("Invalid whitelistResult");
        }
        Telemetry.instance.reportTelemetry({topic: 'loadResource', resultType: resultType});

        if (whitelistResult === CrossDomainSWFLoadingWhitelistResult.Failed) {
          console.error('Loading of SWF file from ' + this._fileLoader._url +
                        ' was rejected based on allowDomain heuristic.');
          this._fileLoader.abortLoad();
          var message = "Security sandbox violation: SWF " + this._loaderInfo._url +
                        " cannot load SWF " + this._fileLoader._url + ". This may be worked" +
                        " around by calling Security.allowDomain.";
          try {
            this._contentLoaderInfo.dispatchEvent(
              new this.sec.flash.events.IOErrorEvent(events.SecurityErrorEvent.SECURITY_ERROR,
                                                     false, false, message,
                                                     Errors.SecuritySwfNotAllowedError.code
              ));
          } catch (_) {
            // Ignore error during event handling.
          }
          return;
        }
        if (!this._contentLoaderInfo._allowCodeImport) {
          this._fileLoader.abortLoad();
          try {
            this._contentLoaderInfo.dispatchEvent(
              new this.sec.flash.events.IOErrorEvent(events.SecurityErrorEvent.SECURITY_ERROR,
                                                     false, false,
                                                     Errors.AllowCodeImportError.message,
                                                     Errors.AllowCodeImportError.code
              ));
          } catch (_) {
            // Ignore error during event handling.
          }
          return;
        }
      }

      this._contentLoaderInfo.setFile(file);
    }

    onLoadProgress(update: LoadProgressUpdate) {
      release || assert(update);
      this._queuedLoadUpdate = update;
    }

    onNewEagerlyParsedSymbols(dictionaryEntries: SWF.EagerlyParsedDictionaryEntry[],
                              delta: number): Promise<any> {
      var promises: Promise<any>[] = [];
      for (var i = dictionaryEntries.length - delta; i < dictionaryEntries.length; i++) {
        var dictionaryEntry = dictionaryEntries[i];
        var symbol = this._contentLoaderInfo.getSymbolById(dictionaryEntry.id);
        // JPEGs with alpha channel are parsed with our JS parser for now. They're ready
        // immediately, so don't need any more work here. We'll change them to using the system
        // parser, but for now, just skip further processing here.
        if (symbol.ready) {
          continue;
        }
        release || assert(symbol.resolveAssetPromise);
        release || assert(symbol.ready === false);
        promises.push(symbol.resolveAssetPromise.promise);
      }
      return Promise.all(promises);
    }

    onImageBytesLoaded() {
      var file = this._contentLoaderInfo._file;
      release || assert(file instanceof ImageFile);
      var data = {
        id: -1,
        data: file.data, // TODO: check if we can just remove this.
        mimeType: file.mimeType,
        dataType: file.type,
        type: 'image'
      };
      var symbol = BitmapSymbol.FromData(data, this._contentLoaderInfo);
      this._imageSymbol = symbol;
      this.sec.player.registerImage(symbol, file.type, file.data, null);
      release || assert(symbol.resolveAssetPromise);
    }

    private _applyDecodedImage(symbol: BitmapSymbol) {
      var bitmapData = symbol.createSharedInstance();
      this._content = new this.sec.flash.display.Bitmap(bitmapData);
      this._contentLoaderInfo._width = this._content.width * 20;
      this._contentLoaderInfo._height = this._content.height * 20;
      this.addTimelineObjectAtDepth(this._content, 0);
    }

    private _applyLoadUpdate(update: LoadProgressUpdate) {
      var loaderInfo = this._contentLoaderInfo;
      loaderInfo._bytesLoaded = update.bytesLoaded;
      var file = loaderInfo._file;

      if (!(file instanceof SWFFile)) {
        return;
      }

      if (file.framesLoaded === 0) {
        return;
      }

      if (loaderInfo._allowCodeExecution) {
        var app = loaderInfo.app;

        var abcBlocksLoaded = file.abcBlocks.length;
        var abcBlocksLoadedDelta = abcBlocksLoaded - loaderInfo._abcBlocksLoaded;
        if (abcBlocksLoadedDelta > 0) {
          for (var i = loaderInfo._abcBlocksLoaded; i < abcBlocksLoaded; i++) {
            var abcBlock = file.abcBlocks[i];
            var abc = new ABCFile(loaderInfo, abcBlock.data);
            if (abcBlock.flags) {
              // kDoAbcLazyInitializeFlag = 1 Indicates that the ABC block should not be executed
              // immediately.
              app.loadABC(abc);
            } else {
              // TODO: probably delay execution until playhead reaches the frame.
              app.loadAndExecuteABC(abc);
            }
          }
          loaderInfo._abcBlocksLoaded = abcBlocksLoaded;
        }

        var mappedSymbolsLoaded = file.symbolClassesList.length;
        var mappedSymbolsLoadedDelta = mappedSymbolsLoaded - loaderInfo._mappedSymbolsLoaded;
        if (mappedSymbolsLoadedDelta > 0) {
          for (var i = loaderInfo._mappedSymbolsLoaded; i < mappedSymbolsLoaded; i++) {
            var symbolMapping = file.symbolClassesList[i];
            var symbolClass = app.getClass(Multiname.FromFQNString(symbolMapping.className,
                                                                   NamespaceType.Public));
            Object.defineProperty(symbolClass.tPrototype, "_symbol",
                                  {get: loaderInfo.getSymbolResolver(symbolClass, symbolMapping.id),
                                   configurable: true});
          }
          loaderInfo._mappedSymbolsLoaded = mappedSymbolsLoaded;
        }
      }

      // In browsers that can't synchronously decode fonts, we have already registered all
      // embedded fonts at this point.
      if (inFirefox) {
        var fontsLoaded = file.fonts.length;
        var fontsLoadedDelta = fontsLoaded - loaderInfo._fontsLoaded;
        if (fontsLoadedDelta > 0) {
          for (var i = loaderInfo._fontsLoaded; i < fontsLoaded; i++) {
            this.sec.flash.text.Font.axClass.registerFontSymbol(file.fonts[i], loaderInfo);
          }
          loaderInfo._fontsLoaded = fontsLoaded;
        }
      }

      var rootSymbol = loaderInfo.getRootSymbol();
      var framesLoadedDelta = file.framesLoaded - rootSymbol.frames.length;
      if (framesLoadedDelta === 0) {
        return;
      }
      var root = this._content;
      if (!root) {
        root = this.createContentRoot(rootSymbol, file.sceneAndFrameLabelData);
      }
      var rootSprite = <Sprite><any>root;
      for (var i = 0; i < framesLoadedDelta; i++) {
        var frameInfo = loaderInfo.getFrame(null, rootSymbol.frames.length);
        rootSprite._addFrame(frameInfo);
      }
    }

    onLoadComplete() {
      // Go away, tslint.
    }
    onLoadError() {
      release || Debug.warning('Not implemented: flash.display.Loader loading-error handling');
    }

    private _addScenesToMovieClip(mc: MovieClip, sceneData, numFrames: number) {
      // Creating scenes so we will always have frames assigned to some scene.
      if (!sceneData) {
        mc.addScene('Scene 1', [], 0, numFrames);
        return;
      }

      // Sorting scenes by offset
      var sceneInfos = [];
      var scenes = sceneData.scenes;
      for (var i = 0; i < scenes.length; i++) {
        sceneInfos.push({offset: scenes[i].offset, name: scenes[i].name});
      }
      sceneInfos.sort((a, b) => a.offset - b.offset);

      var n = sceneInfos.length;
      var offset, endFrame;
      if (n > 0 && sceneInfos[0].offset > 0) {
        // Starting from non-zero frame, we need to create a fake scene.
        offset = sceneInfos[0].offset;
        endFrame = Math.min(offset, numFrames);
        mc.addScene('Scene 0', [], 0, endFrame);
      }

      for (var i = 0, n = sceneInfos.length; i < n; i++) {
        var sceneInfo = sceneInfos[i];
        offset = sceneInfo.offset;
        if (offset >= numFrames) {
          break; // out of the movie clip timeline range
        }
        endFrame = i < n - 1 ? Math.min(scenes[i + 1].offset, numFrames) : numFrames;
        mc.addScene(sceneInfo.name, [], offset, endFrame - offset);
      }

      var labels = sceneData.labels;
      for (var i = 0; i < labels.length; i++) {
        var labelInfo = labels[i];
        mc.addFrameLabel(labelInfo.name, labelInfo.frame + 1);
      }
    }

    private createContentRoot(symbol: SpriteSymbol, sceneData) {
      if (symbol.isAVM1Object) {
        this._initAvm1(symbol);
      }
      var root = constructClassFromSymbol(symbol, symbol.symbolClass);
      // The initial SWF's root object gets a default of 'root1', which doesn't use up a
      // DisplayObject instance ID. For the others, we have reserved one in `_contentID`.
      this.sec.flash.display.DisplayObject.axClass._instanceID--;

      var loaderClass = this.sec.flash.display.Loader.axClass;
      if (this === loaderClass._rootLoader) {
        root._name = 'root1';
      } else {
        root._name = 'instance' + this._contentID;
      }

      if (this.sec.flash.display.MovieClip.axClass.axIsType(root)) {
        this._addScenesToMovieClip(<MovieClip>root, sceneData, symbol.numFrames);
      }

      var loaderInfo = this._contentLoaderInfo;
      root._loaderInfo = loaderInfo;
      var rootTimeline = root;
      if (loaderInfo.actionScriptVersion === ActionScriptVersion.ACTIONSCRIPT2) {
        root = this._initAvm1Root(root);
      } else if (this === loaderClass.getRootLoader()) {
        var movieClipClass = this.sec.flash.display.MovieClip.axClass;
        movieClipClass.frameNavigationModel = loaderInfo.swfVersion < 10 ?
                                              flash.display.FrameNavigationModel.SWF9 :
                                              flash.display.FrameNavigationModel.SWF10;
        root._perspectiveProjectionCenterX = this._stage.stageWidth / 2;
        root._perspectiveProjectionCenterY = this._stage.stageHeight / 2;
        root._setFlags(DisplayObjectFlags.HasPerspectiveProjection);
      }
      this._content = root;
      if (this === loaderClass.getRootLoader()) {
        this.sec.flash.display.Loader.runtimeStartTime = Date.now();
        this._stage.setRoot(root);
      } else {
        this.addTimelineObjectAtDepth(root, 0);
      }
      // Always return the non-wrapped MovieClip instead of AVM1Movie for AVM1 SWFs.
      return rootTimeline;
    }

    private _initAvm1(symbol: SpriteSymbol): void {
      var contentLoaderInfo: LoaderInfo = this._contentLoaderInfo;
      var context;
      // Only the outermost AVM1 SWF gets an AVM1Context. SWFs loaded into it share that context.
      if (this.loaderInfo && this.loaderInfo._avm1Context) {
        context = contentLoaderInfo._avm1Context = this.loaderInfo._avm1Context;
      } else {
        context = Shumway.AVM1.AVM1Context.create(contentLoaderInfo);
        contentLoaderInfo._avm1Context = context;
        var display = this.sec.flash.display;
        var as2LoadedFromAS3 = this.loaderInfo && !this.loaderInfo._avm1Context;
        var rootLoader = display.Loader.axClass.getRootLoader();
        if (as2LoadedFromAS3 || this === rootLoader) {
          context.setStage(rootLoader._stage);
          display.MovieClip.axClass.frameNavigationModel = flash.display.FrameNavigationModel.SWF1;
        }
      }
      symbol.avm1Context = context;
    }

    /**
     * For AVM1 SWFs that aren't loaded into other AVM1 SWFs, create an AVM1Movie container
     * and wrap the root timeline into it. This associates the AVM1Context with this AVM1
     * MovieClip tree, including potential nested SWFs.
     */
    private _initAvm1Root(root: flash.display.DisplayObject): flash.display.DisplayObject {
      // Only create an AVM1Movie container for the outermost AVM1 SWF. Nested AVM1 SWFs just get
      // their content added to the loading SWFs display list directly.
      if (this.loaderInfo && this.loaderInfo._avm1Context) {
        return root;
      }

      var avm1Context = this._contentLoaderInfo._avm1Context;
      var avm1MovieClip = <AVM1.Lib.AVM1MovieClip>AVM1.Lib.getAVM1Object(root, avm1Context);
      var parameters = this._contentLoaderInfo._parameters;
      avm1MovieClip.setParameters(parameters);

      var avm1Movie = new this.sec.flash.display.AVM1Movie(<MovieClip>root);
      return avm1Movie;
    }
  }
}
