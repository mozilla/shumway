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
import flash.utils.ByteArray;

[native(cls='ShaderClass')]
public class Shader {
  public function Shader(code:ByteArray = null) {}
  public function set byteCode(code:ByteArray):void { notImplemented("byteCode"); }
  public native function get data():ShaderData;
  public native function set data(p:ShaderData):void;
  public native function get precisionHint():String;
  public native function set precisionHint(p:String):void;
}
}
