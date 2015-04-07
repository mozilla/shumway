/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

///<reference path='../references.ts' />

module Shumway.AVM1.Lib {
  import flash = Shumway.AVMX.AS.flash;
  import assert = Shumway.Debug.assert;
  import ASObject = Shumway.AVMX.AS.ASObject;

  export class AVM1Key extends AVM1Object {
    public static DOWN: number = 40;
    public static LEFT: number = 37;
    public static RIGHT: number = 39;
    public static UP: number = 38;

    private static _keyStates: any[] = []; // REDUX mutates
    private static _lastKeyCode: number = 0;

    public static createAVM1Class(context: AVM1Context): AVM1Object {
      var wrapped = wrapAVM1NativeClass(context, false, AVM1Key,
        ['DOWN', 'LEFT', 'RIGHT', 'UP', 'isDown'],
        []);
      (<any>wrapped)._bind = AVM1Key._bind; // REDUX
      return wrapped;
    }

    public static _bind(stage: flash.display.Stage, context: AVM1Context) {
      stage.addEventListener('keyDown', function (e: flash.events.KeyboardEvent) {
        var keyCode = e.axGetPublicProperty('keyCode');
        AVM1Key._lastKeyCode = keyCode;
        AVM1Key._keyStates[keyCode] = 1;
        alCallProperty(context.globals.Key, 'broadcastMessage', ['onKeyDown']);
      }, false);

      stage.addEventListener('keyUp', function (e: flash.events.KeyboardEvent) {
        var keyCode = e.axGetPublicProperty('keyCode');
        AVM1Key._lastKeyCode = keyCode;
        delete AVM1Key._keyStates[keyCode];
        alCallProperty(context.globals.Key, 'broadcastMessage', ['onKeyUp']);
      }, false);
    }

    public static isDown(context: AVM1Context, code) {
      return !!AVM1Key._keyStates[code];
    }

  }
}