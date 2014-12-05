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
module Shumway.AVM2.AS.flash.display {
  import assert = Shumway.Debug.assert;
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

  import Timeline = Shumway.Timeline;
  import SwfTag = Shumway.SWF.Parser.SwfTag;
  import PlaceObjectFlags = Shumway.SWF.Parser.PlaceObjectFlags;

  export class Sprite extends flash.display.DisplayObjectContainer {

    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = function (symbol: SpriteSymbol) {
      var self: Sprite = this;

      self._graphics = null;
      self._buttonMode = false;
      self._dropTarget = null;
      self._hitArea = null;
      self._useHandCursor = true;

      self._hitTarget = null;

      if (symbol) {
        if (symbol.isRoot) {
          self._root = self;
        }
        if (symbol.numFrames && symbol.frames.length > 0) {
          // For a SWF's root symbol, all frames are added after initialization, with
          // _initializeChildren called after the first frame is added.
          self._initializeChildren(symbol.frames[0]);
        }
      }
    };
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];

    constructor () {
      false && super();
      DisplayObjectContainer.instanceConstructorNoInitialize.call(this);
      this._constructChildren();
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    
    private _buttonMode: boolean;
    private _dropTarget: flash.display.DisplayObject;
    private _hitArea: flash.display.Sprite;
    private _useHandCursor: boolean;

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
          var tag = null;
          // Look for a control tag tag that places an object at the same depth as the current child.
          for (var j = 0; j < tags.length; j++) {
            if (tags[j].depth === child._depth) {
              tag = tags[j];
              break;
            }
          }
          // If no such tag was found or a different object is placed, remove the current child.
          if (!tag || child._symbol.id !== tag.symbolId ||
              child._ratio !== (tag.ratio === undefined ? -1 : tag.ratio)) {
            this._removeAnimatedChild(child);
          }
        }
      }

      var loaderInfo = (<SpriteSymbol>this._symbol).loaderInfo;
      for (var i = 0; i < tags.length; i++) {
        var tag = 'depth' in tags[i] ?
                  tags[i] : <any>loaderInfo._file.getParsedTag(tags[i]);
        switch (tag.code) {
          case SwfTag.CODE_REMOVE_OBJECT:
          case SwfTag.CODE_REMOVE_OBJECT2:
            var child = this.getTimelineObjectAtDepth(tag.depth | 0);
            if (child) {
              this._removeAnimatedChild(child);
            }
            break;
          case SwfTag.CODE_PLACE_OBJECT:
          case SwfTag.CODE_PLACE_OBJECT2:
          case SwfTag.CODE_PLACE_OBJECT3:
            var placeObjectTag = <Shumway.SWF.PlaceObjectTag>tag;
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
              if (!symbol) {
                break;
              }
            }

            if (child) {
              if (symbol && !symbol.dynamic) {
                // If the current object is of a simple type (for now Shapes, MorphShapes and StaticText)
                // only its static content is updated instead of replacing it with a new instance.
                // TODO: Handle http://wahlers.com.br/claus/blog/hacking-swf-2-placeobject-and-ratio/.
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
                Shumway.AVM1.Lib.initializeAVM1Object(child, symbol.avm1Context, placeObjectTag);
              }
            }
            break;
        }
      }
    }

    _removeAnimatedChild(child: flash.display.DisplayObject) {
      this.removeChild(child);
      if (child._name) {
        var mn =  Shumway.AVM2.ABC.Multiname.getPublicQualifiedName(child._name);
        if (this[mn] === child) {
          this[mn] = null;
        }
        // TODO: Implement proper reference counting.
        // child._removeReference();
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

    _containsPoint(globalX: number, globalY: number, localX: number, localY: number,
                   testingType: HitTestingType, objects: DisplayObject[]): HitTestingResult {
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
    frameScripts: any[] = [];
    isRoot: boolean;
    avm1Name: string;
    avm1SymbolClass;
    loaderInfo: flash.display.LoaderInfo;

    constructor(data: Timeline.SymbolData, loaderInfo: flash.display.LoaderInfo) {
      super(data, flash.display.MovieClip, true);
      this.loaderInfo = loaderInfo;
    }

    static FromData(data: any, loaderInfo: flash.display.LoaderInfo): SpriteSymbol {
      var symbol = new SpriteSymbol(data, loaderInfo);
      symbol.numFrames = data.frameCount;
      if (loaderInfo.actionScriptVersion === ActionScriptVersion.ACTIONSCRIPT2) {
        symbol.isAVM1Object = true;
        symbol.avm1Context = loaderInfo._avm1Context;
      }
      symbol.frameScripts = [];
      var frames = data.frames;
      for (var i = 0; i < frames.length; i++) {
        var frame = loaderInfo.getFrame(data, i);
        var actionBlocks = frame.actionBlocks;
        if (actionBlocks) {
          for (var j = 0; j < actionBlocks.length; j++) {
            symbol.frameScripts.push(i);
            symbol.frameScripts.push(actionBlocks[j]);
          }
        }
        if (frame.labelName) {
          symbol.labels.push(new flash.display.FrameLabel(frame.labelName, i + 1));
        }
        symbol.frames.push(frame);
      }
      return symbol;
    }
  }
}
