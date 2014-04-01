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
// Class: GraphicsStroke
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  export class GraphicsStroke extends ASNative implements IGraphicsStroke, IGraphicsData {
    static initializer: any = null;
    constructor (thickness: number = NaN, pixelHinting: boolean = false, scaleMode: string = "normal", caps: string = "none", joints: string = "round", miterLimit: number = 3, fill: flash.display.IGraphicsFill = null) {
      thickness = +thickness; pixelHinting = !!pixelHinting; scaleMode = "" + scaleMode; caps = "" + caps; joints = "" + joints; miterLimit = +miterLimit; fill = fill;
      false && super();
      notImplemented("Dummy Constructor: public flash.display.GraphicsStroke");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    thickness: number;
    pixelHinting: boolean;
    caps: string;
    _caps: string;
    joints: string;
    _joints: string;
    miterLimit: number;
    scaleMode: string;
    _scaleMode: string;
    fill: flash.display.IGraphicsFill;
    // Instance AS -> JS Bindings
  }
}
