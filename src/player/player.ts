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

module Shumway {
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

  import TimelineBuffer = Shumway.Tools.Profiler.TimelineBuffer;

  export var playerTimelineBuffer = new TimelineBuffer("Player");

  export function enterPlayerTimeline(name: string) {
    playerTimelineBuffer && playerTimelineBuffer.enter(name);
  }

  export function leavePlayerTimeline(name: string) {
    playerTimelineBuffer && playerTimelineBuffer.leave(name);
  }

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

      if (autoPlayOption.value) {
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
      } else {
        this._enterInspectorMode();
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
      var updates = new DataBuffer();
      var assets = [];
      var serializer = new Remoting.Player.PlayerChannelSerializer();
      serializer.output = updates;
      serializer.outputAssets = assets;

      serializer.phase = Remoting.RemotingPhase.Objects;
      enterPlayerTimeline("remoteObjects");
      serializer.writeStage(this._stage);
      leavePlayerTimeline("remoteObjects");

      serializer.phase = Remoting.RemotingPhase.References;
      enterPlayerTimeline("remoteReferences");
      serializer.writeStage(this._stage);
      leavePlayerTimeline("remoteReferences");

      updates.writeInt(Remoting.MessageTag.EOF);

      enterPlayerTimeline("sendUpdates");
      this._channel.sendUpdates(updates, assets);
      leavePlayerTimeline("sendUpdates");
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
        enterPlayerTimeline("cacheAsBitmap");
        serializer.writeStage(displayObject);
        leavePlayerTimeline("cacheAsBitmap");

        serializer.phase = Remoting.RemotingPhase.References;
        enterPlayerTimeline("cacheAsBitmap 2");
        serializer.writeStage(displayObject);
        leavePlayerTimeline("cacheAsBitmap 2");
      }

      serializer.writeCacheAsBitmap(bitmapData, source, matrix, colorTransform, blendMode, clipRect, smoothing);

      updates.writeInt(Shumway.Remoting.MessageTag.EOF);

      enterPlayerTimeline("sendUpdates");
      this._channel.sendUpdates(updates, assets);
      leavePlayerTimeline("sendUpdates");
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
      enterPlayerTimeline("pump");
      if (pumpEnabledOption.value) {
        this._pumpDisplayListUpdates();
        this._lastPumpTime = performance.now();
      }
      leavePlayerTimeline("pump");
    }

    private _leaveSyncLoop(): void {
      assert (this._frameTimeout > -1);
      clearInterval(this._frameTimeout);
    }

    private _enterEventLoop(): void {
      var self = this;
      var stage = this._stage;
      var rootInitialized = false;
      // TODO remove, player.ts will not have access to the DOM
      if (frameRateOption.ctrl) {
        frameRateOption.value = stage.frameRate;
        frameRateOption.ctrl.updateDisplay();
      }
      (function tick() {
        self._frameTimeout = setTimeout(tick, 1000 / frameRateOption.value);
        if (!frameEnabledOption.value || self._shouldThrottleDownFrameExecution()) {
          return;
        }
        for (var i = 0; i < frameRateMultiplierOption.value; i++) {
          enterPlayerTimeline("eventLoop");
          enterPlayerTimeline("initFrame");
          MovieClip.initFrame();
          leavePlayerTimeline("initFrame");
          enterPlayerTimeline("constructFrame");
          MovieClip.constructFrame(!autoPlayOption.value);
          leavePlayerTimeline("constructFrame");
          Loader.progress();
          leavePlayerTimeline("eventLoop");
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

    // TODO remove, player.ts will not have access to the DOM
    private _enterInspectorMode() {
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

        /**
         * Create options list with all the symbols.
         */
        var options = {
          "None":         -3,
          "All Shapes":   -2,
          "All Sprites":  -1
        };

        loaderInfo._dictionary.forEach(function (value, key) {
          var label = key + ": " + value.originalSymbolClass.toString();
          if (value.symbolClass !== value.originalSymbolClass) {
            label += " (" + value.symbolClass.toString() + ")";
          }
          options[label] = key;
        });

        playSymbolOption.ctrl.updateOptions(options);
        playSymbolOption.ctrl.onChange(function () {
          var id = playSymbolOption.value | 0;
          if (id === -2 || id === -1) {
            while (stage.numChildren > 0) {
              stage.removeChildAt(0);
            }
            loaderInfo._dictionary.forEach(function (_, key) {
              var symbol = loaderInfo.getSymbolById(key);
              if (id === -2) {
                if (!(symbol instanceof Shumway.Timeline.ShapeSymbol)) {
                  return;
                }
              } else if (id === -1) {
                if (!(symbol instanceof Shumway.Timeline.SpriteSymbol)) {
                  return;
                }
              }
              var symbolInstance = symbol.originalSymbolClass.initializeFrom(symbol);
              symbol.originalSymbolClass.instanceConstructorNoInitialize.call(symbolInstance);
              stage.addChild(symbolInstance);
            });
          } else {
            var symbol = loaderInfo.getSymbolById(id);
            var symbolInstance = symbol.originalSymbolClass.initializeFrom(symbol);
            symbol.originalSymbolClass.instanceConstructorNoInitialize.call(symbolInstance);
            while (stage.numChildren > 0) {
              stage.removeChildAt(0);
            }
            stage.addChild(symbolInstance);
          }
        });
      });
    }
  }
}
