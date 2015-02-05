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

module Shumway.Player {
  import assert = Shumway.Debug.assert;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import flash = Shumway.AVM2.AS.flash;
  import Point = Shumway.AVM2.AS.flash.geom.Point;
  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
  import AVM2 = Shumway.AVM2.Runtime.AVM2;
  import IExternalInterfaceService = Shumway.IExternalInterfaceService;

  import Event = flash.events.Event;
  import BitmapData = flash.display.BitmapData;
  import DisplayObject = flash.display.DisplayObject;
  import DisplayObjectContainer = flash.display.DisplayObjectContainer;
  import EventDispatcher = flash.events.EventDispatcher;
  import MovieClip = flash.display.MovieClip;
  import Loader = flash.display.Loader;
  import VisitorFlags = flash.display.VisitorFlags;

  import MouseEventAndPointData = Shumway.AVM2.AS.flash.ui.MouseEventAndPointData;
  import MouseEventDispatcher = flash.ui.MouseEventDispatcher;
  import KeyboardEventData = Shumway.AVM2.AS.flash.ui.KeyboardEventData;
  import KeyboardEventDispatcher = flash.ui.KeyboardEventDispatcher;
  import FocusEventData = Shumway.Remoting.Player.FocusEventData;

  import IBitmapDataSerializer = flash.display.IBitmapDataSerializer;
  import IAssetResolver = Timeline.IAssetResolver;
  import IFSCommandListener = flash.system.IFSCommandListener;
  import IVideoElementService = flash.net.IVideoElementService;
  import IRootElementService = flash.display.IRootElementService;
  import MessageTag = Shumway.Remoting.MessageTag;
  import VideoControlEvent = Shumway.Remoting.VideoControlEvent;
  import VideoPlaybackEvent = Shumway.Remoting.VideoPlaybackEvent;

  import DisplayParameters = Shumway.Remoting.DisplayParameters;

  /**
   * Shumway Player
   *
   * This class brings everything together. Loads the swf, runs the event loop and
   * synchronizes the frame tree with the display list.
   */
  export class Player implements IBitmapDataSerializer, IFSCommandListener, IVideoElementService,
                                 IAssetResolver, IRootElementService {
    private _stage: flash.display.Stage;
    private _loader: flash.display.Loader;
    private _loaderInfo: flash.display.LoaderInfo;
    private _syncTimeout: number;
    private _frameTimeout: number;
    private _eventLoopIsRunning: boolean;
    private _framesPlayed: number = 0;

    private _writer: IndentingWriter;
    private _mouseEventDispatcher: MouseEventDispatcher;
    private _keyboardEventDispatcher: KeyboardEventDispatcher;
    private _videoEventListeners: {(eventType: VideoPlaybackEvent, data: any):void}[] = [];

    /**
     * Used to request things from the GFX remote.
     */
      // TODO: rip this out
    private _pendingPromises: PromiseWrapper<any> [] = [];

    /**
     * Returns an id that can be remoted to GFX.
     */
    private _getNextAvailablePromiseId(): number {
      var length = this._pendingPromises.length;
      for (var i = 0; i < length; i++) {
        if (!this._pendingPromises[i]) {
          return i;
        }
      }
      return length;
    }

    public externalCallback: (functionName: string, args: any[]) => any = null;

    /**
     * If set, overrides SWF file background color.
     */
    public defaultStageColor: number;

    /**
     * Movie parameters, such as flashvars.
     */
    public movieParams: Map<string>;

    /**
     * Initial stage alignment: l|r|t|tr|tl.
     */
    public stageAlign: string;

    /**
     * Initial stage scaling: showall|noborder|exactfit|noscale.
     */
    public stageScale: string;

    /**
     * Initial display parameters.
     */
    public displayParameters: DisplayParameters;

    /**
     * Time since the last time we've synchronized the display list.
     */
    private _lastPumpTime = 0;

    /**
     * Page Visibility API visible state.
     */
    private _isPageVisible = true;

    /**
     * Page focus state.
     */
    private _hasFocus = true;

    /**
     * Page URL that hosts SWF.
     */
    private _pageUrl: string = null;

    /**
     * SWF URL.
     */
    private _swfUrl: string = null;

    constructor() {
      this._keyboardEventDispatcher = new KeyboardEventDispatcher();
      this._mouseEventDispatcher = new MouseEventDispatcher();
      this._writer = new IndentingWriter();
      AVM2.instance.globals['Shumway.Player.Utils'] = this;
    }

    /**
     * Movie stage object.
     */
    get stage() {
      return this._stage;
    }

    /**
     * Abstract method to notify about updates.
     * @param updates
     * @param assets
     */
    onSendUpdates(updates: DataBuffer, assets: Array<DataBuffer>, async: boolean = true): DataBuffer {
      throw new Error('This method is abstract');
      return null;
    }

    /**
     * Whether we can get away with rendering at a lower rate.
     */
    private _shouldThrottleDownRendering() {
      return !this._isPageVisible;
    }

    /**
     * Whether we can get away with executing frames at a lower rate.
     */
    private _shouldThrottleDownFrameExecution() {
      return !this._isPageVisible;
    }

    public get pageUrl(): string {
      return this._pageUrl;
    }

    public set pageUrl(value: string) {
      this._pageUrl = value;
    }

    public get swfUrl(): string {
      return this._swfUrl;
    }

    public load(url: string, buffer?: ArrayBuffer) {
      release || assert (!this._loader, "Can't load twice.");
      this._swfUrl = url;
      this._stage = new flash.display.Stage();
      var loader = this._loader = flash.display.Loader.getRootLoader();
      var loaderInfo = this._loaderInfo = loader.contentLoaderInfo;

      if (playAllSymbolsOption.value) {
        this._playAllSymbols();
        loaderInfo._allowCodeExecution = false;
      } else {
        this._enterRootLoadingLoop();
      }
      var context = this.createLoaderContext();
      if (buffer) {
        var symbol = Shumway.Timeline.BinarySymbol.FromData({id: -1, data: buffer});
        var byteArray = symbol.symbolClass.initializeFrom(symbol);
        symbol.symbolClass.instanceConstructorNoInitialize.call(byteArray);
        this._loader.loadBytes(byteArray, context);
      } else {
        this._loader.load(new flash.net.URLRequest(url), context);
      }
    }

    private createLoaderContext() : flash.system.LoaderContext {
      var loaderContext = new flash.system.LoaderContext();
      if (this.movieParams) {
        var parameters: any = {};
        for (var i in this.movieParams) {
          parameters.asSetPublicProperty(i, this.movieParams[i]);
        }
        loaderContext.parameters = <Shumway.AVM2.AS.ASObject>parameters;
      }
      return loaderContext;
    }

    public processUpdates(updates: DataBuffer, assets: any []) {
      var deserializer = new Remoting.Player.PlayerChannelDeserializer();
      var FocusEventType = Remoting.FocusEventType;

      deserializer.input = updates;
      deserializer.inputAssets = assets;

      var message = deserializer.read();
      switch (message.tag) {
        case MessageTag.KeyboardEvent:
          // If the stage doesn't have a focus then dispatch events on the stage
          // directly.
          var target = this._stage.focus ? this._stage.focus : this._stage;
          this._keyboardEventDispatcher.target = target;
          this._keyboardEventDispatcher.dispatchKeyboardEvent(<KeyboardEventData>message);
          break;
        case MessageTag.MouseEvent:
          this._mouseEventDispatcher.stage = this._stage;
          var target = this._mouseEventDispatcher.handleMouseEvent(<MouseEventAndPointData>message);
          if (traceMouseEventOption.value) {
            this._writer.writeLn("Mouse Event: type: " + message.type + ", point: " + message.point + ", target: " + target + (target ? ", name: " + target._name : ""));
            if (message.type === "click" && target) {
              target.debugTrace();
            }
          }
          break;
        case MessageTag.FocusEvent:
          var focusType = (<FocusEventData>message).type;
          switch (focusType) {
            case FocusEventType.DocumentHidden:
              this._isPageVisible = false;
              break;
            case FocusEventType.DocumentVisible:
              this._isPageVisible = true;
              break;
            case FocusEventType.WindowBlur:
              // TODO: This is purposely disabled so that applications don't pause when they are out of
              // focus while the debugging window is open.
              // EventDispatcher.broadcastEventDispatchQueue.dispatchEvent(Event.getBroadcastInstance(Event.DEACTIVATE));
              this._hasFocus = false;
              break;
            case FocusEventType.WindowFocus:
              EventDispatcher.broadcastEventDispatchQueue.dispatchEvent(Event.getBroadcastInstance(Event.ACTIVATE));
              this._hasFocus = true;
              break;
          }
          break;
      }
    }

    private _pumpDisplayListUpdates(): void {
      this.syncDisplayObject(this._stage);
    }

    public syncDisplayObject(displayObject: flash.display.DisplayObject, async: boolean = true): DataBuffer {
      var updates = new DataBuffer();
      var assets = [];
      var serializer = new Remoting.Player.PlayerChannelSerializer();
      serializer.output = updates;
      serializer.outputAssets = assets;

      if (flash.display.Stage.isType(displayObject)) {
        serializer.writeStage(<flash.display.Stage>displayObject, this._mouseEventDispatcher.currentTarget);
      }

      serializer.begin(displayObject);
      serializer.remoteObjects();
      serializer.remoteReferences();
      updates.writeInt(Remoting.MessageTag.EOF);

      enterTimeline("remoting assets");
      var output = this.onSendUpdates(updates, assets, async);
      leaveTimeline("remoting assets");

      return output;
    }

    public requestBitmapData(bitmapData: BitmapData): DataBuffer {
      var output = new DataBuffer();
      var assets = [];
      var serializer = new Remoting.Player.PlayerChannelSerializer();
      serializer.output = output;
      serializer.outputAssets = assets;
      serializer.writeRequestBitmapData(bitmapData);
      output.writeInt(Remoting.MessageTag.EOF);
      return this.onSendUpdates(output, assets, false);
    }

    public drawToBitmap(bitmapData: flash.display.BitmapData, source: Shumway.Remoting.IRemotable, matrix: flash.geom.Matrix = null, colorTransform: flash.geom.ColorTransform = null, blendMode: string = null, clipRect: flash.geom.Rectangle = null, smoothing: boolean = false) {
      var updates = new DataBuffer();
      var assets = [];
      var serializer = new Shumway.Remoting.Player.PlayerChannelSerializer();
      serializer.output = updates;
      serializer.outputAssets = assets;

      serializer.writeBitmapData(bitmapData);

      if (flash.display.BitmapData.isType(source)) {
        serializer.writeBitmapData(<flash.display.BitmapData>source);
      } else {
        var displayObject = <flash.display.DisplayObject>source;

        serializer.begin(displayObject);
        serializer.remoteObjects();
        serializer.remoteReferences();
      }

      serializer.writeDrawToBitmap(bitmapData, source, matrix, colorTransform, blendMode, clipRect, smoothing);

      updates.writeInt(Shumway.Remoting.MessageTag.EOF);

      enterTimeline("sendUpdates");
      this.onSendUpdates(updates, assets, false);
      leaveTimeline("sendUpdates");
    }

    public registerEventListener(id: number, listener: (eventType: VideoPlaybackEvent, data: any)=>void) {
      this._videoEventListeners[id] = listener;
    }

    public notifyVideoControl(id: number, eventType: VideoControlEvent, data: any): any {
      return this.onVideoControl(id, eventType, data);
    }

    public executeFSCommand(command: string, args: string) {
      switch (command) {
        case 'quit':
          this._leaveEventLoop();
          break;
        default:
          somewhatImplemented('FSCommand ' + command);
      }
      this.onFSCommand(command, args);
    }

    public requestRendering(): void {
      this._pumpDisplayListUpdates();
    }

    /**
     * Update the frame container with the latest changes from the display list.
     */
    private _pumpUpdates() {
      if (!dontSkipFramesOption.value) {
        if (this._shouldThrottleDownRendering()) {
          return;
        }
        var timeSinceLastPump = performance.now() - this._lastPumpTime;
        if (timeSinceLastPump < (1000 / pumpRateOption.value)) {
          return;
        }
      }
      enterTimeline("pump");
      if (pumpEnabledOption.value) {
        this._pumpDisplayListUpdates();
        this._lastPumpTime = performance.now();
      }
      leaveTimeline("pump");
    }

    private _leaveSyncLoop(): void {
      release || assert (this._frameTimeout > -1);
      clearInterval(this._frameTimeout);
    }

    private _getFrameInterval(): number {
      var frameRate = frameRateOption.value;
      if (frameRate < 0) {
        frameRate = this._stage.frameRate;
      }
      return Math.floor(1000 / frameRate);
    }

    private _enterEventLoop(): void {
      this._eventLoopIsRunning = true;
      this._eventLoopTick = this._eventLoopTick.bind(this);
      this._eventLoopTick();
    }

    private _enterRootLoadingLoop(): void {
      var self = this;
      var rootLoader = Loader.getRootLoader();
      rootLoader._setStage(this._stage);
      function rootLoadingLoop() {
        var loaderInfo = rootLoader.contentLoaderInfo;
        if (!loaderInfo._file) {
          setTimeout(rootLoadingLoop, self._getFrameInterval());
          return;
        }
        var stage = self._stage;

        var bgcolor = self.defaultStageColor !== undefined ?
                      self.defaultStageColor :
                      loaderInfo._file.backgroundColor;

        stage._loaderInfo = loaderInfo;
        stage.align = self.stageAlign || '';
        stage.scaleMode = self.stageScale || 'showall';
        stage.frameRate = loaderInfo.frameRate;
        stage.setStageWidth(loaderInfo.width);
        stage.setStageHeight(loaderInfo.height);
        stage.setStageColor(ColorUtilities.RGBAToARGB(bgcolor));

        if (self.displayParameters) {
          self.processDisplayParameters(self.displayParameters);
        }

        self._enterEventLoop();
      }
      rootLoadingLoop();
    }

    private _eventLoopTick(): void {
      var runFrameScripts = !playAllSymbolsOption.value;
      var dontSkipFrames = dontSkipFramesOption.value;
      // TODO: change this to the mode described in
      // http://www.craftymind.com/2008/04/18/updated-elastic-racetrack-for-flash-9-and-avm2/
      this._frameTimeout = setTimeout(this._eventLoopTick, this._getFrameInterval());
      if (!dontSkipFrames && (
        !frameEnabledOption.value && runFrameScripts ||
        this._shouldThrottleDownFrameExecution()))
      {
        return;
      }
      // The stage is required for frame event cycle processing.
      DisplayObject._stage = this._stage;
      // Until the root SWF is initialized, only process Loader events.
      // Once the root loader's content is created, directly process all events again to avoid
      // further delay in initialization.
      if (!Loader.getRootLoader().content) {
        Loader.processEvents();
        if (!Loader.getRootLoader().content) {
          return;
        }
      }
      for (var i = 0; i < frameRateMultiplierOption.value; i++) {
        enterTimeline("eventLoop");
        var start = performance.now();
        DisplayObject.performFrameNavigation(true, runFrameScripts);
        counter.count("performFrameNavigation", 1, performance.now() - start);
        Loader.processEvents();
        leaveTimeline("eventLoop");
      }
      this._framesPlayed++;
      if (tracePlayerOption.value > 0 && (this._framesPlayed % tracePlayerOption.value === 0)) {
        this._tracePlayer();
      }
      this._stage.render();
      this._pumpUpdates();
      this.onFrameProcessed();
    }

    private _tracePlayer(): void {
      var writer = this._writer;
      writer.enter("Frame: " + this._framesPlayed);

      Shumway.AVM2.counter.traceSorted(writer, true);
      Shumway.AVM2.counter.clear();

      Shumway.Player.counter.traceSorted(writer, true);
      Shumway.Player.counter.clear();

      writer.writeLn("advancableInstances: " + flash.display.DisplayObject._advancableInstances.length);
      writer.outdent();
    }

    private _leaveEventLoop(): void {
      release || assert (this._eventLoopIsRunning);
      clearTimeout(this._frameTimeout);
      this._eventLoopIsRunning = false;
    }

    private _playAllSymbols() {
      var stage = this._stage;
      var loader = this._loader;
      var loaderInfo = this._loaderInfo;
      var self = this;

      loaderInfo.addEventListener(flash.events.ProgressEvent.PROGRESS, function onProgress() {
        var root = loader.content;
        if (!root) {
          return;
        }
        loaderInfo.removeEventListener(flash.events.ProgressEvent.PROGRESS, onProgress);
        self._enterEventLoop();
      });

      loaderInfo.addEventListener(flash.events.Event.COMPLETE, function onProgress() {
        stage.setStageWidth(1024);
        stage.setStageHeight(1024);

        var symbols = [];
        loaderInfo._dictionary.forEach(function (symbol, key) {
          if (symbol instanceof Shumway.Timeline.DisplaySymbol) {
            symbols.push(symbol);
          }
        });

        function show(symbol) {
          flash.display.DisplayObject.reset();
          flash.display.MovieClip.reset();
          var symbolInstance = symbol.symbolClass.initializeFrom(symbol);
          symbol.symbolClass.instanceConstructorNoInitialize.call(symbolInstance);
          if (symbol instanceof flash.display.BitmapSymbol) {
            symbolInstance = new flash.display.Bitmap(symbolInstance);
          }
          while (stage.numChildren > 0) {
            stage.removeChildAt(0);
          }
          stage.addChild(symbolInstance);
        }

        var nextSymbolIndex = 0;
        function showNextSymbol() {
          var symbol;
          if (playSymbolOption.value > 0) {
            symbol = loaderInfo.getSymbolById(playSymbolOption.value);
            if (symbol instanceof Shumway.Timeline.DisplaySymbol) {

            } else {
              symbol = null;
            }
          } else {
            symbol = symbols[nextSymbolIndex ++];
            if (nextSymbolIndex === symbols.length) {
              nextSymbolIndex = 0;
            }
            if (playSymbolCountOption.value >= 0 &&
                nextSymbolIndex > playSymbolCountOption.value) {
              nextSymbolIndex = 0;
            }
          }
          var frames = 1;
          if (symbol && symbol.id > 0) {
            show(symbol);
            if (symbol instanceof flash.display.SpriteSymbol) {
              frames = (<flash.display.SpriteSymbol>symbol).numFrames;
            }
          }
          if (playSymbolFrameDurationOption.value > 0) {
            frames = playSymbolFrameDurationOption.value;
          }
          setTimeout(showNextSymbol, self._getFrameInterval() * frames);
        }
        setTimeout(showNextSymbol, self._getFrameInterval());
      });
    }

    public processExternalCallback(request) {
      if (!this.externalCallback) {
        return;
      }

      try {
        request.result = this.externalCallback(request.functionName, request.args);
      } catch (e) {
        request.error = e.message;
      }
    }

    public processVideoEvent(id: number, eventType: VideoPlaybackEvent, data: any) {
      var listener = this._videoEventListeners[id];
      Debug.assert(listener, 'Video event listener is not found');
      listener(eventType, data);
    }

    public processDisplayParameters(displayParameters: DisplayParameters) {
      this._stage.setStageContainerSize(displayParameters.stageWidth, displayParameters.stageHeight, displayParameters.pixelRatio);
    }

    onExternalCommand(command) {
      throw new Error('This method is abstract');
    }

    onFSCommand(command: string, args: string) {
      throw new Error('This method is abstract');
    }

    onVideoControl(id: number, eventType: VideoControlEvent, data: any): any {
      throw new Error('This method is abstract');
    }

    onFrameProcessed() {
      throw new Error('This method is abstract');
    }

    registerFontOrImage(symbol: Timeline.EagerlyResolvedSymbol, data: any): void {
      release || assert(symbol.syncId);
      symbol.resolveAssetPromise = new PromiseWrapper();
      this.registerFontOrImageImpl(symbol, data);
      // Fonts are immediately available in Firefox, so we can just mark the symbol as ready.
      if (data.type === 'font' && inFirefox) {
        symbol.ready = true;
      } else {
        symbol.resolveAssetPromise.then(symbol.resolveAssetCallback, null);
      }
    }

    protected registerFontOrImageImpl(symbol: Timeline.EagerlyResolvedSymbol, data: any) {
      throw new Error('This method is abstract');
    }

    public createExternalInterfaceService() : IExternalInterfaceService {
      var isEnabled: boolean;
      var player = this;
      return  {
        get enabled() {
          if (isEnabled === undefined) {
            var cmd: any = {action: 'isEnabled'};
            player.onExternalCommand(cmd);
            isEnabled = cmd.result;
          }
          return isEnabled;
        },
        initJS(callback: (functionName: string, args: any[]) => any) {
          player.externalCallback = callback;
          var cmd: any = {action: 'initJS'};
          player.onExternalCommand(cmd);
        },
        registerCallback(functionName: string) {
          var cmd: any = {action: 'register', functionName: functionName, remove: false};
          player.onExternalCommand(cmd);
        },
        unregisterCallback(functionName: string) {
          var cmd: any = {action: 'register', functionName: functionName, remove: true};
          player.onExternalCommand(cmd);
        },
        eval(expression: string): any {
          var cmd: any = {action: 'eval', expression: expression};
          player.onExternalCommand(cmd);
          return cmd.result;
        },
        call(request: string): any {
          var cmd: any = {action: 'call', request: request};
          player.onExternalCommand(cmd);
          return cmd.result;
        },
        getId(): string {
          var cmd: any = {action: 'getId'};
          player.onExternalCommand(cmd);
          return cmd.result;
        }
      };
    }
  }
}
