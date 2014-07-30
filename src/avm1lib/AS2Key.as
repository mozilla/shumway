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
import flash.display.Stage;
import flash.events.KeyboardEvent;

public dynamic class AS2Key {
  public const DOWN:int = 40;
  public const LEFT:int = 37;
  public const RIGHT:int = 39;
  public const UP:int = 38;

  static var __keyStates:Array = [];
  static var __lastKeyCode:int = 0;

  public static function __bind(stage:Stage) {
    stage.addEventListener('keyDown', function (e:KeyboardEvent) {
      AS2Key.__lastKeyCode = e.keyCode;
      AS2Key.__keyStates[e.keyCode] = 1;
      Object(AS2Key).broadcastMessage('onKeyDown');
    }, false);
    stage.addEventListener('keyUp', function (e:KeyboardEvent) {
      AS2Key.__lastKeyCode = e.keyCode;
      delete AS2Key.__keyStates[e.keyCode];
      Object(AS2Key).broadcastMessage('onKeyUp');
    }, false);
  }

  public static function isDown(code) {
    return !!AS2Key.__keyStates[code];
  }

  {
    AS2Broadcaster.initialize(Object(AS2Key));
  }
}

}
