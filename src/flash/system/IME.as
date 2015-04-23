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

package flash.system {
import flash.events.EventDispatcher;

[native(cls='IMEClass')]
public final class IME extends EventDispatcher {
  public static native function get enabled():Boolean;
  public static native function set enabled(enabled:Boolean):void;
  public static native function get conversionMode():String;
  public static native function set conversionMode(mode:String):void;
  public static native function get isSupported():Boolean;
  public static native function setCompositionString(composition:String):void;
  public static native function doConversion():void;
  public static native function compositionSelectionChanged(start:int, end:int):void;
  public static native function compositionAbandoned():void;
  public function IME() {}
}
}
