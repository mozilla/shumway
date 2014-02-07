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
public class FullScreenEvent extends ActivityEvent {
  public static const FULL_SCREEN:String = "fullScreen";
  public static const FULL_SCREEN_INTERACTIVE_ACCEPTED:String = "fullScreenInteractiveAccepted";
  private var _fullScreen:Boolean;
  private var _interactive:Boolean;
  public function FullScreenEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, 
                                  fullScreen:Boolean = false, interactive:Boolean = false) 
  {
    super(type, bubbles, cancelable);
    _fullScreen = fullScreen;
    _interactive = interactive;
  }
  public function get fullScreen():Boolean {
    return _fullScreen;
  }
  public function get interactive():Boolean {
    return _interactive;
  }
  public override function clone():Event {
    return new FullScreenEvent(type, bubbles, cancelable, fullScreen, interactive);
  }
  public override function toString():String {
    return formatToString('FullScreenEvent', 'type', 'bubbles', 'cancelable', 'eventPhase',
                          'fullScreen', 'interactive');
  }
}
}
