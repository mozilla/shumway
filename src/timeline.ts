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

module Shumway.SWF.timeline {
  import flash = Shumway.AVM2.AS.flash;

  export class SymbolState {
    symbolId: number;
    symbolClass: flash.display.DisplayObject;
    depth: number;
    matrix: flash.geom.Matrix;
    colorTransform: flash.geom.ColorTransform;
    ratio: number;
    name: string;
    clipDepth: number;
    filters: any [];
    blendMode: string;
    cacheAsBitmap: boolean;
    actions: any [];

    constructor(symbolId: number, symbolClass: flash.display.DisplayObject) {
      this.symbolId = symbolId | 0;
      this.symbolClass = symbolClass;
    }

    copy(): SymbolState {
      var s = new SymbolState(this.symbolId, this.symbolClass);
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

    make(): flash.display.DisplayObject {
      var symbol = new flash.display.DisplayObject;
      symbol._depth = this.depth;
      symbol._setMatrix(this.matrix, false);
      symbol._setColorTransform(this.colorTransform);
      symbol._ratio = this.ratio;
      symbol._name = this.name;
      symbol._clipDepth = this.clipDepth;
      symbol._filters = this.filters;
      symbol._blendMode = this.blendMode;
      if (this.cacheAsBitmap) {
        symbol._setFlags(flash.display.DisplayObjectFlags.CacheAsBitmap);
      }
      //symbol.actions
      return this.symbolClass.initializeFrom(symbol);
    }
  }

  export class SnapshotDiff {
    place: SymbolState [];
    update: SymbolState [];
    remove: SymbolState [];

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

  export class Snapshot {
    private _depths: number [];
    private _states: Object;
    private _diff: SnapshotDiff;

    constructor() {
      this._depths = [];
      this._states = Object.create(null);
      this._diff = new SnapshotDiff();
    }

    place(depth: number, symbolInfo: SymbolState) {
      depth = depth | 0;
      this._depths.push(depth);
      this._states[depth] = symbolInfo;
    }

    remove(depth: number) {
      depth = depth | 0;
      assert(depth in this._states);
      this._states[depth] = null;
    }

    diff(toSnapshot: Snapshot): SnapshotDiff {
      var d = this._diff;
      d.reset();

      var depths = this._depths;
      var states = this._states;
      for (var i = 0; i < depths.length; i++) {
        var depth = depths[i];
        var state = states[depth];
        if (toSnapshot) {
          var toState = toSnapshot._states[depth];
          if (toState) {
            if (state) {
              if (toState !== state) {
                d.update.push(toState);
              }
            } else {
              d.place.push(toState);
            }
          } else if (state) {
            d.remove.push(state);
          }
        } else if (state) {
          d.place.push(state);
        }
      }

      return d;
    }

    copy(): Snapshot {
      var t = new Snapshot();
      var depths = this._depths.slice();
      var states = this._states;
      for (var i = 0; i < depths.length; i++) {
        var depth = depths[i];
        t._states[depth] = states[depth].copy();
      }
      t._depths = depths;
      t._diff = this._diff;
      return t;
    }
  }
}