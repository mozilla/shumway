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
  import flash.display.BitmapData;
  import flash.geom.Point;

  [native(cls='DisplacementMapFilterClass')]
  public final class DisplacementMapFilter extends BitmapFilter
  {
    public native function DisplacementMapFilter(mapBitmap: BitmapData = null, mapPoint: Point = null,
                                                 componentX: uint = 0, componentY: uint = 0,
                                                 scaleX: Number = 0, scaleY: Number = 0,
                                                 mode: String = "wrap", color: uint = 0, alpha: Number = 0);
    public native function get mapBitmap(): BitmapData;
    public native function set mapBitmap(value: BitmapData): void;
    public native function get mapPoint(): Point;
    public native function set mapPoint(value: Point): void;
    public native function get componentX(): uint;
    public native function set componentX(value: uint): void;
    public native function get componentY(): uint;
    public native function set componentY(value: uint): void;
    public native function get scaleX(): Number;
    public native function set scaleX(value: Number): void;
    public native function get scaleY(): Number;
    public native function set scaleY(value: Number): void;
    public native function get mode(): String;
    public native function set mode(value: String): void;
    public native function get color(): uint;
    public native function set color(value: uint): void;
    public native function get alpha(): Number;
    public native function set alpha(value: Number): void;
    public native override function clone(): BitmapFilter;
  }
}
