/**
 * Copyright 2013 Mozilla Foundation
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
 * limitations undxr the License.
 */
// Class: Camera
module Shumway.AVM2.AS.flash.media {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Camera extends flash.events.EventDispatcher {
    static initializer: any = null;
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.media.Camera");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    static _scanHardware(): void {
      notImplemented("public flash.media.Camera::static _scanHardware"); return;
    }
    get names(): any [] {
      notImplemented("public flash.media.Camera::get names"); return;
    }
    get isSupported(): boolean {
      notImplemented("public flash.media.Camera::get isSupported"); return;
    }
    static getCamera(name: string = null): flash.media.Camera {
      name = "" + name;
      notImplemented("public flash.media.Camera::static getCamera"); return;
    }
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    get activityLevel(): number {
      notImplemented("public flash.media.Camera::get activityLevel"); return;
    }
    get bandwidth(): number /*int*/ {
      notImplemented("public flash.media.Camera::get bandwidth"); return;
    }
    get currentFPS(): number {
      notImplemented("public flash.media.Camera::get currentFPS"); return;
    }
    get fps(): number {
      notImplemented("public flash.media.Camera::get fps"); return;
    }
    get height(): number /*int*/ {
      notImplemented("public flash.media.Camera::get height"); return;
    }
    get index(): number /*int*/ {
      notImplemented("public flash.media.Camera::get index"); return;
    }
    get keyFrameInterval(): number /*int*/ {
      notImplemented("public flash.media.Camera::get keyFrameInterval"); return;
    }
    get loopback(): boolean {
      notImplemented("public flash.media.Camera::get loopback"); return;
    }
    get motionLevel(): number /*int*/ {
      notImplemented("public flash.media.Camera::get motionLevel"); return;
    }
    get motionTimeout(): number /*int*/ {
      notImplemented("public flash.media.Camera::get motionTimeout"); return;
    }
    get muted(): boolean {
      notImplemented("public flash.media.Camera::get muted"); return;
    }
    get name(): string {
      notImplemented("public flash.media.Camera::get name"); return;
    }
    get position(): string {
      notImplemented("public flash.media.Camera::get position"); return;
    }
    get quality(): number /*int*/ {
      notImplemented("public flash.media.Camera::get quality"); return;
    }
    get width(): number /*int*/ {
      notImplemented("public flash.media.Camera::get width"); return;
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
    copyToVector(rect: flash.geom.Rectangle, destination: ASVector<number /*uint*/>): void {
      rect = rect; destination = destination;
      notImplemented("public flash.media.Camera::copyToVector"); return;
    }
  }
}
