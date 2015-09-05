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
      InteractiveObject: typeof flashPackage.display.InteractiveObject;
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
    filters: any;
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
      URLVariables: typeof flashPackage.net.URLVariables;
      SharedObject: typeof flashPackage.net.SharedObject;
    }
    system: {
      Capabilities: typeof flashPackage.system.Capabilities;
      LoaderContext: typeof flashPackage.system.LoaderContext;
      Security: typeof flashPackage.system.Security;
      fscommand: typeof flashPackage.system.fscommand;
    }
    ui: {
      ContextMenu: typeof flashPackage.ui.ContextMenu;
      ContextMenuItem: typeof flashPackage.ui.ContextMenuItem;
      Mouse: typeof flashPackage.ui.Mouse;
    }
    utils: {
      ByteArray: typeof flashPackage.utils.ByteArray;
    }
    media: {
      Sound: typeof flashPackage.media.Sound;
      SoundChannel: typeof flashPackage.media.SoundChannel;
      SoundTransform: typeof flashPackage.media.SoundTransform;
      SoundMixer: typeof flashPackage.media.SoundMixer;
    }
    xml: {
      XMLDocument: typeof flashPackage.xml.XMLDocument;
      XMLNode: typeof flashPackage.xml.XMLNode;
    }
  };
  player: Shumway.Player.Player;
}

declare module Shumway.Player {
  class Player {
    requestRendering(): void;
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
      graphics: Graphics;
      blendMode;
      cacheAsBitmap: boolean;
      loaderInfo: LoaderInfo;
      name: string;
      dropTarget: DisplayObject;
      transform: geom.Transform;
      pixelBounds: geom.Rectangle;
      scale9Grid: geom.Rectangle;
      scrollRect: geom.Rectangle;
      enabled: boolean;
      visible: boolean;
      opaqueBackground;
      useHandCursor: boolean;
      buttonMode: boolean;
      filters;
      _mouseOver: boolean;
      _mouseDown: boolean;
      _children: DisplayObject [];
      _depth: number;
      _symbol: DisplaySymbol;
      getBounds(obj: DisplayObject): flash.geom.Rectangle;
      getRect(obj: DisplayObject): flash.geom.Rectangle;
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
      mask: DisplayObject;
      _callFrame(frame: number);
    }
    class InteractiveObject extends DisplayObject  {
      tabEnabled: boolean;
      tabIndex: number;
      focusRect: boolean;
      contextMenu;
    }
    class DisplayObjectContainer extends InteractiveObject {
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
      _lookupChildByIndex(index: number, options: LookupChildOptions): DisplayObject;
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
      hitArea: DisplayObject;
      trackAsMenu: boolean;

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
      copyFrom: Function;
    }
    class Loader extends DisplayObjectContainer {
      url: string;
      content: DisplayObject;
      _content: DisplayObject; // TODO remove
      contentLoaderInfo: LoaderInfo;
      load(request: flash.net.URLRequest, context?: flash.system.LoaderContext): void;
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
    class AVM1Movie extends DisplayObject {
      _getLevelForRoot(root: DisplayObject): number;
      _getRoot(level: number): DisplayObject;
      _setRoot(level: number, root: DisplayObject): void;
      _deleteRoot(level: number): void;
    }
    class BitmapData extends ASObject {
      static axClass: typeof BitmapData;

      width: number;
      height: number;
      transparent: boolean;
      constructor(width: number, height: number, trasparent: boolean, fillColor: number);
      applyFilter(sourceBitmap: BitmapData, sourceRect: geom.Rectangle, destPoint: geom.Point, filter): void;
      clone();
      colorTransform(rect: flash.geom.Rectangle, colorTransform: flash.geom.ColorTransform): void;
      compare(otherBitmapData: BitmapData): boolean;
      copyChannel(sourceBitmapData: flash.display.BitmapData, sourceRect: flash.geom.Rectangle, destPoint: flash.geom.Point, sourceChannel: number, destChannel: number): void;
      copyPixels(sourceBitmap: BitmapData, sourceRect: geom.Rectangle, destPoint: geom.Point, alphaBitmap: BitmapData, alphaPoint: geom.Point, mergeAlpha: boolean): void;
      draw(source, matrix: geom.Matrix, colorTransform: geom.ColorTransform, blendMode: string, clipRect: geom.Rectangle, smoothing: boolean): void;
      fillRect(rect: geom.Rectangle, color: number): void;
      floodFill(x: number, y: number, color: number): void;
      getColorBoundsRect(mask: number, color: number, findColor?: boolean): flash.geom.Rectangle;
      getPixel(x: number, y: number): number;
      getPixel32(x: number, y: number): number;
      setPixel(x: number, y: number, uARGB: number): void;
      setPixel32(x: number, y: number, uARGB: number): void;
      hitTest(firstPoint: flash.geom.Point, firstAlphaThreshold: number, secondObject: ASObject, secondBitmapDataPoint?: flash.geom.Point, secondAlphaThreshold?: number): boolean;
      merge(sourceBitmapData: flash.display.BitmapData, sourceRect: flash.geom.Rectangle, destPoint: flash.geom.Point, redMultiplier: number, greenMultiplier: number, blueMultiplier: number, alphaMultiplier: number): void;
      noise(randomSeed: number, low?: number, high?: number, channelOptions?: number, grayScale?: boolean): void;
      paletteMap(sourceBitmapData: flash.display.BitmapData, sourceRect: flash.geom.Rectangle, destPoint: flash.geom.Point, redArray?: any[], greenArray?: any[], blueArray?: any[], alphaArray?: any[]): void;
      perlinNoise(baseX: number, baseY: number, numOctaves: number, randomSeed: number, stitch: boolean, fractalNoise: boolean, channelOptions?: number, grayScale?: boolean, offsets?: any[]): void;
      pixelDissolve(sourceBitmapData: flash.display.BitmapData, sourceRect: flash.geom.Rectangle, destPoint: flash.geom.Point, randomSeed?: number, numPixels?: number, fillColor?: number): number;
      scroll(x: number, y: number): void;
      threshold(sourceBitmapData: flash.display.BitmapData, sourceRect: flash.geom.Rectangle, destPoint: flash.geom.Point, operation: string, threshold: number, color?: number, mask?: number, copySource?: boolean): number;
      dispose();
    }
    class Bitmap extends DisplayObject {
      constructor();
    }
    class SimpleButton extends InteractiveObject {
      static axClass: typeof SimpleButton;

      _symbol: ButtonSymbol;
      trackAsMenu: boolean;
    }

    class Stage extends DisplayObjectContainer {
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
    }

    const enum LookupChildOptions {
      DEFAULT = 0,
      IGNORE_CASE = 1,
      INCLUDE_NON_INITIALIZED = 2
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
      static axClass: typeof ExternalInterface;

      static available: boolean;
      static addCallback(methodName: string, callback: Function);
      static call: Function;
    }
  }
  module geom {
    class ColorTransform extends ASObject {
      static axClass: typeof ColorTransform;

      color: number;
      redMultiplier: number;
      greenMultiplier: number;
      blueMultiplier: number;
      alphaMultiplier: number;
      redOffset: number;
      greenOffset: number;
      blueOffset: number;
      alphaOffset: number;
      constructor(redMultiplier: number, greenMultiplier: number, blueMultiplier: number, alphaMultiplier: number,
                  redOffset: number, greenOffset: number, blueOffset: number, alphaOffset: number);
      public concat(second: ColorTransform): void;
    }
    class Matrix extends ASObject {
      static axClass: typeof Matrix;

      a: number;
      b: number;
      c: number;
      d: number;
      tx: number;
      ty: number;
      constructor(a: number, b: number, c: number, d: number, tx: number, ty: number);
      concat(other: Matrix): void;
      createBox(scaleX: number, scaleY: number, rotation: number, tx: number, ty: number): void;
      createGradientBox(width: number, height: number, rotation: number, tx: number, ty: number): void;
      deltaTransformPoint(point: Point): Point;
      invert(): void;
      rotate(angle: number): void;
      scale(sx: number, sy: number): void;
      transformPoint(point: Point): Point;
      translate(tx: number, ty: number): void;
    }
    class Point extends ASObject {
      static axClass: typeof Point;

      public x: number;
      public y: number;
      public length: number;
      constructor(x: number, y: number);

      static interpolate(p1: Point, p2: Point, f: number): Point;
      static distance(p1: Point, p2: Point): number;
      static polar(length: number, angle: number): Point;
      offset(dx: number, dy: number): void;
      equals(toCompare: Point): boolean;
      subtract(v: Point): Point;
      add(v: Point): Point;
      normalize(thickness: number): void;
    }
    class Rectangle extends ASObject {
      static axClass: typeof Rectangle;

      public x: number;
      public y: number;
      public width: number;
      public height: number;
      public size: Point;
      constructor(x: number, y: number, width: number, height: number);
      public inflate(dx: number, dy: number);
      public inflatePoint(point: Point): void;
      public offset(dx: number, dy: number): void;
      public offsetPoint(point: Point): void;
      public contains(x: number, y: number): boolean;
      public containsPoint(point: Point): boolean;
      public containsRect(rect: Rectangle): boolean;
      public intersection(toIntersect: Rectangle): Rectangle;
      public intersects(toIntersect: Rectangle): boolean;
      public union(toUnion: Rectangle): Rectangle;
      public equals(toCompare: Rectangle): boolean;
      public isEmpty(): boolean;
    }
    class Transform extends ASObject {
      matrix: Matrix;
      concatenatedMatrix: Matrix;
      colorTransform: ColorTransform;
      concatenatedColorTransform: ColorTransform;
      pixelBounds: flash.geom.Rectangle;
    }
  }
  module media {
    class SoundMixer {
      static axClass: typeof SoundMixer;
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
      contentType: string;
      data: any;
    }
    class URLLoader extends events.EventDispatcher {
      dataFormat;
      data: any;
      bytesLoaded: number;
      bytesTotal: number;
      constructor(request?: URLRequest);
      _ignoreDecodeErrors: boolean;
    }
    class URLVariables extends ASObject {
      _ignoreDecodingErrors: boolean;
      decode(queryString: string): void;
    }
    class SharedObject extends ASObject {
      static axClass: typeof SharedObject;
      size: number;
      fps: number;
      clear(): void;
      flush(minDiskSpace?: number /*int*/): string;
      static getLocal(name: string, localPath: string, secure: boolean): SharedObject;
    }
  }
  module system {
    class Capabilities extends ASObject {
      static axClass: typeof Capabilities;

      static version: string;
    }
    class LoaderContext extends ASObject {
      _avm1Context: Shumway.AVM1.AVM1Context;
    }
    class Security extends ASObject {
      static axClass: typeof Security;

      static sandboxType: string;
      static allowDomain(domain: string): void;
      static allowInsecureDomain(domain: string): void;
      static loadPolicyFile(url: string): void;
    }
    var fscommand: { axCall: (thisArg, sec: ISecurityDomain, command: string, args?: string) => any };
  }
  module text {
    class TextField extends flash.display.InteractiveObject {
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
      gridFitType: string;
      _symbol: TextSymbol;
    }
    class TextFormat extends ASObject {
      constructor(...args);
    }
    class TextSymbol extends display.DisplaySymbol {
      variableName: string;
      html: boolean;
    }
  }
  module ui {
    class ContextMenu extends ASObject {
      static axClass: typeof ContextMenu;
    }
    class ContextMenuItem extends ASObject {
      static axClass: typeof ContextMenuItem;
    }
    class Mouse extends ASObject {
      static axClass: typeof Mouse;
      static draggableObject: display.DisplayObject;
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
