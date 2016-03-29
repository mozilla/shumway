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

    constructor(level0: DisplayObject) {
      super();
      this._content = this.sec.flash.display.Sprite.axClass.axConstruct();
      this._children = [];
      this._children[0] = this._content;
      // Pretend we're a DisplayObjectContainer and can have children. See comment at the top.
      this._content._setParent(<any>this, 0);
      this._setDirtyFlags(DisplayObjectDirtyFlags.DirtyChildren);
      this._invalidateFillAndLineBounds(true, true);
      this.sec.flash.display.DisplayObject.axClass._advancableInstances.push(this);
      this._constructed = false;

      // Setting _level0 root.
      this._content.addTimelineObjectAtDepth(level0, 0);
    }

    private _content: Sprite;
    private _constructed: boolean;

    call(functionName: string): any {
      notImplemented('AVM1Movie#call');
    }

    addCallback(functionName: string, closure: ASFunction): void {
      notImplemented('AVM1Movie#call');
    }

    _addFrame(frame: Shumway.SWF.SWFFrame) {
      (<MovieClip>this._content._children[0])._addFrame(frame);
    }

    _initFrame(advance: boolean): void {
      // Empty implementation: AVM1Movie doesn't have frames, and the contained MovieClip
      // adds itself to the IAdvancables list.
    }

    _constructFrame(): void {
      // On custructFrame we need to fully construct the roots container.
      // Once constructed, its children (which are IAdvancable type) will be
      // receiving their own _constructFrame events.
      if (!this._constructed) {
        this._constructed = true;
        this._content._constructChildren();
      }
    }

    _enqueueFrameScripts() {
      this._removeFlags(DisplayObjectFlags.ContainsFrameScriptPendingChildren);
      this._content._enqueueFrameScripts();
    }

    _propagateFlagsDown(flags: DisplayObjectFlags) {
      if (this._hasFlags(flags)) {
        return;
      }
      this._setFlags(flags);
      this._content._propagateFlagsDown(flags);
    }

    /**
     * AVM1Movie only takes the AVM1 content into consideration when testing points against
     * bounding boxes, not otherwise.
     */
    _containsPoint(globalX: number, globalY: number, localX: number, localY: number,
                   testingType: HitTestingType, objects: DisplayObject[]): HitTestingResult {
      if (testingType === HitTestingType.Mouse) {
        return this._content._containsPoint(globalX, globalY, localX, localY, testingType, objects);
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
      var childBounds = this._content._getContentBounds(includeStrokes).clone();
      // Always apply the SimpleButton's matrix.
      this._getConcatenatedMatrix().transformBounds(childBounds);
      bounds.unionInPlace(childBounds);
    }

    _getLevelForRoot(root: DisplayObject): number {
      release || Debug.assert(root.parent === this._content);
      return root._depth;
    }

    _getRootForLevel(level: number): DisplayObject  {
      return this._content.getTimelineObjectAtDepth(level);
    }

    _addRoot(level: number, root: DisplayObject): void {
      release || Debug.assert(this.sec.flash.display.MovieClip.axClass.axIsType(root));
      this._removeRoot(level);
      release || Debug.assert(!this._content.getTimelineObjectAtDepth(level));
      this._content.addTimelineObjectAtDepth(root, level);
    }

    _removeRoot(level: number): boolean {
      var root = this._content.getTimelineObjectAtDepth(level);
      if (!root) {
        return false;
      }
      this._content.removeChild(root);
      return true;
    }
  }
}
