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

package flash.filters
{
  [native(cls='ConvolutionFilterClass')]
  public class ConvolutionFilter extends BitmapFilter
  {
    public native function ConvolutionFilter(matrixX: Number = 0, matrixY: Number = 0, matrix: Array = null,
                                             divisor: Number = 1, bias: Number = 0,
                                             preserveAlpha: Boolean = true, clamp: Boolean = true,
                                             color: uint = 0, alpha: Number = 0);
    public native function get matrix(): Array;
    public native function set matrix(value: Array): void;
    public native function get matrixX(): Number;
    public native function set matrixX(value: Number): void;
    public native function get matrixY(): Number;
    public native function set matrixY(value: Number): void;
    public native function get divisor(): Number;
    public native function set divisor(value: Number): void;
    public native function get bias(): Number;
    public native function set bias(value: Number): void;
    public native function get preserveAlpha(): Boolean;
    public native function set preserveAlpha(value: Boolean): void;
    public native function get clamp(): Boolean;
    public native function set clamp(value: Boolean): void;
    public native function get color(): uint;
    public native function set color(value: uint): void;
    public native function get alpha(): Number;
    public native function set alpha(value: Number): void;
    public native override function clone(): BitmapFilter;
  }
}
