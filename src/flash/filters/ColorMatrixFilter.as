/*
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package flash.filters {

[native(cls='ColorMatrixFilterClass')]
public final class ColorMatrixFilter extends BitmapFilter {
  public function ColorMatrixFilter(matrix: Array = null) {
    if (matrix) {
      this.matrix = matrix;
    }
  }
  public native function get matrix(): Array;
  public native function set matrix(value: Array): void;
  public override function clone(): BitmapFilter {
    return new ColorMatrixFilter(matrix);
  }
}
}
