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
  import flash.display.Stage;

  public dynamic class AS2Mouse {
    static var $lastX = 0;
    static var $lastY = 0;
    public static function $bind(stage: flash.display.Stage) {
      function updateMouseState(e) {
        var state = Object(stage).$canvasState;
        if (!state) {
          return;
        }
        var mouseX = e.clientX, mouseY = e.clientY;
        for (var p = state.canvas; p; p = p.offsetParent) {
          mouseX -= p.offsetLeft;
          mouseY -= p.offsetTop;
        }
        AS2Mouse.$lastX = (mouseX - state.offsetX) / state.scale;
        AS2Mouse.$lastY = (mouseY - state.offsetY) / state.scale;
      }

      stage.addEventListener('mousedown', function(e) {
        updateMouseState(e);
        Object(AS2Mouse).broadcastMessage('onMouseDown');
      }, false);
      stage.addEventListener('mousemove', function(e) {
        updateMouseState(e);
        Object(AS2Mouse).broadcastMessage('onMouseMove');
      }, false);
      stage.addEventListener('mouseout', function(e) {
        updateMouseState(e);
        Object(AS2Mouse).broadcastMessage('onMouseMove');
      }, false);
      stage.addEventListener('mouseup', function(e) {
        updateMouseState(e);
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
