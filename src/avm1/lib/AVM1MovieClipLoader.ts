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

///<reference path='../references.ts' />

module Shumway.AVM1.Lib {
  import flash = Shumway.AVMX.AS.flash;

  export class AVM1MovieClipLoader extends AVM1Object {
    static createAVM1Class(context: AVM1Context): AVM1Object {
      return wrapAVM1NativeClass(context, true, AVM1MovieClipLoader,
        [],
        ['loadClip', 'unloadClip', 'getProgress'],
        null, AVM1MovieClipLoader.prototype.avm1Constructor);
    }

    private _loader: flash.display.Loader;
    private _target: IAVM1SymbolBase;

    public avm1Constructor() {
      this._loader = new this.context.sec.flash.display.Loader();
    }

    public loadClip(url: string, target):Boolean {
      this._target = typeof target === 'number' ?
        AVM1Utils.resolveLevel(this.context, target) : AVM1Utils.resolveTarget(this.context, target);

      (<flash.display.DisplayObjectContainer>this._target.as3Object).addChild(this._loader);

      this._loader.contentLoaderInfo.addEventListener(flash.events.Event.OPEN, this.openHandler.bind(this));
      this._loader.contentLoaderInfo.addEventListener(flash.events.ProgressEvent.PROGRESS, this.progressHandler.bind(this));
      this._loader.contentLoaderInfo.addEventListener(flash.events.IOErrorEvent.IO_ERROR, this.ioErrorHandler.bind(this));
      this._loader.contentLoaderInfo.addEventListener(flash.events.Event.COMPLETE, this.completeHandler.bind(this));
      this._loader.contentLoaderInfo.addEventListener(flash.events.Event.INIT, this.initHandler.bind(this));

      this._loader.load(new this.context.sec.flash.net.URLRequest(url));
      // TODO: find out under which conditions we should return false here
      return true;
    }

    public unloadClip(target):Boolean {
      var nativeTarget: IAVM1SymbolBase = typeof target === 'number' ?
        AVM1Utils.resolveLevel(this.context, target) : AVM1Utils.resolveTarget(this.context, target);

      (<flash.display.DisplayObjectContainer>nativeTarget.as3Object).removeChild(this._loader);
      // TODO: find out under which conditions unloading a clip can fail
      return true;
    }

    public getProgress(target): number {
      return this._loader.contentLoaderInfo.bytesLoaded;
    }

    private _broadcastMessage(message: string, args: any[] = null) {
      avm1BroadcastEvent(this._target.context, this, message, args);
    }

    private openHandler(event: flash.events.Event): void {
      this._broadcastMessage('onLoadStart', [this._target]);
    }

    private progressHandler(event: flash.events.ProgressEvent):void {
      this._broadcastMessage('onLoadProgress', [this._target, event.bytesLoaded, event.bytesTotal]);
    }

    private ioErrorHandler(event: flash.events.IOErrorEvent):void {
      this._broadcastMessage('onLoadError', [this._target, event.errorID, 501]);
    }

    private completeHandler(event: flash.events.Event):void {
      this._broadcastMessage('onLoadComplete', [this._target]);
    }

    private initHandler(event: flash.events.Event):void {
      var exitFrameCallback = function () {
        this._target.as3Object.removeEventListener(flash.events.Event.EXIT_FRAME, exitFrameCallback);
        this._broadcastMessage('onLoadInit', [this._target]);
      }.bind(this);
      // MovieClipLoader's init event is dispatched after all frame scripts of the AVM1 instance
      // have run for one additional iteration.
      this._target.as3Object.addEventListener(flash.events.Event.EXIT_FRAME, exitFrameCallback)
    }
  }
}
