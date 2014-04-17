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
// Class: Sprite
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import DisplayObjectContainer = flash.display.DisplayObjectContainer;
  export class Sprite extends flash.display.DisplayObjectContainer {

    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = function (symbol: MovieClip) {
      var self: Sprite = this;
      self._buttonMode = false;
      self._dropTarget = null;
      self._hitArea = null;
      self._useHandCursor = true;

      if (symbol) {
        self._snapshots = symbol._snapshots || self._snapshots;
      }

      self.initChildren();
    };
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // [];
    
    constructor () {
      false && super();
      DisplayObjectContainer.instanceConstructorNoInitialize.call(this);
      this.constructChildren();
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    
    // _graphics: flash.display.Graphics;
    _buttonMode: boolean;
    _dropTarget: flash.display.DisplayObject;
    _hitArea: flash.display.Sprite;
    _snapshots: Shumway.SWF.timeline.Snapshot [];
    _useHandCursor: boolean;

    get graphics(): flash.display.Graphics {
      return this._graphics;
    }

    get buttonMode(): boolean {
      return this._buttonMode;
    }

    set buttonMode(value: boolean) {
      this._buttonMode = !!value;
    }

    get dropTarget(): flash.display.DisplayObject {
      notImplemented("public flash.display.Sprite::get dropTarget"); return;
      // return this._dropTarget;
    }

    get hitArea(): flash.display.Sprite {
      return this._hitArea;
    }

    set hitArea(value: flash.display.Sprite) {
      value = value;
      if (this._hitArea === value) {
        return;
      }
      if (value && value._hitTarget) {
        value._hitTarget._hitArea = null;
      }
      this._hitArea = value;
      if (value) {
        value._hitTarget = this;
      }
    }

    get useHandCursor(): boolean {
      return this._useHandCursor;
    }

    set useHandCursor(value: boolean) {
      this._useHandCursor = !!value;
    }

    get soundTransform(): flash.media.SoundTransform {
      notImplemented("public flash.display.Sprite::get soundTransform"); return;
      // return this._soundTransform;
    }
    set soundTransform(sndTransform: flash.media.SoundTransform) {
      sndTransform = sndTransform;
      notImplemented("public flash.display.Sprite::set soundTransform"); return;
      // this._soundTransform = sndTransform;
    }
    startDrag(lockCenter: boolean = false, bounds: flash.geom.Rectangle = null): void {
      lockCenter = !!lockCenter; bounds = bounds;
      notImplemented("public flash.display.Sprite::startDrag"); return;
    }
    stopDrag(): void {
      notImplemented("public flash.display.Sprite::stopDrag"); return;
    }
    startTouchDrag(touchPointID: number /*int*/, lockCenter: boolean = false, bounds: flash.geom.Rectangle = null): void {
      touchPointID = touchPointID | 0; lockCenter = !!lockCenter; bounds = bounds;
      notImplemented("public flash.display.Sprite::startTouchDrag"); return;
    }
    stopTouchDrag(touchPointID: number /*int*/): void {
      touchPointID = touchPointID | 0;
      notImplemented("public flash.display.Sprite::stopTouchDrag"); return;
    }

    initChildren(): void {
      var snapshot = this._snapshots[0];
      var diff = snapshot.diff(null);
      var states = diff.place;
      for (var i = 0; i < states.length; i++) {
        var state = states[i];
        var child = state.make();
        this.addChildAtDepth(child, child._depth);
      }
    }

    constructChildren(): void {
      var children = this._children;
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (child._hasFlags(DisplayObjectFlags.Constructed)) {
          continue;
        }
        child.instanceConstructorNoInitialize();
        //if (child._name) {
        //  this[Multiname.getPublicQualifiedName(name)] = instance;
        //}
        child._setFlags(DisplayObjectFlags.Constructed);
      }
    }
  }
}
