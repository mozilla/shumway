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

package flash.events {
[native(cls='HTTPStatusEventClass')]
public class HTTPStatusEvent extends Event {
  public static const HTTP_STATUS:String = "httpStatus";
  public static const HTTP_RESPONSE_STATUS:String = "httpResponseStatus";

  public function HTTPStatusEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false,
                                  status:int = 0)
  {
    super(type, bubbles, cancelable);
    this._setStatus(status);
  }
  private native function _setStatus(value:int): void;
  public native function get status():int;

  public override native function clone():Event;
  public override native function toString():String;
}
}
