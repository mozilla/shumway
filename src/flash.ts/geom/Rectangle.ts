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
// Class: Rectangle
module Shumway.AVM2.AS.flash.geom {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Rectangle extends ASNative {
    static initializer: any = null;
    constructor (x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
      x = +x; y = +y; width = +width; height = +height;
      false && super();
      notImplemented("Dummy Constructor: public flash.geom.Rectangle");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    x: number;
    y: number;
    width: number;
    height: number;
    left: number;
    right: number;
    top: number;
    bottom: number;
    topLeft: flash.geom.Point;
    bottomRight: flash.geom.Point;
    size: flash.geom.Point;
    clone: () => flash.geom.Rectangle;
    isEmpty: () => boolean;
    setEmpty: () => void;
    inflate: (dx: number, dy: number) => void;
    inflatePoint: (point: flash.geom.Point) => void;
    offset: (dx: number, dy: number) => void;
    offsetPoint: (point: flash.geom.Point) => void;
    contains: (x: number, y: number) => boolean;
    containsPoint: (point: flash.geom.Point) => boolean;
    containsRect: (rect: flash.geom.Rectangle) => boolean;
    intersection: (toIntersect: flash.geom.Rectangle) => flash.geom.Rectangle;
    intersects: (toIntersect: flash.geom.Rectangle) => boolean;
    union: (toUnion: flash.geom.Rectangle) => flash.geom.Rectangle;
    equals: (toCompare: flash.geom.Rectangle) => boolean;
    copyFrom: (sourceRect: flash.geom.Rectangle) => void;
    setTo: (xa: number, ya: number, widtha: number, heighta: number) => void;
    // Instance AS -> JS Bindings
  }
}
