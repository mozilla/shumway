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

  export function toAS3BitmapData(as2Object: AVM1BitmapData): flash.display.BitmapData {
    if (!(as2Object instanceof AVM1BitmapData)) {
      return null;
    }
    return as2Object.as3BitmapData;
  }

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

    private _as3Object: flash.display.BitmapData;

    get as3BitmapData(): flash.display.BitmapData {
      return this._as3Object;
    }

    public avm1Constructor(width: number, height: number, transparent?: boolean, fillColor?: number) {
      width = alToNumber(this.context, width);
      height = alToNumber(this.context, height);
      transparent = arguments.length < 3 ? true : alToBoolean(this.context, transparent);
      fillColor = arguments.length < 4 ? 0xFFFFFFFF : alToInt32(this.context, fillColor);
      var as3Object = new this.context.sec.flash.display.BitmapData(width, height, transparent, fillColor);
      this._as3Object = as3Object;
    }

    static fromAS3BitmapData(context: AVM1Context, as3Object: flash.display.BitmapData): AVM1Object {
      var as2Object = new AVM1BitmapData(context);
      as2Object.alPrototype = context.globals.BitmapData.alGetPrototypeProperty();
      as2Object._as3Object = as3Object;
      return as2Object;
    }

    static loadBitmap(context: AVM1Context, symbolId: string): AVM1BitmapData {
      symbolId = alToString(context, symbolId);
      var symbol = context.getAsset(symbolId);
      // REDUX verify
      var symbolClass = symbol.symbolProps.symbolClass;
      var bitmapClass = context.sec.flash.display.BitmapData.axClass;
      if (symbol && (bitmapClass === symbolClass ||
          bitmapClass.dPrototype.isPrototypeOf((<any>symbolClass).dPrototype))) {
        var as3Object = Shumway.AVMX.AS.constructClassFromSymbol(symbol.symbolProps, bitmapClass);
        var bitmap = new AVM1BitmapData(context);
        bitmap.alPrototype = context.globals.BitmapData.alGetPrototypeProperty();
        bitmap._as3Object = as3Object;
        return bitmap;
      }
      return null;
    }

    public getHeight(): number {
      return this._as3Object.height;
    }

    public getRectangle(): AVM1Object {
      var rect = this.as3BitmapData;
      return new AVM1Rectangle(this.context, 0, 0, rect.width, rect.height);
    }

    public getTransparent(): boolean {
      return this._as3Object.transparent;
    }

    public getWidth(): number {
      return this._as3Object.width;
    }

    public applyFilter(sourceBitmap: AVM1BitmapData, sourceRect: AVM1Object, destPoint: AVM1Object, filter: AVM1Object): number {
      // TODO handle incorrect arguments
      var as3BitmapData = sourceBitmap.as3BitmapData;
      var as3SourceRect = toAS3Rectangle(sourceRect);
      var as3DestPoint = toAS3Point(destPoint);
      var as3Filter = convertToAS3Filter(this.context, filter);

      this.as3BitmapData.applyFilter(as3BitmapData, as3SourceRect, as3DestPoint, as3Filter);
      return 0;
    }

    public clone(): AVM1BitmapData {
      var bitmap = new AVM1BitmapData(this.context);
      bitmap.alPrototype = this.context.globals.BitmapData.alGetPrototypeProperty();
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

    public copyChannel(sourceBitmap: AVM1BitmapData, sourceRect: AVM1Object, destPoint: AVM1Object,
                       sourceChannel: number, destChannel: number): void {
      var as3BitmapData = sourceBitmap.as3BitmapData;
      var as3SourceRect = toAS3Rectangle(sourceRect);
      var as3DestPoint = toAS3Point(destPoint);
      sourceChannel = alCoerceNumber(this.context, sourceChannel);
      destChannel = alCoerceNumber(this.context, destChannel);
      this.as3BitmapData.copyChannel(as3BitmapData, as3SourceRect, as3DestPoint, sourceChannel,
                                     destChannel);
    }

    public copyPixels(sourceBitmap: AVM1BitmapData, sourceRect: AVM1Object, destPoint: AVM1Object,
                      alphaBitmap?: AVM1BitmapData, alphaPoint?: AVM1Object,
                      mergeAlpha?: boolean): void {
      var as3BitmapData = sourceBitmap.as3BitmapData;
      var as3SourceRect = toAS3Rectangle(sourceRect);
      var as3DestPoint = toAS3Point(destPoint);
      var as3AlphaData = alphaBitmap ? alphaBitmap.as3BitmapData : null;
      var as3AlphaPoint = alphaPoint ? toAS3Point(alphaPoint) : null;
      mergeAlpha = alToBoolean(this.context, mergeAlpha);

      this.as3BitmapData.copyPixels(as3BitmapData, as3SourceRect, as3DestPoint, as3AlphaData,
                                    as3AlphaPoint, mergeAlpha);
    }

    dispose(): void {
      this.as3BitmapData.dispose();
    }

    draw(source: AVM1Object, matrix?: AVM1Object, colorTransform?: AVM1Object, blendMode?: any,
         clipRect?: AVM1Object, smooth?: boolean): void {
      var as3BitmapData = (<any>source)._as3Object; // movies and bitmaps
      var as3Matrix = matrix ? toAS3Matrix(matrix) : null;
      var as3ColorTransform = colorTransform ? toAS3ColorTransform(colorTransform) : null;
      var as3ClipRect = clipRect ? toAS3Rectangle(clipRect) : null;
      blendMode = typeof blendMode === 'number' ? BlendModesMap[blendMode] : alCoerceString(this.context, blendMode);
      blendMode  = blendMode || null;
      smooth = alToBoolean(this.context, smooth);

      this.as3BitmapData.draw(as3BitmapData, as3Matrix, as3ColorTransform, blendMode, as3ClipRect, smooth);
    }

    fillRect(rect: AVM1Object, color: number): void {
      var as3Rect = toAS3Rectangle(rect);
      color = alToInt32(this.context, color);

      this.as3BitmapData.fillRect(as3Rect, color);
    }

    floodFill(x: number, y: number, color: number): void {
      x = alCoerceNumber(this.context, x);
      y = alCoerceNumber(this.context, y);
      color = alToInt32(this.context, color);
      this._as3Object.floodFill(x, y, color);
    }

    generateFilterRect(sourceRect: AVM1Object, filter: AVM1Object): AVM1Object {
      Debug.notImplemented('AVM1BitmapData.generateFilterRect');
      return undefined;
    }

    getColorBoundsRect(mask: number, color: number, findColor?: boolean): AVM1Object {
      mask = alToInt32(this.context, mask);
      color = alToInt32(this.context, color);
      findColor = alToBoolean(this.context, findColor);
      var rect = this._as3Object.getColorBoundsRect(mask, color, findColor);
      return new AVM1Rectangle(this.context, rect.x, rect.y, rect.width, rect.height);
    }

    getPixel(x: number, y: number): number {
      return this._as3Object.getPixel(x, y);
    }

    getPixel32(x: number, y: number): number {
      return this._as3Object.getPixel32(x, y);
    }

    hitTest(firstPoint: AVM1Object, firstAlphaThreshold: number, secondObject: AVM1Object,
            secondBitmapPoint?: AVM1Object, secondAlphaThreshold?: number): boolean {
      Debug.somewhatImplemented('AVM1BitmapData.hitTest');
      var as3FirstPoint = toAS3Point(firstPoint);
      firstAlphaThreshold = alToInt32(this.context, firstAlphaThreshold);
      // TODO: Check for Rectangle, Point, Bitmap, or BitmapData here. Or whatever AVM1 allows.
      var as3SecondObject = (<any>secondObject)._as3Object; // movies and bitmaps
      if (arguments.length < 4) {
        return this._as3Object.hitTest(as3FirstPoint, firstAlphaThreshold, as3SecondObject);
      }
      var as3SecondBitmapPoint = secondBitmapPoint != null ? toAS3Point(secondBitmapPoint) : null;
      if (arguments.length < 4) {
        return this._as3Object.hitTest(as3FirstPoint, firstAlphaThreshold, as3SecondObject,
                                       as3SecondBitmapPoint);
      }
      secondAlphaThreshold = alToInt32(this.context, secondAlphaThreshold);
      return this._as3Object.hitTest(as3FirstPoint, firstAlphaThreshold, as3SecondObject,
                                     as3SecondBitmapPoint, secondAlphaThreshold);
    }

    merge(sourceBitmap: AVM1BitmapData, sourceRect: AVM1Object, destPoint: AVM1Object,
          redMult: number, greenMult: number, blueMult: number, alphaMult: number): void {
      var as3BitmapData = sourceBitmap.as3BitmapData;
      var as3SourceRect = toAS3Rectangle(sourceRect);
      var as3DestPoint = toAS3Point(destPoint);
      redMult = alToInt32(this.context, redMult);
      greenMult = alToInt32(this.context, greenMult);
      blueMult = alToInt32(this.context, blueMult);
      alphaMult = alToInt32(this.context, alphaMult);

      this.as3BitmapData.merge(as3BitmapData, as3SourceRect, as3DestPoint, redMult, greenMult,
                               blueMult, alphaMult);
    }

    noise(randomSeed: number, low?: number, high?: number, channelOptions?: number,
          grayScale?: boolean): void {
      randomSeed = alToInt32(this.context, randomSeed);
      low = arguments.length < 2 ? 0 : alToInt32(this.context, low);
      high = arguments.length < 3 ? 255 : alToInt32(this.context, high);
      channelOptions = arguments.length < 4 ? 1 | 2 | 4 : alToInt32(this.context, channelOptions);
      grayScale = arguments.length < 5 ? false : alToBoolean(this.context, grayScale);
      this._as3Object.noise(randomSeed, low, high, channelOptions, grayScale);
    }

    paletteMap(sourceBitmap: AVM1BitmapData, sourceRect: AVM1Object, destPoint: AVM1Object, redArray?: AVM1Object, greenArray?: AVM1Object, blueArray?: AVM1Object, alphaArray?: AVM1Object): void {
      Debug.notImplemented('AVM1BitmapData.paletteMap');
    }

    perlinNoise(baseX: number, baseY: number, numOctaves: number, randomSeed: number, stitch: boolean, fractalNoise: boolean, channelOptions?: number, grayScale?: boolean, offsets?: AVM1Object): void {
      baseX = alCoerceNumber(this.context, baseX);
      baseY = alCoerceNumber(this.context, baseY);
      numOctaves = alCoerceNumber(this.context, numOctaves);
      randomSeed = alCoerceNumber(this.context, randomSeed);
      stitch = alToBoolean(this.context, stitch);
      fractalNoise = alToBoolean(this.context, fractalNoise);
      channelOptions = channelOptions === undefined ? 7 : alCoerceNumber(this.context, channelOptions);
      grayScale = alToBoolean(this.context, grayScale);
      var as3Offsets = null;
      if (!isNullOrUndefined(offsets)) {
        for (var i = 0, length = offsets.alGet('length'); i < length; i++) {
          as3Offsets.push(alCoerceNumber(this.context, offsets.alGet(i)));
        }
      }

      this.perlinNoise(baseX, baseY, numOctaves, randomSeed, stitch, fractalNoise, channelOptions, grayScale, as3Offsets);
    }

    pixelDissolve(sourceBitmap: AVM1BitmapData, sourceRect: AVM1Object, destPoint: AVM1Object,
                  randomSeed?: number, numberOfPixels?: number, fillColor?: number): number {
      var as3BitmapData = sourceBitmap.as3BitmapData;
      var as3SourceRect = toAS3Rectangle(sourceRect);
      var as3DestPoint = toAS3Point(destPoint);
      randomSeed = arguments.length < 4 ? 0 : alToInt32(this.context, randomSeed);
      numberOfPixels = arguments.length < 5 ?
                       as3SourceRect.width * as3SourceRect.height / 30 :
                       alToInt32(this.context, numberOfPixels);
      fillColor = arguments.length < 6 ? 0 : alToInt32(this.context, fillColor);

      return this.as3BitmapData.pixelDissolve(as3BitmapData, as3SourceRect, as3DestPoint,
                                              randomSeed, numberOfPixels, fillColor);
    }

    scroll(x: number, y: number): void {
      x = alCoerceNumber(this.context, x);
      y = alCoerceNumber(this.context, y);
      this._as3Object.scroll(x, y);
    }

    setPixel(x: number, y: number, color: number): void {
      x = alCoerceNumber(this.context, x);
      y = alCoerceNumber(this.context, y);
      color = alToInt32(this.context, color);
      this._as3Object.setPixel(x, y, color);
    }

    setPixel32(x: number, y: number, color: number): void {
      x = alCoerceNumber(this.context, x);
      y = alCoerceNumber(this.context, y);
      color = alToInt32(this.context, color);
      this._as3Object.setPixel32(x, y, color);
    }

    threshold(sourceBitmap: AVM1BitmapData, sourceRect: AVM1Object, destPoint: AVM1Object,
              operation: string, threshold: number, color?: number, mask?: number,
              copySource?: boolean): number {
      var as3BitmapData = sourceBitmap.as3BitmapData;
      var as3SourceRect = toAS3Rectangle(sourceRect);
      var as3DestPoint = toAS3Point(destPoint);
      operation = alCoerceString(this.context, operation);
      threshold = alToInt32(this.context, threshold);
      color = arguments.length < 6 ? 0 : alToInt32(this.context, color);
      mask = arguments.length < 7 ? 0xFFFFFFFF : alToInt32(this.context, mask);
      copySource = arguments.length < 8 ? false : alToBoolean(this.context, copySource);
      return this._as3Object.threshold(as3BitmapData, as3SourceRect, as3DestPoint, operation,
                                       threshold, color, mask, copySource);
    }
  }
}
