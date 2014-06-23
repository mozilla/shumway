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

package flash.display {
[native(cls='BitmapClass')]
public class Bitmap extends DisplayObject {
  public native function Bitmap(bitmapData:BitmapData = null, pixelSnapping:String = "auto", smoothing:Boolean = false)
  public native function get pixelSnapping():String;
  public native function set pixelSnapping(value:String):void;
  public native function get smoothing():Boolean;
  public native function set smoothing(value:Boolean):void;
  public native function get bitmapData():BitmapData;
  public native function set bitmapData(value:BitmapData):void;
}
}
