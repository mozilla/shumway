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
  import avm1lib.AVM1Broadcaster;
  import avm1lib.AVM1Utils;
  import flash.display.Stage;

  public dynamic class AVM1Stage {
    public static function get align() { return AVM1Utils.currentStage.align; }
    public static function set align(value) { AVM1Utils.currentStage.align = value; }

    public static function get displayState() { return AVM1Utils.currentStage.displayState; }
    public static function set displayState(value) { AVM1Utils.currentStage.displayState = value; }

    public static function get fullScreenSourceRect() { return AVM1Utils.currentStage.fullScreenSourceRect; }
    public static function set fullScreenSourceRect(value) { AVM1Utils.currentStage.fullScreenSourceRect = value; }

    public static function get height() { return AVM1Utils.currentStage.stageHeight; }

    public static function get scaleMode() { return AVM1Utils.currentStage.scaleMode; }
    public static function set scaleMode(value) { AVM1Utils.currentStage.scaleMode = value; }

    public static function get showMenu() { return AVM1Utils.currentStage.showDefaultContextMenu; }
    public static function set showMenu(value) { AVM1Utils.currentStage.showDefaultContextMenu = value; }

    public static function get width() { return AVM1Utils.currentStage.stageWidth; }

    {
      AVM1Broadcaster.initialize(Object(AVM1Stage));
    }
  }
}
