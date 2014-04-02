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
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["thickness", "pixelHinting", "miterLimit", "fill", "_scaleMode", "_caps", "_joints", "scaleMode", "scaleMode", "caps", "caps", "joints", "joints"];
    
    constructor (thickness: number = NaN, pixelHinting: boolean = false, scaleMode: string = "normal", caps: string = "none", joints: string = "round", miterLimit: number = 3, fill: flash.display.IGraphicsFill = null) {
      thickness = +thickness; pixelHinting = !!pixelHinting; scaleMode = "" + scaleMode; caps = "" + caps; joints = "" + joints; miterLimit = +miterLimit; fill = fill;
      false && super();
      notImplemented("Dummy Constructor: public flash.display.GraphicsStroke");
    }
    
    // JS -> AS Bindings
    
    thickness: number;
    pixelHinting: boolean;
    miterLimit: number;
    fill: flash.display.IGraphicsFill;
    _scaleMode: string;
    _caps: string;
    _joints: string;
    scaleMode: string;
    caps: string;
    joints: string;
    
    // AS -> JS Bindings
    
    // _scaleMode: string;
    // _caps: string;
    // _joints: string;
  }
}
