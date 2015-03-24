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
// Class: AntiAliasType
module Shumway.AVMX.AS.flash.text {
  export class AntiAliasType extends ASObject {

    static classInitializer: any = null;
    static initializer: any = null;
    static classSymbols : string [] = null;
    static instanceSymbols: string [] = null;

    constructor() {
      super();
    }

    // JS -> AS Bindings
    static NORMAL: string = "normal";
    static ADVANCED: string = "advanced";

    static fromNumber(n: number): string {
      switch (n) {
        case 1:
          return AntiAliasType.NORMAL;
        case 2:
          return AntiAliasType.ADVANCED;
        default:
          return null;
      }
    }

    static toNumber(value: string): number {
      switch (value) {
        case AntiAliasType.NORMAL:
          return 1;
        case AntiAliasType.ADVANCED:
          return 2;
        default:
          return -1;
      }
    }
  }
}
