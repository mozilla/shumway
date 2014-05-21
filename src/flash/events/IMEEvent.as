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
import flash.text.ime.IIMEClient;

public class IMEEvent extends TextEvent {
  public static const IME_COMPOSITION:String = "imeComposition";
  public static const IME_START_COMPOSITION:String = "imeStartComposition";
  private var _imeClient:IIMEClient;
  public function IMEEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false,
                           text:String = "", imeClient:IIMEClient = null)
  {
    super(type, bubbles, cancelable, text);
    _imeClient = imeClient;
  }
  public function get imeClient():IIMEClient {
    return _imeClient;
  }
  public function set imeClient(value:IIMEClient):void {
    _imeClient = value;
  }
  public override function clone():Event {
    return new IMEEvent(type, bubbles, cancelable, text, imeClient);
  }

  public override function toString():String {
    return formatToString('IMEEvent', 'type', 'bubbles', 'cancelable', 'eventPhase',
                          'text', 'imeClient');
  }
}
}
