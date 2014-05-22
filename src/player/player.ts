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

  import IPlayerChannel = Shumway.Remoting.IPlayerChannel;

  declare var timeline: Timeline;

  /**
   * Shumway Player
   *
   * This class brings everything together. Load the swf, runs the event loop and
   * synchronizes the frame tree with the display list.
   */
  export class Player {
    private _stage: flash.display.Stage;
    private _loader: flash.display.Loader;
    private _loaderInfo: flash.display.LoaderInfo;
    private _syncTimeout: number;
    private _frameTimeout: number;
    private _channel: IPlayerChannel;

    private static _syncFrameRate = 60;

    private _mouseEventDispatcher: MouseEventDispatcher;
    private _keyboardEventDispatcher: KeyboardEventDispatcher;

    constructor(channel: IPlayerChannel) {
      this._channel = channel;

      this._keyboardEventDispatcher = new KeyboardEventDispatcher();
      this._mouseEventDispatcher = new MouseEventDispatcher();

      channel.registerForEventUpdates(this._processEventUpdates.bind(this));
    }

    public load(url: string) {
      assert (!this._loader, "Can't load twice.");
      var self = this;
      var stage = this._stage = new flash.display.Stage();
      var loader = this._loader = flash.display.Loader.getRootLoader();
      var loaderInfo = this._loaderInfo = loader.contentLoaderInfo;

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
        self._enterLoops();
      });

      this._loader.load(new flash.net.URLRequest(url));
    }

    private _processEventUpdates(updates: DataBuffer) {
      var deserializer = new Shumway.Remoting.Player.PlayerChannelDeserializer();
      deserializer.input = updates;

      var event = deserializer.readEvent();

      if (event.isKeyboardEvent) {
        // If the stage doesn't have a focus then dispatch events on the stage
        // directly.
        var target = this._stage.focus ? this._stage.focus : this._stage;
        this._keyboardEventDispatcher.target = target;
        this._keyboardEventDispatcher.dispatchKeyboardEvent(<KeyboardEventData>event);
      }
      if (event.isMouseEvent) {
        this._mouseEventDispatcher.stage = this._stage;
        this._mouseEventDispatcher.handleMouseEvent(<MouseEventAndPointData>event);
      }
    }

    private _enterLoops(): void {
      this._enterSyncLoop();
      this._enterEventLoop();
    }

    private _pumpDisplayListUpdates(): void {
      var updates = new DataBuffer();
      var assets = [];
      var serializer = new Shumway.Remoting.Player.PlayerChannelSerializer();
      serializer.output = updates;
      serializer.outputAssets = assets;

      serializer.writeReferences = false;
      serializer.clearDirtyBits = false;
      serializer.writeStage(this._stage);

      serializer.writeReferences = true;
      serializer.clearDirtyBits = true;
      serializer.writeStage(this._stage);

      updates.writeInt(Shumway.Remoting.MessageTag.EOF);

      this._channel.sendUpdates(updates, assets);
    }

    /**
     * Update the frame container with the latest changes from the display list.
     */
    private _enterSyncLoop(): void {
      var self = this;
      (function tick() {
        self._syncTimeout = setTimeout(tick, 1000 / pumpRateOption.value);
        timeline && timeline.enter("pump");
        if (pumpEnabledOption.value) {
          self._pumpDisplayListUpdates()
        }
        timeline && timeline.leave("pump");
      })();
    }

    private _leaveSyncLoop(): void {
      assert (this._frameTimeout > -1);
      clearInterval(this._frameTimeout);
    }

    private _enterEventLoop(): void {
      var self = this;
      var stage = this._stage;
      var rootInitialized = false;
      frameRateOption.value = stage.frameRate;
      (function tick() {
        self._frameTimeout = setTimeout(tick, 1000 / frameRateOption.value);
        if (!frameEnabledOption.value) {
          return;
        }
        for (var i = 0; i < frameRateMultiplierOption.value; i++) {
          timeline && timeline.enter("eventLoop");
          MovieClip.initFrame();
          MovieClip.constructFrame();
          Loader.progress();
          if (rootInitialized) {
            stage.render();
          } else {
            rootInitialized = true;
          }
          timeline && timeline.leave("eventLoop");
        }
      })();
    }

    private _leaveEventLoop(): void {
      assert (this._frameTimeout > -1);
      clearInterval(this._frameTimeout);
      this._frameTimeout = -1;
    }
  }
}
