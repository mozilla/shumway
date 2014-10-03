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
import avm1lib.AVM1Utils;
import flash.external.ExternalInterface;

public dynamic class AVM1ExternalInterface
{
  public function AVM1ExternalInterface()
  {
  }

  public static function get available():Boolean {
    return ExternalInterface.available;
  }

  public static function addCallback(methodName:String, instance:Object, method:Function):Boolean
  {
    try {
      ExternalInterface.addCallback(methodName, function () {
        return method.apply(instance, arguments);
      });
      return true;
    } catch (e) { }
    return false;
  }

  public static function call(methodName:String):Object
  {
    return ExternalInterface.call.apply(ExternalInterface, arguments);
  }
}
}
