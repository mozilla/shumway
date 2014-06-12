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
// Class: BitmapData
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  import assert = Shumway.Debug.assert;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import throwError = Shumway.AVM2.Runtime.throwError;
  import AVM2 = Shumway.AVM2.Runtime.AVM2;
  import swap32 = Shumway.IntegerUtilities.swap32;
  import premultiplyARGB = Shumway.ColorUtilities.premultiplyARGB;
  import unpremultiplyARGB = Shumway.ColorUtilities.unpremultiplyARGB;

  import Rectangle = flash.geom.Rectangle;

  /**
   * Holds blobs of bitmap data in various formats and lets you do basic pixel operations. When data is
   * unpacked, it is stored as premultiplied ARGB since it's what the SWF encodes bitmaps as.  This way
   * we don't have to do unecessary byte conversions.
   */
  export class BitmapData extends ASNative implements IBitmapDrawable, Shumway.Remoting.IRemotable {
    static classInitializer: any = null;

    _symbol: Shumway.Timeline.BitmapSymbol;
    static initializer: any = function (symbol: Shumway.Timeline.BitmapSymbol) {
      this._symbol = symbol;
    }
    
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null; // ["rect"];

    static MAXIMUM_WIDTH: number = 8191;
    static MAXIMUM_HEIGHT: number = 8191;
    static MAXIMUM_DIMENSION: number = 16777215;

    constructor (width: number /*int*/, height: number /*int*/, transparent: boolean = true, fillColorARGB: number /*uint*/ = 4294967295) {
      width = width | 0; height = height | 0; fillColorARGB = fillColorARGB | 0;
      false && super();
      this._id = flash.display.DisplayObject.getNextSyncID();
      if (this._symbol) {
        width = this._symbol.width;
        height = this._symbol.height;
      }
      if (width > BitmapData.MAXIMUM_WIDTH ||
          height > BitmapData.MAXIMUM_HEIGHT ||
          width * height > BitmapData.MAXIMUM_DIMENSION)
      {
        throwError('ArgumentError', Errors.ArgumentError);
      }
      this._transparent = !!transparent;
      this._rect = new Rectangle(0, 0, width, height);
      this._fillColorBGRA = swap32(fillColorARGB); // Specified as ARGB but stored as BGRA.
      if (this._symbol) {
        this._data = new Uint8Array(this._symbol.data.buffer);
        this._type = this._symbol.type;
        if (this._type === ImageType.PremultipliedAlphaARGB) {
          this._view = new Int32Array(this._symbol.data.buffer);
        }
      } else {
        this._data = new Uint8Array(width * height * 4);
        this._view = new Int32Array(this._data.buffer);
        this._type = ImageType.PremultipliedAlphaARGB;
        var alpha = fillColorARGB >> 24;
        if (alpha === 0 && transparent) {
          // No need to do an initial fill since this would all be zeros anyway.
        } else {
          this.fillRect(this.rect, fillColorARGB);
        }
      }
      this._dataBuffer = DataBuffer.FromArrayBuffer(this._data.buffer);
      this._isDirty = true;
    }
    
    _transparent: boolean;
    _rect: flash.geom.Rectangle;

    _id: number;
    _fillColorBGRA: number;
    _locked: boolean;

    /**
     * Image format stored in the |_data| buffer.
     */
    _type: ImageType;

    /**
     * Actual image bytes, this may be raw pixel data or compressed JPEG, PNG, GIF.
     */
    _data: Uint8Array;

    /**
     * Data buffer wrapped around the |_data| buffer.
     */
    _dataBuffer: DataBuffer;

    /**
     * Int32Array view on |_data| useful when working with 4 bytes at a time. Endianess is
     * important here, so if |_type| is PremultipliedAlphaARGB as is usually the case for
     * bitmap data, then |_view| values are actually BGRA (on little-endian machines).
     */
    _view: Int32Array;

    /**
     * Indicates whether this bitmap data's data buffer has changed since the last time it was synchronized.
     */
    _isDirty: boolean;

    getDataBuffer(): DataBuffer {
      return this._dataBuffer;
    }

    _getContentBounds(): Bounds {
      return Shumway.Bounds.FromRectangle(this._rect);
    }

    /**
     * TODO: Not tested.
     */
    private _getPixelData(rect: flash.geom.Rectangle): Int32Array {
      var r = this.rect.intersectInPlace(rect);
      if (r.isEmpty()) {
        return;
      }
      var xMin = r.x;
      var xMax = r.x + r.width;
      var yMin = r.y;
      var yMax = r.y + r.height;
      var view = this._view;
      var width = this._rect.width;
      var output = new Int32Array(r.area);
      var p = 0;
      for (var y = yMin; y < yMax; y++) {
        var offset = y * width;
        for (var x = xMin; x < xMax; x++) {
          var colorBGRA = view[offset + x];
          var alpha = colorBGRA & 0xff;
          var colorBGR = colorBGRA >>> 8;
          colorBGRA = ((255 * colorBGR) / alpha) << 8 | alpha;
          output[p++] = colorBGRA;
        }
      }
      return output;
    }

    /**
     * TODO: Not tested.
     */
    private _putPixelData(rect: flash.geom.Rectangle, input: Int32Array): void {
      var r = this.rect.intersectInPlace(rect);
      if (r.isEmpty()) {
        return;
      }
      var xMin = r.x;
      var xMax = r.x + r.width;
      var yMin = r.y;
      var yMax = r.y + r.height;
      var view = this._view;
      var width = this._rect.width;
      var p = (rect.width * rect.height - r.height) + (xMin - rect.x);
      var padding = rect.width - r.width;
      var alphaMask = this._transparent ? 0x00 : 0xff;
      for (var y = yMin; y < yMax; y++) {
        var offset = y * width;
        for (var x = xMin; x < xMax; x++) {
          var colorBGRA = input[p++];
          var alpha = colorBGRA & alphaMask;
          var colorBGR = colorBGRA >>> 8;
          view[offset + x] = (((colorBGR * alpha + 254) / 255) & 0x00ffffff) << 8 | alpha;
        }
        p += padding;
      }
      this._isDirty = true;
    }

    get width(): number /*int*/ {
      return this._rect.width;
    }

    get height(): number /*int*/ {
      return this._rect.height;
    }

    get rect(): flash.geom.Rectangle {
      return this._rect.clone();
    }

    get transparent(): boolean {
      return this._transparent;
    }

    clone(): flash.display.BitmapData {
      var bd = new BitmapData(this._rect.width, this._rect.height, this._transparent, this._fillColorBGRA);
      bd._view.set(this._view);
      return bd;
    }

    /**
     * Returns an straight alpha RGB pixel value 0x00RRGGBB.
     */
    getPixel(x: number /*int*/, y: number /*int*/): number /*uint*/ {
      x = x | 0; y = y | 0;
      return this.getPixel32(x, y) & 0x00ffffff;
    }

    /**
     * Returns an straight alpha ARGB pixel value 0xAARRGGBB.
     */
    getPixel32(x: number /*int*/, y: number /*int*/): number /*uint*/ {
      x = x | 0; y = y | 0;
      if (!this._rect.contains(x, y)) {
        return 0;
      }
      release || assert (this._type === ImageType.PremultipliedAlphaARGB);
      var pARGB = swap32(this._view[y * this._rect.width + x]);
      var uARGB = unpremultiplyARGB(pARGB);
      return uARGB >>> 0;
    }

    setPixel(x: number /*int*/, y: number /*int*/, uARGB: number /*uint*/): void {
      x = x | 0; y = y | 0; pARGB = pARGB | 0;
      if (!this._rect.contains(x, y)) {
        return;
      }
      var i = y * this._rect.width + x;
      var a = this._view[i] & 0xff;
      uARGB =  uARGB & 0x00ffffff | a << 24;
      var pARGB = premultiplyARGB(uARGB);
      this._view[i] = swap32(pARGB);
      this._isDirty = true;
    }

    setPixel32(x: number /*int*/, y: number /*int*/, uARGB: number /*uint*/): void {
      x = x | 0; y = y | 0;
      if (!this._rect.contains(x, y)) {
        return;
      }
      var a = uARGB >>> 24;
      var uRGB = uARGB & 0x00ffffff;
      if (this._transparent) {
        var uARGB = uRGB | a << 24;
        var pARGB = premultiplyARGB(uARGB);
      } else {
        var pARGB = uRGB | 0xff000000;
      }
      this._view[y * this._rect.width + x] = swap32(pARGB);
      this._isDirty = true;
    }

    applyFilter(sourceBitmapData: flash.display.BitmapData, sourceRect: flash.geom.Rectangle, destPoint: flash.geom.Point, filter: flash.filters.BitmapFilter): void {
      sourceBitmapData = sourceBitmapData; sourceRect = sourceRect; destPoint = destPoint; filter = filter;
      notImplemented("public flash.display.BitmapData::applyFilter"); return;
    }
    colorTransform(rect: flash.geom.Rectangle, colorTransform: flash.geom.ColorTransform): void {
      rect = rect; colorTransform = colorTransform;
      somewhatImplemented("public flash.display.BitmapData::colorTransform");
      return;
    }
    compare(otherBitmapData: flash.display.BitmapData): ASObject {
      otherBitmapData = otherBitmapData;
      notImplemented("public flash.display.BitmapData::compare"); return;
    }
    copyChannel(sourceBitmapData: flash.display.BitmapData, sourceRect: flash.geom.Rectangle, destPoint: flash.geom.Point, sourceChannel: number /*uint*/, destChannel: number /*uint*/): void {
      sourceBitmapData = sourceBitmapData; sourceRect = sourceRect; destPoint = destPoint; sourceChannel = sourceChannel >>> 0; destChannel = destChannel >>> 0;
      notImplemented("public flash.display.BitmapData::copyChannel"); return;
    }

    /**
     * Copies a rectangular region of pixels into the current bitmap data.
     */
    copyPixels(sourceBitmapData: flash.display.BitmapData,
               sourceRect: flash.geom.Rectangle,
               destPoint: flash.geom.Point,
               alphaBitmapData: flash.display.BitmapData = null,
               alphaPoint: flash.geom.Point = null,
               mergeAlpha: boolean = false): void
    {
      sourceBitmapData = sourceBitmapData; sourceRect = sourceRect; destPoint = destPoint; alphaBitmapData = alphaBitmapData; alphaPoint = alphaPoint; mergeAlpha = !!mergeAlpha;
      // Deal with fractional pixel coordinates, looks like Flash "rounds" the corners of the source rect, however a width
      // of |0.5| rounds down rather than up so we're not quite correct here.
      var sR = sourceRect.clone().roundInPlace();

      // Remember the original source rect in case in case the intersection changes it.
      var rR = sR.clone();
      var sR = sR.intersectInPlace(sourceBitmapData._rect);

      // Clipped source rect is empty so there's nothing to do.
      if (sR.isEmpty()) {
        return;
      }

      // Compute source rect offsets (in case the source rect had negative x, y coordinates).
      var oX = sR.x - rR.x;
      var oY = sR.y - rR.y;

      // Compute the target rect taking into account the offsets and then clip it against the
      // target.
      var tR = new geom.Rectangle (
        destPoint.x | 0 + oX,
        destPoint.y | 0 + oY,
        rR.width - oX,
        rR.height - oY
      );

      tR.intersectInPlace(this._rect);

      var sX = sR.x;
      var sY = sR.y;

      var tX = tR.x;
      var tY = tR.y;

      var tW = tR.width;
      var tH = tR.height;

      var sStride = sourceBitmapData._rect.width;
      var tStride = this._rect.width;

      var s = sourceBitmapData._view;
      var t = this._view;

      // Finally do the copy. All the math above is needed just so we don't do any branches inside
      // this hot loop.
      for (var y = 0; y < tH; y++) {
        var sP = (sY + y) * sStride + sX;
        var tP = (tY + y) * tStride + tX;
        for (var x = 0; x < tW; x++) {
          t[tP + x] = s[sP + x];
        }
      }
      this._isDirty = true;
      somewhatImplemented("public flash.display.BitmapData::copyPixels");
      return;
    }

    dispose(): void {
      this._rect.setEmpty();
      this._view = null;
      this._isDirty = true;
    }

    draw(source: flash.display.IBitmapDrawable, matrix: flash.geom.Matrix = null, colorTransform: flash.geom.ColorTransform = null, blendMode: string = null, clipRect: flash.geom.Rectangle = null, smoothing: boolean = false): void {
      somewhatImplemented("public flash.display.BitmapData::draw");
      var serializer : IBitmapDataSerializer = AVM2.instance.globals['Shumway.Player.Utils'];
      if (matrix) {
        matrix = matrix.clone().toTwips();
      }
      serializer.cacheAsBitmap(this, source, matrix, colorTransform, blendMode, clipRect, smoothing);
    }
    drawWithQuality(source: flash.display.IBitmapDrawable, matrix: flash.geom.Matrix = null, colorTransform: flash.geom.ColorTransform = null, blendMode: string = null, clipRect: flash.geom.Rectangle = null, smoothing: boolean = false, quality: string = null): void {
      source = source; matrix = matrix; colorTransform = colorTransform; blendMode = asCoerceString(blendMode); clipRect = clipRect; smoothing = !!smoothing; quality = asCoerceString(quality);
      notImplemented("public flash.display.BitmapData::drawWithQuality"); return;
    }

    fillRect(rect: flash.geom.Rectangle, uARGB: number /*uint*/): void {
      if (this._transparent) {
        var pARGB = premultiplyARGB(uARGB);
      } else {
        var pARGB = uARGB | 0xff000000;
      }
      release || assert (this._type === ImageType.PremultipliedAlphaARGB);
      var pBGRA = swap32(pARGB);
      var r = this.rect.intersectInPlace(rect);
      if (r.isEmpty()) {
        return;
      }
      var xMin = r.x;
      var xMax = r.x + r.width;
      var yMin = r.y;
      var yMax = r.y + r.height;
      var view = this._view;
      var width = this._rect.width;
      for (var y = yMin; y < yMax; y++) {
        var offset = y * width;
        for (var x = xMin; x < xMax; x++) {
          view[offset + x] = pBGRA;
        }
      }
      this._isDirty = true;
    }

    floodFill(x: number /*int*/, y: number /*int*/, color: number /*uint*/): void {
      x = x | 0; y = y | 0; color = color >>> 0;
      notImplemented("public flash.display.BitmapData::floodFill"); return;
    }
    generateFilterRect(sourceRect: flash.geom.Rectangle, filter: flash.filters.BitmapFilter): flash.geom.Rectangle {
      sourceRect = sourceRect; filter = filter;
      notImplemented("public flash.display.BitmapData::generateFilterRect"); return;
    }
    getColorBoundsRect(mask: number /*uint*/, color: number /*uint*/, findColor: boolean = true): flash.geom.Rectangle {
      mask = mask >>> 0; color = color >>> 0; findColor = !!findColor;
      notImplemented("public flash.display.BitmapData::getColorBoundsRect"); return;
    }

    getPixels(rect: flash.geom.Rectangle): flash.utils.ByteArray {
      var outputByteArray = new flash.utils.ByteArray();
      this.copyPixelsToByteArray(rect, outputByteArray);
      return outputByteArray;
    }

    copyPixelsToByteArray(rect: flash.geom.Rectangle, data: flash.utils.ByteArray): void {
      var pixelData = this._getPixelData(rect);
      if (!pixelData) {
        return;
      }
      data.writeRawBytes(new Uint8Array(pixelData));
    }

    getVector(rect: flash.geom.Rectangle): Uint32Vector {
      var outputVector = new Uint32Vector(pixelData.length);
      var pixelData = this._getPixelData(rect);
      if (!pixelData) {
        return outputVector;
      }
      outputVector.length = pixelData.length;
      outputVector._view().set(pixelData);
      return outputVector;
    }

    hitTest(firstPoint: flash.geom.Point, firstAlphaThreshold: number /*uint*/, secondObject: ASObject, secondBitmapDataPoint: flash.geom.Point = null, secondAlphaThreshold: number /*uint*/ = 1): boolean {
      firstPoint = firstPoint; firstAlphaThreshold = firstAlphaThreshold >>> 0; secondObject = secondObject; secondBitmapDataPoint = secondBitmapDataPoint; secondAlphaThreshold = secondAlphaThreshold >>> 0;
      notImplemented("public flash.display.BitmapData::hitTest"); return;
    }
    merge(sourceBitmapData: flash.display.BitmapData, sourceRect: flash.geom.Rectangle, destPoint: flash.geom.Point, redMultiplier: number /*uint*/, greenMultiplier: number /*uint*/, blueMultiplier: number /*uint*/, alphaMultiplier: number /*uint*/): void {
      sourceBitmapData = sourceBitmapData; sourceRect = sourceRect; destPoint = destPoint; redMultiplier = redMultiplier >>> 0; greenMultiplier = greenMultiplier >>> 0; blueMultiplier = blueMultiplier >>> 0; alphaMultiplier = alphaMultiplier >>> 0;
      notImplemented("public flash.display.BitmapData::merge"); return;
    }
    noise(randomSeed: number /*int*/, low: number /*uint*/ = 0, high: number /*uint*/ = 255, channelOptions: number /*uint*/ = 7, grayScale: boolean = false): void {
      randomSeed = randomSeed | 0; low = low >>> 0; high = high >>> 0; channelOptions = channelOptions >>> 0; grayScale = !!grayScale;
      notImplemented("public flash.display.BitmapData::noise"); return;
    }
    paletteMap(sourceBitmapData: flash.display.BitmapData, sourceRect: flash.geom.Rectangle, destPoint: flash.geom.Point, redArray: any [] = null, greenArray: any [] = null, blueArray: any [] = null, alphaArray: any [] = null): void {
      sourceBitmapData = sourceBitmapData; sourceRect = sourceRect; destPoint = destPoint; redArray = redArray; greenArray = greenArray; blueArray = blueArray; alphaArray = alphaArray;
      notImplemented("public flash.display.BitmapData::paletteMap"); return;
    }
    perlinNoise(baseX: number, baseY: number, numOctaves: number /*uint*/, randomSeed: number /*int*/, stitch: boolean, fractalNoise: boolean, channelOptions: number /*uint*/ = 7, grayScale: boolean = false, offsets: any [] = null): void {
      baseX = +baseX; baseY = +baseY; numOctaves = numOctaves >>> 0; randomSeed = randomSeed | 0; stitch = !!stitch; fractalNoise = !!fractalNoise; channelOptions = channelOptions >>> 0; grayScale = !!grayScale; offsets = offsets;
      notImplemented("public flash.display.BitmapData::perlinNoise"); return;
    }
    pixelDissolve(sourceBitmapData: flash.display.BitmapData, sourceRect: flash.geom.Rectangle, destPoint: flash.geom.Point, randomSeed: number /*int*/ = 0, numPixels: number /*int*/ = 0, fillColor: number /*uint*/ = 0): number /*int*/ {
      sourceBitmapData = sourceBitmapData; sourceRect = sourceRect; destPoint = destPoint; randomSeed = randomSeed | 0; numPixels = numPixels | 0; fillColor = fillColor >>> 0;
      notImplemented("public flash.display.BitmapData::pixelDissolve"); return;
    }
    scroll(x: number /*int*/, y: number /*int*/): void {
      x = x | 0; y = y | 0;
      notImplemented("public flash.display.BitmapData::scroll"); return;
    }

    setPixels(rect: flash.geom.Rectangle, inputByteArray: flash.utils.ByteArray): void {
      this._putPixelData(rect, new Int32Array(inputByteArray.readRawBytes()));
    }

    setVector(rect: flash.geom.Rectangle, inputVector: Uint32Vector): void {
      this._putPixelData(rect, inputVector._view());
    }

    threshold(sourceBitmapData: flash.display.BitmapData, sourceRect: flash.geom.Rectangle, destPoint: flash.geom.Point, operation: string, threshold: number /*uint*/, color: number /*uint*/ = 0, mask: number /*uint*/ = 4294967295, copySource: boolean = false): number /*uint*/ {
      sourceBitmapData = sourceBitmapData; sourceRect = sourceRect; destPoint = destPoint; operation = asCoerceString(operation); threshold = threshold >>> 0; color = color >>> 0; mask = mask >>> 0; copySource = !!copySource;
      notImplemented("public flash.display.BitmapData::threshold"); return;
    }

    lock(): void {
      this._locked = true;
    }

    unlock(changeRect: flash.geom.Rectangle = null): void {
      //changeRect = changeRect;
      this._locked = false;
    }

    histogram(hRect: flash.geom.Rectangle = null): ASVector<any> {
      hRect = hRect;
      notImplemented("public flash.display.BitmapData::histogram"); return;
    }
    encode(rect: flash.geom.Rectangle, compressor: ASObject, byteArray: flash.utils.ByteArray = null): flash.utils.ByteArray {
      rect = rect; compressor = compressor; byteArray = byteArray;
      notImplemented("public flash.display.BitmapData::encode"); return;
    }
  }

  export interface IBitmapDataSerializer {
    cacheAsBitmap(bitmapData: flash.display.BitmapData, source: flash.display.IBitmapDrawable, matrix: flash.geom.Matrix, colorTransform: flash.geom.ColorTransform, blendMode: string, clipRect: flash.geom.Rectangle, smoothing: boolean);
  }
}
