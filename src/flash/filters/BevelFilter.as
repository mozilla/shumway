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
  [native(cls='BevelFilterClass')]
  public final class BevelFilter extends BitmapFilter
  {
    public native function BevelFilter(distance: Number = 4, angle: Number = 45,
                                       highlightColor: uint = 16777215, highlightAlpha: Number = 1,
                                       shadowColor: uint = 0, shadowAlpha: Number = 1, blurX: Number = 4,
                                       blurY: Number = 4, strength: Number = 1, quality: int = 1,
                                       type: String = "inner", knockout: Boolean = false);
    public native function get distance(): Number;
    public native function set distance(value: Number): void;
    public native function get angle(): Number;
    public native function set angle(value: Number): void;
    public native function get highlightColor(): uint;
    public native function set highlightColor(value: uint): void;
    public native function get highlightAlpha(): Number;
    public native function set highlightAlpha(value: Number): void;
    public native function get shadowColor(): uint;
    public native function set shadowColor(value: uint): void;
    public native function get shadowAlpha(): Number;
    public native function set shadowAlpha(value: Number): void;
    public native function get blurX(): Number;
    public native function set blurX(value: Number): void;
    public native function get blurY(): Number;
    public native function set blurY(value: Number): void;
    public native function get knockout(): Boolean;
    public native function set knockout(value: Boolean): void;
    public native function get quality(): int;
    public native function set quality(value: int): void;
    public native function get strength(): Number;
    public native function set strength(value: Number): void;
    public native function get type(): String;
    public native function set type(value: String): void;
    public native override function clone(): BitmapFilter;
  }
}
