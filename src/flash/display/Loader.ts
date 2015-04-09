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
      var loader = new this.securityDomain.flash.display.Loader();
      // The root loader gets a default name, but it's not visible and hence the instance id must
      // not be used up.
      this.securityDomain.flash.display.DisplayObject.axClass._instanceID--;
      // The root loaderInfo's `loader` property is always null.
      loader._contentLoaderInfo._loader = null;
      this._rootLoader = loader;
      return loader;
    }

    static reset() {
      this.securityDomain.flash.display.Loader.axClass._loadQueue.forEach(loader => loader.unload());
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
      var loaderClass = this.securityDomain.flash.display.Loader.axClass;
      loaderClass.processEarlyEvents();
      loaderClass.processLateEvents();
    }
    private static processEarlyEvents() {
      var loaderClass = this.securityDomain.flash.display.Loader.axClass;
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
            loaderInfo.dispatchEvent(this.securityDomain.flash.events.Event.axClass.getInstance(events.Event.INIT));
          } catch (e) {
            console.warn('caught error under loaderInfo INIT event:', e);
          }
          leaveTimeline();
          instance._loadStatus = LoadStatus.Initialized;
          // Only for the root loader, progress events for the data loaded up until now are
          // dispatched here.
          if (instance === this.securityDomain.flash.display.Loader.axClass._rootLoader) {
            enterTimeline("Loader.Progress", 'rootLoader');
            try {
              loaderInfo.dispatchEvent(new this.securityDomain.flash.events.ProgressEvent(
                                                                events.ProgressEvent.PROGRESS,
                                                                false, false,
                                                                loaderInfo.bytesLoaded,
                                                                loaderInfo.bytesTotal));
            } catch (e) {
              console.warn('caught error under loaderInfo PROGRESS event:', e);
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
            loaderInfo.dispatchEvent(this.securityDomain.flash.events.Event.axClass.getInstance(events.Event.COMPLETE));
          } catch (e) {
            console.warn('caught error under loaderInfo COMPLETE event: ', e);
          }
          leaveTimeline();
        }
      }
    }

    private static processLateEvents() {
      var queue = this.securityDomain.flash.display.Loader.axClass._loadQueue;
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

        var progressEventCtor = this.securityDomain.flash.events.ProgressEvent;
        if (instance._loadStatus === LoadStatus.Unloaded) {
          // OPEN is only dispatched when loading external resources, not for loadBytes.
          if (instance._loadingType === LoadingType.External) {
            enterTimeline("Loader.Open");
            try {
              loaderInfo.dispatchEvent(this.securityDomain.flash.events.Event.axClass.getInstance(events.Event.OPEN));
            } catch (e) {
              console.warn('caught error under loaderInfo OPEN event: ', e);
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
            console.warn('caught error under loaderInfo PROGRESS event: ', e);
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
            console.warn('caught error under loaderInfo PROGRESS event: ', e);
          }
          leaveTimeline();
        }
      }
    }

    constructor () {
      super();

      var displayObjectClass = this.securityDomain.flash.display.DisplayObject.axClass;
      displayObjectClass._advancableInstances.push(this);
      this._content = null;
      if (this.securityDomain.flash.display.Loader.axClass._rootLoader) {
        // Loader reserves the next instance ID to use for the loaded content.
        // This isn't needed for the first, root, loader, because that uses "root1" as the name.
        this._contentID = displayObjectClass._instanceID++;
      } else {
        // The root loader itself doesn't get an ID.
        //this.securityDomain.flash.display.DisplayObject.axClass._instanceID--;
      }
      var loaderInfoCtor = this.securityDomain.flash.display.LoaderInfo;
      this._contentLoaderInfo = new loaderInfoCtor(loaderInfoCtor.axClass.CtorToken);
      this._contentLoaderInfo._loader = this;

      // REDUX:
      //var currentAbc = AVM2.currentAbc();
      //if (currentAbc) {
      //  this._contentLoaderInfo._loaderUrl = (<LoaderInfo>currentAbc.env.loaderInfo).url;
      //}

      this._fileLoader = null;
      this._loadStatus = LoadStatus.Unloaded;
    }

    _setStage(stage: Stage) {
      release || assert(this === this.securityDomain.flash.display.Loader.axClass.getRootLoader());
      this._stage = stage;
    }

    _initFrame(advance: boolean) {
      // ...
    }

    _constructFrame() {
      if (this === this.securityDomain.flash.display.Loader.axClass.getRootLoader() && this._content) {
        this.securityDomain.flash.display.DisplayObject.axClass._advancableInstances.remove(this);
        this._children[0] = this._content;
        this._constructChildren();
        this._children.length = 0;
        return;
      }
      this._constructChildren();
    }

    addChild(child: DisplayObject): DisplayObject {
      this.securityDomain.throwError('IllegalOperationError', Errors.InvalidLoaderMethodError);
      return null;
    }

    addChildAt(child: DisplayObject, index: number): DisplayObject {
      this.securityDomain.throwError('IllegalOperationError', Errors.InvalidLoaderMethodError);
      return null;
    }

    removeChild(child: DisplayObject): DisplayObject {
      this.securityDomain.throwError('IllegalOperationError', Errors.InvalidLoaderMethodError);
      return null;
    }

    removeChildAt(index: number): DisplayObject {
      this.securityDomain.throwError('IllegalOperationError', Errors.InvalidLoaderMethodError);
      return null;
    }

    setChildIndex(child: DisplayObject, index: number): void {
      this.securityDomain.throwError('IllegalOperationError', Errors.InvalidLoaderMethodError);
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
      if (this.securityDomain.flash.system.JPEGLoaderContext.axClass.axIsType(context)) {
        return (<flash.system.JPEGLoaderContext>context).deblockingFilter;
      }
      return 0.0;
    }

    get uncaughtErrorEvents(): events.UncaughtErrorEvents {
      somewhatImplemented("public flash.display.Loader::uncaughtErrorEvents");
      if (!this._uncaughtErrorEvents) {
        this._uncaughtErrorEvents = new events.UncaughtErrorEvents();
      }
      return this._uncaughtErrorEvents;
    }

    private _canLoadSWFFromDomain(url: string): boolean {
      url = FileLoadingService.instance.resolveUrl(url);
      var whitelist: ICrossDomainSWFLoadingWhitelist = this.securityDomain.player;
      return whitelist.checkDomainForSWFLoading(url);
    }

    load(request: flash.net.URLRequest, context?: LoaderContext): void {
      this.close();
      // TODO: clean up contentloaderInfo.
      this._contentLoaderInfo._url = request.url;
      this._applyLoaderContext(context);
      this._loadingType = LoadingType.External;
      this._fileLoader = new FileLoader(this);
      if (!release && traceLoaderOption.value) {
        console.log("Loading url " + request.url);
      }
      // Starts loading on the next script execution turn, in case if allowDomain
      // will be called. This is a very simplified heuristic to restrict
      // unwanted SWFs that can break the loading one.
      Promise.resolve<any>(undefined).then(function (fileLoader: FileLoader, fileRequest) {
        if (this._canLoadSWFFromDomain(fileRequest.url)) {
          fileLoader.loadFile(fileRequest);
        } else {
          console.error('Loading of ' + fileRequest.url + ' was rejected based on allowDomain heuristic.');
          // TODO trigger some loading error
        }
      }.bind(this, this._fileLoader, request._toFileRequest()));

      this._queuedLoadUpdate = null;
      var loaderClass = this.securityDomain.flash.display.Loader.axClass;
      release || assert(loaderClass._loadQueue.indexOf(this) === -1);
      loaderClass._loadQueue.push(this);
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
      this._queuedLoadUpdate = null;
      if (!release && traceLoaderOption.value) {
        console.log("Loading embedded symbol " + this._contentLoaderInfo._url);
      }
      // Just passing in the bytes won't do, because the buffer can contain slop at the end.
      this._fileLoader.loadBytes(new Uint8Array((<any>data).bytes, 0, data.length));

      var loaderClass = this.securityDomain.flash.display.Loader.axClass;
      release || assert(loaderClass._loadQueue.indexOf(this) === -1);
      loaderClass._loadQueue.push(this);
    }

    close(): void {
      var queueIndex = this.securityDomain.flash.display.Loader.axClass._loadQueue.indexOf(this);
      if (queueIndex > -1) {
        this.securityDomain.flash.display.Loader.axClass._loadQueue.splice(queueIndex, 1);
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
      this.dispatchEvent(this.securityDomain.flash.events.Event.axClass.getInstance(events.Event.UNLOAD));
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
        transformASValueToJS(this.securityDomain, context.parameters, false) : {};
      if (context && context.applicationDomain) {
        var domain = null;
        // REDUX:
        // var domain = new system.ApplicationDomain(system.ApplicationDomain.currentDomain);
        this._contentLoaderInfo._applicationDomain = domain;
      }
      this._contentLoaderInfo._parameters = parameters;
    }

    onLoadOpen(file: any) {
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
        data: file.data,
        mimeType: file.mimeType,
        dataType: file.type,
        type: 'image'
      };
      var symbol = BitmapSymbol.FromData(data, this._contentLoaderInfo);
      this._imageSymbol = symbol;
      var resolver: Timeline.IAssetResolver = this.securityDomain.player;
      resolver.registerImage(symbol, data);
      release || assert(symbol.resolveAssetPromise);
    }

    private _applyDecodedImage(symbol: BitmapSymbol) {
      var bitmapData = symbol.createSharedInstance();
      this._content = new this.securityDomain.flash.display.Bitmap(bitmapData);
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
        var system = this.securityDomain.system;

        var abcBlocksLoaded = file.abcBlocks.length;
        var abcBlocksLoadedDelta = abcBlocksLoaded - loaderInfo._abcBlocksLoaded;
        if (abcBlocksLoadedDelta > 0) {
          for (var i = loaderInfo._abcBlocksLoaded; i < abcBlocksLoaded; i++) {
            var abcBlock = file.abcBlocks[i];
            var abc = new ABCFile(abcBlock.data, abcBlock.name);
            // REDUX: abc.env below is not yet available.
            // abc.env.loaderInfo = loaderInfo;
            if (abcBlock.flags) {
              // kDoAbcLazyInitializeFlag = 1 Indicates that the ABC block should not be executed
              // immediately.
              system.loadABC(abc);
            } else {
              // TODO: probably delay execution until playhead reaches the frame.
              system.loadAndExecuteABC(abc);
            }
          }
          loaderInfo._abcBlocksLoaded = abcBlocksLoaded;
        }

        var mappedSymbolsLoaded = file.symbolClassesList.length;
        var mappedSymbolsLoadedDelta = mappedSymbolsLoaded - loaderInfo._mappedSymbolsLoaded;
        if (mappedSymbolsLoadedDelta > 0) {
          for (var i = loaderInfo._mappedSymbolsLoaded; i < mappedSymbolsLoaded; i++) {
            var symbolMapping = file.symbolClassesList[i];
            var symbolClass = system.getClass(Multiname.FromFQNString(symbolMapping.className,
                                                                      NamespaceType.Public));
            Object.defineProperty(symbolClass, "defaultInitializerArgument",
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
            this.securityDomain.flash.text.Font.axClass.registerEmbeddedFont(file.fonts[i],
                                                                             loaderInfo);
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
      // DisplayObject instance ID. For the others, we have reserved on in `_contentID`.
      this.securityDomain.flash.display.DisplayObject.axClass._instanceID--;
      var loaderClass = this.securityDomain.flash.display.Loader.axClass;
      if (this === loaderClass._rootLoader) {
        root._name = 'root1';
      } else {
        root._name = 'instance' + this._contentID;
      }

      if (this.securityDomain.flash.display.MovieClip.axClass.axIsType(root)) {
        this._addScenesToMovieClip(<MovieClip>root, sceneData, symbol.numFrames);
      }

      var loaderInfo = this._contentLoaderInfo;
      root._loaderInfo = loaderInfo;
      var rootTimeline = root;
      if (loaderInfo.actionScriptVersion === ActionScriptVersion.ACTIONSCRIPT2) {
        root = this._initAvm1Root(root);
      } else if (this === loaderClass.getRootLoader()) {
        var movieClipClass = this.securityDomain.flash.display.MovieClip.axClass;
        movieClipClass.frameNavigationModel = loaderInfo.swfVersion < 10 ?
                                              flash.display.FrameNavigationModel.SWF9 :
                                              flash.display.FrameNavigationModel.SWF10;
      }
      this._content = root;
      if (this === loaderClass.getRootLoader()) {
        this.securityDomain.flash.display.Loader.runtimeStartTime = Date.now();
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
        var display = this.securityDomain.flash.display;
        if (this === display.Loader.axClass.getRootLoader()) {
          context.setStage(this._stage);
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
    private _initAvm1Root(root: flash.display.DisplayObject) {
      var avm1Context = this._contentLoaderInfo._avm1Context;
      var as2Object = Shumway.AVM1.Lib.getAVM1Object(root, avm1Context);

      // Only create an AVM1Movie container for the outermost AVM1 SWF. Nested AVM1 SWFs just get
      // their content added to the loading SWFs display list directly.
      if (this.loaderInfo && this.loaderInfo._avm1Context) {
        as2Object.context = this.loaderInfo._avm1Context;
        return root;
      }

      avm1Context.root = as2Object;
      root.addEventListener('frameConstructed',
                            avm1Context.flushPendingScripts.bind(avm1Context),
                            false,
                            Number.MAX_VALUE);

      var avm1Movie = new this.securityDomain.flash.display.AVM1Movie(<MovieClip>root);

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
