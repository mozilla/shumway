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
  import FrameContainer = Shumway.GFX.FrameContainer;

  import FramePhase = Shumway.Timeline.FramePhase;

  import ByteArray = flash.utils.ByteArray;
  import Event = flash.events.Event;
  import Sprite = flash.display.Sprite;
  import MovieClip = flash.display.MovieClip;
  import DisplayObject = flash.display.DisplayObject;
  import VisitorFlags = flash.display.VisitorFlags;


  export class Player {
    private _stage: flash.display.Stage;
    private _loader: flash.display.Loader;
    private _loaderInfo: flash.display.LoaderInfo;
    private _syncTimeout: number;
    private _frameTimeout: number;
    private _frameContainer: FrameContainer;

    private static _syncFrameRate = 60;
    private _server: Remoting.Server;

    constructor(frameContainer: FrameContainer) {
      this._frameContainer = frameContainer;
      this._server = new Remoting.Server(this._frameContainer);
    }

    public load(url: string) {
      assert (!this._loader, "Can't load twice.");
      var self = this;
      var stage = this._stage = new flash.display.Stage();
      var loader = this._loader = new flash.display.Loader();
      var loaderInfo = this._loaderInfo = loader.contentLoaderInfo;

      loaderInfo.addEventListener(flash.events.Event.INIT, function onProgress() {
        var root = loader.content;
        if (!root) {
          return;
        }
        loaderInfo.removeEventListener(flash.events.Event.INIT, onProgress);
        stage.frameRate = loaderInfo.frameRate;
        stage.stageWidth = loaderInfo.width;
        stage.stageHeight = loaderInfo.height;
        stage.addChild(root);
        self._enterLoops();
      });

      this._loader.load(new flash.net.URLRequest(url));
    }

    private _enterLoops(): void {
      this._enterSyncLoop();
      this._enterEventLoop();
    }

    private _pumpDisplayListUpdates(): void {
      var stage = this._stage;
      var byteArray = new ByteArray();
      var visitor = new Shumway.Remoting.Client.ClientVisitor();

      visitor.output = byteArray;

      stage.visit(function (displayObject) {
        visitor.writeReferences = false;
        visitor.clearDirtyBits = false;
        visitor.visitDisplayObject(displayObject);
        return VisitorFlags.Continue;
      }, VisitorFlags.None);

      stage.visit(function (displayObject) {
        visitor.writeReferences = true;
        visitor.clearDirtyBits = true;
        visitor.visitDisplayObject(displayObject);
        return VisitorFlags.Continue;
      }, flash.display.VisitorFlags.None);

      byteArray.writeInt(Shumway.Remoting.MessageTag.EOF);
      byteArray.position = 0;
      this._server.recieve(byteArray);
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
      var firstRun = true;
      (function tick() {
        timeline && timeline.enter("eventLoop");
        self._frameTimeout = setTimeout(tick, 1000 / stage.frameRate);

        if (!firstRun) {
          MovieClip.initFrame();
          DisplayObject.broadcastFrameEvent(FramePhase.Enter);
          Sprite.constructFrame();
        }

        DisplayObject.broadcastFrameEvent(FramePhase.Constructed);
        MovieClip.executeFrame();
        DisplayObject.broadcastFrameEvent(FramePhase.Exit);

        if (stage._invalid && !firstRun) {
          stage.broadcastRenderEvent();
        }

        firstRun = false;
        timeline && timeline.leave("eventLoop");
      })();
    }

    private _leaveEventLoop(): void {
      assert (this._frameTimeout > -1);
      clearInterval(this._frameTimeout);
    }
  }
}
