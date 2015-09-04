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
// Class: Sprite
module Shumway.AVMX.AS.flash.display {
  import assert = Shumway.Debug.assert;
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;

  import Timeline = Shumway.Timeline;
  import SwfTagCode = Shumway.SWF.Parser.SwfTagCode;
  import PlaceObjectFlags = Shumway.SWF.Parser.PlaceObjectFlags;
  import clamp = Shumway.NumberUtilities.clamp;

  enum DragMode {
    Inactive,
    // Indicates that the dragged object is locked to the center of the mouse position.
    LockToPointer,
    // Indicates that the dragged object is locked to the point where the dragging process started.
    PreserveDistance
  }

  export class Sprite extends flash.display.DisplayObjectContainer {
    static classInitializer: any = null;

    _symbol: SpriteSymbol;

    applySymbol() {
      release || assert(this._symbol);
      this._initializeFields();
      var symbol = this._symbol;
      if (symbol.isRoot) {
        this._root = this;
      }
      this._children = [];
      if (symbol.numFrames && symbol.frames.length > 0) {
        // For a SWF's root symbol, all frames are added after initialization, with
        // _initializeChildren called after the first frame is added.
        this._initializeChildren(symbol.frames[0]);
      }
    }
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];

    constructor () {
      if (this._symbol && !this._fieldsInitialized) {
        this.applySymbol();
      }
      super();
      if (!this._fieldsInitialized) {
        this._initializeFields();
      }
      this._constructChildren();
    }

    protected _initializeFields() {
      super._initializeFields();
      this._graphics = null;
      this._buttonMode = false;
      this._dropTarget = null;
      this._hitArea = null;
      this._useHandCursor = true;

      this._dragMode = DragMode.Inactive;
      this._dragDeltaX = 0;
      this._dragDeltaY = 0;
      this._dragBounds = null;
      this._hitTarget = null;
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    
    private _buttonMode: boolean;
    private _dropTarget: flash.display.DisplayObject;
    private _hitArea: flash.display.Sprite;
    private _useHandCursor: boolean;

    private _dragMode: DragMode;
    private _dragDeltaX: number;
    private _dragDeltaY: number;
    private _dragBounds: flash.geom.Rectangle;
    _hitTarget: flash.display.Sprite;

    _addFrame(frame: Shumway.SWF.SWFFrame) {
      var frames = (<SpriteSymbol><any>this._symbol).frames;
      frames.push(frame);
      if (frames.length === 1) {
        this._initializeChildren(frame);
      }
    }

    _initializeChildren(frame: Shumway.SWF.SWFFrame): void {
      if (frame.controlTags) {
        this._processControlTags(frame.controlTags, false);
      }
    }

    _processControlTags(tags: any[], backwards: boolean) {
      // When seeking backwards all timeline objects will be removed unless they are placed again.
      if (backwards) {
        var children = this._children.slice();
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          if (child._depth < 0) {
            continue;
          }
          // For AVM1 objects, children with depth 16384 (0 from API point of view)
          // are not removed.
          if ('_as2Object' in child && child._depth >= 16384) {
            continue;
          }
          var tag = null;
          // Look for a control tag tag that places an object at the same depth as the current
          // child.
          for (var j = 0; j < tags.length; j++) {
            if (tags[j].depth === child._depth) {
              tag = tags[j];
              break;
            }
          }
          // If no such tag was found or a different object is placed, remove the current child.
          if (!tag || child._symbol.id !== tag.symbolId || child._ratio !== (tag.ratio | 0)) {
            this._removeAnimatedChild(child);
          }
        }
      }

      var loaderInfo = (<SpriteSymbol>this._symbol).loaderInfo;
      for (var i = 0; i < tags.length; i++) {
        // We may have a mix of the parsed and unparsed tags.
        var parsedOrUnparsedTag = tags[i];
        var tag = parsedOrUnparsedTag.tagCode === undefined ?
                  parsedOrUnparsedTag : <any>loaderInfo._file.getParsedTag(parsedOrUnparsedTag);
        switch (tag.code) {
          case SwfTagCode.CODE_REMOVE_OBJECT:
          case SwfTagCode.CODE_REMOVE_OBJECT2:
            var child = this.getTimelineObjectAtDepth(tag.depth | 0);
            if (child) {
              this._removeAnimatedChild(child);
            }
            break;
          case SwfTagCode.CODE_PLACE_OBJECT:
          case SwfTagCode.CODE_PLACE_OBJECT2:
          case SwfTagCode.CODE_PLACE_OBJECT3:
            var placeObjectTag = <Shumway.SWF.Parser.PlaceObjectTag>tag;
            var depth = placeObjectTag.depth;
            var child = this.getTimelineObjectAtDepth(depth);
            var hasCharacter = placeObjectTag.symbolId > -1;

            // Check for invalid flag constellations.
            if (placeObjectTag.flags & PlaceObjectFlags.Move) {
              // Invalid case 1: Move flag set but no child found at given depth.
              if (!child) {
                //  Ignore the current tag.
                break;
              }
            } else if (!hasCharacter || (child && !(backwards && hasCharacter))) {
              // Invalid case 2: Neither Move nor HasCharacter flag set.
              // Invalid case 3: HasCharacter flag set but given depth is already occupied by a
              // another object (only if seeking forward).
              Shumway.Debug.warning("Warning: Failed to place object at depth " + depth + ".");
              break;
            }

            var symbol: Shumway.Timeline.DisplaySymbol = null;
            if (hasCharacter) {
              symbol = <Shumway.Timeline.DisplaySymbol>loaderInfo.getSymbolById(placeObjectTag.symbolId);
              // The Flash Player ignores references to undefined symbols here. So should we.
              if (!symbol) {
                break;
              }
            }

            if (child) {
              if (symbol && !symbol.dynamic) {
                // If the current object is of a simple type (for now Shapes, MorphShapes and
                // StaticText) only its static content is updated instead of replacing it with a
                // new instance. TODO: Handle
                // http://wahlers.com.br/claus/blog/hacking-swf-2-placeobject-and-ratio/.
                child._setStaticContentFromSymbol(symbol);
              }
              // We animate the object only if a user script didn't touch any of the properties
              // this would affect.
              if (child._hasFlags(DisplayObjectFlags.AnimatedByTimeline)) {
                child._animate(tag);
              }
            } else {
              // Place a new instance of the symbol.
              child = this.createAnimatedDisplayObject(symbol, placeObjectTag, false);
              this.addTimelineObjectAtDepth(child, depth);
              if (symbol.isAVM1Object) {
                child._placeObjectTag = placeObjectTag;
                child._setFlags(DisplayObjectFlags.HasPlaceObjectInitPending);
              }
            }
            break;
        }
      }
    }

    _removeAnimatedChild(child: flash.display.DisplayObject) {
      this.removeChild(child);
      if (child._name) {
        if (this.axGetPublicProperty(child._name) === child) {
          this.axSetPublicProperty(child._name, null);
        }
        // TODO: Implement proper reference counting.
        // child._removeReference();
      }
      if (child._maskedObject) {
        child._maskedObject.mask = null;
      }
    }

    _canHaveGraphics(): boolean {
      return true;
    }

    _getGraphics(): flash.display.Graphics {
      return this._graphics;
    }

    get graphics(): flash.display.Graphics {
      return this._ensureGraphics();
    }

    get buttonMode(): boolean {
      return this._buttonMode;
    }

    set buttonMode(value: boolean) {
      this._buttonMode = !!value;
    }

    get dropTarget(): flash.display.DisplayObject {
      return this._dropTarget;
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
      release || notImplemented("public flash.display.Sprite::get soundTransform"); return;
      // return this._soundTransform;
    }
    set soundTransform(sndTransform: flash.media.SoundTransform) {
      sndTransform = sndTransform;
      release || notImplemented("public flash.display.Sprite::set soundTransform"); return;
      // this._soundTransform = sndTransform;
    }

    /**
     * Returns the current mouse position relative to this object.
     */
    _getDragMousePosition(): flash.geom.Point {
      var position = this.sec.flash.ui.Mouse.axClass._currentPosition;
      if (this._parent) {
        position = this._parent.globalToLocal(position);
      }
      return position;
    }

    startDrag(lockCenter: boolean = false, bounds: flash.geom.Rectangle = null): void {
      lockCenter = !!lockCenter;
      if (lockCenter) {
        this._dragMode = DragMode.LockToPointer;
      } else {
        this._dragMode = DragMode.PreserveDistance;
        var mousePosition = this._getDragMousePosition();
        this._dragDeltaX = this.x - mousePosition.x;
        this._dragDeltaY = this.y - mousePosition.y;
      }
      this._dragBounds = bounds;
      // TODO: Our mouse handling logic looks up draggableObject on stage.sec.flash.ui.Mouse.axClass
      // to update its position. Could there be a case where stage.sec !== this.sec?
      this.sec.flash.ui.Mouse.axClass.draggableObject = this;
    }
    stopDrag(): void {
      if (this.sec.flash.ui.Mouse.axClass.draggableObject === this) {
        this.sec.flash.ui.Mouse.axClass.draggableObject = null;
        this._dragMode = DragMode.Inactive;
        this._dragDeltaX = 0;
        this._dragDeltaY = 0;
        this._dragBounds = null;
      }
    }
    _updateDragState(dropTarget: DisplayObject = null): void {
      var mousePosition = this._getDragMousePosition();
      var newX = mousePosition.x;
      var newY = mousePosition.y;
      if (this._dragMode === DragMode.PreserveDistance) {
        // Preserve the distance to the point where the dragging process started.
        newX += this._dragDeltaX;
        newY += this._dragDeltaY;
      }
      if (this._dragBounds) {
        // Clamp new position to constraint bounds.
        var bounds = this._dragBounds;
        newX = clamp(newX, bounds.left, bounds.right);
        newY = clamp(newY, bounds.top, bounds.bottom);
      }
      this.x = newX;
      this.y = newY;
      this._dropTarget = dropTarget;
    }
    startTouchDrag(touchPointID: number /*int*/, lockCenter: boolean = false, bounds: flash.geom.Rectangle = null): void {
      touchPointID = touchPointID | 0; lockCenter = !!lockCenter; bounds = bounds;
      release || notImplemented("public flash.display.Sprite::startTouchDrag"); return;
    }
    stopTouchDrag(touchPointID: number /*int*/): void {
      touchPointID = touchPointID | 0;
      release || notImplemented("public flash.display.Sprite::stopTouchDrag"); return;
    }

    _containsPoint(globalX: number, globalY: number, localX: number, localY: number,
                   testingType: HitTestingType, objects: DisplayObject[]): HitTestingResult {
      // If looking for a drop target, ignore this object if it is the one being dragged.
      if (testingType === HitTestingType.Drop && this._dragMode > DragMode.Inactive) {
        return;
      }
      var result = this._boundsAndMaskContainPoint(globalX, globalY, localX, localY, testingType);
      if (!result && testingType === HitTestingType.Mouse && this._hitArea && this._mouseEnabled) {
        var matrix = this._hitArea._getInvertedConcatenatedMatrix();
        var hitAreaLocalX = matrix.transformX(globalX, globalY);
        var hitAreaLocalY = matrix.transformY(globalX, globalY);
        result = this._hitArea._boundsAndMaskContainPoint(globalX, globalY,
                                                          hitAreaLocalX, hitAreaLocalY,
                                                          testingType);
      }
      if (result === HitTestingResult.None || testingType < HitTestingType.HitTestShape) {
        return result;
      }
      return this._containsPointImpl(globalX, globalY, localX, localY, testingType, objects, true);
    }

    _containsPointDirectly(localX: number, localY: number,
                           globalX: number, globalY: number): boolean {
      if (this._hitArea) {
        return !!this._hitArea._containsGlobalPoint(globalX, globalY,
                                                    HitTestingType.HitTestShape, null);
      }
      var graphics = this._getGraphics();
      return !!graphics && graphics._containsPoint(localX, localY, true, 0);
    }
  }

  export class SpriteSymbol extends Timeline.DisplaySymbol {
    numFrames: number = 1;
    frames: any[] = [];
    labels: flash.display.FrameLabel[] = [];
    isRoot: boolean;
    avm1Name: string;
    loaderInfo: flash.display.LoaderInfo;

    constructor(data: Timeline.SymbolData, loaderInfo: flash.display.LoaderInfo) {
      super(data, loaderInfo.app.sec.flash.display.MovieClip.axClass, true);
      this.loaderInfo = loaderInfo;
    }

    static FromData(data: any, loaderInfo: flash.display.LoaderInfo): SpriteSymbol {
      var symbol = new SpriteSymbol(data, loaderInfo);
      symbol.numFrames = data.frameCount;
      if (loaderInfo.actionScriptVersion === ActionScriptVersion.ACTIONSCRIPT2) {
        symbol.isAVM1Object = true;
        symbol.avm1Context = loaderInfo._avm1Context;
      }
      var frames = data.frames;
      var frameLabelCtor = loaderInfo.app.sec.flash.display.FrameLabel;
      for (var i = 0; i < frames.length; i++) {
        var frame = loaderInfo.getFrame(data, i);
        if (frame.labelName) {
          symbol.labels.push(new frameLabelCtor(frame.labelName, i + 1));
        }
        symbol.frames.push(frame);
      }
      return symbol;
    }
  }
}
