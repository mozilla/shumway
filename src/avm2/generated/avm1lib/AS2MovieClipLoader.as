﻿/*
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package avm1lib {
import flash.display.Loader;
import flash.display.MovieClip;
import flash.events.Event;
import flash.events.IOErrorEvent;
import flash.events.ProgressEvent;
import flash.net.URLRequest;

[native(cls="AS2MovieClipLoader")]
public dynamic class AS2MovieClipLoader extends Object {
  public function AS2MovieClipLoader() {
    AS2Broadcaster.initialize(this);
    _as3Object = new Loader();
  }
  public var _as3Object: Loader;

  private native function get _bytesLoaded(): Number;

  public function loadClip(url: String, target: Object): Boolean {
    var nativeObject: Loader = this._as3Object;
    var nativeTarget: MovieClip = typeof target === 'number'
                                  ? AS2Utils.resolveLevel(target as Number)
                                  : AS2Utils.resolveTarget(target);
    nativeTarget._as3Object.addChild(nativeObject);

    nativeObject.contentLoaderInfo.addEventListener(Event.OPEN, openHandler);
    nativeObject.contentLoaderInfo.addEventListener(ProgressEvent.PROGRESS, progressHandler);
    nativeObject.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
    nativeObject.contentLoaderInfo.addEventListener(Event.COMPLETE, completeHandler);
    nativeObject.contentLoaderInfo.addEventListener(Event.INIT, initHandler);

    nativeObject.load(new URLRequest(url));
    // TODO: find out under which conditions we should return false here
    return true;
  }
  public function unloadClip(target: Object): Boolean {
    var nativeObject: Loader = this._as3Object;
    var nativeTarget: MovieClip = typeof target === 'number'
                                  ? AS2Utils.resolveLevel(target as Number)
                                  : AS2Utils.resolveTarget(target);
    nativeTarget._as3Object.removeChild(nativeObject);
    // TODO: find out under which conditions unloading a clip can fail
    return true;
  }

  public function getProgress(target: Object): Object {
    return _bytesLoaded;
  }

  private function openHandler(event: Event): void {
    this.broadcastMessage('onLoadStart', event.target);
  }
  private function progressHandler(event: ProgressEvent): void {
    this.broadcastMessage('onLoadProgress', event.target, event.bytesLoaded, event.bytesTotal);
  }
  private function ioErrorHandler(event: IOErrorEvent): void {
    this.broadcastMessage('onLoadError', event.target, event.errorID, 501);
  }
  private function completeHandler(event: Event): void {
    this.broadcastMessage('onLoadComplete', event.target);
  }
  private function initHandler(event: Event): void {
    this.broadcastMessage('onLoadInit', event.target);
  }
}
}
