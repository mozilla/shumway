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
  import asCoerceString = Shumway.AVMX.asCoerceString;

  export class AVM1BitmapData extends flash.display.BitmapData {
    static createAVM1Class(): typeof AVM1BitmapData {
      var wrapped = AVM1Proxy.wrap(AVM1BitmapData, null);
      wrapped.axSetPublicProperty('loadBitmap', AVM1BitmapData.loadBitmap);
      return wrapped;
    }

    static loadBitmap(symbolId: string): flash.display.BitmapData {
      symbolId = asCoerceString(symbolId);
      var symbol = AVM1Context.instance.getAsset(symbolId);
      if (symbol && symbol.symbolProps instanceof flash.display.BitmapSymbol) {
        var bitmap = (<any>AVM1BitmapData).initializeFrom(symbol); // REDUX
        bitmap.class.instanceConstructorNoInitialize.call(bitmap);
        return bitmap;
      }
      return null;
    }
  }
}