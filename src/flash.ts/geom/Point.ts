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
// Class: Point
module Shumway.AVM2.AS.flash.geom {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Point extends ASNative {
    static initializer: any = null;
    constructor (x: number = 0, y: number = 0) {
      x = +x; y = +y;
      false && super();
      notImplemented("Dummy Constructor: public flash.geom.Point");
    }
    // Static   JS -> AS Bindings
    static interpolate: (pt1: flash.geom.Point, pt2: flash.geom.Point, f: number) => flash.geom.Point;
    static distance: (pt1: flash.geom.Point, pt2: flash.geom.Point) => number;
    static polar: (len: number, angle: number) => flash.geom.Point;
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    x: number;
    y: number;
    length: number;
    clone: () => flash.geom.Point;
    offset: (dx: number, dy: number) => void;
    equals: (toCompare: flash.geom.Point) => boolean;
    subtract: (v: flash.geom.Point) => flash.geom.Point;
    add: (v: flash.geom.Point) => flash.geom.Point;
    normalize: (thickness: number) => void;
    copyFrom: (sourcePoint: flash.geom.Point) => void;
    setTo: (xa: number, ya: number) => void;
    // Instance AS -> JS Bindings
  }
}
