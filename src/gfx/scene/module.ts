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

declare var release: boolean;

declare class Path2D {
  constructor();
  constructor(path:Path2D);
  constructor(paths: Path2D[], fillRule?: string);
  constructor(d: any);

  addPath(path: Path2D, transform?: SVGMatrix): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
  rect(x: number, y: number, w: number, h: number): void;
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
  closePath(): void;
}
interface CanvasPattern {
  setTransform: (matrix: SVGMatrix) => void;
}
interface CanvasGradient {
  setTransform: (matrix: SVGMatrix) => void;
}
interface CanvasRenderingContext2D {
  stackDepth: number;
  fill(path: Path2D, fillRule?: string): void;
  clip(path: Path2D, fillRule?: string): void;
  stroke(path: Path2D): void;

  imageSmoothingEnabled: boolean
  mozImageSmoothingEnabled: boolean

  fillRule: string;
  mozFillRule: string;
  filter: string;
  globalColorMatrix: Shumway.GFX.ColorMatrix;
  flashStroke(path: Path2D, lineScaleMode: Shumway.GFX.LineScaleMode);
}
module Shumway.GFX {
  export function assert(condition: any, message: any = "") {
    if (!condition) {
      throw new Error(message);
    }
  }
  export function warning(message: any, arg1?: any, arg2?: any/*...messages: any[]*/) {
    console.warn.apply(console, arguments);
  }
  export function abstractMethod(message: string) {
    release || assert(false, "Abstract Method " + message);
  }
  export function unexpected(message?: any) {
    release || assert(false, "Unexpected: " + message);
  }
  export function unexpectedCase(message?: any) {
    release || assert(false, "Unexpected Case: " + message);
  }
  export function somewhatImplemented(message: string) {
    warning("somewhatImplemented: " + message);
  }
  export function indexOf<T>(array: T [], value: T): number {
    for (var i = 0, j = array.length; i < j; i++) {
      if (array[i] === value) {
        return i;
      }
    }
    return -1;
  }
  export function roundToMultipleOfPowerOfTwo(i: number, powerOfTwo: number) {
    var x = (1 << powerOfTwo) - 1;
    return (i + x) & ~x; // Round up to multiple of power of two.
  }
  export function nearestPowerOfTwo(x: number) {
    x --;
    x |= x >> 1;
    x |= x >> 2;
    x |= x >> 4;
    x |= x >> 8;
    x |= x >> 16;
    x ++;
    return x;
  }
  export function pushMany(dst: any [], src: any []) {
    for (var i = 0; i < src.length; i++) {
      dst.push(src[i]);
    }
  }
  export function copyFrom(dst: any [], src: any []) {
    dst.length = 0;
    pushMany(dst, src);
  }
  export class ColorStyle {
    static TabToolbar = "#252c33";
    static Toolbars = "#343c45";
    static HighlightBlue = "#1d4f73";
    static LightText = "#f5f7fa";
    static ForegroundText = "#b6babf";
    static Black = "#000000";
    static VeryDark = "#14171a";
    static Dark = "#181d20";
    static Light = "#a9bacb";
    static Grey = "#8fa1b2";
    static DarkGrey = "#5f7387";
    static Blue = "#46afe3";
    static Purple = "#6b7abb";
    static Pink = "#df80ff";
    static Red = "#eb5368";
    static Orange = "#d96629";
    static LightOrange = "#d99b28";
    static Green = "#70bf53";
    static BlueGrey = "#5e88b0";
    private static _randomStyleCache;
    private static _nextStyle = 0;
    static randomStyle() {
      if (!ColorStyle._randomStyleCache) {
        ColorStyle._randomStyleCache = [
          "#ff5e3a", "#ff9500", "#ffdb4c", "#87fc70", "#52edc7",
          "#1ad6fd", "#c644fc", "#ef4db6", "#4a4a4a", "#dbddde",
          "#ff3b30", "#ff9500", "#ffcc00", "#4cd964", "#34aadc",
          "#007aff", "#5856d6", "#ff2d55", "#8e8e93", "#c7c7cc",
          "#5ad427", "#c86edf", "#d1eefc", "#e0f8d8", "#fb2b69",
          "#f7f7f7", "#1d77ef", "#d6cec3", "#55efcb", "#ff4981",
          "#ffd3e0", "#f7f7f7", "#ff1300", "#1f1f21", "#bdbec2",
          "#ff3a2d"
        ];
      }
      return ColorStyle._randomStyleCache[(ColorStyle._nextStyle ++) % ColorStyle._randomStyleCache.length];
    }

    private static _gradient = [
      "#FF0000", "#FF1100", "#FF2300", "#FF3400", "#FF4600", // Red
      "#FF5700", "#FF6900", "#FF7B00", "#FF8C00", "#FF9E00",
      "#FFAF00", "#FFC100", "#FFD300", "#FFE400", "#FFF600",
      "#F7FF00", "#E5FF00", "#D4FF00", "#C2FF00", "#B0FF00",
      "#9FFF00", "#8DFF00", "#7CFF00", "#6AFF00", "#58FF00",
      "#47FF00", "#35FF00", "#24FF00", "#12FF00", "#00FF00"  // Green
    ];

    static gradientColor(value) {
      return ColorStyle._gradient[ColorStyle._gradient.length * clamp(value, 0, 1) | 0];
    }

    static contrastStyle(rgb: string): string {
      // http://www.w3.org/TR/AERT#color-contrast
      var c = parseInt(rgb.substr(1), 16);
      var yiq = (((c >> 16) * 299) + (((c >> 8) & 0xff) * 587) + ((c & 0xff) * 114)) / 1000;
      return (yiq >= 128) ? '#000000' : '#ffffff';
    }

    static reset() {
      ColorStyle._nextStyle = 0;
    }
  }
  /**
   * An extremely naive cache with a maximum size.
   * TODO: LRU
   */
  export class Cache {
    private _data;
    private _size: number;
    private _maxSize: number;
    constructor(maxSize: number) {
      this._data = Object.create(null);
      this._size = 0;
      this._maxSize = maxSize;
    }
    get(key) {
      return this._data[key];
    }
    set(key, value) {
      release || assert(!(key in this._data)); // Cannot mutate cache entries.
      if (this._size >= this._maxSize) {
        return false;
      }
      this._data[key] = value;
      this._size ++;
      return true;
    }
  }
  var _concat9array = new Array(9);
  export function concat9(s0: any, s1: any, s2: any, s3: any, s4: any,
                          s5: any, s6: any, s7: any, s8: any) {
    _concat9array[0] = s0;
    _concat9array[1] = s1;
    _concat9array[2] = s2;
    _concat9array[3] = s3;
    _concat9array[4] = s4;
    _concat9array[5] = s5;
    _concat9array[6] = s6;
    _concat9array[7] = s7;
    _concat9array[8] = s8;
    return _concat9array.join('');
  }
  /**
   * Cache frequently used rgba -> css style conversions.
   */
  var rgbaToCSSStyleCache = new Cache(1024);
  export function rgbaToCSSStyle(rgba: number): string {
    var result = rgbaToCSSStyleCache.get(rgba);
    if (typeof result === "string") {
      return result;
    }
    result = concat9('rgba(', rgba >> 24 & 0xff, ',', rgba >> 16 & 0xff, ',', rgba >> 8 & 0xff, ',', (rgba & 0xff) / 0xff, ')');
    rgbaToCSSStyleCache.set(rgba, result);
    return result;
  }
  export type Color = number;
  export interface ISurface {
    w: number;
    h: number;
    allocate(w: number, h: number): ISurfaceRegion;
    free(surfaceRegion: ISurfaceRegion);
  }
  export interface ISurfaceRegion {
    surface: ISurface;
    region: RegionAllocator.Region;
  }
  export const enum LineScaleMode {
    None = 0,
    Normal = 1,
    Vertical = 2,
    Horizontal = 3
  }
  export interface DisplayParameters {
    stageWidth: number;
    stageHeight: number;
    pixelRatio: number;
    screenWidth: number;
    screenHeight: number;
  }
}