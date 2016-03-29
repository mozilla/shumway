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
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class Camera extends flash.events.EventDispatcher {
    
    static classInitializer: any = null;

    constructor () {
      super();
    }

    static get names(): ASArray {
      release || somewhatImplemented("public flash.media.Camera::get names");
      return this.sec.createArrayUnsafe([]);
    }
    static get isSupported(): boolean {
      return false;
    }
    static getCamera(name: string = null): flash.media.Camera {
      name = axCoerceString(name);
      release || somewhatImplemented("public flash.media.Camera::static getCamera");
      return null;
    }
    static _scanHardware(): void {
      release || somewhatImplemented("public flash.media.Camera::static _scanHardware");
    }

    get activityLevel(): number {
      release || somewhatImplemented("public flash.media.Camera::get activityLevel");
      return 0;
    }
    get bandwidth(): number /*int*/ {
      release || somewhatImplemented("public flash.media.Camera::get bandwidth");
      return 0;
    }
    get currentFPS(): number {
      release || somewhatImplemented("public flash.media.Camera::get currentFPS");
      return 0;
    }
    get fps(): number {
      release || somewhatImplemented("public flash.media.Camera::get fps");
      return 0;
    }
    get height(): number /*int*/ {
      release || somewhatImplemented("public flash.media.Camera::get height");
      return 0;
    }
    get index(): number /*int*/ {
      release || somewhatImplemented("public flash.media.Camera::get index");
      return 0;
    }
    get keyFrameInterval(): number /*int*/ {
      release || somewhatImplemented("public flash.media.Camera::get keyFrameInterval");
      return 1;
    }
    get loopback(): boolean {
      release || somewhatImplemented("public flash.media.Camera::get loopback");
      return false;
    }
    get motionLevel(): number /*int*/ {
      release || somewhatImplemented("public flash.media.Camera::get motionLevel");
      return 0;
    }
    get motionTimeout(): number /*int*/ {
      release || somewhatImplemented("public flash.media.Camera::get motionTimeout");
      return 0;
    }
    get muted(): boolean {
      release || somewhatImplemented("public flash.media.Camera::get muted");
      return true;
    }
    get name(): string {
      release || somewhatImplemented("public flash.media.Camera::get name");
      return '';
    }
    get quality(): number /*int*/ {
      release || somewhatImplemented("public flash.media.Camera::get quality");
      return 0;
    }
    get width(): number /*int*/ {
      release || somewhatImplemented("public flash.media.Camera::get width");
      return 0;
    }
    setCursor(value: boolean): void {
      value = !!value;
      release || somewhatImplemented("public flash.media.Camera::setCursor");
    }
    setKeyFrameInterval(keyFrameInterval: number /*int*/): void {
      keyFrameInterval = keyFrameInterval | 0;
      release || somewhatImplemented("public flash.media.Camera::setKeyFrameInterval");
    }
    setLoopback(compress: boolean = false): void {
      compress = !!compress;
      release || somewhatImplemented("public flash.media.Camera::setLoopback");
    }
    setMode(width: number /*int*/, height: number /*int*/, fps: number, favorArea: boolean = true): void {
      width = width | 0; height = height | 0; fps = +fps; favorArea = !!favorArea;
      release || somewhatImplemented("public flash.media.Camera::setMode");
    }
    setMotionLevel(motionLevel: number /*int*/, timeout: number /*int*/ = 2000): void {
      motionLevel = motionLevel | 0; timeout = timeout | 0;
      release || somewhatImplemented("public flash.media.Camera::setMotionLevel");
    }
    setQuality(bandwidth: number /*int*/, quality: number /*int*/): void {
      bandwidth = bandwidth | 0; quality = quality | 0;
      release || somewhatImplemented("public flash.media.Camera::setQuality");
    }
    drawToBitmapData(destination: flash.display.BitmapData): void {
      destination = destination;
      release || somewhatImplemented("public flash.media.Camera::drawToBitmapData");
    }
    copyToByteArray(rect: flash.geom.Rectangle, destination: flash.utils.ByteArray): void {
      rect = rect; destination = destination;
      release || somewhatImplemented("public flash.media.Camera::copyToByteArray");
    }
    copyToVector(rect: flash.geom.Rectangle, destination: Float64Vector): void {
      rect = rect; destination = destination;
      release || somewhatImplemented("public flash.media.Camera::copyToVector");
    }
  }
}
