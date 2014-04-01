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
// Class: StageVideo
module Shumway.AVM2.AS.flash.media {
  import notImplemented = Shumway.Debug.notImplemented;
  export class StageVideo extends flash.events.EventDispatcher {
    static initializer: any = null;
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.media.StageVideo");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    attachNetStream(netStream: flash.net.NetStream): void {
      netStream = netStream;
      notImplemented("public flash.media.StageVideo::attachNetStream"); return;
    }
    attachCamera(theCamera: flash.media.Camera): void {
      theCamera = theCamera;
      notImplemented("public flash.media.StageVideo::attachCamera"); return;
    }
    get viewPort(): flash.geom.Rectangle {
      notImplemented("public flash.media.StageVideo::get viewPort"); return;
    }
    set viewPort(rect: flash.geom.Rectangle) {
      rect = rect;
      notImplemented("public flash.media.StageVideo::set viewPort"); return;
    }
    set pan(point: flash.geom.Point) {
      point = point;
      notImplemented("public flash.media.StageVideo::set pan"); return;
    }
    get pan(): flash.geom.Point {
      notImplemented("public flash.media.StageVideo::get pan"); return;
    }
    set zoom(point: flash.geom.Point) {
      point = point;
      notImplemented("public flash.media.StageVideo::set zoom"); return;
    }
    get zoom(): flash.geom.Point {
      notImplemented("public flash.media.StageVideo::get zoom"); return;
    }
    set depth(depth: number /*int*/) {
      depth = depth | 0;
      notImplemented("public flash.media.StageVideo::set depth"); return;
    }
    get depth(): number /*int*/ {
      notImplemented("public flash.media.StageVideo::get depth"); return;
    }
    get videoWidth(): number /*int*/ {
      notImplemented("public flash.media.StageVideo::get videoWidth"); return;
    }
    get videoHeight(): number /*int*/ {
      notImplemented("public flash.media.StageVideo::get videoHeight"); return;
    }
    get colorSpaces(): ASVector<string> {
      notImplemented("public flash.media.StageVideo::get colorSpaces"); return;
    }
  }
}
