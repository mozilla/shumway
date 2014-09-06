/**
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

package avm1lib {
import flash.display.BitmapData;
import flash.display.IBitmapDrawable;
import flash.geom.ColorTransform;
import flash.geom.Matrix;
import flash.geom.Rectangle;

[native(cls="AVM1BitmapData")]
public dynamic class AVM1BitmapData extends BitmapData {
  public function AVM1BitmapData(width:int, height:int, transparent:Boolean = true,
                                       fillColor:uint = 4294967295)
  {
    super(width, height, transparent, fillColor);
  }

  public override function draw(source:IBitmapDrawable,
                                matrix:Matrix = null,
                                colorTransform:ColorTransform = null,
                                blendMode:String = null, clipRect:Rectangle = null,
                                smoothing:Boolean = false):void
  {
    if (source is AVM1MovieClip) {
      source = AVM1MovieClip(source)._as3Object;
    }
    super.draw(source, matrix, colorTransform, blendMode, clipRect, smoothing);
  }

  public static native function loadBitmap(id: String): BitmapData;
}
}
