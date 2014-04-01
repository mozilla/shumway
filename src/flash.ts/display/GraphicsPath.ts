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
// Class: GraphicsPath
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  export class GraphicsPath extends ASNative implements IGraphicsPath, IGraphicsData {
    static initializer: any = null;
    constructor (commands: ASVector<number /*int*/> = null, data: ASVector<number> = null, winding: string = "evenOdd") {
      commands = commands; data = data; winding = "" + winding;
      false && super();
      notImplemented("Dummy Constructor: public flash.display.GraphicsPath");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    commands: ASVector<number /*int*/>;
    data: ASVector<number>;
    winding: string;
    _winding: string;
    moveTo: (x: number, y: number) => void;
    lineTo: (x: number, y: number) => void;
    curveTo: (controlX: number, controlY: number, anchorX: number, anchorY: number) => void;
    cubicCurveTo: (controlX1: number, controlY1: number, controlX2: number, controlY2: number, anchorX: number, anchorY: number) => void;
    wideLineTo: (x: number, y: number) => void;
    wideMoveTo: (x: number, y: number) => void;
    // Instance AS -> JS Bindings
  }
}
