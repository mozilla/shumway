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

[native(cls='ShaderInputClass')]
public final dynamic class ShaderInput {
  public function ShaderInput() {}
  public native function get input():Object;
  public native function set input(input:Object):void;
  public native function get width():int;
  public native function set width(value:int):void;
  public native function get height():int;
  public native function set height(value:int):void;
  public native function get channels():int;
  public native function get index():int;
}
}
