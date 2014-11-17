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
  import RGBAToARGB = Shumway.ColorUtilities.RGBAToARGB;
  import tableLookupUnpremultiplyARGB = Shumway.ColorUtilities.tableLookupUnpremultiplyARGB;
  import blendPremultipliedBGRA = Shumway.ColorUtilities.blendPremultipliedBGRA;
  import indexOf = Shumway.ArrayUtilities.indexOf;

  import Rectangle = flash.geom.Rectangle;

  /**
   * Holds blobs of bitmap data in various formats and lets you do basic pixel operations. When data is
   * unpacked, it is stored as premultiplied ARGB since it's what the SWF encodes bitmaps as.  This way
   * we don't have to do unecessary byte conversions.
   */
  export class BitmapData extends ASNative implements IBitmapDrawable, Shumway.Remoting.IRemotable {

    static classInitializer: any = function () {
      // ...
    };

    _symbol: Shumway.Timeline.BitmapSymbol;
    static initializer: any = function (symbol: Shumway.Timeline.BitmapSymbol) {
      this._symbol = symbol;
    };

    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null; // ["rect"];

    static MAXIMUM_WIDTH: number = 8191;
    static MAXIMUM_HEIGHT: number = 8191;
    static MAXIMUM_DIMENSION: number = 16777215;

    constructor(width: number /*int*/, height: number /*int*/, transparent: boolean = true,
                fillColorARGB: number /*uint*/ = 4294967295) {
      width = width | 0;
      height = height | 0;
      fillColorARGB = fillColorARGB | 0;
      false && super();
      this._id = flash.display.DisplayObject.getNextSyncID();
      if (this._symbol) {
        width = this._symbol.width;
        height = this._symbol.height;
      }
      if (width > BitmapData.MAXIMUM_WIDTH || width <= 0 ||
          height > BitmapData.MAXIMUM_HEIGHT || height <= 0 ||
          width * height > BitmapData.MAXIMUM_DIMENSION) {
        throwError('ArgumentError', Errors.InvalidBitmapData);
      }
      this._bitmapReferrers = [];
      this._transparent = !!transparent;
      this._rect = new Rectangle(0, 0, width, height);
      if (this._symbol) {
        //var canvas: HTMLCanvasElement = document.createElement('canvas');
        //canvas.width = width;
        //canvas.height = height;
        //var context = canvas.getContext('2d');
        //context.drawImage(this._symbol.image, 0, 0);
        //this._symbol.data = new Uint8Array(context.getImageData(0, 0, width, height).data;
        //this._symbol.image = null;
        this._data = new Uint8Array(this._symbol.data);
        this._type = this._symbol.type;
        if (this._type === ImageType.PremultipliedAlphaARGB ||
            this._type === ImageType.StraightAlphaARGB ||
            this._type === ImageType.StraightAlphaRGBA) {
          this._view = new Int32Array(this._data.buffer);
        }
        this._solidFillColorPBGRA = null;
      } else {
        this._data = new Uint8Array(width * height * 4);
        this._view = new Int32Array(this._data.buffer);
        this._type = ImageType.PremultipliedAlphaARGB;
        var alpha = fillColorARGB >> 24;
        if (alpha === 0 && transparent) {
          // No need to do an initial fill since this would all be zeros anyway.
          this._solidFillColorPBGRA = 0;
        } else {
          this.fillRect(this._rect, fillColorARGB);
        }
      }
      this._dataBuffer = DataBuffer.FromArrayBuffer(this._data.buffer);
      this._invalidate();
    }

    /**
     * Back references to Bitmaps that use this BitmapData. These objects need to be marked as dirty
     * when this bitmap data becomes dirty.
     */
    private _bitmapReferrers: flash.display.Bitmap [];

    _addBitmapReferrer(bitmap: flash.display.Bitmap) {
      var index = indexOf(this._bitmapReferrers, bitmap);
      release || assert(index < 0);
      this._bitmapReferrers.push(bitmap);
    }

    _removeBitmapReferrer(bitmap: flash.display.Bitmap) {
      var index = indexOf(this._bitmapReferrers, bitmap);
      release || assert(index >= 0);
      this._bitmapReferrers[index] = null;
    }

    /**
     * Called whenever the contents of this bitmap data changes.
     */
    private _invalidate() {
      if (this._isDirty) {
        return;
      }
      this._isDirty = true;
      this._isRemoteDirty = false;
      // TODO: We probably don't need to propagate any flags if |_locked| is true.
      for (var i = 0; i < this._bitmapReferrers.length; i++) {
        var bitmap = this._bitmapReferrers[i];
        if (bitmap) {
          bitmap._setDirtyFlags(DisplayObjectFlags.DirtyBitmapData);
        }
      }
    }

    _transparent: boolean;
    _rect: flash.geom.Rectangle;

    _id: number;
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

    /**
     * Indicates whether this bitmap data's data buffer has changed on the remote end and needs to be read
     * back before any pixel operations can be performed.
     */
    _isRemoteDirty: boolean;


    /**
     * If non-null then this value indicates that the bitmap is filled with a solid color. This is useful
     * for optimizations.
     */
    _solidFillColorPBGRA: any; // any | number;

    /**
     * Pool of temporary rectangles that is used to prevent allocation. We don't need more than 3 for now.
     */
    private static _temporaryRectangles: Rectangle [] = [
      new flash.geom.Rectangle(),
      new flash.geom.Rectangle(),
      new flash.geom.Rectangle()
    ];

    private _getTemporaryRectangleFrom(rect: Rectangle, index: number = 0): Rectangle {
      release || assert (index >= 0 && index < BitmapData._temporaryRectangles.length);
      var r = BitmapData._temporaryRectangles[index];
      if (rect) {
        r.copyFrom(rect);
      }
      return r;
    }

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
      var r = this._getTemporaryRectangleFrom(this._rect).intersectInPlace(rect);
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
      var r = this._getTemporaryRectangleFrom(this._rect).intersectInPlace(rect);
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
      this._invalidate();
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
      somewhatImplemented("public flash.display.BitmapData::clone");
      // This should be coping the buffer not the view.
      var bd = new BitmapData(this._rect.width, this._rect.height, this._transparent,
                              this._solidFillColorPBGRA);
      bd._view.set(this._view);
      return bd;
    }

    /**
     * Returns an straight alpha RGB pixel value 0x00RRGGBB.
     */
    getPixel(x: number /*int*/, y: number /*int*/): number /*uint*/ {
      x = x | 0;
      y = y | 0;
      return this.getPixel32(x, y) & 0x00ffffff;
    }

    /**
     * Returns an straight alpha ARGB pixel value 0xAARRGGBB.
     */
    getPixel32(x: number /*int*/, y: number /*int*/): number /*uint*/ {
      x = x | 0;
      y = y | 0;
      if (!this._rect.contains(x, y)) {
        return 0;
      }
      this._ensureBitmapData();
      var value = this._view[y * this._rect.width + x];
      switch (this._type) {
        case ImageType.PremultipliedAlphaARGB:
          var pARGB = swap32(value);
          var uARGB = unpremultiplyARGB(pARGB);
          return uARGB >>> 0;
        case ImageType.StraightAlphaRGBA:
          return RGBAToARGB(swap32(value));
        default:
          Shumway.Debug.notImplemented(ImageType[this._type]);
          return 0;
      }
    }

    setPixel(x: number /*int*/, y: number /*int*/, uARGB: number /*uint*/): void {
      x = x | 0;
      y = y | 0;
      uARGB = uARGB | 0;
      if (!this._rect.contains(x, y)) {
        return;
      }
      this._ensureBitmapData();
      var i = y * this._rect.width + x;
      var a = this._view[i] & 0xff;
      uARGB = uARGB & 0x00ffffff | a << 24;
      var pARGB = premultiplyARGB(uARGB);
      this._view[i] = swap32(pARGB);
      this._invalidate();
      this._solidFillColorPBGRA = null;
    }

    setPixel32(x: number /*int*/, y: number /*int*/, uARGB: number /*uint*/): void {
      x = x | 0;
      y = y | 0;
      if (!this._rect.contains(x, y)) {
        return;
      }
      this._ensureBitmapData();
      var a = uARGB >>> 24;
      var uRGB = uARGB & 0x00ffffff;
      if (this._transparent) {
        var uARGB = uRGB | a << 24;
        var pARGB = premultiplyARGB(uARGB);
      } else {
        var pARGB = uRGB | 0xff000000;
      }
      this._view[y * this._rect.width + x] = swap32(pARGB);
      this._invalidate();
      this._solidFillColorPBGRA = null;
    }

    applyFilter(sourceBitmapData: flash.display.BitmapData, sourceRect: flash.geom.Rectangle,
                destPoint: flash.geom.Point, filter: flash.filters.BitmapFilter): void {
      sourceBitmapData = sourceBitmapData;
      sourceRect = sourceRect;
      destPoint = destPoint;
      filter = filter;
      somewhatImplemented("public flash.display.BitmapData::applyFilter " + filter);
      return;
    }

    colorTransform(rect: flash.geom.Rectangle, colorTransform: flash.geom.ColorTransform): void {
      rect = rect;
      colorTransform = colorTransform;
      somewhatImplemented("public flash.display.BitmapData::colorTransform");
      return;
    }

    compare(otherBitmapData: flash.display.BitmapData): ASObject {
      otherBitmapData = otherBitmapData;
      notImplemented("public flash.display.BitmapData::compare");
      return;
    }

    copyChannel(sourceBitmapData: flash.display.BitmapData, sourceRect: flash.geom.Rectangle,
                destPoint: flash.geom.Point, sourceChannel: number /*uint*/, destChannel: number
                /*uint*/): void {
      sourceBitmapData = sourceBitmapData;
      sourceRect = sourceRect;
      destPoint = destPoint;
      sourceChannel = sourceChannel >>> 0;
      destChannel = destChannel >>> 0;
      notImplemented("public flash.display.BitmapData::copyChannel");
      return;
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
      mergeAlpha = !!mergeAlpha;

      if (alphaBitmapData || alphaPoint) {
        notImplemented("public flash.display.BitmapData::copyPixels - Alpha");
        return;
      }

      // Deal with fractional pixel coordinates, looks like Flash "rounds" the corners of
      // the source rect, however a width of |0.5| rounds down rather than up so we're not
      // quite correct here.
      var sRect = this._getTemporaryRectangleFrom(sourceRect, 0).roundInPlace();

      var tBRect = this._rect;
      var sBRect = sourceBitmapData._rect;

      // Clip sRect against SBRect.
      var sL = Math.max(sRect.x, 0);
      var sT = Math.max(sRect.y, 0);
      var sR = Math.min(sRect.x + sRect.width, sBRect.width);
      var sB = Math.min(sRect.y + sRect.height, sBRect.height);

      // Compute source rect offsets (in case the source rect had negative x, y coordinates).
      var oX = sL - sRect.x ;
      var oY = sT - sRect.y;

      var tL = destPoint.x | 0 + oX;
      var tT = destPoint.y | 0 + oY;

      if (tL < 0) {
        sL -= tL;
        tL = 0;
      }

      if (tT < 0) {
        sT -= tT;
        tT = 0;
      }

      var tW = Math.min(sR - sL, tBRect.width - tL);
      var tH = Math.min(sB - sT, tBRect.height - tT);

      if (tW <= 0 || tH <= 0) {
        return;
      }

      var sX = sL;
      var sY = sT;

      var tX = tL;
      var tY = tT;

      var sStride = sourceBitmapData._rect.width;
      var tStride = this._rect.width;

      this._ensureBitmapData();
      sourceBitmapData._ensureBitmapData();

      var s = sourceBitmapData._view;
      var t = this._view;

      if (sourceBitmapData._type !== this._type) {
        somewhatImplemented("public flash.display.BitmapData::copyPixels - Color Format Conversion");
      }

      if (mergeAlpha && this._type !== ImageType.PremultipliedAlphaARGB) {
        notImplemented("public flash.display.BitmapData::copyPixels - Merge Alpha");
        return;
      }

      // No reason to copy pixels since since both source and target are the same solid fill, regardless
      // of alpha blending. (TODO: I think the math works out for mergeAlpha also.)
      if (this._solidFillColorPBGRA !== null &&
          this._solidFillColorPBGRA === sourceBitmapData._solidFillColorPBGRA) {
        return;
      }

      // Source has a solid fill but is fully opaque, we can get away without alpha blending here.
      if (sourceBitmapData._solidFillColorPBGRA !== null &&
          (sourceBitmapData._solidFillColorPBGRA & 0xFF) === 0xFF) {
        mergeAlpha = false;
      }

      // Finally do the copy. All the math above is needed just so we don't do any branches inside
      // this hot loop.

      if (mergeAlpha) {
        this._copyPixelsAndMergeAlpha(s, sX, sY, sStride, t, tX, tY, tStride, tW, tH);
      } else {
        var sP = (sY * sStride + sX) | 0;
        var tP = (tY * tStride + tX) | 0;
        if ((tW & 3) === 0) {
          for (var y = 0; y < tH; y = y + 1 | 0) {
            for (var x = 0; x < tW; x = x + 4 | 0) {
              t[(tP + x + 0) | 0] = s[(sP + x + 0) | 0];
              t[(tP + x + 1) | 0] = s[(sP + x + 1) | 0];
              t[(tP + x + 2) | 0] = s[(sP + x + 2) | 0];
              t[(tP + x + 3) | 0] = s[(sP + x + 3) | 0];
            }
            sP = sP + sStride | 0;
            tP = tP + tStride | 0;
          }
        } else {
          for (var y = 0; y < tH; y = y + 1 | 0) {
            for (var x = 0; x < tW; x = x + 1 | 0) {
              t[tP + x | 0] = s[sP + x | 0];
            }
            sP = sP + sStride | 0;
            tP = tP + tStride | 0;
          }
        }
      }

      this._solidFillColorPBGRA = null;
      this._invalidate();
    }

    private _copyPixelsAndMergeAlpha(s: Int32Array, sX: number, sY: number, sStride: number,
                                     t: Int32Array, tX: number, tY: number, tStride: number, tW: number, tH: number) {
      var sP = (sY * sStride + sX) | 0;
      var tP = (tY * tStride + tX) | 0;
      for (var y = 0; y < tH; y = y + 1 | 0) {
        for (var x = 0; x < tW; x = x + 1 | 0) {
          var spBGRA = s[sP + x | 0];
          var sA = spBGRA & 0xff;
          // Optimize for the case where the source pixel is fully opaque or transparent. This
          // pays off if the source image has many such pixels but slows down the normal case.
          if (sA === 0xff) {
            t[tP + x | 0] = spBGRA; // Opaque, just copy value over.
          } else if (sA === 0) {
            // Transparent, don't do anything.
          } else {
            // Compute the blending equation: src.rgb + (dst.rgb * (1 - src.a)). The trick here
            // is to compute GA and BR at the same time without pulling apart each channel.
            // We use the "double blend trick" (http://stereopsis.com/doubleblend.html) to
            // compute GA and BR without unpacking them.
            var sGA = spBGRA      & 0x00ff00ff;
            var sBR = spBGRA >> 8 & 0x00ff00ff;
            var tpBGRA = t[tP + x | 0];
            var tGA = tpBGRA      & 0x00ff00ff;
            var tBR = tpBGRA >> 8 & 0x00ff00ff;
            var A = 256 - sA;
            tGA = Math.imul(tGA, A) >> 8;
            tBR = Math.imul(tBR, A) >> 8;
            // TODO: Not sure if target alpha is computed correctly.
            t[tP + x | 0] = ((sBR + tBR & 0x00ff00ff) << 8) | (sGA + tGA & 0x00ff00ff);
          }
        }
        sP = sP + sStride | 0;
        tP = tP + tStride | 0;
      }
    }

    dispose(): void {
      this._rect.setEmpty();
      this._view = null;
      this._invalidate();
    }

    draw(source: flash.display.IBitmapDrawable, matrix: flash.geom.Matrix = null,
         colorTransform: flash.geom.ColorTransform = null, blendMode: string = null,
         clipRect: flash.geom.Rectangle = null, smoothing: boolean = false): void {
      somewhatImplemented("public flash.display.BitmapData::draw");
      var serializer: IBitmapDataSerializer = AVM2.instance.globals['Shumway.Player.Utils'];
      if (matrix) {
        matrix = matrix.clone().toTwipsInPlace();
      }
      serializer.drawToBitmap(this, source, matrix, colorTransform, blendMode, clipRect, smoothing);
      this._isRemoteDirty = true;
    }

    drawWithQuality(source: flash.display.IBitmapDrawable, matrix: flash.geom.Matrix = null,
                    colorTransform: flash.geom.ColorTransform = null, blendMode: string = null,
                    clipRect: flash.geom.Rectangle = null, smoothing: boolean = false,
                    quality: string = null): void {
      source = source;
      matrix = matrix;
      colorTransform = colorTransform;
      blendMode = asCoerceString(blendMode);
      clipRect = clipRect;
      smoothing = !!smoothing;
      quality = asCoerceString(quality);
      notImplemented("public flash.display.BitmapData::drawWithQuality");
      return;
    }

    fillRect(rect: flash.geom.Rectangle, uARGB: number /*uint*/): void {
      if (this._transparent) {
        var pARGB = premultiplyARGB(uARGB);
      } else {
        var pARGB = uARGB | 0xff000000;
      }
      release || assert(this._type === ImageType.PremultipliedAlphaARGB);
      var pBGRA = swap32(pARGB);
      var r = this._getTemporaryRectangleFrom(this._rect).intersectInPlace(rect);
      if (r.isEmpty()) {
        return;
      }
      this._ensureBitmapData();
      // Filling with the same color?
      if (this._solidFillColorPBGRA === pBGRA) {
        return;
      }
      var view = this._view;
      // If we are filling the entire buffer, we can do a little better ~ 25% faster.
      if (r.equals(this._rect)) {
        var length = view.length;
        // Unroll 4 iterations, ~ 5% faster.
        if ((length & 0x3) === 0) {
          for (var i = 0; i < length; i = i + 4 | 0) {
            view[i + 0 | 0] = pBGRA;
            view[i + 1 | 0] = pBGRA;
            view[i + 2 | 0] = pBGRA;
            view[i + 3 | 0] = pBGRA;
          }
        } else {
          for (var i = 0; i < length; i = i + 1 | 0) {
            view[i] = pBGRA;
          }
        }
        this._solidFillColorPBGRA = pBGRA;
      } else {
        var xMin = r.x;
        var xMax = r.x + r.width;
        var yMin = r.y;
        var yMax = r.y + r.height;
        var width = this._rect.width;
        for (var y = yMin; y < yMax; y = y + 1 | 0) {
          var offset = y * width | 0;
          for (var x = xMin; x < xMax; x = x + 1 | 0) {
            view[offset + x | 0] = pBGRA;
          }
        }
        this._solidFillColorPBGRA = null;
      }
      this._invalidate();
    }

    floodFill(x: number /*int*/, y: number /*int*/, color: number /*uint*/): void {
      x = x | 0;
      y = y | 0;
      color = color >>> 0;
      notImplemented("public flash.display.BitmapData::floodFill");
      return;
    }

    generateFilterRect(sourceRect: flash.geom.Rectangle,
                       filter: flash.filters.BitmapFilter): flash.geom.Rectangle {
      sourceRect = sourceRect;
      filter = filter;
      notImplemented("public flash.display.BitmapData::generateFilterRect");
      return;
    }

    getColorBoundsRect(mask: number /*uint*/, color: number /*uint*/,
                       findColor: boolean = true): flash.geom.Rectangle {
      mask = mask >>> 0;
      color = color >>> 0;
      findColor = !!findColor;
      notImplemented("public flash.display.BitmapData::getColorBoundsRect");
      return;
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

    hitTest(firstPoint: flash.geom.Point, firstAlphaThreshold: number /*uint*/,
            secondObject: ASObject,
            secondBitmapDataPoint: flash.geom.Point = null,
            secondAlphaThreshold: number /*uint*/ = 1): boolean {
      firstPoint = firstPoint;
      firstAlphaThreshold = firstAlphaThreshold >>> 0;
      secondObject = secondObject;
      secondBitmapDataPoint = secondBitmapDataPoint;
      secondAlphaThreshold = secondAlphaThreshold >>> 0;
      notImplemented("public flash.display.BitmapData::hitTest");
      return;
    }

    merge(sourceBitmapData: flash.display.BitmapData, sourceRect: flash.geom.Rectangle,
          destPoint: flash.geom.Point, redMultiplier: number /*uint*/, greenMultiplier: number
          /*uint*/, blueMultiplier: number /*uint*/, alphaMultiplier: number /*uint*/): void {
      sourceBitmapData = sourceBitmapData;
      sourceRect = sourceRect;
      destPoint = destPoint;
      redMultiplier = redMultiplier >>> 0;
      greenMultiplier = greenMultiplier >>> 0;
      blueMultiplier = blueMultiplier >>> 0;
      alphaMultiplier = alphaMultiplier >>> 0;
      somewhatImplemented("public flash.display.BitmapData::merge");
    }

    noise(randomSeed: number /*int*/, low: number /*uint*/ = 0, high: number /*uint*/ = 255,
          channelOptions: number /*uint*/ = 7, grayScale: boolean = false): void {
      randomSeed = randomSeed | 0;
      low = low >>> 0;
      high = high >>> 0;
      channelOptions = channelOptions >>> 0;
      grayScale = !!grayScale;
      somewhatImplemented("public flash.display.BitmapData::noise");
    }

    paletteMap(sourceBitmapData: flash.display.BitmapData, sourceRect: flash.geom.Rectangle,
               destPoint: flash.geom.Point, redArray: any [] = null, greenArray: any [] = null,
               blueArray: any [] = null, alphaArray: any [] = null): void {
      sourceBitmapData = sourceBitmapData;
      sourceRect = sourceRect;
      destPoint = destPoint;
      redArray = redArray;
      greenArray = greenArray;
      blueArray = blueArray;
      alphaArray = alphaArray;
      somewhatImplemented("public flash.display.BitmapData::paletteMap");
    }

    perlinNoise(baseX: number, baseY: number, numOctaves: number /*uint*/, randomSeed: number
                /*int*/,
                stitch: boolean, fractalNoise: boolean, channelOptions: number /*uint*/ = 7,
                grayScale: boolean = false, offsets: any [] = null): void {
      baseX = +baseX;
      baseY = +baseY;
      numOctaves = numOctaves >>> 0;
      randomSeed = randomSeed | 0;
      stitch = !!stitch;
      fractalNoise = !!fractalNoise;
      channelOptions = channelOptions >>> 0;
      grayScale = !!grayScale;
      offsets = offsets;
      somewhatImplemented("public flash.display.BitmapData::perlinNoise");
    }

    pixelDissolve(sourceBitmapData: flash.display.BitmapData, sourceRect: flash.geom.Rectangle,
                  destPoint: flash.geom.Point, randomSeed: number /*int*/ = 0,
                  numPixels: number /*int*/ = 0, fillColor: number /*uint*/ = 0): number /*int*/ {
      sourceBitmapData = sourceBitmapData;
      sourceRect = sourceRect;
      destPoint = destPoint;
      randomSeed = randomSeed | 0;
      numPixels = numPixels | 0;
      fillColor = fillColor >>> 0;
      notImplemented("public flash.display.BitmapData::pixelDissolve");
      return;
    }

    scroll(x: number /*int*/, y: number /*int*/): void {
      x = x | 0;
      y = y | 0;
      notImplemented("public flash.display.BitmapData::scroll");
      return;
    }

    setPixels(rect: flash.geom.Rectangle, inputByteArray: flash.utils.ByteArray): void {
      this._putPixelData(rect, new Int32Array(inputByteArray.readRawBytes()));
    }

    setVector(rect: flash.geom.Rectangle, inputVector: Uint32Vector): void {
      this._putPixelData(rect, inputVector._view());
    }

    threshold(sourceBitmapData: flash.display.BitmapData, sourceRect: flash.geom.Rectangle,
              destPoint: flash.geom.Point, operation: string, threshold: number /*uint*/,
              color: number /*uint*/ = 0, mask: number /*uint*/ = 4294967295,
              copySource: boolean = false): number /*uint*/ {
      sourceBitmapData = sourceBitmapData;
      sourceRect = sourceRect;
      destPoint = destPoint;
      operation = asCoerceString(operation);
      threshold = threshold >>> 0;
      color = color >>> 0;
      mask = mask >>> 0;
      copySource = !!copySource;
      notImplemented("public flash.display.BitmapData::threshold");
      return;
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
      notImplemented("public flash.display.BitmapData::histogram");
      return;
    }

    encode(rect: flash.geom.Rectangle, compressor: ASObject,
           byteArray: flash.utils.ByteArray = null): flash.utils.ByteArray {
      rect = rect;
      compressor = compressor;
      byteArray = byteArray;
      notImplemented("public flash.display.BitmapData::encode");
      return;
    }

    /**
     * Ensures that we have the most up-to-date version of the bitmap data. If a call to |BitmpaData.draw|
     * call was made since the last time this method was called, then we need to send a synchronous message
     * to the GFX remote requesting the latest image data.
     *
     * Here we also normalize the image format to |ImageType.StraightAlphaRGBA|. We only need the normalized
     * pixel data for pixel operations, so we defer image decoding as late as possible.
     */
    private _ensureBitmapData() {
      var oldData = this._data;

      if (this._isRemoteDirty) {
        var serializer = Shumway.AVM2.Runtime.AVM2.instance.globals['Shumway.Player.Utils'];
        var data = serializer.requestBitmapData(this);
        this._data = new Uint8Array(data.getBytes());
        this._type = ImageType.StraightAlphaRGBA;
        this._view = new Int32Array(this._data.buffer);
        this._isRemoteDirty = false;
        this._isDirty = false;
        this._solidFillColorPBGRA = null;
      }

      switch (this._type) {
        case ImageType.PNG:
        case ImageType.JPEG:
        case ImageType.GIF:
          Shumway.Debug.somewhatImplemented("Image conversion " + ImageType[this._type] + " -> " + ImageType[ImageType.PremultipliedAlphaARGB]);
          break;
        default:
          if (this._type !== ImageType.PremultipliedAlphaARGB) {
            var tempData = new Uint8Array(this._rect.width * this._rect.height * 4);
            var tempView = new Int32Array(tempData.buffer);
            ColorUtilities.convertImage(this._type, ImageType.PremultipliedAlphaARGB, this._view, tempView);
            this._data = tempData;
            this._view = tempView;
            this._type = ImageType.PremultipliedAlphaARGB;
            this._solidFillColorPBGRA = null;
          }
      }

      // Let's not crash, so fill in a random color.
      if (this._type !== ImageType.PremultipliedAlphaARGB) {
        this._data = new Uint8Array(this._rect.width * this._rect.height * 4);
        this._view = new Int32Array(this._data.buffer);
        this._type = ImageType.PremultipliedAlphaARGB;
        this._fillWithDebugData();
        this._solidFillColorPBGRA = null;
      }

      if (oldData !== this._data) {
        this._dataBuffer = DataBuffer.FromArrayBuffer(this._data.buffer);
      }
    }

    private _fillWithDebugData() {
      var view = this._view;
      var length = view.length;
      var pBGRA = swap32(0xFFFF69B4);
      var w = this._rect.width;
      var h = this._rect.height;
      var i = 0;
      for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
          view[i++] = swap32(premultiplyARGB(0xAA << 24 | (y & 0xFF) << 16 | (x & 0xFF) << 8 | 0xFF));
        }
      }
    }
  }


  export interface IBitmapDataSerializer {
    drawToBitmap(bitmapData: flash.display.BitmapData, source: flash.display.IBitmapDrawable,
                 matrix: flash.geom.Matrix, colorTransform: flash.geom.ColorTransform,
                 blendMode: string, clipRect: flash.geom.Rectangle, smoothing: boolean);
  }
}
