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

  export class SymbolInfo {
    symbolId: number /*int*/;
    symbolClass: flash.display.DisplayObject;
    depth: number /*int*/;
    matrix: flash.geom.Matrix;
    colorTransform: flash.geom.ColorTransform;
    ratio: number /*int*/;
    name: string;
    clipDepth: number /*int*/;
    filters: any [];
    blendMode: string;
    cacheAsBitmap: boolean;
    actions: any [];

    constructor(symbolId: number, symbolClass: flash.display.DisplayObject) {
      this.symbolId = symbolId | 0;
      this.symbolClass = symbolClass;
    }

    copy(): SymbolInfo {
      var s = new SymbolInfo(this.symbolId, this.symbolClass);
      s.depth = this.depth;
      s.matrix = this.matrix;
      s.colorTransform = this.colorTransform;
      s.ratio = this.ratio;
      s.name = this.name;
      s.clipDepth = this.clipDepth;
      s.filters = this.filters.slice();
      s.blendMode = this.blendMode;
      s.cacheAsBitmap = this.cacheAsBitmap;
      s.actions = this.actions.slice();
      return s;
    }

    make(root: DisplayObject, stage: Stage, parent: DisplayObjectContainer): DisplayObject {
      var symbol = new DisplayObject;
      symbol._root = root;
      symbol._stage = stage;
      symbol._parent = parent;
      symbol._depth = this.depth;
      symbol._setMatrix(this.matrix, false);
      symbol._setColorTransform(this.colorTransform);
      //symbol.ratio
      symbol._name = this.name;
      symbol._clipDepth = this.clipDepth;
      symbol._filters = this.filters;
      symbol._blendMode = this.blendMode;
      if (this.cacheAsBitmap) {
        symbol._setFlags(DisplayObjectFlags.CacheAsBitmap);
      }
      //symbol.actions
      return this.symbolClass.initializeFrom(symbol);
    }
  }

  export class TimelineDiff {
    place: SymbolInfo [];
    update: SymbolInfo [];
    remove: SymbolInfo [];

    constructor() {
      this.place = [];
      this.update = [];
      this.remove = [];
    }

    reset(): void {
      this.place.length = 0;
      this.update.length = 0;
      this.remove.length = 0;
    }
  }

  export class TimelineSnapshot {
    private _depths: number /*int*/ [];
    private _map: Object;
    private _diff: TimelineDiff;

    constructor() {
      this._depths = [];
      this._map = Object.create(null);
      this._diff = new TimelineDiff();
    }

    place(depth: number /*int*/, symbolInfo: SymbolInfo) {
      depth = depth | 0;
      this._depths.push(depth);
      this._map[depth] = null;
    }

    remove(depth: number /*int*/) {
      this._map[depth | 0] = null;
    }

    diff(toSnapshot: TimelineSnapshot): TimelineDiff {
      var d = this._diff;
      d.reset();

      var depths = this._depths;
      var map = this._map;
      for (var i = 0; i < depths.length; i++) {
        var depth = depths[i];
        var symbolInfo = map[depth];
        if (toSnapshot) {
          var toSymbolInfo = toSnapshot._depths[depth];
          if (toSymbolInfo) {
            if (symbolInfo) {
              if (toSymbolInfo !== symbolInfo) {
                d.update.push(symbolInfo);
              }
            } else {
              d.place.push(symbolInfo);
            }
          } else if (symbolInfo) {
            d.remove.push(symbolInfo);
          }
        } else if (symbolInfo) {
          d.place.push(symbolInfo);
        }
      }

      return d;
    }

    copy(): TimelineSnapshot {
      var t = new TimelineSnapshot();
      var depths = this._depths;
      for (var i = 0; i < depths.length; i++) {
        var depth = depths[i];
        t._depths.push(depth);
        t._map[depth] = this._map[depth].copy();
      }
      t._diff = this._diff;
      return t;
    }
  }

  export class Sprite extends flash.display.DisplayObjectContainer {

    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = function (symbol: MovieClip) {
      var self: Sprite = this;
      self._buttonMode = false;
      self._dropTarget = null;
      self._hitArea = null;
      self._snapshots = null;
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
      notImplemented("Dummy Constructor: public flash.display.Sprite");
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    
    // _graphics: flash.display.Graphics;
    _buttonMode: boolean;
    _dropTarget: flash.display.DisplayObject;
    _hitArea: flash.display.Sprite;
    _snapshots: TimelineSnapshot [];
    _useHandCursor: boolean;

    initChildren(): void {
      var snapshot = this._snapshots[0];
      var diff = snapshot.diff(null);
      var symbols = diff.place;
      for (var i = 0; i < symbols.length; i++) {
        var symbolInfo = symbols[i];
        var child = make(this._root, this._stage, this);
        this.addChildAtDepth(child, child._depth);
      }
    }

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

    constructChildren(): void {
      var children = this._children;
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (child._hasFlags(DisplayObjectFlags.Constructed)) {
          continue;
        }
        child.instanceConstructorNoInitialize();
      }
    }
  }
}
