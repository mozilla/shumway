/*
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *totalMemory
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package flash.system {
[native(cls='SystemClass')]
public final class System {
  public static native function get ime():IME;
  public static native function get totalMemoryNumber():Number;
  public static native function get freeMemory():Number;
  public static native function get privateMemory():Number;
  public static native function get useCodePage():Boolean;
  public static native function set useCodePage(value:Boolean):void;
  public static native function get vmVersion():String;
  public static native function setClipboard(string:String):void;
  public static function get totalMemory():uint {
    return uint(totalMemoryNumber);
  }
  public static native function pause():void;
  public static native function resume():void;
  public static native function exit(code:uint):void;
  public static native function gc():void;
  public static native function pauseForGCIfCollectionImminent(imminence:Number = 0.75):void;
  public static native function disposeXML(node:XML):void;
}
}
