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
// Class: Camera
module Shumway.AVMX.AS.flash.media {
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class Camera extends flash.events.EventDispatcher {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      super();
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    // static _names: any [];
    // static _isSupported: boolean;
    get names(): any [] {
      notImplemented("public flash.media.Camera::get names"); return;
      // return this._names;
    }
    get isSupported(): boolean {
      notImplemented("public flash.media.Camera::get isSupported"); return;
      // return this._isSupported;
    }
    static getCamera(name: string = null): flash.media.Camera {
      name = axCoerceString(name);
      notImplemented("public flash.media.Camera::static getCamera"); return;
    }
    static _scanHardware(): void {
      notImplemented("public flash.media.Camera::static _scanHardware"); return;
    }
    
    // _activityLevel: number;
    // _bandwidth: number /*int*/;
    // _currentFPS: number;
    // _fps: number;
    // _height: number /*int*/;
    // _index: number /*int*/;
    // _keyFrameInterval: number /*int*/;
    // _loopback: boolean;
    // _motionLevel: number /*int*/;
    // _motionTimeout: number /*int*/;
    // _muted: boolean;
    // _name: string;
    // _position: string;
    // _quality: number /*int*/;
    // _width: number /*int*/;
    get activityLevel(): number {
      notImplemented("public flash.media.Camera::get activityLevel"); return;
      // return this._activityLevel;
    }
    get bandwidth(): number /*int*/ {
      notImplemented("public flash.media.Camera::get bandwidth"); return;
      // return this._bandwidth;
    }
    get currentFPS(): number {
      notImplemented("public flash.media.Camera::get currentFPS"); return;
      // return this._currentFPS;
    }
    get fps(): number {
      notImplemented("public flash.media.Camera::get fps"); return;
      // return this._fps;
    }
    get height(): number /*int*/ {
      notImplemented("public flash.media.Camera::get height"); return;
      // return this._height;
    }
    get index(): number /*int*/ {
      notImplemented("public flash.media.Camera::get index"); return;
      // return this._index;
    }
    get keyFrameInterval(): number /*int*/ {
      notImplemented("public flash.media.Camera::get keyFrameInterval"); return;
      // return this._keyFrameInterval;
    }
    get loopback(): boolean {
      notImplemented("public flash.media.Camera::get loopback"); return;
      // return this._loopback;
    }
    get motionLevel(): number /*int*/ {
      notImplemented("public flash.media.Camera::get motionLevel"); return;
      // return this._motionLevel;
    }
    get motionTimeout(): number /*int*/ {
      notImplemented("public flash.media.Camera::get motionTimeout"); return;
      // return this._motionTimeout;
    }
    get muted(): boolean {
      notImplemented("public flash.media.Camera::get muted"); return;
      // return this._muted;
    }
    get name(): string {
      notImplemented("public flash.media.Camera::get name"); return;
      // return this._name;
    }
    get position(): string {
      notImplemented("public flash.media.Camera::get position"); return;
      // return this._position;
    }
    get quality(): number /*int*/ {
      notImplemented("public flash.media.Camera::get quality"); return;
      // return this._quality;
    }
    get width(): number /*int*/ {
      notImplemented("public flash.media.Camera::get width"); return;
      // return this._width;
    }
    setCursor(value: boolean): void {
      value = !!value;
      notImplemented("public flash.media.Camera::setCursor"); return;
    }
    setKeyFrameInterval(keyFrameInterval: number /*int*/): void {
      keyFrameInterval = keyFrameInterval | 0;
      notImplemented("public flash.media.Camera::setKeyFrameInterval"); return;
    }
    setLoopback(compress: boolean = false): void {
      compress = !!compress;
      notImplemented("public flash.media.Camera::setLoopback"); return;
    }
    setMode(width: number /*int*/, height: number /*int*/, fps: number, favorArea: boolean = true): void {
      width = width | 0; height = height | 0; fps = +fps; favorArea = !!favorArea;
      notImplemented("public flash.media.Camera::setMode"); return;
    }
    setMotionLevel(motionLevel: number /*int*/, timeout: number /*int*/ = 2000): void {
      motionLevel = motionLevel | 0; timeout = timeout | 0;
      notImplemented("public flash.media.Camera::setMotionLevel"); return;
    }
    setQuality(bandwidth: number /*int*/, quality: number /*int*/): void {
      bandwidth = bandwidth | 0; quality = quality | 0;
      notImplemented("public flash.media.Camera::setQuality"); return;
    }
    drawToBitmapData(destination: flash.display.BitmapData): void {
      destination = destination;
      notImplemented("public flash.media.Camera::drawToBitmapData"); return;
    }
    copyToByteArray(rect: flash.geom.Rectangle, destination: flash.utils.ByteArray): void {
      rect = rect; destination = destination;
      notImplemented("public flash.media.Camera::copyToByteArray"); return;
    }
    copyToVector(rect: flash.geom.Rectangle, destination: Float64Vector): void {
      rect = rect; destination = destination;
      notImplemented("public flash.media.Camera::copyToVector"); return;
    }
  }
}
