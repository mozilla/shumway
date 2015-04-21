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
  export class AVM1Stage extends AVM1Object {
    public static createAVM1Class(context: AVM1Context): AVM1Object {
      var wrapped = new AVM1Stage(context);
      wrapAVM1NativeMembers(context, wrapped, AVM1Stage.prototype,
        ['align#', 'displayState#', 'fullScreenSourceRect#', 'height#',
          'scaleMode#', 'showMenu#', 'width#'],
        false);
      return wrapped;
    }

    public static bindStage(context: AVM1Context, cls: AVM1Object, stage: Shumway.AVMX.AS.flash.display.Stage): void  {
      (<AVM1Stage>cls)._as3Stage = stage;
    }

    _as3Stage: Shumway.AVMX.AS.flash.display.Stage;

    public getAlign() { return this._as3Stage.align; }
    public setAlign(value) { this._as3Stage.align = value; }

    public getDisplayState() { return this._as3Stage.displayState; }
    public setDisplayState(value) { this._as3Stage.displayState = value; }

    public getFullScreenSourceRect() { return this._as3Stage.fullScreenSourceRect; }
    public setFullScreenSourceRect(value) { this._as3Stage.fullScreenSourceRect = value; }

    public getHeight() { return this._as3Stage.stageHeight; }

    public getScaleMode() { return this._as3Stage.scaleMode; }
    public setScaleMode(value) { this._as3Stage.scaleMode = value; }

    public getShowMenu() { return this._as3Stage.showDefaultContextMenu; }
    public setShowMenu(value) { this._as3Stage.showDefaultContextMenu = value; }

    public getWidth() { return this._as3Stage.stageWidth; }
  }
}
