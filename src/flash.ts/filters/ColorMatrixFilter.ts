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
// Class: ColorMatrixFilter
module Shumway.AVM2.AS.flash.filters {

  export class ColorMatrixFilter extends flash.filters.BitmapFilter {

    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // Called whenever an instance of the class is initialized.
    static initializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];

    // List of instance symbols to link.
    static instanceSymbols: string [] = null;

    constructor (matrix: any [] = null) {
      false && super();
      if (matrix) {
        this.matrix = matrix;
      } else {
        this._matrix = [
          1, 0, 0, 0, 0,
          0, 1, 0, 0, 0,
          0, 0, 1, 0, 0,
          0, 0, 0, 1, 0
        ]
      }
    }

    _serialize(message) {
      var matrix: number[] = this._matrix;
      message.ensureAdditionalCapacity((matrix.length + 1) * 4);
      message.writeIntUnsafe(6);
      for (var i: number = 0; i < matrix.length; i++) {
        message.writeFloatUnsafe(matrix[i]);
      }
    }

    // JS -> AS Bindings

    // AS -> JS Bindings

    private _matrix: number [];

    get matrix(): any [] {
      return this._matrix.concat();
    }
    set matrix(value: any []) {
      if (!isNullOrUndefined(value)) {
        var matrix = [
          0, 0, 0, 0, 0,
          0, 0, 0, 0, 0,
          0, 0, 0, 0, 0,
          0, 0, 0, 0, 0
        ];
        for (var i = 0, n = Math.min(value.length, 20); i < n; i++) {
          matrix[i] = toNumber(value[i]);
        }
        this._matrix = matrix;
      } else {
        Runtime.throwError("TypeError", Errors.NullPointerError, "matrix");
      }
    }

    clone(): BitmapFilter {
      return new ColorMatrixFilter(this.matrix);
    }
  }
}
