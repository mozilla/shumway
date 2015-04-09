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
        ['align', 'displayState', 'fullScreenSourceRect', 'height', 'scaleMode',
          'showMenu', 'width'],
        false);
      return wrapped;
    }

    private get _as3Stage(): Shumway.AVMX.AS.flash.display.Stage {
      return (<IAVM1SymbolBase>this.context.root).as3Object.stage; // REDUX
    }

    public get align() { return this._as3Stage.align; }
    public set align(value) { this._as3Stage.align = value; }

    public get displayState() { return this._as3Stage.displayState; }
    public set displayState(value) { this._as3Stage.displayState = value; }

    public get fullScreenSourceRect() { return this._as3Stage.fullScreenSourceRect; }
    public set fullScreenSourceRect(value) { this._as3Stage.fullScreenSourceRect = value; }

    public get height() { return this._as3Stage.stageHeight; }

    public get scaleMode() { return this._as3Stage.scaleMode; }
    public set scaleMode(value) { this._as3Stage.scaleMode = value; }

    public get showMenu() { return this._as3Stage.showDefaultContextMenu; }
    public set showMenu(value) { this._as3Stage.showDefaultContextMenu = value; }

    public get width() { return this._as3Stage.stageWidth; }
  }
}