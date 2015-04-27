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

///<reference path='../references.ts' />

module Shumway.AVM1.Lib {
  import flash = Shumway.AVMX.AS.flash;

  export class AVM1BitmapData extends AVM1Object {
    static createAVM1Class(context: AVM1Context): AVM1Object {
      return wrapAVM1NativeClass(context, true, AVM1BitmapData,
        ['loadBitmap'],
        ['height#', 'rectangle#', 'transparent#', 'width#',
         'applyFilter', 'clone', 'colorTransform', 'compare', 'copyChannel',
         'copyPixels', 'dispose', 'draw', 'fillRect', 'floodFill',
         'generateFilterRect', 'getColorBoundsRect', 'getPixel', 'getPixel32',
         'hitTest', 'merge', 'noise', 'paletteMap', 'perlinNoise',
         'pixelDissolve', 'scroll', 'setPixel', 'setPixel32', 'threshold'
        ],
        null, AVM1BitmapData.prototype.avm1Constructor);
    }

    _as3Object: flash.display.BitmapData;

    public avm1Constructor(width: number, height: number, transparent?: boolean, fillColor?: number) {
      width = alToNumber(this.context, width);
      height = alToNumber(this.context, height);
      transparent = arguments.length < 3 ? true : alToBoolean(this.context, transparent);
      fillColor = arguments.length < 4 ? 0xFFFFFFFF : alToInt32(this.context, fillColor);
      var as3Object = new this.context.sec.flash.display.BitmapData(width, height, transparent, fillColor);
      this._as3Object = as3Object;
    }

    static loadBitmap(context: AVM1Context, symbolId: string): AVM1BitmapData {
      symbolId = alToString(context, symbolId);
      var symbol = context.getAsset(symbolId);
      // REDUX verify
      var symbolClass = symbol.symbolProps.symbolClass;
      var bitmapClass = context.sec.flash.display.BitmapData.axClass;
      if (symbol && bitmapClass.dPrototype.isPrototypeOf((<any>symbolClass).dPrototype)) {
        var as3Object = Shumway.AVMX.AS.constructClassFromSymbol(symbol, bitmapClass);
        var BitmapData: AVM1Object = context.globals.alGet('BitmapData');
        var bitmap = new AVM1BitmapData(context);
        bitmap.alPrototype = BitmapData.alGetPrototypeProperty();
        bitmap._as3Object = as3Object;
        return bitmap;
      }
      return null;
    }

    public getHeight(): number {
      return this._as3Object.height;
    }

    public getRectangle(): AVM1Object {
      Debug.notImplemented('AVM1BitmapData.getRectangle');
      return undefined;
    }

    public getTransparent(): boolean {
      return this._as3Object.transparent;
    }

    public getWidth(): number {
      return this._as3Object.width;
    }

    public applyFilter(sourceBitmap: AVM1BitmapData, sourceRect: AVM1Object, destPoint: AVM1Object, filter: AVM1Object): number {
      Debug.notImplemented('AVM1BitmapData.applyFilter');
      return NaN;
    }

    public clone(): AVM1BitmapData {
      var bitmap = new AVM1BitmapData(this.context);
      var BitmapData: AVM1Object = this.context.globals.alGet('BitmapData');
      bitmap.alPrototype = BitmapData.alGetPrototypeProperty();
      bitmap._as3Object = this._as3Object.clone();
      return bitmap;
    }

    public colorTransform(rect: AVM1Object, colorTransform: AVM1Object): void {
      Debug.notImplemented('AVM1BitmapData.colorTransform');
    }

    public compare(other: AVM1BitmapData): boolean {
      if (!(other instanceof AVM1BitmapData)) {
        return false;
      }
      return this._as3Object.compare((<AVM1BitmapData>other)._as3Object);
    }

    public copyChannel(sourceBitmap: AVM1BitmapData, sourceRect: AVM1Object, destPoint: AVM1Object, sourceChannel: number, destChannel: number): void {
      Debug.notImplemented('AVM1BitmapData.copyChannel');
    }

    public copyPixels(sourceBitmap: AVM1BitmapData, sourceRect: AVM1Object, destPoint: AVM1Object, alphaBitmap?: AVM1BitmapData, alphaPoint?: AVM1Object, mergeAlpha?: boolean): void {
      Debug.notImplemented('AVM1BitmapData.copyPixels');
    }

    dispose(): void {
      Debug.notImplemented('AVM1BitmapData.dispose');
    }

    draw(source: AVM1Object, matrix?: AVM1Object, colorTransform?: AVM1Object, blendMode?: AVM1Object, clipRect?: AVM1Object, smooth?: boolean): void {
      Debug.notImplemented('AVM1BitmapData.draw');
    }

    fillRect(rect: AVM1Object, color: number): void {
      Debug.notImplemented('AVM1BitmapData.fillRect');
    }

    floodFill(x: number, y: number, color: number): void {
      Debug.notImplemented('AVM1BitmapData.floodFill');
    }

    generateFilterRect(sourceRect: AVM1Object, filter: AVM1Object): AVM1Object {
      Debug.notImplemented('AVM1BitmapData.generateFilterRect');
      return undefined;
    }

    getColorBoundsRect(mask: number, color: number, findColor?: boolean): AVM1Object {
      Debug.notImplemented('AVM1BitmapData.getColorBoundsRect');
      return undefined;
    }

    getPixel(x: number, y: number): number {
      return this._as3Object.getPixel(x, y);
    }

    getPixel32(x: number, y: number): number {
      return this._as3Object.getPixel32(x, y);
    }

    hitTest(firstPoint: AVM1Object, firstAlphaThreshold: number, secondObject: AVM1Object, secondBitmapPoint?: AVM1Object, secondAlphaThreshold?: number): boolean {
      Debug.notImplemented('AVM1BitmapData.hitTest');
      return false;
    }

    merge(sourceBitmap: AVM1BitmapData, sourceRect: AVM1Object, destPoint: AVM1Object, redMult: number, greenMult: number, blueMult: number, alphaMult: number): void {
      Debug.notImplemented('AVM1BitmapData.merge');
      return undefined;
    }

    noise(randomSeed: number, low?: number, high?: number, channelOptions?: number, grayScale?: boolean): void {
      Debug.notImplemented('AVM1BitmapData.noise');
    }

    paletteMap(sourceBitmap: AVM1BitmapData, sourceRect: AVM1Object, destPoint: AVM1Object, redArray?: AVM1Object, greenArray?: AVM1Object, blueArray?: AVM1Object, alphaArray?: AVM1Object): void {
      Debug.notImplemented('AVM1BitmapData.paletteMap');
    }

    perlinNoise(baseX: number, baseY: number, numOctaves: number, randomSeed: number, stitch: boolean, fractalNoise: boolean, channelOptions?: number, grayScale?: boolean, offsets?: AVM1Object): void {
      Debug.notImplemented('AVM1BitmapData.perlinNoise');
    }

    pixelDissolve(sourceBitmap: AVM1BitmapData, sourceRect: AVM1Object, destPoint: AVM1Object, randomSeed?: number, numberOfPixels?: number, fillColor?: number): number {
      Debug.notImplemented('AVM1BitmapData.pixelDissolve');
      return NaN;
    }

    scroll(x: number, y: number): void {
      Debug.notImplemented('AVM1BitmapData.scroll');
    }

    setPixel(x: number, y: number, color: number): void {
      Debug.notImplemented('AVM1BitmapData.setPixel');
    }

    setPixel32(x: number, y: number, color: number): void {
      Debug.notImplemented('AVM1BitmapData.setPixel32');
    }

    threshold(sourceBitmap: AVM1BitmapData, sourceRect: AVM1Object, destPoint: AVM1Object, operation: String, threshold: number, color?: number, mask?: number, copySource?: boolean): number {
      Debug.notImplemented('AVM1BitmapData.threshold');
      return NaN;
    }
  }
}
