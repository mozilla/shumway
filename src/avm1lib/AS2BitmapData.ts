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
 * limitations undxr the License.
 */

module Shumway.AVM2.AS.avm1lib {
  import BitmapData = Shumway.AVM2.AS.flash.display.BitmapData;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import AS2Context = Shumway.AVM1.AS2Context;

  export class AS2BitmapData extends BitmapData {

    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // Called whenever an instance of the class is initialized.
    static initializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];

    // List of instance symbols to link.
    static instanceSymbols: string [] = null;

    constructor (bitmapData: flash.display.BitmapData, pixelSnapping: string, smoothing: boolean) {
      false && super();
    }

    static loadBitmap(symbolId: string): flash.display.BitmapData {
      symbolId = asCoerceString(symbolId);
      var symbol = AS2Context.instance.getAsset(symbolId);
      if (symbol instanceof Shumway.Timeline.BitmapSymbol) {
        var bitmap = AS2BitmapData.initializeFrom(symbol);
        bitmap.class.instanceConstructorNoInitialize.call(bitmap);
        return bitmap;
      }
      return null;
    }
  }
}
