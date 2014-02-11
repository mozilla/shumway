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
import flash.events.EventDispatcher;

[native(cls='ShaderJobClass')]
public class ShaderJob extends EventDispatcher {
  public function ShaderJob(shader:Shader = null, target:Object = null, width:int = 0,
                            height:int = 0)
  {
    if (shader) {
      this.shader = shader;
    }
    if (target) {
      this.target = target;
    }
    this.width = width;
    this.height = height;
  }
  public native function get shader():Shader;
  public native function set shader(s:Shader):void;
  public native function get target():Object;
  public native function set target(s:Object):void;
  public native function get width():int;
  public native function set width(v:int):void;
  public native function get height():int;
  public native function set height(v:int):void;
  public native function get progress():Number;
  public native function start(waitForCompletion:Boolean = false):void;
  public native function cancel():void;
}
}
