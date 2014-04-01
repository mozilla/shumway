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
// Class: Sprite
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Sprite extends flash.display.DisplayObjectContainer {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.display.Sprite");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    get graphics(): flash.display.Graphics {
      notImplemented("public flash.display.Sprite::get graphics"); return;
    }
    get buttonMode(): boolean {
      notImplemented("public flash.display.Sprite::get buttonMode"); return;
    }
    set buttonMode(value: boolean) {
      value = !!value;
      notImplemented("public flash.display.Sprite::set buttonMode"); return;
    }
    startDrag(lockCenter: boolean = false, bounds: flash.geom.Rectangle = null): void {
      lockCenter = !!lockCenter; bounds = bounds;
      notImplemented("public flash.display.Sprite::startDrag"); return;
    }
    stopDrag(): void {
      notImplemented("public flash.display.Sprite::stopDrag"); return;
    }
    startTouchDrag(touchPointID: number /*int*/, lockCenter: boolean = false, bounds: flash.geom.Rectangle = null): void {
      touchPointID = touchPointID | 0; lockCenter = !!lockCenter; bounds = bounds;
      notImplemented("public flash.display.Sprite::startTouchDrag"); return;
    }
    stopTouchDrag(touchPointID: number /*int*/): void {
      touchPointID = touchPointID | 0;
      notImplemented("public flash.display.Sprite::stopTouchDrag"); return;
    }
    get dropTarget(): flash.display.DisplayObject {
      notImplemented("public flash.display.Sprite::get dropTarget"); return;
    }
    constructChildren(): void {
      notImplemented("public flash.display.Sprite::constructChildren"); return;
    }
    get hitArea(): flash.display.Sprite {
      notImplemented("public flash.display.Sprite::get hitArea"); return;
    }
    set hitArea(value: flash.display.Sprite) {
      value = value;
      notImplemented("public flash.display.Sprite::set hitArea"); return;
    }
    get useHandCursor(): boolean {
      notImplemented("public flash.display.Sprite::get useHandCursor"); return;
    }
    set useHandCursor(value: boolean) {
      value = !!value;
      notImplemented("public flash.display.Sprite::set useHandCursor"); return;
    }
    get soundTransform(): flash.media.SoundTransform {
      notImplemented("public flash.display.Sprite::get soundTransform"); return;
    }
    set soundTransform(sndTransform: flash.media.SoundTransform) {
      sndTransform = sndTransform;
      notImplemented("public flash.display.Sprite::set soundTransform"); return;
    }
  }
}
