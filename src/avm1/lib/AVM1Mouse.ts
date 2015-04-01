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

  export class AVM1Mouse extends ASObject {
    public static createAVM1Class(securityDomain: ISecurityDomain): typeof AVM1Mouse {
      return wrapAVM1Class(securityDomain, AVM1Mouse, ['show', 'hide'], []);
    }

    public static _bind(stage: flash.display.Stage, context: AVM1Context) {
      // REDUX
      stage.addEventListener('mouseDown', function (e: flash.events.MouseEvent) {
        (<any>context.globals.Mouse).axCallPublicProperty('broadcastMessage', ['onMouseDown']);
      }, false);
      stage.addEventListener('mouseMove', function (e: flash.events.MouseEvent) {
        (<any>context.globals.Mouse).axCallPublicProperty('broadcastMessage', ['onMouseMove']);
      }, false);
      stage.addEventListener('mouseOut', function (e: flash.events.MouseEvent) {
        (<any>context.globals.Mouse).axCallPublicProperty('broadcastMessage', ['onMouseMove']);
      }, false);
      stage.addEventListener('mouseUp', function (e: flash.events.MouseEvent) {
        (<any>context.globals.Mouse).axCallPublicProperty('broadcastMessage', ['onMouseUp']);
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