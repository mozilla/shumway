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

package flash.net {
[native(cls="URLRequestClass")]
public final class URLRequest {
  public function URLRequest(url:String = null) {
    this.requestHeaders = [];
    this.url = url;
  }
  public native function get url():String;
  public native function set url(value:String):void;
  public native function get data():Object;
  public native function set data(value:Object):void;
  public native function get method():String;
  public function set method(value:String):void {
    if (value !== 'get' && value !== 'GET' && value !== 'post' && value !== 'POST') {
      Error.throwError(ArgumentError, 2004)
    }
    setMethod(value);
  }
  public native function get contentType():String;
  public native function set contentType(value:String):void;
  public native function get requestHeaders():Array;
  public function set requestHeaders(value:Array):void {
    setRequestHeaders(value);
  }
  public native function get digest():String;
  public native function set digest(value:String):void;

  private native function setMethod(value:String);
  private native function setRequestHeaders(value:Array);
}
}
