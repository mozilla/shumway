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
  import FrameContainer = Shumway.GFX.FrameContainer;
  import Easel = Shumway.GFX.Easel;
  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
  import AVM2 = Shumway.AVM2.Runtime.AVM2;

  import Event = flash.events.Event;
  import DisplayObject = flash.display.DisplayObject;
  import DisplayObjectContainer = flash.display.DisplayObjectContainer;
  import MovieClip = flash.display.MovieClip;
  import Loader = flash.display.Loader;
  import VisitorFlags = flash.display.VisitorFlags;

  import MouseEventAndPointData = Shumway.AVM2.AS.flash.ui.MouseEventAndPointData;
  import MouseEventDispatcher = flash.ui.MouseEventDispatcher;
  import KeyboardEventData = Shumway.AVM2.AS.flash.ui.KeyboardEventData;
  import KeyboardEventDispatcher = flash.ui.KeyboardEventDispatcher;
  import FocusEventData = Shumway.Remoting.Player.FocusEventData;

  import IBitmapDataSerializer = flash.display.IBitmapDataSerializer;

  import Remoting = Shumway.Remoting;
  import IPlayerChannel = Remoting.IPlayerChannel;

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
    private _channel: IPlayerChannel;

    private static _syncFrameRate = 60;

    private _mouseEventDispatcher: MouseEventDispatcher;
    private _keyboardEventDispatcher: KeyboardEventDispatcher;

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

    constructor(channel: IPlayerChannel) {
      this._channel = channel;

      this._keyboardEventDispatcher = new KeyboardEventDispatcher();
      this._mouseEventDispatcher = new MouseEventDispatcher();

      channel.registerForEventUpdates(this._processEventUpdates.bind(this));

      AVM2.instance.globals['Shumway.Player.Utils'] = this;
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
      assert (!this._loader, "Can't load twice.");
      var self = this;
      var stage = this._stage = new flash.display.Stage();
      var loader = this._loader = flash.display.Loader.getRootLoader();
      var loaderInfo = this._loaderInfo = loader.contentLoaderInfo;

      if (playAllSymbolsOption.value) {
        this._playAllSymbols();
        loaderInfo._allowCodeExecution = false;
      } else {
        loaderInfo.addEventListener(flash.events.ProgressEvent.PROGRESS, function onProgress() {
          var root = loader.content;
          if (!root) {
            return;
          }
          loaderInfo.removeEventListener(flash.events.ProgressEvent.PROGRESS, onProgress);
          stage.frameRate = loaderInfo.frameRate;
          stage.stageWidth = loaderInfo.width;
          stage.stageHeight = loaderInfo.height;
          stage.addChildAtDepth(root, 0);
          // self._pumpUpdates();
          self._enterLoops();
        });
      }
      this._loader.load(new flash.net.URLRequest(url));
    }

    private _processEventUpdates(updates: DataBuffer) {
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
              this._hasFocus = false;
              break;
            case FocusEventType.WindowFocus:
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

    public syncDisplayObject(displayObject: flash.display.DisplayObject): void {
      var updates = new DataBuffer();
      var assets = [];
      var serializer = new Remoting.Player.PlayerChannelSerializer();
      serializer.output = updates;
      serializer.outputAssets = assets;

      if (flash.display.Stage.isType(displayObject)) {
        serializer.writeStage(<flash.display.Stage>displayObject);
      }

      serializer.phase = Remoting.RemotingPhase.Objects;
      enterTimeline("writeDisplayObject");
      serializer.writeDisplayObject(displayObject);
      leaveTimeline("writeDisplayObject");

      serializer.phase = Remoting.RemotingPhase.References;
      enterTimeline("writeDisplayObject 2");
      serializer.writeDisplayObject(displayObject);
      leaveTimeline("writeDisplayObject 2");

      updates.writeInt(Remoting.MessageTag.EOF);

      enterTimeline("sendUpdates");
      this._channel.sendUpdates(updates, assets);
      leaveTimeline("sendUpdates");
    }

    public registerFont(font: flash.text.Font) {
      var updates = new DataBuffer();
      var assets = [];
      var serializer = new Shumway.Remoting.Player.PlayerChannelSerializer();
      serializer.output = updates;
      serializer.outputAssets = assets;
      serializer.writeFont(font);
      this._channel.sendUpdates(updates, assets);
    }

    public cacheAsBitmap(bitmapData: flash.display.BitmapData, source: Shumway.Remoting.IRemotable, matrix: flash.geom.Matrix = null, colorTransform: flash.geom.ColorTransform = null, blendMode: string = null, clipRect: flash.geom.Rectangle = null, smoothing: boolean = false) {
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
        enterTimeline("cacheAsBitmap");
        serializer.writeDisplayObject(displayObject);
        leaveTimeline("cacheAsBitmap");

        serializer.phase = Remoting.RemotingPhase.References;
        enterTimeline("cacheAsBitmap 2");
        serializer.writeDisplayObject(displayObject);
        leaveTimeline("cacheAsBitmap 2");
      }

      serializer.writeCacheAsBitmap(bitmapData, source, matrix, colorTransform, blendMode, clipRect, smoothing);

      updates.writeInt(Shumway.Remoting.MessageTag.EOF);

      enterTimeline("sendUpdates");
      this._channel.sendUpdates(updates, assets);
      leaveTimeline("sendUpdates");
    }

    public requestRendering(): void {
      this._pumpDisplayListUpdates();
    }

    /**
     * Update the frame container with the latest changes from the display list.
     */
    private _pumpUpdates() {
      if (this._shouldThrottleDownRendering()) {
        return;
      }
      var timeSinceLastPump = performance.now() - this._lastPumpTime;
      if (timeSinceLastPump < (1000 / pumpRateOption.value)) {
        return;
      }
      enterTimeline("pump");
      if (pumpEnabledOption.value) {
        this._pumpDisplayListUpdates();
        this._lastPumpTime = performance.now();
      }
      leaveTimeline("pump");
    }

    private _leaveSyncLoop(): void {
      assert (this._frameTimeout > -1);
      clearInterval(this._frameTimeout);
    }

    private _enterEventLoop(): void {
      var self = this;
      var stage = this._stage;
      var rootInitialized = false;
      (function tick() {
        self._frameTimeout = setTimeout(tick, 1000 / frameRateOption.value);
        if (!frameEnabledOption.value || self._shouldThrottleDownFrameExecution()) {
          return;
        }
        stage.scaleX = stage.scaleY = stageScaleOption.value;
        for (var i = 0; i < frameRateMultiplierOption.value; i++) {
          enterTimeline("eventLoop");
          enterTimeline("initFrame");
          MovieClip.initFrame();
          leaveTimeline("initFrame");
          enterTimeline("constructFrame");
          MovieClip.constructFrame(playAllSymbolsOption.value);
          leaveTimeline("constructFrame");
          Loader.progress();
          leaveTimeline("eventLoop");
        }
        if (rootInitialized) {
          stage.render();
        } else {
          rootInitialized = true;
        }
        self._pumpUpdates();
      })();
    }

    private _leaveEventLoop(): void {
      assert (this._frameTimeout > -1);
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
          flash.display.MovieClip.reset();
          flash.display.DisplayObjectContainer.reset();
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
          }
          var frames = 1;
          if (symbol && symbol.id > 0) {
            show(symbol);
            if (symbol instanceof Shumway.Timeline.SpriteSymbol) {
              frames = (<Shumway.Timeline.SpriteSymbol>symbol).numFrames;
            }
          }
          setTimeout(showNextSymbol, (1000 / frameRateOption.value) * frames);
        }
        setTimeout(showNextSymbol, 1000 / frameRateOption.value);
      });
    }
  }
}
