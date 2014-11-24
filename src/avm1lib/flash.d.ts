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
      stage: Stage;
      parent: DisplayObjectContainer;
      _parent: DisplayObject; // TODO remove
      root: DisplayObject;
      alpha: number;
      rotation: number;
      width: number;
      height: number;
      x: number;
      y: number;
      scaleX: number;
      scaleY: number;
      mouseX: number;
      mouseY: number;
      tabChildren: boolean;
      tabEnabled: boolean;
      tabIndex: number;
      graphics: Graphics;
      blendMode;
      cacheAsBitmap: boolean;
      loaderInfo: LoaderInfo;
      name: string;
      dropTarget: DisplayObject;
      transform: geom.Transform;
      pixelBounds: geom.Rectangle;
      enabled: boolean;
      visible: boolean;
      opaqueBackground: boolean;
      useHandCursor: boolean;
      buttonMode: boolean;
      _mouseOver: boolean;
      _mouseDown: boolean;
      _children: DisplayObject [];
      _depth: number;
      getBounds(obj: DisplayObject): flash.geom.Rectangle;
      play();
      stop();
      gotoAndPlay: Function;
      gotoAndStop: Function;
      prevFrame();
      nextFrame();
      prevScene();
      nextScene();
      startDrag: Function;
      stopDrag();
      globalToLocal(p: geom.Point): geom.Point;
      localToGlobal(p: geom.Point): geom.Point;
      hitTestObject: Function;
      hitTestPoint: Function;
      contextMenu;
      mask: DisplayObject;
      _callFrame(frame: number);
    }
    class DisplayObjectContainer extends DisplayObject {
      _as2SymbolClass;
      _name: string;
      numChildren: number;
      currentFrame: number;

      getChildIndex(child: DisplayObject): number;
      addChild(child: DisplayObject);
      removeChild(child: DisplayObject);
      addChildAt(child: DisplayObject, index: number);
      addTimelineObjectAtDepth(child, depth: number);
      swapChildren: Function;
      _lookupChildByIndex(index: number): DisplayObject;
      _lookupChildByName(name: string): DisplayObject;
    }
    class MovieClip extends DisplayObjectContainer {
      _as2SymbolClass;
      _name: string;
      numChildren: number;
      currentFrame: number;
      framesLoaded: number;
      totalFrames: number;

      addFrameScript(frameIndex: number, script: (any?) => any /*, ...*/): void;
    }
    class Graphics extends ASNative {
      beginFill: Function;
      beginBitmapFill: Function;
      clear();
      curveTo: Function;
      endFill();
      lineGradientStyle: Function;
      lineStyle: Function;
      lineTo: Function;
      moveTo: Function;
      beginGradientFill: Function;
    }
    class Loader extends DisplayObject {
      url: string;
      content: DisplayObject;
      contentLoaderInfo: LoaderInfo;
      load(request: flash.net.URLRequest);
      static runtimeStartTime: number;
    }
    class LoaderInfo extends events.EventDispatcher {
      _avm1Context: AVM1.AVM1Context;
      loader: Loader;
      swfVersion: number;
      bytesLoaded: number;
      bytesTotal: number;
      url: string;
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

    class Stage extends DisplayObject {
      align: string;
      scaleMode: string;
      displayState: number;
      fullScreenSourceRect: geom.Rectangle;
      showDefaultContextMenu: boolean;
      stageWidth: number;
      stageHeight: number;
    }

    class BitmapSymbol {}
    class SpriteSymbol {
      avm1Name: string;
      avm1SymbolClass;
    }
  }
  module events {
    class EventDispatcher extends ASNative {
      public addEventListener(type: string, listener: (event: Event) => void, useCapture?: boolean,
                              priority?: number, useWeakReference?: boolean): void;
      public removeEventListener(type: string, listener: (event: Event) => void,
                                 useCapture?: boolean): void;
    }

    class Event extends ASNative  {
      static COMPLETE: string;
      static OPEN: string;
      static INIT: string;
      static EXIT_FRAME: string;
    }
    class MouseEvent extends Event {}
    class KeyboardEvent extends Event {
      keyCode: number;
    }
    class ProgressEvent extends Event {
      static PROGRESS: string;
      public bytesLoaded: number;
      public bytesTotal: number;
    }
    class IOErrorEvent extends Event {
      static IO_ERROR: string;
      public errorID;
    }
  }
  module external {
    class ExternalInterface {
      static available: boolean;
      static addCallback(methodName: string, callback: Function);
      static call: Function;
    }
  }
  module geom {
    class ColorTransform extends ASNative {}
    class Matrix extends ASNative {}
    class Point extends ASNative {
      public x: number;
      public y: number;
      constructor(x: number, y: number);
    }
    class Rectangle extends ASNative {
      public x: number;
      public y: number;
      public width: number;
      public height: number;
      constructor(x: number, y: number, width: number, height: number);
    }
    class Transform extends ASNative {
      matrix: Matrix;
      concatenatedMatrix: Matrix;
      colorTransform: ColorTransform;
      concatenatedColorTransform: ColorTransform;
    }
  }
  module media {
    class SoundMixer {
      static stopAll(): void;
    }
    class Sound extends ASNative {}
  }
  module net {
    function navigateToURL(request, target);
    class URLRequest extends ASNative {
      constructor(url: string);
      method: string;
    }
    class URLLoaderDataFormat {
      static VARIABLES;
    }
    class URLLoader extends events.EventDispatcher {
      dataFormat: URLLoaderDataFormat;
      data: any;
      constructor(request?: URLRequest);
    }
    class SharedObject extends ASNative {}
  }
  module system {
    class Capabilities {
      static version: string;
    }
    class Security {}
    class FSCommand {
      static _fscommand(command: string, args?: string): void;
    }
  }
  module text {
    class TextField extends flash.display.DisplayObject {
      getLineMetrics(index: number);

      _name: string; // TODO remove
      antiAliasType;
      autoSize: string;
      background;
      backgroundColor;
      border;
      borderColor;
      textColor;
      type;
      bottomScrollV;
      condenseWhite: boolean;
      embedFonts: boolean;
      getTextFormat: Function;
      setTextFormat: Function;
      scrollH: number;
      scrollV: number;
      htmlText: string;
      length: number;
      maxChars: number;
      maxScrollH: number;
      maxScrollV: number;
      multiline: boolean;
      selectable: boolean;
      displayAsPassword: boolean;
      wordWrap: boolean;
      text: string;
      width: number;
      textWidth: number;
      textHeight: number;
      defaultTextFormat: TextFormat;
    }
    class TextFormat extends ASNative {
      constructor(...args);
    }
  }
  module ui {
    class ContextMenu extends ASNative {}
    class ContextMenuItem extends ASNative {}
  }
  module utils {
    function getTimer(): Timer;
    class Timer extends ASNative {}
    class SetIntervalTimer extends Timer {
      constructor(closure: Function, delay: number, repeat: boolean, ... args);
      reference: number;
      static _clearInterval: (id: number /*uint*/) => void;
    }
  }
}

declare module Shumway.Timeline {
    class AVM1ButtonAction {
      keyCode: number;
      stateTransitionFlags: number;
      actionsData: Uint8Array;
      actionsBlock: AVM1.AVM1ActionsData;
    }
}
