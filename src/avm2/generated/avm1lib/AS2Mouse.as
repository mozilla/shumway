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
import flash.display.Stage;
import flash.events.MouseEvent;

public dynamic class AS2Mouse {
  public static function $bind(stage:Stage) {
    stage.addEventListener('mousedown', function (e:flash.events.MouseEvent) {
      Object(AS2Mouse).broadcastMessage('onMouseDown');
    }, false);
    stage.addEventListener('mousemove', function (e) {
      Object(AS2Mouse).broadcastMessage('onMouseMove');
    }, false);
    stage.addEventListener('mouseout', function (e) {
      Object(AS2Mouse).broadcastMessage('onMouseMove');
    }, false);
    stage.addEventListener('mouseup', function (e) {
      Object(AS2Mouse).broadcastMessage('onMouseUp');
    }, false);
  }
  public static function hide() {
    // TODO hide();
  }
  public static function show() {
    // TODO show();
  }

  {
    AS2Broadcaster.initialize(Object(AS2Mouse));
  }
}
}
