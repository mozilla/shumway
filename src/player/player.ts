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
  import flash = Shumway.AVM2.AS.flash;
  import Point = Shumway.AVM2.AS.flash.geom.Point;
  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
  import AVM2 = Shumway.AVM2.Runtime.AVM2;
  import avm1lib = Shumway.AVM2.AS.avm1lib;
  import IExternalInterfaceService = Shumway.IExternalInterfaceService;

  import Event = flash.events.Event;
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

  /**
   * Shumway Player
   *
   * This class brings everything together. Load the swf, runs the event loop and
   * synchronizes the frame tree with the display list.
   */
  export class Player implements IBitmapDataSerializer {
    private _stage: flash.display.Stage;
    private _loader: flash.display.Loader;
    private _loaderInfo: flash.display.LoaderInfo;
    private _syncTimeout: number;
    private _frameTimeout: number;
    private _framesPlayed: number = 0;

    private static _syncFrameRate = 60;

    private _mouseEventDispatcher: MouseEventDispatcher;
    private _keyboardEventDispatcher: KeyboardEventDispatcher;

    public externalCallback: (functionName: string, args: any[]) => any = null;

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

    constructor() {
      this._keyboardEventDispatcher = new KeyboardEventDispatcher();
      this._mouseEventDispatcher = new MouseEventDispatcher();

      AVM2.instance.globals['Shumway.Player.Utils'] = this;
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

    public load(url: string) {
      release || assert (!this._loader, "Can't load twice.");
      var self = this;
      var stage = this._stage = new flash.display.Stage();
      var loader = this._loader = flash.display.Loader.getRootLoader();
      var loaderInfo = this._loaderInfo = loader.contentLoaderInfo;

      if (playAllSymbolsOption.value) {
        this._playAllSymbols();
        loaderInfo._allowCodeExecution = false;
      } else {
        var startPromise = loader._startPromise;
        startPromise.then(function () {
          if (loaderInfo.actionScriptVersion === flash.display.ActionScriptVersion.ACTIONSCRIPT2) {
            var AS2Key = (<any>avm1lib).AS2Key;
            var AS2Mouse = (<any>avm1lib).AS2Mouse;
            AS2Key.asCallPublicProperty('__bind', [stage]);
            AS2Mouse.asCallPublicProperty('__bind', [stage]);
            var avm1Context = loaderInfo._avm1Context;
            stage.addEventListener('frameConstructed',
                                   avm1Context.flushPendingScripts.bind(avm1Context),
                                   false,
                                   Number.MAX_VALUE);
          }

          var root = loader.content;
          stage._loaderInfo = loaderInfo;
          stage.frameRate = loaderInfo.frameRate;
          stage.stageWidth = loaderInfo.width;
          stage.stageHeight = loaderInfo.height;
          stage.color = ColorUtilities.RGBAToARGB(loaderInfo._colorRGBA);
          stage.addChildAtDepth(root, 0);
          self._enterLoops();
        });
      }
      this._loader.load(new flash.net.URLRequest(url));
    }

    public processEventUpdates(updates: DataBuffer) {
      var deserializer = new Remoting.Player.PlayerChannelDeserializer();
      var EventKind = Remoting.Player.EventKind;
      var FocusEventType = Remoting.FocusEventType;

      deserializer.input = updates;

      var event = deserializer.readEvent();
      switch (<Remoting.Player.EventKind>(event.kind)) {
        case EventKind.Keyboard:
          // If the stage doesn't have a focus then dispatch events on the stage
          // directly.
          var target = this._stage.focus ? this._stage.focus : this._stage;
          this._keyboardEventDispatcher.target = target;
          this._keyboardEventDispatcher.dispatchKeyboardEvent(<KeyboardEventData>event);
          break;
        case EventKind.Mouse:
          this._mouseEventDispatcher.stage = this._stage;
          this._mouseEventDispatcher.handleMouseEvent(<MouseEventAndPointData>event);
          break;
        case EventKind.Focus:
          var focusType = (<FocusEventData>event).type;
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

    private _enterLoops(): void {
      this._enterEventLoop();
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
        serializer.writeStage(<flash.display.Stage>displayObject);
      }

      serializer.phase = Remoting.RemotingPhase.Objects;
      enterTimeline("remoting objects");
      serializer.writeDisplayObject(displayObject);
      leaveTimeline("remoting objects");

      serializer.phase = Remoting.RemotingPhase.References;
      enterTimeline("remoting references");
      serializer.writeDisplayObject(displayObject);
      leaveTimeline("remoting references");

      updates.writeInt(Remoting.MessageTag.EOF);

      enterTimeline("remoting assets");
      var output = this.onSendUpdates(updates, assets, async);
      leaveTimeline("remoting assets");

      return output;
    }

    public registerFont(font: flash.text.Font) {
      var updates = new DataBuffer();
      var assets = [];
      var serializer = new Shumway.Remoting.Player.PlayerChannelSerializer();
      serializer.output = updates;
      serializer.outputAssets = assets;
      serializer.writeFont(font);
      this.onSendUpdates(updates, assets);
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

        serializer.phase = Remoting.RemotingPhase.Objects;
        enterTimeline("drawToBitmap");
        serializer.writeDisplayObject(displayObject);
        leaveTimeline("drawToBitmap");

        serializer.phase = Remoting.RemotingPhase.References;
        enterTimeline("drawToBitmap 2");
        serializer.writeDisplayObject(displayObject);
        leaveTimeline("drawToBitmap 2");
      }

      serializer.writeDrawToBitmap(bitmapData, source, matrix, colorTransform, blendMode, clipRect, smoothing);

      updates.writeInt(Shumway.Remoting.MessageTag.EOF);

      enterTimeline("sendUpdates");
      this.onSendUpdates(updates, assets);
      leaveTimeline("sendUpdates");
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

    private _enterEventLoop(): void {
      var self = this;
      var stage = this._stage;
      var rootInitialized = false;
      var runFrameScripts = !playAllSymbolsOption.value;
      var dontSkipFrames = dontSkipFramesOption.value;
      (function tick() {
        // TODO: change this to the mode described in http://www.craftymind.com/2008/04/18/updated-elastic-racetrack-for-flash-9-and-avm2/
        self._frameTimeout = setTimeout(tick, 1000 / frameRateOption.value);
        if (!dontSkipFrames && (
              !frameEnabledOption.value && runFrameScripts ||
              self._shouldThrottleDownFrameExecution()))
        {
          return;
        }
        stage.scaleX = stage.scaleY = stageScaleOption.value;
        for (var i = 0; i < frameRateMultiplierOption.value; i++) {
          enterTimeline("eventLoop");
          var start = performance.now();
          DisplayObject.performFrameNavigation(stage, true, runFrameScripts);
          counter.count("performFrameNavigation", 1, performance.now() - start);
          self._framesPlayed ++;
          if (traceCountersOption.value > 0 &&
              (self._framesPlayed % traceCountersOption.value === 0)) {
            self._traceCounters();
          }
          Loader.progress();
          leaveTimeline("eventLoop");
        }
        if (rootInitialized) {
          stage.render();
        } else {
          rootInitialized = true;
        }
        self._pumpUpdates();
        self.onFrameProcessed();
      })();
    }

    private _traceCounters(): void {
      console.info(Shumway.AVM2.counter.toStringSorted());
      Shumway.AVM2.counter.clear();

      console.info(Shumway.Player.counter.toStringSorted());
      Shumway.Player.counter.clear();

      console.info("advancableInstances: " + flash.display.DisplayObject._advancableInstances.length);
    }

    private _leaveEventLoop(): void {
      release || assert (this._frameTimeout > -1);
      clearInterval(this._frameTimeout);
      this._frameTimeout = -1;
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
        self._enterLoops();
      });

      loaderInfo.addEventListener(flash.events.Event.COMPLETE, function onProgress() {
        stage.stageWidth = 1024;
        stage.stageHeight = 1024;

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
          if (symbol instanceof Shumway.Timeline.BitmapSymbol) {
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
            if (symbol instanceof Shumway.Timeline.SpriteSymbol) {
              frames = (<Shumway.Timeline.SpriteSymbol>symbol).numFrames;
            }
          }
          if (playSymbolFrameDurationOption.value > 0) {
            frames = playSymbolFrameDurationOption.value;
          }
          setTimeout(showNextSymbol, (1000 / frameRateOption.value) * frames);
        }
        setTimeout(showNextSymbol, 1000 / frameRateOption.value);
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

    onExternalCommand(command) {
      throw new Error('This method is abstract');
    }

    onFrameProcessed() {
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
