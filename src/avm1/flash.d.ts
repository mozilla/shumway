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

import flashPackage = Shumway.AVMX.AS.flash;
interface ISecurityDomain {
  flash?: {
    display: {
      EventDispatcher: typeof flashPackage.events.EventDispatcher;
      DisplayObject: typeof flashPackage.display.DisplayObject;
      DisplayObjectContainer: typeof flashPackage.display.DisplayObjectContainer;
      AVM1Movie: typeof flashPackage.display.AVM1Movie;
      Stage: typeof flashPackage.display.Stage;
      Loader: typeof flashPackage.display.Loader;
      LoaderInfo: typeof flashPackage.display.LoaderInfo;
      MovieClip: typeof flashPackage.display.MovieClip;
      Graphics: typeof flashPackage.display.Graphics;
      Bitmap: typeof flashPackage.display.Bitmap;
      BitmapData: typeof flashPackage.display.BitmapData;
      SimpleButton: typeof flashPackage.display.SimpleButton;
    };
    events: {
      EventDispatcher: typeof flashPackage.events.EventDispatcher;
      Event: typeof flashPackage.events.Event;
      KeyboardEvent: typeof flashPackage.events.KeyboardEvent;
      MouseEvent: typeof flashPackage.events.MouseEvent;
      ProgressEvent: typeof flashPackage.events.ProgressEvent;
    };
    external: {
      ExternalInterface: typeof flashPackage.external.ExternalInterface;
    };
    text: {
      TextField: typeof flashPackage.text.TextField;
      TextFormat: typeof flashPackage.text.TextFormat;
    };
    geom: {
      Point: typeof flashPackage.geom.Point;
      Rectangle: typeof flashPackage.geom.Rectangle;
      Matrix: typeof flashPackage.geom.Matrix;
      ColorTransform: typeof flashPackage.geom.ColorTransform;
      Transform: typeof flashPackage.geom.Transform;
    }
    net: {
      URLRequest: typeof flashPackage.net.URLRequest;
      URLLoader: typeof flashPackage.net.URLLoader;
      SharedObject: typeof flashPackage.net.SharedObject;
    }
    system: {
      fscommand: typeof flashPackage.system.fscommand;
    }
    ui: {
      ContextMenu: typeof flashPackage.ui.ContextMenu;
      ContextMenuItem: typeof flashPackage.ui.ContextMenuItem;
    }
    utils: {
      ByteArray: typeof flashPackage.utils.ByteArray;
    }
    media: {
      Sound: typeof flashPackage.media.Sound;
      SoundChannel: typeof flashPackage.media.SoundChannel;
      SoundTransform: typeof flashPackage.media.SoundTransform;
    }
  }
}

declare module Shumway.AVMX.AS.flash {
  module display {
    class DisplayObject extends events.EventDispatcher {
      static axClass: typeof DisplayObject;

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
      _symbol: DisplaySymbol;
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
      _lookupChildByName(name: string, options: LookupChildOptions): DisplayObject;
    }
    class MovieClip extends DisplayObjectContainer {
      static axClass: typeof MovieClip;

      _as2SymbolClass;
      _name: string;
      numChildren: number;
      currentFrame: number;
      framesLoaded: number;
      totalFrames: number;

      addFrameScript(frameIndex: number, script: (any?) => any /*, ...*/): void;
      _getAbsFrameNumber(frame: string, sceneName: string): number;
      callFrame(frame: number): void;
    }
    class Graphics extends ASObject {
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
    class BitmapData extends ASObject {
      static axClass: typeof BitmapData;

      width: number;
      height: number;
      transparent: boolean;
      constructor(width: number, height: number, trasparent: boolean, fillColor: number);
      clone();
      compare(otherBitmapData: BitmapData): boolean;
    }
    class Bitmap extends DisplayObject {
      constructor();
    }
    class SimpleButton extends DisplayObject {
      static axClass: typeof SimpleButton;

      _symbol: ButtonSymbol;
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

    class DisplaySymbol extends Timeline.Symbol {
      id: number;
    }
    class BitmapSymbol extends DisplaySymbol {}
    class ButtonSymbol extends DisplaySymbol {
      data: { buttonActions: Shumway.Timeline.AVM1ButtonAction[] }
    }
    class SpriteSymbol extends DisplaySymbol {
      avm1Name: string;
      avm1SymbolClass;
    }

    enum LookupChildOptions {
      DEFAULT = 0,
      IGNORE_CASE = 1,
      INCLUDE_NOT_INITIALIZED = 2
    }
  }
  module events {
    class EventDispatcher extends ASObject {
      public addEventListener(type: string, listener: (event: Event) => void, useCapture?: boolean,
                              priority?: number, useWeakReference?: boolean): void;
      public removeEventListener(type: string, listener: (event: Event) => void,
                                 useCapture?: boolean): void;
    }

    class Event extends ASObject  {
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
    class ColorTransform extends ASObject {
      static axClass: typeof ColorTransform;
    }
    class Matrix extends ASObject {
      static axClass: typeof Matrix;
    }
    class Point extends ASObject {
      static axClass: typeof Point;

      public x: number;
      public y: number;
      constructor(x: number, y: number);
    }
    class Rectangle extends ASObject {
      static axClass: typeof Rectangle;

      public x: number;
      public y: number;
      public width: number;
      public height: number;
      constructor(x: number, y: number, width: number, height: number);
    }
    class Transform extends ASObject {
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
    class Sound extends ASObject {
      play(startTime: number, loops: number, sndTransform?: flash.media.SoundTransform): SoundChannel;
    }
    class SoundChannel extends ASObject {
      soundTransform: SoundTransform;
      stop();
    }
    class SoundTransform extends ASObject  {}
    class SoundSymbol {}
  }
  module net {
    class URLRequest extends ASObject {
      constructor(url: string);
      method: string;
    }
    class URLLoader extends events.EventDispatcher {
      dataFormat;
      data: any;
      constructor(request?: URLRequest);
      _ignoreDecodeErrors: boolean;
    }
    class SharedObject extends ASObject {
      static axClass: typeof SharedObject;
    }
  }
  module system {
    class Capabilities {
      static version: string;
    }
    class Security {}
    var fscommand: { axCall: (thisArg, sec: ISecurityDomain, command: string, args?: string) => any };
  }
  module text {
    class TextField extends flash.display.DisplayObject {
      static axClass: typeof TextField;

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
      getTextFormat: (beginIndex: number, endIndex: number) => TextFormat;
      setTextFormat: (tf: TextFormat, beginIndex: number, endIndex: number) => void;
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
      _symbol: TextSymbol;
    }
    class TextFormat extends ASObject {
      constructor(...args);
    }
    class TextSymbol extends display.DisplaySymbol {
      variableName: string;
    }
  }
  module ui {
    class ContextMenu extends ASObject {
      static axClass: typeof ContextMenu;
    }
    class ContextMenuItem extends ASObject {
      static axClass: typeof ContextMenuItem;
    }
  }
  module utils {
    function getTimer(): Timer;
    class Timer extends ASObject {}
    class SetIntervalTimer extends Timer {
      constructor(closure: Function, delay: number, repeat: boolean, ... args);
      reference: number;
      static _clearInterval: (id: number /*uint*/) => void;
    }
  }
}

declare module Shumway.AVMX.AS {
  function FlashUtilScript_getTimer();
  function FlashNetScript_navigateToURL(request, window_);
  function constructClassFromSymbol(symbol: Timeline.Symbol, axClass: ASClass);
}

declare module Shumway.Timeline {
    class AVM1ButtonAction {
      keyCode: number;
      stateTransitionFlags: number;
      actionsData: Uint8Array;
      actionsBlock: AVM1.AVM1ActionsData;
    }
    class Symbol { }
}
