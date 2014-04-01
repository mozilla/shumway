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
// Class: GraphicsBitmapFill
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  export class GraphicsBitmapFill extends ASNative implements IGraphicsFill, IGraphicsData {
    static initializer: any = null;
    constructor (bitmapData: flash.display.BitmapData = null, matrix: flash.geom.Matrix = null, repeat: boolean = true, smooth: boolean = false) {
      bitmapData = bitmapData; matrix = matrix; repeat = !!repeat; smooth = !!smooth;
      false && super();
      notImplemented("Dummy Constructor: public flash.display.GraphicsBitmapFill");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    bitmapData: flash.display.BitmapData;
    matrix: flash.geom.Matrix;
    repeat: boolean;
    smooth: boolean;
    // Instance AS -> JS Bindings
  }
}
