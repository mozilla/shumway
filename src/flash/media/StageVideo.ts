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
// Class: StageVideo
module Shumway.AVMX.AS.flash.media {
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class StageVideo extends flash.events.EventDispatcher {
    
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
    
    // _viewPort: flash.geom.Rectangle;
    // _pan: flash.geom.Point;
    // _zoom: flash.geom.Point;
    // _depth: number /*int*/;
    // _videoWidth: number /*int*/;
    // _videoHeight: number /*int*/;
    // _colorSpaces: ASVector<any>;
    get viewPort(): flash.geom.Rectangle {
      release || notImplemented("public flash.media.StageVideo::get viewPort"); return;
      // return this._viewPort;
    }
    set viewPort(rect: flash.geom.Rectangle) {
      rect = rect;
      release || notImplemented("public flash.media.StageVideo::set viewPort"); return;
      // this._viewPort = rect;
    }
    get pan(): flash.geom.Point {
      release || notImplemented("public flash.media.StageVideo::get pan"); return;
      // return this._pan;
    }
    set pan(point: flash.geom.Point) {
      point = point;
      release || notImplemented("public flash.media.StageVideo::set pan"); return;
      // this._pan = point;
    }
    get zoom(): flash.geom.Point {
      release || notImplemented("public flash.media.StageVideo::get zoom"); return;
      // return this._zoom;
    }
    set zoom(point: flash.geom.Point) {
      point = point;
      release || notImplemented("public flash.media.StageVideo::set zoom"); return;
      // this._zoom = point;
    }
    get depth(): number /*int*/ {
      release || notImplemented("public flash.media.StageVideo::get depth"); return;
      // return this._depth;
    }
    set depth(depth: number /*int*/) {
      depth = depth | 0;
      release || notImplemented("public flash.media.StageVideo::set depth"); return;
      // this._depth = depth;
    }
    get videoWidth(): number /*int*/ {
      release || notImplemented("public flash.media.StageVideo::get videoWidth"); return;
      // return this._videoWidth;
    }
    get videoHeight(): number /*int*/ {
      release || notImplemented("public flash.media.StageVideo::get videoHeight"); return;
      // return this._videoHeight;
    }
    get colorSpaces(): Float64Vector {
      release || notImplemented("public flash.media.StageVideo::get colorSpaces"); return;
      // return this._colorSpaces;
    }
    attachNetStream(netStream: flash.net.NetStream): void {
      netStream = netStream;
      release || notImplemented("public flash.media.StageVideo::attachNetStream"); return;
    }
    attachCamera(theCamera: flash.media.Camera): void {
      theCamera = theCamera;
      release || notImplemented("public flash.media.StageVideo::attachCamera"); return;
    }
  }
}
