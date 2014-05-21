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
  [native(cls='GlowFilterClass')]
  public final class GlowFilter extends BitmapFilter
  {
    public native function GlowFilter(color: uint = 16711680, alpha: Number = 1, blurX: Number = 6,
                                      blurY: Number = 6, strength: Number = 2, quality: int = 1,
                                      inner: Boolean = false, knockout: Boolean = false);
    public native function get color(): uint;
    public native function set color(value: uint): void;
    public native function get alpha(): Number;
    public native function set alpha(value: Number): void;
    public native function get blurX(): Number;
    public native function set blurX(value: Number): void;
    public native function get blurY(): Number;
    public native function set blurY(value: Number): void;
    public native function get inner(): Boolean;
    public native function set inner(value: Boolean): void;
    public native function get knockout(): Boolean;
    public native function set knockout(value: Boolean): void;
    public native function get quality(): int;
    public native function set quality(value: int): void;
    public native function get strength(): Number;
    public native function set strength(value: Number): void;
    public native override function clone(): BitmapFilter;
  }
}
