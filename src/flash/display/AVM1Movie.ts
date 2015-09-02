/**
 * Copyright 2014 Mozilla Foundation
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

/**
 * AVM1Movie is the reflection of AVM1 SWFs loaded into AVM2 content. Since AVM1 content is
 * completely opaque to AVM2 content, it's not a DisplayObjectContainer, even though it contains
 * nested children. This is because the two worlds are completely separated from each other[1], and
 * each AVM1 SWF is entirely isolated from everything else.
 *
 * This causes a few headaches because we implement the AVM1 display list in terms of the AVM2
 * display list: each AVM1 MovieClip is a wrapper around an AVM2 MovieClip instance, which is
 * what's actually on stage. Theoretically, the top-most AVM2 MovieClip for an AVM1 SWF isn't
 * supposed to have a parent. However, we need it to be part of the stage's display tree in order
 * to take part in rendering.
 *
 * Therefore, the AVM2 MovieClip wrapped by an AVM1Movie gets the latter set as its parent, even
 * though AVM1Movie isn't a DisplayObjectContainer. We borrow methods from that and generally
 * pretend that AVM1Movie is a container in some places to pull that off.
 *
 * [1]: If you ignore the undocumented `call` and `addCallback` methods for a moment.
 */

module Shumway.AVMX.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  import assert = Shumway.Debug.assert;
  import axCoerceString = Shumway.AVMX.axCoerceString;

  export class AVM1Movie extends flash.display.DisplayObject implements IAdvancable {

    static classInitializer: any = null;
    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    constructor(content: MovieClip) {
      super();
      this._children = [];
      this._children[0] = content;

      // Setting up _level0 root.
      this._levels = [];
      this._levelToNumberMap = new WeakMap<DisplayObject, number>();
      this._levels[0] = content;
      this._levelToNumberMap.set(content, 0);

      // Pretend we're a DisplayObjectContainer and can have children. See comment at the top.
      content._setParent(<any>this, 0);
      this._setDirtyFlags(DisplayObjectDirtyFlags.DirtyChildren);
      this._invalidateFillAndLineBounds(true, true);
      this.sec.flash.display.DisplayObject.axClass._advancableInstances.push(this);
      this._constructed = false;
    }

    private _levels: MovieClip[];
    private _levelToNumberMap: WeakMap<MovieClip, number>;
    private _constructed: boolean;

    call(functionName: string): any {
      notImplemented('AVM1Movie#call');
    }

    addCallback(functionName: string, closure: ASFunction): void {
      notImplemented('AVM1Movie#call');
    }

    _addFrame(frame: Shumway.SWF.SWFFrame) {
      this._levels[0]._addFrame(frame);
    }

    _initFrame(advance: boolean): void {
      // Empty implementation: AVM1Movie doesn't have frames, and the contained MovieClip
      // adds itself to the IAdvancables list.
    }

    _constructFrame(): void {
      if (!this._constructed) {
        this._constructed = true;
        DisplayObjectContainer.prototype._constructChildren.call(this);
      }
      this._children.forEach(level => (<MovieClip>level)._constructFrame());
    }

    _enqueueFrameScripts() {
      this._removeFlags(DisplayObjectFlags.ContainsFrameScriptPendingChildren);
      this._children.forEach(level => (<MovieClip>level)._enqueueFrameScripts());
    }

    _propagateFlagsDown(flags: DisplayObjectFlags) {
      if (this._hasFlags(flags)) {
        return;
      }
      this._setFlags(flags);
      this._children.forEach(level => level._propagateFlagsDown(flags));
    }

    /**
     * AVM1Movie only takes the AVM1 content into consideration when testing points against
     * bounding boxes, not otherwise.
     */
    _containsPoint(globalX: number, globalY: number, localX: number, localY: number,
                   testingType: HitTestingType, objects: DisplayObject[]): HitTestingResult {
      if (testingType === HitTestingType.Mouse) {
        // Testing mouse at all levels.
        for (var i = this._children.length - 1; i >= 0; i--) {
          var result = this._children[i]._containsPoint(globalX, globalY, localX, localY, testingType, objects);
          if (result !== HitTestingResult.None) {
            return result;
          }
        }
        return HitTestingResult.None;
      }
      if (testingType !== HitTestingType.HitTestBounds ||
          !this._getContentBounds().contains(localX, localY)) {
        return HitTestingResult.None;
      }
      return HitTestingResult.Bounds;
    }

    /**
     * Override of DisplayObject#_getChildBounds that retrieves the AVM1 content's bounds.
     */
    _getChildBounds(bounds: Bounds, includeStrokes: boolean) {
      var childBounds = this._levels[0]._getContentBounds(includeStrokes).clone();
      // Always apply the SimpleButton's matrix.
      this._getConcatenatedMatrix().transformBounds(childBounds);
      bounds.unionInPlace(childBounds);
    }

    _getLevelForRoot(root: DisplayObject): number {
      var level = this._levelToNumberMap.get(<MovieClip>root);
      return level === undefined ? -1 : level;
    }

    _getRoot(level: number): DisplayObject  {
      return this._levels[level] || null;
    }

    _setRoot(level: number, root: DisplayObject): void {
      release || Debug.assert(this.sec.flash.display.MovieClip.axClass.axIsType(root));
      this._deleteRoot(level);
      release || Debug.assert(!this._levels[level] || !this._levelToNumberMap.has(<MovieClip>root));
      this._levels[level] = <MovieClip>root;
      this._levelToNumberMap.set(<MovieClip>root, level);
      // Finding place to insert in this._children
      var i = 0;
      while (i < this._children.length &&
             (this._levelToNumberMap.get(<MovieClip>this._children[i]) < level)) {
        i++;
      }
      this._children.splice(i, 0, root);
      // Also pretending we are the parent of the root.
      root._setParent(<any>this, level);
      this._setDirtyFlags(DisplayObjectDirtyFlags.DirtyChildren);
    }

    _deleteRoot(level: number): boolean {
      release || Debug.assert(level !== 0, 'Deletion of _level0 is not supported yet');
      var root = this._levels[level];
      if (!root) {
        return false;
      }
      delete this._levels[level];
      this._levelToNumberMap.delete(root);
      var i = this._children.indexOf(root);
      release || Debug.assert(i > 0);
      this._children.splice(i, 1);
      root._setParent(null, -1);
      this._setDirtyFlags(DisplayObjectDirtyFlags.DirtyChildren);
      return true;
    }
  }
}
