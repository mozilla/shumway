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
public class HTTPStatusEvent extends Event {
  public static const HTTP_STATUS:String = "httpStatus";
  public static const HTTP_RESPONSE_STATUS:String = "httpResponseStatus";
  private var _status:int;
  private var _responseURL: String;
  private var _responseHeaders: Array;
  public function HTTPStatusEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false,
                                  status:int = 0)
  {
    super(type, bubbles, cancelable);
    _status = status;
  }
  public function get status():int {
    return _status;
  }
  public function get responseURL():String {
    return _responseURL;
  }
  public function set responseURL(value:String):void {
    _responseURL = value;
  }
  public function get responseHeaders():Array {
    return _responseHeaders;
  }
  public function set responseHeaders(value:Array):void {
    _responseHeaders = value;
  }
  public override function clone():Event {
    var event:HTTPStatusEvent = new HTTPStatusEvent(type, bubbles, cancelable, status);
    event.responseURL = responseURL;
    event.responseHeaders = responseHeaders;
    return event;
  }
  public override function toString():String {
    return formatToString('HTTPStatusEvent', 'type', 'bubbles', 'cancelable', 'eventPhase',
                          'status', 'responseURL', 'responseHeaders');
  }
}
}
