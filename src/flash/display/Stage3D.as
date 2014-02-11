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
import flash.display3D.Context3D;
import flash.events.EventDispatcher;

[native(cls='Stage3DClass')]
public class Stage3D extends EventDispatcher {
  public function Stage3D() {}
  public native function get context3D():Context3D;
  public native function get x():Number;
  public native function set x(value:Number):void;
  public native function get y():Number;
  public native function set y(value:Number):void;
  public native function get visible():Boolean;
  public native function set visible(value:Boolean):void;
  public native function requestContext3D(context3DRenderMode:String = "auto",
                                          profile:String = "baseline"):void;
}
}
