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

package flash.geom {

  [native(cls='ColorTransformClass')]
  public class ColorTransform {

    public native function set redMultiplier(redMultiplier:Number);
    public native function get redMultiplier():Number;
    public native function set greenMultiplier(greenMultiplier:Number);
    public native function get greenMultiplier():Number;
    public native function set blueMultiplier(blueMultiplier:Number);
    public native function get blueMultiplier():Number;
    public native function set alphaMultiplier(alphaMultiplier:Number);
    public native function get alphaMultiplier():Number;
    public native function set redOffset(redOffset:Number);
    public native function get redOffset():Number;
    public native function set greenOffset(greenOffset:Number);
    public native function get greenOffset():Number;
    public native function set blueOffset(blueOffset:Number);
    public native function get blueOffset():Number;
    public native function set alphaOffset(alphaOffset:Number);
    public native function get alphaOffset():Number;

    public native function ColorTransform(redMultiplier:Number = 1, greenMultiplier:Number = 1, blueMultiplier:Number = 1, alphaMultiplier:Number = 1, redOffset:Number = 0, greenOffset:Number = 0, blueOffset:Number = 0, alphaOffset:Number = 0);
    public native function get color():uint;
    public native function set color(newColor:uint):void;
    public native function concat(second:ColorTransform):void;
    public native function toString():String;
  }
}
