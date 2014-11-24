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
  import flash = Shumway.AVM2.AS.flash;
  import assert = Shumway.Debug.assert;

  export class AVM1Mouse {
    public static createAVM1Class(): typeof AVM1Mouse {
      var wrapped = wrapAVM1Class(AVM1Mouse, ['show', 'hide'], []);
      AVM1Broadcaster.initialize(wrapped);
      return wrapped;
    }

    public static _bind(stage: flash.display.Stage, context: AVM1Context) {
      stage.addEventListener('mouseDown', function (e: flash.events.MouseEvent) {
        context.globals.Mouse.asCallPublicProperty('broadcastMessage', ['onMouseDown']);
      }, false);
      stage.addEventListener('mouseMove', function (e: flash.events.MouseEvent) {
        context.globals.Mouse.asCallPublicProperty('broadcastMessage', ['onMouseMove']);
      }, false);
      stage.addEventListener('mouseOut', function (e: flash.events.MouseEvent) {
        context.globals.Mouse.asCallPublicProperty('broadcastMessage', ['onMouseMove']);
      }, false);
      stage.addEventListener('mouseUp', function (e: flash.events.MouseEvent) {
        context.globals.Mouse.asCallPublicProperty('broadcastMessage', ['onMouseUp']);
      }, false);
    }

    public static hide() {
      // TODO hide();
    }

    public static show() {
      // TODO show();
    }
  }
}