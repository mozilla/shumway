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
public class UncaughtErrorEvent extends ErrorEvent {
  public static const UNCAUGHT_ERROR:String = "uncaughtError";
  private var _error;
  public function UncaughtErrorEvent(type:String = "uncaughtError", bubbles:Boolean = true,
                                     cancelable:Boolean = true, error_in = null)
  {
    super(type, bubbles, cancelable);
    _error = error_in;
  }
  public function get error() {
    return _error;
  }
  public override function clone():Event {
    return new UncaughtErrorEvent(type, bubbles, cancelable, error);
  }
  public override function toString():String {
    return formatToString('UncaughtErrorEvent', 'type', 'bubbles', 'cancelable', 'eventPhase',
                          'error');
  }
}
}
