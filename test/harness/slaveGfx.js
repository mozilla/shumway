/*
 * Copyright 2015 Mozilla Foundation
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

var release = true;

var easel;
function createEasel() {
  //Shumway.GFX.hud.value = true;
  easel = new Shumway.GFX.Easel(document.getElementById("easelContainer"), true);
  easel.startRendering();
  return easel;
}

var easelHost;
function createEaselHost(playerWindow) {
  var peer = new Shumway.Remoting.WindowTransportPeer(window, playerWindow);
  easelHost = new Shumway.GFX.Window.WindowEaselHost(easel, peer);
  return easelHost;
}


function getCanvas() {
  return document.getElementsByTagName('canvas')[0];
}

function getCanvasData() {
  // flush rendering buffers
  easel.render();
  return easel.screenShot(null, true, false).dataURL;
}

function sendMouseEvent(type, x, y) {
  var isMouseMove = type == 'mousemove';
  var e = document.createEvent('MouseEvents');
  var canvas = getCanvas();
  e.initMouseEvent(type, true, !isMouseMove,
    document.defaultView, isMouseMove ? 0 : 1,
    x, y, x, y,
    false, false, false, false, 0, canvas);
  canvas.dispatchEvent(e);
}
