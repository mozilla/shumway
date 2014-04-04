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
 * limitations under the License.
 */
// Class: Rectangle
module Shumway.AVM2.AS.flash.geom {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Rectangle extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["x", "y", "width", "height", "left", "left", "right", "right", "top", "top", "bottom", "bottom", "topLeft", "topLeft", "bottomRight", "bottomRight", "size", "size", "clone", "isEmpty", "setEmpty", "inflate", "inflatePoint", "offset", "offsetPoint", "contains", "containsPoint", "containsRect", "intersection", "intersects", "union", "equals", "copyFrom", "setTo", "toString"];
    
    constructor (x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
      x = +x; y = +y; width = +width; height = +height;
      false && super();
      notImplemented("Dummy Constructor: public flash.geom.Rectangle");
    }
    
    // JS -> AS Bindings
    
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
    
    // AS -> JS Bindings
    
    // _left: number;
    // _right: number;
    // _top: number;
    // _bottom: number;
    // _topLeft: flash.geom.Point;
    // _bottomRight: flash.geom.Point;
    // _size: flash.geom.Point;
  }
}
