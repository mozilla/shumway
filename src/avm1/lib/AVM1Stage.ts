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
  export class AVM1Stage {
    public static createAVM1Class(): typeof AVM1Stage {
      return wrapAVM1Class(AVM1Stage,
        ['align', 'displayState', 'fullScreenSourceRect', 'height', 'scaleMode',
          'showMenu', 'width'],
        []);
    }

    public static get align() { return AVM1Utils.currentStage.align; }
    public static set align(value) { AVM1Utils.currentStage.align = value; }

    public static get displayState() { return AVM1Utils.currentStage.displayState; }
    public static set displayState(value) { AVM1Utils.currentStage.displayState = value; }

    public static get fullScreenSourceRect() { return AVM1Utils.currentStage.fullScreenSourceRect; }
    public static set fullScreenSourceRect(value) { AVM1Utils.currentStage.fullScreenSourceRect = value; }

    public static get height() { return AVM1Utils.currentStage.stageHeight; }

    public static get scaleMode() { return AVM1Utils.currentStage.scaleMode; }
    public static set scaleMode(value) { AVM1Utils.currentStage.scaleMode = value; }

    public static get showMenu() { return AVM1Utils.currentStage.showDefaultContextMenu; }
    public static set showMenu(value) { AVM1Utils.currentStage.showDefaultContextMenu = value; }

    public static get width() { return AVM1Utils.currentStage.stageWidth; }
  }
}