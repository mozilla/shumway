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
// Class: DisplayObjectContainer
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  export class DisplayObjectContainer extends flash.display.InteractiveObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // [];
    
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.display.DisplayObjectContainer");
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    
    // _numChildren: number /*int*/;
    // _textSnapshot: flash.text.TextSnapshot;
    // _tabChildren: boolean;
    // _mouseChildren: boolean;
    get numChildren(): number /*int*/ {
      notImplemented("public flash.display.DisplayObjectContainer::get numChildren"); return;
      // return this._numChildren;
    }
    get textSnapshot(): flash.text.TextSnapshot {
      notImplemented("public flash.display.DisplayObjectContainer::get textSnapshot"); return;
      // return this._textSnapshot;
    }
    get tabChildren(): boolean {
      notImplemented("public flash.display.DisplayObjectContainer::get tabChildren"); return;
      // return this._tabChildren;
    }
    set tabChildren(enable: boolean) {
      enable = !!enable;
      notImplemented("public flash.display.DisplayObjectContainer::set tabChildren"); return;
      // this._tabChildren = enable;
    }
    get mouseChildren(): boolean {
      notImplemented("public flash.display.DisplayObjectContainer::get mouseChildren"); return;
      // return this._mouseChildren;
    }
    set mouseChildren(enable: boolean) {
      enable = !!enable;
      notImplemented("public flash.display.DisplayObjectContainer::set mouseChildren"); return;
      // this._mouseChildren = enable;
    }
    addChild(child: flash.display.DisplayObject): flash.display.DisplayObject {
      child = child;
      notImplemented("public flash.display.DisplayObjectContainer::addChild"); return;
    }
    addChildAt(child: flash.display.DisplayObject, index: number /*int*/): flash.display.DisplayObject {
      child = child; index = index | 0;
      notImplemented("public flash.display.DisplayObjectContainer::addChildAt"); return;
    }
    removeChild(child: flash.display.DisplayObject): flash.display.DisplayObject {
      child = child;
      notImplemented("public flash.display.DisplayObjectContainer::removeChild"); return;
    }
    removeChildAt(index: number /*int*/): flash.display.DisplayObject {
      index = index | 0;
      notImplemented("public flash.display.DisplayObjectContainer::removeChildAt"); return;
    }
    getChildIndex(child: flash.display.DisplayObject): number /*int*/ {
      child = child;
      notImplemented("public flash.display.DisplayObjectContainer::getChildIndex"); return;
    }
    setChildIndex(child: flash.display.DisplayObject, index: number /*int*/): void {
      child = child; index = index | 0;
      notImplemented("public flash.display.DisplayObjectContainer::setChildIndex"); return;
    }
    getChildAt(index: number /*int*/): flash.display.DisplayObject {
      index = index | 0;
      notImplemented("public flash.display.DisplayObjectContainer::getChildAt"); return;
    }
    getChildByName(name: string): flash.display.DisplayObject {
      name = "" + name;
      notImplemented("public flash.display.DisplayObjectContainer::getChildByName"); return;
    }
    getObjectsUnderPoint(point: flash.geom.Point): any [] {
      point = point;
      notImplemented("public flash.display.DisplayObjectContainer::getObjectsUnderPoint"); return;
    }
    areInaccessibleObjectsUnderPoint(point: flash.geom.Point): boolean {
      point = point;
      notImplemented("public flash.display.DisplayObjectContainer::areInaccessibleObjectsUnderPoint"); return;
    }
    contains(child: flash.display.DisplayObject): boolean {
      child = child;
      notImplemented("public flash.display.DisplayObjectContainer::contains"); return;
    }
    swapChildrenAt(index1: number /*int*/, index2: number /*int*/): void {
      index1 = index1 | 0; index2 = index2 | 0;
      notImplemented("public flash.display.DisplayObjectContainer::swapChildrenAt"); return;
    }
    swapChildren(child1: flash.display.DisplayObject, child2: flash.display.DisplayObject): void {
      child1 = child1; child2 = child2;
      notImplemented("public flash.display.DisplayObjectContainer::swapChildren"); return;
    }
    removeChildren(beginIndex: number /*int*/ = 0, endIndex: number /*int*/ = 2147483647): void {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0;
      notImplemented("public flash.display.DisplayObjectContainer::removeChildren"); return;
    }
  }
}
