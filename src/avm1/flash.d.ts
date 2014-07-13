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
    class MovieClip extends ASNative {
      _as2SymbolClass;
      _name: string;
      numChildren: number;

      addChildAtDepth(child, depth: number);
    }
    class Loader {}
    class BitmapData extends ASNative {}
    class Bitmap extends ASNative {
      constructor()
    }
    class SimpleButton extends ASNative {}
  }
  module text {
    class TextField extends ASNative {
      getLineMetrics(index: number);

      multiline: boolean;
      wordWrap: boolean;
      text: string;
      width: number;
      textWidth: number;
      textHeight: number;
      defaultTextFormat: TextFormat;
    }
    class TextFormat extends ASNative {}
  }
}

declare module Shumway.Timeline {
  class BitmapSymbol {}
}
