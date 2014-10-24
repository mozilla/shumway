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

declare module Shumway.AVM2.AS.flash {
  module display {
    class DisplayObject extends events.EventDispatcher {
      stage: DisplayObject;
      _parent: DisplayObject;
      loaderInfo: {
        _avm1Context: AVM1.AVM1Context
      };
      name: string;
      _mouseOver: boolean;
      _mouseDown: boolean;
      _children: DisplayObject [];
      _depth: number;
    }
    class DisplayObjectContainer extends DisplayObject {
      _as2SymbolClass;
      _name: string;
      numChildren: number;
      currentFrame: number;

      addTimelineObjectAtDepth(child, depth: number);
      _lookupChildByIndex(index: number): DisplayObject;
      _lookupChildByName(name: string): DisplayObject;
    }
    class MovieClip extends DisplayObjectContainer {
      _as2SymbolClass;
      _name: string;
      numChildren: number;
      currentFrame: number;

      addFrameScript(frameIndex: number, script: (any?) => any /*, ...*/): void;
    }
    class Loader extends DisplayObject {}
    class LoaderInfo {
      swfVersion: number;
      getSymbolById(id: number): any;
    }
    class AVM1Movie extends DisplayObject {}
    class BitmapData extends ASNative {}
    class Bitmap extends DisplayObject {
      constructor();
    }
    class SimpleButton extends DisplayObject {
      _symbol: {
        data: {buttonActions: Shumway.Timeline.AVM1ButtonAction[]}
      }
    }
  }
  module events {
    class EventDispatcher extends ASNative {
      public addEventListener(type: string, listener: (event: any) => void, useCapture?: boolean,
                              priority?: number, useWeakReference?: boolean): void;
      public removeEventListener(type: string, listener: (event: any) => void,
                                 useCapture?: boolean): void;
    }
  }
  module geom {
    class ColorTransform extends ASNative {}
    class Matrix extends ASNative {}
    class Point extends ASNative {}
    class Rectangle extends ASNative {}
    class Transform extends ASNative {}
  }
  module text {
    class TextField extends ASNative {
      getLineMetrics(index: number);

      multiline: boolean;
      wordWrap: boolean;
      text: string;
      width: number;
      textWidth: number;
      textHeight: number;
      defaultTextFormat: TextFormat;
    }
    class TextFormat extends ASNative {}
  }
}

declare module Shumway.Timeline {
    class AVM1ButtonAction {
      keyCode: number;
      stateTransitionFlags: number;
      actionsData: Uint8Array;
      actionsBlock: AVM1.AVM1ActionsData;
    }
  class BitmapSymbol {}
  class SpriteSymbol {
    avm1Name: string;
    avm1SymbolClass;
  }
}
