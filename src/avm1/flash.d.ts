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
    class MovieClip {
      static isType(instance: any): boolean;
      static initializeFrom(symbol: any): MovieClip;
      static instanceConstructorNoInitialize();

      _as2SymbolClass;
      _name: string;
      numChildren: number;

      addChildAtDepth(child, depth: number);
    }
    class Loader {}
    class SimpleButton {
      static isType(instance: any): boolean;
    }
  }
  module text {
    class TextField {
      static isType(instance: any): boolean;

      getLineMetrics(index: number);

      multiline: boolean;
      wordWrap: boolean;
      text: string;
      width: number;
      textWidth: number;
      textHeight: number;
      defaultTextFormat: TextFormat;
    }
    class TextFormat {}
  }
}
