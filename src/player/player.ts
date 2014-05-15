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

  import ByteArray = flash.utils.ByteArray;
  import Event = flash.events.Event;
  import DisplayObject = flash.display.DisplayObject;
  import DisplayObjectContainer = flash.display.DisplayObjectContainer;
  import MovieClip = flash.display.MovieClip;
  import Loader = flash.display.Loader;
  import VisitorFlags = flash.display.VisitorFlags;

  import MouseEventDispatcher = flash.ui.MouseEventDispatcher;
  import KeyboardEventDispatcher = flash.ui.KeyboardEventDispatcher;

  declare var timeline: Timeline;

  export interface IPlayerChannel {
    sendUpdates(updates: ByteArray, assets: Array<ByteArray>);
    registerForMouseEvents(listener: (event: MouseEvent, point: Point) => void);
    registerForKeyboardEvents(listener: (event: KeyboardEvent) => void);
  }

  export interface IGFXChannel {
    registerForUpdates(listener: (updates: ByteArray, assets: Array<ByteArray>) => void);
    sendMouseEvent(event: MouseEvent, point: Point);
    sendKeyboardEvent(event: KeyboardEvent);
  }

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

      channel.registerForMouseEvents(this.dispatchMouseEvent.bind(this));
      channel.registerForKeyboardEvents(this.dispatchKeyboardEvent.bind(this));
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

    public dispatchMouseEvent(event: MouseEvent, point: Point) {
      this._mouseEventDispatcher.stage = this._stage;
      this._mouseEventDispatcher.dispatchMouseEvent(event, point);
    }

    public dispatchKeyboardEvent(event: KeyboardEvent) {
      // If the stage doesn't have a focus then dispatch events on the stage
      // directly.
      var target = this._stage.focus ? this._stage.focus : this._stage;
      this._keyboardEventDispatcher.target = target;
      this._keyboardEventDispatcher.dispatchKeyboardEvent(event);
    }

    private _enterLoops(): void {
      this._enterSyncLoop();
      this._enterEventLoop();
    }

    private _pumpDisplayListUpdates(): void {
      var updates = new ByteArray();
      var assets = new Array<ByteArray>();
      var serializer = new Shumway.Remoting.Client.ChannelSerializer();
      serializer.output = updates;
      serializer.outputAssets = assets;

      serializer.writeReferences = false;
      serializer.clearDirtyBits = false;
      serializer.writeStage(this._stage);

      serializer.writeReferences = true;
      serializer.clearDirtyBits = true;
      serializer.writeStage(this._stage);

      updates.writeInt(Shumway.Remoting.MessageTag.EOF);
      updates.position = 0;

      this._channel.sendUpdates(updates, assets);
    }

    /**
     * Update the frame container with the latest changes from the display list.
     */
    private _enterSyncLoop(): void {
      var self = this;
      (function tick() {
        self._syncTimeout = setTimeout(tick, 1000 / Player._syncFrameRate);
        timeline && timeline.enter("pumpUpdates");
        self._pumpDisplayListUpdates()
        timeline && timeline.leave("pumpUpdates");
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
      (function tick() {
        self._frameTimeout = setTimeout(tick, 1000 / stage.frameRate);
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
      })();
    }

    private _leaveEventLoop(): void {
      assert (this._frameTimeout > -1);
      clearInterval(this._frameTimeout);
      this._frameTimeout = -1;
    }
  }

  class EaselHost {
    private static _mouseEvents = [
      'click',
      'dblclick',
      'mousedown',
      'mousemove',
      'mouseup',
      'mouseover',
      'mouseout'
    ];

    private static _keyboardEvents = [
      'keydown',
      'keypress',
      'keyup'
    ];

    private _easel: Easel;
    private _channel: IGFXChannel;
    private _frameContainer: FrameContainer;
    private _context: Remoting.Server.ChannelDeserializerContext;

    constructor(easel: Easel, channel: IGFXChannel) {
      this._easel = easel;
      this._channel = channel;
      var frameContainer = easel.world;
      this._frameContainer = frameContainer;
      this._context = new Shumway.Remoting.Server.ChannelDeserializerContext(this._frameContainer);

      channel.registerForUpdates(this.readData.bind(this));
    }

    private _mouseEventListener(event: MouseEvent) {
      var position = this._easel.getMouseWorldPosition(event);
      var point = new Point(position.x, position.y);
      this._channel.sendMouseEvent(event, point);
    }

    private _keyboardEventListener(event: KeyboardEvent) {
      this._channel.sendKeyboardEvent(event);
    }

    _addEventListeners() {
      var mouseEventListener = this._mouseEventListener.bind(this);
      var keyboardEventListener = this._keyboardEventListener.bind(this);
      var mouseEvents = EaselHost._mouseEvents;
      for (var i = 0; i < mouseEvents.length; i++) {
        window.addEventListener(mouseEvents[i], mouseEventListener);
      }
      var keyboardEvents = EaselHost._keyboardEvents;
      for (var i = 0; i < keyboardEvents.length; i++) {
        window.addEventListener(keyboardEvents[i], keyboardEventListener);
      }
    }

    readData(updates: ByteArray, assets: Array<ByteArray>) {
      var deserializer = new Remoting.Server.ChannelDeserializer();
      deserializer.input = updates;
      deserializer.inputAssets = assets;
      deserializer.context = this._context;
      deserializer.read();
    }
  }

  export class EaselEmbedding implements IPlayerChannel, IGFXChannel {

    private _player: Player;
    private _easelHost: EaselHost;

    private _channelMouseEventListener: (event: MouseEvent, point: Point) => void;
    private _channelKeyboardEventListener: (event: KeyboardEvent) => void;
    private _channelUpdatesListener: (updates: ByteArray, assets: Array<ByteArray>) => void;

    constructor(easel: Easel) {
      this._easelHost = new EaselHost(easel, this);
      this._easelHost._addEventListeners();
    }

    // IPlayerChannel
    sendUpdates(updates: ByteArray, assets: Array<ByteArray>) : void {
      this._channelUpdatesListener(updates, assets);
    }
    registerForMouseEvents(listener: (event: MouseEvent, point: Point) => void) : void {
      this._channelMouseEventListener = listener;
    }
    registerForKeyboardEvents (listener: (event: KeyboardEvent) => void) : void {
      this._channelKeyboardEventListener = listener;
    }

    // IGFXChannel
    registerForUpdates(listener: (updates: ByteArray, assets: Array<ByteArray>) => void) {
      this._channelUpdatesListener = listener;
    }
    sendMouseEvent(event: MouseEvent, point: Point) {
      if (this._channelMouseEventListener) {
        this._channelMouseEventListener(event, point);
      }
    }
    sendKeyboardEvent(event: KeyboardEvent) {
      if (this._channelKeyboardEventListener) {
        this._channelKeyboardEventListener(event);
      }
    }

    public embed(): Player {
      return this._player = new Shumway.Player(this);
    }
  }
}
