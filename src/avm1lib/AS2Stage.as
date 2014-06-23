/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
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
  import avm1lib.AS2Broadcaster;
  import avm1lib.AS2Utils;
  import flash.display.Stage;

  public dynamic class AS2Stage {
    static function get $stage() : flash.display.Stage { return AS2Utils.currentStage;  }

    public static function get align() { return $stage.align; }
    public static function set align(value) { $stage.align = value; }

    public static function get displayState() { return $stage.displayState; }
    public static function set displayState(value) { $stage.displayState = value; }

    public static function get fullScreenSourceRect() { return $stage.fullScreenSourceRect; }
    public static function set fullScreenSourceRect(value) { $stage.fullScreenSourceRect = value; }

    public static function get height() { return $stage.stageHeight; }

    public static function get scaleMode() { return $stage.scaleMode; }
    public static function set scaleMode(value) { $stage.scaleMode = value; }

    public static function get showMenu() { return $stage.showDefaultContextMenu; }
    public static function set showMenu(value) { $stage.showDefaultContextMenu = value; }

    public static function get width() { return $stage.stageWidth; }

    {
      AS2Broadcaster.initialize(Object(AS2Stage));
    }
  }
}
